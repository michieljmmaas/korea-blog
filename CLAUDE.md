# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal blog documenting a 10-week trip through Korea (and side trips to Japan, Taiwan, Hong Kong, Macau). There is no database or CMS — every page is rendered from Markdown/YAML files in `content/` at request/build time via Node's `fs` module, and images are hosted/transformed externally on ImageKit. Deploys go to Vercel.

## Current focus & near-term plans

- The trip content is winding down — most remaining work is finishing up individual blog posts (`content/blogs/`, `content/days/`) rather than new features.
- Planned hosting migration: move from Vercel to **GitHub Pages**. GitHub Pages serves static files only, so this means the app needs to become a fully static export — no server-side rendering, no server actions/API routes at runtime. Anything currently relying on a Node server at request time (e.g. `src/lib/*Service.ts` reading `content/` via `fs` at request time, `src/app/actions/randomActions.ts` server actions) will need to move to build-time generation instead. Keep this in mind when adding features: prefer patterns that work with `next export`/static generation over ones that assume a live server.

## Commands

```
npm run dev                       # Next.js dev server (Turbopack)
npm run build                     # production build (also what CI runs)
npm run start                     # serve a production build

npm run thumbnails                # regenerate day/week thumbnail images (scripts/generate-thumbnails.ts)
npm run thumbnails-front-page      # regenerate front-page thumbnails
npm run download-all              # download all source pictures from ImageKit (scripts/download-pictures.ts)
npm run extract-stats             # rebuild public/blog-stats.json from content/days frontmatter
npm run score                     # recompute the per-day `score` and `rank` fields in content/days/*.md (scripts/calculate-score.js; supports --dry-run)
npm run finance-data               # rebuild public/finance-data.json from content/finance/finance.csv
npm run finance-treemap-hierarchy-data    # rebuild public/finance-treemap-hierarchy-data.json from content/finance/finance-treemap-hierarchy.json
npm run finance-treemap-hierarchy-reseed  # DANGER: regenerates content/finance/finance-treemap-hierarchy.json from finance.csv, overwriting any hand corrections made in it
```

There is no lint script and no test suite configured — `npm run build` (which runs `tsc` via Next.js) is the only correctness check available. CI (`.github/workflows/ci.yml`) runs `npm audit --audit-level=high` and `npm run build` on every PR.

`scripts/generate-thumbnails.ts`, `download-pictures.ts`, and other `.ts` scripts run via `tsx` and expect `IMAGEKIT_URL_ENDPOINT` / `IMAGE_KIT_PRIVATE_KEY` / `IMAGE_KIT_PUBLIC_KEY` env vars (see `.github/workflows/deploy-to-vercel.yml`).

## Deploy pipeline

`.github/workflows/deploy-to-vercel.yml` runs on every push to `main` whose commit message contains `[deploy]` (or via manual `workflow_dispatch`). It regenerates thumbnails and stats, auto-commits any changed output, then deploys to Vercel. A push without `[deploy]` in the message will not trigger a deploy.

## Content model

Content lives entirely under `content/`, one directory per section:

- `content/days/YYYY-MM-DD.md` — one file per day of the trip. Frontmatter includes `day` (sequential number), `location` (a `CityLocation`), `photos` (array of photo IDs, referenced from the body via `<Img id .../>`), `stats` (kimbap/commits/cultural/worked/steps — hand-entered), and computed `score` and `rank` (1 = highest score, ties share a rank; both written by `npm run score`, don't hand-edit them — rerun the script after adding or editing days so ranks stay current).
- `content/weekly/week-N.md` — one file per week, aggregates days.
- `content/blogs/*.md` — standalone topical posts (not tied to a specific day), identified by a `slug` in frontmatter rather than filename.
- `content/food/food.yaml`, `content/goals/goals.yaml`, `content/locations/locations.yaml` — flat YAML data files (foods tried, trip goals, GPS location log), not Markdown.
- `content/finance/finance.csv` — raw expense export; `scripts/extract-finance-data.js` normalizes it (location aliases, convenience-store classification) into `public/finance-data.json`, which the convenience-store pie chart reads at runtime.
- `content/finance/finance-treemap-hierarchy.json` — a **hand-editable** `{location, category, subcategory, total, count}` list (subcategory-level totals, not individual transactions) backing the location/category/subcategory treemap. It was seeded from `finance.csv` by `scripts/generate-finance-treemap-hierarchy.js` (`npm run finance-treemap-hierarchy-reseed`) and is meant to be corrected by hand afterwards — wrong category/subcategory attributions, un-translated Dutch subcategory names, etc. Re-running the reseed script overwrites those corrections, so only do that deliberately (e.g. after adding new rows to `finance.csv`) and re-apply fixes afterward. `scripts/extract-finance-treemap-hierarchy-data.js` (`npm run finance-treemap-hierarchy-data`) reads this file as-is (no CSV access) and writes `public/finance-treemap-hierarchy-data.json`, which the treemap actually fetches. Category names here must stay one of the simplified set in `CATEGORY_ORDER`/`utils/financeCategoryColors.ts` so it can reuse that color palette; the build script warns on typos but still writes output.

Data-access for content lives in `src/lib/*Service.ts` (`blogService.ts`, `dayService.ts`, `weekService.ts`, `foodService.ts`, `geoService.ts`, `goalService.ts`). Each reads directly from `content/` with `fs.readFileSync` + `gray-matter` (Markdown) or `js-yaml` (YAML) — there's no shared repository abstraction, so follow the existing per-domain pattern rather than introducing a generic content layer. `GeoDataService` module-level-caches its parsed data; the others do not.

`src/lib/api.ts` and `src/lib/constants.ts` are leftovers from the original `next-blog-starter` template (they reference a nonexistent `_posts` directory) and are not wired into any route — don't extend them, and prefer deleting them if you're touching that area.

## Markdown → HTML rendering pipeline

Post bodies are not rendered as plain Markdown; there is a custom remark/rehype pipeline plus a client-side hydration pass:

1. `src/lib/markdownToHtml.ts` preprocesses raw Markdown text: custom `<Img id [portrait|landscape] alt="..." desc="..." />` tags are rewritten into `<div class="modal-image-placeholder" data-...>` elements (looked up against an `ImageMapping` built per-content-type by `utils/createImageMap.ts`'s `createForDay`/`createForWeek`/`createForBlog`), and `<FinanceCharts />` becomes a `<div class="finance-charts-placeholder">`. It then runs through `remark` → `remarkGfm` → `remarkRehype` (`allowDangerousHtml`) → `rehypeRaw` → `rehypeSlug` → `rehypeStringify` to produce an HTML string.
2. `src/app/_components/common/blog-content-processor.tsx` (client component) takes that HTML string, sets it via `innerHTML`, then walks the DOM for `.modal-image-placeholder`, day/blog link elements (`data-day-info`/`data-blog-info` — see `day-link-with-tooltip.tsx` / `blog-link-with-tooltip.tsx`), and `.finance-charts-placeholder`, replacing each with a mounted React root (`SingleImageWithModal`, `DayLinkWithTooltip`, `BlogLinkWithTooltip`, `FinanceCharts`).

When adding a new custom inline "component" to post bodies, follow this same two-step pattern: emit a placeholder `data-*` element in `markdownToHtml.ts`, then hydrate it in `blog-content-processor.tsx`.

## Images

All photo assets are hosted on ImageKit (`https://ik.imagekit.io/yyahqsrfe`), not committed to the repo. `utils/createImageMap.ts` builds the ImageKit URL per photo from a convention-based path (`/days/{date}/{photoId}`, `/weeks/{index}/{photoId}`, `/blogs/{slug}/{photoId}`) plus named ImageKit transformations (`blog-portrait`, `blog-landscape`, `blog-thumb`). `scripts/download-pictures.ts` and `scripts/generate-thumbnails*.ts` are the local tooling for pulling/regenerating those.

## Routing

Standard Next.js App Router under `src/app/`: `day/[slug]`, `weeks/[weekId]`, `blogs/[slug]`, plus static pages (`grid`, `food`, `goals`). Shared UI lives in `src/app/_components/`, grouped by feature (`day/`, `week/`, `weeks/`, `blog/`, `finance/`, `grid/`, `map/`, `food/`, `frontpage/`, `goals/`, `layout/`, `common/`, `ui/`). Path alias `@/*` maps to `src/*` (see `tsconfig.json`); note that plain `utils/` and `scripts/` at the repo root are outside `src/` and are imported with relative paths, not `@/`.

## Location/color convention

`utils/locationColors.ts` is the single source of truth mapping a `CityLocation` to a color — both a Tailwind token (`getLocationColor`, `getLocationBorderColor`) and a hex value for SVG/D3 contexts (`getLocationColorHex`). When adding a new UI surface that colors by location, use these helpers rather than re-deriving the mapping.
