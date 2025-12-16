Auth.requireCoach();

const CSV =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("grid");
const search = document.getElementById("search");
let recruits = [];
let classFilter = "All";

fetch(CSV)
  .then(r => r.text())
  .then(text => {
    const rows = text.split("\n").slice(1);
    recruits = rows.map(r => {
      const c = r.split(",");
      return {
        name: c[0],
        classYear: c[1],
        position: c[2],
        photo: c[6] ? `images/${c[6]}` : "images/placeholder.png",
        twitter: c[7],
        hudl: c[4]
      };
    });
    render();
  });

function render() {
  grid.innerHTML = "";
  recruits
    .filter(r => classFilter === "All" || r.classYear.includes(classFilter))
    .filter(r => r.name.toLowerCase().includes(search.value.toLowerCase()))
    .forEach(r => {
      grid.innerHTML += `
      <div class="recruit-card">
        <img src="${r.photo}" class="recruit-photo"
             onerror="this.src='images/placeholder.png'">
        <h3>${r.name}</h3>
        <p>${r.position}</p>
        <p>Class of ${r.classYear}</p>
        <div class="icons">
          ${r.twitter ? `<a href="https://twitter.com/${r.twitter.replace("@","")}" target="_blank">X</a>` : ""}
          ${r.hudl ? `<a href="${r.hudl}" target="_blank">Hudl</a>` : ""}
        </div>
      </div>`;
    });
}

search.oninput = render;
document.querySelectorAll(".filters button").forEach(b => {
  b.onclick = () => {
    document.querySelectorAll(".filters button").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    classFilter = b.dataset.class;
    render();
  };
});