/**************************************
 * SERRA ELITE RECRUITING – RECRUITS.JS
 * 20+ year designer / recruiter logic
 **************************************/

/* ===== SETTINGS ===== */
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const REQUIRE_COACH_LOGIN = true;

/* ===== AUTH GATE ===== */
if (REQUIRE_COACH_LOGIN && window.Auth) {
  Auth.requireCoach();
}

/* ===== ELEMENTS ===== */
const grid = document.getElementById("grid");
const statusEl = document.getElementById("status");
const searchEl = document.getElementById("search");
const filtersEl = document.getElementById("filters");

/* ===== STATE ===== */
let recruits = [];
let activeClass = "All";
let searchQuery = "";

/* ===== UTILITIES ===== */
function normalizeKey(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function slugify(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ===== IMAGE HANDLER ===== */
function normalizeImage(url) {
  if (!url) return "images/placeholder.png";

  const v = url.trim();

  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("images/")) return v;

  return `images/${v}`;
}

/* ===== TWITTER NORMALIZER ===== */
function normalizeTwitter(val) {
  if (!val) return "";

  let v = val.trim();
  if (!v) return "";

  if (v.startsWith("http://") || v.startsWith("https://")) return v;

  v = v.replace("@", "");
  return `https://twitter.com/${v}`;
}

/* ===== HUDL NORMALIZER ===== */
function normalizeHudl(val) {
  if (!val) return "";
  const v = val.trim();
  return v.startsWith("http") ? v : "";
}

/* ===== CSV PARSER (ROBUST) ===== */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"' && inQuotes && next === '"') {
      cur += '"';
      i++;
    } else if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      row.push(cur);
      cur = "";
    } else if ((c === "\n" || c === "\r") && !inQuotes) {
      if (cur.length || row.length) row.push(cur);
      if (row.length) rows.push(row);
      row = [];
      cur = "";
      if (c === "\r" && next === "\n") i++;
    } else {
      cur += c;
    }
  }

  if (cur.length || row.length) {
    row.push(cur);
    rows.push(row);
  }

  return rows;
}

/* ===== ICON SVGs ===== */
function twitterIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2H21l-6.514 7.45L22 22h-6.91l-5.41-7.06L3.5 22H2l7.02-8.03L2 2h7.09l4.9 6.38L18.244 2Zm-1.21 18h1.91L8.12 3.86H6.07L17.034 20Z"></path>
    </svg>
  `;
}

function hudlIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
               10-4.48 10-10S17.52 2 12 2z"></path>
      <path d="M10 8l8 4-8 4V8z" fill="currentColor"></path>
    </svg>
  `;
}

/* ===== BUILD RECRUIT OBJECT ===== */
function buildRecruit(row, map) {
  const name = row[map.name] || "";
  if (!name.trim()) return null;

  return {
    name: name.trim(),
    slug: slugify(name),
    classYear: (row[map.class] || "").trim(),
    position: (row[map.position] || "").trim(),
    heightWeight: (row[map.heightweight] || "").trim(),
    gpa: (row[map.gpa] || "").trim(),
    writeup: (row[map.writeup] || "").trim(),
    photo: normalizeImage(row[map.imageurl] || ""),
    hudl: normalizeHudl(row[map.hudl] || ""),
    twitter: normalizeTwitter(row[map.twitter] || "")
  };
}

/* ===== RENDER ===== */
function render() {
  grid.innerHTML = "";

  const filtered = recruits.filter(r => {
    if (activeClass !== "All" && r.classYear !== activeClass) return false;

    if (!searchQuery) return true;

    const hay = `${r.name} ${r.position}`.toLowerCase();
    return hay.includes(searchQuery);
  });

  if (!filtered.length) {
    statusEl.textContent = "No recruits found.";
    return;
  }

  statusEl.textContent = `${filtered.length} recruit${filtered.length !== 1 ? "s" : ""} shown`;

  filtered.forEach(player => {
    const card = document.createElement("article");
    card.className = "recruit-card";

    card.innerHTML = `
      <div class="photo-wrap">
        <img class="recruit-photo"
             src="${player.photo}"
             alt="${player.name}"
             onerror="this.src='images/placeholder.png'">
      </div>

      <h3 class="recruit-name">${player.name}</h3>
      <div class="recruit-meta">${player.position}</div>
      <div class="recruit-meta">Class of ${player.classYear}${player.gpa ? ` • GPA ${player.gpa}` : ""}</div>
      <div class="recruit-meta">${player.heightWeight}</div>

      <div class="recruit-actions">
        <a class="btn small" href="profile.html?id=${encodeURIComponent(player.slug)}">
          View Profile
        </a>

        <div class="icon-row">
          ${player.twitter ? `
            <a class="icon-btn"
               href="${player.twitter}"
               target="_blank"
               rel="noopener"
               title="Twitter / X">
              ${twitterIcon()}
            </a>` : ""}

          ${player.hudl ? `
            <a class="icon-btn"
               href="${player.hudl}"
               target="_blank"
               rel="noopener"
               title="Hudl Film">
              ${hudlIcon()}
            </a>` : ""}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

/* ===== EVENTS ===== */
searchEl.addEventListener("input", () => {
  searchQuery = searchEl.value.toLowerCase().trim();
  render();
});

filtersEl.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;

  activeClass = btn.dataset.class;
  document.querySelectorAll(".pill").forEach(b =>
    b.classList.toggle("active", b === btn)
  );

  render();
});

/* ===== LOAD DATA ===== */
async function load() {
  statusEl.textContent = "Loading recruits…";

  const res = await fetch(CSV_URL, { cache: "no-store" });
  const text = await res.text();
  const rows = parseCSV(text);

  const headers = rows[0];
  const map = {};

  headers.forEach((h, i) => {
    map[normalizeKey(h)] = i;
  });

  recruits = rows.slice(1)
    .map(r => buildRecruit(r, map))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  render();
}

load().catch(() => {
  statusEl.textContent = "Error loading recruits.";
});