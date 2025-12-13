const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

fetch(CSV_URL)
  .then(r => r.text())
  .then(text => {
    const rows = text.split("\n").slice(1);
    rows.forEach(r => {
      const c = r.split(",");
      if (!c[0]) return;

      const card = document.createElement("div");
      card.className = "card";

      const img = c[6] || "/images/placeholder.png";
      const twitter = c[7] ? `https://twitter.com/${c[7].replace("@","")}` : "";
      const hudl = c[8] || "";

      card.innerHTML = `
        <div class="img-wrap">
          <img src="${img}" onerror="this.src='/images/placeholder.png'">
        </div>
        <h4>${c[0]}</h4>
        <p>${c[1]}</p>
        <p>Class of ${c[2]}</p>
        <p>${c[3]} / ${c[4]}</p>

        <div class="icons">
          ${twitter ? `<a href="${twitter}" target="_blank">🐦</a>` : ""}
          ${hudl ? `<a href="${hudl}" target="_blank">🎥</a>` : ""}
        </div>
      `;

      document.getElementById("grid").appendChild(card);
    });
  });