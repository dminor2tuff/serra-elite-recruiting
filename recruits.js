const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("recruitGrid");
const classFilter = document.getElementById("classFilter");
const searchInput = document.getElementById("searchInput");

let players = [];

// Load CSV
fetch(SHEET_URL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.split("\n").slice(1);

    players = rows
      .map(row => {
        const cols = row.split(",");

        return {
          name: cols[0]?.trim(),
          classYear: cols[1]?.trim(),
          position: cols[2]?.trim(),
          heightWeight: cols[3]?.trim(),
          hudl: cols[4]?.trim(),
          writeup: cols[5]?.trim(),
          image: cols[6]?.trim(),
          twitter: cols[7]?.trim(),
          gpa: cols[8]?.trim()
        };
      })
      .filter(p => p.name);

    renderPlayers();
  })
  .catch(err => {
    grid.innerHTML = "<p style='color:white'>Failed to load recruits.</p>";
    console.error(err);
  });

function renderPlayers() {
  grid.innerHTML = "";

  const classVal = classFilter.value;
  const searchVal = searchInput.value.toLowerCase();

  players
    .filter(p => {
      const matchClass = classVal === "all" || p.classYear === classVal;
      const matchSearch = p.name.toLowerCase().includes(searchVal);
      return matchClass && matchSearch;
    })
    .forEach(player => {
      const card = document.createElement("div");
      card.className = "recruit-card";

      const imgSrc = player.image
        ? player.image
        : "images/placeholder.png";

      card.innerHTML = `
        <img src="${imgSrc}" alt="${player.name}" 
             onerror="this.src='images/placeholder.png'">

        <h3>${player.name}</h3>
        <div class="meta">${player.position} · Class of ${player.classYear}</div>
        <div class="meta">${player.heightWeight}</div>

        <div class="links">
          ${player.hudl ? `<a href="${player.hudl}" target="_blank">Hudl</a>` : ""}
          ${player.twitter ? `<a href="${formatTwitter(player.twitter)}" target="_blank">Twitter</a>` : ""}
        </div>
      `;

      grid.appendChild(card);
    });
}

function formatTwitter(handle) {
  if (handle.startsWith("http")) return handle;
  return `https://twitter.com/${handle.replace("@", "")}`;
}

classFilter.addEventListener("change", renderPlayers);
searchInput.addEventListener("input", renderPlayers);