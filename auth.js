const PASSWORD = "Serrafb";

function login() {
  const val = (document.getElementById("password")?.value || "").trim();
  if (val === PASSWORD) {
    localStorage.setItem("serra_auth", "true");
    const next = new URLSearchParams(location.search).get("next") || "recruits.html";
    location.href = next;
  } else {
    alert("Incorrect password");
  }
}

function protectPage() {
  if (localStorage.getItem("serra_auth") !== "true") {
    location.href = "coach-login.html?next=" + encodeURIComponent(location.pathname.split("/").pop() || "recruits.html");
  }
}

function logout() {
  localStorage.removeItem("serra_auth");
  location.href = "index.html";
}