const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("recruitsGrid");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");

let players = [];

fetch(SHEET_URL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.split("\n").slice(1);
    players = rows.map(row => {
      const cols = row.split(",");
      return {
        name: cols[0],
        position: cols[1],
        classYear: cols[2],
        height: cols[3],
        weight: cols[4],
        hudl: cols[5],
        twitter: cols[6],
        image: cols[7]
      };
    });
    render(players);
  });

function render(list) {
  grid.innerHTML = "";
  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "recruit-card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" onerror="this.src='images/player_placeholder.png'">
      <h3>${p.name}</h3>
      <p>${p.position}</p>
      <p>Class of ${p.classYear}</p>
      <div class="links">
        ${p.hudl ? `<a href="${p.hudl}" target="_blank">Hudl</a>` : ""}
        ${p.twitter ? `<a href="${p.twitter}" target="_blank">Twitter</a>` : ""}
      </div>
    `;
    grid.appendChild(card);
  });
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  render(players.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.position.toLowerCase().includes(q)
  ));
});

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const cls = btn.dataset.class;
    render(cls === "all"
      ? players
      : players.filter(p => p.classYear === cls));
  });
});