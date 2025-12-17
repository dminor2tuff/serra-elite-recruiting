const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = parseCSV(text);
    const grid = document.getElementById("recruitsGrid");

    rows.forEach(player => {
      if (!player.Name || !player.ImageURL) return;

      const card = document.createElement("div");
      card.className = "recruit-card";

      card.innerHTML = `
        <div class="photo-wrap">
          <img src="${player.ImageURL.trim()}" alt="${player.Name}">
        </div>

        <h3>${player.Name}</h3>
        <p>${player.Position || ""}</p>
        <p>Class of ${player.Class || ""}</p>

        <div class="icons">
          ${player.HUDL ? `<a href="${player.HUDL}" target="_blank" title="Hudl">
            <img src="icons/hudl.svg" alt="Hudl">
          </a>` : ""}

          ${player.Twitter ? `<a href="${player.Twitter}" target="_blank" title="X">
            <img src="icons/twitter-x.svg" alt="Twitter X">
          </a>` : ""}
        </div>
      `;

      grid.appendChild(card);
    });
  });

/* -----------------------------
   CSV PARSER (handles commas)
------------------------------ */
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = [];
    let current = "";
    let insideQuotes = false;

    for (let char of line) {
      if (char === `"`) insideQuotes = !insideQuotes;
      else if (char === "," && !insideQuotes) {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current);

    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i]?.replace(/^"|"$/g, "").trim();
    });

    return obj;
  });
}