# Checklists: developer, design, QA

Use the developer list before every commit. Use the design list during
mockups. Use the QA list for signoff.

## Developer checklist

Run this before committing user-facing code.

HTML structure:

- Page has `html lang`.
- Page has a unique, descriptive `title`.
- Headings go in logical order. Multiple `h1` elements are fine.
- Semantic elements used: header, nav, main, article, section, footer.
- Skip link provided and targets `main`.

Images and media:

- All `img` elements have `alt`. Decorative images use `alt=""`.
- No images of text except logos.
- Video has captions. Audio has a transcript.
- No auto-playing media, or it has controls.

Forms:

- Every input has a `label` with matching `for` and `id`.
- Required fields are indicated in the label, not only with an asterisk.
- Error messages are clear, reference the field, and use `aria-describedby`.
- Invalid fields use `aria-invalid="true"`.
- Placeholders never replace labels.

Keyboard:

- All interactive elements reachable through Tab.
- No keyboard traps.
- Focus order matches visual order.
- Modals trap focus inside, close on Escape, and return focus on close.

Focus indicators:

- Focus is always visible.
- Never use blanket `outline: none`.
- Custom focus styles are clear: 2px solid with 3:1 contrast.

Color and contrast:

- Text contrast is 4.5:1 minimum, 3:1 for large text.
- UI component contrast is 3:1 minimum.
- Information never relies on color alone.

Touch and mobile:

- Targets are 24x24 CSS px minimum, 44-48px recommended.
- 8px minimum spacing between targets.
- Never assume input method from viewport size.

Motion:

- Animations respect `prefers-reduced-motion`.
- No content flashes more than 3 times per second.
- Moving content has pause or stop controls.

Links and buttons:

- Link text is descriptive, never "click here".
- Buttons use `button`, links use `a`.

ARIA:

- Native HTML first. ARIA only when no native element exists.
- Dynamic content uses live regions.
- Dialogs carry `role="dialog"`, `aria-modal`, and `aria-labelledby`.

WCAG 2.2 additions:

- Inputs collecting personal data carry `autocomplete`.
- Accessible names include the visible label text.
- Single-character shortcuts are remappable or disableable.
- Multipoint gestures and drag operations have single-pointer alternatives.
- Actions fire on pointer up, not pointer down.
- Content works in both orientations and reflows at 320px.
- Text containers never clip with adjusted spacing.
- Hover and focus content is dismissible, hoverable, and persistent.
- Focus is never obscured by sticky headers, banners, or widgets.
- Help sits in a consistent location across pages.
- Multi-step forms pre-populate previously entered data.
- No cognitive function tests for authentication.
- Status messages use live regions.

Quick tests: Tab through with the mouse aside. Zoom to 200 percent. Run a
screen reader for five minutes through headings, landmarks, and one form.

## Design checklist

Run this during mockups, wireframes, and design-system work.

Color and contrast:

- Normal text 4.5:1, large text 3:1. Test every text and background pair.
- Form borders, button backgrounds, icons, and focus indicators 3:1.
- Never use color as the only indicator. Pair it with icons or text.

Typography:

- Base font 16px (1rem) minimum. Line height 1.5 for body text.
- Line length 45-75 characters. No justified text.

Touch targets:

- WCAG minimum 24x24 CSS px. Recommended 44-48px for primary actions.
- 8px minimum spacing.

Visual hierarchy:

- Clear heading order in the mockup.
- Visible focus indicators designed for every interactive element.
- Focus style distinct from hover, visible on all backgrounds.

Motion:

- Animations optional, never required to understand content.
- Reduced-motion alternatives designed.
- No flashing above 3 per second. Auto-playing content has pause.

Layout:

- Mobile-first. Content reflows at every size.
- No horizontal scrolling at common sizes. 200 percent zoom holds.
- Visual order matches reading order.

Forms:

- Every field has a visible label above or beside the input.
- Error placement, message text, and help text designed.
- Required fields marked in label text.

Components:

- Primary action obvious. Destructive actions look different.
- Links underlined or otherwise obvious. Link text descriptive.
- Modal close button obvious, Escape closes, focus trap planned.

WCAG 2.2 design points:

- Works in portrait and landscape. No orientation lock unless essential.
- Works at 320px width. Data tables may scroll.
- Text containers use flexible height. No fixed-height text boxes.
- Tooltips dismissible, hoverable, persistent.
- Focused elements never hidden behind sticky content.
- Every drag has a tap or click alternative.
- No text CAPTCHAs. Password managers supported. Passkeys offered.
- Help in the same position on every page.

Design handoff includes: contrast ratios for all text, focus designs for all
interactive elements, target sizes, error states, reduced-motion
alternatives, alt text suggestions, heading hierarchy, reading order.

## QA checklist

Run this for signoff. Record the browser, OS, and assistive tech used.

Keyboard:

- Tab reaches every interactive element. Focus always visible.
- Focus order is logical. No traps.
- Buttons activate with Enter or Space. Links follow with Enter.
- Dropdowns work with arrow keys. Modals trap focus and close on Escape.
- Focus returns to the trigger after modal close.

Screen reader:

- Page title announced on load. Headings and landmarks navigable.
- Images read with alt text. Decorative images silent.
- Link text descriptive. Buttons named. Table headers announced.
- Form labels, required markers, errors, and help text announced.
- Alerts, loading states, and updates announced appropriately.

Visual:

- 200 percent zoom keeps all content visible and working.
- Grayscale check: nothing relies on color alone.
- Focus visible on every element.

Motion:

- OS reduce-motion on: animations reduce, content still works.
- No flashing above 3 per second. Moving content stoppable.

Touch and mobile:

- WCAG minimum 24x24 CSS px. 44-48px recommended.
- Content works at mobile sizes. No gesture-only paths.

WCAG 2.2 specific tests:

- Orientation: both portrait and landscape show all content.
- Reflow: 320px width, no horizontal scroll except tables and maps.
- Text spacing overrides applied: nothing overlaps or clips.
- Gestures and drags all have single-pointer alternatives.
- Targets meet 24x24 minimum with spacing noted.
- Login works with a password manager. No text CAPTCHA without fallback.
- `autocomplete` present on login fields.
- Focus never fully hidden behind sticky or fixed content.
- Tooltips dismiss on Escape, stay hoverable and persistent.
- Help link in the same location on three or more pages.
- Status messages announced without focus change.
- Single-key shortcuts disableable and silent in text inputs.
- Multi-step forms pre-fill repeated information.

Automated scan:

- Run `node scripts/wcag.mjs <url>` on each page and attach the JSON report.
- Record error counts, types, pages, and severity.

Bug reports include: short description, WCAG criterion, severity, page URL,
repro steps, expected versus actual behavior, assistive tech, browser and OS.

Severity guide: critical means some users cannot use the content at all
(keyboard trap, missing labels). Serious means major barriers with
workarounds (poor contrast, invisible focus). Moderate means difficulty
without blocking (missing skip link, generic link text). Minor means best
practice only.
