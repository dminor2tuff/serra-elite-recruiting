const PASSWORD = "Serra!";
const KEY = "serraAuth";

function login(pw) {
  if (pw === PASSWORD) {
    sessionStorage.setItem(KEY, "1");
    return true;
  }
  return false;
}

function requireCoach() {
  if (!sessionStorage.getItem(KEY)) {
    location.href = "coach-login.html?next=recruits.html";
  }
}

window.Auth = { login, requireCoach };