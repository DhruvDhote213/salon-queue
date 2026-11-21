require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) { console.error("DATABASE_URL is not set"); process.exit(1); }
const local = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL);
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: local ? false : { rejectUnauthorized: false } });
const q = (sql, p) => pool.query(sql, p).then((r) => r.rows);
const now = () => Date.now(), M = 60000;
const fail = (m) => ({ error: m });
const ACTIVE = "('w','called','chair')";

async function tx(fn) {
  const c = await pool.connect();
  try { await c.query("begin"); const r = await fn(c); await c.query("commit"); return r; }
  catch (e) { await c.query("rollback"); throw e; }
  finally { c.release(); }
}

async function init() {
  await pool.query(fs.readFileSync(__dirname + "/schema.sql", "utf8"));
  await q("insert into settings(id) values (1) on conflict do nothing");
  if (!(await q("select 1 from barbers limit 1")).length) {
    for (const n of ["Ravi", "Amit", "Imran"]) await q("insert into barbers(name) values ($1)", [n]);
    await q(`insert into services(name_en,name_gu,minutes,price) values
      ('Haircut','હેરકટ',30,150),('Beard trim','દાઢી ટ્રીમ',15,80),('Hair spa','હેર સ્પા',45,400)`);
  }
}

const mapC = (r) => ({ id: Number(r.id), tok: r.token, name: r.name, phone: r.phone, svc: r.service_ids, b: r.preferred_barber,
  st: r.status, t: Number(r.created_at), at: r.barber || undefined, sa: r.started_at ? Number(r.started_at) : undefined });

async function state() {
  const [s, b, sv, c] = await Promise.all([
    q("select * from settings"), q("select name,status from barbers order by ord"), q("select * from services order by id"),
    q(`select * from customers where status in ${ACTIVE} or created_at > $1 order by id`, [now() - 6 * 3600e3]),
  ]);
  return { open: s[0].online_open, stat: { served: s[0].served, ns: s[0].no_shows, wsum: s[0].wait_sum },
    barbers: b.map((x) => ({ n: x.name, s: x.status })),
    services: sv.map((x) => ({ id: x.id, en: x.name_en, gu: x.name_gu, m: x.minutes, p: x.price, on: x.active ? 1 : 0 })),
    q: c.map(mapC) };
}

// ---- Queue rules live here, in ONE place ----
const actions = {
  async join({ name, phone, svc, b, walk }) {
    const st = (await q("select online_open from settings"))[0];
    if (!st.online_open && !walk) return fail("Online joining is closed");
    if (!name || !/^\d{10}$/.test(phone || "")) return fail("Name and 10-digit phone required");
    if (!Array.isArray(svc) || svc.length < 1 || svc.length > 3 || !svc.every(Number.isInteger) || new Set(svc).size !== svc.length)
      return fail("Pick 1-3 services");
    const ok = (await q("select count(*)::int n from services where id = any($1) and active", [svc]))[0].n;
    if (ok !== svc.length) return fail("Service not available");
    const existing = async () => (await q(`select * from customers where phone=$1 and status in ${ACTIVE}`, [phone]))[0];
    let e = await existing();
    if (e) return { c: mapC(e) };                                   // one active spot per phone
    let pref = "Any";
    if (b && b !== "Any" && (await q("select 1 from barbers where name=$1", [b])).length) pref = b;
    try {
      const r = await q(`insert into customers(token,name,phone,service_ids,preferred_barber,created_at)
        values (nextval('token_seq'),$1,$2,$3,$4,$5) returning *`, [String(name).slice(0, 40), phone, svc, pref, now()]);
      return { c: mapC(r[0]) };                                     // first come, first served (by id)
    } catch (err) {
      if (err.code === "23505" && (e = await existing())) return { c: mapC(e) };
      throw err;
    }
  },
  call: ({ n }) => tx(async (c) => {
    const br = (await c.query("select status from barbers where name=$1 for update", [n])).rows[0];
    if (!br || br.status !== "free") return fail("Barber not available");
    if ((await c.query(`select 1 from customers where barber=$1 and status in ('called','chair')`, [n])).rows.length) return fail("Barber is busy");
    const nx = (await c.query(`select id from customers where status='w' and (preferred_barber='Any' or preferred_barber=$1)
      order by id limit 1 for update skip locked`, [n])).rows[0];            // earliest who chose n or Any
    if (nx) await c.query("update customers set status='called', barber=$1 where id=$2", [n, nx.id]);
  }),
  async noshow({ id }) {
    const r = await q("update customers set status='ns' where id=$1 and status='called' returning id", [id]);
    if (!r.length) return fail("Only called customers can be no-show");
    await q("update settings set no_shows = no_shows + 1");
  },
  async cancel({ id }) {
    const r = await q("update customers set status='x' where id=$1 and status='w' returning id", [id]);
    if (!r.length) return fail("Only waiting customers can cancel");
  },
  async start({ n }) {
    const r = await q("update customers set status='chair', started_at=$2 where barber=$1 and status='called' returning created_at", [n, now()]);
    if (!r.length) return fail("Nobody called for this barber");
    await q("update settings set wait_sum = wait_sum + $1", [Math.round((now() - Number(r[0].created_at)) / M)]);
  },
  async done({ n }) {
    const r = await q("update customers set status='done' where barber=$1 and status='chair' returning id", [n]);
    if (!r.length) return fail("Nobody in the chair");
    await q("update settings set served = served + 1");
  },
  async brk({ n, s }) {
    if (!["free", "break", "off"].includes(s)) return fail("Bad status");
    await q("update barbers set status=$2 where name=$1", [n, s]);
  },
  async svc({ id, on }) { await q("update services set active=$2 where id=$1", [id, !!on]); },
  async open({ v }) { await q("update settings set online_open=$1", [!!v]); },
  reset: () => tx(async (c) => {
    await c.query("truncate customers restart identity");
    await c.query("alter sequence token_seq restart");
    await c.query("update settings set online_open=true, served=0, no_shows=0, wait_sum=0");
    await c.query("update barbers set status='free'");
    await c.query("update services set active=true");
  }),
};

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (_, res) => res.send("Salon Queue API is running"));
app.get("/api/state", async (_, res) => {
  try { res.json(await state()); } catch (e) { console.error(e); res.status(500).json({ error: "Database error" }); }
});
app.post("/api/action", async (req, res) => {
  const { op, ...args } = req.body || {};
  if (!Object.hasOwn(actions, op)) return res.status(400).json({ error: "Unknown action" });
  try {
    const out = (await actions[op](args)) || {};
    const s = await state();
    if (out.error) return res.status(400).json({ error: out.error, state: s });
    res.json({ ...out, state: s });
  } catch (e) { console.error(e); res.status(500).json({ error: "Server error" }); }
});

const PORT = process.env.PORT || 3000;
init().then(() => app.listen(PORT, () => console.log("Salon Queue API on " + PORT)))
  .catch((e) => { console.error("DB init failed:", e.message); process.exit(1); });
