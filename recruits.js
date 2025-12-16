// ======== SETTINGS ========
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";
const REQUIRE_COACH_LOGIN = true; // gate recruits board

// ======== ELEMENTS ========
const grid = document.getElementById("grid");
const statusEl = document.getElementById("status");
const searchEl = document.getElementById("search");
const filtersEl = document.getElementById("filters");

// ======== STATE ========
let allRecruits = [];
let classFilter = "All";
let searchQuery = "";

// ======== AUTH GATE ========
if (REQUIRE_COACH_LOGIN) Auth.requireCoach();

// ======== CSV PARSER (quotes + commas-safe) ========
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' && inQuotes && next === '"') { cur += '"'; i++; }
    else if (ch === '"') inQuotes = !inQuotes;
    else if (ch === "," && !inQuotes) { row.push(cur); cur = ""; }
    else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (cur.length || row.length) row.push(cur);
      if (row.length) rows.push(row);
      row = [];
      cur = "";
      if (ch === "\r" && next === "\n") i++;
    } else cur += ch;
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

function normalizeKey(s) {
  return String(s || "").trim().toLowerCase().replace(/\s+/g, "");
}

function toSlug(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Twitter can be @handle OR handle OR full URL
function normalizeTwitter(val) {
  const v = String(val || "").trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  const handle = v.replace(/^@/, "").trim();
  return handle ? `https://twitter.com/${handle}` : "";
}

function normalizeHudl(val) {
  const v = String(val || "").trim();
  if (!v) return "";
  return (v.startsWith("http://") || v.startsWith("https://")) ? v : "";
}

// ImageURL can be raw URL OR filename OR images/filename
function normalizePhoto(val) {
  let v = String(val || "").trim();
  if (!v) return "images/placeholder.png";

  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("images/") || v.startsWith("./images/")) return v.replace("./", "");
  return `images/${v}`;
}

function pick(map, row, options) {
  for (const opt of options) {
    const k = normalizeKey(opt);
    if (map[k] !== undefined) return row[map[k]] ?? "";
  }
  return "";
}

function iconX() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2H21l-6.514 7.45L22 22h-6.91l-5.41-7.06L3.5 22H2l7.02-8.03L2 2h7.09l4.9 6.38L18.244 2Zm-1.21 18h1.91L8.12 3.86H6.07L17.034 20Z"></path>
    </svg>
  `;
}

function iconHudl() {
  // simple “play” badge icon (clean + readable)
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
      <path d="M10 8l8 4-8 4V8z" fill="currentColor" style="mix-blend-mode:screen;"></path>
    </svg>
  `;
}

function buildRecruit(row, headerMap) {
  const name = pick(headerMap, row, ["Name"]).trim();
  if (!name) return null;

  const position = pick(headerMap, row, ["Position"]).trim();
  const classYear = pick(headerMap, row, ["Class"]).trim();
  const heightWeight = pick(headerMap, row, ["HeightWeight", "Height", "Weight"]).trim();
  const hudl = normalizeHudl(pick(headerMap, row, ["HUDL", "Hudl"]));
  const twitter = normalizeTwitter(pick(headerMap, row, ["Twitter", "X"]));
  const photo = normalizePhoto(pick(headerMap, row, ["ImageURL", "Photo", "ImageUrl", "imageurl"]));
  const writeup = pick(headerMap, row, ["Writeup"]).trim();
  const gpa = pick(headerMap, row, ["GPA"]).trim();

  const slug = toSlug(name);
  const profile = `profile.html?id=${encodeURIComponent(slug)}`;

  return { name, position, classYear, heightWeight, hudl, twitter, photo, writeup, gpa, slug, profile };
}

function render() {
  const q = searchQuery.trim().toLowerCase();

  const filtered = allRecruits.filter(r => {
    const classOk = (classFilter === "All") || String(r.classYear).includes(classFilter);
    if (!classOk) return false;

    if (!q) return true;
    const hay = `${r.name} ${r.position} ${r.classYear}`.toLowerCase();
    return hay.includes(q);
  });

  grid.innerHTML = "";

  if (!filtered.length) {
    statusEl.textContent = "No recruits match your filters.";
    return;
  }

  statusEl.textContent = `${filtered.length} recruit${filtered.length === 1 ? "" : "s"} shown`;

  for (const r of filtered) {
    const card = document.createElement("article");
    card.className = "recruit-card";

    const twitterLink = r.twitter
      ? `<a class="icon-btn" href="${r.twitter}" target="_blank" rel="noopener" title="X / Twitter">${iconX()}</a>`
      : "";

    const hudlLink = r.hudl
      ? `<a class="icon-btn" href="${r.hudl}" target="_blank" rel="noopener" title="Hudl Film">${iconHudl()}</a>`
      : "";

    card.innerHTML = `
      <div class="photo-wrap">
        <img class="recruit-photo" src="${r.photo}" alt="${r.name}" loading="lazy"
             onerror="this.src='images/placeholder.png'">
      </div>

      <h3 class="recruit-name">${r.name}</h3>
      <div class="recruit-meta">${r.position || ""}</div>
      <div class="recruit-meta">Class of ${r.classYear || ""}${r.gpa ? ` • GPA ${r.gpa}` : ""}</div>
      <div class="recruit-meta">${r.heightWeight || ""}</div>

      <div class="recruit-actions">
        <a class="btn small" href="${r.profile}">View Profile</a>
        <div class="icon-row">
          ${twitterLink}
          ${hudlLink}
        </div>
      </div>
    `;
    grid.appendChild(card);
  }
}

function setActivePill(value) {
  document.querySelectorAll(".pill").forEach(b => {
    b.classList.toggle("active", b.dataset.class === value);
  });
}

filtersEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  classFilter = btn.dataset.class;
  setActivePill(classFilter);
  render();
});

searchEl.addEventListener("input", () => {
  searchQuery = searchEl.value;
  render();
});

async function load() {
  statusEl.textContent = "Loading recruits…";

  const res = await fetch(CSV_URL, { cache: "no-store" });
  if (!res.ok) {
    statusEl.textContent = "Could not load recruits data (CSV fetch failed).";
    return;
  }

  const text = await res.text();
  const rows = parseCSV(text);
  if (!rows.length) {
    statusEl.textContent = "No data found in CSV.";
    return;
  }

  const headers = rows[0];
  const headerMap = {};
  headers.forEach((h, i) => headerMap[normalizeKey(h)] = i);

  const dataRows = rows.slice(1).filter(r => r.some(cell => String(cell || "").trim() !== ""));
  const recruits = [];

  for (const row of dataRows) {
    const r = buildRecruit(row, headerMap);
    if (r) recruits.push(r);
  }

  recruits.sort((a, b) => {
    const ay = parseInt(a.classYear || "9999", 10);
    const by = parseInt(b.classYear || "9999", 10);
    if (ay !== by) return ay - by;
    return a.name.localeCompare(b.name);
  });

  allRecruits = recruits;
  render();
}

load().catch(() => {
  statusEl.textContent = "Error loading recruits.";
});