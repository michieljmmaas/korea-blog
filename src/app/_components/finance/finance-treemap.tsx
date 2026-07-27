"use client"

import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FinanceTreemapEntry } from './types';
import { getLocationColorHex } from '../../../../utils/locationColors';
import { getCategoryColorHex } from '../../../../utils/financeCategoryColors';

type GroupBy = 'location' | 'category';

interface FinanceTreemapProps {
    entries: FinanceTreemapEntry[];
    topDimension: GroupBy;
    title: string;
}

interface TreemapNode {
    name: string;
    value: number;
    children?: TreemapNode[];
}

interface TooltipState {
    x: number;
    y: number;
    name: string;
    amount: number;
    percent: number;
}

const WIDTH = 700;
const HEIGHT = 420;

function colorForTop(name: string, topDimension: GroupBy): string {
    return topDimension === 'location' ? getLocationColorHex(name) : getCategoryColorHex(name);
}

// Vary brightness across siblings so tiles sharing one parent's hue stay distinguishable.
function shade(hex: string, t: number): string {
    const color = d3.color(hex);
    if (!color) return hex;
    const factor = 0.9 - t * 1.1;
    const shaded = factor >= 0 ? color.brighter(factor) : color.darker(-factor);
    return shaded.formatHex();
}

// Groups the flat (location, category, total) entries into a fixed two-level
// tree: top-level nodes for `topDimension`, leaf children for the other axis.
function buildTree(entries: FinanceTreemapEntry[], topDimension: GroupBy): TreemapNode {
    const topKeyOf = (e: FinanceTreemapEntry) => (topDimension === 'location' ? e.location : e.category);
    const childKeyOf = (e: FinanceTreemapEntry) => (topDimension === 'location' ? e.category : e.location);

    const topMap = new Map<string, Map<string, number>>();
    for (const entry of entries) {
        const topName = topKeyOf(entry);
        if (!topMap.has(topName)) topMap.set(topName, new Map());
        const childMap = topMap.get(topName)!;
        const childName = childKeyOf(entry);
        childMap.set(childName, (childMap.get(childName) ?? 0) + entry.total);
    }

    const children = Array.from(topMap.entries())
        .map(([name, childMap]) => {
            const childNodes = Array.from(childMap.entries())
                .map(([childName, value]) => ({ name: childName, value }))
                .sort((a, b) => b.value - a.value);
            return {
                name,
                value: childNodes.reduce((sum, c) => sum + c.value, 0),
                children: childNodes,
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

const FinanceTreemap = ({ entries, topDimension, title }: FinanceTreemapProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    const tree = useMemo(() => buildTree(entries, topDimension), [entries, topDimension]);

    const [path, setPath] = useState<string[]>(['Trip']);
    // Reset the drilldown whenever the filtered data changes, without an
    // extra render pass: https://react.dev/learn/you-might-not-need-an-effect
    const [prevTree, setPrevTree] = useState(tree);
    if (tree !== prevTree) {
        setPrevTree(tree);
        setPath(['Trip']);
    }

    const focusNode = useMemo(() => findNode(tree, path), [tree, path]);
    const ancestorTop = path.length > 1 ? path[1] : null;

    useEffect(() => {
        if (!svgRef.current) return;
        if (!focusNode.children || focusNode.children.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const root = d3.hierarchy<TreemapNode>(focusNode)
            .sum((d) => (d.children && d.children.length > 0 ? 0 : d.value))
            .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

        d3.treemap<TreemapNode>()
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

        cell.transition().duration(150).style('opacity', 1);

        cell.append('rect')
            .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
            .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
            .attr('rx', 4)
            .attr('fill', (d: any, i: number) => {
                if (path.length === 1) return colorForTop(d.data.name, topDimension);
                const base = colorForTop(ancestorTop ?? d.data.name, topDimension);
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
                });
            })
            .on('mouseleave', () => setTooltip(null))
            .on('click', (_event: MouseEvent, d: any) => {
                if (d.data.children && d.data.children.length > 0) {
                    setPath((prev) => [...prev, d.data.name]);
                    setTooltip(null);
                }
            });
    }, [focusNode, path, ancestorTop, topDimension]);

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
                {focusNode.children && focusNode.children.length > 0 ? (
                    <svg
                        ref={svgRef}
                        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                        className="w-full h-auto"
                        role="img"
                        aria-label={`Treemap of spending by ${topDimension}`}
                    />
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

export default FinanceTreemap;
