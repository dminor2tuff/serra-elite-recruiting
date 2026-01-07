// ✅ IMPORTANT: Paste your *Published CSV link* here (NOT the normal sheet edit link)
// It must look like: https://docs.google.com/spreadsheets/d/e/.../pub?output=csv
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("recruitsGrid");
const classFilter = document.getElementById("classFilter");
const searchInput = document.getElementById("searchInput");

let recruits = [];

function clean(v) {
  return (v ?? "").toString().trim();
}

function normalizeKey(k) {
  return clean(k).toLowerCase().replace(/\s+/g, "");
}

function rowToRecruit(row) {
  // Supports headers like "HeightWeight" or "Height Weight"
  const map = {};
  Object.keys(row).forEach(key => { map[normalizeKey(key)] = row[key]; });

  return {
    name: clean(map["name"]),
    year: clean(map["class"]),
    position: clean(map["position"]),
    heightWeight: clean(map["heightweight"]) || clean(map["height/weight"]) || clean(map["heightweight "]),
    hudl: clean(map["hudl"]),
    writeup: clean(map["writeup"]),
    image: clean(map["imageurl"]) || clean(map["imageurl "]),
    twitter: clean(map["twitter"]),
    gpa: clean(map["gpa"]),
    offers: clean(map["offers"]),
  };
}
const classFilter = document.getElementById("classFilter");
let allRecruits = [];

/* After Google Sheets loads */
function renderRecruits(data){
  allRecruits = data;
  applyFilters();
}

function applyFilters(){
  const selectedClass = classFilter.value;
  const filtered = allRecruits.filter(player => {
    if (selectedClass === "all") return true;
    return String(player.Class).trim() === selectedClass;
  });

  drawCards(filtered);
}

classFilter.addEventListener("change", applyFilters);
function iconButton(href, type) {
  if (!href) return "";
  const label = type === "hudl" ? "Hudl" : "X";

  // Replace with your local icons if you have them:
  // images/hudl.png and images/x.png
  const svgHudl = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 6h4v12H5V6Zm10 0h4v12h-4V6Z" fill="currentColor"/>
    </svg>`;
  const svgX = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.7l-5.3-6.5L5.3 22H2l7.4-8.5L1 2h6.9l4.8 6.1L18.9 2Zm-1.2 18h1.7L7 4H5.2l12.5 16Z" fill="currentColor"/>
    </svg>`;

  const icon = type === "hudl" ? svgHudl : svgX;

  return `
    <a class="icon-btn ${type}" href="${href}" target="_blank" rel="noopener" aria-label="${label}">
      ${icon}
    </a>
  `;
}

function render(list) {
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = `<div class="muted">No recruits found.</div>`;
    return;
  }

  grid.innerHTML = list.map(r => {
    const img = r.image || "images/default-player.png";

    return `
      <div class="recruit-card">
        <img src="${img}" class="recruit-photo" alt="${r.name}" onerror="this.src='images/default-player.png'">

        <div class="recruit-body">
          <h3 class="recruit-name">${r.name || "Unnamed Recruit"}</h3>

          <div class="recruit-meta">
            <span>${r.position || "-"}</span>
            <span>•</span>
            <span>Class of ${r.year || "-"}</span>
          </div>

          <div class="recruit-sub">
            ${r.heightWeight ? r.heightWeight : ""}
          </div>

          ${r.writeup ? `<p class="recruit-writeup">${r.writeup}</p>` : ""}

          <div class="recruit-links">
            ${iconButton(r.hudl, "hudl")}
            ${iconButton(r.twitter, "x")}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function applyFilters() {
  const cls = clean(classFilter?.value || "All");
  const q = clean(searchInput?.value).toLowerCase();

  let filtered = recruits;

  if (cls !== "All") {
    filtered = filtered.filter(r => clean(r.year) === cls);
  }

  if (q) {
    filtered = filtered.filter(r => clean(r.name).toLowerCase().includes(q));
  }

  render(filtered);
}

function loadRecruits() {
  if (!SHEET_CSV_URL || SHEET_CSV_URL.includes("PASTE_YOUR")) {
    grid.innerHTML = `
      <div class="muted">
        Missing Google Sheet CSV link. <br/>
        In <b>recruits.js</b>, set <b>SHEET_CSV_URL</b> to your published CSV.
      </div>`;
    return;
  }

  grid.innerHTML = `<div class="muted">Loading recruits...</div>`;

  Papa.parse(SHEET_CSV_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      recruits = (results.data || [])
        .map(rowToRecruit)
        .filter(r => r.name); // must have a name

      applyFilters();
    },
    error: () => {
      grid.innerHTML = `<div class="muted">Error loading recruits. Check your published CSV link.</div>`;
    }
  });
}

if (classFilter) classFilter.addEventListener("change", applyFilters);
if (searchInput) searchInput.addEventListener("input", applyFilters);

loadRecruits();
