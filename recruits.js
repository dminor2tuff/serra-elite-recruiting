const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

const PASSWORD = "SerraFB!";
const STORAGE_KEY = "serra_recruits_access";

const gate = document.getElementById("passwordGate");
const recruitsSection = document.getElementById("recruitsSection");
const grid = document.getElementById("recruitsGrid");
const error = document.getElementById("gateError");

function unlockPortal() {
  const input = document.getElementById("portalPassword").value;
  if (input === PASSWORD) {
    localStorage.setItem(STORAGE_KEY, "true");
    gate.classList.add("hidden");
    recruitsSection.classList.remove("hidden");
    loadRecruits();
  } else {
    error.textContent = "Incorrect password";
  }
}

document.getElementById("viewProspectsBtn").onclick = () => {
  gate.scrollIntoView({ behavior: "smooth" });
};

if (localStorage.getItem(STORAGE_KEY)) {
  gate.classList.add("hidden");
  recruitsSection.classList.remove("hidden");
  loadRecruits();
}

async function loadRecruits() {
  const res = await fetch(CSV_URL);
  const text = await res.text();
  const rows = text.split("\n").slice(1);

  grid.innerHTML = "";

  rows.forEach(row => {
    const cols = row.split(",");

    if (cols.length < 5) return;

    const name = cols[0];
    const position = cols[1];
    const gradYear = cols[2];
    const imageUrl = cols[3];
    const hudl = cols[4];

    const card = document.createElement("div");
    card.className = "recruit-card";

    card.innerHTML = `
      <div class="photo-wrap">
        <img src="${imageUrl.trim()}"
             onerror="this.src='images/placeholder.png'">
      </div>
      <h3>${name}</h3>
      <p>${position}</p>
      <p>Class of ${gradYear}</p>
      ${hudl ? `<a href="${hudl}" target="_blank">Hudl</a>` : ""}
    `;

    grid.appendChild(card);
  });
}