"use client"

import { useEffect, useState } from 'react';
import { FinanceData } from './types';
import FinanceStatTiles from './finance-stat-tiles';
import FinanceTreemap from './finance-treemap';
import FinanceSankey from './finance-sankey';
import FinancePie from './finance-pie';
import { getLocationColorHex } from '../../../../utils/locationColors';

const FinanceCharts = () => {
    const [data, setData] = useState<FinanceData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetch('/finance-data.json')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load finance data');
                return res.json();
            })
            .then((json: FinanceData) => {
                if (!cancelled) setData(json);
            })
            .catch((err: Error) => {
                if (!cancelled) setError(err.message);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    if (error) {
        return (
            <div className="w-full py-12 flex items-center justify-center bg-red-50 dark:bg-red-950/30 rounded-lg text-red-600 dark:text-red-400">
                {error}
            </div>
        );
    }

    if (!data) {
        return (
            <div className="w-full h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-500 dark:text-gray-400">
                Loading spending data...
            </div>
        );
    }

    const locations = (data.hierarchy.children ?? []).map((c) => c.name);

    return (
        <div className="w-full space-y-6 my-8">
            <FinanceStatTiles summary={data.summary} />

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
                {locations.map((name) => (
                    <span key={name} className="flex items-center gap-1.5">
                        <span
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: getLocationColorHex(name) }}
                        />
                        {name}
                    </span>
                ))}
            </div>

            <FinanceTreemap hierarchy={data.hierarchy} />
            <FinanceSankey hierarchy={data.hierarchy} />
            <FinancePie data={data.convenienceStores} />
        </div>
    );
};

export default FinanceCharts;
