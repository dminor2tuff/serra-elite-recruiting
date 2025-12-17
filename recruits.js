const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("recruitsGrid");
const searchInput = document.getElementById("search");
const yearButtons = document.querySelectorAll(".year-filters button");

let recruits = [];
let activeYear = "all";

fetch(SHEET_URL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.split("\n").slice(1);
    recruits = rows.map(row => {
      const cols = row.split(",");
      return {
        name: cols[0]?.trim(),
        position: cols[1]?.trim(),
        year: cols[2]?.trim(),
        image: cols[3]?.trim(),
        hudl: cols[4]?.trim(),
        twitter: cols[5]?.trim()
      };
    });
    render();
  });

function render() {
  grid.innerHTML = "";

  recruits
    .filter(r =>
      (activeYear === "all" || r.year === activeYear) &&
      (r.name?.toLowerCase().includes(searchInput.value.toLowerCase()) ||
       r.position?.toLowerCase().includes(searchInput.value.toLowerCase()))
    )
    .forEach(r => {
      const card = document.createElement("div");
      card.className = "recruit-card";

      card.innerHTML = `
        <div class="img-wrap">
          <img src="images/${r.image}" onerror="this.src='images/placeholder.png'" />
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

yearButtons.forEach(btn => {
  btn.onclick = () => {
    yearButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeYear = btn.dataset.year;
    render();
  };
});