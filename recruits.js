const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("grid");
const searchInput = document.getElementById("search");
const filterButtons = document.querySelectorAll(".filters button");

let recruits = [];
let activeClass = "All";

/* -----------------------------
   Helpers
--------------------------------*/

function clean(str = "") {
  return str.trim();
}

function twitterUrl(val) {
  if (!val) return "";
  let v = val.replace("@", "").trim();
  if (v.includes("twitter.com") || v.includes("x.com")) return v;
  return `https://twitter.com/${v}`;
}

function hudlUrl(val) {
  if (!val) return "";
  return val.startsWith("http") ? val : "";
}

/* -----------------------------
   Load CSV
--------------------------------*/

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.split("\n").slice(1);
    recruits = rows.map(r => r.split(","));
    render();
  });

/* -----------------------------
   Render Cards
--------------------------------*/

function render() {
  grid.innerHTML = "";

  recruits.forEach(c => {
    const name = clean(c[0]);
    const classYear = clean(c[1]);
    const position = clean(c[2]);
    const heightWeight = clean(c[3]);
    const hudl = hudlUrl(c[4]);
    const img = clean(c[6]);
    const twitter = twitterUrl(c[7]);

    if (!name) return;
    if (activeClass !== "All" && classYear !== activeClass) return;
    if (
      !name.toLowerCase().includes(searchInput.value.toLowerCase()) &&
      !position.toLowerCase().includes(searchInput.value.toLowerCase())
    ) return;

    grid.innerHTML += `
      <div class="recruit-card">

        <div class="img-wrap">
          <img
            src="${img || "images/placeholder.png"}"
            onerror="this.src='images/placeholder.png'"
            alt="${name}"
          />
        </div>

        <h3>${name}</h3>
        <p class="pos">${position}</p>
        <p class="meta">Class of ${classYear}</p>
        <p class="meta">${heightWeight}</p>

        <div class="icons">
          ${hudl ? `<a href="${hudl}" target="_blank">
            <img src="icons/hudl.svg" alt="Hudl">
          </a>` : ""}

          ${twitter ? `<a href="${twitter}" target="_blank">
            <img src="icons/twitter.svg" alt="Twitter">
          </a>` : ""}
        </div>

        <a class="btn"
          href="profile.html
          ?name=${encodeURIComponent(name)}
          &pos=${encodeURIComponent(position)}
          &class=${encodeURIComponent(classYear)}
          &img=${encodeURIComponent(img)}">
          View Profile
        </a>
      </div>
    `;
  });
}

/* -----------------------------
   Events
--------------------------------*/

searchInput.addEventListener("input", render);

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeClass = btn.dataset.class;
    render();
  });
});