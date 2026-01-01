// ============================
// CONFIG
// ============================
const CSV_URL =
  "PASTE_YOUR_PUBLISHED_CSV_URL_HERE"; // <-- keep your existing CSV link

// ============================
// DOM ELEMENTS (SAFE)
// ============================
const grid = document.getElementById("recruitsGrid");
const classFilter = document.getElementById("classFilter");
const searchInput = document.getElementById("searchInput");

// ============================
// STATE
// ============================
let recruits = [];

// ============================
// LOAD DATA
// ============================
Papa.parse(CSV_URL, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function (results) {
    recruits = results.data;
    renderRecruits(recruits);
    populateClassFilter(recruits);
  },
  error: function () {
    grid.innerHTML = "<p>Error loading recruits.</p>";
  }
});

// ============================
// HELPERS
// ============================
function parseHeightWeight(hw) {
  if (!hw) return { height: "—", weight: "—" };

  // Expected formats:
  // 5'10 / 184
  // 5-10 / 184
  // 5'10 184
  const parts = hw.split("/");
  return {
    height: parts[0]?.trim() || "—",
    weight: parts[1]?.replace("lbs", "").trim() || "—"
  };
}

// ============================
// RENDER
// ============================
function renderRecruits(data) {
  grid.innerHTML = "";

  data.forEach((r) => {
    const { height, weight } = parseHeightWeight(r.HeightWeight);

    const card = document.createElement("div");
    card.className = "recruit-card";

    card.innerHTML = `
      <img 
        src="${r.ImageURL || "images/placeholder.png"}" 
        alt="${r.Name}" 
        class="recruit-photo"
        loading="lazy"
      />

      <h3>${r.Name}</h3>

      <p class="meta">
        ${r.Position} • Class of ${r.Class}
      </p>

      <p class="meta">
        ${height} / ${weight} lbs
      </p>

      ${
        r.Writeup
          ? `<p class="writeup">${r.Writeup}</p>`
          : ""
      }

      <div class="recruit-links">
        ${
          r.HUDL
            ? `<a href="${r.HUDL}" target="_blank" aria-label="Hudl">
                 <img src="images/hudl.svg" alt="Hudl">
               </a>`
            : ""
        }
        ${
          r.Twitter
            ? `<a href="${r.Twitter}" target="_blank" aria-label="Twitter/X">
                 <img src="images/x.svg" alt="Twitter">
               </a>`
            : ""
        }
      </div>
    `;

    grid.appendChild(card);
  });
}

// ============================
// FILTERS
// ============================
function populateClassFilter(data) {
  const classes = [...new Set(data.map(r => r.Class))].sort();
  classes.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    classFilter.appendChild(opt);
  });
}

function applyFilters() {
  const cls = classFilter.value;
  const term = searchInput.value.toLowerCase();

  const filtered = recruits.filter(r => {
    const matchClass = cls === "All" || r.Class === cls;
    const matchSearch = r.Name.toLowerCase().includes(term);
    return matchClass && matchSearch;
  });

  renderRecruits(filtered);
}

classFilter.addEventListener("change", applyFilters);
searchInput.addEventListener("input", applyFilters);