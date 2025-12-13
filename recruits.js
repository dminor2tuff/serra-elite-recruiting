const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("grid");

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.split("\n").slice(1);
    rows.forEach(r => {
      const c = r.split(",");
      if (!c[0]) return;

      const twitter = c[8]
        ? (c[8].includes("twitter") ? c[8] : `https://twitter.com/${c[8].replace("@","")}`)
        : "";

      grid.innerHTML += `
        <div class="card">
          <img class="player-img" src="${c[7] || 'images/placeholder.png'}">
          <h3>${c[0]}</h3>
          <p>${c[1]} • Class of ${c[2]}</p>
          <p>${c[3]} / ${c[4]}</p>
          <div class="socials">
            ${twitter ? `<a href="${twitter}" target="_blank"><img src="icons/twitter.svg"></a>` : ""}
            ${c[9] ? `<a href="${c[9]}" target="_blank"><img src="icons/hudl.svg"></a>` : ""}
          </div>
        </div>
      `;
    });
  });