"use client"

import { FinanceTreemapHierarchyEntry } from './types';
import { getCategoryColorHex } from '../../../../utils/financeCategoryColors';
import TreemapDrilldown, { TreemapNode, shade } from './treemap-drilldown';

interface FinanceTreemapByCategoryProps {
    entries: FinanceTreemapHierarchyEntry[];
    title: string;
}

// Groups the flat (location, category, subcategory, total) entries into a
// fixed 2-level tree: Category -> Subcategory, merging the same
// category/subcategory across every location into one node.
function buildTree(entries: FinanceTreemapHierarchyEntry[]): TreemapNode {
    const categories = new Map<string, Map<string, { value: number; count: number }>>();
    for (const e of entries) {
        if (!categories.has(e.category)) categories.set(e.category, new Map());
        const subcategories = categories.get(e.category)!;
        const existing = subcategories.get(e.subcategory) ?? { value: 0, count: 0 };
        existing.value += e.total;
        existing.count += e.count;
        subcategories.set(e.subcategory, existing);
    }

    const children = Array.from(categories.entries())
        .map(([name, subcategories]) => {
            const subChildren = Array.from(subcategories.entries())
                .map(([subName, { value, count }]) => ({ name: subName, value, count }))
                .sort((a, b) => b.value - a.value);
            return {
                name,
                value: subChildren.reduce((sum, c) => sum + c.value, 0),
                children: subChildren,
            };
        })
        .sort((a, b) => b.value - a.value);

    return { name: 'Trip', value: children.reduce((sum, c) => sum + c.value, 0), children };
}

// Top level = fixed category palette. Subcategory level shades that category's color.
function colorFor(path: string[], name: string, i: number, siblingCount: number): string {
    const level = path.length; // number of ancestors already chosen (1 = root)
    if (level === 1) return getCategoryColorHex(name); // children are categories
    // level === 2: children are subcategories under path[1] (the category)
    const t = siblingCount > 1 ? i / (siblingCount - 1) : 0.5;
    return shade(getCategoryColorHex(path[1]), t);
}

const FinanceTreemapByCategory = ({ entries, title }: FinanceTreemapByCategoryProps) => (
    <TreemapDrilldown
        entries={entries}
        title={title}
        buildTree={buildTree}
        colorFor={colorFor}
        ariaLabel="Treemap of spending by category, drilling down to subcategory"
    />
);

export default FinanceTreemapByCategory;
