const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("recruitGrid");
const classFilter = document.getElementById("classFilter");
const searchInput = document.getElementById("searchInput");

let players = [];

fetch(SHEET_URL)
  .then(r => r.text())
  .then(csv => {
    const rows = csv.split("\n").slice(1);

    players = rows.map(row => {
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
    }).filter(p => p.name);

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

/* ===== PROFILE MODAL ===== */

function openProfile(p) {
  document.getElementById("profileImg").src =
    p.image || "images/placeholder.png";

  document.getElementById("profileName").textContent = p.name;
  document.getElementById("profileMeta").textContent =
    `${p.position} · Class of ${p.classYear}`;
  document.getElementById("profileHW").textContent =
    `Height / Weight: ${p.heightWeight || "—"}`;
  document.getElementById("profileGPA").textContent =
    `GPA: ${p.gpa || "—"}`;
  document.getElementById("profileWriteup").textContent =
    p.writeup || "Scouting report coming soon.";

  const hudl = document.getElementById("profileHudl");
  hudl.style.display = p.hudl ? "inline-block" : "none";
  hudl.href = p.hudl || "#";

  const twitter = document.getElementById("profileTwitter");
  twitter.style.display = p.twitter ? "inline-block" : "none";
  twitter.href = formatTwitter(p.twitter);

  document.getElementById("profileModal").classList.remove("hidden");
}

function closeProfile() {
  document.getElementById("profileModal").classList.add("hidden");
}

function formatTwitter(val) {
  if (!val) return "#";
  if (val.startsWith("http")) return val;
  return `https://twitter.com/${val.replace("@", "")}`;
}

classFilter.addEventListener("change", renderPlayers);
searchInput.addEventListener("input", renderPlayers);