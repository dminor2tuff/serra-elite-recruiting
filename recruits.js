// ===== CONFIG =====
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdefPIY8K8ag6AePllWRgYXhjJ-gJddb_8rDaJi3t5BATllbHVK6m5cDsDQxg2PUIYPqHYcXyxbT2/pub?output=csv";

// ===== DOM =====
const grid = document.getElementById("recruitsGrid");
const classFilter = document.getElementById("classFilter");
const searchInput = document.getElementById("searchInput");

// ===== STATE =====
let allRecruits = [];

// ===== HELPERS =====
function clean(v) {
  return (v ?? "").toString().trim();
}

function normalizeKey(k) {
  return clean(k).toLowerCase().replace(/\s+/g, "");
}

function rowToRecruit(row) {
  const map = {};
  Object.keys(row).forEach(key => {
    map[normalizeKey(key)] = row[key];
  });

  return {
    name: clean(map["name"]),
    year: clean(map["class"]),
    position: clean(map["position"]),
    heightWeight:
      clean(map["heightweight"]) ||
      clean(map["height/weight"]),
    hudl: clean(map["hudl"]),
    twitter: clean(map["twitter"]),
    writeup: clean(map["writeup"]),
    image: clean(map["imageurl"]),
    gpa: clean(map["gpa"]),
    offers: clean(map["offers"])
  };
}

// ===== RENDER =====
function drawCards(list) {
  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = "<p>No recruits found.</p>";
    return;
  }

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "recruit-card";

    card.innerHTML = `
      <img src="${p.image}" class="recruit-photo" />
      <div class="recruit-info">
        <h3>${p.name}</h3>
        <p>${p.position} • Class of ${p.year}</p>
        <p>${p.heightWeight}</p>
        <p class="writeup">${p.writeup}</p>
        <div class="links">
          ${p.hudl ? `<a href="${p.hudl}" target="_blank">Hudl</a>` : ""}
          ${p.twitter ? `<a href="${p.twitter}" target="_blank">X</a>` : ""}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ===== FILTER =====
function applyFilters() {
  const selectedClass = classFilter.value;
  const term = searchInput.value.toLowerCase();

  const filtered = allRecruits.filter(p => {
    const classMatch =
      selectedClass === "all" || p.year === selectedClass;
    const nameMatch = p.name.toLowerCase().includes(term);
    return classMatch && nameMatch;
  });

  drawCards(filtered);
}

// ===== LOAD DATA =====
Papa.parse(SHEET_CSV_URL, {
  download: true,
  header: true,
  complete: res => {
    allRecruits = res.data.map(rowToRecruit).filter(p => p.name);
    applyFilters();
  },
  error: err => {
    grid.innerHTML = "<p>Error loading recruits.</p>";
    console.error(err);
  }
});

// ===== EVENTS =====
classFilter.addEventListener("change", applyFilters);
searchInput.addEventListener("input", applyFilters);