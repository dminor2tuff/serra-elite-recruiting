const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

document.addEventListener("DOMContentLoaded", () => {
  fetch(CSV_URL)
    .then(res => res.text())
    .then(csv => {
      const rows = csv.split("\n").slice(1);
      const grid = document.getElementById("recruitGrid");

      if (!grid) {
        console.error("❌ recruitGrid not found");
        return;
      }

      rows.forEach(row => {
        const cols = row.match(/(".*?"|[^",]+)(?=,|$)/g);
        if (!cols || !cols[0]) return;

        const name = cols[0].replace(/"/g, "");
        const year = cols[1];
        const position = cols[2];
        const heightWeight = cols[3];
        const hudl = cols[4];
        const writeup = cols[5];
        const image = cols[6];
        const twitter = cols[7];

        const imgSrc =
          image && image.startsWith("http")
            ? image
            : "images/placeholder.png";

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
          <img src="${imgSrc}" class="recruit-photo">

          <h3>${name}</h3>

          <p class="meta">
            ${position} • ${heightWeight} • Class of ${year}
          </p>

          ${writeup ? `<p class="writeup">${writeup}</p>` : ""}

          <div class="recruit-links">
            ${hudl ? `<a href="${hudl}" target="_blank">
              <img src="icons/hudl.svg">
            </a>` : ""}
            ${twitter ? `<a href="${twitter}" target="_blank">
              <img src="icons/twitter-x.svg">
            </a>` : ""}
          </div>
        `;

        grid.appendChild(card);
      });
    })
    .catch(err => console.error("❌ CSV fetch failed:", err));
});