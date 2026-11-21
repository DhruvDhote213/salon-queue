# Screens & Features

Screens are routes inside one page, using the URL hash (for example `...#join`). A navigation bar at the top switches between them, and an EN / ગુ button switches the language.

## Screen 1: Home (`#home`)
- Salon name, "Open · 9 PM" badge (or "Queue closed")
- Live card: "N waiting · ~X min" and a chip per barber with status (free / busy / on break / off)
- Big gold [ Join Queue ] button, disabled with a message when online joining is closed

## Screen 2: Join Queue (`#join`)
- Name and phone (exactly 10 digits, validated)
- Service cards (multi-select, maximum 3): name, minutes, price
- Barber picker: "Any barber (fastest)" or a specific barber
- Live summary: "Total 45 min · ₹230 · ~35 min wait", updated as services are selected
- [ Confirm ] creates the spot and opens My Status
- Same phone twice returns the existing spot instead of a duplicate

## Screen 3: My Status (`#status-<id>`)
- Large token (for example S-14), position ("4th in line"), estimated wait
- Banner "Start coming to the salon" when 2nd in line or closer
- If the chosen barber is on break: "<barber> is on break"
- When called: full-screen gold "It's your turn!" with the barber's name
- [ Cancel ] with a confirmation pop-up (only while waiting)
- Updates by itself every 3 seconds

## Screen 4: Reception (`#reception`), tablet
- Barber cards: current customer, status, [ Call next ], and [ No-show ] while a customer is called
- Waiting list in order: token, name, services, preferred barber, minutes waited, [ Cancel ]
- Rows waiting more than 60 minutes are highlighted in amber
- [ + Add walk-in ] opens a form: name, phone, services, barber
- Empty state: "No one waiting — walk right in!"

## Screen 5: Barber View (`#barber-<name>`), phone
- Current customer: name and services, timer since start
- [ Start ] then [ Done ]
- "Next for you" shows the next customer this barber could be given
- Toggle: On break / Available
- Links to switch between barbers

## Screen 6: Waiting Area TV (`#display`)
- One row per barber: name and "Now: S-12" (or break / empty)
- Newly called token flashes gold
- "Up next" list of 5 tokens with estimated wait
- Large text for reading from a distance

## Screen 7: Owner Settings (`#admin`)
- Online joining switch: Open / Closed
- Services list with ON / OFF toggles
- Barbers on duty toggle
- Today's stats: customers served, average wait, no-shows
- [ Reset demo ] clears all customers and resets tokens and stats

## Empty and error states
- Empty queue message on Reception and TV
- Validation message on Join (name, 10-digit phone, 1–3 services)
- Popup message if the server can't be reached or rejects an action
