"use client"

import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal, sankeyJustify } from 'd3-sankey';
import { FinanceTreemapHierarchyEntry } from './types';
import { getLocationColorHex } from '../../../../utils/locationColors';
import { getCategoryColorHex } from '../../../../utils/financeCategoryColors';

interface FinanceSankeyProps {
    entries: FinanceTreemapHierarchyEntry[];
}

interface RawNode {
    id: string;
    name: string;
    kind: 'location' | 'category' | 'subcategory';
    // Category name backing this node's color — set on category and
    // subcategory nodes so both shades derive from the same category.
    category?: string;
}

interface RawLink {
    source: string;
    target: string;
    value: number;
    locatie: string;
}

interface TooltipState {
    x: number;
    y: number;
    label: string;
    amount: number;
}

const WIDTH = 928;
const HEIGHT = 1400;
const MIN_LABEL_HEIGHT = 9;

// Location -> Category -> Subcategory, flattened into two link stages. Every
// link (including category->subcategory) keeps its originating `locatie` so
// the whole diagram — not just the first column — reads by location color.
// Category and subcategory nodes are shared across locations (same category
// name from different locations collapses into one node in that column), so
// a category/subcategory's node total is its trip-wide sum, fed by
// location-colored links.
function buildGraph(entries: FinanceTreemapHierarchyEntry[]) {
    const nodes = new Map<string, RawNode>();
    const links: RawLink[] = [];

    const locCatTotals = new Map<string, number>();
    for (const entry of entries) {
        const key = `${entry.location}||${entry.category}`;
        locCatTotals.set(key, (locCatTotals.get(key) ?? 0) + entry.total);
    }

    const addedLocCatLinks = new Set<string>();

    for (const entry of entries) {
        const locId = `loc:${entry.location}`;
        if (!nodes.has(locId)) nodes.set(locId, { id: locId, name: entry.location, kind: 'location' });

        const catId = `cat:${entry.category}`;
        if (!nodes.has(catId)) nodes.set(catId, { id: catId, name: entry.category, kind: 'category', category: entry.category });

        const locCatKey = `${entry.location}||${entry.category}`;
        if (!addedLocCatLinks.has(locCatKey)) {
            addedLocCatLinks.add(locCatKey);
            links.push({ source: locId, target: catId, value: locCatTotals.get(locCatKey)!, locatie: entry.location });
        }

        const subId = `sub:${entry.category}::${entry.subcategory}`;
        if (!nodes.has(subId)) {
            nodes.set(subId, { id: subId, name: `${entry.category} · ${entry.subcategory}`, kind: 'subcategory', category: entry.category });
        }
        links.push({ source: catId, target: subId, value: entry.total, locatie: entry.location });
    }

    return { nodes: Array.from(nodes.values()), links };
}

const FinanceSankey = ({ entries }: FinanceSankeyProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);
    const [focusId, setFocusId] = useState<string | null>(null);

    const graph = useMemo(() => buildGraph(entries), [entries]);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const sankeyGenerator = sankey<RawNode, RawLink>()
            .nodeId((d) => d.id)
            .nodeWidth(14)
            .nodePadding(8)
            .nodeAlign(sankeyJustify)
            .extent([[1, 5], [WIDTH - 1, HEIGHT - 5]]);

        const { nodes, links } = sankeyGenerator({
            nodes: graph.nodes.map((d) => ({ ...d })),
            links: graph.links.map((d) => ({ ...d })),
        } as any) as any;

        // Direct links only (not a full connected-component trace) — the
        // location nodes are hubs connected to nearly every category, so a
        // multi-hop BFS from any node balloons out to almost the whole graph
        // and nothing reads as "faded". Direct neighbors is the useful,
        // standard Sankey click behavior: only the flows touching this node.
        function directLinks(nodeId: string): Set<any> {
            const result = new Set<any>();
            for (const l of links as any[]) {
                if (l.source.id === nodeId || l.target.id === nodeId) result.add(l);
            }
            return result;
        }

        function isNodeHighlighted(d: any, highlightedLinks: Set<any>): boolean {
            if (d.id === focusId) return true;
            for (const l of highlightedLinks) {
                if (l.source.id === d.id || l.target.id === d.id) return true;
            }
            return false;
        }

        const highlighted = focusId ? directLinks(focusId) : null;

        const linkGroup = svg.append('g').attr('fill', 'none');

        linkGroup.selectAll('path')
            .data(links as any[])
            .join('path')
            .attr('d', sankeyLinkHorizontal() as any)
            .attr('stroke', (d: any) => getLocationColorHex(d.locatie))
            .attr('stroke-width', (d: any) => Math.max(1, d.width))
            .attr('stroke-opacity', (d: any) => (highlighted ? (highlighted.has(d) ? 0.65 : 0.05) : 0.3))
            .style('cursor', 'pointer')
            .on('mousemove', (event: MouseEvent, d: any) => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (!rect) return;
                setTooltip({
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top,
                    label: `${d.source.name} → ${d.target.name}`,
                    amount: d.value,
                });
            })
            .on('mouseleave', () => setTooltip(null));

        const nodeGroup = svg.append('g');

        const nodeSel = nodeGroup.selectAll('g')
            .data(nodes as any[])
            .join('g')
            .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`)
            .style('cursor', 'pointer')
            .on('click', (_event: MouseEvent, d: any) => {
                setFocusId((prev) => (prev === d.id ? null : d.id));
            })
            .on('mousemove', (event: MouseEvent, d: any) => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (!rect) return;
                setTooltip({
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top,
                    label: d.name,
                    amount: d.value ?? 0,
                });
            })
            .on('mouseleave', () => setTooltip(null));

        nodeSel.append('rect')
            .attr('width', (d: any) => d.x1 - d.x0)
            .attr('height', (d: any) => Math.max(1, d.y1 - d.y0))
            .attr('fill', (d: any) => (d.kind === 'location' ? getLocationColorHex(d.name) : getCategoryColorHex(d.category)))
            .attr('opacity', (d: any) => (highlighted ? (isNodeHighlighted(d, highlighted) ? 1 : 0.25) : 1));

        nodeSel.append('text')
            .attr('x', (d: any) => (d.x0 < WIDTH / 2 ? (d.x1 - d.x0) + 6 : -6))
            .attr('y', (d: any) => (d.y1 - d.y0) / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', (d: any) => (d.x0 < WIDTH / 2 ? 'start' : 'end'))
            .style('font-size', '11px')
            .style('pointer-events', 'none')
            .attr('fill', 'currentColor')
            // Skip labels on the long tail of tiny nodes — they'd only collide.
            // A hover tooltip + <title> still surface the name for these.
            .text((d: any) => (d.y1 - d.y0 >= MIN_LABEL_HEIGHT ? d.name : ''));

        nodeSel.append('title').text((d: any) => `${d.name}\n€${(d.value ?? 0).toFixed(2)}`);
    }, [graph, focusId]);

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Money flow</h3>
                {focusId && (
                    <button
                        type="button"
                        onClick={() => setFocusId(null)}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
                    >
                        Clear selection
                    </button>
                )}
            </div>
            <div ref={containerRef} className="relative w-full text-gray-800 dark:text-gray-200">
                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    className="w-full h-auto"
                    role="img"
                    aria-label="Sankey diagram of money flowing from location to category to subcategory"
                />
                {tooltip && (
                    <div
                        className="pointer-events-none absolute z-10 bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg max-w-xs"
                        style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
                    >
                        <div className="font-semibold">{tooltip.label}</div>
                        <div>€{tooltip.amount.toFixed(2)}</div>
                    </div>
                )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Click a node to trace its flows through the diagram; click again (or &ldquo;Clear selection&rdquo;) to reset.
            </p>
        </div>
    );
};

export default FinanceSankey;
