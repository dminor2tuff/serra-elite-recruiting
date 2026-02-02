/* recruits.js — Serra Recruiting Portal (robust + cache-proof)
   Columns expected:
   Name, Class, Position, HeightWeight, HUDL, Writeup, ImageURL, Twitter, GPA, Offers
*/

const CONFIG = {
  // ✅ OPTION A: PUBLISHED CSV (best if you have it)
  // Example:
  // https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv
  PUBLISHED_CSV_URL: "PASTE_YOUR_PUBLISHED_CSV_URL_HERE",

  // ✅ OPTION B: GVIZ fallback (works if sheet is publicly viewable)
  // This is the *normal* sheet ID from the edit link: /d/<SHEET_ID>/edit
  SHEET_ID: "PASTE_NORMAL_SHEET_ID_HERE",
  SHEET_TAB_NAME: "roster", // <-- change if your tab name differs (case matters)

  // Visual defaults
  FALLBACK_IMAGE: "images/silhouette.png", // make sure this exists
};

const grid = document.getElementById("recruitsGrid");
const classFilter = document.getElementById("classFilter");
const searchInput = document.getElementById("searchInput");
const statusMsg = document.getElementById("statusMsg");

if (!grid || !classFilter || !searchInput || !statusMsg) {
  console.error("Missing required elements. Check IDs: recruitsGrid, classFilter, searchInput, statusMsg");
}

let allRecruits = [];
let activeClass = "all";
let activeSearch = "";

/* -------------------- helpers -------------------- */
function clean(v) {
  return (v ?? "").toString().trim();
}

function normalizeKey(k) {
  return clean(k).toLowerCase().replace(/\s+/g, "");
}

function safeUrl(u) {
  const s = clean(u);
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return "https://" + s;
}

function showStatus(text, type = "") {
  statusMsg.textContent = text;
  statusMsg.className = "status" + (type ? ` ${type}` : "");
}

function setErrorWithLink(message, urlTried) {
  statusMsg.className = "status error";
  statusMsg.innerHTML = `
    <div style="font-weight:700; margin-bottom:6px;">${message}</div>
    <div style="font-size:12px; opacity:.9;">
      Tried: <a href="${urlTried}" target="_blank" rel="noopener noreferrer">${urlTried}</a>
    </div>
  `;
}

/* Turn a PapaParse row into our recruit object */
function rowToRecruit(row) {
  // Support headers like "HeightWeight" or "Height Weight"
  const map = {};
  Object.keys(row).forEach((key) => {
    map[normalizeKey(key)] = row[key];
  });

  return {
    name: clean(map["name"]),
    classYear: clean(map["class"]),
    position: clean(map["position"]),
    heightWeight: clean(map["heightweight"]) || clean(map["height/weight"]) || clean(map["heightweight "]),
    hudl: clean(map["hudl"]),
    writeup: clean(map["writeup"]),
    image: clean(map["imageurl"]) || clean(map["image"]),
    twitter: clean(map["twitter"]),
    gpa: clean(map["gpa"]),
    offers: clean(map["offers"]),
  };
}

function buildGvizCsvUrl(sheetId, tabName) {
  const base = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/gviz/tq`;
  const params = new URLSearchParams({
    tqx: "out:csv",
    sheet: tabName,
  });
  return `${base}?${params.toString()}`;
}

/* -------------------- rendering -------------------- */
function populateClassFilter(recruits) {
  // preserve "All Classes"
  const years = [...new Set(recruits.map(r => r.classYear).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // wipe all except first option
  classFilter.innerHTML = `<option value="all">All Classes</option>`;
  years.forEach(y => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    classFilter.appendChild(opt);
  });
}

function passesFilters(r) {
  const okClass = (activeClass === "all") ? true : clean(r.classYear) === activeClass;
  const okSearch = !activeSearch ? true : clean(r.name).toLowerCase().includes(activeSearch);
  return okClass && okSearch;
}

function cardHtml(r) {
  const imgSrc = r.image ? safeUrl(r.image) : CONFIG.FALLBACK_IMAGE;
  const hudlUrl = r.hudl ? safeUrl(r.hudl) : "";
  const xUrl = r.twitter ? safeUrl(r.twitter) : "";

  const metaLine = [
    r.position ? r.position : "",
    r.classYear ? `Class of ${r.classYear}` : "",
    r.heightWeight ? r.heightWeight : ""
  ].filter(Boolean).join(" • ");

  return `
  <article class="recruit-card">
    <div class="recruit-img">
      <img src="${imgSrc}" alt="${r.name}" loading="lazy"
        onerror="this.onerror=null; this.src='${CONFIG.FALLBACK_IMAGE}';" />
    </div>

    <div class="recruit-body">
      <h3 class="recruit-name">${r.name || "Unnamed Prospect"}</h3>
      <div class="recruit-meta">${metaLine || ""}</div>

      ${r.writeup ? `<p class="recruit-writeup">${r.writeup}</p>` : ""}

      <div class="recruit-actions">
        ${hudlUrl ? `<a class="icon-btn" href="${hudlUrl}" target="_blank" rel="noopener noreferrer" title="Hudl">Hudl</a>` : ""}
        ${xUrl ? `<a class="icon-btn" href="${xUrl}" target="_blank" rel="noopener noreferrer" title="X">X</a>` : ""}
      </div>
    </div>
  </article>`;
}

function renderGrid() {
  const filtered = allRecruits.filter(passesFilters);

  if (!filtered.length) {
    grid.innerHTML = "";
    showStatus("No prospects match your filters.", "muted");
    return;
  }

  showStatus(`${filtered.length} prospects loaded.`, "ok");
  grid.innerHTML = filtered.map(cardHtml).join("");
}

/* -------------------- loading -------------------- */
function parseCsvWithPapa(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results || !results.data) {
          reject(new Error("No CSV data returned."));
          return;
        }
        resolve(results.data);
      },
      error: (err) => reject(err),
    });
  });
}

async function loadRecruits() {
  showStatus("Loading prospects...", "muted");

  const published = clean(CONFIG.PUBLISHED_CSV_URL);
  const gviz = (clean(CONFIG.SHEET_ID) && clean(CONFIG.SHEET_TAB_NAME))
    ? buildGvizCsvUrl(CONFIG.SHEET_ID, CONFIG.SHEET_TAB_NAME)
    : "";

  // Try Published first, then GVIZ fallback
  const candidates = [];
  if (published && published !== "PASTE_YOUR_PUBLISHED_CSV_URL_HERE") candidates.push(published);
  if (gviz && CONFIG.SHEET_ID !== "PASTE_NORMAL_SHEET_ID_HERE") candidates.push(gviz);

  if (!candidates.length) {
    setErrorWithLink("Missing Sheet URL config.", "(set CONFIG.PUBLISHED_CSV_URL or CONFIG.SHEET_ID)");
    return;
  }

  let lastErr = null;
  for (const url of candidates) {
    try {
      // quick preflight: fetch status (helps show true 404 vs parse error)
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      // If fetch ok, let Papa parse the same URL
      const rawRows = await parseCsvWithPapa(url);

      const recruits = rawRows
        .map(rowToRecruit)
        .filter(r => r.name); // require at least a name

      if (!recruits.length) {
        throw new Error("CSV loaded but returned 0 recruits (check headers / tab / data).");
      }

      allRecruits = recruits;
      populateClassFilter(allRecruits);

      // reset filters
      activeClass = "all";
      activeSearch = "";
      classFilter.value = "all";
      searchInput.value = "";

      renderGrid();
      return;

    } catch (e) {
      lastErr = e;
      console.warn("CSV attempt failed:", url, e);
    }
  }

  // If both failed:
  const msg = lastErr?.message?.includes("HTTP")
    ? `Could not load Google Sheet CSV (${lastErr.message}).`
    : `Could not load recruits (${lastErr?.message || "unknown error"}).`;

  // show the last url tried (most likely helpful)
  setErrorWithLink(msg, candidates[candidates.length - 1]);
}

/* -------------------- events -------------------- */
classFilter?.addEventListener("change", () => {
  activeClass = classFilter.value;
  renderGrid();
});

searchInput?.addEventListener("input", () => {
  activeSearch = clean(searchInput.value).toLowerCase();
  renderGrid();
});

loadRecruits();