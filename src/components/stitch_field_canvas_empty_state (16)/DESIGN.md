# Design System Strategy: The Living Canvas

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Ethereal Architect."** 

We are moving away from the "industrial" utility of standard SaaS platforms toward a "ceremonial" digital experience. A bulk CSV upload is usually a chore; here, it is a ritual of data transformation. By utilizing **Liquid Glass UI** principles, we create an environment that feels like a living organism—fluid, responsive, and translucent. We reject the "boxed-in" grid in favor of **Intentional Asymmetry** and **Tonal Depth**, where information doesn't sit *on* the screen, but floats within an atmospheric volume.

## 2. Color & Atmospheric Surface Hierarchy
The palette is rooted in a sophisticated range of cool neutrals and vibrant accents that suggest professional authority through a lens of softness.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to define sections. Traditional "dividers" are a failure of spatial planning. Boundaries must be defined through:
- **Tonal Shifts:** Placing a `surface-container-low` section against a `surface` background.
- **Luminance Contrast:** Using `surface-lowest` to make a primary action card "pop" from a `surface-variant` tray.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers of frosted glass.
*   **Base Layer:** `background` (#f7f9fb) – The infinite canvas.
*   **The Atmospheric Cloud:** `surface-container` (#eceef0) – Use this for large, sprawling organizational areas.
*   **The Focal Vessel:** `surface-container-lowest` (#ffffff) – Reserved for the highest level of interaction, like the CSV drop zone itself.

### The "Glass & Gradient" Rule
To achieve the "Liquid Glass" aesthetic, use `surface-tint` (#494bd6) at 5–8% opacity with a `backdrop-filter: blur(20px)`. This allows the vibrant `primary` and `secondary` gradients to bleed through the containers, creating a "soulful" UI that feels reactive to the user's presence.

## 3. Typography: Editorial Authority
The typography system uses a high-contrast pairing to distinguish between "Action" and "Information."

*   **The Statement (Plus Jakarta Sans):** Used for `display`, `headline`, and `title` scales. This typeface provides a geometric, modern confidence. For CSV headers and "Upload Successful" states, use `headline-lg` to create a moment of celebration.
*   **The Narrative (Manrope):** Used for `body` and `label` scales. Manrope’s humanist qualities ensure that even dense data tables remain breathable and legible.
*   **Scale Contrast:** Don't be afraid of the gap. Pair a `display-sm` headline with a `body-sm` description to create the "Editorial" look found in high-end magazines.

## 4. Elevation & Depth: Tonal Layering
In this design system, shadows are not "darkness," they are "occlusion."

*   **The Layering Principle:** Stack `surface-container-low` on `surface` for a subtle lift. For the "Ceremonial" CSV upload card, use `surface-container-lowest` over `surface-container-high` to create a natural, stark focus.
*   **Ambient Shadows:** Use a `0px 24px 48px` spread with the color `on-surface` (#191c1e) at a maximum of **4% opacity**. It should be felt, not seen.
*   **The Ghost Border:** If a containment edge is required for accessibility in dark mode, use `outline-variant` (#c7c4d7) at **15% opacity**.
*   **Fluid Motion:** Every elevation change should be accompanied by a `200ms` cubic-bezier(0.4, 0, 0.2, 1) transition to maintain the "Living Platform" feel.

## 5. Components: The Ritual of Data

### The "Cloud" Drop Zone (Upload Component)
*   **Container:** `xl` (3rem) roundedness. `surface-container-low` with a subtle linear gradient from `primary-fixed-dim` to `secondary-fixed-dim` at 10% opacity.
*   **State Change:** On drag-over, the container should expand slightly (scale 1.02) and transition to `primary-container` with a high-diffusion glow.

### Buttons (The Primary Catalyst)
*   **Primary:** No solid fills. Use a gradient from `primary` (#4648d4) to `secondary` (#6b38d4). `full` roundedness. 
*   **Secondary:** `surface-container-highest` background with `primary` text. No border.
*   **Tertiary:** Purely typographic using `label-md`, with an underline that appears only on hover.

### Data Chips & Status
*   **Validation Chips:** For CSV error rows, use `error-container` (#ffdad6) with `on-error-container` (#93000a) text. The corners should be `sm` (0.5rem) to distinguish them from the "fluid" roundedness of buttons.

### Inputs & Tables
*   **The "No-Table" Table:** For previewing CSV data, forbid vertical and horizontal lines. Use `spacing-4` (1.4rem) between rows and alternate row backgrounds using `surface-container-low` and `surface`.
*   **Input Fields:** Ghost-styled. Only a bottom-aligned `outline-variant` (20% opacity) that transforms into a full `primary` underline when focused.

## 6. Do’s and Don’ts

### Do:
*   **Embrace White Space:** Use `spacing-16` (5.5rem) or `spacing-20` (7rem) to separate the header from the upload vessel.
*   **Use Asymmetry:** Place the "Instructions" on the left and the "Upload Zone" slightly offset to the right to break the boring center-aligned template look.
*   **Animate Transitions:** Use the `tertiary` (#b10e6b) color as a "spark" for progress bars to show life.

### Don't:
*   **Don't use 100% Black:** Never use #000000. Use `on-surface` (#191c1e) to keep the "Liquid Glass" feeling soft.
*   **Don't use Box Shadows on everything:** Let the tonal shifts do the heavy lifting. Reserved shadows only for floating modals.
*   **Don't use Sharp Corners:** Nothing in this system is sharper than `sm` (0.5rem). We are building a "Living Platform," and life is rarely square.