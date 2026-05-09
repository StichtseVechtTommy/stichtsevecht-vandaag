# Stichtse Vecht Vandaag — Projectgeheugen

> Dit bestand is de "handleiding" voor Claude. Bij elke nieuwe sessie leest Claude dit eerst om de context op te halen. Houd het up to date als er beslissingen veranderen.

## Projectvisie

Een eenvoudige, warme nieuwssite voor de inwoners van de **gemeente Stichtse Vecht** (provincie Utrecht) — met extra aandacht voor Breukelen, maar ook Maarssen, Loenen aan de Vecht, Vinkeveen en de andere kernen. Lokaal van karakter, snel te bekijken — binnen een paar minuten weet de bezoeker wat er die dag of week speelt.

**Eigenaar:** Tommy
**Doelgroep:** Inwoners van de gemeente Stichtse Vecht
**Toon:** Warm, dorps, vriendelijk — verwijst naar de Vecht en de historische kern, maar **modern en niet ouderwets**

## Werkstijl met Tommy

- **Eerst plannen, dan doen.** Tommy bepaalt wat er gebouwd wordt, Claude legt eerst voor.
- Bij ontwerpkeuzes: maak een mockup of beschrijving, vraag dan akkoord.
- Bij vragen / onduidelijkheden: gebruik `AskUserQuestion`.
- Tommy is beginner — leg dingen helder uit, vermijd jargon, geen condescentie.

## Technische keuzes

| Onderdeel    | Keuze                                                                                |
| ------------ | ------------------------------------------------------------------------------------ |
| Type site    | Statische site (HTML + CSS + vanilla JavaScript)                                     |
| Build tools  | Geen — direct openbaar te bewerken bestanden                                         |
| Hosting      | Nog te kiezen — kandidaten: GitHub Pages, Netlify, Cloudflare Pages (allemaal gratis) |
| Weer-API     | [Open-Meteo](https://open-meteo.com) — gratis, geen API key nodig                    |
| Coördinaten  | Breukelen: 52.1735° N, 4.9897° O                                                     |
| Tijdzone     | Europe/Amsterdam                                                                     |
| Content      | JSON-bestanden in `data/` map; ook `data/data.js` als JS-fallback voor file://       |

## Mappenstructuur

```
Breukelen Website/
├── CLAUDE.md          ← dit bestand (projectgeheugen)
├── index.html         ← homepage
├── style.css          ← styling
├── script.js          ← weer-widget + content laden
└── data/
    ├── news.json      ← nieuwsberichten (canonical)
    ├── events.json    ← agenda (canonical)
    └── data.js        ← JS-versie van bovenstaande, voor file:// fallback
```

## Waarom data.js naast JSON

Browsers blokkeren `fetch("data/news.json")` als de site via `file://` (dubbelklik) wordt geopend — CORS-restrictie. Daarom laadt `index.html` ook `data/data.js`, die `window.BREUKELEN_NEWS` en `window.BREUKELEN_EVENTS` beschikbaar maakt. `script.js` gebruikt eerst die globals; bij hosting via http(s) kan het terugvallen op fetch. **De geplande taak moet ALTIJD beide formaten bijwerken.**

## Stijlrichtlijnen — V3 GOEDGEKEURD (sessie 1 — 3 mei 2026)

Tommy heeft V3 mockup goedgekeurd ("Ja, heel mooi"). Belangrijke ontwerpbeslissingen:

### Wat wel
- **Modern, magazine/bento-stijl** layout — niet rechte kolommen
- **All-Inter typografie** (sans-serif throughout). Geen Lora of andere serif. Tommy vond de oude serif-koppen "te ouderwets"
- **Vechtblauw `#1f4068`** als primair accent (vervangt terracotta)
- **Off-white achtergrond** `#f8f7f3`, witte cards `#ffffff`, subtiele warme borders `#ebe8e0`
- **Zwarte "Tip de redactie"-blok** `#131311` — Tommy specifiek gevraagd te behouden
- **Strakke hiërarchie**: `letter-spacing: -0.015em` à -0.025em op grote koppen, weight 500 voor "bold" (geen 600/700 zwaar)
- **Subtiele categorie-tags**: gekleurd 6px stipje vóór UPPERCASE label in muted gray, géén blokkerige labels
- **Bento-grid voor sidebar**: foto van de week (groot, 3×2), verkeer (3×1), sport (3×1), feitje (4×1, blauwig blok), tip (2×1, zwart)

### Niet doen
- ❌ Geen terracotta (`#c97757`) of warme oranjes — Tommy wil dit niet
- ❌ Geen Lora of andere serif headers
- ❌ Geen zware kaderachtige cards met dikke borders

### Volledige V3 kleurenpalet
```css
--bg:        #f8f7f3   /* off-white achtergrond */
--surface:   #ffffff   /* cards */
--border:    #ebe8e0   /* subtiele border */
--text:      #131311   /* primary text */
--text-soft: #4a4639   /* secondary */
--text-mute: #6e6a5e   /* tertiary */
--accent:    #1f4068   /* Vechtblauw (primary accent) */
--accent-bg: #eef2f6   /* lichte Vecht-tint, voor agenda-strip + feitje */
--ink:       #131311   /* near-black voor Tip-blok + datumblokjes */
/* Categorie-stipjes: */
--cat-verkeer:    #1f4068   /* Vechtblauw */
--cat-cultuur:    #b96fa2   /* roze-paars */
--cat-economie:   #d6a64a   /* warm goud */
--cat-dorpsleven: #5a8a4a   /* mosgroen */
/* Status-pills: */
--ok:    bg #e6efe6 / text #2c5a32
--warn:  bg #fcf0d4 / text #7a4f0c
--bad:   bg #fbe0d4 / text #843d22
```

### V3 Layout (van boven naar onder)
1. **Browser-bar mock** (alleen mockup, niet in echte site)
2. **Header** — brand "Breukelen *Vandaag*" links (Vandaag in Vechtblauw), datum + weer-pill + dark-mode-knop rechts
3. **Nav-strip** — "vandaag · nieuws · agenda · sport · foto's · vechtweetjes" + zwart pill-knopje "+ tip de redactie" rechts. Onderlijn van actieve tab in Vechtblauw
4. **Hero-blok** — 1.4fr / 1fr grid. Links: grote foto (250px hoog) van het hoofdartikel met witte pill "vandaag · 4 mei" linksboven. Rechts: kicker (UPPERCASE Vechtblauw), grote titel (30px, letter-spacing -0.025em), summary, "via [bron] · datum"
5. **Bento-grid** (6 kolommen):
   - Foto van de week (`span 3, span 2`) — grote afbeelding met witte caption-overlay onderaan
   - Verkeer & verstoringen (`span 3`) — NS, brug, weg, vechtbrug rijen met status-pills
   - Sport · weekend (`span 3`) — 3 uitslag-rijen, score in licht-Vecht pill
   - Vechtweetje (`span 4`) — blauwig achtergrondblok, korte editorial quote
   - Tip de redactie (`span 2`) — zwart blok, witte tekst, pijl rechtsonder
6. **Verder in het nieuws** sectie — 2-koloms grid van compactere nieuws-rows (110×84px thumbnail + tekst)
7. **Agenda-strip** — Vecht-tinted achtergrond, 4 evenementen naast elkaar, zwarte datum-blokjes met Vechtblauw "MEI" label
8. **Footer** — minimale tekstregel met "aanmelden voor ochtendmail" link

### Typografie spec
```css
font-family: "Inter", -apple-system, "Segoe UI", Roboto, sans-serif;
font-feature-settings: tabular-nums;  /* voor scores etc. */
/* Gewichten: enkel 400 (regular) en 500 (medium). Geen 600/700. */
/* Hero titel:    30px / -0.025em / 500 */
/* Section h:     18px / -0.015em / 500 */
/* Card h:        16px / -0.01em  / 500 */
/* News title:    15.5px / -0.012em / 500 */
/* Body:          14px / 400 */
/* Small/meta:    12-12.5px / 400 */
/* Labels (caps): 10.5-11px / 0.05-0.06em / 500 (UPPERCASE) */
```

## Secties op de homepage (V3)

1. **Header** — naam + datum + weer-pill + dark-mode toggle
2. **Nav** — categorieën + tip-knop
3. **Hero** — uitgelicht artikel van vandaag, met grote foto
4. **Bento sidebar/widgets** — foto v/d week, verkeer, sport, vechtweetje, tip
5. **Verder in het nieuws** — overig nieuws in 2-koloms grid
6. **Agenda** — komende evenementen
7. **Footer**

## Automatische dagelijkse updates

Een geplande Cowork-taak draait elke ochtend om **06:30 lokale tijd**:

- **Task ID:** `breukelen-nieuws-update`
- **Bestand:** `C:\Users\Tommy\Documents\Claude\Scheduled\breukelen-nieuws-update\SKILL.md`
- **Wat het doet:** haalt RSS-feeds van lokale bronnen op, filtert op de gemeente Stichtse Vecht, schrijft eigen koppen + verbatim samenvattingen, slaat resultaat op in `data/news.json`, `data/events.json` **EN** `data/data.js`.

### Bronnen (uitgebreid naar heel Stichtse Vecht — sessie 2)
1. Google News RSS Stichtse Vecht — primaire aggregator, meerdere uitgevers tegelijk
2. RTV Stichtse Vecht (`rtvstichtsevecht.nl`)
3. VARnws Stichtse Vecht (`varnws.nl/stichtsevecht`)
4. RTV Utrecht regio Stichtse Vecht (`rtvutrecht.nl/gemeenten/stichtse-vecht`)
5. Gemeente Stichtse Vecht (`stichtsevecht.nl/nieuws`)
6. Google News RSS Breukelen — als extra filter op Breukelen-specifiek nieuws

### Redactionele regels (DE GEMINI-REGEL)
- **Niets verzinnen.** Beter een lege agenda dan een verzonnen evenement.
- **Eigen kop, originele samenvatting.** De kop mag in onze warme dorpse toon, maar de samenvatting is verbatim 1-2 zinnen uit de bron.
- **Bron altijd zichtbaar.** Elk item heeft `source` en `source_url` met directe link.
- **Bij twijfel: weglaten.**
- **Bij feed-fout: niet overschrijven.** Bestanden blijven staan zoals ze zijn als geen enkele bron bereikbaar is.

### JSON-schema voor nieuws-items
```json
{
  "title": "Eigen kop in onze toon (max ~80 tekens)",
  "date": "YYYY-MM-DD",
  "summary": "Verbatim 1-2 zinnen uit de bron",
  "source": "Naam van de uitgever",
  "source_url": "https://directe-link-naar-artikel",
  "category": "verkeer | cultuur | economie | dorpsleven | politiek | sport"
}
```

> **Toevoeging in V3**: `category` veld zodat de UI de juiste gekleurde stip kan tonen. Geplande taak moet bij elke item een categorie kiezen op basis van de inhoud. Bij twijfel: "dorpsleven".

### JSON-schema voor evenementen
```json
{
  "title": "Naam van het evenement",
  "date": "YYYY-MM-DD",
  "time": "20:00 of 10:00 – 16:00 of leeg",
  "location": "Locatie",
  "description": "Korte beschrijving"
}
```

### ⚠️ Allowlist (al ingesteld)
Tommy heeft de volgende domeinen toegevoegd aan **Settings → Capabilities**:
- `rtvstichtsevecht.nl` ✅
- `varnws.nl` ✅
- `www.stichtsevecht.nl` ✅
- `www.rtvutrecht.nl` ✅

## Status & roadmap

### ✅ Klaar (sessie 1 — 3 mei 2026)
- Projectstructuur opgezet
- CLAUDE.md aangemaakt
- index.html, style.css, script.js gebouwd (V1 — basic styling)
- Weer-widget live via Open-Meteo
- Geplande taak `breukelen-nieuws-update` aangemaakt en succesvol uitgevoerd
- Echte nieuws/agenda content uit RSS opgehaald (Dodenherdenking, fietsbrug Nieuwer ter Aa, markt-discussie, etc.)
- Allowlist-domeinen toegevoegd door Tommy
- file:// CORS-fix: `data/data.js` met JS-globals + fallback in `script.js`
- V2-mockup gemaakt (warmer maar te 2000-vibes volgens Tommy)
- **V3-mockup goedgekeurd** door Tommy — moderne bento, all-Inter, Vechtblauw, geen terracotta, zwart Tip-blok blijft

### ✅ Klaar (sessie 2 — 7 mei 2026)
- V3-design volledig gebouwd: index.html, style.css, script.js herschreven
- Hero toont altijd het artikel met een foto (JS-logica)
- Dark mode geïmplementeerd met localStorage-persistentie — Tommy: "heel erg mooi"
- Foto's bij nieuwsitems: og:image opgehaald via Python urllib vanuit bash-sandbox
- `category` veld toegevoegd aan alle nieuws-items, gekleurde stipjes in UI
- `data/data.js` globals opgebouwd (FOTO_WEEK, FEITJES, EVENTS, NEWS)
- Geplande taak bijgewerkt: og:image-ophaling, Google News RSS toegevoegd als 5e bron
- Fallback foto voor artikelen zonder afbeelding: Bethunpolder-foto (Wikimedia Commons) als CSS background op `.news-thumb` en `.hero-photo`
- **Site hernoemd** van "Breukelen Vandaag" naar **"Stichtse Vecht Vandaag"**
- **Scope uitgebreid** naar heel Stichtse Vecht — geplande taak bijgewerkt met Google News RSS als primaire bron

### 🔜 Daarna (in latere sessies)
- [ ] Sportdata-bronnen onderzoeken en aansluiten
- [ ] Verkeersdata-bronnen aansluiten (NS, gemeente)
- [ ] Hosting opzetten (GitHub Pages aanbevolen)
- [ ] Eigen domeinnaam (bijv. breukelen-vandaag.nl)
- [ ] Donker-modus echt implementeren (de knop in V3 is nu cosmetisch)
- [ ] Mobiele layout optimaliseren
- [ ] Nieuwsbrief-aanmelding (Buttondown of MailerLite)

## Hoe content handmatig bijwerken (als nodig)

Tommy kan zelf de bestanden in `data/` bewerken:
- **Nieuws**: blok met `title`, `date`, `summary`, `source`, `source_url`, `category`, optioneel `image_url`
- **Agenda**: blok met `title`, `date`, `time`, `location`, `description`

Geen herstart of build nodig — herlaad de pagina. **Let op**: handmatige toevoegingen kunnen door geplande taak overschreven worden. Voor permanente content: aparte `data/news-handmatig.json`-bestand maken (uitbreiding voor later).

## Belangrijke conventies voor toekomstige sessies

- **Taal van de site:** Nederlands (alle zichtbare tekst)
- **Taal in code/comments:** Engels of Nederlands, beide ok
- **Geen build-stap.** Bestanden direct in projectmap
- **V3-stijlspec is leidend** — Tommy heeft deze goedgekeurd, niet eigenmachtig terracotta of serif terugbrengen
- **Eerst plannen, dan doen.** Bij grotere veranderingen mockup of beschrijving voorleggen
- **Bij twijfel:** `AskUserQuestion`
- **Gemini-regel blijft heilig**: niets verzinnen, eigen kop + verbatim samenvatting, bron altijd zichtbaar
