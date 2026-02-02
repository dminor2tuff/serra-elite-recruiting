(() => {
  // ✅ Use the PUBLISHED CSV link (exactly like this)
  const SHEET_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZdfePIY8K8ag6AePllWRgYXhjJ-gJddB_8rDaJi3t5BAT11bHVK6m5cDsDQXg2PUIYPqHYcXyxbT2/pub?output=csv";

  // DOM
  const grid = document.getElementById("recruitsGrid");
  const classFilter = document.getElementById("classFilter");
  const searchInput = document.getElementById("searchInput");
  const statusText = document.getElementById("statusText");

  // If these are null, the page IDs don't match the HTML.
  if (!grid || !classFilter || !searchInput || !statusText) {
    console.error("Missing required DOM elements. Check IDs in recruits.html");
    return;
  }

  let allRecruits = [];

  // Helpers
  const clean = (v) => (v ?? "").toString().trim();

  const normalizeKey = (k) =>
    clean(k).toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");

  // Your Sheet headers:
  // Name, Class, Position, HeightWeight, HUDL, Writeup, ImageURL, Twitter, GPA, Offers
  function rowToRecruit(row) {
    const map = {};
    Object.keys(row || {}).forEach((key) => {
      map[normalizeKey(key)] = row[key];
    });

    const name = clean(map["name"]);
    const year = clean(map["class"]);
    const position = clean(map["position"]);
    const heightWeight =
      clean(map["heightweight"]) || clean(map["height/weight"]) || clean(map["heightweight "]);

    const hudl = clean(map["hudl"]);
    const writeup = clean(map["writeup"]);
    const image = clean(map["imageurl"]) || clean(map["imageurl "]) || clean(map["image"]);
    const twitter = clean(map["twitter"]) || clean(map["x"]);
    const gpa = clean(map["gpa"]);
    const offers = clean(map["offers"]);

    return {
      name,
      year,
      position,
      heightWeight,
      hudl,
      writeup,
      image,
      twitter,
      gpa,
      offers,
    };
  }

  function isValidHttpUrl(url) {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  function buildCsvUrlWithCacheBust(baseUrl) {
    const u = new URL(baseUrl);
    u.searchParams.set("t", Date.now().toString());
    return u.toString();
  }

  function setStatus(msg, type = "info") {
    statusText.textContent = msg;
    statusText.className = `status ${type}`;
  }

  function uniqueSortedYears(data) {
    const set = new Set();
    data.forEach((p) => {
      const y = clean(p.year);
      if (y) set.add(y);
    });
    return Array.from(set).sort();
  }

  function fillClassDropdown(years) {
    // Keep the first "All Classes"
    classFilter.innerHTML = `<option value="all">All Classes</option>`;
    years.forEach((y) => {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      classFilter.appendChild(opt);
    });
  }

  function getFiltered() {
    const selectedYear = classFilter.value;
    const q = clean(searchInput.value).toLowerCase();

    return allRecruits.filter((p) => {
      const matchesYear = selectedYear === "all" ? true : clean(p.year) === selectedYear;
      const matchesName = q ? clean(p.name).toLowerCase().includes(q) : true;
      return matchesYear && matchesName;
    });
  }

  function iconHudl() {
    // simple play icon
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5v14l11-7z"></path>
      </svg>
    `;
  }

  function iconX() {
    // simple X mark icon
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.3 5.7L13 11l5.3 5.3-1.7 1.7L11.3 12.7 6 18l-1.7-1.7L9.6 11 4.3 5.7 6 4l5.3 5.3L16.6 4z"></path>
      </svg>
    `;
  }

  function renderCards(list) {
    if (!list.length) {
      grid.innerHTML = `<div class="empty">No prospects match your filters.</div>`;
      return;
    }

    grid.innerHTML = list
      .map((p) => {
        const name = clean(p.name) || "Unnamed";
        const pos = clean(p.position) || "";
        const year = clean(p.year) || "";
        const hw = clean(p.heightWeight) || "";
        const writeup = clean(p.writeup) || "";
        const img = isValidHttpUrl(p.image) ? p.image : "./images/silhouette.png";

        const hudlLink = isValidHttpUrl(p.hudl) ? p.hudl : "";
        const xLink = isValidHttpUrl(p.twitter) ? p.twitter : "";

        const metaLine = [
          pos ? `<span>${pos}</span>` : "",
          year ? `<span>Class of ${year}</span>` : "",
          hw ? `<span>${hw}</span>` : "",
        ]
          .filter(Boolean)
          .join(" • ");

        return `
          <article class="card">
            <div class="card-img">
              <img src="${img}" alt="${name}" loading="lazy" />
            </div>

            <div class="card-body">
              <div class="card-name">${name}</div>
              <div class="card-meta">${metaLine || "&nbsp;"}</div>
              <div class="card-writeup">${writeup || ""}</div>

              <div class="card-links">
                ${
                  hudlLink
                    ? `<a class="icon-btn" href="${hudlLink}" target="_blank" rel="noopener noreferrer" title="Hudl">${iconHudl()}<span>Hudl</span></a>`
                    : `<span class="icon-btn disabled" title="No Hudl link">${iconHudl()}<span>Hudl</span></span>`
                }
                ${
                  xLink
                    ? `<a class="icon-btn" href="${xLink}" target="_blank" rel="noopener noreferrer" title="X">${iconX()}<span>X</span></a>`
                    : `<span class="icon-btn disabled" title="No X link">${iconX()}<span>X</span></span>`
                }
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function applyAndRender() {
    const filtered = getFiltered();
    renderCards(filtered);
    setStatus(`${filtered.length} prospects loaded`, "ok");
  }

  async function loadSheet() {
    try {
      setStatus("Loading prospects…", "info");

      // Cache-bust to avoid stale results
      const url = buildCsvUrlWithCacheBust(SHEET_CSV_URL);

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const csvText = await res.text();

      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors && parsed.errors.length) {
        console.warn("PapaParse errors:", parsed.errors);
      }

      const rows = parsed.data || [];
      const recruits = rows
        .map(rowToRecruit)
        .filter((p) => clean(p.name)); // keep rows with a name

      allRecruits = recruits;

      // Fill dropdown from data
      fillClassDropdown(uniqueSortedYears(allRecruits));

      // render
      applyAndRender();
    } catch (err) {
      console.error(err);

      // This is the exact error you're seeing:
      setStatus(`ERROR: Could not load Google Sheet CSV (${err.message}).`, "bad");

      grid.innerHTML = `
        <div class="empty">
          <div><strong>Prospects failed to load.</strong></div>
          <div class="hint">Open your published CSV link in a new tab. If it does not download/show CSV, republish the sheet.</div>
        </div>
      `;
    }
  }

  // Events
  classFilter.addEventListener("change", applyAndRender);
  searchInput.addEventListener("input", applyAndRender);

  // Go
  loadSheet();
})();