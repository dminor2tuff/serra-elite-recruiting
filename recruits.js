(() => {
  // ✅ PUT YOUR PUBLISHED CSV LINK HERE (must end with pub?output=csv)
  const SHEET_CSV_URL =
    https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv

  function $(id) { return document.getElementById(id); }
  const statusBox = () => $("statusBox");
  const grid = () => $("recruitsGrid");
  const classFilter = () => $("classFilter");
  const searchInput = () => $("searchInput");

  const clean = (v) => (v ?? "").toString().trim();

  // More robust CSV parser (handles quotes + commas inside quotes)
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];

      if (c === '"' && inQuotes && next === '"') {
        field += '"'; // escaped quote
        i++;
        continue;
      }

      if (c === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (!inQuotes && (c === "," || c === "\n" || c === "\r")) {
        if (c === "\r" && next === "\n") continue;

        row.push(field);
        field = "";

        if (c === "\n") {
          rows.push(row);
          row = [];
        }
        continue;
      }

      field += c;
    }

    // last field
    row.push(field);
    rows.push(row);

    // remove empty tail rows
    return rows.filter(r => r.some(cell => clean(cell)));
  }

  function normalizeKey(k) {
    return clean(k).toLowerCase().replace(/\s+/g, "");
  }

  function rowsToObjects(rows) {
    const header = rows[0].map(normalizeKey);
    const out = [];

    for (let i = 1; i < rows.length; i++) {
      const obj = {};
      for (let j = 0; j < header.length; j++) {
        obj[header[j]] = rows[i][j] ?? "";
      }
      out.push(obj);
    }
    return out;
  }

  function rowToRecruit(row) {
    // Supports HeightWeight and ImageURL even if typed slightly differently
    const map = {};
    Object.keys(row).forEach(k => map[normalizeKey(k)] = row[k]);

    return {
      name: clean(map["name"]),
      year: clean(map["class"]),
      position: clean(map["position"]),
      heightWeight: clean(map["heightweight"]) || clean(map["height/weight"]),
      hudl: clean(map["hudl"]),
      writeup: clean(map["writeup"]),
      image: clean(map["imageurl"]) || clean(map["image"]),
      twitter: clean(map["twitter"]),
      gpa: clean(map["gpa"]),
      offers: clean(map["offers"])
    };
  }

  function safeLink(url) {
    const u = clean(url);
    if (!u) return "";
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    // if they pasted "twitter.com/..." without https
    return "https://" + u.replace(/^\/+/, "");
  }

  function renderCards(list) {
    grid().innerHTML = "";

    if (!list.length) {
      statusBox().textContent = "No recruits found (check class filter / search).";
      return;
    }

    statusBox().textContent = `Showing ${list.length} prospect(s).`;

    list.forEach(p => {
      const card = document.createElement("article");
      card.className = "recruit-card";

      const hudl = safeLink(p.hudl);
      const twitter = safeLink(p.twitter);

      card.innerHTML = `
        <div class="photo-wrap">
          <img class="recruit-photo" src="${p.image}" alt="${p.name}" loading="lazy"
               onerror="this.src='/images/default-silhouette.png';" />
        </div>

        <div class="recruit-body">
          <h3 class="recruit-name">${p.name || "Unnamed Recruit"}</h3>

          <div class="recruit-meta">
            <span>${p.position || ""}</span>
            <span>•</span>
            <span>Class of ${p.year || ""}</span>
          </div>

          <div class="recruit-hw">${p.heightWeight || ""}</div>

          ${p.writeup ? `<p class="recruit-writeup">${p.writeup}</p>` : ""}

          <div class="recruit-links">
            ${hudl ? `<a class="btn-link" href="${hudl}" target="_blank" rel="noopener">Hudl</a>` : ""}
            ${twitter ? `<a class="btn-link" href="${twitter}" target="_blank" rel="noopener">X</a>` : ""}
          </div>
        </div>
      `;

      grid().appendChild(card);
    });
  }

  function applyFilters(all) {
    const selected = classFilter().value;
    const term = clean(searchInput().value).toLowerCase();

    const filtered = all.filter(p => {
      const classOk = selected === "all" || clean(p.year) === selected;
      const nameOk = !term || clean(p.name).toLowerCase().includes(term);
      return classOk && nameOk;
    });

    renderCards(filtered);
  }

  async function load() {
    // DOM safety check
    if (!grid() || !classFilter() || !searchInput() || !statusBox()) {
      console.error("Missing required IDs on page.");
      return;
    }

    statusBox().textContent = "Loading prospects…";

    try {
      const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
      if (!res.ok) {
        statusBox().textContent = `ERROR: Could not load Google Sheet CSV (HTTP ${res.status}).`;
        console.error("CSV fetch failed:", res.status, res.statusText, SHEET_CSV_URL);
        return;
      }

      const text = await res.text();
      const rows = parseCSV(text);
      if (rows.length < 2) {
        statusBox().textContent = "ERROR: CSV loaded but has no rows (check if sheet is published).";
        console.error("CSV content:", text.slice(0, 500));
        return;
      }

      // Convert to objects -> recruits
      const objs = rowsToObjects(rows);
      const recruits = objs.map(rowToRecruit).filter(p => p.name);

      // Attach listeners
      classFilter().addEventListener("change", () => applyFilters(recruits));
      searchInput().addEventListener("input", () => applyFilters(recruits));

      // First render
      applyFilters(recruits);

    } catch (err) {
      statusBox().textContent = "ERROR: Failed to load recruits (see console).";
      console.error(err);
    }
  }

  // Ensure DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
