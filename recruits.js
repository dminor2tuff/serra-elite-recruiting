const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => render(parseCSV(text)));

function parseCSV(text) {
  const rows = text.split("\n").slice(1);
  return rows.map(r => {
    const c = r.split(",");
    return {
      name: c[0],
      classYear: c[1],
      position: c[2],
      heightWeight: c[3],
      hudl: c[4],
      image: c[6],
      twitter: c[7]
    };
  });
}

function render(players) {
  const grid = document.getElementById("recruitsGrid");
  grid.innerHTML = "";

  players.forEach(p => {
    if (!p.name) return;

    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const imgSrc = p.image?.startsWith("http")
      ? p.image
      : "images/placeholder_player.png";

    grid.innerHTML += `
      <div class="card">
        <div class="photo-wrap">
          <img src="${imgSrc}" onerror="this.src='images/placeholder_player.png'">
        </div>

        <h3>${p.name}</h3>
        <div class="meta">${p.position}</div>
        <div class="meta">Class of ${p.classYear}</div>
        <div class="meta">${p.heightWeight}</div>

        <div class="links">
          ${p.twitter ? `<a href="${p.twitter}" target="_blank"><i class="fa-brands fa-x-twitter"></i></a>` : ""}
          ${p.hudl ? `<a href="${p.hudl}" target="_blank"><i class="fa-solid fa-football"></i></a>` : ""}
        </div>

        <button onclick="location.href='profile.html?player=${slug}'">View Profile</button>
      </div>
    `;
  });
}
