/* ============================
   SERRA AUTH SYSTEM
============================ */

const COACH_PASSWORD = "SerraFB!";
const ADMIN_PASSWORD = "SerraAdmin!";

const COACH_KEY = "serra_coach_logged_in";
const ADMIN_KEY = "serra_admin_logged_in";

/* ===== LOGIN FUNCTIONS ===== */

function coachLogin() {
  const input = document.getElementById("password");
  if (!input) return;

  if (input.value === COACH_PASSWORD) {
    localStorage.setItem(COACH_KEY, "true");
    const params = new URLSearchParams(window.location.search);
    window.location.href = params.get("next") || "recruits.html";
  } else {
    alert("Incorrect password");
  }
}

function adminLogin() {
  const input = document.getElementById("password");
  if (!input) return;

  if (input.value === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_KEY, "true");
    window.location.href = "admin.html";
  } else {
    alert("Incorrect admin password");
  }
}

/* ===== PAGE GUARDS ===== */

function requireCoach() {
  if (localStorage.getItem(COACH_KEY) !== "true") {
    window.location.href = "coach-login.html?next=recruits.html";
  }
}

function requireAdmin() {
  if (localStorage.getItem(ADMIN_KEY) !== "true") {
    window.location.href = "admin-login.html";
  }
}

/* ===== LOGOUT ===== */

function coachLogout() {
  localStorage.removeItem(COACH_KEY);
  window.location.href = "index.html";
}

function adminLogout() {
  localStorage.removeItem(ADMIN_KEY);
  window.location.href = "index.html";
}