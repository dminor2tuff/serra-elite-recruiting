const AUTH = (() => {
  const COACH_KEY = "serra_coach";
  const ADMIN_KEY = "serra_admin";

  const COACH_PASS = "SerraFB!";
  const ADMIN_PASS = "SerraAdmin!";

  function coachLogin(p){
    if(p === COACH_PASS){
      localStorage.setItem(COACH_KEY,"1");
      return true;
    }
    return false;
  }

  function adminLogin(p){
    if(p === ADMIN_PASS){
      localStorage.setItem(ADMIN_KEY,"1");
      return true;
    }
    return false;
  }

  function isCoach(){ return localStorage.getItem(COACH_KEY)==="1"; }
  function isAdmin(){ return localStorage.getItem(ADMIN_KEY)==="1"; }

  function requireCoach(){
    if(!isCoach()) location.href="coach-login.html";
  }

  return {coachLogin,adminLogin,isCoach,isAdmin,requireCoach};
})();