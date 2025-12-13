const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("grid");
const searchInput = document.getElementById("search");
const filterButtons = document.querySelectorAll(".filters button");

let players = [];
let activeClass = "All";

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.split("\n").slice(1);
    players = rows.map(row => {
      const cols = row.split(",");

      return {
        name: cols[0],
        position: cols[1],
        classYear: cols[2],
        height: cols[3],
        weight: cols[4],
        image: cols[5] || "images/placeholder.png",
        twitter: cleanTwitter(cols[6]),
        hudl: cols[7],
        profile: `profile.html?name=${encodeURIComponent(cols[0])}`
      };
    });

    render();
  });

function cleanTwitter(val) {
  if (!val) return "";
  val = val.replace("@", "").replace("https://twitter.com/", "").replace("https://x.com/", "");
  return `https://twitter.com/${val}`;
}

function render() {
  grid.innerHTML = "";

  const search = searchInput.value.toLowerCase();

  players
    .filter(p =>
      (activeClass === "All" || p.classYear === activeClass) &&
      (p.name.toLowerCase().includes(search) ||
        p.position.toLowerCase().includes(search))
    )
    .forEach(p => {
      grid.innerHTML += `
        <div class="card">
          <div class="img-wrap">
            <img src="${p.image}" onerror="this.src='images/placeholder.png'" />
          </div>

          <h3>${p.name}</h3>
          <p class="meta">${p.position}</p>
          <p class="meta">Class of ${p.classYear}</p>
          <p class="meta">${p.height} / ${p.weight} lbs</p>

          <div class="icons">
            ${p.twitter ? `<a href="${p.twitter}" target="_blank"><img src="icons/twitter.svg"></a>` : ""}
            ${p.hudl ? `<a href="${p.hudl}" target="_blank"><img src="icons/hudl.svg"></a>` : ""}
          </div>

          <a href="${p.profile}" class="btn">View Profile</a>
        </div>
      `;
    });
}

searchInput.addEventListener("input", render);

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeClass = btn.dataset.class;
    render();
  });
});