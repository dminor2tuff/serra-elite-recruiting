/* =======================
   SERRA AUTH (simple gate)
   Coach Portal: SerraFB!
   Admin: SerraAdmin!
   ======================= */

const AUTH = (() => {
  const COACH_KEY = "serra_coach_logged_in";
  const ADMIN_KEY = "serra_admin_logged_in";

  const COACH_PASSWORD = "SerraFB!";
  const ADMIN_PASSWORD = "SerraAdmin!";

  function isCoach() { return localStorage.getItem(COACH_KEY) === "true"; }
  function isAdmin() { return localStorage.getItem(ADMIN_KEY) === "true"; }

  function coachLogin(pass){
    if ((pass || "").trim() === COACH_PASSWORD){
      localStorage.setItem(COACH_KEY, "true");
      return true;
    }
    return false;
  }

  function adminLogin(pass){
    if ((pass || "").trim() === ADMIN_PASSWORD){
      localStorage.setItem(ADMIN_KEY, "true");
      return true;
    }
    return false;
  }

  function coachLogout(){
    localStorage.removeItem(COACH_KEY);
  }
  function adminLogout(){
    localStorage.removeItem(ADMIN_KEY);
  }

  function requireCoach(nextUrlIfNot){
    if (isCoach()) return true;
    // bounce to coach-login with next
    const next = encodeURIComponent(nextUrlIfNot || window.location.href.split("#")[0]);
    window.location.href = `coach-login.html?next=${next}`;
    return false;
  }

  function requireAdmin(nextUrlIfNot){
    if (isAdmin()) return true;
    const next = encodeURIComponent(nextUrlIfNot || window.location.href.split("#")[0]);
    window.location.href = `admin.html?next=${next}`;
    return false;
  }

  // ===== Modal Gate (used on index + buttons) =====
  function openGate({title="Enter Recruiting Portal", onSubmit}){
    const back = document.getElementById("authModalBackdrop");
    const t = document.getElementById("authModalTitle");
    const input = document.getElementById("authModalInput");
    const err = document.getElementById("authModalErr");

    if (!back || !t || !input || !err){
      alert("Auth modal is missing on this page. Please paste index.html fully.");
      return;
    }
    t.textContent = title;
    err.style.display = "none";
    input.value = "";
    back.style.display = "flex";
    input.focus();

    const submit = () => {
      const ok = onSubmit(input.value);
      if (ok){
        back.style.display = "none";
      } else {
        err.style.display = "block";
        err.textContent = "Incorrect password. Please try again.";
        input.focus();
        input.select();
      }
    };

    // wire buttons
    const btnGo = document.getElementById("authModalGo");
    const btnCancel = document.getElementById("authModalCancel");
    const btnClose = document.getElementById("authModalClose");

    btnGo.onclick = submit;
    btnCancel.onclick = () => (back.style.display="none");
    btnClose.onclick = () => (back.style.display="none");
    input.onkeydown = (e) => { if (e.key === "Enter") submit(); };
  }

  return {
    isCoach, isAdmin,
    coachLogin, adminLogin,
    coachLogout, adminLogout,
    requireCoach, requireAdmin,
    openGate
  };
})();

window.AUTH = AUTH;