const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("grid");
const searchInput = document.getElementById("search");
const filterButtons = document.querySelectorAll(".filters button");

let recruits = [];
let activeClass = "All";

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.split("\n").slice(1);
    recruits = rows.map(r => {
      const cols = r.split(",");
      return {
        name: cols[0],
        position: cols[1],
        classYear: cols[2],
        height: cols[3],
        weight: cols[4],
        image: cols[5] || "images/placeholder.png",
        twitter: cols[6],
        hudl: cols[7]
      };
    });
    render();
  });

function render() {
  const term = searchInput.value.toLowerCase();
  grid.innerHTML = "";

  recruits
    .filter(r =>
      (activeClass === "All" || r.classYear === activeClass) &&
      (r.name.toLowerCase().includes(term) ||
       r.position.toLowerCase().includes(term))
    )
    .forEach(r => grid.appendChild(card(r)));
}

function card(r) {
  const el = document.createElement("div");
  el.className = "recruit-card";

  el.innerHTML = `
    <div class="photo-wrap">
      <img src="${r.image}" onerror="this.src='images/placeholder.png'" />
    </div>

    <h3>${r.name}</h3>
    <p class="pos">${r.position}</p>
    <p class="meta">Class of ${r.classYear}<br>${r.height} / ${r.weight}</p>

    <div class="icons">
      ${r.twitter ? `<a href="https://twitter.com/${clean(r.twitter)}" target="_blank">
        <img src="icons/twitter.svg"></a>` : ""}
      ${r.hudl ? `<a href="${r.hudl}" target="_blank">
        <img src="icons/hudl.svg"></a>` : ""}
    </div>

    <a class="profile-btn" href="profile.html?name=${encodeURIComponent(r.name)}">
      View Profile
    </a>
  `;
  return el;
}

function clean(v) {
  return v.replace("@","").replace("https://twitter.com/","");
}

searchInput.addEventListener("input", render);

filterButtons.forEach(btn => {
  btn.onclick = () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeClass = btn.dataset.class;
    render();
  };
});