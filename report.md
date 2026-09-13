# Codebase Cleanup Report

Scope: full repo scan (`src/`, `utils/`, `scripts/`, `package.json`) looking for dead code,
duplicated/needlessly complex logic, library-replaceable code, and stylistic inconsistencies.
Goal: clear the decks before the final content push (more posts/visuals) and the Vercel → GitHub
Pages migration.

No behavior was changed while writing this report — it's pure analysis. Line numbers refer to the
current state of the repo on `main`.

---

## 1. Dead code — safe to delete

### 1.1 Entirely unreferenced component files
These have no importers anywhere in `src/`, `utils/`, or `scripts/`:

| File | Lines | Notes |
|---|---|---|
| `src/app/_components/common/image-modal.tsx` | 281 | Superseded by `new-image-modal.tsx` (built on `yet-another-react-lightbox`). This one is a hand-rolled modal built on `react-zoom-pan-pinch`. Nothing imports it. |
| `src/app/_components/finance/finance-treemap-legacy.tsx` | 259 | Old treemap implementation, replaced by the hierarchy treemap. |
| `src/app/_components/finance/finance-treemap-by-category.tsx` and `-by-location.tsx`'s sibling `finance-treemap.tsx` | 238 | Only consumer was `finance-treemap-section.tsx` (also dead, see below). |
| `src/app/_components/finance/finance-treemap-section.tsx` | 139 | Not imported by `finance-charts.tsx` — that file imports `finance-treemap-hierarchy-section.tsx` instead. |
| `src/app/_components/finance/finance-sankey.tsx` | 236 | No importer at all. |
| `src/app/_components/frontpage/random-section-wrapper.tsx` | 46 | Looks like an abandoned attempt to de-duplicate the three `random-*-section.tsx` components (see §2.1) — never finished or wired in. |
| `src/app/_components/week/week-blog-posts.tsx` | — | No importer. |
| `src/app/_components/ui/button.tsx` | 57 | Unused shadcn/ui `Button`. |
| `src/app/_components/ui/dialog.tsx` | 121 | Unused shadcn/ui `Dialog` primitives. |
| `src/lib/api.ts` | 28 | Already flagged in `CLAUDE.md` as a leftover from the starter template — references a nonexistent `_posts` dir. |
| `utils/financeCategoryColorsLegacy.ts` | 30 | Only used by the dead `finance-treemap-legacy.tsx`. |

Deleting these removes **~1,700 lines** with zero behavior change (verified via import-graph grep, not just naming).

### 1.2 Dead exports inside otherwise-live files
- `src/lib/constants.ts` — `EXAMPLE_PATH` is unused (starter-template leftover). `HOME_OG_IMAGE_URL` *is* used in `layout.tsx`, but it's a random National Geographic stock photo URL, not a real OG image for this blog — almost certainly a forgotten placeholder rather than intentional.
- `src/lib/geoService.ts` — `getLocationsByDateRange()` and `getTotalLocationCount()` are never called anywhere. (Also see the date bug in §3.)
- `finance-charts.tsx` fetches `/finance-data.json` and `/finance-treemap-data.json` into state (`data`, `treemapData`) but **never reads either** — only `treemapHierarchyData` is rendered (see §3, this is really a bug: two wasted network requests that also gate the loading/error UI). Once fixed, check whether `public/finance-treemap-data.json` / `npm run finance-treemap-data` still has any consumer at all — if not, that script + its output file are dead too.

### 1.3 Dead/unused npm dependencies
Not imported anywhere in `src/`, `utils/`, or `scripts/`:
- `appwrite`
- `next-cloudinary`
- `react-is`
- `csv` (the `csv` package — the codebase uses `csv-parser` instead, a different package)

Dependencies used **only** by the dead files in §1.1, so they become removable once those files go:
- `@radix-ui/react-dialog`, `@radix-ui/react-slot`, `class-variance-authority` (only used by `ui/button.tsx` / `ui/dialog.tsx`)
- `react-zoom-pan-pinch` (only used by `image-modal.tsx`)

That's **8 dependencies** removable from `package.json`, which also shrinks the `node_modules` you'll be shipping through the GitHub Pages migration checks.

### 1.4 Orphaned one-off scripts
`package.json` only wires up 10 of the 16 files in `scripts/`. The rest (`add-tags.js`,
`create-blog-seed.js`, `extract-csv-data.js`, `generate-blog-files.js`,
`generate-blogposts-files.js`, `generate-week-files.js`) aren't referenced by any npm script or
CI workflow. Some of these look like genuinely one-off content-migration/seeding tools (e.g.
`extract-csv-data.js` hardcodes a path to `scripts/geo.csv`, which no longer appears to be
tracked). Others (`create-blog-seed.js`, `generate-blog-files.js`) might still be your workflow
for scaffolding a new blog post — **this needs your judgment, not deletion**, since you're about
to write more posts. Recommend: a one-line comment header on each documenting whether it's a
still-in-use content tool or a historical migration script safe to delete/archive.

---

## 2. Duplicated code / things a library already does

### 2.1 The three "random X" homepage sections are ~95% copy-pasted
`random-day-section.tsx`, `random-week-section.tsx`, `random-blogpost-section.tsx` each
independently re-implement: the same card chrome (`border border-gray-200 rounded-lg p-4...`),
the same refresh button, the identical inline SVG spin icon, and the same
`isPending`/`isAnimating`/`startTransition` state machine. The only real differences are the
fetch function's signature and which card component renders in the middle.

There's already an (unused, dead — see §1.1) `RandomSectionWrapper` that was clearly an earlier
attempt at exactly this generalization, but it doesn't match what the three components actually
render (no spinner icon, different button) and was abandoned mid-refactor.

**Fix:** one generic `<RandomSection<T>>` taking `initialItem`, `fetchNew`, `renderItem`, `title`,
and `linkComponent`, encapsulating the pending/animating state and the button. Cuts ~150 lines
down to ~60 + three ~10-line call sites.

### 2.2 `finance-treemap-by-category.tsx` and `finance-treemap-by-location.tsx` are near-duplicates
226 and 240 lines respectively, sharing verbatim: `TreemapNode`/`LayoutNode`/`TooltipState`
types, `findNode`, `shade`, `WIDTH`/`HEIGHT` constants, the whole SVG-rendering JSX block
(tiles, breadcrumb, tooltip). The only real differences are `buildTree` (2-level vs. 3-level
grouping) and `colorFor` (which level maps to which color source).

**Fix:** extract the shared pieces into one `TreemapDrilldown` component parameterized by
`buildTree` and `colorFor` functions (or a shared hook + a shared `<TreemapSvg>` presentational
component). This alone removes ~180 duplicated lines and means a future styling tweak (tooltip,
padding, etc.) only needs to happen once.

### 2.3 Hand-rolled frontmatter parser duplicates `gray-matter`
`utils/markdownParser.ts` reimplements YAML-frontmatter splitting with a hand-written regex
(`/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/`) plus `js-yaml`. `gray-matter` is already a
dependency and is what `weekService.ts`, `geoService.ts` (indirectly via yaml), and `api.ts` use
for the same job — it's the standard tool for exactly this, and it's more forgiving of edge cases
(CRLF line endings, missing trailing newline, etc.) than the custom regex. `dayService.ts` and
`blogService.ts` are the two files still on the homemade parser.

**Fix:** swap `parseMarkdown` calls in `dayService.ts` / `blogService.ts` for `gray-matter`, then
delete `utils/markdownParser.ts`.

### 2.4 `ImageKitImage` re-wraps `<ImageKitProvider>` around every single image
```tsx
export function ImageKitImage({ ... }) {
    return (
        <ImageKitProvider urlEndpoint="...">
            <Image ... />
        </ImageKitProvider>
    )
}
```
`ImageKitProvider` is meant to be mounted **once** near the root (it just puts the URL endpoint in
context) — instantiating it per-`<Image>` works but is not what the library intends, and adds an
unnecessary component layer to every image on the page. `FadeInImage` (a second, separate
ImageKit wrapper with its own prop surface, used in `image-carousel.tsx` and
`blog-post-header.tsx`) doesn't wrap a provider at all, relying on some other ancestor — which,
given the above, doesn't consistently exist. Two components wrapping the same underlying
`<Image>` with slightly different feature sets (fade-in vs. `fill` support) is itself worth
merging.

**Fix:** hoist a single `<ImageKitProvider>` into `layout.tsx` (or a small provider component
wrapping `{children}`), delete the per-instance one in `ImageKitImage`, and consider merging
`ImageKitImage`/`FadeInImage` into one component with a `fadeIn?: boolean` prop.

### 2.5 Two different `cn()` helpers
`src/app/layout.tsx` uses `classnames` (`import cn from "classnames"`) for one class-merge, while
every other component (`food-*.tsx`, `goal-item.tsx`, `finance-treemap-*.tsx`,
`trip-grid-control-bar.tsx`, etc.) uses the project's own `cn` from `@/lib/utils` (`clsx` +
`tailwind-merge`). Functionally similar but not identical (the local one also dedupes conflicting
Tailwind classes). This is the only place `classnames` is used in the whole app.

**Fix:** switch `layout.tsx` to `@/lib/utils`'s `cn`, then drop the `classnames` dependency.

---

## 3. Bugs found along the way

These aren't style issues — they're actual incorrect behavior, worth fixing regardless of the
cleanup pass:

1. **`dayService.ts` `getRandomDay` — infinite-loop risk.**
   ```ts
   let random = Math.floor(Math.random() * 71);
   while (random === current) {
     Math.floor(Math.random() * 71);;   // result discarded, `random` never reassigned
   }
   ```
   If the first random pick equals `current`, the loop body recomputes a random number but never
   assigns it back to `random` — the condition never changes, so the loop never exits. Compare
   with the correct version in `weekService.ts`'s `getRandomWeek` (`random =
   Math.floor(...)` *is* reassigned there). Low-frequency (~1/71 chance per click) but a real hang
   in the browser tab when it happens — "Random Day" button on the homepage.

2. **`weekService.ts` `getAdjacentWeeks` — wrong fallback shape.**
   ```ts
   const previousWeekFind = weeks[weekIndex - 1] ?? { week: -1, draft: true, slug: "" };
   const prevWeek = previousWeekFind && { week: previousWeekFind.index, ... };
   ```
   The fallback object has a `week` property, but the code immediately reads
   `previousWeekFind.index` — which doesn't exist on the fallback, so it evaluates to `undefined`
   instead of the intended `-1`. Same bug mirrored for `nextWeekFind`. Net effect: at the first/last
   week, the prev/next navigation gets `{ week: undefined, isDraft: true, slug: "undefined" }`
   instead of a clean disabled state.

3. **`finance-charts.tsx` fetches two JSON files it never uses** (see §1.2) — not just dead code,
   but two unnecessary network round-trips on every blog post that embeds `<FinanceCharts />`,
   and a bug in the sense that if `finance-data.json` or `finance-treemap-data.json` ever 404s,
   the whole chart shows an error even though the part that's actually rendered
   (`treemapHierarchyData`) loaded fine.

4. **`geoService.ts` `getLocationsByDateRange` — off-by-one month.**
   ```ts
   const parseDate = (dateStr: string): Date => {
     const [year, month, day] = dateStr.split("/");
     return new Date(parseInt(year), parseInt(month), parseInt(day)); // month not -1'd
   };
   ```
   JS `Date` months are 0-indexed; every other date parser in the codebase (`parseTimeString` in
   this same file, `extract-csv-data.js`) correctly subtracts 1. This one doesn't, so date-range
   filtering is off by a month. Currently harmless only because the function is unused (§1.2) —
   but worth fixing or deleting rather than leaving a landmine.

5. **`blogService.ts` doc comment contradicts the code.** `getAllRelevantBlogPosts` is documented
   as "sorted by ascending publish date" but the comparator (`dateB.getTime() - dateA.getTime()`)
   sorts descending (newest first). Not a functional bug, but misleading to the next person who
   reads it expecting ascending order.

---

## 4. Inconsistencies worth normalizing

- **Service module style is split three ways** for the same kind of job (read `content/`, parse,
  return typed data): `WeekDataService` / `FoodService` / `GoalService` / `GeoDataService` are
  static classes; `dayService.ts` / `blogService.ts` export plain functions. `CLAUDE.md` already
  says "follow the existing per-domain pattern rather than introducing a generic content layer" —
  that's the right call for *not* building a shared abstraction, but it doesn't mean the two
  competing conventions (class-with-statics vs. free functions) need to coexist. Picking one and
  converting the other three/two files is a small, low-risk change.
- **Error handling is inconsistent across services**: most `catch` blocks `console.error` and
  return an empty/`null` fallback; a few (`FoodService.getAllFoods`, `GoalService.getAllGoals`,
  `blogService.getBlogPost`) swallow the error silently with no logging at all. Since this is a
  static site with `fs` reads at build time, a silently-empty page during migration debugging
  would be confusing — worth making all of them log consistently.
- **Two frontmatter parsers** (`gray-matter` vs. hand-rolled `markdownParser.ts`) — see §2.3.
- **Duplicate npm scripts**: `"dev"` and `"watch"` in `package.json` are byte-for-byte identical
  (`next dev --turbopack`). Keep one.
- **Loading/error UI markup is copy-pasted** across `finance-charts.tsx`,
  `convenience-store-chart.tsx`, and (formerly) the dead treemap-section files — same
  `bg-gray-50`/`bg-red-50` blocks re-typed each time. Minor, but a shared
  `<AsyncSection loading={..} error={..}>` wrapper would remove ~30 duplicated lines and keep
  future loading states visually consistent.

---

## 5. Action plan

Ordered so each step is independently safe to commit and verify with `npm run build` (the only
correctness check this repo has). Since GitHub Pages migration will force a fully static export
soon anyway, doing this cleanup *first* means you're migrating less code.

**Phase 1 — Delete dead weight (no behavior change, do this first)**
1. Delete the 11 unreferenced files in §1.1.
2. Remove the 8 now-unused dependencies from `package.json` (§1.3) and run `npm install` to
   regenerate the lockfile.
3. Remove `EXAMPLE_PATH` from `constants.ts`; replace `HOME_OG_IMAGE_URL`'s placeholder value
   with a real image from the blog (or generate a proper OG image while you're doing the "extra
   visuals" pass anyway).
4. Delete the duplicate `"watch"` npm script.
5. `npm run build` to confirm nothing broke.

**Phase 2 — Fix the bugs in §3** (small, independent patches)
6. Fix `getRandomDay`'s infinite loop.
7. Fix `getAdjacentWeeks`'s fallback shape.
8. Either wire up or delete the unused `data`/`treemapData` fetches in `finance-charts.tsx`; if
   deleting, check whether `public/finance-treemap-data.json` / `npm run finance-treemap-data` /
   `finance-treemap.tsx`'s dependents are now fully dead and remove that pipeline too.
9. Fix or delete `getLocationsByDateRange`'s month bug (it's unused — deleting alongside
   `getTotalLocationCount` is probably simplest, per §1.2).
10. Fix the misleading doc comment in `blogService.ts`.

**Phase 3 — De-duplicate (moderate risk, test visually after each)**
11. Merge the three random-section components behind one generic component (§2.1); delete the
    abandoned `RandomSectionWrapper` as part of this rather than before it.
12. Extract the shared treemap-drilldown logic out of `finance-treemap-by-category.tsx` /
    `finance-treemap-by-location.tsx` (§2.2).
13. Switch `dayService.ts`/`blogService.ts` to `gray-matter`; delete `utils/markdownParser.ts`
    (§2.3). Diff a few rendered posts before/after since this touches every page.
14. Consolidate `ImageKitImage`/`FadeInImage`, hoist the `ImageKitProvider` to `layout.tsx` (§2.4).
15. Replace `classnames` usage in `layout.tsx` with the shared `cn` from `@/lib/utils`; drop the
    `classnames` dependency (§2.5).

**Phase 4 — Normalize conventions (low risk, mechanical)**
16. Pick one service style (static class or plain functions) and convert the outliers.
17. Make error handling consistent (always log in `catch`) across `src/lib/*Service.ts`.
18. Optional: shared `<AsyncSection>` wrapper for the repeated loading/error markup.

**Phase 5 — Content-tooling audit (needs your input, not mine)**
19. Go through the 6 orphaned scripts in §1.4 and decide, per script: still used when authoring a
    new post/week (keep + document in `CLAUDE.md`'s Commands list), or a historical one-off
    (delete or move to a `scripts/archive/` you won't ship).

Once Phases 1–4 land, the codebase will be meaningfully smaller and every remaining `src/lib/*`
file will be doing exactly one thing in one style — which should make the eventual "convert
server-rendered/server-action code to static generation" migration (already flagged as the
big upcoming task in `CLAUDE.md`) noticeably easier to reason about, since there'll be far fewer
files to check for `fs`/runtime assumptions.
