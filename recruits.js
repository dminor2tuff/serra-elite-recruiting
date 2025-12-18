const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.trim().split("\n");
    rows.shift(); // remove header row

    const grid = document.getElementById("recruitGrid");
    grid.innerHTML = "";

    rows.forEach(row => {
      const values =
        row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(v =>
          v.replace(/^"|"$/g, "")
        ) || [];

      const name = values[0];
      const position = values[1];
      const year = values[2];
      let hudl = values[3];
      let twitter = values[4];
      const image = values[6];

      if (!name || !image) return;

      // ✅ FIX HUDL LINKS
      if (hudl && !hudl.startsWith("http")) {
        hudl = "https://www.hudl.com/" + hudl.replace(/^\/+/, "");
      }

      // ✅ FIX TWITTER LINKS
      if (twitter && !twitter.startsWith("http")) {
        twitter = "https://twitter.com/" + twitter.replace("@", "");
      }

      const card = document.createElement("div");
      card.className = "recruit-card";

      card.innerHTML = `
        <div class="img-wrap">
          <img src="${image}" alt="${name}">
        </div>

        <h3>${name}</h3>
        <p>${position} • Class of ${year}</p>

        <div class="icons">
          ${
            hudl
              ? `<a href="${hudl}" target="_blank" aria-label="Hudl">
                   <img src="icons/hudl.svg" alt="Hudl">
                 </a>`
              : ""
          }

          ${
            twitter
              ? `<a href="${twitter}" target="_blank" aria-label="Twitter">
                   <img src="icons/x.svg" alt="Twitter">
                 </a>`
              : ""
          }
        </div>
      `;

      grid.appendChild(card);
    });
  })
  .catch(err => console.error("Recruit sync error:", err));