"use client"

import { useEffect, useState } from 'react';
import { FinanceData } from './types';
import FinancePie from './finance-pie';

const ConvenienceStoreChart = () => {
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

    return (
        <div className="w-full my-8">
            <FinancePie data={data.convenienceStores} />
        </div>
    );
};

export default ConvenienceStoreChart;
