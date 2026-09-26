# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal blog documenting a 10-week trip through Korea (and side trips to Japan, Taiwan, Hong Kong, Macau). There is no database or CMS — every page is rendered from Markdown/YAML files in `content/` at build time via Node's `fs` module (`output: 'export'` in `next.config.js` — the whole site is a static export, no server at request time). Deploys go to **GitHub Pages**.

## Current focus & near-term plans

- The trip content is winding down — most remaining work is finishing up individual blog posts (`content/blogs/`, `content/days/`) rather than new features.
- The static-export migration (previously tracked here) is done: all `src/lib/*Service.ts` reads happen at build time only, all dynamic routes have `generateStaticParams`, and there are no server actions/API routes. Photos are served from a local two-tier (`thumb`/`display`) pipeline (ImageKit is no longer used anywhere) — see **Images** below — so new features should keep assuming a live server, external image service, or `fs` access at request time is *not* available.

## Commands

```
npm run dev                       # Next.js dev server (Turbopack)
npm run build                     # production build (also what CI runs)
npm run start                     # serve a production build

npm run thumbnails                # generate missing day/week/blog/front-page entity-cover thumbnails from public/photos/display/ via sharp (scripts/generate-thumbnails.ts; --force regenerates all)
npm run process-images             # derive public/photos/{thumb,display}/ from public/photos/originals/ via sharp (scripts/process-images.ts) — run after adding a new original
npm run extract-stats             # rebuild public/blog-stats.json from content/days frontmatter
npm run score                     # recompute the per-day `score` and `rank` fields in content/days/*.md (scripts/calculate-score.js; supports --dry-run)
npm run finance-data               # rebuild public/finance-data.json from content/finance/finance.csv
npm run finance-treemap-hierarchy-data    # rebuild public/finance-treemap-hierarchy-data.json from content/finance/finance-treemap-hierarchy.json
npm run finance-treemap-hierarchy-reseed  # DANGER: regenerates content/finance/finance-treemap-hierarchy.json from finance.csv, overwriting any hand corrections made in it
```

There is no lint script and no test suite configured — `npm run build` (which runs `tsc` via Next.js) is the only correctness check available. CI (`.github/workflows/ci.yml`) runs `npm audit --audit-level=high` and `npm run build` on every PR.

`scripts/generate-thumbnails.ts` and `scripts/process-images.ts` run via `tsx` and need no external services — only the local photo files.

## Deploy pipeline

`.github/workflows/deploy-to-pages.yml` runs on every push to `main` whose commit message contains `[deploy]` (or via manual `workflow_dispatch`). It downloads the current photo set from the rolling `images` GitHub Release into `public/photos/` (see **Images**) — the asset is a password-protected `photos.7z` (AES-256, encrypted headers) so the public release isn't a one-click download of every photo; the workflow extracts it with the `IMAGES_ARCHIVE_PASSWORD` repository secret. Build it from inside `public/photos/` with `7z a -mhe=on -p photos.7z thumb display` (prompts for the password) and upload with `gh release upload images photos.7z --clobber`. It then generates entity-cover thumbnails for any new days/weeks/blogs from it and rebuilds stats (auto-committing any changes), runs `next build` (static export to `/out`), and deploys `/out` via `actions/upload-pages-artifact` + `actions/deploy-pages`. A push without `[deploy]` in the message will not trigger a deploy.

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

There are two separate image systems, both keyed off the same convention-based path (`days/{date}/{photoId}`, `weeks/{index}/{photoId}`, `blogs/{slug}/{photoId}`, `food/{imageId}`):

- **Entity-cover thumbnails** (day/week/blog grid & frontpage cards) — small fixed-size center crops (days 200×150, front-page days and blogs 400×300, weeks 1200×400), committed to git under `public/thumbnails/`, generated by `scripts/generate-thumbnails.ts` from the entity's cover photo in the `display` tier. It skips thumbnails that already exist (`--force` to regenerate), so in the deploy workflow it only produces thumbnails for new entities.
- **Per-photo tiers** (everything else: in-post `<Img>` images, day/week carousels, the lightbox, food photos, blog header) — every photo referenced anywhere (an entity's `photos[]` array, its `thumbnail`/`thumb` id, or a food `image` id) gets exactly two locally-generated files, gitignored under `public/photos/{thumb,display}/...` and shipped via a rolling GitHub Release (tag `images`, downloaded into `public/photos/` by `.github/workflows/deploy-to-pages.yml` before build) rather than committed — the full set doesn't fit comfortably in a git repo. `thumb` (~300px long edge) is only used for the carousel's thumbnail strip; `display` (~1920px long edge) is the one size used everywhere else — there is no separate transform per consumer and no multi-resolution zoom in the lightbox. `utils/localPhotoPath.ts` (`getPhotoPath`/`getPhotoPaths`) is the single place that knows this path convention; `utils/createImageMap.ts` (in-post `<Img>` tags) and the day/week pages (carousel photo arrays) both build off it.
  - `scripts/process-images.ts` walks `public/photos/originals/` (gitignored, local-only, never shipped) with `sharp` and derives `thumb`/`display` for anything not yet processed. Re-run it after dropping a new full-quality original into `public/photos/originals/...`, then rebuild the encrypted archive and replace the `images` release asset (see **Deploy pipeline**).

## Routing

Standard Next.js App Router under `src/app/`: `day/[slug]`, `weeks/[weekId]`, `blogs/[slug]`, plus static pages (`grid`, `food`, `goals`). Shared UI lives in `src/app/_components/`, grouped by feature (`day/`, `week/`, `weeks/`, `blog/`, `finance/`, `grid/`, `map/`, `food/`, `frontpage/`, `goals/`, `layout/`, `common/`, `ui/`). Path alias `@/*` maps to `src/*` (see `tsconfig.json`); note that plain `utils/` and `scripts/` at the repo root are outside `src/` and are imported with relative paths, not `@/`.

## Location/color convention

`utils/locationColors.ts` is the single source of truth mapping a `CityLocation` to a color — both a Tailwind token (`getLocationColor`, `getLocationBorderColor`) and a hex value for SVG/D3 contexts (`getLocationColorHex`). When adding a new UI surface that colors by location, use these helpers rather than re-deriving the mapping.
