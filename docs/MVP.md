# MVP Foundation — Usability Pass

**Status:** Implemented  
**Product:** RIVA  
**Foundation:** Sprint 011–016  
**Constraint:** No new domain entities

---

## Objective

Turn the Workspace → Company → Project / Client / Vendor foundation into a **fully usable MVP**.

## Delivered

1. **Dashboard shows real company-scoped data**  
   - Counts + lists for Projects, Clients, Vendors  
   - Legacy V0 Command Center (weddings/tasks/finance quick actions) removed from home

2. **Selectors**  
   - Workspace and Company switchers remain in header  
   - Empty company selection includes Create company CTA

3. **CRUD**  
   - Projects / Clients / Vendors: list, create, edit, archive/restore (+ status actions)  
   - Edit routes: `/dashboard/{module}/[id]/edit`

4. **Navigation**  
   - Primary nav: Dashboard · Projects · Clients · Vendors · Settings  
   - Placeholder modules show “Coming soon” with links back to MVP paths

5. **UX polish**  
   - Polished empty states with CTAs  
   - Loading state (`loading.tsx`)  
   - Error boundary (`error.tsx`)  
   - Mobile nav drawer (hamburger Sheet)  
   - Responsive padding / stacked headers

## Explicit non-goals

- New domain entities  
- Wedding / finance / task modules  
- Migrating V0 tables into core
