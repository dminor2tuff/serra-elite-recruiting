const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("recruitsGrid");
const classFilter = document.getElementById("classFilter");
const searchInput = document.getElementById("searchInput");

Papa.parse(SHEET_URL, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function (results) {
    const players = results.data;

    populateClassFilter(players);
    renderPlayers(players);

    classFilter.addEventListener("change", () =>
      filterPlayers(players)
    );
    searchInput.addEventListener("input", () =>
      filterPlayers(players)
    );
  },
  error: function (err) {
    console.error("CSV Load Error:", err);
    grid.innerHTML = "<p>Error loading recruits.</p>";
  }
});

// ==============================
// FILTERS
// ==============================
function populateClassFilter(players) {
  const years = [...new Set(players.map(p => p.Class))].sort();
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
    const matchesYear = year === "All" || p.Class === year;
    const matchesName = p.Name.toLowerCase().includes(term);
    return matchesYear && matchesName;
  });

  renderPlayers(filtered);
}

// ==============================
// RENDER CARDS
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
        src="${p.ImageURL}" 
        class="recruit-photo"
        onerror="this.src='images/serra_logo.png'"
      />

      <h3>${p.Name}</h3>

      <p class="recruit-meta">
        ${p.Position} • Class of ${p.Class}<br>
        ${p.Height} / ${p.Weight} lbs
      </p>

      ${p.WriteUp ? `<p class="recruit-writeup">${p.WriteUp}</p>` : ""}

      <div class="recruit-links">
        ${p.Hudl ? `<a href="${p.Hudl}" target="_blank">Hudl</a>` : ""}
        ${p.Twitter ? `<a href="${p.Twitter}" target="_blank">X</a>` : ""}
      </div>
    `;

    grid.appendChild(card);
  });
}