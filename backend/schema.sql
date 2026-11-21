create table if not exists settings(
  id int primary key default 1 check (id = 1),
  online_open boolean not null default true,
  served int not null default 0,
  no_shows int not null default 0,
  wait_sum int not null default 0
);
create table if not exists barbers(
  ord serial,
  name text primary key,
  status text not null default 'free' check (status in ('free','break','off'))
);
create table if not exists services(
  id serial primary key,
  name_en text not null,
  name_gu text not null,
  minutes int not null check (minutes > 0),
  price int not null check (price >= 0),
  active boolean not null default true
);
create sequence if not exists token_seq;
create table if not exists customers(
  id bigserial primary key,
  token int not null,
  name text not null,
  phone char(10) not null check (phone ~ '^[0-9]{10}$'),
  service_ids int[] not null,
  preferred_barber text not null default 'Any',
  status text not null default 'w' check (status in ('w','called','chair','done','x','ns')),
  created_at bigint not null,
  barber text references barbers(name),
  started_at bigint
);
create index if not exists idx_customers_status on customers(status, id);
-- one active spot per phone number, enforced by the database itself
create unique index if not exists one_active_per_phone on customers(phone) where status in ('w','called','chair');
