# Blog To-Do

Drafted from `blog-sample.md`. General note: every `<Img ...>` tag below references a photo ID that doesn't exist on ImageKit yet — none of these are real uploads, just descriptive placeholders I picked so the text reads naturally. They all need real photos sourced and uploaded under `/blogs/{slug}/` before the pages will render images instead of broken placeholders.

## MAMA (`content/blogs/mama.md`)

- [ ] Pick and upload real photos to ImageKit under `/blogs/mama/` — replace placeholder IDs (`crowd`, `tickets`, `lightsticks`, `super-junior`, `aespa`, `trophy`) with real ones, and add more for the closing "photo dump"
- [ ] Double-check the awards list against what MAMA 2025 actually handed out, if you want it 100% accurate rather than "close enough from memory"
- [ ] Fill in the actual ticket-resale story (platform used, how much extra you paid) — I kept it vague since the outline didn't have specifics
- [ ] Decide on final `publishdate` (currently placeholder `2025-12-08`)
- [ ] Set `draft: false` when ready

## Souvenirs (`content/blogs/souvenirs.md`)

- [ ] The "Photoshoot" section is now just a short teaser linking to the dedicated `photoshoot.md` post (see below) — reread the teaser paragraph for tone
- [ ] Upload real photos to `/blogs/souvenirs/` — replace `keyrings`, `crests`, `items-stand`, `collage`, `picture-frame`, `frame-build`
- [ ] "Crests" section is entirely invented (no specifics existed anywhere in your content) — rewrite with what you actually made, and how
- [ ] Confirm the keyring collection details — I pulled real ones from Day 22 (Seoul), Day 46 (Tokyo Diet Building), and Day 59 (Alishan), plus a generic "one more in Hong Kong." Add/correct as needed.
- [ ] "Items" section needs the actual trinkets you kept — I guessed at Tokyu Hands finds, Hokusai/Yoasobi prints, based on your finance spreadsheet
- [ ] "Vlog" section needs the actual embed/link once the vlog is edited and uploaded somewhere (YouTube?)
- [ ] "Picture Frame" section needs the real GitHub link once that project is public, plus real photos of the build
- [ ] Decide on final `publishdate` (currently placeholder `2025-12-10`)
- [ ] Set `draft: false` when ready

## Picture Day (`content/blogs/photoshoot.md`)

- [ ] This is the big one for photos: it's meant to be the actual dump of the final edited set, so it needs way more real images than the 12 placeholders I stubbed in (`fitting`, `hanbok-1/2/3`, `office-1/2/3`, `neon-1/2/3/4`, `bts`) — add/remove `<Img>` tags to match however many keepers you actually pick
- [ ] Upload the real photos to `/blogs/photoshoot/`
- [ ] Consider swapping the `{Full edited gallery to go here...}` placeholder at the end for either more `<Img>` tags or a proper gallery component if one exists
- [ ] Decide on final `publishdate` (currently placeholder `2025-12-09`, set to land just before `souvenirs.md`)
- [ ] Set `draft: false` when ready

## Comparing the Locations (`content/blogs/comparing-the-locations.md`)

- [ ] I filled in every blank you left (Korea/Taiwan Legal Tender, Taiwan/Hong Kong Accommodation) with plausible content based on what's elsewhere in the blog — read through and correct anything that doesn't match your actual experience
- [ ] Built the "widget" as a `<CompareTable type="...">` tag, one per category, placed right under each `## Heading` in the markdown alongside a short intro paragraph and an `<Img>` — see `src/app/_components/blog/location-comparison-table.tsx`. Each tag is keyed to an entry in the `CATEGORIES` record in that file (`convenience-stores`, `nature`, `legal-tender`, `public-transit`, `people-culture`, `museums`, `street-food`, `accommodation`).
- [ ] Note: **the four-location blurb text still lives in `location-comparison-table.tsx`, not the markdown** — the `type="..."` attribute only tells the component which category to render, it doesn't carry any text itself. If you'd rather edit that text directly in the `.md` file going forward, this needs a different approach (embedding the text in the tag's attributes, or as plain prose the component reads from context) — let me know and I can switch it.
- [ ] Added a short "fluff" intro paragraph per category and folded the `<Day 9>` / `<Blog worst-things>` / `<Blog capsule-hotel>` links back into that prose now that it's regular markdown again — reread these, they're mostly new text
- [ ] Added an `<Img {category} desc="...">` placeholder per category (8 total) — same as the other new posts, these need real photos uploaded to `/blogs/comparing-the-locations/` before they'll render
- [ ] Decide on final `publishdate` (currently placeholder `2025-12-12`)
- [ ] Set `draft: false` when ready

## One Year Later (`content/blogs/one-year-later.md`)

- [ ] Biggest one: this post is dated a year after you got back (`2026-12-04`) — confirm that's actually when you want to publish it, versus publishing it sooner and adjusting the framing
- [ ] Verify the "Seoulo feature updates" list matches what's actually shipped by publish time (geo data, hover previews, GitHub Pages migration, etc.) — I pulled this straight from your outline
- [ ] Confirm the TWICE/contract details are accurate and still current by the time this goes live — real-world stuff can move fast
- [ ] Upload a real photo for the Amsterdam TWICE concert (`amsterdam` placeholder) — or drop the `<Img>` if you don't have one you like
- [ ] The "Post-Trip Pessimism" and "Next Steps" sections were fleshed out fairly directly from your notes — reread for tone, this is the most personal post of the four
- [ ] Set `draft: false` when ready to publish

## Alishan (`content/blogs/alisan.md`)

This one wasn't part of the original outline — it was an existing (already `draft: false`, already live) post that was basically empty, so it got filled in the same way as the others, sourced from <Day 59> and <Day 60>.

- [ ] Upload real photos to `/blogs/alisan/` — replace `arrival`, `map`, `two-sisters-pond`, `pig-trunk`, `sunrise-train`, `sunrise`, `biggest-tree`, `mammoth-stump`, `three-generation-tree`
- [ ] This post is already live (`draft: false`) with placeholder images, since it was already published before I touched it — you may want to double check how it looks on the actual site right now
- [ ] `thumb: sunrise` is a placeholder ID like the rest — swap for whichever real photo you want as the card thumbnail

---

# Photo Checklist

Every photo ID below is a placeholder — none of these exist on ImageKit yet. Upload each under `/blogs/{slug}/{id}` to match. Thumbnail is called out separately even when it reuses one of the IDs below, since that's the one used for post cards/link previews.

## mama

- [ ] Thumbnail — `crowd` (shared with the photo below)
- [ ] `crowd` — 50,000 of my closest friends
- [ ] `tickets` — The scalpers came through, eventually
- [ ] `lightsticks` — An entire stadium doing the wave, but with light
- [ ] `super-junior` — Twenty years and still going strong
- [ ] `aespa` — This performance gave me a nosebleed
- [ ] `trophy` — Acting surprised is apparently part of the choreography
- [ ] More photos for the closing "photo dump" (`{More photos to come}`) — count and IDs still to be decided

## souvenirs

- [ ] Thumbnail — `collage` (shared with the photo below)
- [ ] `keyrings` — The whole gang, together at last
- [ ] `crests` — A small collection of very unofficial achievements
- [ ] `items-stand` — A little shelf for a lot of small memories
- [ ] `collage` — Every scrap of paper tells a story
- [ ] `picture-frame` — Small, but it holds 10 weeks of memories
- [ ] `frame-build` — Prototyping in progress

## photoshoot

- [ ] Thumbnail — `neon-1` (shared with the photo below)
- [ ] `fitting` — Getting into character
- [ ] `hanbok-1` — Trying very hard to look like I do this every day
- [ ] `hanbok-2` — The grounds really do the work here
- [ ] `hanbok-3` — Worth the sore cheeks
- [ ] `office-1` — This is genuinely what my "office" looked like most days
- [ ] `office-2` — The skyline did most of the heavy lifting here too
- [ ] `office-3` — Pretending to work, not pretending to enjoy the view
- [ ] `neon-1` — Blade Runner 2025
- [ ] `neon-2` — Trying to look like I belong in this chaos
- [ ] `neon-3` — One of the narrower alleys
- [ ] `neon-4` — The last shot of the day, and my favorite
- [ ] `bts` — Behind the scenes, looking a lot less glamorous
- [ ] Full edited gallery for the closing section (`{Full edited gallery to go here...}`) — count and IDs still to be decided

## comparing-the-locations

- [ ] Thumbnail — currently the literal placeholder value `thumb`, not a real photo ID; pick a real header image and update `thumb:` in the frontmatter
- [ ] `convenience-stores` — Four countries, four very different shelves
- [ ] `nature` — Green, in four different flavors
- [ ] `legal-tender` — A small fortune in leftover coins
- [ ] `public-transit` — So many different ways to get lost underground
- [ ] `people-culture` — Strangers who were patient with my terrible pronunciation
- [ ] `museums` — Museum feet, museum feet everywhere
- [ ] `street-food` — Grazing my way through four different markets
- [ ] `accommodation` — Home, for a few nights at a time

## one-year-later

- [ ] Thumbnail — currently the literal placeholder value `thumb`, not a real photo ID; pick a real header image and update `thumb:` in the frontmatter
- [ ] `amsterdam` — Round two, this time on home turf

## alisan

- [ ] Thumbnail — `sunrise` (shared with the photo below)
- [ ] `arrival` — Stepping off the bus into actual fresh air
- [ ] `map` — I mean, look at this thing!
- [ ] `two-sisters-pond` — One of the Two Sisters Ponds
- [ ] `pig-trunk` — This trunk looks like a pig, they say
- [ ] `sunrise-train` — Choo choo!
- [ ] `sunrise` — Peekaboo!
- [ ] `biggest-tree` — The biggest tree in the park
- [ ] `mammoth-stump` — This stump looks like a woolly mammoth
- [ ] `three-generation-tree` — Three trees that grew on top of each other
