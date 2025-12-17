const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("recruitGrid");
const classFilter = document.getElementById("classFilter");
const searchInput = document.getElementById("searchInput");

let players = [];

// Fetch roster
fetch(SHEET_URL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.split("\n").slice(1);

    players = rows
      .map(row => {
        const c = row.split(",");

        return {
          name: c[0]?.trim(),
          classYear: c[1]?.trim(),
          position: c[2]?.trim(),
          heightWeight: c[3]?.trim(),
          hudl: c[4]?.trim(),
          writeup: c[5]?.trim(),
          image: c[6]?.trim(),
          twitter: c[7]?.trim(),
          gpa: c[8]?.trim()
        };
      })
      .filter(p => p.name);

    renderPlayers();
  })
  .catch(() => {
    grid.innerHTML =
      "<p style='color:#fff'>Unable to load recruits at this time.</p>";
  });

function renderPlayers() {
  grid.innerHTML = "";

  const classVal = classFilter.value;
  const searchVal = searchInput.value.toLowerCase();

  players
    .filter(p => {
      const matchClass =
        classVal === "all" || p.classYear === classVal;
      const matchSearch =
        p.name.toLowerCase().includes(searchVal);
      return matchClass && matchSearch;
    })
    .forEach(p => {
      const card = document.createElement("div");
      card.className = "recruit-card";

      const imgSrc = p.image
        ? p.image
        : "images/placeholder.png";

      card.innerHTML = `
        <div class="photo-wrap">
          <img src="${imgSrc}" alt="${p.name}"
               onerror="this.src='images/placeholder.png'">
        </div>

        <h3>${p.name}</h3>
        <div class="meta">
          ${p.position} · Class of ${p.classYear}
        </div>
        <div class="meta">${p.heightWeight}</div>

        <div class="icons">
          ${p.hudl ? `
            <a href="${p.hudl}" target="_blank" title="Hudl">
              🏈
            </a>` : ""}

          ${p.twitter ? `
            <a href="${formatTwitter(p.twitter)}" target="_blank" title="Twitter">
              🐦
            </a>` : ""}
        </div>
      `;

      grid.appendChild(card);
    });
}

function formatTwitter(val) {
  if (!val) return "";
  if (val.startsWith("http")) return val;
  return `https://twitter.com/${val.replace("@", "")}`;
}

classFilter.addEventListener("change", renderPlayers);
searchInput.addEventListener("input", renderPlayers);