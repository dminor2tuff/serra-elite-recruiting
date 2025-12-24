console.log("✅ recruits.js loaded");

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const container = document.getElementById("recruits-container");
const classFilter = document.getElementById("classFilter");
const searchInput = document.getElementById("searchInput");

let recruits = [];

fetch(CSV_URL)
  .then(res => {
    console.log("CSV status:", res.status);
    return res.text();
  })
  .then(csv => {
    const rows = csv.split("\n").slice(1);
    recruits = rows.map(r => {
      const cols = r.split(",");
      return {
        name: cols[0],
        position: cols[1],
        height: cols[2],
        weight: cols[3],
        year: cols[4],
        image: cols[5],
        hudl: cols[6],
        twitter: cols[7],
        writeup: cols[8]
      };
    });
    render();
  })
  .catch(err => {
    console.error("❌ CSV ERROR", err);
    container.innerHTML = "<p>Error loading recruits</p>";
  });

function render() {
  container.innerHTML = "";
  const year = classFilter.value;
  const search = searchInput.value.toLowerCase();

  recruits
    .filter(r =>
      (year === "All" || r.year === year) &&
      r.name.toLowerCase().includes(search)
    )
    .forEach(r => {
      const card = document.createElement("div");
      card.className = "recruit-card";
      card.innerHTML = `
        <img src="${r.image}" class="recruit-photo" loading="lazy">
        <h3>${r.name}</h3>
        <p>${r.position} • ${r.height} • ${r.weight} • Class of ${r.year}</p>
        <p class="writeup">${r.writeup || ""}</p>
        <div class="recruit-links">
          <a href="${r.hudl}" target="_blank">Hudl</a>
          <a href="${r.twitter}" target="_blank">X</a>
        </div>
      `;
      container.appendChild(card);
    });

  console.log("✅ Recruits rendered:", container.children.length);
}