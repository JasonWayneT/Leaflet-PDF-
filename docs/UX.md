# UX Design Specification — Leaflet PDF

**Source:** Google Stitch design files at `C:\Users\Jason\Downloads\stitch_LEAFLETPDF_saas_interface_design\`
**Design system name:** Leaflet PDF Indigo
**Status:** accepted — pre-implementation reference

> **Note on two style systems:** This document covers the **app UI** (Leaflet PDF Indigo — the Electron interface). The **PDF output** is styled by the Orbital Light / Orbital Night system in `ORBITAL-LIGHT.md` and `ORBITAL-NIGHT.md`. These are separate concerns. Do not conflate them.

---

## Design System

### Colors (Tailwind token → hex)

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#3525CD` | Primary actions, active states, brand mark, borders on selected items |
| `primary-container` | `#3525CD` | Hover state for primary button |
| `primary-fixed` | `#E2DFFF` | Success icon background, active sidebar indicator |
| `on-primary` | `#FFFFFF` | Text on primary button |
| `on-primary-fixed-variant` | `#3323CC` | Log highlight text |
| `background` | `#F9F9FF` | App background (pale blue-white) |
| `surface` | `#FFFFFF` | Card surfaces, sidebar background |
| `surface-container-low` | `#F5F2FF` | Selected provider card background, file path code block |
| `surface-container` | `#F0ECF9` | Inactive sidebar icon hover |
| `surface-container-highest` | `#E4E1EE` | Hover background for secondary elements |
| `on-surface` | `#1B1B24` | Primary body text |
| `on-surface-variant` | `#464555` | Secondary text, inactive states |
| `outline-variant` | `#C7C4D8` | Borders, dividers, scrollbar thumb |
| `outline` | `#777587` | Tertiary text, timestamp labels |
| `active-indicator` | `#E2DFFF` | Sidebar active background |
| `error` | `#BA1A1A` | Destructive action text + border |
| `text-heading` | `#111827` | Display headings (h1 on cards) |

### Typography

| Scale | Font | Size | Weight | Line height | Letter spacing |
|---|---|---|---|---|---|
| `h1` | Plus Jakarta Sans | 30px | 700 | 38px | -0.02em |
| `h2` | Plus Jakarta Sans | 24px | 600 | 32px | -0.01em |
| `h3` | Plus Jakarta Sans | 18px | 600 | 26px | — |
| `body-md` | Plus Jakarta Sans | 14px | 400 | 20px | — |
| `body-sm` | Plus Jakarta Sans | 13px | 400 | 18px | — |
| `label-md` | JetBrains Mono | 12px | 600 | 16px | 0.05em |
| `label-sm` | JetBrains Mono | 11px | 600 | 14px | 0.15em |

**Rule:** Labels (`label-md`, `label-sm`) are always UPPERCASE. JetBrains Mono is the signal for "utility / metadata" context.

### Spacing

| Token | Value |
|---|---|
| `sidebar-width` | 56px |
| `page-margin` | 32px |
| `card-padding` | 40px |
| `section-gap` | 32px |
| `element-gap` | 12px |
| `stack-gap` | 8px |

### Border radius

| Token | Value |
|---|---|
| Default | 4px (0.25rem) |
| `lg` | 8px (0.5rem) — cards, primary buttons |
| `xl` | 12px (0.75rem) — processing card |
| `full` | 9999px — pill badges, progress bar ends |

### Elevation

Cards: `box-shadow: 0px 4px 20px rgba(30, 41, 59, 0.05)` ("indigo-shadow")
Processing card: `box-shadow: 0px 4px 20px rgba(53, 37, 205, 0.08)` (slightly warmer tint)

### Fonts to load

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```

Material Symbols base settings: `font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`

---

## Layout Shell

### Persistent Sidebar (56px icon rail)

Present on: InputScreen, ProcessingScreen, SuccessScreen, Settings.
Absent on: SetupWizard (full-screen centered flow).

**Structure:**
- Width: 56px, fixed left, full height, `border-right: 1px solid #C7C4D8`, `background: #F9F9FF`
- Hover expand: grows to 240px, shows nav labels (opacity 0 → 1, `white-space: nowrap`)
- Top: `auto_fix_high` Material Symbol in primary (28px, FILL:1) — the Leaflet PDF logo mark
- Nav items: 40×40px, rounded-lg, icon centered; active = `bg-active-indicator (#E2DFFF)` + `color: primary`; inactive = `color: on-surface-variant`, hover shifts to primary
- Bottom (pinned): Settings gear icon

**Nav items for v2:**
- New Document (`add_box` icon) — primary nav action
- Settings (`settings` icon) — bottom pinned

### Main content canvas

`margin-left: 56px`, `display: flex`, `justify-content: center`, `padding: 48px 32px`

### Card (Intake Card)

`max-width: 900px`, `width: 100%`, `background: #FFFFFF`, `border: 1px solid #C7C4D8`, `border-radius: 8px`, `padding: 40px`, indigo-shadow

---

## Screen Specifications

### Screen 1: InputScreen (New Document)

**Reference:** `new_document_home_corrected/` (HTML + screenshot)
**Route:** App default / after "New Document" nav

#### Layout

Sidebar + centered 900px card. Card scrolls if content overflows viewport height.

#### Card content (top to bottom)

**Header block** (`mb-10`):
- Eyebrow: `"NEW DOCUMENT"` — `label-sm`, gray (`#9CA3AF`), `uppercase`, `tracking-widest`
- H1: `"Transform your source."` — `font-h1`, 28px bold, `color: on-surface`

**Tab switcher:**
- Three text tabs: `PASTE TEXT` | `IMPORT FILE` | `YOUTUBE URL`
- Typography: `label-md` (JetBrains Mono, 12px, 600, uppercase, 0.05em tracking)
- Active tab: `color: primary`, `border-bottom: 2px solid #3525CD`
- Inactive tab: `color: on-surface-variant`, hover → primary (transition)
- Container: `border-bottom: 1px solid #C7C4D8`, `margin-bottom: 32px`
- Switching tabs clears previous input; only one panel visible at a time

**Paste Text panel** (active by default):
- Textarea: `height: 320px`, `padding: 24px`, `border: 1px solid #C7C4D8`, `border-radius: 8px`
- Focus state: `border-color: primary`, `ring: 2px rgba(53,37,205,0.1)`
- Placeholder: `"Paste your raw transcript, article, or notes here for high-fidelity conversion..."`, color `#9CA3AF`
- Character counter (bottom-right, absolute): `"{n} / 100,000"` — `label-sm`, color `#9CA3AF`
- Counter updates live on input

**Import File panel** (tab 2 — not designed in Stitch; derive from design system):
- Replace textarea with a drop zone: dashed border, centered icon (`upload_file` Material Symbol), label `"Drop a .md or .txt file, or click to browse"`
- On file selected: show filename + file size + clear button
- Same border/focus/error styling as textarea

**YouTube URL panel** (tab 3 — not designed in Stitch; derive from design system):
- Single text input (not textarea): `placeholder="https://youtube.com/watch?v=..."`, full width, same border/focus styling
- Below input: `body-sm` hint text in `on-surface-variant`: `"Transcript will be automatically extracted"`

**Title input** (`DOCUMENT TITLE`):
- Label: `label-sm`, `color: #9CA3AF`, uppercase, `tracking-wider`
- Input: `px-4 py-3`, `border: 1px solid #C7C4D8`, `border-radius: 8px`, focus same as textarea
- Placeholder: `"e.g., Q3 Strategy Deep Dive"`, color `#9CA3AF`
- Optional — if empty, AI derives title

**Style selector** ⚠️ *Not in Stitch design — must be added*:
- Add between Title input and Submit button
- Label: `"OUTPUT STYLE"` — `label-sm`, gray, uppercase
- Two-option toggle or segmented control: `Orbital Light` (default, selected) | `Orbital Night`
- Selected state: primary border + `surface-container-low` background
- Unselected: `outline-variant` border, white background
- Use same selection pattern as provider cards in SetupWizard

**Submit button:**
- Text: `"Generate Reading Artifact ⚡"`
- Height: 48px, full width, `border-radius: 8px`, `background: #3525CD`, `color: white`, bold
- Hover: `bg-opacity-90`; active: `scale-[0.98]`
- Box shadow: `0 0 15px rgba(53, 37, 205, 0.1)` (indigo glow)
- Disabled state: `opacity: 50%`, `cursor: not-allowed` — when no valid input present

**Inline validation errors** (below the relevant field):
- Typography: `body-sm`, `color: error (#BA1A1A)`
- Examples: `"Content required"` / `"Only .md and .txt files are supported"` / `"Please enter a valid YouTube URL"`
- Appear without page reload; disappear when input becomes valid

---

### Screen 2: ProcessingScreen

**Reference:** `processing_artifact_corrected/` (HTML + screenshot)

#### Layout

Sidebar (56px) + centered card (`max-width: 1000px`, note: wider than InputScreen's 900px). `border-radius: 12px` (xl).

#### Card content

**Header block** (`mb-section-gap`, flex row, space-between):
- Left:
  - Eyebrow: `"Current Process"` — `label-md`, primary, uppercase, tracking-wider
  - H1: document title — `font-h1 text-h1 text-text-heading`
  - Subtitle: one-line description — `body-md`, `on-surface-variant`, `max-width: 32rem`
- Right: icon badge — `bg-primary-fixed`, `padding: 12px`, `border-radius: 8px`, Material Symbol relevant to content type (e.g., `article`, `biotech`, `smart_display` for YouTube)

**Two-column grid** (`grid-cols-12`, gap 48px):

**Left column (5/12) — Vertical Stepper:**

Connector line: `position: absolute`, `left: 19px`, `top: 4px → bottom: 4px`, `width: 2px`, `background: outline-variant`. Fill bar shows progress: `background: primary`, `height: {progress}%`, animated transition.

Four step nodes:

| State | Circle | Icon | Label color | Opacity |
|---|---|---|---|---|
| Done | `bg-primary`, white icon | `check` (wght 700) | `text-heading` | 100% |
| Active | `bg-primary-fixed`, primary border (2px), pulsing | `sync` (wght 600) | primary | 100% |
| Pending | white bg, `outline-variant` border (2px) | stage-specific | `on-surface-variant` | 50% |

Active step pulse: `animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite` (opacity 1 → 0.5)

Step labels:
- `body-md font-bold` for step name
- `body-sm on-surface-variant` for sub-label (status description)

Stage-specific icons (Material Symbols):
- Extracting: `download` or `input`
- Transforming: `sync`
- Validating: `verified_user`
- Rendering: `draw`

**Retry state:** When `pipeline:retry` event fires, replace the active step label with `"Retrying — attempt N of 3"` in primary color, `body-sm`. Step node stays as active (pulsing).

**Right column (7/12) — Live Log Panel:**

Container: `bg-surface-container-lowest`, `border: 1px solid outline-variant`, `border-radius: 8px`, `height: 100%`, `padding: 24px`, `min-height: 400px`, flex column.

Header row:
- Left: `"System Logs"` — `label-sm`, `outline`, uppercase
- Right: pulsing dot (`w-2 h-2 rounded-full bg-primary`) + `"LIVE TRANSMISSION"` — `label-sm`, primary

Log entries (scrollable, `custom-scrollbar`):
- Each entry: flex row, gap-3 — `timestamp` (label-md, outline) + `message` (label-md, on-surface-variant)
- Active/highlighted line: `color: on-primary-fixed-variant` (indigo), bold
- Latest entry: `animate-pulse`
- Auto-scroll: `logContainer.scrollTop = logContainer.scrollHeight` on interval

Progress bar (bottom of log panel):
- Label row: `"Overall Progress"` (body-sm, semibold) + `"{n}%"` (label-md, primary)
- Bar: `height: 6px`, `background: outline-variant`, `border-radius: full`, inner fill `background: primary`, animated width

**Footer** (`border-top: 1px solid outline-variant`, `padding-top: 32px`, flex space-between):
- Left: `info` icon + `body-sm on-surface-variant` — `"Typical processing time for this volume is 45–60 seconds."`
- Right: `"Cancel process"` button — `border: 1px solid error`, `color: error`, `border-radius: 8px`, `height: 48px`, `px-6`, hover `bg-error/5`; icon: `close` (rotates 90° on hover)

> **Note on Cancel:** Not in PRD requirements. Keep in design for UX completeness but do not wire to pipeline logic in v2 — button can close the window or show "Are you sure?" without interrupting the pipeline. Flag as a deferred requirement if needed.

---

### Screen 3: SetupWizard

**Reference:** `setup_connect_provider_final/` and `setup_connect_provider_corrected/` (HTML + screenshots)

**Note:** Two versions exist. Use `_final` as canonical. The `_corrected` version adds a sidebar with settings icon active — use the `_final` version's no-sidebar centered layout for the wizard flow.

#### Layout

No sidebar. Full-screen centered flex column. Background: `#F9F9FF`.

#### Header (above card)

- Leaflet PDF logo: `auto_fix_high` Material Symbol (FILL:1, 32px, primary) + `"Leaflet PDF"` h1 in primary
- Step indicator: `"SETUP · STEP 2 OF 4"` — `label-md`, JetBrains Mono, `outline`, uppercase, `margin-top: 8px`

#### Card (900px, `rounded-xl`)

**Header block** (`mb-section-gap`):
- H2: `"Connect your AI provider"`
- Body: descriptor paragraph — `body-md`, `on-surface-variant`, `max-width: 600px`

**Provider selection grid** (2 columns, `gap: element-gap`):

**Selected state** (Cloud, default):
- `border: 2px solid primary`, `background: surface-container-low (#F5F2FF)`
- Top-right: `check_circle` icon (FILL:1, primary)
- Icon circle: `bg-primary/10`, primary icon

**Unselected state** (Local):
- `border: 1px solid outline-variant`, `background: white`
- Top-right: `radio_button_unchecked` → changes to `check_circle` on select
- Icon circle: `bg-surface-container`, `on-surface-variant` → primary on hover

Card content per option:
- Icon circle: 48×48px, `border-radius: full`
- H3: provider name
- Body-sm: one-line description

Provider specs for Leaflet PDF:
- **Cloud:** icon `cloud`, label `"Cloud"`, description `"Connect via Anthropic API. No local setup required."`
- **Local:** icon `database`, label `"Local"`, description `"Connect via Ollama. 100% data residency and maximum privacy control."`

**Action footer** (`border-top: 1px solid outline-variant`, `padding-top: 24px`, flex space-between):
- Left: `"← Back"` text link — `body-md`, `on-surface-variant`, hover → primary; arrow icon translates -4px on hover
- Right: `"Continue"` button — `height: 48px`, `px-8`, primary fill, bold, disabled opacity 50% if no selection

**Footer meta** (below card):
`"Step 2 of 4: Environment Configuration"` — `body-sm`, `outline-variant`, centered

#### Wizard step sequence (4 steps total — only step 2 designed)

| Step | Title | Content |
|---|---|---|
| 1 | Welcome | Intro screen — what Leaflet PDF is, what setup requires |
| 2 | Connect Provider | Cloud (Anthropic) or Local (Ollama) — **designed** |
| 3 | API Key / Connection | API key input (cloud) or Ollama base URL (local) + Test Connection |
| 4 | Confirm | Model slot assignments shown; "Start Using Leaflet PDF" CTA |

> Steps 1, 3, 4 are not designed in Stitch. Derive from the design system. Step 3 uses the same input field styling as the InputScreen. "Test Connection" is a secondary button alongside Continue.

---

### Screen 4: SuccessScreen

**Reference:** `success_artifact_ready_final/` (HTML + screenshot). Use `_final` as canonical.

#### Layout

Sidebar (56px) + centered card (max-width 900px). Card uses `animate-success` scale-in on mount: `transform: scale(0.9) → scale(1)`, `opacity: 0 → 1`, `0.5s cubic-bezier(0.16, 1, 0.3, 1)`.

#### Card content

**L-bracket corner decoration** (top-left, absolute positioned):
- `width: 32px`, `height: 32px`, `border-top: 2px solid primary`, `border-left: 2px solid primary`
- Position: `top: 6px`, `left: 6px`

**Success visual:**
- Circle: `width: 96px height: 96px`, `border-radius: full`, `bg-primary-fixed`
- Icon: `check_circle` Material Symbol, 48px, primary, FILL:1, wght:700
- Glow: `filter: drop-shadow(0 0 12px rgba(53, 37, 205, 0.2))`
- Hover: `scale(1.05)` transition

**Identity block** (centered, below visual):

Status badge (pill):
- `bg-surface-container`, `border: 1px solid rgba(53,37,205,0.1)`, `border-radius: full`, `px-3 py-1`
- Pulsing dot: `w-2 h-2 rounded-full bg-primary-container animate-pulse`
- Label: `"READY"` — `label-md`, primary, tracking-widest, uppercase

H1: document title — `font-h1 text-text-heading`

File path block:
- Container: `bg-[#F5F2FF]`, `px-4 py-2`, `border-radius: 4px`, `border: 1px solid rgba(53,37,205,0.05)`, inline-flex, gap-2
- Icon: `description` Material Symbol, 16px, primary
- Code: `label-sm`, primary — the full save path

Body: one-line description — `body-md`, `on-surface-variant`, `max-width: 32rem`, centered

**Stats row** (`border-top + border-bottom: 1px solid rgba(outline-variant, 0.3)`, py-4, flex centered, gap-32):
Each stat: label (`label-sm`, outline, uppercase) + value (`h3`, on-surface)
- `FORMAT:` PDF
- `PAGES:` {n}
- `READ TIME:` {n} MIN
Dividers: `width: 1px`, `height: 16px`, `background: outline-variant`

**Technique badges** (centered, flex-wrap, gap-12, `mb-section-gap`):
- Each badge: `px-4 py-1.5`, `bg-[#F5F2FF]`, `border-radius: full`, `label-md`, primary, uppercase, tracking-wider
- Shows applied techniques only: BLUF (always), plus any conditional (MENTAL BUCKETS, JARGON TRANSLATION, FACTS → IMPLICATIONS)
- Source: `TransformedContent.techniqueAudit.applied`

**Actions** (flex row, gap-16, `max-width: 28rem`, centered):

Primary: `"Open PDF"`:
- `flex-1`, `height: 48px`, `bg-primary`, `color: on-primary`, bold, `border-radius: 8px`
- Icon: `picture_as_pdf` (left)
- `box-shadow: 0 4px 8px rgba(53,37,205,0.2)` (shadow-primary/20)
- Action: `shell.openPath(savedPath)`

Secondary: `"New Document"`:
- `flex-1`, `height: 48px`, `bg-surface`, `border: 2px solid outline-variant`, `color: secondary`, bold, `border-radius: 8px`
- Icon: `add_circle` (left)
- Hover: `bg-surface-container-high`
- Action: returns to InputScreen, clears all state

---

### Screen 5: Settings

**Reference:** `settings_corrected/screen.png` (screenshot only — no HTML)

> No HTML was provided for the Settings screen. The screenshot shows the sidebar with the settings icon active (bg-active-indicator). Derive the Settings screen layout from the design system and FEAT-007 requirements. The component structure (provider status cards, model slot rows) follows the same card/grid patterns established in the other screens.

Key implementation points from UX-DR8:
- Sidebar: settings icon active state (bg-active-indicator, primary icon)
- Main card: same 900px width, 40px padding
- **Providers section**: heading `"PROVIDERS"` (label-sm, gray, uppercase) → status cards per configured provider (provider name, connection status dot, API key masked as `••••••••`)
- **Model Slots section**: heading `"MODEL SLOTS"` → two rows: Transformation / Validation+Utility; each shows provider name + model name + Edit button (pencil icon or "EDIT" label-sm)
- Edit opens inline editor (same row expands) — not a modal
- Ollama guidance note shown when Ollama is configured: `"Minimum 8GB VRAM recommended. Fidelity retry rate may be higher with local models."` — body-sm, on-surface-variant

---

### Screen 6: ErrorScreen

**Not designed in Stitch.** Derive from the design system.

Layout: Sidebar + centered card (900px).

Suggested structure:
- Card header: `"PROCESS FAILED"` eyebrow (label-sm, error color), stage name as H1 (e.g., `"Extraction Failed"`)
- Error icon: `error` Material Symbol (48px, error color) in a `bg-error-container` circle
- Error cause: `body-md`, `on-surface-variant`
- Example causes: `"No transcript available for this video"` / `"Validation failed after 3 attempts — fidelity check could not be satisfied"` / `"AI provider returned an error: {message}"`
- Action button: `"Start Over"` — primary button, full width, returns to InputScreen

**Critical language rules:**
- Name the stage: `"Extraction Failed"` not `"Something went wrong"`
- State the cause directly
- No apologetic language: no "Sorry", "Unfortunately", "We're having trouble"

---

## Interaction Patterns

### Tab switching (InputScreen)

```javascript
tabs.forEach(tab => tab.addEventListener('click', () => {
  tabs.forEach(t => t.classList.remove('text-primary', 'tab-border-active'));
  tab.classList.add('text-primary', 'tab-border-active');
  // clear prior input + errors
}));
```

### Provider selection (SetupWizard)

Toggle: clicking a card adds `border-2 border-primary bg-surface-container-low` to selected, removes from deselected. Checkmark icon changes between `check_circle` (FILL:1) and `radio_button_unchecked`.

### Character counter (InputScreen)

```javascript
textarea.addEventListener('input', () => {
  charCount.textContent = textarea.value.length.toLocaleString();
});
```

### Log auto-scroll (ProcessingScreen)

```javascript
setInterval(() => { logContainer.scrollTop = logContainer.scrollHeight; }, 500);
```

### Success animation (SuccessScreen)

```css
@keyframes scale-in {
  0%  { transform: scale(0.9); opacity: 0; }
  100%{ transform: scale(1);   opacity: 1; }
}
.animate-success { animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
```

---

## Component Library

### Sidebar icon button (nav item)

```
w-10 h-10, border-radius: 8px
Active:  bg-active-indicator (#E2DFFF), text-primary
Inactive: text-on-surface-variant, hover → text-primary + bg-surface-container
```

### Primary button

```
height: 48px, bg-primary (#3525CD), text-on-primary, font-bold, border-radius: 8px
Hover: bg-opacity-90
Active: scale-[0.98]
Disabled: opacity-50, cursor-not-allowed
```

### Secondary button

```
height: 48px, bg-surface, border: 2px solid outline-variant, text-secondary, font-bold, border-radius: 8px
Hover: bg-surface-container-high
```

### Text input / textarea

```
border: 1px solid outline-variant (#C7C4D8), border-radius: 8px
Focus: border-color: primary, ring: 2px rgba(53,37,205,0.1)
Placeholder: color #9CA3AF
```

### Pill badge (technique)

```
px-4 py-1.5, bg-[#F5F2FF], border-radius: full
font: label-md (JetBrains Mono 12px 600), color: primary, uppercase, tracking-wider
```

### Selection card (provider / style)

```
Selected:  border: 2px solid primary, bg: surface-container-low (#F5F2FF), check_circle icon (FILL:1, primary)
Unselected: border: 1px solid outline-variant, bg: white, radio_button_unchecked → check_circle on hover
Transition: border-color, background-color, 300ms
```

### Custom scrollbar

```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #C7C4D8; border-radius: 10px; }
```

---

## Design Gaps to Resolve Before Implementation

| Gap | Screen | Impact | Notes |
|---|---|---|---|
| Style selector (Orbital Light / Orbital Night) | InputScreen | FR-020 | Not in Stitch design; add between title field and submit button using selection card pattern |
| File Import tab panel | InputScreen | FR-002 | Not designed; derive drop-zone from design system |
| YouTube URL tab panel | InputScreen | FR-003 | Not designed; derive single-input panel from design system |
| SetupWizard steps 1, 3, 4 | SetupWizard | FEAT-007 | Only step 2 designed; derive remaining steps from design system patterns |
| ErrorScreen | — | FR-006 | Not designed in Stitch; derive from design system per spec above |
| Settings screen HTML | Settings | FEAT-007 | Screenshot only; derive from design system and FEAT-007 spec |

---

## Source File Reference

| Screen | Canonical HTML | Screenshot |
|---|---|---|
| InputScreen | `new_document_home_corrected/code.html` | `new_document_home_corrected/screen.png` |
| ProcessingScreen | `processing_artifact_corrected/code.html` | `processing_artifact_corrected/screen.png` |
| SetupWizard (Step 2) | `setup_connect_provider_final/code.html` | `setup_connect_provider_final/screen.png` |
| SuccessScreen | `success_artifact_ready_final/code.html` | `success_artifact_ready_final/screen.png` |
| Settings | — (no HTML) | `settings_corrected/screen.png` |
| ErrorScreen | — (not designed) | — |
| Design system | `LEAFLETPDF_design_system/DESIGN.md` | — |

All source files: `C:\Users\Jason\Downloads\stitch_LEAFLETPDF_saas_interface_design\`
