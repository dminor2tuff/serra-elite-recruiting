const CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("grid");
const search = document.getElementById("search");
const filters = document.querySelectorAll(".filters button");

let players = [];
let activeClass = "All";

/* UTIL */
function clean(v=""){
  return v.replace(/"/g,"").trim();
}
function twitterLink(v){
  if(!v) return "";
  return v.includes("http") ? v : `https://twitter.com/${v.replace("@","")}`;
}
function hudlLink(v){
  if(!v) return "";
  return v.startsWith("http") ? v : "";
}

/* LOAD CSV */
fetch(CSV_URL)
.then(r=>r.text())
.then(text=>{
  const rows = text.split("\n").slice(1);
  players = rows.map(r=>{
    const c = r.split(",");
    return {
      name: clean(c[0]),
      class: clean(c[1]),
      pos: clean(c[2]),
      htwt: clean(c[3]),
      hudl: hudlLink(clean(c[4])),
      img: clean(c[6]),
      twitter: twitterLink(clean(c[7]))
    };
  });
  render();
});

/* RENDER */
function render(){
  grid.innerHTML="";
  players
  .filter(p=> activeClass==="All" || p.class===activeClass)
  .filter(p=> p.name.toLowerCase().includes(search.value.toLowerCase())
           || p.pos.toLowerCase().includes(search.value.toLowerCase()))
  .forEach(p=>{
    grid.innerHTML += `
    <div class="card">
      <div class="card-img">
        <img src="${p.img || 'images/placeholder_player.png'}"
             onerror="this.src='images/placeholder_player.png'">
      </div>
      <h3>${p.name}</h3>
      <p>${p.pos}</p>
      <p>Class of ${p.class}</p>
      <p>${p.htwt}</p>
      <div class="icons">
        ${p.hudl ? `<a href="${p.hudl}" target="_blank"><i class="fas fa-football"></i></a>`:""}
        ${p.twitter ? `<a href="${p.twitter}" target="_blank"><i class="fab fa-x-twitter"></i></a>`:""}
      </div>
      <a class="view" href="profile.html?name=${encodeURIComponent(p.name)}">
        View Profile
      </a>
    </div>`;
  });
}

/* EVENTS */
search.addEventListener("input",render);
filters.forEach(b=>{
  b.onclick=()=>{
    filters.forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    activeClass=b.dataset.class;
    render();
  };
});