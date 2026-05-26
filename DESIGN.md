---
name: StockWise
description: Modern inventory management for small business owners
colors:
  primary: "#6366f1"
  neutral-bg: "#f8fafc"
  neutral-fg: "#0f172a"
  neutral-card: "#ffffff"
  neutral-muted: "#f1f5f9"
  muted-fg: "#64748b"
  neutral-border: "#e2e8f0"
  destructive: "#ef4444"
  dark-bg: "#090d16"
  dark-fg: "#f8fafc"
  dark-card: "#0f1524"
  dark-muted: "#131929"
  dark-muted-fg: "#94a3b8"
  dark-border: "#1e293b"
  dark-ring: "#818cf8"
typography:
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.2
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.05em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  pill: "40px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "#6366f1cc"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-fg}"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
  button-secondary:
    backgroundColor: "{colors.neutral-muted}"
    textColor: "{colors.neutral-fg}"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
  button-ghost:
    backgroundColor: "transparent"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
  input:
    backgroundColor: "transparent"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    size: "32px"
  badge-default:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
  badge-secondary:
    backgroundColor: "{colors.neutral-muted}"
    textColor: "{colors.neutral-fg}"
    rounded: "{rounded.pill}"
  card:
    backgroundColor: "{colors.neutral-card}"
    rounded: "{rounded.xl}"
    padding: "20px"
---

# Design System: StockWise

## 1. Overview

**Creative North Star: "The Inventory Desk"**

StockWise is a clear, efficient workspace for small business owners who need to understand their inventory health and act on it without friction. The interface is quiet but precise: light slate neutrals carry the structure, while indigo appears sparingly as a functional signal (primary actions, focus indicators, active state). Every surface is theme-aware by default, switching between a bright airy light mode and a deep navy dark mode with the same indigo anchor.

The system explicitly rejects overstyled dashboards, heavy gradients, decorative glassmorphism, and anything that looks like a generic admin template. Data is the hero. Cards rest on subtle shadows with gentle hover lifts. Tables are lean and scrollable. Modals appear only after inline alternatives are exhausted.

**Key Characteristics:**
- Clean, airy slate background with a single indigo accent used sparingly (under 10% of any screen)
- Cards on a flat surface with subtle shadows and purposeful hover elevation
- Uniform border radius cascade: 10px for inputs, buttons, and KPI cards; 14px for section containers; pill for badges
- Indigo focus ring (3px, 50% opacity) as the universal interactive indicator
- Fully theme-adaptive: every color token switches between light and dark variants

## 2. Colors

A restrained palette of cool slate neutrals anchored by a single indigo accent.

### Primary
- **Clear Indigo** `#6366f1` (`oklch(0.62 0.185 285)`): Primary buttons, active nav indicators, focus rings, link text. Used on under 10% of any given screen.

### Neutral
- **Pale Mist** `#f8fafc`: Light mode page background.
- **Deep Ink** `#0f172a`: Light mode text color (foreground).
- **Cloud White** `#ffffff`: Light mode card surface.
- **Subtle Slate** `#f1f5f9`: Light mode secondary surfaces, muted backgrounds.
- **Dusty Slate** `#64748b`: Light mode muted text (labels, placeholders, secondary info).
- **Soft Line** `#e2e8f0`: Light mode borders and input strokes.

### Dark Neutrals
- **Midnight Void** `#090d16`: Dark mode page background.
- **Snow Mist** `#f8fafc`: Dark mode text color.
- **Deep Navy** `#0f1524`: Dark mode card surface.
- **Shadow Navy** `#1e293b`: Dark mode secondary surfaces, borders and input strokes.
- **Dark Trench** `#131929`: Dark mode muted surface.
- **Muted Steel** `#94a3b8`: Dark mode muted text.

### Semantic
- **Alert Red** `#ef4444` (`oklch(0.55 0.2 25)`): Destructive actions, error states, out-of-stock indicators. Appears only for its functional role.

### The Indigo Signal Rule
The indigo accent (`#6366f1`) is reserved for interactive signaling. It appears on primary buttons, focus rings, active nav links, and hover glows. It does not appear on static decorative elements. If indigo is on a surface, that surface is actionable or focused.

## 3. Typography

**Body Font:** Inter (default sans-serif stack: `Inter, ui-sans-serif, system-ui, sans-serif`)

A single sans-serif stack for the entire interface. Inter's moderate x-height and tight letterforms keep data-dense screens legible at small sizes. Hierarchy is achieved through weight contrast (400 body vs 700 heading) and scale, not font switching.

### Hierarchy
- **Display** (700, `clamp(1.75rem, 3vw, 2rem)` / 1.2): Page titles (Products, Categories, etc.). Bold enough to anchor the page without decoration.
- **Headline** (700, `1.125rem` / 1.3): Card titles, KPI values, dialog headings.
- **Title** (600, `0.9375rem` / 1.4): Section labels, table header text, sidebar links.
- **Body** (400, `0.875rem` / 1.5): Paragraphs, table cells, form labels. Max line length 75ch.
- **Label** (600, `0.75rem` / 1, `0.05em` letter-spacing, uppercase): Badge text, table column headers, chip labels. Compact and distinctive through tracking and case.

### The No-Hierarchy-Via-Font Rule
One font family. Every hierarchy step is a combination of size, weight, and (for labels) letter-spacing. No serif, no mono, no decorative typefaces. The typography gets out of the way.

## 4. Elevation

The system uses a hybrid approach: tonal layering for structure (background vs card vs muted surfaces create depth through color, not shadow) and subtle shadows for interactive feedback. At rest, cards sit flat on the page surface; they lift on hover.

### Shadow Vocabulary
- **Card Rest** (`shadow-sm` equivalent, `0 1px 2px 0 rgba(0,0,0,0.05)`): Default card elevation. Barely perceptible.
- **Card Hover** (`shadow-md`, `0 4px 6px -1px rgba(0,0,0,0.1)`): Cards lift on hover, paired with `hover:-translate-y-1` for 4px vertical movement.
- **Dialog / Modal** (`shadow-lg`, `0 10px 15px -3px rgba(0,0,0,0.1)`): Raised above all page content.

### The Flat-By-Default Rule
Surfaces are at rest on the same plane. Shadows appear only as a response to state (hover, focus, elevated context). No decorative shadows on static elements.

## 5. Components

### Buttons
- **Shape:** Rounded with a 10px radius (`rounded-lg`). Border transparent by default.
- **Primary:** Indigo surface (`#6366f1`), white text, 10px horizontal / 4px vertical padding. Hover reduces primary opacity to 80%.
- **Outline:** Transparent surface, border matching the input stroke color. Hover fills with muted background.
- **Secondary:** Muted slate surface (`#f1f5f9` light / `#1e293b` dark). Hover reduces surface opacity to 80%.
- **Ghost:** Transparent surface. Hover fills with muted background.
- **Destructive:** Red tinted surface at 10% opacity, red text. Hover double the tint.
- **States:** 3px indigo focus ring at 50% opacity on `focus-visible`. 1px downward translation on click press (`translate-y-px`). Disabled at 50% opacity, no pointer events.

### Inputs
- **Style:** Clear background, 10px radius, 32px height, 10px horizontal padding. Border stroke (`#e2e8f0` light / `#1e293b` dark).
- **Focus:** Border shifts to indigo, 3px indigo focus ring at 50% opacity.
- **Placeholder:** Muted foreground (`#64748b` light / `#94a3b8` dark).
- **Error:** Red border and red focus ring (`aria-invalid`).
- **Disabled:** 50% opacity, subtle tinted background, no pointer events.

### Badges
- **Shape:** Fully pill-shaped (40px radius), 20px height, 8px horizontal padding.
- **Default:** Indigo surface, white text.
- **Secondary:** Muted slate surface.
- **Destructive:** Red tinted surface at 10% opacity, red text.
- **Outline:** Transparent, border stroke color.
- **Ghost:** Transparent, text inherits parent color.

### Cards / Containers
- **Corner Style:** 10px radius for KPI cards, 14px radius for section containers.
- **Background:** Card token (white light / deep navy dark).
- **Border:** Border stroke token (`#e2e8f0` light / `#1e293b` dark).
- **Shadow Strategy:** Shadow-sm at rest, shadow-md on hover. Resting cards are deliberately flat.
- **Hover:** 4px upward lift (`hover:-translate-y-1`) with colored border glow and enhanced shadow.
- **Internal Padding:** 20px as default, 24px for section cards.

### Navigation (Sidebar)
- **Style:** Fixed dark navy sidebar (`#0f172a`), always dark regardless of page theme. 64px header with brand icon.
- **Link Typography:** 14px medium weight, 12px horizontal padding, 10px vertical padding, rounded corners.
- **Inactive:** Muted slate text, hover fills with dark slate background.
- **Active:** Indigo-tinted gradient background, white text, 2px indigo left border accent.

### Tables
- **Structure:** Flat header (`text-xs uppercase tracking-wider`), bordered rows (`border-b`), hover row tint.
- **Header:** Muted foreground text, compact dimensions (40px height, 8px horizontal padding).
- **Cells:** 8px padding, no wrapping, monospace for SKU values.
- **Wrapper:** Horizontal scroll on overflow (`table-wrapper`), touch-scroll on mobile.

## 6. Do's and Don'ts

### Do:
- **Do** use the indigo accent exclusively for interactive signaling (buttons, focus rings, active nav).
- **Do** keep cards visually flat at rest; let their border and background define the surface, not a shadow.
- **Do** apply the radius cascade consistently: 10px for inputs and buttons, 14px for section containers, pill for badges.
- **Do** use muted foreground (`#64748b` / `#94a3b8`) for secondary text, metadata, and placeholder content.
- **Do** make every component theme-aware by using CSS variable tokens.

### Don't:
- **Don't** use hardcoded color values (`text-slate-900`, `bg-white`) that break in dark mode.
- **Don't** use gradient text (`background-clip: text` with gradient). Emphasis comes from weight and size.
- **Don't** use side-stripe borders (colored `border-left`/`border-right` > 1px) on cards or list items.
- **Don't** add decorative glassmorphism (blurred backgrounds on non-functional elements).
- **Don't** use the hero-metric template (big number, small label, gradient accent).
- **Don't** default to modals for every interaction. Exhaust inline and progressive patterns first.
- **Don't** wrap everything in a container card. Let some content breathe on the bare background.
