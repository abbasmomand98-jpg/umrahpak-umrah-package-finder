// UmrahPak DOM smoke test — run with: node dom-smoke.js
// Executes data.js + logic.js + app.js in a tiny fake DOM (vm sandbox)
// and asserts the page renders the canonical figures.
var fs = require("fs");
var vm = require("vm");
var assert = require("assert");

function FakeEl(tag) {
  this.tagName = (tag || "div").toUpperCase();
  this.children = [];
  this._html = "";
  this.textContent = "";
  this.value = "";
  this.checked = false;
  this.className = "";
  this.listeners = {};
  this.attributes = {};
}
FakeEl.prototype.addEventListener = function (ev, fn) {
  (this.listeners[ev] = this.listeners[ev] || []).push(fn);
};
FakeEl.prototype.appendChild = function (child) { this.children.push(child); return child; };
FakeEl.prototype.setAttribute = function (k, v) { this.attributes[k] = v; };
Object.defineProperty(FakeEl.prototype, "innerHTML", {
  get: function () { return this._html; },
  set: function (v) { this._html = String(v); this.children = []; }
});

var byId = {};
function el(id) {
  if (!byId[id]) byId[id] = new FakeEl("div");
  return byId[id];
}
var documentStub = {
  getElementById: el,
  createElement: function (tag) { return new FakeEl(tag); }
};
var store = {};
var localStorageStub = {
  getItem: function (k) { return store[k] || null; },
  setItem: function (k, v) { store[k] = String(v); }
};
function fire(id, ev, arg) {
  (byId[id].listeners[ev] || []).forEach(function (fn) { fn(arg || {}); });
}

var sandbox = { document: documentStub, localStorage: localStorageStub, console: console };
sandbox.window = sandbox;
vm.createContext(sandbox);
["data.js", "logic.js", "app.js"].forEach(function (f) {
  vm.runInContext(fs.readFileSync(f, "utf8"), sandbox, { filename: f });
});

var n = 0;
function eq(a, b, msg) { assert.strictEqual(a, b, msg); n++; }
function ok(v, msg) { assert.ok(v, msg); n++; }

// 1. Package comparator renders all 3 packages on load, Noor best value.
eq(el("package-list").children.length, 3, "package list renders 3 packages on load");
ok(el("package-list").children[0].innerHTML.indexOf("Noor Travels") !== -1, "first package is Noor Travels");
ok(el("package-list").children[0].innerHTML.indexOf("Rs 2,85,000") !== -1, "Noor Travels shows Rs 2,85,000");
ok(el("package-list").children[0].innerHTML.indexOf("BEST VALUE") !== -1, "Noor Travels carries the BEST VALUE badge");
ok(el("package-list").children[2].innerHTML.indexOf("HIGH RISK") !== -1, "Sasta Umrah Deals is flagged HIGH RISK");
ok(el("package-summary").textContent.indexOf("Noor Travels") !== -1, "package summary names Noor Travels as best value");
ok(el("package-summary").textContent.indexOf("Rs 2,85,000") !== -1, "package summary shows Rs 2,85,000");

// 2. Verified-only toggle filters out Sasta.
el("verified-only").checked = true;
fire("verified-only", "change");
eq(el("package-list").children.length, 2, "verified-only shows 2 packages");
el("verified-only").checked = false;
fire("verified-only", "change");
eq(el("package-list").children.length, 3, "switching verified-only off restores 3 packages");

// 3. City filter shows one package.
el("city-select").value = "Karachi";
fire("city-select", "change");
eq(el("package-list").children.length, 1, "Karachi filter shows 1 package");
ok(el("package-list").children[0].innerHTML.indexOf("Rehman Tours") !== -1, "Karachi filter shows Rehman Tours");
el("city-select").value = "All cities";
fire("city-select", "change");

// 4. Family calculator renders the canonical sample on load: 4 x Rs 285,000 = Rs 11,40,000.
ok(el("family-result").innerHTML.indexOf("Rs 11,40,000") !== -1, "family result shows Rs 11,40,000 on load");
ok(el("family-result").innerHTML.indexOf("4 travellers") !== -1, "family result shows 4 travellers on load");

// 5. Switching to Sasta reveals the hidden-cost trap: real cost Rs 295,000.
el("package-select").value = "sasta";
fire("package-select", "change");
ok(el("family-result").innerHTML.indexOf("Rs 2,95,000") !== -1, "Sasta selection reveals real cost Rs 2,95,000");
ok(el("family-result").innerHTML.indexOf("HIDDEN-COST TRAP") !== -1, "Sasta selection shows the hidden-cost trap");
el("package-select").value = "noor";
fire("package-select", "change");
ok(el("family-result").innerHTML.indexOf("Rs 11,40,000") !== -1, "switching back to Noor restores Rs 11,40,000");

// 6. Licence checker renders the verified canonical sample on load.
ok(el("licence-result").innerHTML.indexOf("VERIFIED — NOOR TRAVELS") !== -1, "licence result shows VERIFIED on load");

// 7. Fraud licence warns.
el("licence-input").value = "UMT-2026-077";
fire("licence-btn", "click");
ok(el("licence-result").innerHTML.indexOf("FRAUD WARNING") !== -1, "UMT-2026-077 shows FRAUD WARNING");

// 8. Unknown licence -> not found, never verified.
el("licence-input").value = "UMT-2026-999";
fire("licence-btn", "click");
ok(el("licence-result").innerHTML.indexOf("LICENCE NOT FOUND") !== -1, "unknown licence shows LICENCE NOT FOUND");
ok(el("licence-result").innerHTML.indexOf("VERIFIED") === -1, "unknown licence is never called verified");

// 9. Countdown renders 36 days to 15 Dec 2026.
ok(el("countdown-result").innerHTML.indexOf("36 days to departure") !== -1, "countdown shows 36 days to departure");
ok(el("countdown-result").innerHTML.indexOf("15 Dec 2026") !== -1, "countdown names 15 Dec 2026");

// 10. Checklist renders 6 items, progress 0 of 6.
eq(el("checklist").children.length, 6, "checklist renders 6 safety checks");
eq(el("checklist-progress").textContent, "0 of 6 safety checks done — tick them all off before paying an agent.", "checklist progress starts at 0 of 6");

// 11. Ticking one check updates progress and persists.
var first = el("checklist").children[0].children[0];
first.checked = true;
(first.listeners.change || []).forEach(function (fn) { fn(); });
eq(el("checklist-progress").textContent, "1 of 6 safety checks done — tick them all off before paying an agent.", "progress moves to 1 of 6 after ticking");
ok((store["umrahpak-checklist-done"] || "").indexOf("licence") !== -1, "ticked check persists in localStorage");

// 12. Scam spotter renders 8 flags.
eq(el("red-flags").children.length, 8, "scam spotter renders 8 red flags");

// 13. Reset restores the canonical defaults.
fire("reset-demo", "click");
ok(el("family-result").innerHTML.indexOf("Rs 11,40,000") !== -1, "reset restores the Rs 11,40,000 family total");
ok(el("licence-result").innerHTML.indexOf("VERIFIED — NOOR TRAVELS") !== -1, "reset restores the verified licence");
eq(el("checklist-progress").textContent, "0 of 6 safety checks done — tick them all off before paying an agent.", "reset clears the checklist");
eq(el("package-list").children.length, 3, "reset restores all 3 packages");

console.log("\n" + n + " DOM assertions passed.");
