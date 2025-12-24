document.addEventListener("DOMContentLoaded", () => {
  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

  const grid = document.getElementById("recruitGrid");
  const loading = document.getElementById("loadingText");

  fetch(CSV_URL)
    .then(res => res.text())
    .then(csv => {
      const rows = [];
      let row = [];
      let cell = "";
      let inQuotes = false;

      for (let char of csv) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          row.push(cell.trim());
          cell = "";
        } else if (char === "\n" && !inQuotes) {
          row.push(cell.trim());
          rows.push(row);
          row = [];
          cell = "";
        } else {
          cell += char;
        }
      }

      if (cell) {
        row.push(cell.trim());
        rows.push(row);
      }

      const headers = rows[0].map(h => h.toLowerCase());

      const col = name => headers.indexOf(name.toLowerCase());

      rows.slice(1).forEach(r => {
        const name = r[col("name")];
        if (!name) return;

        const card = document.createElement("div");
        card.className = "recruit-card";

        card.innerHTML = `
          <img
            src="${r[col("imageurl")] || "images/placeholder.png"}"
            class="recruit-photo"
            onerror="this.src='images/placeholder.png'"
          >

          <h3>${name}</h3>

          <p class="meta">
            ${r[col("position")] || ""} •
            ${r[col("heightweight")] || ""} •
            Class of ${r[col("class")] || ""}
          </p>

          ${r[col("writeup")]
            ? `<p class="writeup">${r[col("writeup")]}</p>`
            : ""
          }

          <div class="recruit-links">
            ${
              r[col("hudl")]
                ? `<a href="${r[col("hudl")]}" target="_blank">
                    <img src="icons/hudl.svg" alt="Hudl">
                  </a>`
                : ""
            }

            ${
              r[col("twitter")]
                ? `<a href="${r[col("twitter")]}" target="_blank">
                    <img src="icons/twitter-x.svg" alt="X">
                  </a>`
                : ""
            }
          </div>
        `;

        grid.appendChild(card);
      });

      loading.remove();
      console.log("✅ Recruits loaded:", grid.children.length);
    })
    .catch(err => {
      console.error("❌ Recruit load failed:", err);
      loading.textContent = "Failed to load recruits.";
    });
});