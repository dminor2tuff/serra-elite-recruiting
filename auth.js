const COACH_PASS = "SerraFB!";
const ADMIN_PASS = "SerraAdmin!";

const COACH_KEY = "serra_coach";
const ADMIN_KEY = "serra_admin";

function promptPassword(expected, key, redirect) {
  const pw = prompt("Enter Password");
  if (pw === expected) {
    localStorage.setItem(key, "true");
    window.location.href = redirect;
  } else {
    alert("Incorrect password");
  }
}

const Auth = {
  requireCoach() {
    if (localStorage.getItem(COACH_KEY)) {
      window.location.href = "recruits.html";
    } else {
      promptPassword(COACH_PASS, COACH_KEY, "recruits.html");
    }
  },
  requireAdmin() {
    if (localStorage.getItem(ADMIN_KEY)) {
      return;
    } else {
      promptPassword(ADMIN_PASS, ADMIN_KEY, "admin.html");
    }
  }
};