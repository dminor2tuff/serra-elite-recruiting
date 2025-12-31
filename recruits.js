const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("recruitsGrid");
const classFilter = document.getElementById("classFilter");
const searchInput = document.getElementById("searchInput");

function clean(value) {
  return value ? value.trim() : "";
}

Papa.parse(CSV_URL, {
  download: true,
  header: true,
  complete: function (results) {
    const players = results.data.filter(p => p.Name);
    render(players);

    classFilter.addEventListener("change", () => filter(players));
    searchInput.addEventListener("input", () => filter(players));
  },
  error: function () {
    grid.innerHTML = "<p style='color:#fff'>Error loading recruits.</p>";
  }
});

function filter(players) {
  const year = classFilter.value;
  const search = searchInput.value.toLowerCase();

  const filtered = players.filter(p => {
    return (
      (year === "All" || p.Class === year) &&
      p.Name.toLowerCase().includes(search)
    );
  });

  render(filtered);
}

function render(players) {
  grid.innerHTML = "";

  players.forEach(p => {
    const card = document.createElement("div");
    card.className = "recruit-card";

    const img = p.ImageURL && p.ImageURL.startsWith("http")
      ? p.ImageURL
      : "images/placeholder.png";

  const position = p.Position || p.Pos || "";
const height = p.Height || p.Ht || "";
const weight = p.Weight || p.Wt || "";
const writeup =
  p.WriteUp || p.Writeup || p.Evaluation || p.Notes || "";

const hudl = p.Hudl || p.HUDL || "";
const twitter = p.Twitter || p.X || "";

card.innerHTML = `
  <img src="${img}" class="recruit-photo" alt="${p.Name}">
  
  <h3>${p.Name}</h3>

  <p class="meta">
    ${position} • Class of ${p.Class}
  </p>

  <p class="measurements">
    ${height}${height && weight ? " / " : ""}${weight}${weight ? " lbs" : ""}
  </p>

  ${
    writeup
      ? `<p class="writeup">${writeup}</p>`
      : ""
  }

  <div class="recruit-links">
    ${
      hudl
        ? `<a href="${hudl}" target="_blank" aria-label="Hudl">
            <img src="assets/hudl.svg" class="icon">
          </a>`
        : ""
    }
    ${
      twitter
        ? `<a href="${twitter}" target="_blank" aria-label="X">
            <img src="assets/x.svg" class="icon">
          </a>`
        : ""
    }
  </div>
`;

    grid.appendChild(card);
  });
}