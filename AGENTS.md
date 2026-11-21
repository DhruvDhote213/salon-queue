# AGENTS.md — Salon Queue Management

Queue app for a salon: customers join from their phone, see position and wait time, and get called; reception and barbers manage the queue; a TV screen shows the current status.

## Read first
- docs/01-brief.md -> features and what NOT to build
- docs/02-screens.md -> every screen's layout and behaviour
- docs/03-flows-rules.md -> flows, queue rules, test checklist

## Stack
- Frontend: one file, `frontend/index.html` (plain HTML, CSS and JavaScript, no build step). Hosted on Vercel.
- Backend: Node.js + Express in `backend/server.js`. Hosted on Render.
- Database: PostgreSQL on Supabase. Schema in `backend/schema.sql`, created automatically when the server starts.
- Sync: every screen polls `GET /api/state` every 3 seconds. All changes go through `POST /api/action`.
- Run backend locally: `cd backend && npm install && npm start` (needs `DATABASE_URL` in `backend/.env`).
- Run frontend locally: open `frontend/index.html` with VS Code Live Server.

## How to work
- One screen or one feature per task. Don't touch other screens.
- Theme: charcoal (#1F2937) + gold (#D4A017), rounded cards, mobile-first.
- Queue rules live in ONE place: the `actions` object in `backend/server.js`. The frontend never changes queue state itself.
- Never add features from the "Don't build" list in docs/01-brief.md.
- Never commit `.env` or any database password.
- After each task: list changed files and how to test the change.
