const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("recruitsGrid");
const statusText = document.getElementById("status");
const classFilter = document.getElementById("classFilter");
const searchInput = document.getElementById("searchInput");

let allPlayers = [];

/* ===============================
   LOAD CSV
================================ */
Papa.parse(CSV_URL, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: results => {
    allPlayers = results.data;
    statusText.style.display = "none";
    renderPlayers();
  },
  error: () => {
    statusText.textContent = "Error loading recruits.";
  }
});

/* ===============================
   RENDER
================================ */
function renderPlayers() {
  grid.innerHTML = "";

  const selectedClass = classFilter.value;
  const search = searchInput.value.toLowerCase();

  const filtered = allPlayers.filter(p => {
    const year = (p.Class || "").toString();
    const name = (p.Name || "").toLowerCase();

    const classMatch =
      selectedClass === "All" || year === selectedClass;

    const searchMatch = name.includes(search);

    return classMatch && searchMatch;
  });

  if (filtered.length === 0) {
    statusText.style.display = "block";
    statusText.textContent = "No prospects found.";
    return;
  }

  statusText.style.display = "none";

  filtered.forEach(player => {
    grid.appendChild(createRecruitCard(player));
  });
}

/* ===============================
   CARD BUILDER
================================ */
function createRecruitCard(p) {
  const card = document.createElement("div");
  card.className = "recruit-card";

  const name = p.Name || "";
  const position = p.Position || p.Pos || "";
  const year = p.Class || "";

  const height =
    p.Height ||
    p.Ht ||
    p["Height (ft/in)"] ||
    "";

  const weight =
    p.Weight ||
    p.Wt ||
    p["Weight (lbs)"] ||
    "";

  const hudl = p.Hudl || p.HUDL || "";
  const twitter = p.Twitter || p.X || "";

  const writeup =
    p.WriteUp ||
    p.Writeup ||
    p.Evaluation ||
    p.Scouting ||
    p.Notes ||
    "";

  const img =
    p.ImageURL && p.ImageURL.startsWith("http")
      ? p.ImageURL
      : "images/placeholder.png";

  card.innerHTML = `
    <img src="${img}" class="recruit-photo" alt="${name}" />

    <h3>${name}</h3>

    <p class="meta">
      ${position} • Class of ${year}
    </p>

    <p class="measurements">
      ${height ? height : ""}${height && weight ? " / " : ""}${weight ? weight + " lbs" : ""}
    </p>

    ${writeup ? `<p class="writeup">${writeup}</p>` : ""}

    <div class="recruit-links">
      ${hudl ? `<a href="${hudl}" target="_blank">🎥 Hudl</a>` : ""}
      ${twitter ? `<a href="${twitter}" target="_blank">𝕏</a>` : ""}
    </div>
  `;

  return card;
}

/* ===============================
   EVENTS
================================ */
classFilter.addEventListener("change", renderPlayers);
searchInput.addEventListener("input", renderPlayers);