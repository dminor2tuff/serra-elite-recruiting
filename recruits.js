const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.split("\n").slice(1);
    const grid = document.getElementById("prospects");

    rows.forEach(r => {
      const cols = r.split(",");

      const name = cols[0];
      const position = cols[1];
      const year = cols[2];
      const image = cols[3];
      const hudl = cols[4];
      const twitter = cols[5];

      if (!name) return;

      const imgSrc = image?.startsWith("http")
        ? image
        : "images/placeholder.png";

      grid.innerHTML += `
        <div class="card">
          <img src="${imgSrc}" class="recruit-photo" />
          <h3>${name}</h3>
          <p>${year} • ${position}</p>

          <div class="recruit-links">
            ${hudl ? `
              <a href="${hudl}" target="_blank">
                <img src="icons/hudl.svg" />
              </a>` : ""}
            ${twitter ? `
              <a href="${twitter}" target="_blank">
                <img src="icons/twitter-x.svg" />
              </a>` : ""}
          </div>
        </div>
      `;
    });
  });