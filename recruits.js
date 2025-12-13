const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/YOUR_SHEET_ID/pub?output=csv";

const grid = document.getElementById("recruitsGrid");
let allPlayers = [];

fetch(SHEET_URL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.split("\n").slice(1);
    allPlayers = rows.map(r => {
      const c = r.split(",");
      return {
        name: c[0],
        position: c[1],
        classYear: c[2],
        height: c[3],
        weight: c[4],
        image: c[5],
        twitter: cleanTwitter(c[6]),
        hudl: c[7],
        slug: c[8]
      };
    });
    render(allPlayers);
  });

function render(players) {
  grid.innerHTML = "";
  players.forEach(p => {
    grid.innerHTML += `
      <div class="player-card">
        <img class="player-photo"
             src="${p.image || 'images/placeholder.png'}"
             onerror="this.src='images/placeholder.png'">

        <div class="player-info">
          <h3>${p.name}</h3>
          <div class="meta">
            ${p.position}<br>
            Class of ${p.classYear}<br>
            ${p.height} / ${p.weight}
          </div>
        </div>

        <div class="player-actions">
          ${p.twitter ? `
            <a class="icon-btn" href="${p.twitter}" target="_blank">
              <img src="icons/twitter.svg">
            </a>` : ""}

          ${p.hudl ? `
            <a class="icon-btn" href="${p.hudl}" target="_blank">
              <img src="icons/hudl.svg">
            </a>` : ""}

          <a class="icon-btn" href="profile.html?player=${p.slug}">
            <img src="icons/profile.svg">
          </a>
        </div>
      </div>
    `;
  });
}

function cleanTwitter(val) {
  if (!val) return "";
  val = val.replace("@", "").replace("https://twitter.com/", "");
  return "https://twitter.com/" + val;
}

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.onclick = () => {
    const year = btn.dataset.class;
    if (year === "All") render(allPlayers);
    else render(allPlayers.filter(p => p.classYear === year));
  };
});