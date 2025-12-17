const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.trim().split("\n");
    const headers = rows.shift().split(",");

    const grid = document.getElementById("recruitGrid");
    grid.innerHTML = "";

    rows.forEach(row => {
      // Handle quoted CSV safely
      const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
        ?.map(v => v.replace(/^"|"$/g, "")) || [];

      const name = values[0];
      const position = values[1];
      const year = values[2];
      const hudl = values[3];
      const twitter = values[4];
      const image = values[6];

      if (!name || !image) return;

      const card = document.createElement("div");
      card.className = "recruit-card";

      card.innerHTML = `
        <div class="img-wrap">
          <img src="${image}" alt="${name}">
        </div>
        <h3>${name}</h3>
        <p>${position} • Class of ${year}</p>
        <div class="icons">
          ${hudl ? `<a href="${hudl}" target="_blank">Hudl</a>` : ""}
          ${twitter ? `<a href="${twitter}" target="_blank">X</a>` : ""}
        </div>
      `;

      grid.appendChild(card);
    });
  })
  .catch(err => console.error("CSV Load Error:", err));