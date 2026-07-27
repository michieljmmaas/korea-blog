"use client"

import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FinanceConvenienceStore } from './types';

interface FinancePieProps {
    data: FinanceConvenienceStore[];
}

interface TooltipState {
    x: number;
    y: number;
    name: string;
    amount: number;
    percent: number;
    count: number;
}

const WIDTH = 480;
const HEIGHT = 420;
const RADIUS = Math.min(WIDTH, HEIGHT - 60) / 2 - 8;
const INNER_RADIUS = RADIUS * 0.55;

const FRANCHISE_COLORS: Record<string, string> = {
    '7-Eleven': '#F4811F',    // 7-Eleven orange
    'CU': '#751485',          // CU purple (Pantone 267 C)
    'GS25': '#0072CE',        // GS25 blue (Pantone 285 C)
    'Family Mart': '#009E48', // FamilyMart green
    'E-Mart': '#FFD400',      // E-Mart yellow (closest public approximation)
    'Circle K': '#E3262A',    // Circle K red
};

function colorFor(name: string): string {
    return FRANCHISE_COLORS[name] ?? '#898781';
}

const FinancePie = ({ data }: FinancePieProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

    useEffect(() => {
        if (!svgRef.current || data.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const g = svg.append('g')
            .attr('transform', `translate(${WIDTH / 2},${(HEIGHT - 40) / 2 + 10})`);

        const pie = d3.pie<FinanceConvenienceStore>()
            .value((d) => d.value)
            .sort(null);

        const arc = d3.arc<d3.PieArcDatum<FinanceConvenienceStore>>()
            .innerRadius(INNER_RADIUS)
            .outerRadius(RADIUS)
            .cornerRadius(3)
            .padAngle(0.012);

        const labelArc = d3.arc<d3.PieArcDatum<FinanceConvenienceStore>>()
            .innerRadius(RADIUS + 14)
            .outerRadius(RADIUS + 14);

        const arcs = pie(data);

        const slice = g.selectAll('path')
            .data(arcs)
            .join('path')
            .attr('d', arc as any)
            .attr('fill', (d) => colorFor(d.data.name))
            .attr('stroke', 'var(--finance-pie-surface, #fff)')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .style('opacity', 0);

        slice.transition().duration(400).style('opacity', 1);

        slice
            .on('mousemove', (event: MouseEvent, d) => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (!rect) return;
                setTooltip({
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top,
                    name: d.data.name,
                    amount: d.data.value,
                    percent: total > 0 ? (d.data.value / total) * 100 : 0,
                    count: d.data.count,
                });
            })
            .on('mouseleave', () => setTooltip(null));

        // Direct labels only on slices big enough to not collide.
        g.selectAll('text')
            .data(arcs)
            .join('text')
            .attr('transform', (d) => `translate(${labelArc.centroid(d)})`)
            .attr('text-anchor', (d) => {
                const midAngle = (d.startAngle + d.endAngle) / 2;
                return midAngle < Math.PI ? 'start' : 'end';
            })
            .style('font-size', '11px')
            .style('font-weight', '600')
            .style('pointer-events', 'none')
            .attr('fill', 'currentColor')
            .text((d) => ((d.endAngle - d.startAngle) > 0.2 ? d.data.name : ''));

        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-0.2em')
            .style('font-size', '13px')
            .attr('fill', 'currentColor')
            .style('opacity', 0.6)
            .text('Convenience stores');

        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '1.1em')
            .style('font-size', '20px')
            .style('font-weight', '700')
            .attr('fill', 'currentColor')
            .text(`€${total.toFixed(0)}`);
    }, [data, total]);

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3">Convenience store spending</h3>
            <div ref={containerRef} className="relative w-full flex flex-col sm:flex-row items-center gap-4">
                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    className="w-full max-w-md h-auto text-gray-800 dark:text-gray-200"
                    role="img"
                    aria-label="Pie chart of spending by convenience store franchise"
                />
                {tooltip && (
                    <div
                        className="pointer-events-none absolute z-10 bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg"
                        style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
                    >
                        <div className="font-semibold">{tooltip.name}</div>
                        <div>€{tooltip.amount.toFixed(2)} ({tooltip.percent.toFixed(1)}%)</div>
                        <div>{tooltip.count} transaction{tooltip.count === 1 ? '' : 's'}</div>
                    </div>
                )}
                <div className="flex flex-row sm:flex-col flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                    {data.map((d) => (
                        <span key={d.name} className="flex items-center gap-1.5">
                            <span
                                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: colorFor(d.name) }}
                            />
                            {d.name} <span className="text-gray-400 dark:text-gray-500">€{d.value.toFixed(0)}</span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FinancePie;
