const sheetURL =
  "PASTE_YOUR_PUBLISHED_CSV_URL_HERE";

const grid = document.getElementById("recruitsGrid");
const classFilter = document.getElementById("classFilter");
const searchInput = document.getElementById("searchInput");
const loadingText = document.getElementById("loadingText");

let recruits = [];

Papa.parse(sheetURL, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: (results) => {
    recruits = results.data;
    buildClassFilter();
    renderRecruits(recruits);
    loadingText.remove();
  },
  error: () => {
    loadingText.textContent = "Error loading recruits.";
  }
});

function buildClassFilter() {
  const years = [...new Set(recruits.map(r => r.Class))].sort();
  years.forEach(year => {
    const opt = document.createElement("option");
    opt.value = year;
    opt.textContent = year;
    classFilter.appendChild(opt);
  });
}

function renderRecruits(data) {
  grid.innerHTML = "";

  if (data.length === 0) {
    grid.innerHTML = "<p>No recruits found.</p>";
    return;
  }

  data.forEach(r => {
    const card = document.createElement("div");
    card.className = "recruit-card";

    card.innerHTML = `
      <img src="${r.ImageURL}" class="recruit-photo">

      <h3>${r.Name}</h3>
      <p class="meta">${r.Position} • Class of ${r.Class}</p>
     <div class="measurements">
  <span>${r.HeightWeight}</span>
</div>
      <p class="writeup">${r.Writeup || ""}</p>

      <div class="icons">
        ${r.HUDL ? `<a href="${r.HUDL}" target="_blank"><i class="fas fa-film"></i></a>` : ""}
        ${r.Twitter ? `<a href="${r.Twitter}" target="_blank"><i class="fa-brands fa-x-twitter"></i></a>` : ""}
      </div>
    `;

    grid.appendChild(card);
  });
}

function applyFilters() {
  const cls = classFilter.value;
  const search = searchInput.value.toLowerCase();

  const filtered = recruits.filter(r => {
    const matchClass = cls === "All" || r.Class === cls;
    const matchSearch = r.Name.toLowerCase().includes(search);
    return matchClass && matchSearch;
  });

  renderRecruits(filtered);
}

classFilter.addEventListener("change", applyFilters);
searchInput.addEventListener("input", applyFilters);