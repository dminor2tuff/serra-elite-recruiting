// auth.js
const SERRA_PASSWORD = "Serrafb"; // change anytime

function isAuthed() {
  return localStorage.getItem("serraAuth") === "true";
}

function requireAuth() {
  if (!isAuthed()) window.location.href = "login.html";
}

function doLogin() {
  const val = document.getElementById("password").value.trim();
  if (val === SERRA_PASSWORD) {
    localStorage.setItem("serraAuth", "true");
    const next = new URLSearchParams(window.location.search).get("next") || "recruits.html";
    window.location.href = next;
  } else {
    alert("Incorrect password");
  }
}

function logout() {
  localStorage.removeItem("serraAuth");
  window.location.href = "index.html";
}
