const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";
const grid = document.getElementById("grid");

fetch(CSV_URL + "&cb=" + Date.now())
.then(r=>r.text())
.then(t=>{
  const rows = t.split("\n").slice(1);
  rows.forEach(r=>{
    const c = r.split(",");
    const name = c[0];
    const cls = c[1];
    const pos = c[2];
    const size = c[3];
    const hudl = c[4];
    const img = c[6];
    const tw = c[7];

    grid.innerHTML += `
      <div class="card">
        <div class="photo">
          <img src="${img}" onerror="this.src='images/placeholder.png'">
        </div>
        <div class="body">
          <div class="name">${name}</div>
          <div class="meta">${pos} • Class ${cls}</div>
          <div class="meta">${size}</div>
          <div class="links">
            ${tw ? `<a class="iconlink" href="https://twitter.com/${tw.replace('@','')}" target="_blank">Twitter</a>`:""}
            ${hudl ? `<a class="iconlink" href="${hudl}" target="_blank">Hudl</a>`:""}
          </div>
        </div>
      </div>
    `;
  });
});