// ================= AUTH CONFIG =================
const COACH_PASSWORD = "SerraFB!";
const ADMIN_PASSWORD = "SerraAdmin!";

const COACH_KEY = "serra_coach_auth";
const ADMIN_KEY = "serra_admin_auth";

// ================= LOGIN =================
function coachLogin() {
  const pw = document.getElementById("password").value;
  if (pw === COACH_PASSWORD) {
    localStorage.setItem(COACH_KEY, "true");
    window.location.href = "recruits.html";
  } else {
    alert("Incorrect password");
  }
}

function adminLogin() {
  const pw = document.getElementById("password").value;
  if (pw === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_KEY, "true");
    window.location.href = "admin.html";
  } else {
    alert("Incorrect admin password");
  }
}

// ================= GUARDS =================
function requireCoach() {
  if (localStorage.getItem(COACH_KEY) !== "true") {
    window.location.href = "coach-login.html";
  }
}

function requireAdmin() {
  if (localStorage.getItem(ADMIN_KEY) !== "true") {
    window.location.href = "admin-login.html";
  }
}

// ================= LOGOUT =================
function logoutCoach() {
  localStorage.removeItem(COACH_KEY);
  window.location.href = "index.html";
}

function logoutAdmin() {
  localStorage.removeItem(ADMIN_KEY);
  window.location.href = "index.html";
}