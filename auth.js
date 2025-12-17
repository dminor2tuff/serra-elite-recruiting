const COACH_PASSWORD = "SerraFB!";
const ADMIN_PASSWORD = "SerraAdmin!";

const COACH_KEY = "serra_coach_access";
const ADMIN_KEY = "serra_admin_access";

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
    alert("Incorrect password");
  }
}

function requireCoach() {
  if (localStorage.getItem(COACH_KEY) !== "true") {
    window.location.href = "coach-login.html";
  }
}

function logoutCoach() {
  localStorage.removeItem(COACH_KEY);
  window.location.href = "index.html";
}