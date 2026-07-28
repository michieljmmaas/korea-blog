// Reads the hand-editable content/finance/finance-treemap-hierarchy.json
// (seeded from the raw CSV by generate-finance-treemap-hierarchy.js, then
// corrected by hand) and writes the final JSON the location -> category ->
// subcategory treemap actually fetches.
const fs = require('fs');

// Keep in sync with CATEGORY_ORDER in scripts/extract-finance-treemap-data.js
// and utils/financeCategoryColors.ts — same simplified category set, so this
// view can reuse the "latest" category color palette.
const CATEGORY_ORDER = [
  'Hotel',
  'Flight',
  'Cash',
  'Food',
  'Tourism',
  'Transport',
  'Kpop',
  'Miscellaneous',
  'Salary',
];

const round2 = (n) => Math.round(n * 100) / 100;

const source = JSON.parse(fs.readFileSync('content/finance/finance-treemap-hierarchy.json', 'utf8'));

const entries = source.entries.map((entry) => {
  if (!CATEGORY_ORDER.includes(entry.category)) {
    console.warn(
      `content/finance/finance-treemap-hierarchy.json: unrecognized category "${entry.category}" ` +
        `for ${entry.location} / ${entry.subcategory} — check for a typo. Falling through with the color palette's fallback color.`
    );
  }
  return {
    location: entry.location,
    category: entry.category,
    subcategory: entry.subcategory,
    total: round2(entry.total),
    count: entry.count,
  };
});

// Rank by trip spending only — Salary is filtered out of the ranking so the
// one manual income entry doesn't reorder the location pills.
const locations = Array.from(new Set(entries.map((e) => e.location)))
  .map((name) => ({
    name,
    total: entries
      .filter((e) => e.location === name && e.category !== 'Salary')
      .reduce((s, e) => s + e.total, 0),
  }))
  .sort((a, b) => b.total - a.total)
  .map((l) => l.name);

const categories = CATEGORY_ORDER.filter((name) => entries.some((e) => e.category === name));

const output = { entries, locations, categories };

fs.writeFileSync('public/finance-treemap-hierarchy-data.json', JSON.stringify(output, null, 2));

console.log(`Wrote ${entries.length} location/category/subcategory entries`);
console.log(`Locations: ${locations.join(', ')}`);
console.log(`Categories: ${categories.join(', ')}`);
console.log('Output: public/finance-treemap-hierarchy-data.json');
