const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("grid");
const searchInput = document.getElementById("search");
const filterButtons = document.querySelectorAll(".class-filters button");

let recruits = [];
let activeClass = "all";

/* ---------- HELPERS ---------- */

function normalizeTwitter(value) {
  if (!value) return "";
  let v = value.trim().replace("@", "");
  if (!v.startsWith("http")) {
    v = "https://twitter.com/" + v;
  }
  return v;
}

function normalizeHudl(value) {
  if (!value) return "";
  return value.startsWith("http") ? value : "";
}

function imagePath(value) {
  if (!value) return "images/placeholder.png";
  if (value.startsWith("http")) return value;
  return "images/" + value;
}

/* ---------- RENDER ---------- */

function render() {
  grid.innerHTML = "";
  const q = searchInput.value.toLowerCase();

  recruits
    .filter(r =>
      (activeClass === "all" || r.Class === activeClass) &&
      (r.Name.toLowerCase().includes(q) ||
        r.Position.toLowerCase().includes(q))
    )
    .forEach(r => {
      const card = document.createElement("div");
      card.className = "recruit-card";

      card.innerHTML = `
        <div class="image-crop">
          <img src="${imagePath(r.Image)}" alt="${r.Name}">
        </div>

        <h3>${r.Name}</h3>
        <p class="position">${r.Position}</p>
        <p class="meta">Class of ${r.Class}</p>
        <p class="meta">${r.Height} / ${r.Weight} lbs</p>

        <div class="socials">
          ${
            r.Twitter
              ? `<a href="${normalizeTwitter(r.Twitter)}" target="_blank">
                  <i class="fab fa-twitter"></i>
                </a>`
              : ""
          }
          ${
            r.Hudl
              ? `<a href="${normalizeHudl(r.Hudl)}" target="_blank">
                  <i class="fas fa-football"></i>
                </a>`
              : ""
          }
        </div>

        <button onclick="viewProfile('${encodeURIComponent(
          r.Name
        )}')">View Profile</button>
      `;

      grid.appendChild(card);
    });
}

window.viewProfile = function (name) {
  window.location.href = `profile.html?player=${name}`;
};

/* ---------- LOAD CSV ---------- */

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.trim().split("\n").map(r => r.split(","));
    const headers = rows.shift();

    recruits = rows.map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h.trim()] = (row[i] || "").trim();
      });
      return obj;
    });

    render();
  });

/* ---------- EVENTS ---------- */

searchInput.addEventListener("input", render);

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeClass = btn.dataset.class;
    render();
  });
});