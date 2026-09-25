// One-off / rare-reseed generator: reads the raw CSV and writes the
// hand-editable source file at content/finance/finance-treemap-hierarchy.json.
//
// That output is meant to be corrected by hand afterwards (wrong category/
// subcategory attributions, un-translated Dutch subcategory names, etc.) —
// it is NOT part of the regular build pipeline. Re-running this script
// overwrites those hand edits, so only do that deliberately (e.g. after
// adding new rows to finance.csv) and re-apply the corrections afterward.
//
// scripts/extract-finance-treemap-hierarchy-data.js reads the (possibly
// hand-edited) output of this script and builds the JSON actually served
// to the visualization.
const fs = require('fs');
const csv = require('csv-parser');

// Kept in lockstep with the same alias table in extract-finance-data.js and
// extract-finance-treemap-data.js — all three scripts read the same raw CSV
// and must agree on location names.
const LOCATION_ALIASES = {
  macao: 'Macau',
  nederland: 'Netherlands',
  other: 'Trip-wide',
  general: 'Trip-wide',
};

function normalizeLocation(raw) {
  const key = raw.trim().toLowerCase();
  return LOCATION_ALIASES[key] || raw.trim();
}

// Kept in lockstep with CATEGORY_ORDER / RAW_CATEGORY_TO_SIMPLE in
// extract-finance-treemap-data.js — this seed file uses the same simplified
// category set so it can share the "latest" category color palette.
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

const RAW_CATEGORY_TO_SIMPLE = {
  Hotel: 'Hotel',
  Flight: 'Flight',
  Cash: 'Cash',
  Food: 'Food',
  Tourist: 'Tourism',
  Transport: 'Transport',
  Kpop: 'Kpop',
  'Travel Material': 'Miscellaneous',
  Admin: 'Miscellaneous',
  Verzorging: 'Miscellaneous',
  Misc: 'Miscellaneous',
};

function simplifyCategory(rawCategory) {
  const simplified = RAW_CATEGORY_TO_SIMPLE[rawCategory];
  if (!simplified) {
    console.warn(`Unmapped category "${rawCategory}" — folding into Miscellaneous`);
    return 'Miscellaneous';
  }
  return simplified;
}

// Manual entries that don't come from the transaction CSV at all.
const MANUAL_ENTRIES = [
  { location: 'Trip-wide', category: 'Salary', subcategory: 'Salary', total: 5000 },
];

const round2 = (n) => Math.round(n * 100) / 100;

const rows = [];

fs.createReadStream('content/finance/finance copy.csv')
  .pipe(csv())
  .on('data', (row) => {
    const amount = parseFloat(String(row.Amount).trim());
    if (Number.isNaN(amount)) {
      console.warn(`Skipping row with unparseable amount: ${JSON.stringify(row)}`);
      return;
    }

    rows.push({
      location: normalizeLocation(row.Locatie),
      category: simplifyCategory(row.Category.trim()),
      subcategory: row.SubCategory.trim(),
      amount,
    });
  })
  .on('end', () => {
    const totals = new Map(); // "location||category||subcategory" -> { total }

    for (const { location, category, subcategory, amount } of rows) {
      const key = `${location}||${category}||${subcategory}`;
      const existing = totals.get(key) ?? { total: 0 };
      existing.total += amount;
      totals.set(key, existing);
    }

    for (const { location, category, subcategory, total } of MANUAL_ENTRIES) {
      const key = `${location}||${category}||${subcategory}`;
      const existing = totals.get(key) ?? { total: 0 };
      existing.total += total;
      totals.set(key, existing);
    }

    const entries = Array.from(totals.entries())
      .map(([key, { total }]) => {
        const [location, category, subcategory] = key.split('||');
        return { location, category, subcategory, total: round2(total) };
      })
      .sort((a, b) => {
        if (a.location !== b.location) return a.location.localeCompare(b.location);
        const catDiff = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
        if (catDiff !== 0) return catDiff;
        return b.total - a.total;
      });

    fs.writeFileSync(
      'content/finance/finance-treemap-hierarchy.json',
      JSON.stringify({ entries }, null, 2) + '\n'
    );

    console.log(`Wrote ${entries.length} location/category/subcategory entries`);
    console.log('Output: content/finance/finance-treemap-hierarchy.json');
    console.log('This file is meant to be hand-corrected — re-running this script overwrites those edits.');
  })
  .on('error', (error) => {
    console.error('Error reading CSV file:', error);
  });
