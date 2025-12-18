const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

fetch(CSV_URL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.split("\n").slice(1);
    const grid = document.getElementById("recruitGrid");

    rows.forEach(row => {
      const cols = row.match(/(".*?"|[^",]+)(?=,|$)/g)?.map(v =>
        v.replace(/^"|"$/g, "")
      );
      if (!cols) return;

      const name = cols[0];
      const position = cols[2];
      const year = cols[1];
      const hudl = cols[4];
      const twitter = cols[7];
      const image = cols[6];

      const imgSrc =
        image && image.startsWith("http")
          ? image
          : "images/placeholder.png";

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${imgSrc}" class="recruit-photo">
        <h3>${name}</h3>
        <p>${position} • Class of ${year}</p>
        <div class="recruit-links">
          ${hudl ? `<a href="${hudl}" target="_blank"><img src="icons/hudl.svg"></a>` : ""}
          ${twitter ? `<a href="${twitter}" target="_blank"><img src="icons/twitter-x.svg"></a>` : ""}
        </div>
      `;

      grid.appendChild(card);
    });
  });