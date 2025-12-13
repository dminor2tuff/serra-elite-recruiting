const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("grid");
const searchEl = document.getElementById("search");
const filtersEl = document.getElementById("filters");

let all = [];
let activeClass = "All";

function slugify(name){
  return (name||"").toLowerCase().trim().replace(/’/g,"'").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}

function fixTwitter(val){
  if(!val) return "";
  let v = String(val).trim();
  v = v.replace(/^@/,"");
  v = v.replace("https://x.com/","");
  v = v.replace("https://twitter.com/","");
  v = v.replace("http://twitter.com/","");
  v = v.replace("x.com/","");
  v = v.replace("twitter.com/","");
  if(!v) return "";
  return `https://twitter.com/${v}`;
}

function fixHudl(val){
  if(!val) return "";
  const v = String(val).trim();
  return v.startsWith("http") ? v : "";
}

function val(x){ return (x ?? "").toString().trim(); }

function matches(p,q){
  if(!q) return true;
  const s = q.toLowerCase();
  return (
    p.Name.toLowerCase().includes(s) ||
    p.Position.toLowerCase().includes(s) ||
    p.Class.toLowerCase().includes(s)
  );
}

function render(){
  const q = (searchEl.value||"").trim();
  grid.innerHTML = "";

  const list = all
    .filter(p => activeClass === "All" || p.Class === activeClass)
    .filter(p => matches(p,q));

  list.forEach(p => {
    const slug = slugify(p.Name);
    const img = p.ImageURL || "images/placeholder.png";
    const hudl = fixHudl(p.HUDL);
    const tw = fixTwitter(p.Twitter);

    const card = document.createElement("div");
    card.className = "recruit-card";
    card.innerHTML = `
      <div class="img-wrap">
        <img src="${img}" alt="${p.Name}" onerror="this.onerror=null;this.src='images/placeholder.png';">
      </div>

      <h3 class="name">${p.Name}</h3>
      <p class="meta"><strong>${p.Position || ""}</strong></p>
      <p class="meta">Class of ${p.Class || ""} • ${p.HeightWeight || ""}</p>

      <div class="icon-row">
        ${tw ? `<a href="${tw}" target="_blank" rel="noopener" title="Twitter/X"><i class="fa-brands fa-x-twitter"></i></a>` : ``}
        ${hudl ? `<a href="${hudl}" target="_blank" rel="noopener" title="Hudl"><i class="fa-solid fa-football"></i></a>` : ``}
      </div>

      <a class="btn primary card-btn" href="profile.html?player=${encodeURIComponent(slug)}">View Profile</a>
    `;
    grid.appendChild(card);
  });
}

filtersEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-class]");
  if(!btn) return;
  activeClass = btn.dataset.class;
  [...filtersEl.querySelectorAll("button")].forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  render();
});

searchEl.addEventListener("input", render);

Papa.parse(CSV_URL, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: (res) => {
    all = (res.data || [])
      .map(r => ({
        Name: val(r.Name),
        Class: val(r.Class),
        Position: val(r.Position),
        HeightWeight: val(r.HeightWeight),
        HUDL: val(r.HUDL),
        Twitter: val(r.Twitter),
        ImageURL: val(r.ImageURL),
        Writeup: val(r.Writeup),
        GPA: val(r.GPA),
        Offers: val(r.Offers),
        Status: val(r.Status),
        College: val(r.College),
        CollegeLogo: val(r.CollegeLogo || r.CollegeLogoURL)
      }))
      .filter(p => p.Name);

    render();
  }
});