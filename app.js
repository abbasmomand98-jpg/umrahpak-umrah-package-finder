// UmrahPak — page wiring. All rules live in logic.js; this file only renders.
// "Today" is pinned to 2026-11-09 so the sample figures (Rs 285,000 best
// value, Rs 11,40,000 family total, Rs 295,000 hidden-cost reveal, 36-day
// countdown) stay stable no matter when you open it.
(function () {
  var L = window.UmrahPakLogic;
  var TODAY = "2026-11-09";
  var STORE_KEY = "umrahpak-checklist-done";

  function el(id) { return document.getElementById(id); }
  function rs(n) { return "Rs " + L.formatPKR(n); }

  function loadDone() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); }
    catch (e) { return []; }
  }
  function saveDone(d) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch (e) {}
  }
  var doneIds = loadDone();

  // ---- Package comparator (search + city filter + verified-only toggle) ----
  function renderPackages() {
    var q = el("search-input").value;
    var city = el("city-select").value;
    var verifiedOnly = el("verified-only").checked;
    var list = L.filterPackages(PACKAGES, { query: q, city: city, verifiedOnly: verifiedOnly });
    var best = L.cheapestVerifiedPackage(PACKAGES);
    var box = el("package-list");
    box.innerHTML = "";
    if (list.length === 0) {
      box.innerHTML = '<div class="alert notfound"><strong>No packages match</strong>' +
        "<p>Try a different city, or switch off \u201cVerified agents only\u201d.</p></div>";
    }
    list.forEach(function (p) {
      var risk = L.riskLevel(p);
      var div = document.createElement("div");
      div.className = "quote" + (p.verified ? " verified" : " unverified") +
        (best && p.id === best.id ? " best" : "");
      var html = "<h3>" + p.agent + " <span class='city'>" + p.city + "</span></h3>" +
        "<p class='price'>" + rs(p.price) + " <span>per person · " + p.days + " days</span></p>" +
        "<p>" + p.hotel + " · " + p.hotelDistance + "</p>" +
        "<p>" + p.flight + " · " + (p.visaIncluded ? "visa included" : "visa NOT included") +
        " · " + p.transport.toLowerCase() + " · " + p.room.toLowerCase() + "</p>" +
        "<p class='risk'>" + (p.verified ? "✓ VERIFIED AGENT" : "! UNVERIFIED — RED FLAG") +
        " · " + risk.level + "</p>";
      if (best && p.id === best.id) {
        html += "<p class='best-badge'>★ BEST VALUE — cheapest verified package</p>";
      }
      if (!p.verified) {
        html += "<p>Cheapest — but risky. Visa not included, 14-hour layover, hotel 2.1 km from Haram, shared room.</p>";
      }
      div.innerHTML = html;
      box.appendChild(div);
    });
    el("package-summary").textContent = "Best value: " + best.agent + ", " +
      best.city + " — " + rs(best.price) + " per person for " + best.days +
      " days (" + best.hotel.toLowerCase() + " " + best.hotelDistance +
      ", direct flight, visa included). Sasta Umrah Deals is cheaper at " +
      rs(PACKAGES[2].price) + ", but it is unverified and HIGH RISK.";
  }
  el("search-input").addEventListener("input", renderPackages);
  el("city-select").addEventListener("change", renderPackages);
  el("verified-only").addEventListener("change", renderPackages);
  renderPackages();

  // ---- Family cost calculator + hidden-cost reveal ----
  function selectedPackage() {
    var id = el("package-select").value;
    for (var i = 0; i < PACKAGES.length; i++) {
      if (PACKAGES[i].id === id) return PACKAGES[i];
    }
    return PACKAGES[0];
  }

  function renderFamily() {
    var t = parseInt(el("travellers-input").value, 10);
    if (isNaN(t) || t < 1) t = 1;
    if (t > 20) t = 20;
    var pkg = selectedPackage();
    var f = L.familyCost(t, pkg);
    var h = L.hiddenCost(pkg);
    var box = el("family-result");
    var html = '<div class="alert ok"><strong>Your family total: ' + rs(f.total) + "</strong>" +
      "<p>" + f.travellers + " travellers × " + rs(f.perPerson) + " — " +
      pkg.agent + ", " + pkg.city + " (" + pkg.hotel.toLowerCase() + " " +
      pkg.hotelDistance + ", direct flight, visa included).</p></div>";
    if (h.hasHiddenCosts) {
      html += '<div class="alert risk"><strong>! THE HIDDEN-COST TRAP — real cost ' +
        rs(h.realCost) + "</strong>" +
        "<p>Quoted " + rs(h.quoted) + " + visa " + rs(h.visa) + " + transport " +
        rs(h.transport) + " + meals " + rs(h.meals) + " = " + rs(h.realCost) +
        ". That is " + rs(h.realCost - 285000) +
        " MORE than Noor Travels at Rs 285,000 — and Sasta is unverified.</p></div>";
    } else {
      html += '<div class="alert ok"><strong>No hidden costs in this package</strong>' +
        "<p>Visa, transport and meals are included in the quoted price — " +
        rs(h.realCost) + " per person is the real cost.</p></div>";
    }
    box.innerHTML = html;
  }
  el("travellers-input").addEventListener("input", renderFamily);
  el("package-select").addEventListener("change", renderFamily);
  el("travellers-input").value = String(FAMILY_EXAMPLE.travellers);
  el("package-select").value = FAMILY_EXAMPLE.packageId;
  renderFamily();

  // ---- Agent licence checker ----
  function renderLicence(rec) {
    var box = el("licence-result");
    if (!rec) {
      box.innerHTML = '<div class="alert notfound"><strong>Enter an agent licence number</strong>' +
        "<p>It is on the agent's licence card and on their written quote.</p></div>";
      return;
    }
    var cls = rec.status === "verified" ? "ok" : "risk";
    var mark = rec.status === "verified" ? "✓ " : "! ";
    box.innerHTML = '<div class="alert ' + cls + '"><strong>' + mark + rec.title + "</strong>" +
      "<p>" + rec.detail + "</p>" +
      "<p>Checked 9 Nov 2026 (sample data).</p></div>";
  }

  function doLicence() {
    renderLicence(L.lookupLicence(LICENCES, el("licence-input").value));
  }
  el("licence-btn").addEventListener("click", doLicence);
  el("licence-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") doLicence();
  });
  el("licence-input").value = "UMT-2026-4812";
  doLicence();

  // ---- Departure countdown ----
  function renderCountdown() {
    var days = L.countdownDays(DEPARTURE.date, TODAY);
    el("countdown-result").innerHTML =
      '<div class="alert warn"><strong>' + days + " days to departure — " +
      DEPARTURE.label + "</strong>" +
      "<p>" + DEPARTURE.route + ". " + DEPARTURE.status + "</p></div>";
  }
  renderCountdown();

  // ---- Departure checklist (persisted in localStorage) ----
  function renderChecklist() {
    var list = el("checklist");
    list.innerHTML = "";
    CHECKLIST.forEach(function (item) {
      var li = document.createElement("li");
      var done = doneIds.indexOf(item.id) !== -1;
      li.className = done ? "done" : "";
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = done;
      cb.setAttribute("aria-label", item.label);
      cb.addEventListener("change", function () {
        doneIds = L.toggleChecklist(doneIds, item.id);
        saveDone(doneIds);
        renderChecklist();
      });
      var span = document.createElement("span");
      span.textContent = item.label;
      li.appendChild(cb);
      li.appendChild(span);
      list.appendChild(li);
    });
    var p = L.checklistProgress(doneIds, CHECKLIST);
    el("checklist-progress").textContent = p.done + " of " + p.total +
      " safety checks done — tick them all off before paying an agent.";
  }
  renderChecklist();

  // ---- Scam spotter ----
  var rf = el("red-flags");
  REDFLAGS.forEach(function (r) {
    var li = document.createElement("li");
    li.innerHTML = "<strong>⚠ " + r.flag + "</strong> — " + r.example;
    rf.appendChild(li);
  });

  el("reset-demo").addEventListener("click", function () {
    doneIds = [];
    saveDone(doneIds);
    el("search-input").value = "";
    el("city-select").value = "All cities";
    el("verified-only").checked = false;
    el("travellers-input").value = String(FAMILY_EXAMPLE.travellers);
    el("package-select").value = FAMILY_EXAMPLE.packageId;
    el("licence-input").value = "UMT-2026-4812";
    renderPackages();
    renderFamily();
    doLicence();
    renderCountdown();
    renderChecklist();
  });
})();
