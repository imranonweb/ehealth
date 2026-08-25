---
name: E-Health
description: Connecting Nation's Health — a centralized digital medical record for Bangladesh
colors:
  verified-teal: "#0D9488"
  verified-teal-deep: "#0F766E"
  verified-teal-wash: "rgba(13, 148, 136, 0.08)"
  verified-teal-dark: "#14B8A6"
  verified-teal-dark-lift: "#2DD4BF"
  verified-teal-dark-wash: "rgba(20, 184, 166, 0.12)"
  record-blue: "#2563EB"
  record-blue-wash: "rgba(37, 99, 235, 0.08)"
  assay-purple: "#7C3AED"
  assay-purple-wash: "rgba(124, 58, 237, 0.08)"
  confirm-green: "#16A34A"
  caution-amber: "#D97706"
  alert-red: "#DC2626"
  alert-red-deep: "#B91C1C"
  slate-ink: "#0F172A"
  slate-secondary: "#475569"
  slate-muted: "#64748B"
  paper: "#FFFFFF"
  paper-app: "#F8FAFC"
  paper-muted: "#F1F5F9"
  rule: "#E2E8F0"
  rule-subtle: "#F1F5F9"
  rule-strong: "#CBD5E1"
  night-app: "#0B1120"
  night-surface: "#111827"
  night-surface-elevated: "#172033"
  night-surface-muted: "#1A2438"
  night-rule: "#253044"
  night-rule-strong: "#334155"
  night-ink: "#F8FAFC"
  night-secondary: "#98A2B3"
  scrim: "rgba(15, 23, 42, 0.7)"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "2.875rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.03em"
  title:
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  subtitle:
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontSize: "0.84375rem"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.05em"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
components:
  button-primary:
    backgroundColor: "{colors.verified-teal}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    typography: "{typography.body-small}"
  button-primary-hover:
    backgroundColor: "{colors.verified-teal-deep}"
    textColor: "{colors.paper}"
  button-secondary:
    backgroundColor: "{colors.paper-muted}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.slate-secondary}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-danger:
    backgroundColor: "{colors.alert-red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-sm:
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  button-lg:
    rounded: "{rounded.lg}"
    padding: "12px 20px"
  button-icon:
    rounded: "{rounded.md}"
    padding: "8px"
    width: "36px"
    height: "36px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.md}"
    padding: "9px 14px"
  badge:
    rounded: "{rounded.full}"
    padding: "4px 9px"
    typography: "{typography.caption}"
  badge-primary:
    backgroundColor: "{colors.verified-teal-wash}"
    textColor: "{colors.verified-teal-deep}"
    rounded: "{rounded.full}"
    padding: "4px 9px"
  sidebar-link:
    backgroundColor: "transparent"
    textColor: "{colors.slate-secondary}"
    rounded: "{rounded.md}"
    padding: "9px 12px"
  sidebar-link-active:
    backgroundColor: "{colors.verified-teal-wash}"
    textColor: "{colors.verified-teal}"
    rounded: "{rounded.md}"
    padding: "9px 12px"
  timeline-dot:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.md}"
    width: "40px"
    height: "40px"
  avatar:
    backgroundColor: "{colors.verified-teal}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    width: "40px"
    height: "40px"
  search-field:
    backgroundColor: "{colors.paper-muted}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.full}"
    padding: "0 14px 0 36px"
    height: "38px"
---

# Design System: E-Health

## Overview

**Creative North Star: "The Trusted Record"**

One patient. One medical history. One trusted record. Every surface in E-Health answers the same two questions, and answers them without being asked: *can I believe this*, and *who is allowed to see it*. Provenance is never implied — author, institution and timestamp travel with every record, on every surface it appears. Authorization is shown rather than assumed: a provider always sees the scope they hold over the patient in front of them, and a patient always sees who holds scope over them.

The register is calm, clinical, precise, and institutional. This reads as infrastructure that will still be standing in ten years, not as a product launched this quarter. It is deliberately dense — information-rich, fast to scan, built for someone doing this all day rather than someone admiring it. Body text sits at 15px, secondary text at 13.5px, and controls are compact (a 10px/16px primary button, a 38px search field). That density is a professional courtesy, not an accident, and it is the reason the system leans on hairline rules rather than generous padding to separate things.

Structure comes from 1px rules and tonal steps in a slate neutral field; a single teal accent carries action and authorization; and three fixed hues label the three kinds of clinical record so a prescription is never mistaken for a lab result. Depth is nearly absent by design. The one confirmed anti-reference is the **consumer wellness app** — no rounded-everything pastel gradients, no mascots, no streaks, no gamified encouragement. This is a medical record.

**Key Characteristics:**

- Slate neutral field with exactly one accent hue and three fixed record-type hues
- Hairline-first: a 1px rule does the structural work; shadows sit at 4–8% alpha
- Dense and compact — 15px body, 13.5px secondary, 12px uppercase micro-labels
- Tight negative tracking on display type (−0.035em), positive tracking only on uppercase labels (+0.05em)
- Square, softly-rounded icon tiles; circles reserved for avatars and status pills
- Fully specified dark theme, not an inverted afterthought
- Motion is short and functional: 150ms and 250ms, one easing curve, `prefers-reduced-motion` honored

## Colors

A cool slate field carrying one teal voice of authority and three fixed hues that identify what kind of record you are looking at.

### Primary

- **Verified Teal** (`#0D9488` light / `#14B8A6` dark): the color of action and authorization. It carries primary buttons, active sidebar state, focus rings, link hover, the flow step numbers, the brand mark gradient, and the role label under the sidebar brand. Its deep variant (`#0F766E`) is the hover state and, critically, the *text* color on wash backgrounds — the raw accent is never used as text on a tinted fill, because it does not hold contrast there.

### Secondary

The three record hues. These are semantic assignments, not a decorative palette:

- **Record Blue** (`#2563EB` light / `#60A5FA` dark): prescriptions. Every prescription icon tile, timeline dot and mock row on every surface.
- **Assay Purple** (`#7C3AED` light / `#A78BFA` dark): diagnostic reports and lab findings.
- **Verified Teal** (as above) doubles as the hospital-visit hue, which is why the accent must stay scarce elsewhere.

### Tertiary

Status, used only for real states:

- **Confirm Green** (`#16A34A` light / `#4ADE80` dark): completed, normal findings, active relationship.
- **Caution Amber** (`#D97706` light / `#FBBF24` dark): warnings, and specifically the AI safety disclaimer, which is the highest-traffic use of this hue in the product.
- **Alert Red** (`#DC2626` light / `#F87171` dark): destructive actions, errors, revoked access.

Each status hue pairs with an 8%-alpha wash of itself (12% in dark) for fills, and a 20%-alpha border.

### Neutral

- **Slate Ink** (`#0F172A`): all primary text and headings; also the basis of every shadow and scrim.
- **Slate Secondary** (`#475569` light / `#98A2B3` dark): body copy, list detail, inactive nav labels.
- **Slate Muted** (`#64748B`, identical in both themes): captions, timestamps, placeholders, uppercase micro-labels, icon defaults.
- **Paper** (`#FFFFFF`) on **Paper App** (`#F8FAFC`): the fundamental tonal step — a white card on an off-white page is what makes a surface read as a surface.
- **Paper Muted** (`#F1F5F9`): recessed fills — secondary buttons, search field, detail panels, mock rows, disabled inputs.
- **Rule** (`#E2E8F0`), **Rule Subtle** (`#F1F5F9`), **Rule Strong** (`#CBD5E1`): the three-weight border vocabulary. Default separates, subtle whispers, strong signals hover or emphasis.
- **Night field** (`#0B1120` app → `#111827` surface → `#172033` elevated → `#1A2438` muted): the dark theme is a genuine four-step ramp with its own `#253044` rules, not a filter over the light theme.

### Named Rules

**The Provenance Palette Rule.** Blue is a prescription, purple is a diagnostic report, teal is a hospital visit. A record type never changes hue between the landing page, a dashboard, a timeline and a drawer. Introducing a fourth record hue means introducing a fourth record type in the database — nowhere else.

**The Scarce Signal Rule.** Verified Teal appears only where the interface is signalling action, active state, or authorization. It is never a background wash for a whole section, never body text, and never used to make something merely look important.

**The Reserved Alarm Rule.** Amber and red are clinical and system vocabulary. Amber means "read this before you rely on it" (its canonical use is the AI disclaimer). Red means destructive or failed. Neither is ever used to draw attention to a feature.

**The Wash-Needs-Deep-Text Rule.** On any 8–12% wash fill, text uses the *deep* variant of that hue (`#0F766E` on teal wash), not the base. The base hue on its own wash does not hold contrast at 12px.

## Typography

**Display / Body / Label Font:** Inter, with `-apple-system`, `BlinkMacSystemFont`, 'Segoe UI', Roboto, Helvetica, Arial fallbacks. Loaded from Google Fonts. One family carries the entire Latin system — there is no display/body pairing, and no mono face.

**Character:** Neutral, high-legibility, and worked hard rather than decorated. The personality comes entirely from weight and tracking discipline: heavy weights (700–800) at large sizes pulled tight with negative letter-spacing, against small, plain 400-weight text at generous line-height. Nothing is italic. Nothing is a second family.

### Hierarchy

- **Display** (800, `2.875rem` → `2.25rem` below 1024px, line-height 1.15, tracking −0.035em): the landing hero headline. This size appears once per page, at most.
- **Headline** (800, `1.75rem`, line-height 1.25, tracking −0.03em): page titles across all four portals (`.h1` / `.page-title`), and the flow step numerals.
- **Title** (700, `1.375rem`, tracking −0.02em): section headings (`.h2`).
- **Subtitle** (600, `1.125rem`): card and panel headings (`.h3`), drawer and modal titles (at `1.0625rem`/700).
- **Body** (400, `0.9375rem`/15px, line-height 1.5): the default reading size, set on `body`. Form controls and buttons sit just below at `0.875rem`.
- **Body Small** (400, `0.84375rem`/13.5px, line-height 1.5): page subtitles, sidebar links, table content, feature lists, toasts. This is the workhorse size of the application shell.
- **Caption** (400, `0.75rem`/12px, line-height 1.4): timestamps, badge text, helper text, mock-card detail.
- **Label** (600, `0.75rem`, uppercase, tracking +0.05em): the only uppercase style in the system. Sidebar group headers (at +0.06em), detail-section headers, footer column headers, field eyebrows.

### Named Rules

**The Tracking Ladder Rule.** Negative tracking scales with size and nothing else: −0.035em at display, −0.03em at headline, −0.02em at title and brand text, and exactly `normal` from `1.125rem` down. The single positive value in the system is +0.05em, and it applies only to uppercase labels. Never letter-space lowercase body text.

**The One Uppercase Rule.** Uppercase is a structural signal for micro-labels only — group headers, section eyebrows, field labels. Buttons, badges, nav items, titles and body copy are always sentence case. A patient's record is never shouted.

**The Bangla Gap Rule.** *Constraint carried from PRODUCT.md, where bilingual Bangla + English is a binding requirement.* Inter does not cover Bengali script, and the fallback stack (`-apple-system`, Segoe UI, Roboto) resolves Bangla inconsistently or not at all across platforms. Any surface that will carry Bangla needs an explicit Bangla-capable family added to the stack, and layouts must tolerate Bangla's text expansion — which the current tight display tracking and 13.5px dense sizes will not absorb without adjustment. This is an open gap, not a solved problem: do not add Bangla copy to a surface without also resolving its type stack.

## Layout

**Two container widths, by surface type.** Application content is capped at **1280px** with `24px 32px` padding (`.dashboard-container`); marketing and public content at **1200px** with `24px` side padding (`.container`). Marketing sections breathe on an 80px vertical rhythm; application pages use a 24px header-to-content gap.

**The app shell** is a fixed 260px sidebar (72px collapsed) beside a 64px sticky navbar, both driven by `--sidebar-width` / `--sidebar-collapsed-width` / `--navbar-height` tokens so the shell geometry is changed in one place.

**Spacing** runs on a 4px base: 4, 8, 12, 16, 20, 24, 32, 40, 48. The scale skips 28, 36 and 44 — a gap that size is a decision to use 24 or 32, not a licence to write a raw value. Grid gaps are 16px (dense 4-up) or 20px (2- and 3-up).

**Density** is high and intentional: compact controls, 13.5px shell text, 9px vertical padding on inputs and nav links.

### Named Rules

**The Two-Stop Collapse Rule.** The application collapses at exactly two breakpoints: **1024px** (sidebar goes off-canvas behind an overlay; 4-up grids become 2-up; 3-up becomes 2-up; container padding drops to `16px 20px`) and **640px** (everything becomes single-column, `.page-header` stacks to a left-aligned column, `.form-row` unstacks to one field per row, container padding drops to 16px). The public landing page adds one earlier stop at **960px** where the horizontal nav becomes a dropdown. Do not invent intermediate breakpoints; adjust one of these three.

**The Grid-Not-Flex Rule.** Multi-column content uses `.grid-2` / `.grid-3` / `.grid-4` with `minmax(0, 1fr)` tracks — the `minmax(0, …)` is deliberate and prevents long clinical strings from blowing out a column. Flex is for toolbars, rows and headers, not for content columns.

## Elevation & Depth

**Hairline-first hybrid.** This system does not use shadows to build hierarchy. Structure comes from a 1px rule and a tonal step — a `#FFFFFF` card on a `#F8FAFC` page, separated by an `#E2E8F0` border. Shadows exist, and every resting card carries one, but at 4–8% alpha they are close to subliminal: they soften the card's edge rather than lift it off the page. Depth becomes visible only on interaction and only for things that genuinely float.

The ramp is deliberately shallow in light mode and deeper in dark, where a shadow has to work harder against a `#0B1120` field.

### Shadow Vocabulary

- **`--shadow-xs`** (`0 1px 2px rgba(15,23,42,0.04)`): primary buttons, timeline dots, the brand tile. A single pixel of separation.
- **`--shadow-sm`** (`0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)`): the resting state of every `.card`. Also the scrolled landing header.
- **`--shadow-md`** (`0 4px 6px -1px rgba(15,23,42,0.07), 0 2px 4px -2px rgba(15,23,42,0.04)`): card hover, and `.card-elevated`. This is the only shadow step that is a *response* to the user.
- **`--shadow-lg`** (`0 10px 15px -3px rgba(15,23,42,0.08), …`): toasts — content that arrives over the page unbidden.
- **`--shadow-xl`** (`0 20px 25px -5px rgba(15,23,42,0.1), …`): drawer, modal, and the open mobile sidebar. Genuinely floating layers, always paired with a scrim.

**Scrims:** `rgba(15,23,42,0.7)` with `blur(4px)` for the drawer, `blur(6px)` for the modal, `rgba(15,23,42,0.6)` with `blur(4px)` for the mobile sidebar. The scrim, not the shadow, is what communicates modality.

### Named Rules

**The Hairline-First Rule.** A 1px rule and a tonal step carry structure. A shadow never substitutes for a border — every card has both, and if you remove the border the card stops reading as a card no matter what you do to the shadow.

**The Whisper Ramp Rule.** Resting elevation never exceeds 8% alpha. `--shadow-md` is reserved for hover, and `lg`/`xl` for layers that float over a scrim. A card that arrives already at `--shadow-lg` has nowhere to go on hover and reads as a mistake.

**The One-Millimetre Lift Rule.** Card hover moves exactly `translateY(-1px)` and steps the border to `--rule-strong`. Not 2px, not a scale. The gesture should be felt more than seen.

## Shapes

A softly-rounded rectilinear language on a 4/6/8/12/16px radius ladder, plus one true pill. Nothing is sharp-cornered and nothing is a blob.

Radius maps to scale and to role, not to taste: **4px** (`xs`) for the smallest chips, **6px** (`sm`) for inline items and small buttons, **8px** (`md`) for the default — buttons, inputs, icon tiles, nav links, detail panels, **12px** (`lg`) for cards, timeline content and large buttons, **16px** (`xl`) for modals, and **9999px** (`full`) for pills.

**Borders** are the primary form-giver, in three weights: `1px` structural (cards, panels, rules), `1.5px` for inputs and the dashed empty-state frame — inputs are visually stronger than surfaces because they are interactive — and `2px` for focus outlines and the timeline spine.

The timeline spine is a 2px vertical line with a 24px minimum height, which sets the minimum rhythm of a record list.

### Named Rules

**The Square-Tile Rule.** Icon containers are rounded squares — 40px at `md` for timeline dots, 36px at `md` for showcase dots, 34px at `sm` for mock rows, 56px at `lg` for empty states. Circles are reserved for exactly two things: avatars and pill-shaped status badges. An icon in a circle reads as consumer software; an icon in a rounded square reads as a record.

**The Pill-Means-Status Rule.** `--radius-full` means "this is a state, not an action" — badges, role pills, the sidebar count badge, the navbar search field. A pill-shaped primary button would misfile itself as a status chip.

## Components

### Buttons

- **Character:** precise and unshowy. They respond immediately, they never perform.
- **Shape:** gently rounded (`8px`), with a transparent 1px border on every variant so that variants swapping border color never shift layout.
- **Primary:** Verified Teal fill, white text, `--shadow-xs`, `10px 16px`, 600 weight at `0.875rem`. Hover deepens to `#0F766E` and steps the shadow to `sm`.
- **Secondary:** `--paper-muted` fill with a `--rule` border and ink text — the default for anything that isn't the one primary action on screen.
- **Outline:** transparent with a `--rule-strong` border.
- **Ghost:** transparent, secondary text; fills with `--paper-muted` and darkens to ink on hover. Used for icon-only and toolbar actions.
- **Danger:** Alert Red fill, white text, deepening to `#B91C1C`.
- **Sizes:** `sm` (`6px 12px`, radius `sm`, `0.8125rem`), `md` (`9px 16px`), `lg` (`12px 20px`, radius `lg`), `icon` (36×36, radius `md`).
- **Focus:** `2px` Verified Teal outline at `2px` offset — never removed, never replaced with a shadow-only ring.
- **Disabled:** `opacity: 0.5` plus `pointer-events: none`.

### Cards / Containers

- **Corner Style:** `12px`.
- **Background:** `--paper` (`--night-surface` in dark), `overflow: hidden` so nested content can't break the corner.
- **Border:** `1px --rule`. Always present. `.card-elevated` trades it for `--rule-subtle` and steps to `--shadow-md`.
- **Shadow Strategy:** `--shadow-sm` at rest; see Elevation.
- **Internal Padding:** `24px` body, `20px 24px` header with a `1px` bottom rule. Card titles are `1rem`/700.
- **Hover** (opt-in via `.card-hover`): border to `--rule-strong`, shadow to `md`, `translateY(-1px)`.

### Inputs / Fields

- **Style:** `--paper` fill, **`1.5px`** `--rule` border, `8px` radius, `9px 14px` padding, `0.875rem`. Fields sit in a `.field` column with a 6px gap under a `0.8125rem`/600 ink label.
- **Focus:** border to Verified Teal plus a `3px` teal-wash ring (`box-shadow: 0 0 0 3px var(--accent-subtle)`) — the ring is additive to the border, not a replacement.
- **With icon:** absolutely positioned at `left: 12px`, `pointer-events: none`, and the input takes `padding-left: 38px`.
- **Disabled:** `--paper-muted` fill, muted text, `opacity: 0.7`.
- **Layout:** `.form-row` is a 2-up grid that collapses to 1-up at 640px.

### Navigation

- **Sidebar** (260px, fixed, `--paper` with a right rule): a brand block at navbar height carrying the gradient tile, the wordmark at `1.0625rem`/800, and the role in Verified Teal uppercase micro-label. Links are `13.5px`/500 at `9px 12px` with a `12px` icon gap and a transparent 1px border. Hover fills `--paper-muted`; **active** fills teal wash, switches text and icon to Verified Teal, goes 600, and takes a `rgba(13,148,136,0.15)` border. Groups are separated by 20px with uppercase `0.6875rem`/700 headers at +0.06em.
- **Navbar** (64px, sticky, `--paper` with a bottom rule): a pill-shaped search field on `--paper-muted` (max 440px, 38px tall) that turns white with a teal ring on focus, and right-side actions.
- **Mobile:** below 1024px the sidebar translates off-canvas and returns over a blurred scrim behind a menu button; a close button appears inside the sidebar.
- **Landing nav** (68px, sticky): text links at `13.5px`/500 that go Verified Teal on hover; gains a shadow and `blur(12px)` once scrolled; collapses to a dropdown at 960px.

### Badges

- **Style:** pill (`--radius-full`), `4px 9px`, `0.75rem`/600, built from three layers of one hue — an 8% wash fill, the hue as text, and a 20% border. Six variants: primary, blue, purple, success, warning, danger.
- **State:** badges are read-only status. An interactive chip does not exist in this system; use a button.

### Signature Component — The Medical Timeline

The component the whole product is organized around, and the one place the North Star is literally visible.

A vertical spine of `40px` rounded-square dots joined by a `2px` `--rule` line (24px minimum segment), each dot tinted with its record-type hue's wash and carrying that hue's icon. Beside each dot sits a `12px`-radius content card on `--paper` with `--shadow-xs`, containing, in fixed order: a meta row (`0.75rem`/600 muted date, plus a pill-shaped type badge), a `0.9375rem`/700 title, a `0.8125rem` secondary-text provider line, a two-line clamped `0.8125rem` muted summary, and a borderless Verified Teal `0.75rem`/600 action link.

That order is the component's argument, and it is not rearrangeable: **when, what kind, what, who, then detail.** The provider line is never optional — a record with no visible author would break the one promise the system makes.

On hover the dot scales to `1.05`, and the content card's border goes Verified Teal with its background stepping to `--surface-elevated`. The whole row is a pointer target that opens the record drawer.

### Motion

Two durations and one curve: `150ms` (`--transition-fast`) for state changes on controls, `250ms` (`--transition-normal`) for theme and layout transitions, both on `cubic-bezier(0.4, 0, 0.2, 1)`. Entrances use a separate decelerating `cubic-bezier(0.16, 1, 0.3, 1)`: `fadeIn` (opacity plus a 4px rise) at 250ms for page containers, modals and toasts; the drawer slides `translateX` at 300ms. Skeletons shimmer a 200%-wide gradient on a 1.5s loop. `prefers-reduced-motion: reduce` collapses all animation and transition to `0.01ms` and disables smooth scrolling — this block is already in place and must survive any refactor.

## Do's and Don'ts

### Do:

- **Do** use the canonical token names — `--text-primary`, `--bg-surface-muted`, `--border-default`, `--accent`. They are the system's real vocabulary.
- **Do** give every card both a `1px --border-default` rule and `--shadow-sm`. Either alone is incomplete.
- **Do** keep record-type hue assignments fixed: blue = prescription, purple = diagnostic report, teal = hospital visit.
- **Do** put icons in rounded squares (`--radius-md`/`--radius-sm`) and reserve `--radius-full` for avatars and status pills.
- **Do** use the deep hue variant for text on any wash fill (`--accent-text` on `--accent-subtle`).
- **Do** collapse at 1024px and 640px only, using the existing `.grid-*` and `.form-row` behavior.
- **Do** state provenance — author, institution, timestamp — on every surface where a clinical record appears.
- **Do** keep the `2px` teal `:focus-visible` outline at `2px` offset on every interactive element.
- **Do** preserve the `prefers-reduced-motion` block when refactoring CSS.
- **Do** place the "Connecting Nation's Health" lockup line beneath the logo wherever the brand mark appears *(binding brand commitment from PRODUCT.md)*.

### Don't:

- **Don't** use the legacy alias tokens in new code — `--text-1`, `--text-2`, `--text-3`, `--surface`, `--surface-2`, `--surface-3`, `--border`, `--primary`, `--r-*`, `--t-*`. They exist only for backwards compatibility with pages written before the canonical set landed. They are frozen: no new aliases, and no new references. *(Note: `--surface-3` is a hardcoded hex rather than an alias, and `--border-subtle-alias` is defined in light theme only and never redefined in dark — two reasons not to build on this layer.)*
- **Don't** add a thick colored border to one side of a card. The `4px border-left` on `.toast-*` is the system's single instance and its worst tell; do not propagate the pattern to cards, panels or list rows.
- **Don't** introduce a second Latin font family. Hierarchy comes from weight (400/500/600/700/800) and the tracking ladder, not from a new face.
- **Don't** letter-space lowercase text, or set uppercase on anything larger than `0.75rem`.
- **Don't** exceed 8% shadow alpha at rest, or start a card at `--shadow-lg`.
- **Don't** add a gradient beyond the two established ones — the `135deg` accent brand tile, and the `135deg` surface-to-muted panel on the AI and CTA blocks. No gradient text, ever.
- **Don't** animate `width`, `margin` or `padding` for anything new. *(`Sidebar.css` transitions `width` and `MainLayout.css` transitions `margin-left`; both are pre-existing layout-thrash and should not be used as precedent.)*
- **Don't** use Verified Teal as body text, as a full-section background, or anywhere it isn't marking action, active state, or authorization.
- **Don't** use amber or red to draw attention to a feature. They are clinical and system vocabulary only.
- **Don't** drift toward the consumer wellness register — no pastel gradients, mascots, streaks, celebratory confetti, or gamified encouragement *(confirmed anti-reference)*.
- **Don't** claim WCAG or any other conformance level anywhere in the product; the governing rubric has not been supplied *(see PRODUCT.md)*.
- **Don't** add Bangla copy to a surface without also resolving its font stack and text-expansion tolerance. Inter does not cover Bengali script.
