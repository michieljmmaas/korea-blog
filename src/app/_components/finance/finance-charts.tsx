"use client"

import { FinanceTreemapHierarchyData } from './types';
import FinanceTreemapHierarchySection from './finance-treemap-hierarchy-section';
import { useFinanceJson } from './use-finance-json';
import { FinanceErrorState, FinanceLoadingState } from './finance-async-states';

const FinanceCharts = () => {
    const { data: treemapHierarchyData, error } = useFinanceJson<FinanceTreemapHierarchyData>(
        '/finance-treemap-hierarchy-data.json'
    );

    if (error) return <FinanceErrorState message={error} />;
    if (!treemapHierarchyData) return <FinanceLoadingState />;

    return (
        <div className="w-full my-8">
            <FinanceTreemapHierarchySection data={treemapHierarchyData} />
        </div>
    );
};

export default FinanceCharts;
