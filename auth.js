/* =======================
   SERRA AUTH SYSTEM
   Passwords:
   - Recruiting Portal (Recruits/View Recruits): SerraFB!
   - Admin: SerraAdmin!
   ======================= */

(() => {
  const COACH_KEY = "serra_coach_logged_in_v2";
  const ADMIN_KEY = "serra_admin_logged_in_v2";

  // Set your passwords here:
  const COACH_PASSWORD = "SerraFB!";
  const ADMIN_PASSWORD = "SerraAdmin!";

  function normalize(p) {
    return (p || "").trim();
  }

  function coachLogin(pass) {
    if (normalize(pass) !== COACH_PASSWORD) return { ok: false, message: "Incorrect password." };
    localStorage.setItem(COACH_KEY, "true");
    return { ok: true };
  }

  function adminLogin(pass) {
    if (normalize(pass) !== ADMIN_PASSWORD) return { ok: false, message: "Incorrect password." };
    localStorage.setItem(ADMIN_KEY, "true");
    return { ok: true };
  }

  function isCoach() {
    return localStorage.getItem(COACH_KEY) === "true";
  }

  function isAdmin() {
    return localStorage.getItem(ADMIN_KEY) === "true";
  }

  function coachLogout() {
    localStorage.removeItem(COACH_KEY);
    window.location.href = "index.html";
  }

  function adminLogout() {
    localStorage.removeItem(ADMIN_KEY);
    window.location.href = "index.html";
  }

  // Protect a page (coach)
  function requireCoach({ redirect = "coach-login.html", next = "" } = {}) {
    if (isCoach()) return;
    const url = `${redirect}?next=${encodeURIComponent(next || location.pathname.split("/").pop() || "recruits.html")}`;
    window.location.href = url;
  }

  // Protect a page (admin)
  function requireAdmin({ redirect = "admin-login.html", next = "" } = {}) {
    if (isAdmin()) return;
    const url = `${redirect}?next=${encodeURIComponent(next || location.pathname.split("/").pop() || "admin.html")}`;
    window.location.href = url;
  }

  // Expose
  window.SerraAuth = {
    coachLogin,
    adminLogin,
    isCoach,
    isAdmin,
    requireCoach,
    requireAdmin,
    coachLogout,
    adminLogout
  };
})();