const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

fetch(CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.split("\n").slice(1);
    const grid = document.getElementById("grid");

    rows.forEach(row => {
      const cols = row.split(",");

      if (!cols[0]) return;

      const [
        name,
        classYear,
        position,
        heightWeight,
        hudl,
        writeup,
        imageUrl,
        twitter
      ] = cols;

      const cleanTwitter = twitter?.replace(/@/g,"").replace("https://twitter.com/","").replace("https://x.com/","");

      grid.innerHTML += `
        <div class="recruit-card">
          <div class="recruit-img">
            <img src="${imageUrl}" onerror="this.src='/images/placeholder.png'">
          </div>

          <div class="recruit-name">${name}</div>
          <div class="recruit-meta">${position}</div>
          <div class="recruit-meta">Class of ${classYear}</div>
          <div class="recruit-meta">${heightWeight}</div>

          <div class="icon-row">
            ${hudl ? `<a href="${hudl}" target="_blank"><img src="/icons/hudl.svg"></a>` : ``}
            ${cleanTwitter ? `<a href="https://twitter.com/${cleanTwitter}" target="_blank"><img src="/icons/twitter.svg"></a>` : ``}
          </div>

          <a class="view-btn" href="profile.html?name=${encodeURIComponent(name)}">View Profile</a>
        </div>
      `;
    });
  });