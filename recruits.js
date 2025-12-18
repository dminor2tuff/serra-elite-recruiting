const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const gridEl = document.getElementById("recruitsGrid");
const statusEl = document.getElementById("statusMsg");
const classFilterEl = document.getElementById("classFilter");
const nameSearchEl = document.getElementById("nameSearch");

let allPlayers = [];

init();

async function init() {
  try {
    setStatus("Loading prospects…");
    const csvText = await fetch(CSV_URL + "&v=" + Date.now()).then(r => r.text());
    allPlayers = csvToObjects(csvText);

    // Clean/normalize fields
    allPlayers = allPlayers
      .map(p => normalizePlayer(p))
      .filter(p => p.Name);

    render();
    setStatus(allPlayers.length ? "" : "No prospects found. Check your published CSV and headers.");
  } catch (e) {
    console.error(e);
    setStatus("Error loading prospects. Verify the CSV publish link and that it is publicly accessible.");
  }

  classFilterEl?.addEventListener("change", render);
  nameSearchEl?.addEventListener("input", render);
}

function setStatus(msg) {
  if (!statusEl) return;
  statusEl.textContent = msg || "";
}

function render() {
  if (!gridEl) return;

  const year = (classFilterEl?.value || "all").trim();
  const q = (nameSearchEl?.value || "").trim().toLowerCase();

  const filtered = allPlayers.filter(p => {
    const yearOk = year === "all" || String(p.Class || "").trim() === year;
    const nameOk = !q || (p.Name || "").toLowerCase().includes(q);
    return yearOk && nameOk;
  });

  gridEl.innerHTML = filtered.map(p => playerCardHTML(p)).join("");
}

/* -------------------------
   Player card HTML
-------------------------- */
function playerCardHTML(p) {
  const imgSrc = p.ImageURL || "images/placeholder.png";

  return `
    <article class="player-card">
      <div class="photo-frame">
        <img src="${escapeAttr(imgSrc)}" alt="${escapeAttr(p.Name)}" loading="lazy"
          onerror="this.onerror=null;this.src='images/placeholder.png';">
      </div>

      <div class="player-body">
        <div class="player-name">${escapeHTML(p.Name)}</div>
        <div class="player-meta">
          ${escapeHTML(p.Position || "—")}
          <span class="dot">•</span>
          Class of ${escapeHTML(String(p.Class || "—"))}
        </div>

        <div class="link-row">
          ${p.HUDL ? iconLink(p.HUDL, "Hudl", hudlSVG()) : ""}
          ${p.Twitter ? iconLink(p.Twitter, "X", twitterSVG()) : ""}
        </div>
      </div>
    </article>
  `;
}

function iconLink(url, label, svg) {
  return `
    <a class="icon-btn" href="${escapeAttr(url)}" target="_blank" rel="noopener" aria-label="${escapeAttr(label)}">
      ${svg}
    </a>
  `;
}

/* -------------------------
   Normalize & URL helpers
-------------------------- */
function normalizePlayer(p) {
  // normalize headers
  const obj = {};
  for (const k in p) obj[trimKey(k)] = (p[k] ?? "").trim();

  // Ensure correct header names
  const Name = obj["Name"] || "";
  const Class = obj["Class"] || "";
  const Position = obj["Position"] || "";
  const ImageURL = fixUrl(obj["ImageURL"] || "");
  const HUDL = fixHudl(obj["HUDL"] || "");
  const Twitter = fixTwitter(obj["Twitter"] || "");

  return { Name, Class, Position, ImageURL, HUDL, Twitter };
}

function fixUrl(u) {
  if (!u) return "";
  if (u.startsWith("http://")) return u.replace("http://", "https://");
  return u;
}

// HUDL: ensure https
function fixHudl(u) {
  if (!u) return "";
  let x = u.trim();
  if (!x.startsWith("http")) x = "https://" + x.replace(/^\/+/, "");
  return x;
}

// Twitter/X: allow @handle or full link
function fixTwitter(u) {
  if (!u) return "";
  let x = u.trim();

  // If user typed @handle
  if (x.startsWith("@")) return "https://twitter.com/" + x.slice(1);

  // If they pasted handle only
  if (!x.startsWith("http") && !x.includes("/")) return "https://twitter.com/" + x;

  // Ensure https
  if (x.startsWith("http://")) x = x.replace("http://", "https://");
  return x;
}

/* -------------------------
   CSV parser (handles commas in quotes)
-------------------------- */
function csvToObjects(csvText) {
  const lines = csvText.replace(/\r/g, "").trim().split("\n");
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]).map(h => h.trim());
  const out = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => row[h] = (vals[idx] ?? ""));
    out.push(row);
  }
  return out;
}

function parseCsvLine(line) {
  const res = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"' ) {
      if (inQuotes && line[i + 1] === '"') { // escaped quote
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      res.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  res.push(cur);
  return res.map(s => s.trim());
}

function trimKey(k){ return (k||"").trim().replace(/\s+/g,""); }

/* -------------------------
   SVG icons (no extra files needed)
-------------------------- */
function hudlSVG(){
  return `
    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.4c3.6 0 6.7 2 8.3 5-1.6 3-4.7 5-8.3 5S5.3 10.4 3.7 7.4c1.6-3 4.7-5 8.3-5Zm0 2.2c-2.5 0-4.8 1.2-6.3 2.8 1.5 1.6 3.8 2.8 6.3 2.8s4.8-1.2 6.3-2.8C16.8 5.8 14.5 4.6 12 4.6Z"></path>
      <path d="M12 11.6c-3.6 0-6.7 2-8.3 5 1.6 3 4.7 5 8.3 5s6.7-2 8.3-5c-1.6-3-4.7-5-8.3-5Zm0 2.2c2.5 0 4.8 1.2 6.3 2.8-1.5 1.6-3.8 2.8-6.3 2.8s-4.8-1.2-6.3-2.8c1.5-1.6 3.8-2.8 6.3-2.8Z"></path>
    </svg>
  `;
}

function twitterSVG(){
  return `
    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.9 2H21l-7.9 9 9 11h-6.6l-5.2-6.3L4.9 22H2.8l8.5-9.7L2.6 2h6.8l4.7 5.6L18.9 2Zm-2.3 18h1.2L8.8 4H7.5l9.1 16Z"></path>
    </svg>
  `;
}

/* -------------------------
   Escaping helpers
-------------------------- */
function escapeHTML(str){
  return String(str ?? "").replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[s]));
}
function escapeAttr(str){
  return escapeHTML(str).replace(/`/g, "&#96;");
}