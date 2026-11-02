# wcag

An agent skill that measures a web page against WCAG 2.2 Level A and AA in
headless Chromium, then helps you fix what fails. It covers all 55 criteria. It
measures 10 outright, partly automates 31, and lists 14 for a person to test.
It never edits your code unless you ask.

## Setup

Clone this repo into your coding agent's skills folder, in a folder named
`wcag`, then start a new session.

| Agent | Clone into | Invoke |
|-------|------------|--------|
| Claude Code | `~/.claude/skills/wcag` | `/wcag` |
| Codex | `~/.agents/skills/wcag` | `$wcag` |
| OpenClaw | `~/.openclaw/skills/wcag` | `/wcag` |
| Hermes | `~/.hermes/skills/wcag` | `/wcag` |
| Pi | `~/.pi/agent/skills/wcag` | `/skill:wcag` |
| omp | `~/.omp/agent/skills/wcag` | `/skill:wcag` |

```bash
git clone https://github.com/Calvin-LLC/accessibility-skills ~/.claude/skills/wcag
```

Needs Node 22 or newer and a Chromium-based browser on your `PATH`.

MIT. `scripts/vendor/axe.min.js` is MPL-2.0, and its license sits beside it.
