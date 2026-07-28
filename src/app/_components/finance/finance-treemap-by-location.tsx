"use client"

import { useMemo, useRef, useState, type MouseEvent } from 'react';
import * as d3 from 'd3';
import { FinanceTreemapHierarchyEntry } from './types';
import { getLocationColorHex } from '../../../../utils/locationColors';
import { getCategoryColorHex } from '../../../../utils/financeCategoryColors';

interface FinanceTreemapByLocationProps {
    entries: FinanceTreemapHierarchyEntry[];
    title: string;
}

interface TreemapNode {
    name: string;
    value: number;
    count?: number;
    children?: TreemapNode[];
}

type LayoutNode = d3.HierarchyRectangularNode<TreemapNode>;

interface TooltipState {
    x: number;
    y: number;
    name: string;
    amount: number;
    percent: number;
    count?: number;
}

const WIDTH = 928;
const HEIGHT = 520;

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

function findNode(root: TreemapNode, path: string[]): TreemapNode {
    let node = root;
    for (const name of path.slice(1)) {
        const next = node.children?.find((c) => c.name === name);
        if (!next) break;
        node = next;
    }
    return node;
}

// Vary brightness across siblings so tiles sharing one category's hue stay distinguishable.
function shade(hex: string, t: number): string {
    const color = d3.color(hex);
    if (!color) return hex;
    const factor = 0.9 - t * 1.1;
    const shaded = factor >= 0 ? color.brighter(factor) : color.darker(-factor);
    return shaded.formatHex();
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

const FinanceTreemapByLocation = ({ entries, title }: FinanceTreemapByLocationProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    const tree = useMemo(() => buildTree(entries), [entries]);

    const [path, setPath] = useState<string[]>(['Trip']);
    // Reset the drilldown whenever the filtered data changes, without an
    // extra render pass: https://react.dev/learn/you-might-not-need-an-effect
    const [prevTree, setPrevTree] = useState(tree);
    if (tree !== prevTree) {
        setPrevTree(tree);
        setPath(['Trip']);
    }

    const focusNode = useMemo(() => findNode(tree, path), [tree, path]);

    // d3 only computes the tile rectangles here — React renders them below.
    const layout = useMemo(() => {
        if (!focusNode.children || focusNode.children.length === 0) return null;
        const root = d3.hierarchy<TreemapNode>(focusNode)
            .sum((d) => (d.children && d.children.length > 0 ? 0 : d.value))
            .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
        return d3.treemap<TreemapNode>().size([WIDTH, HEIGHT]).paddingInner(3).round(true)(root);
    }, [focusNode]);

    const total = layout?.value ?? 1;
    const tiles = layout?.children ?? [];

    const handleMouseMove = (event: MouseEvent, node: LayoutNode) => {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;
        setTooltip({
            x: event.clientX - containerRect.left,
            y: event.clientY - containerRect.top,
            name: node.data.name,
            amount: node.value ?? 0,
            percent: total > 0 ? ((node.value ?? 0) / total) * 100 : 0,
            count: node.data.count,
        });
    };

    const handleClick = (node: LayoutNode) => {
        if (node.data.children && node.data.children.length > 0) {
            setPath((prev) => [...prev, node.data.name]);
            setTooltip(null);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{title}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                    {path.map((name, i) => (
                        <span key={name} className="flex items-center gap-1">
                            {i > 0 && <span>/</span>}
                            <button
                                type="button"
                                onClick={() => setPath(path.slice(0, i + 1))}
                                disabled={i === path.length - 1}
                                className={i === path.length - 1 ? 'font-semibold text-gray-900 dark:text-gray-50' : 'hover:underline'}
                            >
                                {name}
                            </button>
                        </span>
                    ))}
                </div>
            </div>
            <div ref={containerRef} className="relative w-full">
                {tiles.length > 0 ? (
                    <svg
                        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                        className="w-full h-auto"
                        role="img"
                        aria-label="Treemap of spending by location, drilling down to category and subcategory"
                    >
                        {tiles.map((node, i) => {
                            const width = Math.max(0, node.x1 - node.x0);
                            const height = Math.max(0, node.y1 - node.y0);
                            const hasChildren = !!(node.data.children && node.data.children.length > 0);
                            return (
                                <g
                                    key={node.data.name}
                                    transform={`translate(${node.x0},${node.y0})`}
                                    style={{ cursor: hasChildren ? 'pointer' : 'default' }}
                                    onMouseMove={(e) => handleMouseMove(e, node)}
                                    onMouseLeave={() => setTooltip(null)}
                                    onClick={() => handleClick(node)}
                                >
                                    <rect
                                        width={width}
                                        height={height}
                                        rx={4}
                                        fill={colorFor(path, node.data.name, i, tiles.length)}
                                        stroke="#fff"
                                        strokeWidth={1.5}
                                    />
                                    {width > 50 && (
                                        <text x={6} y={18} fill="#fff" fontSize={12} fontWeight={600} style={{ pointerEvents: 'none' }}>
                                            {node.data.name}
                                        </text>
                                    )}
                                    {width > 60 && height > 40 && (
                                        <text x={6} y={34} fill="rgba(255,255,255,0.85)" fontSize={11} style={{ pointerEvents: 'none' }}>
                                            {`€${(node.value ?? 0).toFixed(0)}`}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                ) : (
                    <div className="w-full h-48 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                        No data for the current filters.
                    </div>
                )}
                {tooltip && (
                    <div
                        className="pointer-events-none absolute z-10 bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg"
                        style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
                    >
                        <div className="font-semibold">{tooltip.name}</div>
                        <div>€{tooltip.amount.toFixed(2)} ({tooltip.percent.toFixed(1)}%)</div>
                    </div>
                )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Click a tile to zoom in, click the breadcrumb to zoom back out.
            </p>
        </div>
    );
};

export default FinanceTreemapByLocation;
