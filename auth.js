const PASSWORD = "Serrafb";

function login() {
  const input = document.getElementById("password").value;
  if (input === PASSWORD) {
    localStorage.setItem("serra_auth", "true");
    window.location.href = "recruits.html";
  } else {
    alert("Incorrect password");
  }
}

function protectPage() {
  if (!localStorage.getItem("serra_auth")) {
    window.location.href = "coach-login.html";
  }
}

function logout() {
  localStorage.removeItem("serra_auth");
  window.location.href = "index.html";
}