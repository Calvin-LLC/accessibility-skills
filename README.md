# WCAG

An agent skill that measures web accessibility in a real browser and fixes it
against WCAG 2.2 Level A and AA. It drives headless Chromium over the DevTools
protocol, so it needs no npm install and no screen reader.

It covers the 55 Level A and AA criteria. Ten it settles by measurement, 31 it
partly automates, and 14 it lists for manual testing.

## Run it

```bash
node scripts/wcag.mjs https://your-site.com
node scripts/wcag.mjs ./page.html --viewport 390x844
node scripts/wcag.mjs http://localhost:3000 --media prefers-color-scheme=dark,prefers-reduced-motion=reduce
node scripts/wcag.mjs http://localhost:3000 --interact --out report.json
```

Exit code `0` means no failures, `2` means failures, `1` means the run broke.
The JSON report has one row per criterion plus every finding with its CSS
selector, HTML snippet, and measured numbers.

## What it measures

| Check | How |
|-------|-----|
| Contrast | Computed colours with alpha and ancestor backgrounds composited. Text over images and gradients is sampled from screenshots taken with the text hidden |
| Keyboard | Real Tab key events: traps, focus order, a pixel comparison for the focus indicator, focus covered by sticky elements |
| Target size | Box geometry and the 24 px spacing-circle test |
| Reflow | The page at 320 px, at 200% zoom, with the 1.4.12 text-spacing overrides, and in both orientations |
| Accessibility tree | Chromium's own tree: nameless controls, bad alt text, vague links, heading skips |
| Input model | DevTools event listeners: click-only elements, pointer-down actions, label in name, hover content that cannot be dismissed |
| Page facts | lang, title, zoom lock, autoplay, refresh, autocomplete tokens, paste blocking, motion that ignores reduced-motion |
| Forms | Empty submit with all writes blocked: error text, association, announcement |
| axe-core | Version 4.14 with the WCAG 2.0, 2.1, and 2.2 tags |

## Check it works

```bash
node scripts/verify.mjs
```

Runs the checker on `fixtures/` and asserts that each planted defect is found
and that the clean page has no findings. About 90 seconds.

## What it will not do

- Claim conformance. A clean automated run still leaves 14 criteria and part
  of 31 more to a person.
- Judge meaning: alt-text quality, caption accuracy, error-message wording.
- Replace a screen reader pass. `references/manual-criteria.md` lists the steps.
- Edit your code unless you ask.

## Layout

```
SKILL.md                      procedure for agents
scripts/wcag.mjs              runner
scripts/checks/               one file per check
scripts/lib/                  DevTools client, page driver, shared in-page helpers
scripts/vendor/               axe-core
data/criteria.json            Level A and AA criteria from w3.org
fixtures/                     pages with known defects
references/                   fix rules, patterns, checklists, design notes
```

## Install

```bash
git clone https://github.com/Calvin-LLC/WCAG-2.2-made-easy.git
```

Point your Agent Skills host at the clone. It looks for `SKILL.md`.

Requires Node 22 or newer and a Chromium-based browser on `PATH` (or set
`CHROME_BIN`). Pass `--cdp <port>` to use a browser that is already running.

## References

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [axe-core](https://github.com/dequelabs/axe-core)
- [WebAIM](https://webaim.org/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## License

MIT. `scripts/vendor/axe.min.js` is MPL-2.0; its license is beside it.
