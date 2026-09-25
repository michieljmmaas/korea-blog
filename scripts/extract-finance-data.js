const fs = require('fs');
const csv = require('csv-parser');

const LOCATION_ALIASES = {
  macao: 'Macau',
  nederland: 'Netherlands',
};

function normalizeLocation(raw) {
  const key = raw.trim().toLowerCase();
  return LOCATION_ALIASES[key] || raw.trim();
}

// The Item text is free-form ("CU voor ontbijt", "Convience Store GS25", ...)
// so convenience store franchise isn't its own column — recover it by
// keyword. Order matters: check the more specific chains before falling
// back to "Other".
const CONVENIENCE_STORE_PATTERNS = [
  [/7-11|7\/11/i, '7-Eleven'],
  [/\bgs25\b/i, 'GS25'],
  [/\bcu\b/i, 'CU'],
  [/family\s*mart/i, 'Family Mart'],
  [/circle\s*k/i, 'Circle K'],
  [/e-?mart/i, 'E-Mart'],
  [/mister\s*donut/i, 'Mister Donut'],
  [/paris\s*baguette/i, 'Paris Baguette'],
];

function classifyConvenienceStore(item) {
  for (const [pattern, name] of CONVENIENCE_STORE_PATTERNS) {
    if (pattern.test(item)) return name;
  }
  return 'Other';
}

const transactions = [];

fs.createReadStream('content/finance/finance.csv')
  .pipe(csv())
  .on('data', (row) => {
    const amount = parseFloat(String(row.Amount).trim());
    if (Number.isNaN(amount)) {
      console.warn(`Skipping row with unparseable amount: ${JSON.stringify(row)}`);
      return;
    }

    transactions.push({
      locatie: normalizeLocation(row.Locatie),
      budgetType: row.BudgetType.trim(),
      category: row.Category.trim(),
      subcategory: row.SubCategory.trim(),
      item: row.Item.trim(),
      amount,
    });
  })
  .on('end', () => {
    // Locatie -> Category -> SubCategory, aggregated by total amount
    const locationMap = new Map();

    for (const t of transactions) {
      if (!locationMap.has(t.locatie)) {
        locationMap.set(t.locatie, { value: 0, categories: new Map() });
      }
      const locationNode = locationMap.get(t.locatie);
      locationNode.value += t.amount;

      if (!locationNode.categories.has(t.category)) {
        locationNode.categories.set(t.category, { value: 0, subcategories: new Map() });
      }
      const categoryNode = locationNode.categories.get(t.category);
      categoryNode.value += t.amount;

      if (!categoryNode.subcategories.has(t.subcategory)) {
        categoryNode.subcategories.set(t.subcategory, { value: 0, count: 0 });
      }
      const subcategoryNode = categoryNode.subcategories.get(t.subcategory);
      subcategoryNode.value += t.amount;
      subcategoryNode.count += 1;
    }

    const round2 = (n) => Math.round(n * 100) / 100;

    const hierarchy = {
      name: 'Trip',
      children: Array.from(locationMap.entries())
        .map(([locatie, locationNode]) => ({
          name: locatie,
          value: round2(locationNode.value),
          children: Array.from(locationNode.categories.entries())
            .map(([category, categoryNode]) => ({
              name: category,
              value: round2(categoryNode.value),
              children: Array.from(categoryNode.subcategories.entries())
                .map(([subcategory, subcategoryNode]) => ({
                  name: subcategory,
                  value: round2(subcategoryNode.value),
                  count: subcategoryNode.count,
                }))
                .sort((a, b) => b.value - a.value),
            }))
            .sort((a, b) => b.value - a.value),
        }))
        .sort((a, b) => b.value - a.value),
    };

    // Convenience store franchise breakdown (Food / Convenience Store only).
    // Mister Donut and Paris Baguette are excluded entirely — they're
    // bakeries, not konbinis, so they don't belong in this comparison.
    const EXCLUDED_FRANCHISES = new Set(['Mister Donut', 'Paris Baguette']);
    const convenienceStoreMap = new Map();
    for (const t of transactions) {
      if (t.category !== 'Food' || t.subcategory !== 'Convenience Store') continue;

      const franchise = classifyConvenienceStore(t.item);
      if (EXCLUDED_FRANCHISES.has(franchise)) continue;

      if (!convenienceStoreMap.has(franchise)) {
        convenienceStoreMap.set(franchise, { value: 0, count: 0 });
      }
      const node = convenienceStoreMap.get(franchise);
      node.value += t.amount;
      node.count += 1;
    }

    const convenienceStores = Array.from(convenienceStoreMap.entries())
      .map(([name, node]) => ({ name, value: round2(node.value), count: node.count }))
      .sort((a, b) => b.value - a.value);

    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    const biggestPurchase = transactions.reduce((max, t) => (t.amount > max.amount ? t : max), transactions[0]);

    const output = {
      transactions: transactions.map((t) => ({ ...t, amount: round2(t.amount) })),
      hierarchy,
      convenienceStores,
      summary: {
        total: round2(total),
        transactionCount: transactions.length,
        biggestPurchase: {
          item: biggestPurchase.item,
          amount: round2(biggestPurchase.amount),
          locatie: biggestPurchase.locatie,
        },
      },
    };

    fs.writeFileSync('public/finance-data.json', JSON.stringify(output, null, 2));

    console.log(`Processed ${transactions.length} transactions`);
    console.log(`Total spent: €${output.summary.total.toFixed(2)}`);
    console.log(`Locations: ${Array.from(locationMap.keys()).join(', ')}`);
    console.log(`Biggest purchase: ${biggestPurchase.item} (€${biggestPurchase.amount.toFixed(2)}, ${biggestPurchase.locatie})`);
    console.log('Convenience stores:', convenienceStores.map((c) => `${c.name} €${c.value.toFixed(2)}`).join(', '));
    console.log('Output: public/finance-data.json');
  })
  .on('error', (error) => {
    console.error('Error reading CSV file:', error);
  });
