/**
 * Palette for the treemap's "by category" view — swap these hex values to
 * try a different palette. Deliberately a different set of hues than
 * `locationColors.ts` so the two grouping modes stay visually distinct.
 */
// export const CATEGORY_COLOR_PALETTE: string[] = [
//     '#f8f9fa',
//     '#adb5bd',
//     '#212529',
//     '#e63946',
//     '#f95738',
//     '#ffba08',
//     '#4daa57',
//     '#2f6690',
//     '#9113a4',
// ];

export const CATEGORY_COLOR_PALETTE: string[] = ["#ffc800","#f6992d","#ed6a5a","#a75a5a","#60495a","#4c7680","#38a3a5","#7dba60","#c2d11b"];


/**
 * Canonical category order — index into this list picks the palette slot.
 * Keep in sync with CATEGORY_ORDER in scripts/extract-finance-treemap-data.js.
 */
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

const FALLBACK_HEX = '#57534e';

/** Returns a hex color for use as an SVG fill/stroke, e.g. in the finance treemap. */
export function getCategoryColorHex(category: string): string {
    const index = CATEGORY_ORDER.indexOf(category);
    if (index === -1) return FALLBACK_HEX;
    return CATEGORY_COLOR_PALETTE[index % CATEGORY_COLOR_PALETTE.length] ?? FALLBACK_HEX;
}
