const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("recruitsGrid");
const searchInput = document.getElementById("search");
const yearButtons = document.querySelectorAll(".year-filters button");

let recruits = [];
let activeYear = "all";

function parseCSV(text) {
  const rows = [];
  let row = [], current = "", inQuotes = false;

  for (let char of text) {
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) {
      row.push(current); current = "";
    } else if (char === '\n' && !inQuotes) {
      row.push(current); rows.push(row);
      row = []; current = "";
    } else current += char;
  }
  row.push(current); rows.push(row);
  return rows;
}

fetch(SHEET_URL)
  .then(res => res.text())
  .then(csv => {
    const rows = parseCSV(csv).slice(1);
    recruits = rows.map(c => ({
      name: c[0],
      year: c[1],
      position: c[2],
      image: c[6],
      hudl: c[4],
      twitter: c[7]
    }));
    render();
  });

function render() {
  grid.innerHTML = "";
  recruits
    .filter(r =>
      (activeYear === "all" || r.year === activeYear) &&
      (r.name.toLowerCase().includes(searchInput.value.toLowerCase()) ||
       r.position.toLowerCase().includes(searchInput.value.toLowerCase()))
    )
    .forEach(r => {
      const card = document.createElement("div");
      card.className = "recruit-card";
      card.innerHTML = `
        <div class="img-wrap">
          <img src="${r.image}" onerror="this.src='images/placeholder.png'">
        </div>
        <h3>${r.name}</h3>
        <p>${r.position}</p>
        <span>Class of ${r.year}</span>
        <div class="icons">
          ${r.hudl ? `<a href="${r.hudl}" target="_blank">🎥</a>` : ""}
          ${r.twitter ? `<a href="${r.twitter}" target="_blank">🐦</a>` : ""}
        </div>
      `;
      grid.appendChild(card);
    });
}

searchInput.addEventListener("input", render);
yearButtons.forEach(b => {
  b.onclick = () => {
    yearButtons.forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    activeYear = b.dataset.year;
    render();
  };
});