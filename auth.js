/* ===============================
   SERRA AUTH SYSTEM (COACH + ADMIN)
   =============================== */

const COACH_KEY = "serra_coach_logged_in";
const ADMIN_KEY = "serra_admin_logged_in";

const COACH_PASSWORD = "SerraFB!";
const ADMIN_PASSWORD = "SerraAdmin!";

/* ===============================
   COACH LOGIN
   =============================== */
function coachLogin(password) {
  if (password === COACH_PASSWORD) {
    localStorage.setItem(COACH_KEY, "true");

    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "recruits.html";

    window.location.href = next;
  } else {
    alert("Incorrect coach password.");
  }
}

/* ===============================
   ADMIN LOGIN
   =============================== */
function adminLogin(password) {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_KEY, "true");
    window.location.href = "admin.html";
  } else {
    alert("Incorrect admin password.");
  }
}

/* ===============================
   ACCESS GUARDS
   =============================== */
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

/* ===============================
   LOGOUTS
   =============================== */
function coachLogout() {
  localStorage.removeItem(COACH_KEY);
  window.location.href = "index.html";
}

function adminLogout() {
  localStorage.removeItem(ADMIN_KEY);
  window.location.href = "index.html";
}

/* ===============================
   GLOBAL EXPORT
   =============================== */
window.Auth = {
  coachLogin,
  adminLogin,
  requireCoach,
  requireAdmin,
  coachLogout,
  adminLogout
};