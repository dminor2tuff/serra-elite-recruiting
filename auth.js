(function () {
  // CHANGE THESE:
  const COACH_PASSWORD = "Serra!";
  const ADMIN_PASSWORD = "SerraAdmin!";

  const KEY_COACH = "serraCoachAuthed";
  const KEY_ADMIN = "serraAdminAuthed";

  function loginCoach(pw) {
    if ((pw || "").trim() === COACH_PASSWORD) {
      sessionStorage.setItem(KEY_COACH, "1");
      return true;
    }
    return false;
  }

  function loginAdmin(pw) {
    if ((pw || "").trim() === ADMIN_PASSWORD) {
      sessionStorage.setItem(KEY_ADMIN, "1");
      return true;
    }
    return false;
  }

  function logoutAdmin() { sessionStorage.removeItem(KEY_ADMIN); }
  function logoutCoach() { sessionStorage.removeItem(KEY_COACH); }

  function isCoach() { return sessionStorage.getItem(KEY_COACH) === "1"; }
  function isAdmin() { return sessionStorage.getItem(KEY_ADMIN) === "1"; }

  function requireCoach() {
    if (isCoach()) return true;
    const next = encodeURIComponent(location.pathname.split("/").pop() || "recruits.html");
    location.href = `coach-login.html?next=${next}`;
    return false;
  }

  function requireAdmin() {
    if (isAdmin()) return true;
    const next = encodeURIComponent(location.pathname.split("/").pop() || "admin.html");
    location.href = `admin-login.html?next=${next}`;
    return false;
  }

  window.Auth = { loginCoach, loginAdmin, logoutAdmin, logoutCoach, isCoach, isAdmin, requireCoach, requireAdmin };
})();