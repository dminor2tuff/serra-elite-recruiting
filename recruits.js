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
    .then(res => res.text())
    .then(csv => {
      const lines = csv.split("\n").filter(Boolean);
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

      const get = (row, name) => {
        const i = headers.indexOf(name.toLowerCase());
        return i !== -1 ? row[i]?.replace(/^"|"$/g, "").trim() : "";
      };

      lines.slice(1).forEach(line => {
        const cols = line.match(/(".*?"|[^",]+)(?=,|$)/g);
        if (!cols) return;

        const name = get(cols, "name");
        if (!name) return;

        const year = get(cols, "class");
        const position = get(cols, "position");
        const hw = get(cols, "heightweight");
        const writeup = get(cols, "writeup");
        const image = get(cols, "imageurl");
        const hudl = get(cols, "hudl");
        const twitter = get(cols, "twitter");

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
          <img 
            src="${image || "images/placeholder.png"}"
            class="recruit-photo"
            onerror="this.src='images/placeholder.png'"
          >

          <h3>${name}</h3>

          <p class="meta">
            ${position || ""} • ${hw || ""} • Class of ${year || ""}
          </p>

          ${writeup ? `<p class="writeup">${writeup}</p>` : ""}

          <div class="recruit-links">
            ${hudl ? `<a href="${hudl}" target="_blank"><img src="icons/hudl.svg"></a>` : ""}
            ${twitter ? `<a href="${twitter}" target="_blank"><img src="icons/twitter-x.svg"></a>` : ""}
          </div>
        `;

        grid.appendChild(card);
      });

      if (loading) loading.remove();

      console.log("✅ Prospects loaded:", grid.children.length);
    })
    .catch(err => {
      console.error("❌ CSV error:", err);
      if (loading) loading.textContent = "Failed to load prospects.";
    });
});