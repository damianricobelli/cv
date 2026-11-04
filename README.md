# damianricobelli

Personal site of Damián Ricobelli: career, open source and contact, built as a
Stepperize flow (each section is a step of the page).

## Stack

TanStack Start on Vite 8 and Cloudflare Workers, React 19, TanStack Router
(virtual routes per feature) and Query, shadcn/ui on Base UI, Tailwind v4,
Motion, Three.js with React Three Fiber, Paraglide (es / en) and Biome.
Same architecture as Wonkka: **each feature owns its routes, components,
queries and server code**.

```
src/
  routes.ts                    route registry (physical, per feature)
  routes/__root.tsx            document, theme/accent init script, toaster
  features/
    home/routes/index.tsx      the page: composition, SEO, stats loader
    site/                      Stepperize flow, header rail, guard, ⌘K palette, blueprint
    hero/                      elastic name, intro, code sample that navigates
    career/                    LinkedIn experience as a git log graph
    open-source/               live demos + GitHub/npm stats (server fn, edge cached)
    contact/                   scheduler and links
    eggs/                      easter egg tracking
    paper/                     three.js background: the site's own source blind-embossed into the paper, lit by the cursor
  i18n/messages/{es,en}.json   all copy
```

## Commands

```bash
pnpm dev          # http://localhost:3100 (es) and /en
pnpm typecheck    # paraglide compile + routes + tsc
pnpm check        # biome
pnpm build
pnpm deploy       # wrangler deploy
```

## Easter eggs

Eight of them; the footer tracks how many a visitor found. Hints are in
`src/i18n/messages/*.json` (`egg_*_hint`).
