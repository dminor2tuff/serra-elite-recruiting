const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("recruitGrid");
const classFilter = document.getElementById("classFilter");
const searchInput = document.getElementById("searchInput");

let players = [];

/* SAFE CSV PARSER */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"' && text[i + 1] === '"') {
      value += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
    } else if (char === "\n" && !inQuotes) {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  row.push(value);
  rows.push(row);
  return rows;
}

/* LOAD DATA */
fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const data = parseCSV(text).slice(1);

    players = data.map(c => ({
      name: c[0],
      classYear: c[1],
      position: c[2],
      heightWeight: c[3],
      hudl: c[4],
      writeup: c[5],
      image: c[6],
      twitter: c[7],
      gpa: c[8]
    })).filter(p => p.name);

    renderPlayers();
  });

function renderPlayers() {
  grid.innerHTML = "";

  const classVal = classFilter.value;
  const searchVal = searchInput.value.toLowerCase();

  players
    .filter(p =>
      (classVal === "all" || p.classYear === classVal) &&
      p.name.toLowerCase().includes(searchVal)
    )
    .forEach(p => {
      const card = document.createElement("div");
      card.className = "recruit-card";

      card.innerHTML = `
        <div class="photo-wrap">
          <img src="${p.image || 'images/placeholder.png'}"
               onerror="this.src='images/placeholder.png'">
        </div>
        <h3>${p.name}</h3>
        <div class="meta">${p.position} · Class of ${p.classYear}</div>
        <div class="meta">${p.heightWeight}</div>
      `;

      grid.appendChild(card);
    });
}

classFilter.addEventListener("change", renderPlayers);
searchInput.addEventListener("input", renderPlayers);