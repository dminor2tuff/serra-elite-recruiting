// ✅ CSV link (your published CSV)
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

// 🔐 Coach password (change if you want)
const COACH_PASSWORD = "SerraCavs2026!";

function isAuthed(){
  return localStorage.getItem("serra_coach_auth") === "yes";
}
function requireAuth(){
  if(!isAuthed()){
    window.location.href = "coach-login.html?next=" + encodeURIComponent(window.location.pathname.split("/").pop() || "recruits.html");
  }
}
function logout(){
  localStorage.removeItem("serra_coach_auth");
  window.location.href = "index.html";
}

// --- CSV parsing helpers ---
function csvToRows(csvText){
  // Basic CSV parser that handles commas in quotes
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for(let i=0;i<csvText.length;i++){
    const ch = csvText[i];
    const next = csvText[i+1];

    if(ch === '"' && inQuotes && next === '"'){
      cur += '"'; i++;
      continue;
    }
    if(ch === '"'){
      inQuotes = !inQuotes;
      continue;
    }
    if(ch === "," && !inQuotes){
      row.push(cur); cur = "";
      continue;
    }
    if((ch === "\n" || ch === "\r") && !inQuotes){
      if(ch === "\r" && next === "\n"){ i++; }
      row.push(cur); cur = "";
      // ignore empty last line
      if(row.some(cell => cell.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }
    cur += ch;
  }
  row.push(cur);
  if(row.some(cell => cell.trim() !== "")) rows.push(row);
  return rows;
}

function normalizeUrl(u){
  if(!u) return "";
  let s = (""+u).trim();
  if(!s) return "";
  // allow @username for twitter and convert
  if(s.startsWith("@")) s = "https://twitter.com/" + s.slice(1);
  // allow x.com
  if(s.includes("x.com/")) s = s.replace("x.com/", "twitter.com/");
  if(!s.startsWith("http")) s = "https://" + s;
  return s;
}

function mapPlayers(rows){
  // Expected headers:
  // Name, Class, Position, HeightWeight, HUDL, Writeup, ImageURL, Twitter, GPA, Offers, Status, College, CollegeLogo
  const header = rows[0].map(h => (h||"").trim());
  const idx = Object.fromEntries(header.map((h,i)=>[h,i]));

  const get = (r, key) => (idx[key] != null ? (r[idx[key]] ?? "") : "");

  return rows.slice(1).map(r => {
    const p = {
      Name: (get(r,"Name")||"").trim(),
      Class: (get(r,"Class")||"").trim(),
      Position: (get(r,"Position")||"").trim(),
      HeightWeight: (get(r,"HeightWeight")||"").trim(),
      HUDL: normalizeUrl(get(r,"HUDL")),
      Writeup: (get(r,"Writeup")||"").trim(),
      ImageURL: normalizeUrl(get(r,"ImageURL")),
      Twitter: normalizeUrl(get(r,"Twitter")),
      GPA: (get(r,"GPA")||"").trim(),
      Offers: (get(r,"Offers")||"").trim(),
      Status: (get(r,"Status")||"").trim(),
      College: (get(r,"College")||"").trim(),
      CollegeLogo: normalizeUrl(get(r,"CollegeLogo")),
    };
    // fallback image
    if(!p.ImageURL) p.ImageURL = "images/placeholder_player.png";
    return p;
  }).filter(p => p.Name);
}

async function fetchPlayers(){
  const res = await fetch(CSV_URL, {cache:"no-store"});
  const txt = await res.text();
  const rows = csvToRows(txt);
  if(rows.length < 2) return [];
  return mapPlayers(rows);
}

// --- Recruits page render ---
function slugify(name){
  return encodeURIComponent((name||"").trim().toLowerCase());
}

function buildCard(player){
  const safeName = player.Name || "";
  const profileLink = `profile.html?name=${slugify(safeName)}`;

  return `
  <div class="player-card">
    <div class="player-photo">
      <img src="${player.ImageURL}" alt="${safeName}" loading="lazy"
           onerror="this.onerror=null;this.src='images/placeholder_player.png';" />
    </div>
    <div class="player-body">
      <p class="player-name">${safeName}</p>
      <p class="player-meta"><strong>${player.Position || ""}</strong></p>
      <p class="player-meta">${player.Class ? ("Class of " + player.Class) : ""}</p>
      <p class="player-meta">${player.HeightWeight || ""}</p>

      <div class="social-icons">
        ${player.Twitter ? `
          <a href="${player.Twitter}" target="_blank" rel="noopener" aria-label="Twitter">
            <img src="icons/twitter.svg" alt="Twitter">
          </a>` : ""}

        ${player.HUDL ? `
          <a href="${player.HUDL}" target="_blank" rel="noopener" aria-label="Hudl">
            <img src="icons/hudl.svg" alt="Hudl">
          </a>` : ""}
      </div>

      <a class="card-btn" href="${profileLink}">View Profile</a>
    </div>
  </div>`;
}

function classMatches(player, cls){
  if(cls === "All") return true;
  return (player.Class||"").trim() === cls;
}

function textMatches(player, q){
  if(!q) return true;
  const hay = `${player.Name} ${player.Position} ${player.Class}`.toLowerCase();
  return hay.includes(q.toLowerCase());
}

async function initRecruitsPage(){
  requireAuth();

  const grid = document.getElementById("grid");
  const search = document.getElementById("search");
  const pills = document.querySelectorAll(".pill");
  const count = document.getElementById("count");

  let players = [];
  let activeClass = "All";

  try{
    players = await fetchPlayers();
  }catch(e){
    console.error(e);
    grid.innerHTML = `<div class="card"><b>Could not load recruits.</b><div class="notice">Check that your Google Sheet is published and the CSV link is correct.</div></div>`;
    return;
  }

  function render(){
    const q = (search.value||"").trim();
    const filtered = players.filter(p => classMatches(p, activeClass) && textMatches(p, q));
    grid.innerHTML = filtered.map(buildCard).join("");
    if(count) count.textContent = `${filtered.length} recruits`;
  }

  pills.forEach(p=>{
    p.addEventListener("click", ()=>{
      pills.forEach(x=>x.classList.remove("active"));
      p.classList.add("active");
      activeClass = p.dataset.cls;
      render();
    });
  });

  search.addEventListener("input", render);

  render();
}

async function initProfilePage(){
  requireAuth();

  const params = new URLSearchParams(window.location.search);
  const name = (params.get("name") || "").toLowerCase();
  const wrap = document.getElementById("profile");

  let players = [];
  try{
    players = await fetchPlayers();
  }catch(e){
    wrap.innerHTML = `<div class="card"><b>Could not load player profile.</b></div>`;
    return;
  }

  const player = players.find(p => (p.Name||"").trim().toLowerCase() === name) || players.find(p => slugify(p.Name).toLowerCase() === name);
  if(!player){
    wrap.innerHTML = `<div class="card"><b>Player not found.</b><div class="notice">Go back and select a player again.</div></div>`;
    return;
  }

  wrap.innerHTML = `
    <div class="profile-wrap">
      <div class="profile-photo">
        <img src="${player.ImageURL}" alt="${player.Name}" onerror="this.onerror=null;this.src='images/placeholder_player.png';" />
      </div>
      <div class="profile-panel">
        <h2>${player.Name}</h2>

        <div class="profile-kv">
          <div class="kv"><div class="k">Class</div><div class="v">${player.Class || ""}</div></div>
          <div class="kv"><div class="k">Position</div><div class="v">${player.Position || ""}</div></div>
          <div class="kv"><div class="k">Height / Weight</div><div class="v">${player.HeightWeight || ""}</div></div>
          <div class="kv"><div class="k">GPA</div><div class="v">${player.GPA || ""}</div></div>
        </div>

        <div class="social-icons" style="justify-content:flex-start;">
          ${player.Twitter ? `
            <a href="${player.Twitter}" target="_blank" rel="noopener" aria-label="Twitter">
              <img src="icons/twitter.svg" alt="Twitter">
            </a>` : ""}

          ${player.HUDL ? `
            <a href="${player.HUDL}" target="_blank" rel="noopener" aria-label="Hudl">
              <img src="icons/hudl.svg" alt="Hudl">
            </a>` : ""}
        </div>

        ${player.Offers ? `<div class="notice"><b>Offers:</b> ${player.Offers}</div>` : ""}
        ${player.Status ? `<div class="notice"><b>Status:</b> ${player.Status}</div>` : ""}
        ${player.College ? `<div class="notice"><b>College:</b> ${player.College}</div>` : ""}

        <div class="writeup">${player.Writeup || ""}</div>

        <div class="actions" style="margin-top:14px;">
          <a class="btn" href="recruits.html">Back to Recruits</a>
          <a class="btn" href="#" onclick="logout();return false;">Log Out</a>
        </div>
      </div>
    </div>
  `;
}

// Expose logout for inline use
window.logout = logout;

// Auto-run based on page
document.addEventListener("DOMContentLoaded", ()=>{
  const page = (document.body.dataset.page || "").trim();
  if(page === "recruits") initRecruitsPage();
  if(page === "profile") initProfilePage();
});