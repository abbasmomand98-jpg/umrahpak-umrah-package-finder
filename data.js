// UmrahPak — Umrah Package Finder & Scam Checker (UX Concept).
// IMPORTANT: every package, licence number, agent, figure and city
// below is SAMPLE data invented for this UX concept demo. No real
// agent, licence number, or person appears anywhere. UmrahPak is an
// unofficial concept, not a travel agency: always confirm prices,
// visa terms, hotel distances and licence status with the agent and
// the relevant authorities before paying anyone anything.

// Canonical 14-day packages (per person) — the same figures appear in
// the mockups, the case study slides and the copy pack.
var PACKAGES = [
  {
    id: "noor",
    agent: "Noor Travels",
    city: "Lahore",
    price: 285000,
    days: 14,
    hotel: "5-star hotel",
    hotelDistance: "350m from Haram",
    flight: "Direct flight Lahore–Jeddah",
    visaIncluded: true,
    transport: "Private transport",
    room: "Private room",
    verified: true,
    bestValue: true,
    extraVisa: 0,
    extraTransport: 0,
    extraMeals: 0,
    redFlags: []
  },
  {
    id: "rehman",
    agent: "Rehman Tours",
    city: "Karachi",
    price: 340000,
    days: 14,
    hotel: "5-star hotel",
    hotelDistance: "150m from Haram",
    flight: "Direct flight Karachi–Jeddah",
    visaIncluded: true,
    transport: "Private transport",
    room: "Private room",
    verified: true,
    bestValue: false,
    extraVisa: 0,
    extraTransport: 0,
    extraMeals: 0,
    redFlags: []
  },
  {
    id: "sasta",
    agent: "Sasta Umrah Deals",
    city: "WhatsApp agent",
    price: 195000,
    days: 14,
    hotel: "\u201c5-star\u201d hotel",
    hotelDistance: "2.1 km from Haram",
    flight: "14-hour layover via Doha",
    visaIncluded: false,
    transport: "Shared transport",
    room: "Shared room",
    verified: false,
    bestValue: false,
    // The hidden-cost trap: these three extras arrive AFTER the advance.
    extraVisa: 45000,
    extraTransport: 25000,
    extraMeals: 30000,
    redFlags: ["no-licence", "cash-advance", "visa-added-later", "hotel-far"]
  }
];

// The canonical family example. Demo "today" is pinned to 9 Nov 2026:
// 4 travellers x Noor Rs 285,000 = Rs 11,40,000 total.
var FAMILY_EXAMPLE = {
  travellers: 4,
  packageId: "noor",
  perPerson: 285000,
  total: 1140000
};

// The hidden-cost reveal for the Sasta deal. Quoted Rs 195,000, but:
// 195,000 + 45,000 (visa) + 25,000 (transport) + 30,000 (meals) =
// Rs 295,000 real cost — Rs 10,000 MORE than Noor's Rs 285,000.
var HIDDEN_COST_EXAMPLE = {
  packageId: "sasta",
  quoted: 195000,
  visa: 45000,
  transport: 25000,
  meals: 30000,
  realCost: 295000,
  verifiedPrice: 285000,
  difference: 10000
};

// Agent licence lookup — the same two licences appear in the mockups,
// slides and copy. Unknown licences are "not found", never "verified".
var LICENCES = [
  {
    id: "UMT-2026-4812",
    status: "verified",
    title: "VERIFIED — NOOR TRAVELS",
    detail: "Licensed agent · 12 years in business · 4,800 pilgrims served. Safe to book."
  },
  {
    id: "UMT-2026-077",
    status: "fraud",
    title: "FRAUD WARNING",
    detail: "Licence not found in the register. Do not pay this agent. Walk away — and report the agent."
  }
];

// Departure countdown — sample departure 15 Dec 2026, which is 36 days
// after the pinned demo "today" of 9 Nov 2026.
var DEPARTURE = {
  date: "2026-12-15",
  label: "15 Dec 2026",
  route: "Lahore → Jeddah · direct flight · Noor Travels",
  status: "Visa approved · hotel booked · transport confirmed"
};

// Scam spotter — each flag carries a sample example. The four flags
// named in the brief (no licence, cash-only advance, visa fee added
// later, hotel far from Haram) are first.
var REDFLAGS = [
  { id: "no-licence", flag: "No licence number shown",
    example: "A real agent can show a licence number you can check. Sasta Umrah Deals showed none — its sample licence UMT-2026-077 is not in the register." },
  { id: "cash-advance", flag: "Cash-only advance payment",
    example: "An advance paid in cash, with no receipt, is gone if the agent vanishes. Insist on a bank transfer and a written receipt." },
  { id: "visa-added-later", flag: "Visa fee added after the advance",
    example: "Ahmed was quoted Rs 195,000, then asked for Rs 45,000 \u201cvisa fee\u201d after paying the advance. A real package states the visa in writing, up front." },
  { id: "hotel-far", flag: "\u201c5-star near Haram\u201d that is 2.1 km away",
    example: "Sasta's \u201c5-star\u201d hotel is 2.1 km from Haram — a long walk for elderly parents. Ask for the hotel name and its distance in writing before you pay." },
  { id: "shared-room", flag: "Shared room sold as private",
    example: "A shared room with strangers is not a private room. The package must say, in writing, whether the room is private or shared." },
  { id: "long-layover", flag: "A 14-hour layover nobody mentioned",
    example: "Sasta's flight routes via Doha with a 14-hour layover. For elderly pilgrims, a direct flight is worth the difference — check the route before booking." },
  { id: "pressure", flag: "Pressure to pay today",
    example: "\u201cThis price is only for today\u201d is a pressure tactic. A genuine package stays valid for days — take it home and compare it in UmrahPak first." },
  { id: "no-contract", flag: "No written contract",
    example: "A quote on WhatsApp is not a contract. A real agent gives you a signed, written package listing the hotel, flight, visa, transport and room type." }
];

// Departure checklist — tick each step off before paying an agent.
// Persisted in localStorage by app.js.
var CHECKLIST = [
  { id: "licence", label: "Verified the agent's licence number in UmrahPak" },
  { id: "visa-written", label: "Visa included in writing — no fee added later" },
  { id: "hotel-written", label: "Hotel name and distance from Haram in writing" },
  { id: "contract", label: "Got a written contract naming hotel, flight and room type" },
  { id: "no-cash", label: "No cash advance — bank transfer with receipt" },
  { id: "docs", label: "Passport, visa and hotel voucher checked before departure" }
];

var CITIES = ["Lahore", "Karachi", "Islamabad", "Peshawar", "Rawalpindi", "Quetta"];

if (typeof module !== "undefined") {
  module.exports = { PACKAGES: PACKAGES, FAMILY_EXAMPLE: FAMILY_EXAMPLE,
    HIDDEN_COST_EXAMPLE: HIDDEN_COST_EXAMPLE, LICENCES: LICENCES,
    DEPARTURE: DEPARTURE, REDFLAGS: REDFLAGS, CHECKLIST: CHECKLIST,
    CITIES: CITIES };
}
