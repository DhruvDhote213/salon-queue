# Flows & Rules

## Flow: remote customer
1. Opens Home -> Join Queue -> picks Haircut + "Any barber" -> gets a token and position.
2. Watches My Status from home. At 2nd in line the "Start coming" banner appears.
3. Receptionist presses Call next on a barber's card -> the customer becomes Called.
4. Customer's phone shows "It's your turn! -> <barber>" within a few seconds, and the TV flashes the token.
5. Barber presses Start, then Done -> the customer leaves the queue.

## Flow: walk-in
Receptionist presses + Add walk-in, enters name, phone and services. The customer joins the same queue at the end (first come, first served). Walk-ins are allowed even when online joining is closed.

## Statuses and allowed moves
- Waiting -> Called -> In chair -> Done (never backwards)
- Waiting -> Cancelled
- Called -> No-show

## Rules (enforced on the server in `backend/server.js`)
- First come, first served: customers are ordered by when they joined.
- Call next for barber X picks the earliest waiting customer who chose X or "Any".
- A customer who chose Ravi is never given to another barber.
- A barber can be given a new customer only if they are free: not on break, not off duty, and nobody Called or In chair with them.
- Waiting time is about the total minutes of services ahead divided by the number of barbers working.
- Only one active spot per phone number. This is also enforced by a unique index in the database.
- A customer marked No-show who comes later joins again at the END of the queue with a new token.
- A customer can cancel only while Waiting.
- Online joining can be closed by the owner. Joining is then disabled with a message, but walk-ins still work.
- A barber on break: customers who chose that barber see "<barber> is on break".

## Not implemented in this version
- Automatic 10-minute no-show timer (the receptionist marks No-show manually).
- Online joining closing automatically 30 minutes before closing time.
- Staff PIN / login for reception and barber screens.

## Test checklist
Tick each item after testing it on the live link.

- [ ] Join with 2 services -> correct total time and price shown
- [ ] Same phone joins twice -> shown the existing spot, no duplicate
- [ ] Call next for Amit skips a customer who chose Ravi
- [ ] Call next -> customer's phone shows "It's your turn" within about 5 seconds
- [ ] Start/Done on Barber View updates Reception and TV
- [ ] No-show, then join again -> goes to the end of the queue with a new token
- [ ] Close online queue -> Join button disabled with a message
- [ ] Language toggle switches labels to Gujarati
- [ ] Waiting time goes down as customers finish
- [ ] Phone, tablet and TV windows stay in sync (3-second refresh)
