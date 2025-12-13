const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const grid = document.getElementById("grid");
const searchInput = document.getElementById("search");
const filterButtons = document.querySelectorAll(".filters button");

let players = [];
let activeClass = "All";

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    players = parseCSV(text);
    render();
  });

function parseCSV(text) {
  const rows = text.split("\n").slice(1);
  return rows.map(row => {
    const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    return {
      name: cols[0]?.replace(/"/g, ""),
      classYear: cols[1],
      position: cols[2],
      heightWeight: cols[3],
      hudl: cols[4],
      writeup: cols[5],
      image: cols[6],
      twitter: cols[7]
    };
  });
}

function cleanTwitter(val) {
  if (!val) return "";
  return "https://twitter.com/" +
    val.replace("https://twitter.com/", "")
       .replace("https://x.com/", "")
       .replace("@", "")
       .trim();
}

function render() {
  const q = searchInput.value.toLowerCase();

  grid.innerHTML = "";

  players
    .filter(p =>
      (activeClass === "All" || p.classYear === activeClass) &&
      (p.name?.toLowerCase().includes(q) ||
       p.position?.toLowerCase().includes(q))
    )
    .forEach(p => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div class="photo">
          <img src="${p.image || "images/placeholder.png"}"
               onerror="this.src='images/placeholder.png'">
        </div>

        <div class="name">${p.name || ""}</div>
        <div class="meta">${p.position || ""}</div>
        <div class="meta">Class of ${p.classYear || ""}</div>
        <div class="meta">${p.heightWeight || ""}</div>

        <div class="icons">
          ${p.twitter ? `<a href="${cleanTwitter(p.twitter)}" target="_blank">
            <img src="icons/twitter.svg">
          </a>` : ""}

          ${p.hudl ? `<a href="${p.hudl}" target="_blank">
            <img src="icons/hudl.svg">
          </a>` : ""}
        </div>

        <a class="btn" href="profile.html?name=${encodeURIComponent(p.name)}">
          View Profile
        </a>
      `;

      grid.appendChild(card);
    });
}

searchInput.addEventListener("input", render);

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeClass = btn.dataset.class;
    render();
  });
});