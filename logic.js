// UmrahPak — pure logic, no DOM here, so it can be unit-tested in Node.
(function (root) {
  // Pakistani / Indian digit grouping: 4250 -> "4,250",
  // 285000 -> "2,85,000". Last three digits group together, then
  // groups of two — the way lakh and crore figures are written in Pakistan.
  function formatPKR(n) {
    var s = String(Math.round(n));
    if (s.length <= 3) return s;
    var last3 = s.slice(-3);
    var rest = s.slice(0, -3);
    var groups = [];
    while (rest.length > 2) {
      groups.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest) groups.unshift(rest);
    return groups.join(",") + "," + last3;
  }

  // Cheapest VERIFIED package — cheapest alone is not best value, because
  // an unverified package (Sasta) can hide visa fees and a far hotel.
  function cheapestVerifiedPackage(packages) {
    var best = null;
    packages.forEach(function (p) {
      if (!p.verified) return;
      if (!best || p.price < best.price) best = p;
    });
    return best;
  }

  // Search + city filter + verified-only toggle for the comparer.
  function filterPackages(packages, opts) {
    var q = String((opts && opts.query) || "").trim().toLowerCase();
    var city = (opts && opts.city) || "All cities";
    var verifiedOnly = !!(opts && opts.verifiedOnly);
    return packages.filter(function (p) {
      if (verifiedOnly && !p.verified) return false;
      if (city !== "All cities" && p.city !== city) return false;
      if (q) {
        var hay = (p.agent + " " + p.city + " " + p.hotel).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  // Family cost: travellers x per-person price. 4 x Rs 285,000 = Rs 11,40,000.
  function familyCost(travellers, pkg) {
    var t = Math.max(1, Math.min(20, Math.round(travellers) || 1));
    return { travellers: t, perPerson: pkg.price,
             total: t * pkg.price, agent: pkg.agent, city: pkg.city };
  }

  // Hidden-cost breakdown: quoted price plus the extras that arrive
  // after the advance. For a verified package the extras are zero, so
  // the real cost equals the quoted price.
  function hiddenCost(pkg) {
    var quoted = pkg.price;
    var visa = pkg.extraVisa || 0;
    var transport = pkg.extraTransport || 0;
    var meals = pkg.extraMeals || 0;
    return { quoted: quoted, visa: visa, transport: transport, meals: meals,
             realCost: quoted + visa + transport + meals,
             hasHiddenCosts: (visa + transport + meals) > 0 };
  }

  // Licence lookup: case-insensitive, ignores surrounding spaces.
  // Returns the licence record, or { status: "notfound" } for unknown
  // licences — an unknown licence is never called verified.
  function normalizeLicence(s) {
    return String(s || "").trim().toUpperCase();
  }

  function lookupLicence(licences, input) {
    var want = normalizeLicence(input);
    if (!want) return null;
    for (var i = 0; i < licences.length; i++) {
      if (normalizeLicence(licences[i].id) === want) return licences[i];
    }
    return { id: want, status: "notfound",
             title: "LICENCE NOT FOUND",
             detail: "This licence is not in the sample register. Do not pay this agent until the licence is proven in writing." };
  }

  // Risk level for a package, from its red flags:
  // 0 flags -> LOW RISK (verified), 1–2 -> MEDIUM RISK, 3+ -> HIGH RISK.
  function riskLevel(pkg) {
    var n = (pkg.redFlags || []).length;
    if (n === 0) return { level: "LOW RISK", flags: 0 };
    if (n <= 2) return { level: "MEDIUM RISK", flags: n };
    return { level: "HIGH RISK", flags: n };
  }

  // Days from "today" (ISO date) to departure (ISO date).
  // 2026-11-09 -> 2026-12-15 is 36 days.
  function countdownDays(departureISO, todayISO) {
    var d = new Date(departureISO + "T00:00:00Z");
    var t = new Date(todayISO + "T00:00:00Z");
    return Math.round((d.getTime() - t.getTime()) / 86400000);
  }

  // Departure checklist: pure toggle — returns a new array, never mutates.
  function toggleChecklist(doneIds, id) {
    var next = doneIds.slice();
    var i = next.indexOf(id);
    if (i === -1) next.push(id);
    else next.splice(i, 1);
    return next;
  }

  function checklistProgress(doneIds, docs) {
    return { done: doneIds.length, total: docs.length };
  }

  var api = { formatPKR: formatPKR,
              cheapestVerifiedPackage: cheapestVerifiedPackage,
              filterPackages: filterPackages,
              familyCost: familyCost, hiddenCost: hiddenCost,
              normalizeLicence: normalizeLicence,
              lookupLicence: lookupLicence, riskLevel: riskLevel,
              countdownDays: countdownDays,
              toggleChecklist: toggleChecklist,
              checklistProgress: checklistProgress };
  if (typeof module !== "undefined") { module.exports = api; }
  else { root.UmrahPakLogic = api; }
})(typeof window !== "undefined" ? window : globalThis);
