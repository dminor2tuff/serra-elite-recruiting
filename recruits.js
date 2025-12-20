// ================================
// SERRA FOOTBALL – RECRUITS SCRIPT
// ================================

// 🔗 Google Sheets CSV (PUBLISHED)
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

// 🔁 Fetch + Render Recruits
fetch(CSV_URL)
  .then(res => res.text())
  .then(csv => renderRecruits(csv))
  .catch(err => {
    console.error("Recruit load error:", err);
  });

// ================================
// MAIN RENDER FUNCTION
// ================================
function renderRecruits(csv) {
  const rows = parseCSV(csv);
  const grid = document.getElementById("recruitGrid");
  if (!grid) return;

  rows.forEach(cols => {
    if (!cols[0]) return; // skip empty rows

    // ---- Column Mapping (Sheet Order) ----
    const name = cols[0];
    const year = cols[1];
    const position = cols[2];
    const heightWeight = cols[3];
    const hudl = cols[4];
    const writeup = cols[5];
    const image = cols[6];
    const twitter = cols[7];

    const imgSrc =
      image && image.startsWith("http")
        ? image
        : "images/placeholder.png";

    // ---- Card Element ----
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${imgSrc}" class="recruit-photo" alt="${name}" />

      <h3>${name}</h3>

      <p class="meta">
        ${position} • ${heightWeight} • Class of ${year}
      </p>

      ${writeup ? `<p class="writeup">${writeup}</p>` : ""}

      <div class="recruit-links">
        ${hudl ? `
          <a href="${hudl}" target="_blank" rel="noopener" aria-label="Hudl">
            <img src="icons/hudl.svg" alt="Hudl">
          </a>
        ` : ""}

        ${twitter ? `
          <a href="${twitter}" target="_blank" rel="noopener" aria-label="Twitter">
            <img src="icons/twitter-x.svg" alt="Twitter">
          </a>
        ` : ""}
      </div>
    `;

    grid.appendChild(card);
  });
}

// ================================
// CSV PARSER (ROBUST)
// ================================
function parseCSV(text) {
  const rows = [];
  let current = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      value += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      current.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (value || current.length) {
        current.push(value.trim());
        rows.push(current);
        current = [];
        value = "";
      }
    } else {
      value += char;
    }
  }

  if (value || current.length) {
    current.push(value.trim());
    rows.push(current);
  }

  // Remove header row
  return rows.slice(1);
  <script src="recruits.js"></script>
}