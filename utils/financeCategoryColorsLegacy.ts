/**
 * Color mapping for the legacy (location -> category -> subcategory)
 * treemap, which still uses the raw, un-simplified category names from
 * public/finance-data.json (as opposed to the small fixed set in
 * financeCategoryColors.ts used by the current 2-level treemap).
 *
 * Validated with the dataviz skill's palette checker: all adjacent-pair
 * CVD/normal-vision floors pass, chroma floor passes. Kept only for the
 * temporary side-by-side data-sanity-check chart — delete alongside
 * finance-treemap-legacy.tsx once that's no longer needed.
 */
const LEGACY_CATEGORY_COLOR_HEX: Record<string, string> = {
    Food: '#0d9488',
    Hotel: '#4f46e5',
    Flight: '#0284c7',
    Kpop: '#db2777',
    'Travel Material': '#9a3412',
    Tourist: '#ca8a04',
    Transport: '#7c3aed',
    Cash: '#059669',
    Admin: '#be123c',
    Verzorging: '#c026d3',
    Misc: '#3f6212',
};

const FALLBACK_HEX = '#57534e';

export function getLegacyCategoryColorHex(category: string): string {
    return LEGACY_CATEGORY_COLOR_HEX[category] ?? FALLBACK_HEX;
}
