"use client"

// Temporary side-by-side chart for sanity-checking the new 2-level treemap's
// numbers against the full location -> category -> subcategory breakdown.
// Delete this file (and financeCategoryColorsLegacy.ts) once that's done.

import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FinanceHierarchyNode } from './types';
import { getLocationColorHex } from '../../../../utils/locationColors';
import { getLegacyCategoryColorHex } from '../../../../utils/financeCategoryColorsLegacy';

interface FinanceTreemapLegacyProps {
    hierarchy: FinanceHierarchyNode;
}

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

function findNode(root: FinanceHierarchyNode, path: string[]): FinanceHierarchyNode {
    let node = root;
    for (const name of path.slice(1)) {
        const next = node.children?.find((c) => c.name === name);
        if (!next) break;
        node = next;
    }
    return node;
}

// Re-roots the location -> category -> subcategory hierarchy into
// category -> subcategory, merging the same category/subcategory across
// every location into one node.
function buildCategoryHierarchy(root: FinanceHierarchyNode): FinanceHierarchyNode {
    const categories = new Map<string, Map<string, { value: number; count: number }>>();

    for (const location of root.children ?? []) {
        for (const category of location.children ?? []) {
            if (!categories.has(category.name)) categories.set(category.name, new Map());
            const subcategories = categories.get(category.name)!;

            for (const subcategory of category.children ?? []) {
                const existing = subcategories.get(subcategory.name) ?? { value: 0, count: 0 };
                existing.value += subcategory.value;
                existing.count += subcategory.count ?? 0;
                subcategories.set(subcategory.name, existing);
            }
        }
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

    return { name: root.name, value: root.value, children };
}

// Vary brightness across siblings so tiles sharing one top-level node's hue stay distinguishable.
function shade(hex: string, t: number): string {
    const color = d3.color(hex);
    if (!color) return hex;
    const factor = 0.9 - t * 1.1;
    const shaded = factor >= 0 ? color.brighter(factor) : color.darker(-factor);
    return shaded.formatHex();
}

const FinanceTreemapLegacy = ({ hierarchy }: FinanceTreemapLegacyProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [groupBy, setGroupBy] = useState<'location' | 'category'>('location');
    const [path, setPath] = useState<string[]>([hierarchy.name]);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    const displayHierarchy = useMemo(
        () => (groupBy === 'category' ? buildCategoryHierarchy(hierarchy) : hierarchy),
        [hierarchy, groupBy]
    );

    const focusNode = useMemo(() => findNode(displayHierarchy, path), [displayHierarchy, path]);
    const ancestorTop = path.length > 1 ? path[1] : null;
    const colorForTop = groupBy === 'location' ? getLocationColorHex : getLegacyCategoryColorHex;

    const handleGroupByChange = (next: 'location' | 'category') => {
        if (next === groupBy) return;
        setGroupBy(next);
        setPath([hierarchy.name]);
        setTooltip(null);
    };

    useEffect(() => {
        if (!svgRef.current) return;
        if (!focusNode.children || focusNode.children.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const root = d3.hierarchy<FinanceHierarchyNode>(focusNode)
            .sum((d) => (d.children && d.children.length > 0 ? 0 : d.value))
            .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

        d3.treemap<FinanceHierarchyNode>()
            .size([WIDTH, HEIGHT])
            .paddingInner(3)
            .round(true)(root);

        const total = root.value ?? 1;
        const children = root.children ?? [];

        const cell = svg.append('g')
            .selectAll('g')
            .data(children)
            .join('g')
            .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`)
            .style('cursor', (d: any) => (d.data.children && d.data.children.length > 0 ? 'pointer' : 'default'))
            .style('opacity', 0);

        cell.transition().duration(300).style('opacity', 1);

        cell.append('rect')
            .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
            .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
            .attr('rx', 4)
            .attr('fill', (d: any, i: number) => {
                if (path.length === 1) return colorForTop(d.data.name);
                const base = colorForTop(ancestorTop ?? d.data.name);
                const t = children.length > 1 ? i / (children.length - 1) : 0.5;
                return shade(base, t);
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5);

        cell.append('text')
            .attr('x', 6)
            .attr('y', 18)
            .attr('fill', '#fff')
            .style('font-size', '12px')
            .style('font-weight', '600')
            .style('pointer-events', 'none')
            .text((d: any) => (d.x1 - d.x0 > 50 ? d.data.name : ''));

        cell.append('text')
            .attr('x', 6)
            .attr('y', 34)
            .attr('fill', 'rgba(255,255,255,0.85)')
            .style('font-size', '11px')
            .style('pointer-events', 'none')
            .text((d: any) => (d.x1 - d.x0 > 60 && d.y1 - d.y0 > 40 ? `€${(d.value ?? 0).toFixed(0)}` : ''));

        cell
            .on('mousemove', (event: MouseEvent, d: any) => {
                const containerRect = containerRef.current?.getBoundingClientRect();
                if (!containerRect) return;
                setTooltip({
                    x: event.clientX - containerRect.left,
                    y: event.clientY - containerRect.top,
                    name: d.data.name,
                    amount: d.value ?? 0,
                    percent: total > 0 ? ((d.value ?? 0) / total) * 100 : 0,
                    count: d.data.count,
                });
            })
            .on('mouseleave', () => setTooltip(null))
            .on('click', (_event: MouseEvent, d: any) => {
                if (d.data.children && d.data.children.length > 0) {
                    setPath((prev) => [...prev, d.data.name]);
                    setTooltip(null);
                }
            });
    }, [focusNode, path, ancestorTop, colorForTop]);

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                    Spending breakdown <span className="font-normal text-gray-400">(old, 3-level — for sanity-checking numbers)</span>
                </h3>
                <div
                    role="group"
                    aria-label="Group top-level tiles by"
                    className="inline-flex items-center rounded-md border border-gray-200 dark:border-gray-700 p-0.5 text-sm"
                >
                    {(['location', 'category'] as const).map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => handleGroupByChange(option)}
                            aria-pressed={groupBy === option}
                            className={
                                groupBy === option
                                    ? 'px-2.5 py-1 rounded bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900'
                                    : 'px-2.5 py-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                        >
                            {option === 'location' ? 'By location' : 'By category'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 flex-wrap mb-3">
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
            <div ref={containerRef} className="relative w-full">
                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    className="w-full h-auto"
                    role="img"
                    aria-label="Treemap of spending by location, category, and subcategory"
                />
                {tooltip && (
                    <div
                        className="pointer-events-none absolute z-10 bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg"
                        style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
                    >
                        <div className="font-semibold">{tooltip.name}</div>
                        <div>€{tooltip.amount.toFixed(2)} ({tooltip.percent.toFixed(1)}%)</div>
                        {tooltip.count !== undefined && (
                            <div>{tooltip.count} transaction{tooltip.count === 1 ? '' : 's'}</div>
                        )}
                    </div>
                )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Click a tile to zoom in, click a breadcrumb to zoom back out.
            </p>
        </div>
    );
};

export default FinanceTreemapLegacy;
