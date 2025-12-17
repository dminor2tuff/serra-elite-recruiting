const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.split("\n").slice(1);
    const grid = document.getElementById("recruitGrid");

    rows.forEach(row => {
      const cols = row.split(",");
      if (!cols[0]) return;

      const card = document.createElement("div");
      card.className = "recruit-card";

      card.innerHTML = `
        <img src="${cols[6]}" class="player-img">
        <h3>${cols[0]}</h3>
        <p>${cols[1]} • Class of ${cols[2]}</p>
        <div class="icons">
          <a href="${cols[3]}" target="_blank">HUDL</a>
          <a href="${cols[4]}" target="_blank">X</a>
        </div>
      `;

      grid.appendChild(card);
    });
  });