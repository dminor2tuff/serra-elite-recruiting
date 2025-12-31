// ==============================
// CONFIG
// ==============================
const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("recruitsGrid");
const classFilter = document.getElementById("classFilter");
const searchInput = document.getElementById("searchInput");

// ==============================
// LOAD CSV
// ==============================
fetch(SHEET_URL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.trim().split("\n").slice(1);
    const players = rows.map(r => {
      const cols = r.split(",");

      return {
        name: cols[0]?.trim(),
        position: cols[1]?.trim(),
        year: cols[2]?.trim(),
        height: cols[3]?.trim(),
        weight: cols[4]?.trim(),
        image: cols[5]?.trim(),
        hudl: cols[6]?.trim(),
        twitter: cols[7]?.trim(),
        writeup: cols[8]?.trim()
      };
    });

    populateClassFilter(players);
    renderPlayers(players);

    classFilter.addEventListener("change", () =>
      filterPlayers(players)
    );
    searchInput.addEventListener("input", () =>
      filterPlayers(players)
    );
  })
  .catch(err => {
    grid.innerHTML = "<p>Error loading recruits.</p>";
    console.error(err);
  });

// ==============================
// FILTERS
// ==============================
function populateClassFilter(players) {
  const years = [...new Set(players.map(p => p.year))].sort();
  years.forEach(y => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    classFilter.appendChild(opt);
  });
}

function filterPlayers(players) {
  const year = classFilter.value;
  const term = searchInput.value.toLowerCase();

  const filtered = players.filter(p => {
    const matchesYear = year === "All" || p.year === year;
    const matchesName = p.name.toLowerCase().includes(term);
    return matchesYear && matchesName;
  });

  renderPlayers(filtered);
}

// ==============================
// RENDER
// ==============================
function renderPlayers(players) {
  grid.innerHTML = "";

  if (!players.length) {
    grid.innerHTML = "<p>No prospects found.</p>";
    return;
  }

  players.forEach(p => {
    const card = document.createElement("div");
    card.className = "recruit-card";

    card.innerHTML = `
      <img 
        src="${p.image}" 
        class="recruit-photo"
        onerror="this.src='images/serra_logo.png'"
      >

      <h3>${p.name}</h3>

      <p class="recruit-meta">
        ${p.position} • Class of ${p.year}<br>
        ${p.height} / ${p.weight} lbs
      </p>

      ${
        p.writeup
          ? `<p class="recruit-writeup">${p.writeup}</p>`
          : ""
      }

      <div class="recruit-links">
        ${
          p.hudl
            ? `<a href="${p.hudl}" target="_blank" class="hudl">Hudl</a>`
            : ""
        }
        ${
          p.twitter
            ? `<a href="${p.twitter}" target="_blank" class="twitter">X</a>`
            : ""
        }
      </div>
    `;

    grid.appendChild(card);
  });
}