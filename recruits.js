const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("recruitGrid");
const classFilter = document.getElementById("classFilter");
const searchInput = document.getElementById("searchInput");

let players = [];

// Proper CSV parser
function parseCSV(text) {
  const rows = [];
  let row = [];
  let inQuotes = false;
  let value = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"' && text[i + 1] === '"') {
      value += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
    } else if (char === "\n" && !inQuotes) {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  row.push(value);
  rows.push(row);
  return rows;
}

// Load data
fetch(SHEET_URL)
  .then(r => r.text())
  .then(text => {
    const data = parseCSV(text).slice(1);

    players = data.map(c => ({
      name: c[0],
      classYear: c[1],
      position: c[2],
      heightWeight: c[3],
      hudl: c[4],
      writeup: c[5],
      image: c[6],
      twitter: c[7],
      gpa: c[8]
    })).filter(p => p.name);

    renderPlayers();
  });

function renderPlayers() {
  grid.innerHTML = "";
  const classVal = classFilter.value;
  const searchVal = searchInput.value.toLowerCase();

  players
    .filter(p =>
      (classVal === "all" || p.classYear === classVal) &&
      p.name.toLowerCase().includes(searchVal)
    )
    .forEach(p => {
      const card = document.createElement("div");
      card.className = "recruit-card";
      card.onclick = () => openProfile(p);

      card.innerHTML = `
        <div class="photo-wrap">
          <img src="${p.image || 'images/placeholder.png'}"
               onerror="this.src='images/placeholder.png'">
        </div>
        <h3>${p.name}</h3>
        <div class="meta">${p.position} · Class of ${p.classYear}</div>
        <div class="meta">${p.heightWeight}</div>
      `;

      grid.appendChild(card);
    });
}

// Profile modal
function openProfile(p) {
  profileImg.src = p.image || "images/placeholder.png";
  profileName.textContent = p.name;
  profileMeta.textContent = `${p.position} · Class of ${p.classYear}`;
  profileHW.textContent = `Height / Weight: ${p.heightWeight || "—"}`;
  profileGPA.textContent = `GPA: ${p.gpa || "—"}`;
  profileWriteup.textContent = p.writeup || "Scouting report coming soon.";

  profileHudl.style.display = p.hudl ? "inline-block" : "none";
  profileHudl.href = p.hudl || "#";

  profileTwitter.style.display = p.twitter ? "inline-block" : "none";
  profileTwitter.href = formatTwitter(p.twitter);

  profileModal.classList.remove("hidden");
}

function closeProfile() {
  profileModal.classList.add("hidden");
}

function formatTwitter(v) {
  if (!v) return "#";
  if (v.startsWith("http")) return v;
  return `https://twitter.com/${v.replace("@", "")}`;
}

classFilter.addEventListener("change", renderPlayers);
searchInput.addEventListener("input", renderPlayers);