# wcag

An agent skill that measures a web page against WCAG 2.2 Level A and AA in
headless Chromium, then helps you fix what fails. It covers all 55 criteria. It
measures 10 outright, partly automates 31, and lists 14 for a person to test.

## Install

Clone this repo into your coding agent's skills folder, in a folder named
`wcag`. Then start a new session.

| Agent | Clone into | Run |
|-------|------------|-----|
| Claude Code | `~/.claude/skills/wcag` | `/wcag` |
| Codex | `~/.agents/skills/wcag` | `$wcag` |
| OpenClaw | `~/.openclaw/skills/wcag` | `/wcag` |
| Hermes | `~/.hermes/skills/wcag` | `/wcag` |
| Pi | `~/.pi/agent/skills/wcag` | `/skill:wcag` |
| omp | `~/.omp/agent/skills/wcag` | `/skill:wcag` |

```bash
git clone https://github.com/Calvin-LLC/accessibility-skills ~/.claude/skills/wcag
```

## Use

```
/wcag https://your-site.com
/wcag ./page.html --viewport 390x844
/wcag http://localhost:3000 --interact
```

The agent runs the browser, reports each failure with its selector and measured
value, and proposes the smallest fix. A run on a real page takes minutes.

You need Node 22 or newer and a Chromium-based browser on your `PATH` (or set
`CHROME_BIN`).

## Limits

A clean run is not a conformance claim. Fourteen criteria, and part of 31 more,
still need a person. The skill never edits your code unless you ask.

## License

MIT. `scripts/vendor/axe.min.js` is MPL-2.0, and its license sits beside it.
