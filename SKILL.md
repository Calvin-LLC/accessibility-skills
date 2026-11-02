---
name: wcag
description: Use when checking or fixing web accessibility (WCAG 2.2 A/AA). Measures a live page in Chromium, then fixes with rules and patterns.
license: MIT
metadata:
  version: "3.0.1"
---

# WCAG

Two jobs: measure a rendered page against WCAG 2.2 Level A and AA, and write
code that passes. Source inspection alone never settles a criterion, so every
report comes from a real browser run.

Read `AGENTS.md` first for the layout and the rules that keep this skill small.

## Run the measurement

```
node <skill-dir>/scripts/wcag.mjs <url|file.html> [options]
```

Launches headless Chromium (any Chromium-based browser on `PATH`, or
`CHROME_BIN`), runs nine checks (`forms` only with `--interact`), prints a JSON report on stdout and a short
summary on stderr. Exit code: `0` no failures, `2` failures found, `1` the run
broke.

| Option | Use |
|--------|-----|
| `--viewport 390x844` | start at a phone size |
| `--media prefers-color-scheme=dark,prefers-reduced-motion=reduce` | audit each theme and motion mode; run once per mode the product ships. Also `forced-colors`, `prefers-contrast` |
| `--interact` | submit empty forms with every non-GET request blocked, then judge the error handling |
| `--probe-keys` | press single keys with nothing focused to find shortcuts. This can trigger page actions, so use it on a dev server |
| `--only a,b` / `--skip a,b` | pick checks by id |
| `--cdp 9222` | attach to a running browser, for pages behind a login the user already holds |
| `--out report.json` | write the JSON to a file |
| `--list-criteria` | print the 55 Level A and AA criteria |

Static files and `localhost` dev servers work the same. For a page behind a
login, ask the user to sign in inside a browser started with
`--remote-debugging-port`, then pass `--cdp`. Never type credentials.

## What each check measures

| Check | Measures | Criteria |
|-------|----------|----------|
| `contrast` | Computed colour pairs with alpha, opacity, and ancestor backgrounds composited. Text over images or gradients is sampled from screenshots taken with the text hidden. Placeholders and field borders | 1.4.3, 1.4.11 |
| `keyboard` | Real Tab key events. Records every stop, detects traps, compares before and after pixels for a focus indicator, samples whether a sticky element covers the focused one | 2.1.2, 2.4.7, 2.4.11, 2.4.3, 2.4.1 |
| `targets` | Box geometry of every pointer target, with the 24 px spacing-circle test | 2.5.8 |
| `reflow` | Re-lays the page at 320 px, at 200% zoom, and with the 1.4.12 text-spacing overrides; finds horizontal scroll and cut-off text; flips orientation | 1.4.10, 1.4.4, 1.4.12, 1.3.4 |
| `ax-tree` | Chromium's accessibility tree: nameless controls, file-name alt text, vague links, heading skips, landmarks | 4.1.2, 1.1.1, 2.4.4, 1.3.1 |
| `input-model` | DevTools event listeners: click-only divs, down-event actions, roles without keys, label in name, hover content dismissal and hoverability | 2.1.1, 2.5.2, 2.5.3, 1.4.13 |
| `dom` | Page facts: lang, title, zoom lock, autoplay, refresh, autocomplete tokens, paste blocking, looping animation | 3.1.1, 2.4.2, 1.4.4, 1.4.2, 1.3.5, 3.3.8 |
| `forms` | Empty submit with writes blocked: error text, association, `aria-invalid`, live-region announcement | 3.3.1, 4.1.3 |
| `axe` | axe-core 4.14 with the `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` tags. Contrast and target size are left to the checks above | many |

`forms` runs only with `--interact`. In a default run the report has 10
`no-failures-found`, 31 `partial-no-failures`, and 14 `manual` rows. `--interact`
moves 3.3.1, 3.3.3, and 4.1.3 from `manual` to `partial-no-failures`.

## Read the report

`criteria.rows` has one row for each of the 55 criteria:

| Status | Meaning |
|--------|---------|
| `fail` | A check measured a failure. Report it with its `selector` and `snippet` |
| `review` | A check found a candidate it cannot judge. A person decides |
| `no-failures-found` | A check measured this criterion fully and found nothing |
| `partial-no-failures` | Some aspects are automated and clean; the rest needs a person |
| `manual` | No script settles it. See `references/manual-criteria.md` |

`no-failures-found` is not conformance. Never write "passes WCAG" or "AA
compliant". Write what ran: "no failures in the automated checks; N criteria
need manual testing".

Each finding carries `sc`, `kind`, `check`, `selector`, `snippet`, `message`,
and `measured` numbers where they exist. `alsoFlaggedBy` lists other checks
that reported the same issue.

## Procedure

1. **Measure.** Run the script on every distinct template, not only the home
   page: a form, a table, an open modal, each theme through `--media`. Done
   when each template has a report and no check errored.
2. **Triage.** Group `fail` findings by criterion, then by shared selector
   pattern. One broken component repeated 30 times is one fix.
3. **Fix with the rules.** Load only the references the files need:

   | Changing | Reference |
   |----------|-----------|
   | HTML, JSX, Vue, Svelte, templates | `references/wcag-html.md` |
   | CSS, SCSS | `references/wcag-css.md` |
   | JS with behaviour | `references/wcag-js.md` |
   | A widget (modal, tabs, menu, tooltip) | `references/patterns.md` |
   | Colour, type, motion, layout decisions | `references/design.md` |
   | What a script cannot settle | `references/manual-criteria.md` |

   `references/wcag-core.md` always applies.
4. **Re-measure.** Run the same command again. Done when every `fail` you
   fixed is gone and no new one appeared.
5. **Report** with the template below, keeping measured results apart from
   manual follow-ups.

## Report

```markdown
# Accessibility report: [URL or path]

## Result
[N criteria fail, N to review, N measured clean, N partly automated, N manual]
Checks run: [ids]. Modes: [viewport, media features].

## Failures
Per criterion: number and name, selector, measured value, smallest fix, pattern.

## To review
Candidates a person must judge, with the question to answer.

## Manual testing still required
Screen reader pass, caption accuracy, alt-text quality, consistent
navigation across pages, error-message wording. Name which were not done.
```

## Boundaries

- This skill measures and advises. It edits the user's code only when asked,
  one fix at a time, each ending in a re-measure.
- Design quality (hierarchy, type scale, palette, motion language) belongs to
  impeccable. `references/design.md` says where the two meet and how to run
  `impeccable detect` beside this script.
- Security and supply-chain audits belong to harden.

## Facts that stay true

WCAG 2.2 has 86 success criteria; Level A plus AA is 55 (31 A, 24 AA).
4.1.1 Parsing was removed. Large text is 24 px, or 18.66 px bold. Normal text
needs 4.5:1, large text and UI components 3:1. Targets are 24 by 24 CSS px
unless an exception applies. `px` font sizes are not failures, and several
`h1` elements are not failures. WCAG 3.0 is a Working Draft (10 September 2026)
that W3C says does not replace WCAG 2, so this skill targets 2.2.
