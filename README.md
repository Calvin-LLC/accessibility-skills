SUPERCEEDED BY https://github.com/Calvin-LLC/skills


# wcag

A skill that checks a web page against WCAG 2.2 Level A and AA in a real
browser, fixes what fails, and checks again. It covers all 55 criteria. It
measures 10 outright, partly automates 34, and lists 11 for a person to test.

Everything the skill needs is in this folder. It has no options: you run it and
it does the whole job.

## Setup

Clone this repo into your coding agent's skills folder, in a folder named
`wcag`, then start a new session.

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

Then tell it the page:

```
/wcag http://localhost:3000
```

Needs Node 22 or newer and a Chromium-based browser on your `PATH`.

MIT. `scripts/vendor/axe.min.js` is MPL-2.0, and its license sits beside it.
