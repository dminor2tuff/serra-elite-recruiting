const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("grid");
const search = document.getElementById("search");

let players = [];

/* CLEAN SOCIAL LINKS */
function cleanTwitter(v) {
  if (!v) return null;
  v = v.replace("@", "").trim();
  if (v.includes("twitter.com") || v.includes("x.com")) return v;
  return `https://twitter.com/${v}`;
}

function cleanHudl(v) {
  if (!v) return null;
  return v.startsWith("http") ? v : null;
}

/* LOAD CSV */
fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.split("\n").slice(1);
    players = rows
      .map(r => {
        const cols = r.split(",");
        return {
          name: cols[0],
          class: cols[1],
          position: cols[2],
          height: cols[3],
          hudl: cleanHudl(cols[4]),
          twitter: cleanTwitter(cols[5]),
          image: cols[6],
        };
      })
      .filter(p => p.name && p.image);
    render(players);
  });

/* RENDER */
function render(list) {
  grid.innerHTML = "";
  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" onerror="this.src='images/placeholder.png'">
      <h3>${p.name}</h3>
      <p>${p.position}</p>
      <p>Class of ${p.class}</p>
      <div class="icons">
        ${p.hudl ? `<a href="${p.hudl}" target="_blank"><img src="icons/hudl.svg"></a>` : ""}
        ${p.twitter ? `<a href="${p.twitter}" target="_blank"><img src="icons/twitter.svg"></a>` : ""}
      </div>
      <a class="profile" href="profile.html?name=${encodeURIComponent(p.name)}">View Profile</a>
    `;
    grid.appendChild(card);
  });
}

/* SEARCH */
search.addEventListener("input", e => {
  const v = e.target.value.toLowerCase();
  render(players.filter(p =>
    p.name.toLowerCase().includes(v) ||
    p.position.toLowerCase().includes(v)
  ));
});