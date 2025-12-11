// ===== CONFIG =====
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const COACH_PASSWORD = "Serrafb";

// ===== LOGIN HELPERS =====
function requireCoachLogin() {
  if (localStorage.getItem("serraCoachLoggedIn") !== "true") {
    window.location.href = "coach-login.html";
  }
}

function initCoachLoginPage() {
  const form = document.getElementById("coachLoginForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const pw = document.getElementById("coachPassword").value.trim();
    const errorEl = document.getElementById("coachLoginError");

    if (pw === COACH_PASSWORD) {
      localStorage.setItem("serraCoachLoggedIn", "true");
      window.location.href = "recruits.html";
    } else {
      errorEl.textContent = "Incorrect password.";
    }
  });
}

function initLogoutButton() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    localStorage.removeItem("serraCoachLoggedIn");
    window.location.href = "coach-login.html";
  });
}

// ===== CSV PARSER =====
function parseCSV(text) {
  const rows = [];
  let current = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        value += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      current.push(value);
      value = "";
    } else if ((c === "\n" || c === "\r") && !inQuotes) {
      if (value !== "" || current.length) {
        current.push(value);
        rows.push(current);
        current = [];
        value = "";
      }
    } else {
      value += c;
    }
  }
  if (value !== "" || current.length) {
    current.push(value);
    rows.push(current);
  }
  return rows;
}

// ===== LOAD PLAYERS =====
async function loadPlayers() {
  const response = await fetch(CSV_URL);
  const text = await response.text();
  const rows = parseCSV(text.trim());
  if (!rows.length) return [];

  const headers = rows.shift().map((h) => h.trim());
  const players = rows
    .filter((row) => row.length && row[0].trim() !== "")
    .map((row) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] ? row[i].trim() : "";
      });
      return obj;
    });

  return players;
}

// ===== RECRUITS PAGE =====
let allPlayers = [];
let currentClassFilter = "All";

function renderRecruits(list) {
  const grid = document.getElementById("recruitsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  list.forEach((p) => {
    const img =
      p.ImageURL && p.ImageURL.startsWith("http")
        ? p.ImageURL
        : "images/placeholder_player.png";

    const metaLine = `${p.Position || ""}${
      p.Class ? " • Class of " + p.Class : ""
    }`;

    const gpaText = p.GPA ? `GPA: ${p.GPA}` : "";
    const statusText = p.Status ? `Status: ${p.Status}` : "";

    const details = [gpaText, statusText].filter(Boolean).join(" • ");

    grid.innerHTML += `
      <div class="player-card">
        <img src="${img}" alt="${p.Name}" onerror="this.src='images/placeholder_player.png'">
        <h3>${p.Name}</h3>
        <p class="meta">${metaLine}</p>
        ${
          details
            ? `<p class="small"><span class="tag">${details}</span></p>`
            : ""
        }
        <a class="btn-card" href="profile.html?name=${encodeURIComponent(
          p.Name
        )}">View Profile</a>
      </div>
    `;
  });
}

function initRecruitsPage() {
  const grid = document.getElementById("recruitsGrid");
  if (!grid) return;

  requireCoachLogin();

  loadPlayers().then((players) => {
    allPlayers = players;
    renderRecruits(allPlayers);
  });

  const searchBox = document.getElementById("searchBox");
  if (searchBox) {
    searchBox.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = allPlayers.filter(
        (p) =>
          (p.Name || "").toLowerCase().includes(term) ||
          (p.Position || "").toLowerCase().includes(term)
      );
      renderRecruits(filtered);
    });
  }

  const filterButtons = document.querySelectorAll(
    ".filters button[data-class]"
  );
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const cls = btn.getAttribute("data-class");
      currentClassFilter = cls;
      let list = allPlayers;
      if (cls !== "All") {
        list = allPlayers.filter((p) => p.Class === cls);
      }
      renderRecruits(list);
    });
  });
}

// ===== PROFILE PAGE =====
function initProfilePage() {
  const card = document.getElementById("profileCard");
  if (!card) return;

  requireCoachLogin();

  const params = new URLSearchParams(window.location.search);
  const targetName = params.get("name");
  if (!targetName) {
    card.innerHTML =
      "<p>No player selected. Go back to the <a href='recruits.html'>recruits page</a>.</p>";
    return;
  }

  loadPlayers().then((players) => {
    const player = players.find((p) => p.Name === targetName);
    if (!player) {
      card.innerHTML =
        "<p>Player not found. Go back to the <a href='recruits.html'>recruits page</a>.</p>";
      return;
    }

    document.getElementById("playerName").textContent = player.Name;
    document.getElementById("playerPosition").textContent =
      player.Position || "";
    document.getElementById("playerClass").textContent =
      player.Class || "";
    document.getElementById("playerHW").textContent =
      player.HeightWeight || "";
    document.getElementById("playerGPA").textContent = player.GPA || "N/A";
    document.getElementById("playerBio").textContent =
      player.Writeup || "";

    document.getElementById("playerOffers").textContent =
      player.Offers || "N/A";
    document.getElementById("playerStatus").textContent =
      player.Status || "Available";
    document.getElementById("playerCollege").textContent =
      player.College || "TBD";

    // Photo
    const imgUrl =
      player.ImageURL && player.ImageURL.startsWith("http")
        ? player.ImageURL
        : "images/placeholder_player.png";
    const photoEl = document.getElementById("playerPhoto");
    photoEl.src = imgUrl;
    photoEl.onerror = () => {
      photoEl.src = "images/placeholder_player.png";
    };

    // HUDL
    if (player.HUDL && player.HUDL.startsWith("http")) {
      const hudlBtn = document.getElementById("hudlLink");
      hudlBtn.href = player.HUDL;
      hudlBtn.style.display = "inline-block";
    }

    // Twitter
    if (player.Twitter && player.Twitter.startsWith("http")) {
      const twBtn = document.getElementById("twitterLink");
      twBtn.href = player.Twitter;
      twBtn.style.display = "inline-block";
    }

    // College logo
    if (player.CollegeLogo && player.CollegeLogo.startsWith("http")) {
      const logo = document.getElementById("collegeLogo");
      logo.src = player.CollegeLogo;
      logo.style.display = "block";
    }
  });
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  initCoachLoginPage();
  initLogoutButton();
  initRecruitsPage();
  initProfilePage();
});