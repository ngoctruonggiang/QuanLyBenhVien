# General guidelines

- Prefer responsive layouts with Flexbox and Grid; avoid absolute positioning unless necessary.
- Keep components small, cohesive, and accessible (use semantic HTML, aria-\* and focus states).
- Use the provided color palette tokens only—do not hardcode hex values.
- Refactor as you go; keep shared helpers and components in their own files.
- Use Lucide icons via the shared enum [`ICONS`](src/constants/icons.enum.tsx).

---

# Design system guidelines

Design tokens and Tailwind theme values are sourced from:

- Color palette JSON: [../design/color-pallette.json](../design/color-pallette.json)
- Tailwind token mapping and CSS variables: [../src/app/global.css](../src/app/globals.css)

## Color

Palette groups (available as Tailwind classes via `@theme inline` in index.css):

- Brand
  - Primary blues: `*-primary-100 | 300 | 500 | 600 | 700 | 900`
- Secondary
  - Teal: `*-secondary-500 | 700`
- Accent
  - `*-accent-purple-500`, `*-accent-orange-500`
- Neutral
  - Gray: `*-neutral-100 | 200 | 300 | 700 | 900`
- Feedback
  - `*-feedback-success | warning | error | info`

Surface and semantic tokens:

- Surfaces: `bg-background`, `bg-card`, `bg-popover`, `bg-sidebar`
- Text: `text-foreground`, `text-card-foreground`, `text-muted-foreground`, `text-sidebar-foreground`
- Borders and rings: `border-border`, `ring-ring`
- Primary/secondary intents: `bg-primary`, `text-primary-foreground`, `bg-secondary`, etc.

Examples:

- Primary action: `class="bg-primary text-primary-foreground hover:bg-primary/90"`
- Section surface: `class="bg-card text-card-foreground border"`
- Subtle feedback: `class="bg-feedback-warning/15 text-feedback-warning"`

## Typography

- Base font family is set globally in [../src/app/globals.css](../src/app/globals.css).
- Use Tailwind utilities for scale (`text-sm`, `text-base`, `text-lg`, etc.).
- Muted text: `text-muted-foreground`.
- Titles: prefer semantic elements and shadcn component title slots where provided.

## Spacing, radius, and elevation

- Spacing: Tailwind spacing scale (`p-6`, `px-6`, `gap-6`).
- Radius: `rounded-md`, `rounded-lg`, `rounded-xl`. Internally, `--radius` powers `--radius-sm|md|lg|xl`.
- Elevation: `drop-shadow-sm` for surfaces by default; increase only for emphasis.

## Components (shadcn/ui)

Use the provided components and their variants instead of custom-styling from scratch.

### Button

- Component: [`Button`](src/components/ui/button.tsx)
- Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- Sizes: `default`, `sm`, `lg`, `icon`
- Usage:
  - One primary (default) per view section.
  - Use `destructive` for irreversible actions.
  - Use `outline`/`ghost` for secondary/tertiary actions.
  - Link-style for navigational CTA.

Example:

```tsx
<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
```

### Card

- Component: [`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`](src/components/ui/card.tsx)
- Defaults: `bg-card text-card-foreground rounded-xl border drop-shadow-sm`
- Use cards for grouped content; keep header concise with `CardTitle` and `CardDescription`.

### Sidebar

- Component suite: [`Sidebar` et al.](src/components/ui/sidebar.tsx)
- Variants: `sidebar | floating | inset`
- Collapsible: `offcanvas | icon | none`
- Patterns:
  - Keep labels concise; use icons from [`ICONS`](src/constants/icons.enum.tsx).
  - Inset/floating for dashboard-like shells; default for app chrome.

### Sheet (Drawer)

- Component: [`Sheet`](src/components/ui/sheet.tsx)
- Use for transient, focused tasks (filters, quick edits). Choose `side` appropriately.

### Dialogs

- Alert Dialog: [`AlertDialog`](src/components/ui/alert-dialog.tsx) for confirmations, especially destructive actions.
- Dropdowns: [`DropdownMenu`](src/components/ui/dropdown-menu.tsx) for small action menus; keep items short and clear.

### Forms

- Components: [`FormDescription`, `FormMessage`, etc.](src/components/ui/form.tsx)
- Use `text-muted-foreground` for descriptions, `text-destructive` for errors.
- Ensure keyboard navigation and clear focus indication.

## Patterns and examples

- Surface + content:

```tsx
// Card surface with neutral body copy
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription className="text-muted-foreground">
      Supporting copy
    </CardDescription>
  </CardHeader>
  <CardContent className="px-6">{/* content */}</CardContent>
  <CardFooter className="px-6">
    <Button>Action</Button>
  </CardFooter>
</Card>
```

- Theming tokens in utilities:

```html
<div class="bg-primary-500 text-primary-foreground">Brand</div>
<div class="text-neutral-700">Body text</div>
<div class="bg-feedback-success/15 text-feedback-success">Saved</div>
```

## Do / Don't

- Do use Tailwind token classes (e.g., `bg-primary-600`) over raw hex.
- Don't introduce new colors outside the palette; update [design/color-pallette.json](design/color-pallette.json) and map in [src/index.css](src/index.css) instead.
- Don't overload screens with multiple primary CTAs.

## Updating the palette

1. Edit [../design/color-pallette.json](../design/color-pallette.json).
2. Ensure variables in [../src/app/globals.css](../src/app/globals.css) map the new tokens:
   - Define `--<group>-<name>-<scale>` (e.g., `--primary-blue-500`).
   - Map to Tailwind: `--color-<group>-<scale>: var(--<group>-<name>-<scale>)`.
3. Use the new tokens via Tailwind utilities (`bg-<group>-<scale>`, `text-<group>-<scale>`).

---
