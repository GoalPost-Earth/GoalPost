---
name: design
description: >
  GoalPost design language reference — colors, themes, typography, spacing,
  glass-morphism, entity semantics, animations, and component patterns.
  Use when user says "design", "design system", "design language", "theme",
  "colors", "tokens", "glass", "look and feel", "style guide", or is building
  any new UI surface in GoalPost and needs to match the existing visual system.
user-invokable: true
---

# GoalPost Design Language

GoalPost's visual identity is **organic, soft, and semantic**: glass-morphic surfaces float over radial color washes, with five user-selectable themes layered on top of light and dark modes. Entity types (Goal, Resource, Story, Care, Core Value) carry their own colors and icons throughout the product.

When you build new UI, use this file as the source of truth. Match these tokens and patterns rather than inventing new ones.

## Source files (read these for ground truth)

- `src/app/globals.css` — all CSS variables, theme variants, component utilities, keyframes
- `src/contexts/theme-context.tsx` — theme switching (default / warm / forest / purple / emerald)
- `src/lib/pulse-type-config.ts` — entity icon + color mapping (single source of truth)
- `src/components/ui/` — shadcn-style primitives (button, card, dialog, etc.)
- `src/app/auth/login/page.tsx` — canonical example of layered radial gradients + glass cards
- `src/app/protected/dashboard/page.tsx` — canonical example of dashboard backdrop with floating blobs

## Foundations

### Typography
- **Body / UI**: Inter, loaded via `next/font/google` as `--font-inter`
- **Icons**: Material Symbols Outlined — primary icon system (~285 usages). Used as `<span className="material-symbols-outlined">icon_name</span>`
- Lucide React is used **only** inside shadcn primitives (select, dropdown-menu, dialog). Do **not** introduce Lucide into product UI — use Material Symbols.

### Border radius
```
--radius: 0.625rem  /* 10px base */
--radius-sm: calc(var(--radius) - 4px)   /* 6px */
--radius-md: calc(var(--radius) - 2px)   /* 8px */
--radius-lg: var(--radius)               /* 10px */
--radius-xl: calc(var(--radius) + 4px)   /* 14px */
```
Cards default to `rounded-xl`. Pills / action buttons are full `rounded-full`.

## Color system

There are **two layered palettes**:

### 1. shadcn neutral tokens (OKLCH)
Used for surfaces, borders, text, and component states. Auto-flips on `.dark`. Reference by Tailwind class: `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `ring-ring`, `bg-destructive`, etc.

### 2. GoalPost brand tokens (`gp-*`)
Reference via `bg-gp-*` / `text-gp-*` Tailwind classes or as CSS variables in inline styles (`var(--gp-primary)`).

**Default theme — light mode:**

| Token              | Value        | Role                                                |
| ------------------ | ------------ | --------------------------------------------------- |
| `--gp-primary`     | `#137fec`    | Primary brand blue — CTAs, links, focus             |
| `--gp-accent-glow` | `#4fffcb`    | Mint glow — secondary accents, halos, highlights    |
| `--gp-surface`     | `#f6f7f8`    | App background                                      |
| `--gp-surface-strong` | `#ffffff` | Elevated cards                                      |
| `--gp-surface-dark`   | `#101c22` | Dark inverse panels                                 |
| `--gp-ink-strong`  | `#111418`    | Primary text                                        |
| `--gp-ink-muted`   | `#617589`    | Secondary text                                      |
| `--gp-ink-soft`    | `#94a3b8`    | Tertiary text, dot-grids                            |
| `--gp-glass-bg`    | `rgba(255,255,255,0.7)` | Glass-morphic panel fill              |
| `--gp-glass-border`| `rgba(0,0,0,0.08)`      | Glass-morphic panel border            |

**Entity (semantic) colors — used for Pulses + related nodes:**

| Token             | Light    | Icon (Material Symbols) | Entity        |
| ----------------- | -------- | ----------------------- | ------------- |
| `--gp-goal`       | `#38bdf8` | `flag`                 | GoalPulse     |
| `--gp-resource`   | `#4ade80` | `diamond`              | ResourcePulse |
| `--gp-story`      | `#c084fc` | `auto_stories`         | StoryPulse    |
| `--gp-care`       | `#10b981` | `favorite`             | Care relation |
| `--gp-coreValue`  | `#8b5cf6` | `auto_awesome`         | CoreValue     |

Entity color/icon mapping is centralized in `src/lib/pulse-type-config.ts`. **Always import from there** — never hardcode an entity color or icon.

### Theme variants
Themes are CSS classes applied to `<html>`: `theme-warm`, `theme-forest`, `theme-purple`, `theme-emerald` (absence = default). Each theme + dark mode override `gp-*` tokens only — shadcn neutrals stay the same. This means any UI built with `gp-*` tokens automatically retheme.

Switching is handled by `useTheme()` from `@/contexts/theme-context`. A blocking script in `layout.tsx` applies the saved theme pre-paint to prevent flash.

## Signature visual patterns

### Glass-morphism (the GoalPost look)
Frosted, semi-transparent panels are the dominant surface treatment.

```css
.gp-glass {
  background: var(--gp-glass-bg);
  border: 1px solid var(--gp-glass-border);
  backdrop-filter: blur(16px);
}
```

Use `className="gp-glass"` for floating panels (sidebars, modals over content, chat cards). For elevated solid cards, use `.gp-card` (surface + soft 12px/40px drop shadow).

### Radial gradient washes
Auth and dashboard pages layer 3–4 large radial gradients over the surface using `color-mix(in srgb, var(--gp-token) X%, transparent)`. This produces a soft, blob-y backdrop that themes correctly.

```tsx
style={{
  backgroundImage: `
    radial-gradient(at 20% 20%, color-mix(in srgb, var(--gp-primary) 10%, transparent) 0, transparent 55%),
    radial-gradient(at 80% 15%, color-mix(in srgb, var(--gp-accent-glow) 12%, transparent) 0, transparent 55%),
    radial-gradient(at 85% 85%, color-mix(in srgb, var(--gp-goal) 10%, transparent) 0, transparent 55%),
    radial-gradient(at 15% 85%, color-mix(in srgb, var(--gp-resource) 12%, transparent) 0, transparent 55%)
  `,
}}
```

### Floating blobs
Big blurred color disks (`blur-[100px]`–`blur-[120px]`) absolutely positioned and animated with `animate-blob` / `animate-float`. Use ~8–14% opacity tints via `color-mix`. Always wrap in a `pointer-events-none z-0` container.

### Dot grids
`.gp-dot-grid` — `radial-gradient(var(--gp-ink-soft) 1px, transparent 1px)` at `60px 60px`. Use as a subtle background texture on empty states and graph canvases.

### Section titles
Small dotted indicator before uppercase tracked-wide headings:

```tsx
<h3 className="section-title text-accent-glow text-sm font-bold uppercase tracking-widest">
  Active Pulses
</h3>
```

The `::before` pseudo-element draws a glowing dot. Pair with text color from the section's semantic context (entity color or `gp-accent-glow`).

### Action buttons (FABs)
Wrap in `.gp-action-button-shell` for the consistent themed glow-on-hover treatment (28px primary-tinted box-shadow, -1px Y translate).

## Animations

All defined in `globals.css`. Compose freely; durations 0.3s–6s.

| Class                   | Use case                                       |
| ----------------------- | ---------------------------------------------- |
| `animate-fade-in`       | Mount transitions for sections (0.5s)          |
| `animate-float`         | Decorative drifting blobs (4s)                 |
| `animate-float-delayed` | Staggered second blob (5s, 0.5s delay)         |
| `animate-float-random`  | Third blob (6s)                                |
| `animate-pulse-slow`    | Status dots, "live" indicators (3s)            |
| `animate-glow`          | Mint accent glow drop-shadow oscillation       |
| `animate-blob`          | Theme-tinted background discs                  |

Transitions: cards/buttons use `transition-all duration-300` with `cubic-bezier(0.4, 0, 0.2, 1)`. Hover usually combines color/border shift + `-translate-y-0.5` or `-translate-y-1`.

## Components

### Primitives — `src/components/ui/`
Standard shadcn library: `button`, `card`, `dialog`, `dropdown-menu`, `select`, `input`, `label`, `badge`, `avatar`, `tooltip`, `switch`, `skeleton`, `sonner` (toasts). Always extend these via `cn()` rather than rebuilding.

`Button` variants: `default | destructive | outline | secondary | ghost | link`. Sizes: `default | sm | lg | icon | icon-sm | icon-lg`.

`Card` is bare (`rounded-xl border py-6 shadow-sm`). For the brand look, add `.gp-glass` or `.gp-card` instead of bare `Card` on landing/auth/dashboard surfaces.

### GoalPost-specific components — `src/components/ui/`
`pulse-node`, `pulse-panel`, `pulse-edit-modal`, `resonance-node`, `resonance-panel`, `resonance-connections`, `person-node`, `person-panel`, `entity-bubble`, `field-bubble`, `connection-panel`, `space-wrapper`, `offering-input`, `offering-modal`, `ai-chat-panel`, `ai-assistant-panel`, `linkified-text`, `text-generate-effect`. Reach for these before building new ones.

### Sidebar / nav pattern
- Fixed left, `w-64`, `gp-glass` styling
- `.nav-item` class with `::before` left-edge accent bar that animates in on `.active`
- Section header: tiny uppercase tracking-widest label

## Tailwind conventions

- **No inline styles** except where dynamic `color-mix()` / `var()` values must be computed
- All `gp-*` tokens exposed as Tailwind utilities: `bg-gp-primary`, `text-gp-ink-muted`, `border-gp-glass-border`, etc.
- Use `dark:` variants — every surface must work in both modes
- Mobile-first; common breakpoints `md:` (sidebar), `lg:` (grid columns)
- Prefer Tailwind v4 arbitrary values (`w-125`, `blur-[120px]`) over magic CSS

## Do / don't

**Do**
- Use `gp-*` tokens and `color-mix(in srgb, var(--gp-token) X%, transparent)` for any tints
- Pull entity icons/colors from `pulse-type-config.ts`
- Build new floating surfaces as `.gp-glass`
- Combine 2–4 radial gradients for page backdrops
- Test every new surface in light + dark + at least one non-default theme (warm or purple) before declaring done

**Don't**
- Hardcode hex colors in components — always use a token
- Introduce Lucide icons into product UI (Material Symbols only outside primitives)
- Add new theme classes without updating all five entity color overrides
- Build flat opaque cards on auth/dashboard backdrops — they break the glass aesthetic
- Use SQL-style data-table patterns; GoalPost prefers semantic node cards
- Exceed 400 lines per component (CLAUDE.md rule)

## When invoked

If the user runs `/design` with no arguments, summarize this skill: tokens, themes, signature patterns, and where to find ground-truth files.

If invoked with a specific topic (e.g. `/design colors`, `/design glass`, `/design entity goal`), answer narrowly from the relevant section and cite the source file with `path:line`.

If the user is starting a new component or page, walk them through:
1. Which entity colors apply (if any)
2. Surface choice — `gp-glass` vs `gp-card` vs plain `Card`
3. Backdrop — does this page need radial gradients + blobs?
4. Icons — Material Symbols names to use
5. Existing primitives/components to compose with before scaffolding

Always defer to `/new-component` for the actual scaffold once design choices are settled.
