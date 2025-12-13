const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("grid");
const searchEl = document.getElementById("search");
const filterButtons = document.querySelectorAll("#filters button");

let players = [];
let activeClass = "all";

/* ---------- HELPERS ---------- */

function cleanTwitter(val) {
  if (!val) return "";
  let v = val.trim().replace("@", "");
  if (!v.startsWith("http")) {
    v = "https://twitter.com/" + v;
  }
  return v;
}

function cleanHudl(val) {
  if (!val) return "";
  return val.startsWith("http") ? val : "";
}

function getImage(img) {
  if (!img) return "images/placeholder.png";
  if (img.startsWith("http")) return img;
  return "images/" + img;
}

/* ---------- RENDER ---------- */

function render() {
  grid.innerHTML = "";

  const q = searchEl.value.toLowerCase();

  players
    .filter(p =>
      (activeClass === "all" || p.Class === activeClass) &&
      (p.Name.toLowerCase().includes(q) ||
       p.Position.toLowerCase().includes(q))
    )
    .forEach(p => {
      const card = document.createElement("div");
      card.className = "recruit-card";

      card.innerHTML = `
        <div class="img-wrap">
          <img src="${getImage(p.Image)}" alt="${p.Name}">
        </div>

        <h3>${p.Name}</h3>
        <p class="pos">${p.Position}</p>
        <p>Class of ${p.Class}</p>
        <p>${p.Height} / ${p.Weight} lbs</p>

        <div class="icons">
          ${p.Twitter ? `<a href="${cleanTwitter(p.Twitter)}" target="_blank"><i class="fab fa-twitter"></i></a>` : ""}
          ${p.Hudl ? `<a href="${cleanHudl(p.Hudl)}" target="_blank"><i class="fas fa-football"></i></a>` : ""}
        </div>

        <button onclick="viewProfile('${encodeURIComponent(p.Name)}')">
          View Profile
        </button>
      `;

      grid.appendChild(card);
    });
}

window.viewProfile = function(name) {
  window.location.href = `profile.html?player=${name}`;
};

/* ---------- LOAD CSV ---------- */

fetch(CSV_URL)
  .then(r => r.text())
  .then(text => {
    const rows = text.split("\n").map(r => r.split(","));
    const headers = rows.shift();

    players = rows.map(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h.trim()] = (r[i] || "").trim());
      return obj;
    });

    render();
  });

/* ---------- EVENTS ---------- */

searchEl.addEventListener("input", render);

filterButtons.forEach(btn => {
  btn.onclick = () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeClass = btn.dataset.class;
    render();
  };
});