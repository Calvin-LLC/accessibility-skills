# Accessibility skills

Agent skills for web accessibility. The repo root is one skill, `wcag`. It
opens a page in headless Chromium, measures it against the WCAG 2.2 Level A
and AA success criteria, and then helps you fix what it found. It talks to the
browser over the DevTools protocol, so it needs no npm install and no screen
reader.

It covers all 55 Level A and AA criteria (31 Level A, 24 Level AA). In a default
run it settles 10 by measurement, partly automates 31, and leaves 14 to a
person. With `--interact` it partly automates three more (3.3.1, 3.3.3, 4.1.3), which
leaves 11 for a person.

WCAG 2.2 is the current W3C Recommendation. WCAG 3.0 is still a Working Draft
and does not replace it, so this skill targets 2.2.

## Run it

```bash
node scripts/wcag.mjs https://your-site.com
node scripts/wcag.mjs ./page.html --viewport 390x844
node scripts/wcag.mjs http://localhost:3000 --media prefers-color-scheme=dark,prefers-reduced-motion=reduce
node scripts/wcag.mjs http://localhost:3000 --interact --out report.json
```

A run on a real page takes minutes, not seconds, because the keyboard check
presses Tab through the whole page. Exit code `0` means no failures, `2` means
failures, and `1` means the run broke. The JSON report has one row per criterion, plus every finding with its
CSS selector, HTML snippet, and measured numbers. `node scripts/wcag.mjs --help`
lists every option.

## What it measures

| Check id | What it does |
|----------|--------------|
| `contrast` | Computes colours with alpha and ancestor backgrounds composited. For text over images and gradients, it samples screenshots taken with the text hidden. |
| `keyboard` | Sends real Tab key events. Finds traps and focus-order problems, compares pixels to detect a missing focus indicator, and finds focus hidden under sticky elements. |
| `targets` | Measures the box of every pointer target and applies the 24 px spacing-circle test. |
| `reflow` | Re-lays the page out at 320 px, at 200% zoom, with the 1.4.12 text-spacing overrides, and in both orientations. |
| `ax-tree` | Reads Chromium's accessibility tree. Finds nameless controls, filename alt text, vague links, and heading skips. |
| `input-model` | Reads DevTools event listeners. Finds click-only elements, actions on pointer-down, a label missing from the accessible name, and hover content you cannot dismiss. |
| `dom` | Checks page facts: `lang`, title, zoom lock, autoplay, refresh, autocomplete tokens, paste blocking, and motion that ignores `prefers-reduced-motion`. |
| `forms` | Submits empty forms with every non-GET request blocked, then checks error text, association, and announcement. It runs only with `--interact`. |
| `axe` | Runs axe-core 4.14 with the WCAG 2.0, 2.1, and 2.2 tags. |

## Check that it works

```bash
node scripts/verify.mjs
```

This runs the checker on the pages in `fixtures/`. It passes when every planted
defect is found and the clean page has no findings. It takes about a minute and
prints 52 `ok` lines.

## What it will not do

- Claim conformance. A clean automated run still leaves 14 criteria, and part
  of 31 more, to a person.
- Judge meaning, such as alt-text quality, caption accuracy, or the wording of
  an error message.
- Replace a screen reader pass. `references/manual-criteria.md` lists the
  steps.
- Edit your code unless you ask.

## Layout

```
SKILL.md                 the procedure an agent follows
AGENTS.md                rules for working on this repo
scripts/wcag.mjs         the runner: launches Chromium, runs the checks, writes the report
scripts/verify.mjs       self-check against fixtures/
scripts/checks/          one file per check
scripts/lib/             DevTools client, browser launcher, page driver, in-page helpers
scripts/vendor/          axe-core and its license
data/criteria.json       the 55 Level A and AA criteria, from w3.org
fixtures/                pages with known defects, and one clean page
references/              fix rules, copy-paste patterns, checklists, design notes, manual tests
```

## Install

```bash
git clone https://github.com/Calvin-LLC/accessibility-skills.git
```

Point your Agent Skills host at the clone. Hosts look for `SKILL.md`.

You need Node 22 or newer and a Chromium-based browser on your `PATH`. Set
`CHROME_BIN` or pass `--chrome <path>` if the browser lives elsewhere. Pass
`--cdp <port>` to use a browser that is already running. On Node 18 the runner
stops with `WebSocket is not defined`.

## References

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [axe-core](https://github.com/dequelabs/axe-core)
- [WebAIM](https://webaim.org/)
- [MDN accessibility docs](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## License

MIT. `scripts/vendor/axe.min.js` is MPL-2.0, and its license sits beside it.
