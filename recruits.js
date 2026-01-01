const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("recruitsGrid");
const classFilter = document.getElementById("classFilter");
const searchInput = document.getElementById("searchInput");

let recruits = [];

Papa.parse(CSV_URL, {
  download: true,
  header: true,
  complete: (results) => {
    recruits = results.data.filter(r => r.Name);
    render();
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

      card.innerHTML = `
        <img src="${r.ImageURL}" class="recruit-photo" onerror="this.src='/images/placeholder.jpg'">

        <h3>${r.Name}</h3>
        <p class="meta">${r.Position} • Class of ${r.Class}</p>
        <p class="meta">${r.HeightWeight || ""}</p>

        <p class="writeup">${r.Writeup || ""}</p>

        <div class="links">
          ${r.HUDL ? `<a href="${r.HUDL}" target="_blank">Hudl</a>` : ""}
          ${r.Twitter ? `<a href="${r.Twitter}" target="_blank">X</a>` : ""}
        </div>
      `;

      grid.appendChild(card);
    });
}

classFilter.addEventListener("change", render);
searchInput.addEventListener("input", render);