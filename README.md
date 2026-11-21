# Salon Queue Management System

**Live demo:** https://salon-queue-frontend.vercel.app/#home
**Hosted on:** Vercel (frontend) + Render (backend) + Supabase (PostgreSQL)

## About
Queue app for a salon: customers join from their phone, see position and estimated wait, and get called; reception and barbers manage the queue; a TV screen shows who is with which barber. English and Gujarati labels.

## Structure
- `frontend/index.html` – all 7 screens (Vercel)
- `backend/server.js` – Express API enforcing the queue rules (Render)
- `backend/schema.sql` – PostgreSQL schema (Supabase): settings, barbers, services, customers

Screens (hash routes): `#home`, `#join`, `#status-<id>`, `#reception`, `#barber-ravi`, `#display`, `#admin`.

## Queue rules (enforced on the server)
- Waiting -> Called -> In chair -> Done; Waiting -> Cancelled; Called -> No-show.
- Call next for a barber picks the earliest customer who chose that barber or "Any".
- Waiting time ~ minutes of services ahead / barbers working.
- One active spot per phone number. Online joining can be closed; walk-ins still work.

## Run locally
```
cd backend
cp .env.example .env        # put your Supabase DATABASE_URL in .env
npm install && npm start    # http://localhost:3000
```
Then open `frontend/index.html` in a browser. Screens poll the API every 3 seconds, so phone, tablet and TV stay in sync.
