const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

fetch(SHEET_URL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.split("\n").slice(1);
    const grid = document.getElementById("recruitsGrid");

    rows.forEach(row => {
      const cols = row.split(",");

      const name = cols[0];
      const position = cols[1];
      const height = cols[2];
      const weight = cols[3];
      const grad = cols[4];
      const image = cols[5];
      const hudl = cols[6];
      const twitter = cols[7];

      if (!name || !image) return;

      const card = document.createElement("div");
      card.className = "recruit-card";

      card.innerHTML = `
        <div class="photo-wrap">
          <img src="${image}" alt="${name}">
        </div>

        <h3>${name}</h3>
        <p>${position} | ${height}, ${weight}</p>
        <p>Class of ${grad}</p>

        <div class="icons">
          ${hudl ? `<a href="${hudl}" target="_blank"><img src="icons/hudl.svg"></a>` : ""}
          ${twitter ? `<a href="${twitter}" target="_blank"><img src="icons/twitter-x.svg"></a>` : ""}
        </div>
      `;

      grid.appendChild(card);
    });
  });