(function () {
  const COACH_PASSWORD = "Serra!"; // <-- CHANGE THIS anytime
  const KEY = "serraCoachAuthed";

  function login(pw) {
    if ((pw || "").trim() === COACH_PASSWORD) {
      sessionStorage.setItem(KEY, "1");
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(KEY);
  }

  function isCoach() {
    return sessionStorage.getItem(KEY) === "1";
  }

  function requireCoach() {
    if (isCoach()) return true;
    // preserve current page as next
    const next = encodeURIComponent(location.pathname.split("/").pop() || "recruits.html");
    location.href = `coach-login.html?next=${next}`;
    return false;
  }

  window.Auth = { login, logout, isCoach, requireCoach };
})();