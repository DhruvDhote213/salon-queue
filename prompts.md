# prompts.md

Prompts used while building the Salon Queue app, in order, including the ones that didn't work first time

## Setup and first build

1. Build a salon queue app. Customers join from their phone and pick 1–3 services and a barber (or "Any"). They see their position and estimated wait, and get a clear "It's your turn" screen when called. Add a reception dashboard, a barber screen, a waiting-area TV display and an owner settings page. Dark charcoal and gold theme, mobile-first, English and Gujarati labels.
2. Give me the full code as files I can put in a GitHub repo and deploy on Vercel.

## Backend and database

3. The screens need to stay in sync across phone, tablet and TV, so add a backend. Keep all queue rules on the server and have the screens refresh every few seconds.
4. Use a real SQL database instead of an in-memory store. Create the tables for settings, barbers, services and customers, and make sure one phone number can only have one active spot.

## Running it locally

5. How do I run the frontend on localhost in VS Code, and what has to be running next to it?
6. The page opens fine but every button says "Server unreachable", even though `localhost:3000/api/state` shows JSON. Expected: the join form saves and I land on the status page. Check where the page decides which backend address to use and explain the cause before fixing it.
7. npm install is blocked in PowerShell ("running scripts is disabled"). What's the safest way around it?
8. How do I get the tables into the database? I don't know how to open the SQL file.

## Deployment

9. Walk me through deploying this step by step: database on Supabase, backend on Render, frontend on Vercel. Include which connection string to use.
10. The Render deploy failed with `DATABASE\_URL is not set`. I added the variable but it still fails.
11. Now it fails with `DB init failed: connect ENETUNREACH`. Explain why, and show me how to switch to a connection string that works from Render.
12. Vercel is asking me to install the GitHub application. What do I do next to deploy the `frontend` folder?

