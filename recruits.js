const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("recruitsGrid");
const searchInput = document.getElementById("search");
const yearButtons = document.querySelectorAll(".year-filters button");

let recruits = [];
let activeYear = "all";

/* ---------- SAFE CSV PARSER (REQUIRED) ---------- */
function parseCSV(text) {
  const rows = [];
  let current = "";
  let inQuotes = false;
  let row = [];

  for (let char of text) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if (char === "\n" && !inQuotes) {
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }
  row.push(current);
  rows.push(row);
  return rows;
}

/* ---------- FETCH & LOAD ---------- */
fetch(SHEET_URL)
  .then(res => res.text())
  .then(csv => {
    const rows = parseCSV(csv).slice(1);

    recruits = rows.map(cols => ({
      name: cols[0]?.trim(),
      classYear: cols[1]?.trim(),
      position: cols[2]?.trim(),
      heightWeight: cols[3]?.trim(),
      hudl: cols[4]?.trim(),
      writeup: cols[5]?.trim(),
      image: cols[6]?.trim(),
      twitter: cols[7]?.trim(),
      gpa: cols[8]?.trim()
    }));

    render();
  })
  .catch(err => {
    grid.innerHTML = "<p>Error loading recruits.</p>";
    console.error(err);
  });

/* ---------- RENDER ---------- */
function render() {
  grid.innerHTML = "";

  recruits
    .filter(r =>
      (activeYear === "all" || r.classYear === activeYear) &&
      (
        r.name?.toLowerCase().includes(searchInput.value.toLowerCase()) ||
        r.position?.toLowerCase().includes(searchInput.value.toLowerCase())
      )
    )
    .forEach(r => {
      const card = document.createElement("div");
      card.className = "recruit-card";

      card.innerHTML = `
        <div class="img-wrap">
          <img 
            src="${r.image}" 
            alt="${r.name}"
            loading="lazy"
            onerror="this.src='images/placeholder.png'"
          >
        </div>

        <h3>${r.name}</h3>
        <p class="position">${r.position}</p>
        <span class="class">Class of ${r.classYear}</span>

        <div class="meta">
          ${r.heightWeight || ""}
          ${r.gpa ? " • GPA: " + r.gpa : ""}
        </div>

        <div class="icons">
          ${r.hudl ? `<a href="${r.hudl}" target="_blank" title="Hudl">🎥</a>` : ""}
          ${r.twitter ? `<a href="${r.twitter}" target="_blank" title="Twitter">🐦</a>` : ""}
        </div>
      `;

      grid.appendChild(card);
    });
}

/* ---------- FILTERS ---------- */
searchInput.addEventListener("input", render);

yearButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    yearButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeYear = btn.dataset.year;
    render();
  });
});