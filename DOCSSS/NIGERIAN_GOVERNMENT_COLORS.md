# Nigerian Government Color Scheme

## Purpose

This document defines the official color palette for digital products of **Federal Ministries** of the Federal Republic of Nigeria, including public notice portals, citizen services, and ministry websites.

The palette is derived directly from Nigeria’s national symbols:

- **Flag of Nigeria**: Green and White (agriculture, peace & unity)
- **Coat of Arms of Nigeria**: Black shield (fertile soil), White “Y” (Niger & Benue rivers), Red eagle (strength), White horses (dignity), Green & White wreath, and the yellow/gold national flower (*Costus spectabilis*)

These colors must be used consistently to communicate **official authority**, **national identity**, **trust**, and **public service**.

## Primary Brand Colors

| Token              | Hex       | RGB                | Usage |
|--------------------|-----------|--------------------|-------|
| `primary`          | `#008751` | `rgb(0, 135, 81)`  | Primary brand color. Header bars, primary CTAs, links, active states, ministry identity elements. |
| `primary-dark`     | `#005C38` | `rgb(0, 92, 56)`   | Hover/pressed states for primary elements, dark header variants, emphasis. |
| `primary-light`    | `#00A86B` | `rgb(0, 168, 107)` | Light tints, subtle backgrounds, hover accents on light surfaces. |
| `accent`           | `#C4963A` | `rgb(196, 150, 58)`| Secondary brand accent (inspired by coat of arms gold/yellow elements). Use sparingly for highlights, secondary CTAs, important notices, gold seals. |
| `accent-dark`      | `#8B6914` | `rgb(139, 105, 20)`| Darker gold for contrast on light backgrounds or pressed states. |

## Supporting National Colors

| Token           | Hex       | RGB                 | Usage |
|-----------------|-----------|---------------------|-------|
| `eagle-red`     | `#B91C1C` | `rgb(185, 28, 28)`  | Alert states, critical notices, strength/urgency elements (references the red eagle). Use with care. |
| `white`         | `#FFFFFF` | `rgb(255, 255, 255)`| Dominant surface, peace & unity. Primary background. |

## Neutrals & Surfaces

| Token               | Hex       | RGB                 | Usage |
|---------------------|-----------|---------------------|-------|
| `canvas`            | `#FFFFFF` | `rgb(255, 255, 255)`| Default page background. |
| `surface-1`         | `#F8FAFC` | `rgb(248, 250, 252)`| Subtle section bands, input fields, alternate rows, card backgrounds. |
| `surface-2`         | `#F1F5F9` | `rgb(241, 245, 249)`| Deeper surface lifts, disabled states, separators. |
| `hairline`          | `#E2E8F0` | `rgb(226, 232, 240)`| 1px borders, dividers, card strokes. |
| `hairline-strong`   | `#CBD5E1` | `rgb(203, 213, 225)`| Stronger borders or focus states. |
| `ink`               | `#0F172A` | `rgb(15, 23, 42)`   | Primary text, headlines — near-black for maximum authority and readability. |
| `ink-muted`         | `#475569` | `rgb(71, 85, 105)`  | Secondary text, meta information, captions. |
| `ink-subtle`        | `#64748B` | `rgb(100, 116, 139)`| Tertiary text, placeholders, disabled text. |
| `inverse-canvas`    | `#0F172A` | `rgb(15, 23, 42)`   | Dark footer or inverse surfaces (charcoal for authority). |
| `inverse-surface-1` | `#1E2937` | `rgb(30, 41, 55)`   | Subtle inverse elevations. |

## Semantic Colors

| Token            | Hex       | RGB                | Usage |
|------------------|-----------|--------------------|-------|
| `success`        | `#15803D` | `rgb(21, 128, 61)` | Success states, approved notices, positive actions. |
| `warning`        | `#B45309` | `rgb(180, 83, 9)`  | Warning states, attention required. |
| `error`          | `#B91C1C` | `rgb(185, 28, 28)` | Error states, critical alerts (aligns with `eagle-red`). |
| `info`           | `#1D4ED8` | `rgb(29, 78, 216)` | Informational badges, links in neutral contexts. |

## Usage Guidelines

### Primary Identity
- Always lead with Nigerian Green (`primary` `#008751`) for ministry branding.
- Use the full name or ministry-specific logo lockup alongside the green.
- Gold (`accent`) should be used as a secondary highlight only — never as the dominant color.

### Hierarchy
- White (`canvas`) is the default ground.
- Use `surface-1` and `surface-2` for visual separation without heavy shadows.
- Reserve `primary` for the most important actions and identity elements.
- Use `accent` (gold) for high-value notices, “official” callouts, or premium ministry features.

### Accessibility
- All text on `canvas` or `surface-1` must meet WCAG AA contrast (preferably AAA for government).
- `ink` (#0F172A) on white provides excellent contrast.
- Never place light text on green without sufficient contrast testing.

### Footer & Headers
- Ministry header bars and top navigation typically use `primary` green.
- Footers may use `inverse-canvas` (dark charcoal) or a deep green variant for authority and to separate from content.
- Include the national motto “Unity and Faith, Peace and Progress” where appropriate in footers.

### Prohibited
- Do not introduce other brand colors (corporate blues, purples, bright oranges, etc.).
- Do not use pastel or low-contrast tints of green.
- Do not replace the primary green with a different shade of green.

## References

- Flag of Nigeria — Green: `#008751`, White: `#FFFFFF`
- Coat of Arms of Nigeria:
  - Shield: Sable (black)
  - Pall: Argent (white)
  - Eagle: Gules (red)
  - Wreath & supporters: Argent & Vert
  - National flower: Yellow/gold tones

## Versioning

This is the baseline palette for all Federal Ministry digital experiences. Individual ministries may define limited extensions (e.g., a specific ministry secondary accent) but must always anchor to the core national colors defined here.

---

**File location**: `NIGERIAN_GOVERNMENT_COLORS.md` (sibling to `DESIGN.md`)
