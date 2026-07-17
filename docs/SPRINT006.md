# Sprint 006

## Goal

Build the **RIVA OS Design System foundation** — reusable UI components only.

## Objectives

1. Expand `src/components/ui` with the required primitive set.
2. Align components with shadcn/ui + Tailwind + dark mode.
3. Document tokens and naming in `docs/DESIGN_SYSTEM.md`.
4. Avoid business pages, schema changes, and mock-heavy demos.

## Deliverables

| Path | Description |
| --- | --- |
| `src/components/ui/*` | Primitive components (Button → Calendar, plus custom Tag, StatusBadge, etc.) |
| `src/components/layout/app-empty-state.tsx` | Bilingual empty state wrapper (keeps UI kit free of i18n) |
| `src/app/globals.css` | Status / shadow / motion tokens |
| `docs/DESIGN_SYSTEM.md` | Design system documentation |
| `docs/SPRINT006.md` | This summary |

## Explicit non-goals

- Do **not** build business pages
- Do **not** change database schema
- Do **not** create migrations
- Do **not** add mock data beyond minimal doc examples

## Exit criteria

- Required components present under `src/components/ui`
- Design system documented
- Commit: `feat: initialize RIVA OS design system`
