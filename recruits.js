/* ===========================
   Serra Recruits (Google Sheets -> Cards)
   CSV: published Google Sheets
   =========================== */

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const gridEl = document.getElementById("grid");
const searchEl = document.getElementById("search");
const filtersEl = document.getElementById("filters");
const statusEl = document.getElementById("status");
const printBtn = document.getElementById("printBtn");
const scoutBtn = document.getElementById("scoutBtn");

let allRows = [];
let activeClass = "all";
let scoutMode = false;

const ICONS = {
  hudl: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6.5C4 5.12 5.12 4 6.5 4h11C18.88 4 20 5.12 20 6.5v11c0 1.38-1.12 2.5-2.5 2.5h-11C5.12 20 4 18.88 4 17.5v-11Z" stroke="currentColor" stroke-width="2"/><path d="M8 16V8h8v8H8Z" stroke="currentColor" stroke-width="2"/></svg>`,
  twitter: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23 22h-6.9l-5.4-7-6.1 7H1l7.3-8.4L1 2h7.1l4.9 6.4L18.9 2Zm-1.2 18h1.9L7 3.9H5L17.7 20Z" fill="currentColor"/></svg>`
};

function slugify(s){
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanUrl(v){
  if(!v) return "";
  v = String(v).trim();
  if(!v) return "";
  // allow @handle for twitter
  if(v.startsWith("@")) v = v.slice(1);
  // if it's just a handle
  if(!v.startsWith("http") && !v.includes(".")) return v;
  return v;
}

function toTwitterUrl(v){
  v = cleanUrl(v);
  if(!v) return "";
  if(v.startsWith("http")) return v;
  // handle or x.com style input
  v = v.replace("x.com/","").replace("twitter.com/","");
  return `https://twitter.com/${v}`;
}

function toHudlUrl(v){
  v = cleanUrl(v);
  if(!v) return "";
  if(v.startsWith("http")) return v;
  // if they pasted just hudl username, attempt profile
  return `https://www.hudl.com/profile/${v}`;
}

function getHeaderIndex(headers, aliases){
  const lower = headers.map(h => (h||"").toLowerCase().trim());
  for(const a of aliases){
    const i = lower.indexOf(a);
    if(i !== -1) return i;
  }
  return -1;
}

function parseCSV(text){
  // Basic CSV parser with quoted support
  const rows = [];
  let cur = [];
  let val = "";
  let inQuotes = false;

  for(let i=0;i<text.length;i++){
    const c = text[i];
    const n = text[i+1];

    if(c === '"' && inQuotes && n === '"'){
      val += '"'; i++;
      continue;
    }
    if(c === '"'){
      inQuotes = !inQuotes;
      continue;
    }
    if(c === "," && !inQuotes){
      cur.push(val); val = "";
      continue;
    }
    if((c === "\n" || c === "\r") && !inQuotes){
      if(c === "\r" && n === "\n") i++;
      cur.push(val);
      rows.push(cur);
      cur = []; val = "";
      continue;
    }
    val += c;
  }
  // last cell
  if(val.length || cur.length){
    cur.push(val);
    rows.push(cur);
  }
  return rows;
}

function resolvePhotoUrl(photoValue){
  const v = (photoValue || "").trim();
  if(!v) return "images/placeholder.png";

  // If it's a full http(s) URL (including raw.githubusercontent)
  if(/^https?:\/\//i.test(v)) return v;

  // If they pasted raw github without https
  if(v.includes("raw.githubusercontent.com")) {
    return v.startsWith("http") ? v : `https://${v.replace(/^\/+/,"")}`;
  }

  // If it's a filename only, use local images folder
  // (your repo shows lots of image files already)
  return `images/${v}`;
}

function buildRowMapper(headers){
  return {
    name: getHeaderIndex(headers, ["name","player","full name","athlete"]),
    position: getHeaderIndex(headers, ["position","pos"]),
    classYear: getHeaderIndex(headers, ["class","class year","grad year","year"]),
    height: getHeaderIndex(headers, ["height","ht"]),
    weight: getHeaderIndex(headers, ["weight","wt"]),
    gpa: getHeaderIndex(headers, ["gpa"]),
    hudl: getHeaderIndex(headers, ["hudl","hudl link","hudl url"]),
    twitter: getHeaderIndex(headers, ["twitter","x","twitter link","x link","twitter url"]),
    photo: getHeaderIndex(headers, ["photo","photo url","image","image url","pic","picture","headshot","photo_filename","photo filename","photo file"])
  };
}

function rowToPlayer(row, map){
  const name = row[map.name] || "";
  const position = row[map.position] || "";
  const classYear = row[map.classYear] || "";
  const height = row[map.height] || "";
  const weight = row[map.weight] || "";
  const gpa = map.gpa >= 0 ? (row[map.gpa] || "") : "";
  const hudl = map.hudl >= 0 ? toHudlUrl(row[map.hudl]) : "";
  const twitter = map.twitter >= 0 ? toTwitterUrl(row[map.twitter]) : "";
  const photo = map.photo >= 0 ? resolvePhotoUrl(row[map.photo]) : "images/placeholder.png";

  const id = slugify(name || `${position}-${classYear}-${height}-${weight}`);
  return { id, name, position, classYear, height, weight, gpa, hudl, twitter, photo };
}

function matchesFilters(p){
  const q = (searchEl.value || "").toLowerCase().trim();
  const classOk = (activeClass === "all") || String(p.classYear).includes(activeClass);
  if(!classOk) return false;
  if(!q) return true;

  const hay = [
    p.name, p.position, p.classYear, p.height, p.weight, p.gpa
  ].join(" ").toLowerCase();

  return hay.includes(q);
}

function cardHTML(p){
  const showPhoto = !scoutMode;
  const hudlBtn = p.hudl ? `
    <a class="icon-link" href="${p.hudl}" target="_blank" rel="noopener">
      ${ICONS.hudl}<span>Hudl</span>
    </a>` : "";

  const twBtn = p.twitter ? `
    <a class="icon-link" href="${p.twitter}" target="_blank" rel="noopener">
      ${ICONS.twitter}<span>Twitter</span>
    </a>` : "";

  const img = showPhoto ? `
    <div class="photo">
      <img src="${p.photo}" alt="${p.name}" loading="lazy" onerror="this.src='images/placeholder.png'">
    </div>` : "";

  return `
  <div class="card">
    ${img}
    <div class="body">
      <div class="name">${p.name || "Unnamed Athlete"}</div>
      <div class="meta"><strong>${p.position || "-"}</strong> • Class of <strong>${p.classYear || "-"}</strong></div>
      <div class="meta">${p.height || "-"} / ${p.weight || "-"} ${p.gpa ? `• GPA ${p.gpa}` : ""}</div>
      <div class="links">${hudlBtn}${twBtn}</div>
    </div>
    <div class="actions">
      <button class="view-btn" data-id="${p.id}">View Profile</button>
    </div>
  </div>`;
}

function render(){
  const filtered = allRows.filter(matchesFilters);
  statusEl.textContent = `Showing ${filtered.length} of ${allRows.length} recruits ${scoutMode ? "(Scout View)" : ""}`;

  gridEl.innerHTML = filtered.map(cardHTML).join("");

  gridEl.querySelectorAll(".view-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-id");
      window.location.href = `profile.html?id=${encodeURIComponent(id)}`;
    });
  });
}

async function loadData(){
  statusEl.textContent = "Loading roster…";
  try{
    // cache bust + no-store so changes in Sheets show up
    const url = `${CSV_URL}&t=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
    if(!res.ok) throw new Error(`CSV fetch failed (${res.status})`);
    const text = await res.text();
    const table = parseCSV(text);
    const headers = table.shift() || [];
    const mapper = buildRowMapper(headers);

    const players = table
      .filter(r => r.some(cell => String(cell || "").trim() !== ""))
      .map(r => rowToPlayer(r, mapper))
      .filter(p => (p.name || "").trim().length > 0);

    allRows = players;
    render();
  }catch(err){
    statusEl.textContent = "Could not load roster from Google Sheets.";
    console.error(err);
  }
}

filtersEl.addEventListener("click", (e)=>{
  const pill = e.target.closest(".pill");
  if(!pill) return;
  activeClass = pill.dataset.class;
  filtersEl.querySelectorAll(".pill").forEach(p=>p.classList.remove("active"));
  pill.classList.add("active");
  render();
});

searchEl.addEventListener("input", ()=>render());

scoutBtn.addEventListener("click", ()=>{
  scoutMode = !scoutMode;
  scoutBtn.textContent = scoutMode ? "Normal View" : "Scout View";
  render();
});

printBtn.addEventListener("click", ()=>{
  // Print current filtered list (save as PDF)
  const filtered = allRows.filter(matchesFilters);
  const w = window.open("", "_blank");
  const title = `Serra Recruits - ${activeClass === "all" ? "All Classes" : activeClass}`;
  w.document.write(`
    <html><head><title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <style>
      body{font-family:Arial,Helvetica,sans-serif;margin:24px}
      h1{margin:0 0 12px}
      .row{display:flex;justify-content:space-between;border-bottom:1px solid #ddd;padding:8px 0}
      .muted{color:#555}
      a{color:#111;text-decoration:none}
      @media print{a{color:#111}}
    </style></head><body>
    <h1>${title}</h1>
    <div class="muted">Generated from Serra Elite Recruiting</div>
    <div style="margin-top:14px">
      ${filtered.map(p=>`
        <div class="row">
          <div>
            <strong>${p.name}</strong> — ${p.position || "-"} — Class ${p.classYear || "-"}<br/>
            <span class="muted">${p.height || "-"} / ${p.weight || "-"} ${p.gpa ? `• GPA ${p.gpa}` : ""}</span>
          </div>
          <div style="text-align:right">
            ${p.hudl ? `<div><a href="${p.hudl}">Hudl</a></div>` : ""}
            ${p.twitter ? `<div><a href="${p.twitter}">Twitter</a></div>` : ""}
          </div>
        </div>
      `).join("")}
    </div>
    <script>window.onload=()=>window.print();</script>
    </body></html>
  `);
  w.document.close();
});

loadData();