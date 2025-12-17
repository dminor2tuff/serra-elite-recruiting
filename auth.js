/* ===============================
   SIMPLE AUTH SYSTEM
   =============================== */

const COACH_KEY = "serra_coach_auth";
const COACH_PASSWORD = "Serra!";

/* Login */
function coachLogin(password) {
  if (password === COACH_PASSWORD) {
    localStorage.setItem(COACH_KEY, "true");
    const next = new URLSearchParams(window.location.search).get("next");
    window.location.href = next || "recruits.html";
  } else {
    alert("Incorrect password");
  }
}

/* Require Coach */
function requireCoach() {
  if (localStorage.getItem(COACH_KEY) !== "true") {
    window.location.href = "coach-login.html";
  }
}

/* Logout */
function coachLogout() {
  localStorage.removeItem(COACH_KEY);
  window.location.href = "index.html";
}

/* Expose globally */
window.Auth = {
  login: coachLogin,
  requireCoach,
  logout: coachLogout
};