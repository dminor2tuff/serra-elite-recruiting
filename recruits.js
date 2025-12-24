document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ recruits.js loaded");

  const grid = document.getElementById("recruitGrid");
  const loading = document.getElementById("loadingText");

  if (!grid || !loading) {
    console.error("❌ Missing recruitGrid or loadingText");
    return;
  }

  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

  fetch(CSV_URL)
    .then(res => {
      console.log("CSV status:", res.status);
      return res.text();
    })
    .then(text => {
      const rows = text.split("\n").map(r => r.split(","));
      const headers = rows[0].map(h => h.trim().toLowerCase());

      const col = name => headers.indexOf(name.toLowerCase());

      rows.slice(1).forEach(r => {
        if (!r[col("name")]) return;

        const card = document.createElement("div");
        card.className = "recruit-card";

        card.innerHTML = `
          <img class="recruit-photo"
            src="${r[col("imageurl")] || "images/placeholder.png"}"
            onerror="this.src='images/placeholder.png'"
          >

          <h3>${r[col("name")]}</h3>

          <p class="meta">
            ${r[col("position")]} •
            ${r[col("heightweight")]} •
            Class of ${r[col("class")]}
          </p>

          <p class="writeup">${r[col("writeup")] || ""}</p>

          <div class="recruit-links">
            ${
              r[col("hudl")]
                ? `<a href="${r[col("hudl")]}" target="_blank">
                     <img src="icons/hudl.svg">
                   </a>`
                : ""
            }
            ${
              r[col("twitter")]
                ? `<a href="${r[col("twitter")]}" target="_blank">
                     <img src="icons/twitter-x.svg">
                   </a>`
                : ""
            }
          </div>
        `;

        grid.appendChild(card);
      });

      loading.remove();
      console.log("✅ Recruits rendered:", grid.children.length);
    })
    .catch(err => {
      console.error("❌ Fetch failed:", err);
      loading.textContent = "Failed to load recruits.";
    });
});