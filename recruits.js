const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("recruitsGrid");
const classFilter = document.getElementById("classFilter");
const searchInput = document.getElementById("searchInput");

let recruits = [];

// Parse CSV safely
Papa.parse(CSV_URL, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: (results) => {
    recruits = results.data.filter(r => r.Name && r.Name.trim() !== "");
    render();
  },
  error: (err) => {
    console.error("CSV Load Error:", err);
    grid.innerHTML = "<p>Error loading recruiting data.</p>";
  }
});

function render() {
  grid.innerHTML = "";

  const classVal = classFilter.value;
  const searchVal = searchInput.value.toLowerCase();

  recruits
    .filter(r =>
      (classVal === "All" || r.Class === classVal) &&
      r.Name.toLowerCase().includes(searchVal)
    )
    .forEach(r => {
      const card = document.createElement("div");
      card.className = "card";

      const imgSrc = r.ImageURL && r.ImageURL.startsWith("http")
        ? r.ImageURL
        : "/images/placeholder.jpg";

      card.innerHTML = `
        <img src="${imgSrc}" class="recruit-photo"
             onerror="this.src='/images/placeholder.jpg'">

        <h3>${r.Name}</h3>

        <p class="meta">
          ${r.Position || ""} • Class of ${r.Class || ""}
        </p>

        <p class="meta">
          ${r.HeightWeight || ""}
        </p>

        ${r.Writeup ? `<p class="writeup">${r.Writeup}</p>` : ""}

        <div class="links">
          ${r.HUDL ? `<a href="${r.HUDL}" target="_blank" rel="noopener">Hudl</a>` : ""}
          ${r.Twitter ? `<a href="${r.Twitter}" target="_blank" rel="noopener">X</a>` : ""}
        </div>
      `;

      grid.appendChild(card);
    });
}

// Filters
classFilter.addEventListener("change", render);
searchInput.addEventListener("input", render);