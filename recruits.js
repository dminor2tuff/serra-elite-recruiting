const recruits = [
  {
    name: "Devohn Moutra Jr",
    position: "DB / RB",
    classYear: "2026",
    height: "5'10\"",
    weight: "184 lbs",
    image: "images/devohn_moutra.png",
    hudl: "#",
    twitter: "#"
  },
  {
    name: "Nicolas Johnson",
    position: "QB",
    classYear: "2026",
    height: "5'11\"",
    weight: "181 lbs",
    image: "images/johnson_nicolas.png",
    hudl: "#",
    twitter: "#"
  }
];

const grid = document.getElementById("recruitGrid");
const buttons = document.querySelectorAll(".filters button");

function renderRecruits(filter) {
  grid.innerHTML = "";

  recruits
    .filter(r => filter === "all" || r.classYear === filter)
    .forEach(r => {
      const card = document.createElement("div");
      card.className = "recruit-card";

      card.innerHTML = `
        <img src="${r.image}" onerror="this.src='images/placeholder.png'">
        <h3>${r.name}</h3>
        <p>${r.position}</p>
        <p>Class of ${r.classYear}</p>
        <p>${r.height} • ${r.weight}</p>

        <div class="icons">
          <a href="${r.twitter}" target="_blank">X</a>
          <a href="${r.hudl}" target="_blank">Hudl</a>
        </div>
      `;
      grid.appendChild(card);
    });
}

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderRecruits(btn.dataset.class);
  });
});

renderRecruits("all");