const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.split("\n").slice(1);
    const grid = document.getElementById("recruitGrid");

    rows.forEach(row => {
      const [name, position, gradClass, height, weight, photo, hudl, twitter] = row.split(",");

      if (!name) return;

      const card = document.createElement("div");
      card.className = "recruit-card";

      card.innerHTML = `
        <div class="photo">
          <img src="${photo}" alt="${name}" onerror="this.src='images/placeholder.png'">
        </div>
        <h3>${name}</h3>
        <p>${position}</p>
        <p>Class of ${gradClass}</p>
        <p>${height} / ${weight}</p>

        <div class="icons">
          ${hudl ? `<a href="${hudl}" target="_blank">🏈</a>` : ""}
          ${twitter ? `<a href="${twitter}" target="_blank">🐦</a>` : ""}
        </div>
      `;

      grid.appendChild(card);
    });
  })
  .catch(err => {
    console.error("Recruit load failed:", err);
  });