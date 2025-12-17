/* ================================
   SERRA AUTH SYSTEM
   - Coach portal password: SerraFB!
   - Admin password: SerraAdmin!
   ================================ */

const COACH_KEY = "serra_coach_logged_in";
const ADMIN_KEY = "serra_admin_logged_in";

const COACH_PASSWORD = "SerraFB!";
const ADMIN_PASSWORD = "SerraAdmin!";

// --- helpers
function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}
function isCoachLoggedIn() {
  return localStorage.getItem(COACH_KEY) === "true";
}
function isAdminLoggedIn() {
  return localStorage.getItem(ADMIN_KEY) === "true";
}

function coachLogin(pw, nextUrl) {
  if ((pw || "").trim() === COACH_PASSWORD) {
    localStorage.setItem(COACH_KEY, "true");
    window.location.href = nextUrl || "recruits.html";
    return true;
  }
  alert("Incorrect password.");
  return false;
}

function adminLogin(pw, nextUrl) {
  if ((pw || "").trim() === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_KEY, "true");
    window.location.href = nextUrl || "admin.html";
    return true;
  }
  alert("Incorrect admin password.");
  return false;
}

function coachLogout() {
  localStorage.removeItem(COACH_KEY);
  window.location.href = "index.html";
}
function adminLogout() {
  localStorage.removeItem(ADMIN_KEY);
  window.location.href = "index.html";
}

// Guards
function requireCoach() {
  if (isCoachLoggedIn()) return;
  const next = encodeURIComponent(window.location.pathname.split("/").pop() || "recruits.html");
  window.location.href = `coach-login.html?next=${next}`;
}
function requireAdmin() {
  if (isAdminLoggedIn()) return;
  const next = encodeURIComponent(window.location.pathname.split("/").pop() || "admin.html");
  window.location.href = `admin-login.html?next=${next}`;
}

// Expose for inline calls if needed
window.Auth = {
  coachLogin,
  adminLogin,
  requireCoach,
  requireAdmin,
  coachLogout,
  adminLogout,
  isCoachLoggedIn,
  isAdminLoggedIn
};

// Auto-wire forms if present
document.addEventListener("DOMContentLoaded", () => {
  const coachForm = document.getElementById("coachLoginForm");
  if (coachForm) {
    coachForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const pw = (document.getElementById("coachPassword") || {}).value || "";
      const next = qs("next") || "recruits.html";
      coachLogin(pw, next);
    });
  }

  const adminForm = document.getElementById("adminLoginForm");
  if (adminForm) {
    adminForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const pw = (document.getElementById("adminPassword") || {}).value || "";
      const next = qs("next") || "admin.html";
      adminLogin(pw, next);
    });
  }

  // logout buttons (optional)
  const coachOut = document.querySelectorAll("[data-coach-logout]");
  coachOut.forEach(btn => btn.addEventListener("click", coachLogout));

  const adminOut = document.querySelectorAll("[data-admin-logout]");
  adminOut.forEach(btn => btn.addEventListener("click", adminLogout));
});