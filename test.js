// UmrahPak smoke tests — run with: node test.js
// Every canonical figure used in the mockups, slides and copy is asserted here.
var assert = require("assert");
var fs = require("fs");
var data = require("./data.js");
var L = require("./logic.js");

var n = 0;

function eq(a, b, msg) { assert.strictEqual(a, b, msg); n++; }
function ok(v, msg) { assert.ok(v, msg); n++; }
function deep(a, b, msg) { assert.deepStrictEqual(a, b, msg); n++; }

// 1. Cheapest VERIFIED package = Noor Travels, Rs 285,000 (not the cheapest overall).
var best = L.cheapestVerifiedPackage(data.PACKAGES);
eq(best.agent, "Noor Travels", "cheapest verified package is Noor Travels");
eq(best.price, 285000, "Noor Travels package is Rs 285,000");
eq(best.city, "Lahore", "Noor Travels is in Lahore");
eq(best.hotel, "5-star hotel", "Noor Travels offers a 5-star hotel");
eq(best.hotelDistance, "350m from Haram", "Noor Travels hotel is 350m from Haram");
eq(best.flight, "Direct flight Lahore–Jeddah", "Noor Travels flies direct Lahore–Jeddah");
eq(best.visaIncluded, true, "Noor Travels includes the visa");
eq(best.verified, true, "Noor Travels is verified");
eq(best.bestValue, true, "Noor Travels carries the best-value flag");
eq(L.cheapestVerifiedPackage(data.PACKAGES).id, "noor", "cheapest verified package id is noor");

// 2. The other two packages, per person for 14 days.
eq(data.PACKAGES[1].agent, "Rehman Tours", "second package is Rehman Tours");
eq(data.PACKAGES[1].price, 340000, "Rehman Tours package is Rs 340,000");
eq(data.PACKAGES[1].hotelDistance, "150m from Haram", "Rehman Tours hotel is 150m from Haram");
eq(data.PACKAGES[1].verified, true, "Rehman Tours is verified");
eq(data.PACKAGES[2].agent, "Sasta Umrah Deals", "third package is Sasta Umrah Deals");
eq(data.PACKAGES[2].price, 195000, "Sasta Umrah Deals package is Rs 195,000");
eq(data.PACKAGES[2].hotelDistance, "2.1 km from Haram", "Sasta hotel is 2.1 km from Haram");
eq(data.PACKAGES[2].flight, "14-hour layover via Doha", "Sasta flight has a 14-hour layover via Doha");
eq(data.PACKAGES[2].visaIncluded, false, "Sasta does not include the visa");
eq(data.PACKAGES[2].room, "Shared room", "Sasta sells a shared room");
eq(data.PACKAGES[2].verified, false, "Sasta is unverified");
eq(data.PACKAGES.length, 3, "exactly three sample packages");
data.PACKAGES.forEach(function (p) {
  eq(p.days, 14, p.agent + " is a 14-day package");
});

// 3. Family cost maths: 4 x Rs 285,000 = Rs 11,40,000.
var f = L.familyCost(4, data.PACKAGES[0]);
eq(f.travellers, 4, "canonical family is 4 travellers");
eq(f.perPerson, 285000, "per-person price is Rs 285,000");
eq(f.total, 1140000, "family total is Rs 11,40,000 (4 x 285,000)");
deep(data.FAMILY_EXAMPLE, { travellers: 4, packageId: "noor",
  perPerson: 285000, total: 1140000 }, "canonical family example matches");
var f2 = L.familyCost(2, data.PACKAGES[1]);
eq(f2.total, 680000, "2 travellers on Rehman Tours pay Rs 680,000");
var f1 = L.familyCost(1, data.PACKAGES[2]);
eq(f1.total, 195000, "1 traveller on Sasta pays Rs 195,000 quoted");

// 4. Hidden-cost reveal: 195,000 + 45,000 + 25,000 + 30,000 = Rs 295,000.
var h = L.hiddenCost(data.PACKAGES[2]);
eq(h.quoted, 195000, "Sasta quoted price is Rs 195,000");
eq(h.visa, 45000, "Sasta visa fee added later is Rs 45,000");
eq(h.transport, 25000, "Sasta transport added later is Rs 25,000");
eq(h.meals, 30000, "Sasta meals added later are Rs 30,000");
eq(h.realCost, 295000, "Sasta real cost is Rs 295,000");
eq(h.hasHiddenCosts, true, "Sasta carries hidden costs");
eq(h.realCost - 285000, 10000, "Sasta real cost is Rs 10,000 MORE than Noor's Rs 285,000");
ok(h.realCost > 285000, "the cheap deal really costs more than the verified one");
deep(data.HIDDEN_COST_EXAMPLE, { packageId: "sasta", quoted: 195000,
  visa: 45000, transport: 25000, meals: 30000, realCost: 295000,
  verifiedPrice: 285000, difference: 10000 }, "canonical hidden-cost example matches");
var hn = L.hiddenCost(data.PACKAGES[0]);
eq(hn.realCost, 285000, "Noor real cost equals its quoted price");
eq(hn.hasHiddenCosts, false, "Noor carries no hidden costs");

// 5. Package filters: search, city, verified-only.
eq(L.filterPackages(data.PACKAGES, {}).length, 3, "no filter shows all 3 packages");
eq(L.filterPackages(data.PACKAGES, { verifiedOnly: true }).length, 2,
   "verified-only shows 2 packages");
eq(L.filterPackages(data.PACKAGES, { city: "Lahore" }).length, 1,
   "Lahore filter shows 1 package");
eq(L.filterPackages(data.PACKAGES, { city: "Lahore" })[0].agent, "Noor Travels",
   "Lahore filter shows Noor Travels");
eq(L.filterPackages(data.PACKAGES, { query: "sasta" }).length, 1,
   "search for sasta finds 1 package");
eq(L.filterPackages(data.PACKAGES, { query: "noor" })[0].id, "noor",
   "search for noor finds Noor Travels");
eq(L.filterPackages(data.PACKAGES, { query: "zzz" }).length, 0,
   "search for nothing matches nothing");

// 6. Licence checker: UMT-2026-4812 verified, UMT-2026-077 fraud, unknown not-found.
var good = L.lookupLicence(data.LICENCES, "UMT-2026-4812");
eq(good.status, "verified", "UMT-2026-4812 is verified");
eq(good.title, "VERIFIED — NOOR TRAVELS", "verified licence title");
ok(good.detail.indexOf("12 years") !== -1, "verified detail names 12 years");
ok(good.detail.indexOf("4,800 pilgrims") !== -1, "verified detail names 4,800 pilgrims");
var goodLower = L.lookupLicence(data.LICENCES, "umt-2026-4812");
eq(goodLower.status, "verified", "licence lookup is case-insensitive");
var goodSpaced = L.lookupLicence(data.LICENCES, "  UMT-2026-4812  ");
eq(goodSpaced.status, "verified", "licence lookup ignores surrounding spaces");
var fraud = L.lookupLicence(data.LICENCES, "UMT-2026-077");
eq(fraud.status, "fraud", "UMT-2026-077 is fraud");
eq(fraud.title, "FRAUD WARNING", "fraud licence title");
ok(fraud.detail.indexOf("not found in the register") !== -1,
   "fraud detail says the licence is not in the register");
var unknown = L.lookupLicence(data.LICENCES, "UMT-2026-999");
eq(unknown.status, "notfound", "an unknown licence is not-found, never verified");
eq(unknown.title, "LICENCE NOT FOUND", "unknown licence title");
eq(L.lookupLicence(data.LICENCES, ""), null, "empty licence returns null");
eq(L.lookupLicence(data.LICENCES, "   "), null, "blank licence returns null");
eq(L.lookupLicence(data.LICENCES, null), null, "null licence returns null");
eq(data.LICENCES.length, 2, "exactly two known sample licences");

// 7. Scam spotter flags Sasta HIGH RISK.
var riskS = L.riskLevel(data.PACKAGES[2]);
eq(riskS.level, "HIGH RISK", "Sasta Umrah Deals is HIGH RISK");
eq(riskS.flags, 4, "Sasta carries 4 red flags");
eq(L.riskLevel(data.PACKAGES[0]).level, "LOW RISK", "Noor Travels is LOW RISK");
eq(L.riskLevel(data.PACKAGES[1]).level, "LOW RISK", "Rehman Tours is LOW RISK");
eq(data.REDFLAGS.length, 8, "spotter lists 8 red flags");
ok(data.REDFLAGS.some(function (r) { return r.id === "no-licence"; }),
   "spotter includes the no-licence flag");
ok(data.REDFLAGS.some(function (r) { return r.id === "cash-advance"; }),
   "spotter includes the cash-only advance flag");
ok(data.REDFLAGS.some(function (r) { return r.id === "visa-added-later"; }),
   "spotter includes the visa-fee-added-later flag");
ok(data.REDFLAGS.some(function (r) { return r.id === "hotel-far"; }),
   "spotter includes the hotel-2.1-km-away flag");
ok(data.REDFLAGS.every(function (r) { return r.example.length > 10; }),
   "every red flag carries a concrete example");

// 8. Departure countdown: 9 Nov 2026 -> 15 Dec 2026 is 36 days.
eq(L.countdownDays("2026-12-15", "2026-11-09"), 36,
   "countdown from 9 Nov to 15 Dec 2026 is 36 days");
eq(L.countdownDays("2026-11-09", "2026-11-09"), 0, "same-day countdown is 0 days");
eq(data.DEPARTURE.label, "15 Dec 2026", "sample departure is 15 Dec 2026");
eq(data.DEPARTURE.date, "2026-12-15", "sample departure date is 2026-12-15");

// 9. Pakistani digit grouping.
eq(L.formatPKR(750), "750", "Rs 750 needs no separator");
eq(L.formatPKR(45000), "45,000", "Rs 45,000");
eq(L.formatPKR(285000), "2,85,000", "Rs 285,000 in Pakistani grouping");
eq(L.formatPKR(340000), "3,40,000", "Rs 340,000 in Pakistani grouping");
eq(L.formatPKR(1140000), "11,40,000", "Rs 11,40,000 in Pakistani grouping");
eq(L.formatPKR(195000), "1,95,000", "Rs 195,000 in Pakistani grouping");

// 10. Checklist toggle is pure and progress counts.
var start = ["licence", "visa-written"];
var added = L.toggleChecklist(start, "hotel-written");
deep(added, ["licence", "visa-written", "hotel-written"], "toggle adds a missing check");
deep(start, ["licence", "visa-written"], "toggle never mutates the original list");
deep(L.toggleChecklist(start, "licence"), ["visa-written"], "toggle removes a done check");
deep(L.checklistProgress(["licence", "visa-written"], data.CHECKLIST), { done: 2, total: 6 },
     "progress is 2 of 6 checks");
deep(L.checklistProgress([], data.CHECKLIST), { done: 0, total: 6 }, "progress starts at 0 of 6");
eq(data.CHECKLIST.length, 6, "checklist has 6 safety checks");

// 11. Cities: the six canonical cities.
deep(data.CITIES, ["Lahore", "Karachi", "Islamabad", "Peshawar", "Rawalpindi", "Quetta"],
     "six cities in order");

// 12. Every element id referenced by app.js exists in index.html.
var html = fs.readFileSync(__dirname + "/index.html", "utf8");
var appJs = fs.readFileSync(__dirname + "/app.js", "utf8");
var ids = {};
var m;
var idRe = /el\("([^"]+)"\)/g;
while ((m = idRe.exec(appJs)) !== null) ids[m[1]] = true;
var idList = Object.keys(ids);
ok(idList.length >= 12, "app.js references at least 12 element ids (" + idList.length + " found)");
idList.forEach(function (id) {
  ok(html.indexOf('id="' + id + '"') !== -1, "index.html defines id " + id);
});
["data.js", "logic.js", "app.js"].forEach(function (f) {
  ok(html.indexOf('src="' + f + '"') !== -1, "index.html loads " + f);
});

// 13. HTML tag balance: every opened tag is closed (void elements excluded).
var voidTags = { meta: 1, link: 1, input: 1, br: 1, hr: 1, img: 1 };
var stack = [];
var tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g;
while ((m = tagRe.exec(html)) !== null) {
  var tag = m[1].toLowerCase();
  var raw = m[0];
  if (voidTags[tag]) continue;
  if (raw[1] === "/") {
    eq(stack.pop(), tag, "closing tag </" + tag + "> matches the last opened tag");
  } else if (raw[raw.length - 2] !== "/") {
    stack.push(tag);
  }
}
eq(stack.length, 0, "no unclosed tags remain (stack empty)");

console.log("\n" + n + " assertions passed.");
