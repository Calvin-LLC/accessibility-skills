# accessibility-skills

The repo root is the `wcag` skill. `SKILL.md` is the front door. `scripts/`
measures a rendered page in Chromium over the DevTools protocol. `references/`
holds the fix rules.

## Layout

```
SKILL.md                      procedure, check table, report template
scripts/wcag.mjs              runner: launches Chromium, runs checks, merges, reports
scripts/verify.mjs            self-check: runs the runner on fixtures/ and asserts findings
scripts/checks/*.mjs          one file per check: { id, covers, run(page, ctx) }
scripts/lib/cdp.mjs           DevTools WebSocket client
scripts/lib/browser.mjs       launch or attach to Chromium
scripts/lib/page.mjs          navigation, keys, mouse, screenshots, in-page eval
scripts/lib/inpage.mjs        helper script injected into every page (window.__w)
scripts/lib/criteria.mjs      criterion table and per-criterion status roll-up
scripts/vendor/axe.min.js     axe-core, MPL-2.0, license beside it
data/criteria.json            the 55 Level A/AA criteria, from w3.org/WAI/WCAG22/wcag.json
fixtures/*.html               pages with known defects, and one clean page
references/wcag-core.md       always-loaded anti-patterns and thresholds
references/wcag-html.md       structure, forms, media, ARIA
references/wcag-css.md        focus, contrast, targets, reflow, motion
references/wcag-js.md         keyboard, focus management, live regions
references/patterns.md        copy-paste fixes
references/design.md          colour, type, motion, layout; where impeccable overlaps
references/manual-criteria.md what a person must test
references/checklists.md      developer, design, QA lists
```

Needs Node 22 or newer (built-in `WebSocket` and `fetch`) and a Chromium-based
browser. No npm dependencies.

## Rules

- `node scripts/verify.mjs` must pass before any change to `scripts/` lands.
  It fails when a check stops finding a planted defect and when the clean
  page gains a finding.
- A new check ships with a fixture that fails it and an assertion in
  `scripts/verify.mjs`. A check with no fixture is a guess.
- A check declares `covers` per criterion as `measured` (the script settles it
  fully) or `partial` (a person still decides part of it). Overstating
  coverage turns the report into a false clean bill.
- Reports never claim conformance. `no-failures-found` means the automated
  checks found nothing.
- Keep `references/wcag-core.md` small; it loads on every run. One canonical
  location per rule; examples live in `references/patterns.md`.
- Checks that mutate the page (hover, key presses, form submits) run after a
  fresh navigation, and `--interact` or `--probe-keys` gates the ones that can
  fire page actions. All non-GET requests are blocked during form submits.
- axe-core is pinned in `scripts/vendor/`. To update: `npm pack axe-core`,
  copy `axe.min.js` and `LICENSE`, rerun `verify.mjs`.
- Regenerate `data/criteria.json` from the W3C JSON, never by hand.
- The runner leaves no browser process and no temp profile behind, including
  after Ctrl-C or SIGTERM. `scripts/lib/browser.mjs` starts Chromium in its own
  process group and kills the whole group on exit. After a change there, run
  the checker, then confirm `ps` shows no `wcag-profile` browser and the temp
  directory holds no `wcag-profile-*` folder.
