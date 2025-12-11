// ============ CONFIG ============
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const COACH_PASSWORD = "Serrafb";
const LOGIN_KEY = "serraCoachLoggedIn";

// ============ CSV PARSER ============
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

async function loadPlayers() {
  const res = await fetch(CSV_URL);
  const text = await res.text();
  const rows = parseCSV(text.trim());
  if (!rows.length) return [];

  const headers = rows.shift().map((h) => h.trim());
  return rows
    .filter((r) => r.length && r[0].trim() !== "")
    .map((row) => {
      const obj = {};
      headers.forEach((h, i) => (obj[h] = row[i] ? row[i].trim() : ""));
      return obj;
    });
}

// ============ LOGIN HELPERS ============
function requireCoachLogin() {
  if (localStorage.getItem(LOGIN_KEY) !== "true") {
    window.location.href = "coach-login.html";
  }
}

function initCoachLoginPage() {
  const form = document.getElementById("coachLoginForm");
  if (!form) return;

  const input = document.getElementById("coachPassword");
  const errorEl = document.getElementById("coachLoginError");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const pw = input.value.trim();
    if (pw === COACH_PASSWORD) {
      localStorage.setItem(LOGIN_KEY, "true");
      window.location.href = "recruits.html";
    } else {
      errorEl.textContent = "Incorrect password. Please try again.";
    }
  });
}

function initLogoutButton() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem(LOGIN_KEY);
    window.location.href = "coach-login.html";
  });
}

// ============ RECRUITS PAGE ============
let allPlayers = [];

function renderRecruits(list) {
  const grid = document.getElementById("recruitsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  list.forEach((p) => {
    const img =
      p.ImageURL && p.ImageURL.startsWith("http")
        ? p.ImageURL
        : "images/placeholder_player.png";

    const meta = `${p.Position || ""}${
      p.Class ? " • Class of " + p.Class : ""
    }`;
    const gpa = p.GPA ? `GPA: ${p.GPA}` : "";
    const status = p.Status ? `Status: ${p.Status}` : "";
    const details = [gpa, status].filter(Boolean).join(" • ");

    grid.innerHTML += `
      <article class="player-card">
        <img class="player-photo" src="${img}" alt="${
      p.Name
    }" onerror="this.src='images/placeholder_player.png'">
        <div class="player-name">${p.Name}</div>
        <div class="player-meta">${meta}</div>
        ${
          details
            ? `<div class="player-detail-line">${details}</div>`
            : ""
        }
        <a class="btn-card" href="profile.html?name=${encodeURIComponent(
          p.Name
        )}">View Profile</a>
      </article>
    `;
  });
}

function initRecruitsPage() {
  const grid = document.getElementById("recruitsGrid");
  if (!grid) return;

  requireCoachLogin();

  const searchBox = document.getElementById("searchBox");
  const filterButtons = document.querySelectorAll(".filter-btn[data-class]");

  loadPlayers().then((players) => {
    allPlayers = players;
    renderRecruits(allPlayers);
  });

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

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const cls = btn.getAttribute("data-class");
      let list = allPlayers;
      if (cls !== "All") list = allPlayers.filter((p) => p.Class === cls);
      renderRecruits(list);
    });
  });
}

// ============ PROFILE PAGE ============
function initProfilePage() {
  const card = document.getElementById("profileCard");
  if (!card) return;

  requireCoachLogin();

  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");
  if (!name) {
    card.innerHTML =
      "<p>No player selected. Return to the <a href='recruits.html'>recruits board</a>.</p>";
    return;
  }

  loadPlayers().then((players) => {
    const p = players.find((pl) => pl.Name === name);
    if (!p) {
      card.innerHTML =
        "<p>Player not found. Return to the <a href='recruits.html'>recruits board</a>.</p>";
      return;
    }

    document.getElementById("playerName").textContent = p.Name;
    document.getElementById("playerPosition").textContent = p.Position || "";
    document.getElementById("playerClass").textContent = p.Class || "";
    document.getElementById("playerHW").textContent = p.HeightWeight || "";
    document.getElementById("playerGPA").textContent = p.GPA || "N/A";

    document.getElementById("playerBio").textContent = p.Writeup || "";

    document.getElementById("playerOffers").textContent = p.Offers || "N/A";
    document.getElementById("playerStatus").textContent =
      p.Status || "Available";
    document.getElementById("playerCollege").textContent =
      p.College || "TBD";

    const img =
      p.ImageURL && p.ImageURL.startsWith("http")
        ? p.ImageURL
        : "images/placeholder_player.png";
    const photoEl = document.getElementById("playerPhoto");
    photoEl.src = img;
    photoEl.onerror = () => {
      photoEl.src = "images/placeholder_player.png";
    };

    if (p.HUDL && p.HUDL.startsWith("http")) {
      const hudlBtn = document.getElementById("hudlLink");
      hudlBtn.href = p.HUDL;
      hudlBtn.style.display = "inline-block";
    }

    if (p.Twitter && p.Twitter.startsWith("http")) {
      const twBtn = document.getElementById("twitterLink");
      twBtn.href = p.Twitter;
      twBtn.style.display = "inline-block";
    }

    if (p.CollegeLogo && p.CollegeLogo.startsWith("http")) {
      const logo = document.getElementById("collegeLogo");
      logo.src = p.CollegeLogo;
      logo.style.display = "block";
    }
  });
}

// ============ INIT ============
document.addEventListener("DOMContentLoaded", () => {
  initCoachLoginPage();
  initLogoutButton();
  initRecruitsPage();
  initProfilePage();
});