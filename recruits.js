const CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("recruitsGrid");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".class-filters button");

let recruits = [];
let activeYear = "all";

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.split("\n").slice(1);
    recruits = rows.map(r => {
      const c = r.split(",");
      return {
        name: c[0],
        year: c[1],
        position: c[2],
        size: c[3],
        hudl: c[4],
        image: c[6],
        twitter: c[7]
      };
    });
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
        <div class="photo-wrap">
          <img src="${r.image}" onerror="this.src='images/placeholder.png'">
        </div>

        <div class="card-body">
          <h3>${r.name}</h3>
          <p class="pos">${r.position}</p>
          <p class="meta">${r.size} · Class of ${r.year}</p>

          <div class="icons">
            ${r.hudl ? `<a href="${r.hudl}" target="_blank" title="Hudl">🎥</a>` : ""}
            ${r.twitter ? `<a href="${r.twitter}" target="_blank" title="Twitter">🐦</a>` : ""}
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
}

searchInput.addEventListener("input", render);

filterButtons.forEach(btn => {
  btn.onclick = () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeYear = btn.dataset.year;
    render();
  };
});