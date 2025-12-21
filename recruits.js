document.addEventListener("DOMContentLoaded", () => {
  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

  const grid = document.getElementById("recruitGrid");

  if (!grid) {
    console.error("❌ recruitGrid NOT FOUND in HTML");
    return;
  }

  fetch(CSV_URL)
    .then(res => {
      if (!res.ok) throw new Error("CSV fetch failed");
      return res.text();
    })
    .then(csv => {
      const rows = csv.trim().split("\n").slice(1);
      if (!rows.length) {
        console.error("❌ CSV has no data rows");
        return;
      }

      rows.forEach(row => {
        const cols = row.match(/(".*?"|[^",]+)(?=,|$)/g);
        if (!cols || !cols[0]) return;

        const name = clean(cols[0]);
        const year = clean(cols[1]);
        const position = clean(cols[2]);
        const heightWeight = clean(cols[3]);
        const hudl = clean(cols[4]);
        const writeup = clean(cols[5]);
        const image = clean(cols[6]);
        const twitter = clean(cols[7]);

        const imgSrc =
          image && image.startsWith("http")
            ? image
            : "images/placeholder.png";

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
          <img src="${imgSrc}" class="recruit-photo" onerror="this.src='images/placeholder.png'">

          <h3>${name}</h3>

          <p class="meta">
            ${position} • ${heightWeight} • Class of ${year}
          </p>

          ${writeup ? `<p class="writeup">${writeup}</p>` : ""}

          <div class="recruit-links">
            ${hudl ? `<a href="${hudl}" target="_blank"><img src="icons/hudl.svg"></a>` : ""}
            ${twitter ? `<a href="${twitter}" target="_blank"><img src="icons/twitter-x.svg"></a>` : ""}
          </div>
        `;

        grid.appendChild(card);
      });

      console.log("✅ Recruits rendered:", grid.children.length);
    })
    .catch(err => {
      console.error("❌ Recruit load error:", err);
    });

  function clean(val) {
    return val ? val.replace(/^"|"$/g, "").trim() : "";
  }
});