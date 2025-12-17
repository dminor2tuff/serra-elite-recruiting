/* =========================
   RECRUITS (Google Sheets -> Site)
   - Published CSV required
   - Cache-busts so updates show
   - Supports raw.githubusercontent photos
   ========================= */

// 1) Your published CSV URL from Google Sheets:
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

// If photo is missing/bad
const PLACEHOLDER_IMG = "images/placeholder.png";

// Grid + controls
const grid = document.getElementById("grid");
const statusEl = document.getElementById("status");
const searchEl = document.getElementById("search");
const chipsEl = document.getElementById("chips");

let allRows = [];
let activeClass = "all";
let activeQuery = "";

// Small, safe CSV parser (handles quoted commas)
function parseCSV(text){
  const rows = [];
  let i = 0, field = "", row = [], inQuotes = false;

  const pushField = () => { row.push(field); field = ""; };
  const pushRow = () => { rows.push(row); row = []; };

  while (i < text.length){
    const c = text[i];

    if (c === '"'){
      if (inQuotes && text[i+1] === '"'){ field += '"'; i += 2; continue; }
      inQuotes = !inQuotes; i++; continue;
    }

    if (!inQuotes && c === ","){ pushField(); i++; continue; }
    if (!inQuotes && (c === "\n" || c === "\r")){
      if (c === "\r" && text[i+1] === "\n") i++;
      pushField(); pushRow(); i++; continue;
    }

    field += c; i++;
  }

  pushField();
  if (row.length > 1 || row[0].trim() !== "") pushRow();

  const header = rows.shift().map(h => (h || "").trim());
  return rows
    .filter(r => r.some(x => (x || "").trim() !== ""))
    .map(r => {
      const obj = {};
      header.forEach((h, idx) => obj[h] = (r[idx] || "").trim());
      return obj;
    });
}

function normalizeTwitter(v){
  if (!v) return "";
  let s = v.trim();
  s = s.replace(/^@/, "");
  if (s.includes("twitter.com") || s.includes("x.com")) return s.startsWith("http") ? s : "https://" + s;
  return `https://twitter.com/${s}`;
}

function normalizeHudl(v){
  if (!v) return "";
  let s = v.trim();
  if (!s) return "";
  if (s.startsWith("http")) return s;
  return `https://www.hudl.com/profile/${s}`;
}

function normalizePhoto(v){
  if (!v) return PLACEHOLDER_IMG;
  let s = v.trim();

  if (s.startsWith("//")) s = "https:" + s;

  if (s.includes("raw.githubusercontent.com")) return s;

  if (s.includes("github.com") && s.includes("/blob/")){
    s = s.replace("github.com/", "raw.githubusercontent.com/")
         .replace("/blob/", "/");
    return s;
  }

  if (!s.includes("/") && (s.endsWith(".png") || s.endsWith(".jpg") || s.endsWith(".jpeg") || s.endsWith(".webp"))){
    return `images/${s}`;
  }

  if (s.startsWith("http")) return s;

  return PLACEHOLDER_IMG;
}

function getField(obj, candidates){
  for (const key of candidates){
    if (obj[key] && obj[key].trim()) return obj[key].trim();
  }
  return "";
}

function iconHudl(){
  return `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M4 7.2c0-1.2 1-2.2 2.2-2.2h11.6C19 5 20 6 20 7.2v9.6c0 1.2-1 2.2-2.2 2.2H6.2C5 19 4 18 4 16.8V7.2zm3 2.1a1 1 0 0 0-1 1v3.4a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10.3a1 1 0 0 0-1-1H7z"/>
  </svg>`;
}
function iconTwitter(){
  return `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M18.9 3H22l-6.8 7.8L23 21h-6.4l-5-6.1L6.2 21H3l7.3-8.4L1 3h6.6l4.6 5.4L18.9 3zm-1.1 16h1.8L7.7 4.9H5.7L17.8 19z"/>
  </svg>`;
}

function cardHTML(p){
  const name = getField(p, ["Name","Player","Full Name","Athlete"]);
  const pos  = getField(p, ["Position","Pos"]);
  const cls  = getField(p, ["Class","Grad Year","Year"]);
  const ht   = getField(p, ["Height","Ht"]);
  const wt   = getField(p, ["Weight","Wt"]);
  const hudl = normalizeHudl(getField(p, ["Hudl","HUDL","Hudl Link","Hudl URL"]));
  const tw   = normalizeTwitter(getField(p, ["Twitter","X","Twitter Link","X Link"]));
  const photo= normalizePhoto(getField(p, ["Photo","Photo URL","Image","Image URL","Headshot"]));

  const subLine = [
    pos ? `<div class="meta">${pos}</div>` : "",
    cls ? `<div class="meta">Class of ${cls}</div>` : "",
    (ht || wt) ? `<div class="meta">${ht || ""}${ht && wt ? " / " : ""}${wt ? wt + " lbs" : ""}</div>` : ""
  ].join("");

  const links = `
    <div class="links">
      ${tw ? `<a class="iconlink" href="${tw}" target="_blank" rel="noopener">${iconTwitter()}<span>Twitter</span></a>` : ""}
      ${hudl ? `<a class="iconlink" href="${hudl}" target="_blank" rel="noopener">${iconHudl()}<span>Hudl</span></a>` : ""}
    </div>
  `;

  return `
  <div class="card" data-class="${(cls||"").toString()}" data-search="${(name+" "+pos+" "+cls).toLowerCase()}">
    <div class="photo">
      <img src="${photo}" alt="${name}" loading="lazy"
           onerror="this.onerror=null; this.src='${PLACEHOLDER_IMG}';">
    </div>
    <div class="body">
      <div class="name">${name || "Recruit"}</div>
      ${subLine}
      ${links}
      <div class="actions">
        <a class="btn primary" href="profile.html?name=${encodeURIComponent(name)}">View Profile</a>
      </div>
    </div>
  </div>`;
}

function applyFilters(){
  const cards = Array.from(grid.children);
  const q = activeQuery.trim().toLowerCase();

  let shown = 0;
  for (const c of cards){
    const cClass = (c.getAttribute("data-class") || "").trim();
    const hay = (c.getAttribute("data-search") || "");

    const okClass = (activeClass === "all") ? true : (cClass === activeClass);
    const okQuery = !q ? true : hay.includes(q);

    const show = okClass && okQuery;
    c.style.display = show ? "" : "none";
    if (show) shown++;
  }

  statusEl.textContent = `${shown} recruit${shown===1?"":"s"} shown`;
}

async function load(){
  if (!CSV_URL){
    statusEl.textContent = "Missing Google Sheets CSV URL in recruits.js.";
    return;
  }

  statusEl.textContent = "Syncing recruits from Google Sheets…";

  const url = CSV_URL + (CSV_URL.includes("?") ? "&" : "?") + "cb=" + Date.now();
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok){
    statusEl.textContent = "Could not load Google Sheet (check publish link).";
    return;
  }
  const text = await res.text();
  allRows = parseCSV(text);

  grid.innerHTML = allRows.map(cardHTML).join("");
  statusEl.textContent = `Loaded ${allRows.length} recruits`;
  applyFilters();
}

searchEl.addEventListener("input", () => {
  activeQuery = searchEl.value || "";
  applyFilters();
});

chipsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;

  Array.from(chipsEl.querySelectorAll(".chip")).forEach(x => x.classList.remove("active"));
  btn.classList.add("active");

  activeClass = btn.getAttribute("data-class") || "all";
  applyFilters();
});

load();