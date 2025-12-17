const CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

let players = [];

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.split("\n").slice(1);
    players = rows.map(r => {
      const c = r.split(",");
      return {
        name: c[0],
        position: c[1],
        classYear: c[2],
        height: c[3],
        weight: c[4],
        photo: c[5],
        hudl: c[6],
        twitter: c[7]
      };
    });
    render(players);
  });

function render(list) {
  const grid = document.getElementById("recruitsGrid");
  grid.innerHTML = "";
  list.forEach(p => {
    grid.innerHTML += `
      <div class="card">
        <img src="${p.photo}" onerror="this.src='images/placeholder.png'">
        <h3>${p.name}</h3>
        <p>${p.position} | Class of ${p.classYear}</p>
        <p>${p.height} / ${p.weight}</p>
        <div class="icons">
          <a href="${p.hudl}" target="_blank">🎥</a>
          <a href="${p.twitter}" target="_blank">🐦</a>
        </div>
      </div>
    `;
  });
}

function filterClass(year) {
  if (year === "All") render(players);
  else render(players.filter(p => p.classYear === year));
}