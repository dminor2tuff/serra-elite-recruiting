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


const writeup =
  p.WriteUp ||
  p.Writeup ||
  p.Evaluation ||
  p.Scouting ||
  p.Notes ||
  "";
const hudl = p.Hudl || p.HUDL || "";
const twitter = p.Twitter || p.X || "";



  ${
    writeup
      ? `<p class="writeup">${writeup}</p>`
      : ""
  }

  <div class="recruit-links">
    ${
      p.Hudl
        ? `<a href="${p.Hudl}" target="_blank" title="Hudl">🎥 Hudl</a>`
        : ""
    }
    ${
      p.Twitter || p.X
        ? `<a href="${p.Twitter || p.X}" target="_blank" title="X">𝕏</a>`
        : ""
    }
  </div>
`;

    grid.appendChild(card);
  });
}
