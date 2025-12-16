const SHEET_URL =
  "https://opensheet.elk.sh/YOUR_SHEET_ID/YOUR_TAB_NAME";

const grid = document.getElementById("recruitsGrid");
const searchInput = document.getElementById("searchInput");
const classButtons = document.querySelectorAll(".class-filters button");

let players = [];
let activeClass = "All";

// ---------- IMAGE NORMALIZER ----------
function getPlayerImage(photo) {
  if (!photo) return "images/placeholder.png";

  if (photo.startsWith("http")) {
    return photo.trim();
  }

  return `images/${photo.trim()}`;
}

// ---------- RENDER ----------
function renderPlayers() {
  grid.innerHTML = "";

  const search = searchInput.value.toLowerCase();

  players
    .filter(p =>
      (activeClass === "All" || p.class === activeClass) &&
      (`${p.name} ${p.position}`.toLowerCase().includes(search))
    )
    .forEach(player => {
      const card = document.createElement("div");
      card.className = "player-card";

      const img = document.createElement("img");
      img.className = "player-photo";
      img.src = getPlayerImage(player.photo);
      img.onerror = () => img.src = "images/placeholder.png";

      const name = document.createElement("h3");
      name.textContent = player.name;

      const info = document.createElement("p");
      info.textContent = `${player.position} • Class of ${player.class}`;

      const icons = document.createElement("div");
      icons.className = "player-icons";

      if (player.hudl) {
        const hudl = document.createElement("a");
        hudl.href = player.hudl;
        hudl.target = "_blank";
        hudl.innerHTML = `<img src="icons/hudl.svg" alt="Hudl">`;
        icons.appendChild(hudl);
      }

      if (player.twitter) {
        const twitter = document.createElement("a");
        twitter.href = player.twitter;
        twitter.target = "_blank";
        twitter.innerHTML = `<img src="icons/twitter.svg" alt="Twitter">`;
        icons.appendChild(twitter);
      }

      card.append(img, name, info, icons);
      grid.appendChild(card);
    });
}

// ---------- FETCH ----------
fetch(SHEET_URL)
  .then(res => res.json())
  .then(data => {
    players = data.map(p => ({
      name: p.Name,
      position: p.Position,
      class: p.Class,
      photo: p.Photo,
      hudl: p.Hudl,
      twitter: p.Twitter
    }));
    renderPlayers();
  });

// ---------- EVENTS ----------
searchInput.addEventListener("input", renderPlayers);

classButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    classButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeClass = btn.dataset.class;
    renderPlayers();
  });
});