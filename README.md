# UmrahPak — Umrah Package Finder & Scam Checker (UX Concept)

**Live demo:** https://abbasmomand98-jpg.github.io/umrahpak-umrah-package-finder/
**Code:** https://github.com/abbasmomand98-jpg/umrahpak-umrah-package-finder

UmrahPak is an Umrah package finder and scam checker for Pakistan. November–February is peak Umrah season, and a family pays Rs 200,000–400,000 per person — yet packages are sold through WhatsApp groups and travel agents with hidden costs: a "5-star near Haram" hotel turns out 2 km away, visa fees appear after the advance, shared rooms are sold as private, flights carry 12-hour layovers, and fake agents take advance cash and vanish. There is no way to compare packages side by side or verify an agent.

UmrahPak compares packages side by side with verified badges, calculates what a family really pays, reveals the hidden costs a cheap quote leaves out, checks an agent's licence before you pay, counts down to departure, and keeps a safety checklist to tick off before paying anyone anything.

## How it works

Open `index.html` in a browser — no build step, no framework, just HTML, CSS and JavaScript. The demo is split into three files so each part is easy to read and change:

- `data.js` — all the sample data: the three 14-day packages, the two agent licences, the departure date, the eight scam red flags, and the safety checklist.
- `logic.js` — all the rules, with no DOM code at all: the cheapest-verified-package rule, the search/city/verified-only filters, the family cost calculator, the hidden-cost breakdown, the licence lookup, the countdown, and the checklist toggle. Because it touches no DOM, it can be tested in Node with `node test.js`.
- `app.js` — the page wiring only: it reads the data, calls the logic, and renders the results into the page. Demo "today" is pinned to 9 Nov 2026 so the sample figures stay stable.

Try it with the sample figures:

1. **Package compare** — search, filter by city, or switch on "Verified agents only". Noor Travels in Lahore quotes Rs 285,000 (5-star hotel 350m from Haram, direct flight, visa included, private transport) and wins best value. Rehman Tours in Karachi quotes Rs 340,000 (5-star hotel 150m from Haram, verified). Sasta Umrah Deals quotes Rs 195,000 ("5-star" hotel 2.1 km from Haram, 14-hour layover via Doha, visa NOT included, shared room) — cheapest, but flagged HIGH RISK.
2. **Family cost calculator** — pick a package and the number of travellers. Four travellers on Noor Travels pay Rs 11,40,000 — 4 × Rs 285,000, everything included. Switch to Sasta and the hidden-cost trap appears: Rs 195,000 quoted + Rs 45,000 visa + Rs 25,000 transport + Rs 30,000 meals = a real cost of Rs 295,000 — Rs 10,000 MORE than Noor.
3. **Licence checker** — type `UMT-2026-4812` and it comes back VERIFIED — Noor Travels, licensed, 12 years in business, 4,800 pilgrims served. Type `UMT-2026-077` and it warns FRAUD — the licence is not in the register. Any other licence comes back "not found", never "verified".
4. **Departure countdown** — the sample departure is 15 Dec 2026, 36 days after the pinned demo date of 9 Nov 2026, with the visa, hotel and transport status alongside.
5. **Safety checklist** — tick off the six checks (licence verified, visa in writing, hotel distance in writing, written contract, no cash advance, departure documents) before paying an agent. Your ticks are saved in the browser with localStorage.

Run the tests with `node test.js` — they assert every canonical figure above, plus that all element IDs referenced by `app.js` exist in `index.html` and that the HTML tags balance. `node dom-smoke.js` renders the whole page in a fake DOM and asserts the canonical figures appear on load.

## What you can learn from this project

- **Separating data, logic, and rendering.** `data.js` holds facts, `logic.js` holds rules, `app.js` holds rendering. When the facts change (a new agent, a new price), only `data.js` changes. When a rule changes (how the real cost is calculated), only `logic.js` changes. This is the single most useful habit in front-end work.
- **Pure functions are testable functions.** Every rule in `logic.js` takes inputs and returns outputs — no DOM, no dates from the clock, no hidden state. That is why `node test.js` can check the hidden-cost maths (195,000 + 45,000 + 25,000 + 30,000 = 295,000) without opening a browser.
- **"Cheapest verified" beats "cheapest".** The package comparer does not pick the lowest price — it picks the lowest price *among verified agents*. Building a rule like that into code is how a design opinion ("verified matters more than cheap") becomes a working product.
- **Show the real cost, not the quoted cost.** The hidden-cost breakdown adds the extras that arrive after the advance to the quoted price, so the "cheap" deal is exposed as Rs 10,000 more expensive than the verified one. A calculator that only multiplies the quoted price would hide the scam.
- **Never trust user input — normalise it.** The licence checker upper-cases the input and trims spaces, so `umt-2026-4812` still matches. And an unknown licence returns "not found", never a guess.
- **Pakistani number formatting.** `formatPKR` groups digits the way Pakistan writes lakhs — 285,000 becomes "2,85,000". Small detail, big difference in whether a number reads as real to a Pakistani user.
- **localStorage for a checklist.** The departure checklist survives a page refresh because `app.js` saves the ticked items under one key (`umrahpak-checklist-done`) and loads them back on start.

## Sample-data honesty note

Every package, licence number, agent, figure and city in this demo is invented sample data for an unofficial UX concept. No real agent, licence number, or person appears anywhere. UmrahPak is not a travel agency — always confirm prices, visa terms, hotel distances and licence status with the agent and the relevant authorities before paying anyone anything.

## Fork it and make it yours

This project is a pattern, not just a demo: a **compare → calculate → verify** tool for any purchase where sellers hide the truth. Fork the repo and adapt it to a problem people face where you live — compare Hajj packages and hotel distances, verify medicine batch numbers, check school fee structures, or compare water tanker rates in your city. Keep the data in `data.js`, the rules in `logic.js`, and the honesty note — and the same pattern will work for your problem too.

---

UmrahPak is an unofficial UX concept by Muhammad Abbas Khan.
Available for new projects: abbasmomand98@gmail.com
