/* ═══════════════════════════════════════════════════════════
   Stichtse Vecht Vandaag — V3 frontend logica
   Vult: header (datum + weer-pill), hero, bento-foto,
         nieuws-grid, agenda-strip, vechtweetje
═══════════════════════════════════════════════════════════ */

// ── Coördinaten Breukelen ──
const BREUKELEN = { lat: 52.1735, lon: 4.9897 };

// ── WMO weercodes → Nederlandse omschrijving + emoji ──
const WEATHER_CODES = {
  0:  { desc: "Helder",           icon: "☀️" },
  1:  { desc: "Overwegend zonnig",icon: "🌤️" },
  2:  { desc: "Half bewolkt",     icon: "⛅" },
  3:  { desc: "Bewolkt",          icon: "☁️" },
  45: { desc: "Mistig",           icon: "🌫️" },
  48: { desc: "Aanvriezende mist",icon: "🌫️" },
  51: { desc: "Lichte motregen",  icon: "🌦️" },
  53: { desc: "Motregen",         icon: "🌦️" },
  55: { desc: "Hevige motregen",  icon: "🌧️" },
  61: { desc: "Lichte regen",     icon: "🌦️" },
  63: { desc: "Regen",            icon: "🌧️" },
  65: { desc: "Hevige regen",     icon: "🌧️" },
  66: { desc: "IJsregen",         icon: "🌧️" },
  67: { desc: "Hevige ijsregen",  icon: "🌧️" },
  71: { desc: "Lichte sneeuw",    icon: "🌨️" },
  73: { desc: "Sneeuw",           icon: "❄️" },
  75: { desc: "Hevige sneeuw",    icon: "❄️" },
  77: { desc: "Korrelsneeuw",     icon: "❄️" },
  80: { desc: "Regenbuien",       icon: "🌦️" },
  81: { desc: "Regenbuien",       icon: "🌧️" },
  82: { desc: "Zware regenbuien", icon: "⛈️" },
  85: { desc: "Sneeuwbuien",      icon: "🌨️" },
  86: { desc: "Sneeuwbuien",      icon: "❄️" },
  95: { desc: "Onweer",           icon: "⛈️" },
  96: { desc: "Onweer met hagel", icon: "⛈️" },
  99: { desc: "Zwaar onweer",     icon: "⛈️" }
};

// ── Nederlandse namen ──
const DAYS_NL       = ["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"];
const MONTHS_NL     = ["januari","februari","maart","april","mei","juni",
                       "juli","augustus","september","oktober","november","december"];
const MONTHS_NL_CAP = ["JAN","FEB","MRT","APR","MEI","JUN",
                       "JUL","AUG","SEP","OKT","NOV","DEC"];

// ── Categorie-labels ──
const CAT_LABELS = {
  verkeer:    "Verkeer",
  cultuur:    "Cultuur",
  economie:   "Economie",
  dorpsleven: "Dorpsleven",
  politiek:   "Politiek",
  sport:      "Sport"
};

// ════════════════════════════════════════
//  HEADER — datum
// ════════════════════════════════════════
function setHeaderDate() {
  const today = new Date();
  const txt = `${DAYS_NL[today.getDay()]} ${today.getDate()} ${MONTHS_NL[today.getMonth()]}`;
  const el = document.getElementById("header-date");
  if (el) el.textContent = txt;
}

// ════════════════════════════════════════
//  WEER — pill in header
// ════════════════════════════════════════
async function loadWeather() {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${BREUKELEN.lat}&longitude=${BREUKELEN.lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m` +
    `&timezone=Europe/Amsterdam`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const code = data.current.weather_code;
    const w = WEATHER_CODES[code] || { desc: "Onbekend", icon: "·" };
    const temp = Math.round(data.current.temperature_2m);

    const iconEl = document.getElementById("wp-icon");
    const tempEl = document.getElementById("wp-temp");
    const descEl = document.getElementById("wp-desc");

    if (iconEl) iconEl.textContent = w.icon;
    if (tempEl) tempEl.textContent = temp;
    if (descEl) descEl.textContent = w.desc;
  } catch (err) {
    console.warn("Weer kon niet geladen worden:", err);
    const descEl = document.getElementById("wp-desc");
    if (descEl) descEl.textContent = "geen data";
  }
}

// ════════════════════════════════════════
//  NIEUWS laden (hero + grid)
// ════════════════════════════════════════
async function loadNews() {
  try {
    let items;
    if (Array.isArray(window.BREUKELEN_NEWS)) {
      items = window.BREUKELEN_NEWS;
    } else {
      const res = await fetch("data/news.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      items = await res.json();
    }

    // Sorteer: nieuwste eerst
    items.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (items.length === 0) return;

    // ── Hero: altijd eerste item MÉT foto (anders eerste item) ──
    const heroItem = items.find(item => item.image_url) || items[0];
    const heroIndex = items.indexOf(heroItem);

    // ── Nieuws-grid: alle overige items (max 6) ──
    const gridItems = items.filter((_, i) => i !== heroIndex).slice(0, 6);

    renderHero(heroItem);
    renderNewsGrid(gridItems);

  } catch (err) {
    console.error("Nieuws kon niet geladen worden:", err);
    const heroTitle = document.getElementById("hero-title");
    if (heroTitle) heroTitle.textContent = "Nieuws kon niet geladen worden.";
  }
}

function renderHero(item) {
  const today = new Date();
  const itemDate = new Date(item.date);
  const isToday =
    itemDate.getDate() === today.getDate() &&
    itemDate.getMonth() === today.getMonth() &&
    itemDate.getFullYear() === today.getFullYear();

  // Datum-pill tekst
  const pill = document.getElementById("hero-date-pill");
  if (pill) {
    pill.textContent = isToday
      ? `vandaag · ${today.getDate()} ${MONTHS_NL[today.getMonth()]}`
      : `${itemDate.getDate()} ${MONTHS_NL[itemDate.getMonth()]}`;
  }

  // Foto (als image_url beschikbaar)
  const photo = document.getElementById("hero-photo");
  if (photo && item.category) {
    photo.classList.add(`cat-bg-${item.category}`);
  }
  if (photo && item.image_url) {
    const img = document.createElement("img");
    img.src = item.image_url;
    img.alt = escapeHtml(item.title);
    // Pill blijft bovenop via absolute positioning in CSS
    const existingPill = photo.querySelector(".hero-date-pill");
    photo.insertBefore(img, existingPill);
  }

  // Kicker (categorie)
  const kicker = document.getElementById("hero-kicker");
  if (kicker && item.category) {
    kicker.textContent = (CAT_LABELS[item.category] || item.category).toUpperCase();
  }

  // Titel
  const titleEl = document.getElementById("hero-title");
  if (titleEl) titleEl.textContent = item.title;

  // Samenvatting
  const summaryEl = document.getElementById("hero-summary");
  if (summaryEl) summaryEl.textContent = item.summary || "";

  // Meta: bron + datum
  const metaEl = document.getElementById("hero-meta");
  if (metaEl) {
    const dateStr = `${itemDate.getDate()} ${MONTHS_NL[itemDate.getMonth()]}`;
    if (item.source && item.source_url) {
      metaEl.innerHTML = `via <a href="${escapeHtml(item.source_url)}" target="_blank" rel="noopener">${escapeHtml(item.source)}</a> · ${dateStr}`;
    } else {
      metaEl.textContent = dateStr;
    }
  }
}

function renderNewsGrid(items) {
  const grid = document.getElementById("news-grid");
  if (!grid) return;

  grid.innerHTML = "";

  if (items.length === 0) {
    grid.innerHTML = `<div class="news-row" style="grid-column:span 2"><p style="color:var(--text-mute);font-size:13px">Geen verdere berichten.</p></div>`;
    return;
  }

  for (const item of items) {
    const date = new Date(item.date);
    const dateStr = `${date.getDate()} ${MONTHS_NL[date.getMonth()]}`;
    const cat = item.category || "";
    const catLabel = CAT_LABELS[cat] || "Nieuws";

    const row = document.createElement("div");
    row.className = "news-row";

    // Thumbnail
    const thumb = document.createElement("div");
    thumb.className = `news-thumb cat-bg-${escapeHtml(cat)}`;
    if (item.image_url) {
      const img = document.createElement("img");
      img.src = item.image_url;
      img.alt = "";
      img.loading = "lazy";
      thumb.appendChild(img);
    }

    // Content
    const content = document.createElement("div");
    content.className = "news-row-content";
    content.innerHTML = `
      <div class="news-row-cat">
        <span class="cat-dot ${escapeHtml(cat)}"></span>
        ${escapeHtml(catLabel)}
      </div>
      <p class="news-row-title">${escapeHtml(item.title)}</p>
      <p class="news-row-meta">
        ${item.source_url
          ? `<a href="${escapeHtml(item.source_url)}" target="_blank" rel="noopener">${escapeHtml(item.source || "Lees verder")}</a> · `
          : ""}
        ${dateStr}
      </p>
    `;

    row.appendChild(thumb);
    row.appendChild(content);
    grid.appendChild(row);
  }
}

// ════════════════════════════════════════
//  AGENDA laden
// ════════════════════════════════════════
async function loadEvents() {
  try {
    let items;
    if (Array.isArray(window.BREUKELEN_EVENTS)) {
      items = window.BREUKELEN_EVENTS;
    } else {
      const res = await fetch("data/events.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      items = await res.json();
    }

    // Filter: vanaf vandaag, gesorteerd, max 4 voor de strip
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = items
      .filter(e => new Date(e.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 4);

    renderAgendaStrip(upcoming);
  } catch (err) {
    console.error("Agenda kon niet geladen worden:", err);
  }
}

function renderAgendaStrip(items) {
  const container = document.getElementById("agenda-events");
  if (!container) return;

  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = `<p style="color:var(--text-mute);font-size:13px;grid-column:span 4">Geen evenementen gepland.</p>`;
    return;
  }

  for (const item of items) {
    const date = new Date(item.date);

    // Gebruik <a> als er een source_url is, anders <div>
    const el = document.createElement(item.source_url ? "a" : "div");
    el.className = "agenda-event";
    if (item.source_url) {
      el.href = escapeHtml(item.source_url);
      el.target = "_blank";
      el.rel = "noopener";
    }
    el.innerHTML = `
      <div class="agenda-date-block">
        <span class="day">${date.getDate()}</span>
        <span class="month">${MONTHS_NL_CAP[date.getMonth()]}</span>
      </div>
      <div class="agenda-event-content">
        <p class="agenda-event-title">${escapeHtml(item.title)}</p>
        <p class="agenda-event-meta">${escapeHtml(
          [item.time, item.location].filter(Boolean).join(" · ")
        )}</p>
        ${item.description ? `<p class="agenda-event-desc">${escapeHtml(item.description)}</p>` : ""}
      </div>
      ${item.source_url ? `<span class="agenda-arrow">→</span>` : ""}
    `;
    container.appendChild(el);
  }
}

// ════════════════════════════════════════
//  FOTO VAN DE WEEK
// ════════════════════════════════════════
async function loadFotoVanDeWeek() {
  try {
    let foto;
    if (window.BREUKELEN_FOTO_WEEK) {
      foto = window.BREUKELEN_FOTO_WEEK;
    } else {
      const res = await fetch("data/foto-van-de-week.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      foto = await res.json();
    }

    const imgEl = document.getElementById("foto-wk-img");
    const titleEl = document.getElementById("foto-wk-title");
    const creditEl = document.getElementById("foto-wk-credit");

    if (foto.url && imgEl) {
      imgEl.style.backgroundImage = `url(${foto.url})`;
    }
    if (foto.caption && titleEl) titleEl.textContent = foto.caption;
    if (foto.credit && creditEl)  creditEl.textContent = "© " + foto.credit;
  } catch (_) {
    // Stille fallback — gradient achtergrond blijft zichtbaar
  }
}

// ════════════════════════════════════════
//  VECHTWEETJE — dagelijks roteert
// ════════════════════════════════════════
async function loadFeitje() {
  try {
    let feitjes;
    if (Array.isArray(window.BREUKELEN_FEITJES)) {
      feitjes = window.BREUKELEN_FEITJES;
    } else {
      const res = await fetch("data/feitjes.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      feitjes = await res.json();
    }

    if (!feitjes || feitjes.length === 0) return;

    // Dag van het jaar als index
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - start) / 86400000);
    const feitje = feitjes[dayOfYear % feitjes.length];

    const el = document.getElementById("feitje-text");
    if (el) el.textContent = feitje;
  } catch (_) {
    // Standaard tekst in HTML blijft staan
  }
}

// ════════════════════════════════════════
//  HULPFUNCTIES
// ════════════════════════════════════════
function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ════════════════════════════════════════
//  DARK MODE
// ════════════════════════════════════════
function initDarkMode() {
  if (initDarkMode._done) return;
  initDarkMode._done = true;
  const btn = document.getElementById("dark-mode-btn");
  if (!btn) return;

  // Vorige voorkeur herstellen
  if (localStorage.getItem("breukelen-dark") === "on") {
    document.body.classList.add("dark-mode");
    btn.textContent = "☀";
  }

  btn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    btn.textContent = isDark ? "☀" : "☾";
    localStorage.setItem("breukelen-dark", isDark ? "on" : "off");
  });
}

// ════════════════════════════════════════
//  SPORT — agenda dit weekend (homepage)
// ════════════════════════════════════════
async function loadSport() {
  const list = document.getElementById("sport-list");
  if (!list) return;

  // Laad sport-data.js items als ze beschikbaar zijn
  let items = [];
  if (Array.isArray(window.BREUKELEN_SPORT_AGENDA)) {
    items = window.BREUKELEN_SPORT_AGENDA;
  } else if (Array.isArray(window.BREUKELEN_SPORT)) {
    // Fallback: oude uitslagen-structuur
    items = window.BREUKELEN_SPORT;
  }

  if (!items || items.length === 0) {
    list.innerHTML = `<li class="sport-empty">Geen sport dit weekend</li>`;
    return;
  }

  // Toon aankomende items, max 4
  const today = new Date(); today.setHours(0,0,0,0);
  const upcoming = items
    .filter(e => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);

  if (upcoming.length === 0) {
    list.innerHTML = `<li class="sport-empty">Geen sport dit weekend gepland</li>`;
    return;
  }

  list.innerHTML = "";
  for (const item of upcoming) {
    const date = new Date(item.date);
    const dagKort = DAYS_NL[date.getDay()].slice(0, 2);
    const li = document.createElement("li");
    li.className = "sport-row";
    li.innerHTML = `
      <span class="sport-club">${escapeHtml(item.club || item.event || "")}</span>
      ${item.source_url
        ? `<a href="${escapeHtml(item.source_url)}" target="_blank" rel="noopener" class="sport-score-pill draw">${escapeHtml(dagKort)} ${date.getDate()}</a>`
        : `<span class="sport-score-pill draw">${escapeHtml(dagKort)} ${date.getDate()}</span>`
      }
    `;
    list.appendChild(li);
  }
}


// ════════════════════════════════════════
//  NS STORINGEN — live via NS API
// ════════════════════════════════════════
const NS_API_KEY = "5de98e60dec54e9aa85d9694b926c161";
const NS_REGIO   = ["Utrecht", "Breukelen", "Maarssen", "Hilversum", "Amsterdam", "Abcoude"];

async function loadNSDisruptions() {
  const el = document.getElementById("ns-storingen");
  if (!el) return;

  try {
    const res = await fetch(
      "https://gateway.apiportal.ns.nl/reisinformatie-api/api/v3/disruptions?isActive=true",
      { headers: { "Ocp-Apim-Subscription-Key": NS_API_KEY } }
    );
    if (!res.ok) throw new Error("api");
    const data = await res.json();

    // Filter op storingen die onze regio raken
    const relevant = data.filter(d => {
      const stations = (d.publicationSections || [])
        .flatMap(s => (s.section?.stations || []).map(st => st.name));
      const tekst = [d.title, ...stations].join(" ");
      return NS_REGIO.some(kw => tekst.includes(kw));
    });

    if (relevant.length === 0) {
      el.innerHTML = `<p class="ns-ok">✓ Geen verstoringen op het spoor in uw regio</p>`;
      return;
    }

    relevant.sort((a, b) => (b.impact?.value || 0) - (a.impact?.value || 0));

    el.innerHTML = relevant.map(d => {
      const impact    = d.impact?.value || 0;
      const pillClass = impact >= 4 ? "bad" : impact >= 3 ? "warn" : "ok";
      const cause     = d.timespans?.[0]?.cause?.label;
      const label     = cause
                      ? cause.charAt(0).toUpperCase() + cause.slice(1)
                      : d.type === "DISRUPTION" ? "Storing" : "Werkzaamheden";
      const desc = d.timespans?.[0]?.situation?.label || d.title;
      const eind = d.expectedDuration?.description || "";
      return `<div class="ns-storing-row">
        <div class="ns-storing-info">
          <span class="ns-storing-title">${escapeHtml(d.title)}</span>
          <span class="ns-storing-desc">${escapeHtml(desc)}</span>
          ${eind ? `<span class="ns-storing-end">${escapeHtml(eind)}</span>` : ""}
        </div>
        <span class="status-pill ${pillClass}">${label}</span>
      </div>`;
    }).join("");

  } catch (_) {
    el.innerHTML = `<p class="ns-ok"><a href="https://www.ns.nl/storingen" target="_blank" rel="noopener">Controleer ns.nl →</a></p>`;
  }
}

// ════════════════════════════════════════
//  NAV-TABS — scroll + active state
// ════════════════════════════════════════
function initNavTabs() {
  const tabs = document.querySelectorAll(".nav-tab[data-target]");
  if (!tabs.length) return;

  // Klikken → soepel scrollen naar sectie
  tabs.forEach(tab => {
    tab.addEventListener("click", e => {
      e.preventDefault();
      const target = document.getElementById(tab.dataset.target);
      if (!target) return;
      // Zet meteen de actieve tab
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      // Scroll met kleine offset voor de sticky nav
      const navHeight = document.querySelector(".site-nav")?.offsetHeight || 52;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  // Scroll-observer: actieve tab volgt mee
  const sectionIds = Array.from(tabs).map(t => t.dataset.target);
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tabs.forEach(t => {
            t.classList.toggle("active", t.dataset.target === id);
          });
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });

    sections.forEach(s => observer.observe(s));
  }
}

// ════════════════════════════════════════
//  START
// ════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  setHeaderDate();
  loadWeather();
  loadNews();
  loadEvents();
  loadFotoVanDeWeek();
  loadFeitje();
  loadSport();
  initDarkMode();
  initNavTabs();
  loadNSDisruptions();
});
