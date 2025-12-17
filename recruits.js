const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("recruitsGrid");
let recruits = [];

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.split("\n").slice(1);
    recruits = rows.map(row => {
      const cols = row.split(",");
      return {
        name: cols[0],
        position: cols[1],
        classYear: cols[2],
        image: cols[3],
        hudl: cols[4],
        twitter: cols[5]
      };
    });
    render("All");
  });

function render(filter) {
  grid.innerHTML = "";
  recruits
    .filter(r => filter === "All" || r.classYear === filter)
    .forEach(r => {
      grid.innerHTML += `
        <div class="recruit-card">
          <img src="${r.image}" alt="${r.name}">
          <h3>${r.name}</h3>
          <p>${r.position}</p>
          <p>Class of ${r.classYear}</p>
          <div class="links">
            ${r.hudl ? `<a href="${r.hudl}" target="_blank">Hudl</a>` : ""}
            ${r.twitter ? `<a href="${r.twitter}" target="_blank">X</a>` : ""}
          </div>
        </div>
      `;
    });
}

document.querySelectorAll(".filters button").forEach(btn => {
  btn.onclick = () => {
    document.querySelector(".filters .active").classList.remove("active");
    btn.classList.add("active");
    render(btn.dataset.class);
  };
});