// ================= SERRA AUTH =================
const COACH_PASSWORD = "SerraFB!";
const AUTH_KEY = "serra_recruit_access";

// ================= LOGIN =================
function coachLogin() {
  const input = document.getElementById("password").value;

  if (input === COACH_PASSWORD) {
    localStorage.setItem(AUTH_KEY, "true");
    window.location.href = "recruits.html";
  } else {
    alert("Incorrect password");
  }
}

// ================= GUARD =================
function requireRecruitAccess() {
  if (localStorage.getItem(AUTH_KEY) !== "true") {
    window.location.href = "coach-login.html";
  }
}

// ================= LOGOUT =================
function logoutCoach() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "index.html";
}