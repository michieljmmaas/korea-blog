"use client"

import { FinanceTreemapHierarchyEntry } from './types';
import { getLocationColorHex } from '../../../../utils/locationColors';
import { getCategoryColorHex } from '../../../../utils/financeCategoryColors';
import TreemapDrilldown, { TreemapNode, shade } from './treemap-drilldown';

interface FinanceTreemapByLocationProps {
    entries: FinanceTreemapHierarchyEntry[];
    title: string;
}

// Groups the flat (location, category, subcategory, total) entries into a
// fixed 3-level tree: Location -> Category -> Subcategory.
function buildTree(entries: FinanceTreemapHierarchyEntry[]): TreemapNode {
    const locations = new Map<string, Map<string, Map<string, { value: number; count: number }>>>();
    for (const e of entries) {
        if (!locations.has(e.location)) locations.set(e.location, new Map());
        const categories = locations.get(e.location)!;
        if (!categories.has(e.category)) categories.set(e.category, new Map());
        const subcategories = categories.get(e.category)!;
        const existing = subcategories.get(e.subcategory) ?? { value: 0, count: 0 };
        existing.value += e.total;
        existing.count += e.count;
        subcategories.set(e.subcategory, existing);
    }

    const children = Array.from(locations.entries())
        .map(([locationName, categories]) => {
            const categoryChildren = Array.from(categories.entries())
                .map(([categoryName, subcategories]) => {
                    const subChildren = Array.from(subcategories.entries())
                        .map(([subName, { value, count }]) => ({ name: subName, value, count }))
                        .sort((a, b) => b.value - a.value);
                    return {
                        name: categoryName,
                        value: subChildren.reduce((sum, c) => sum + c.value, 0),
                        children: subChildren,
                    };
                })
                .sort((a, b) => b.value - a.value);
            return {
                name: locationName,
                value: categoryChildren.reduce((sum, c) => sum + c.value, 0),
                children: categoryChildren,
            };
        })
        .sort((a, b) => b.value - a.value);

    return { name: 'Trip', value: children.reduce((sum, c) => sum + c.value, 0), children };
}

// Top level = location color. Category level always uses the fixed category
// palette (so it reads the same as the "by category" chart). Subcategory
// level shades that category's color.
function colorFor(path: string[], name: string, i: number, siblingCount: number): string {
    const level = path.length; // number of ancestors already chosen (1 = root)
    if (level === 1) return getLocationColorHex(name); // children are locations
    if (level === 2) return getCategoryColorHex(name); // children are categories
    // level === 3: children are subcategories under path[2] (the category)
    const t = siblingCount > 1 ? i / (siblingCount - 1) : 0.5;
    return shade(getCategoryColorHex(path[2]), t);
}

const FinanceTreemapByLocation = ({ entries, title }: FinanceTreemapByLocationProps) => (
    <TreemapDrilldown
        entries={entries}
        title={title}
        buildTree={buildTree}
        colorFor={colorFor}
        ariaLabel="Treemap of spending by location, drilling down to category and subcategory"
    />
);

export default FinanceTreemapByLocation;
