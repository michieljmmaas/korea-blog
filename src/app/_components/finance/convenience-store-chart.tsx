"use client"

import { FinanceData } from './types';
import FinancePie from './finance-pie';
import { useFinanceJson } from './use-finance-json';
import { FinanceErrorState, FinanceLoadingState } from './finance-async-states';

const ConvenienceStoreChart = () => {
    const { data, error } = useFinanceJson<FinanceData>('/finance-data.json');

    if (error) return <FinanceErrorState message={error} />;
    if (!data) return <FinanceLoadingState />;

    return (
        <div className="w-full my-8">
            <FinancePie data={data.convenienceStores} />
        </div>
    );
};

export default ConvenienceStoreChart;
