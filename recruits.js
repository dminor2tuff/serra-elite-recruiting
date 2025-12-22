document.addEventListener("DOMContentLoaded", () => {
  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

  const grid = document.getElementById("recruitGrid");
  const loading = document.getElementById("loadingText");

  if (!grid) {
    console.error("❌ recruitGrid not found");
    return;
  }

  fetch(CSV_URL)
    .then(r => r.text())
    .then(csv => {
      const rows = [];
      let current = [];
      let insideQuotes = false;
      let cell = "";

      for (let char of csv) {
        if (char === '"' ) {
          insideQuotes = !insideQuotes;
        } else if (char === "," && !insideQuotes) {
          current.push(cell.trim());
          cell = "";
        } else if (char === "\n" && !insideQuotes) {
          current.push(cell.trim());
          rows.push(current);
          current = [];
          cell = "";
        } else {
          cell += char;
        }
      }

      if (cell) {
        current.push(cell.trim());
        rows.push(current);
      }

      const headers = rows[0].map(h => h.toLowerCase());

      const col = name => headers.indexOf(name.toLowerCase());

      rows.slice(1).forEach(r => {
        const name = r[col("name")];
        if (!name) return;

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
          <img
            src="${r[col("imageurl")] || "images/placeholder.png"}"
            class="recruit-photo"
            onerror="this.src='images/placeholder.png'"
          >

          <h3>${name}</h3>

          <p class="meta">
            ${r[col("position")] || ""} • ${r[col("heightweight")] || ""} • Class of ${r[col("class")] || ""}
          </p>

          ${r[col("writeup")] ? `<p class="writeup">${r[col("writeup")]}</p>` : ""}

          <div class="recruit-links">
            ${r[col("hudl")] ? `<a href="${r[col("hudl")]}" target="_blank"><img src="icons/hudl.svg"></a>` : ""}
            ${r[col("twitter")] ? `<a href="${r[col("twitter")]}" target="_blank"><img src="icons/twitter-x.svg"></a>` : ""}
          </div>
        `;

        grid.appendChild(card);
      });

      if (loading) loading.remove();

      console.log("✅ Loaded recruits:", grid.children.length);
    })
    .catch(err => {
      console.error("❌ CSV load failed", err);
      loading.textContent = "Failed to load prospects.";
    });
});