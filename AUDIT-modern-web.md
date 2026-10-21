# Modern Web Guidance Audit — FormPack

Date: 2026-10-21
Skill: `modern-web-guidance` from `googlechrome/modern-web-guidance`
Installed through: `npx skills add googlechrome/modern-web-guidance --skill modern-web-guidance`
Skill version used for searches: `2026_10_16-6654652b`

## Scope

- All **61 generated pages** were rendered in Firefox at **500px** and **1280px**.
- **6 Hindi pages** were audited at 500px with `?lang=hi`.
- **7 page types** were checked for WCAG contrast.
- Targeted checks covered the responsive preset table, SPA focus, language tags, live regions, `:user-invalid`, service-worker registration, and offline reload.
- Checks: horizontal overflow, H1 count, heading skips, duplicate IDs, form labels, accessible names, iframe titles, tap targets, `lang`/`dir`, contrast, SW control/caches.

## Guides retrieved

The skill's `search` command was used first, then `retrieve` for:

- `accessibility`
- `responsive-table`
- `performance`
- `forms`
- `accessible-error-announcement`
- `color`

The full retrieved content is in [`AUDIT-modern-web/guides-retrieved.md`](./AUDIT-modern-web/guides-retrieved.md).

## Findings and fixes

| Area | Before | After |
| --- | --- | --- |
| Tap targets | Every page had at least one standalone target under 40px (footer “About”/“Terms”, source links, preset/related links, workflow links, language switcher) | **0** standalone targets under 40px; primary targets are 44px |
| Responsive table | Preset rules table only scrolled horizontally; no region name, caption, sticky headers, or stacked layout | Region wrapper with `tabindex="0"`, `aria-labelledby`, caption; sticky `thead`; container-query stacked cards with `data-label` |
| Live regions | Batch/checker had multiple polite regions, plus interstitial status announcements | One `role="status"` per page; checker file errors use `role="alert"`; result summary is meaningful |
| SPA focus | Route changes updated the title but left focus on `<body>` | New page `<h1>` receives focus (`tabindex="-1"`) after the transition |
| Language tags | Hindi UI left long English articles/cards under `lang="hi"` | English article/cards/range workspace use `lang="en"`; translated FAQ/source headings use `lang="hi"` |
| Form invalid state | `aria-invalid` was set, but no native visual state | `:user-invalid` and `aria-invalid` inputs use the danger border |
| Fonts | No preload for the above-the-fold Geist font | Static pages preload the latin Geist WOFF2 with `crossorigin` |
| Caching / offline | Manifest existed, but no service worker; app chunk monolithic | SW added: NetworkFirst HTML, CacheFirst hashed assets, cache trimming; vendor chunk split |
| Metadata | No theme-color/color-scheme meta or AdSense preconnect | Added theme-color, color-scheme, preconnect, dns-prefetch |

## Evidence

- [`AUDIT-modern-web/audit-all-pages.json`](./AUDIT-modern-web/audit-all-pages.json) — 61 mobile + 61 desktop page results; 0 issues, 0 overflow. Build asset: `index-ejeqYfPf.js`.
- [`AUDIT-modern-web/hindi.json`](./AUDIT-modern-web/hindi.json) — 6 Hindi pages; `lang=hi`, `dir=ltr`, 0 overflow, 0 small targets, 0 missing labels.
- [`AUDIT-modern-web/contrast.json`](./AUDIT-modern-web/contrast.json) — 7 page types; 0 contrast failures; lowest ratio **4.82**.
- [`AUDIT-modern-web/targeted.json`](./AUDIT-modern-web/targeted.json) — table mobile/desktop, SPA focus, SW registration/caches, language tags, live-region counts, `:user-invalid`.
- [`AUDIT-modern-web/offline.json`](./AUDIT-modern-web/offline.json) — with the preview server stopped, `/guides` loaded from the SW cache with the correct title and content.
- [`AUDIT-modern-web/preset-table-mobile.png`](./AUDIT-modern-web/preset-table-mobile.png)
- [`AUDIT-modern-web/preset-table-desktop.png`](./AUDIT-modern-web/preset-table-desktop.png)

### Targeted results

- Mobile preset table: `role="region"`, `tabindex="0"`, `aria-labelledby="preset-rules-title"`, caption “SSC CGL upload rules”, `thead` hidden, cells stacked, `td::before` label “Format”, no overflow.
- Desktop preset table: `thead` visible, `position: sticky`, normal table cells, no overflow.
- SPA focus: after navigating to `/guides`, `document.activeElement` was `H1` with the guide title and `tabindex="-1"`.
- Service worker: 1 registration, active/activated, controller true, caches `formpack-static-v1` and `formpack-pages-v1`.
- Offline: after stopping the server, `/guides` still loaded with controller true and the correct title/content.
- `:user-invalid`: value `0` against `min=1` produced `invalid=true`, `userInvalid=true`, `aria-invalid=true`, danger border.
- Live regions: `/batch` and `/file-checker` each had 0 `[aria-live]`, 1 `[role=status]`, 0 `[role=alert]` initially.

## Build

- `npm run typecheck` — passed.
- `npm run build` — passed; **61 static SEO pages**.
- App chunk: `index-ejeqYfPf.js` — 527K minified / **138.12K gzip**.
- Vendor chunk: `vendor-BA4Jf96g.js` — 136K minified / **44.77K gzip**.
- Lazy: `pdf.worker` 1.3M, `heic2any` 1.3M, `file-worker` 882K.
- `public/sw.js` copied to `dist/sw.js`; static pages preload `geist-latin-wght-normal-*.woff2`.
- All static pages include `theme-color`, `color-scheme`, `preconnect`, and `dns-prefetch`.

## Remaining notes

- The initial audit’s 107–135 untitled iframes were hidden **0×0 Google AdSense/verification iframes** (`google_esf`, `adtrafficquality.google`, `recaptcha`). They are third-party and not app content; the app’s own PDF preview iframes have titles.
- Inline prose links remain below 44px; WCAG 2.5.8’s inline-text exception applies. All standalone actions are 44px.
- The site remains intentionally light-only. `color-scheme: light` and a `forced-colors` block are present; dark mode was not added as an unrequested redesign.
- Route-level code splitting remains a future architectural step. Vendor chunking and lazy workers are in place; the app chunk is still 527K.
- A true 200% browser-zoom run was not separately executed; 500px and 640px reflow checks pass with no overflow.
- The headless Firefox/geckodriver snap processes remain listed; `kill` returns `Permission denied` in this environment. The preview server is stopped.
- Changes are uncommitted and not deployed.
