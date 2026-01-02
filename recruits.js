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
  <img src="${img}" class="recruit-photo" />

  <h3>${name}</h3>

  <div class="recruit-meta">
    ${position} • Class of ${year}<br>
    ${heightWeight}
  </div>

  <div class="recruit-writeup">
    ${writeup || "—"}
  </div>

  <div class="recruit-links">
    ${hudl ? `<a href="${hudl}" target="_blank">
      <img src="hudl_icon.png"> Hudl
    </a>` : ""}

    ${twitter ? `<a href="${twitter}" target="_blank">
      <img src="x_icon.png"> X
    </a>` : ""}
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