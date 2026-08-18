# Portfolio Development Guidelines

This is a premium personal portfolio website built with:

- React
- TypeScript
- Vite
- Tailwind CSS
- Motion for React

## Design

The site should feel highly crafted and editorial rather than like a generic SaaS website.

Avoid:

- excessive rounded cards
- generic gradients
- unnecessary borders
- excessive drop shadows
- cookie-cutter landing page layouts
- unnecessary UI libraries

Prefer:

- strong typography
- deliberate spacing
- minimal UI
- subtle interaction
- strong imagery
- smooth animation
- responsive behaviour

## Layout

All page content is hard-locked to the card fan's resting outer corners.

- `--site-max-width` is the axis-aligned width of the outermost fan cards at rest (not hover). It lives on `:root` and must stay in sync with fan card size, spread, rotation, and scale.
- Every section, heading, control, and CTA sits inside `.site-frame`. Do not position content against the viewport edges.
- Theme toggle aligns to the left edge of this column; primary CTAs align to the right edge.
- Do not add horizontal section padding or `max-width` wrappers that inset or expand past this column. Vertical spacing is independent.
- Full-bleed treatments are not allowed. If a component needs overflow (carousel motion, fan hover), clip it inside the frame rather than breaking the column.

## Typography

All text uses DM Sans.

- Titles: DM Sans Semi-bold
- Body: DM Sans Regular

## Components

Reusable components belong in `src/components`.

- 21st.dev components go in `src/components/ui/`
- Project-specific reusable pieces go in `src/components/common/`
- Page sections belong in `src/sections/`

Prefer existing components from 21st.dev where appropriate rather than rebuilding complex interactions unnecessarily.

Do not add GSAP, Three.js, Lenis, shadcn, or Radix unless I explicitly ask.

## Animation

Use Motion for React for normal UI animation.

Use CSS transitions for very simple effects.

Only introduce GSAP when Motion is insufficient.

Rive should be used for interactive illustrations or bespoke stateful animations, not basic page transitions.

## Code

Use TypeScript.

Keep components relatively small.

Avoid unnecessary dependencies.

Preserve accessibility and prefers-reduced-motion behaviour.

Avoid changing unrelated parts of the website when modifying one component.
