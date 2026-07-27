const fs = require('fs');
const csv = require('csv-parser');

// Kept in lockstep with the same alias table in extract-finance-data.js —
// both scripts read the same raw CSV and must agree on location names.
const LOCATION_ALIASES = {
  macao: 'Macau',
  nederland: 'Netherlands',
};

function normalizeLocation(raw) {
  const key = raw.trim().toLowerCase();
  return LOCATION_ALIASES[key] || raw.trim();
}

// Collapses the raw CSV categories down to the small set the treemap
// filter UI shows. Order here defines the canonical category order used
// throughout the app — keep it in sync with CATEGORY_ORDER in
// utils/financeCategoryColors.ts (one slot per array position, matched by
// index, not by name).
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
  Flight: 'Flight', // includes the old "International" subcategory
  Cash: 'Cash',
  Food: 'Food',
  Tourist: 'Tourism',
  Transport: 'Transport',
  Kpop: 'Kpop',
  'Travel Material': 'Miscellaneous', // includes the old "Gear" subcategory
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
  { location: 'Netherlands', category: 'Salary', total: 4000 },
];

const round2 = (n) => Math.round(n * 100) / 100;

const rows = [];

fs.createReadStream('content/finance/finance.csv')
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
      amount,
    });
  })
  .on('end', () => {
    const totals = new Map(); // "location||category" -> total

    for (const { location, category, amount } of rows) {
      const key = `${location}||${category}`;
      totals.set(key, (totals.get(key) ?? 0) + amount);
    }

    for (const { location, category, total } of MANUAL_ENTRIES) {
      const key = `${location}||${category}`;
      totals.set(key, (totals.get(key) ?? 0) + total);
    }

    const entries = Array.from(totals.entries()).map(([key, total]) => {
      const [location, category] = key.split('||');
      return { location, category, total: round2(total) };
    });

    // Rank by trip spending only — Salary is filtered out of the ranking so
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

    fs.writeFileSync('public/finance-treemap-data.json', JSON.stringify(output, null, 2));

    console.log(`Wrote ${entries.length} location/category entries`);
    console.log(`Locations: ${locations.join(', ')}`);
    console.log(`Categories: ${categories.join(', ')}`);
    console.log('Output: public/finance-treemap-data.json');
  })
  .on('error', (error) => {
    console.error('Error reading CSV file:', error);
  });
