const CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("grid");
const search = document.getElementById("search");
const filterButtons = document.querySelectorAll(".filters button");

let players = [];
let activeClass = "All";

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.trim().split("\n").map(r => r.split(","));
    const headers = rows.shift();

    players = rows.map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h.trim()] = (row[i] || "").trim());
      return obj;
    });

    render();
  });

function render() {
  grid.innerHTML = "";

  players
    .filter(p =>
      (activeClass === "All" || p.Class === activeClass) &&
      (`${p.Name} ${p.Position}`.toLowerCase()
        .includes(search.value.toLowerCase()))
    )
    .forEach(p => {
      grid.innerHTML += `
        <div class="recruit-card">
          <div class="image-crop">
            <img src="images/${p.Image || "placeholder.png"}">
          </div>

          <h3>${p.Name}</h3>
          <p class="pos">${p.Position}</p>
          <p class="meta">Class of ${p.Class}</p>
          <p class="meta">${p.Height} / ${p.Weight} lbs</p>

          <div class="icons">
            ${p.Twitter ? `<a href="https://twitter.com/${p.Twitter.replace("@","")}" target="_blank"><i class="fab fa-twitter"></i></a>` : ""}
            ${p.Hudl ? `<a href="${p.Hudl}" target="_blank"><i class="fas fa-football"></i></a>` : ""}
          </div>

          <button onclick="viewProfile('${p.Name}')">View Profile</button>
        </div>
      `;
    });
}

search.addEventListener("input", render);

filterButtons.forEach(btn => {
  btn.onclick = () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeClass = btn.dataset.class;
    render();
  };
});

window.viewProfile = function(name) {
  window.location.href = `profile.html?player=${encodeURIComponent(name)}`;
};