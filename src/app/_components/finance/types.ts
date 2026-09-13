export interface FinanceTransaction {
    locatie: string;
    budgetType: string;
    category: string;
    subcategory: string;
    item: string;
    amount: number;
}

export interface FinanceHierarchyNode {
    name: string;
    value: number;
    count?: number;
    children?: FinanceHierarchyNode[];
}

export interface FinanceConvenienceStore {
    name: string;
    value: number;
    count: number;
}

export interface FinanceTreemapHierarchyEntry {
    location: string;
    category: string;
    subcategory: string;
    total: number;
    count: number;
}

export interface FinanceTreemapHierarchyData {
    entries: FinanceTreemapHierarchyEntry[];
    locations: string[];
    categories: string[];
}

export interface FinanceData {
    transactions: FinanceTransaction[];
    hierarchy: FinanceHierarchyNode;
    convenienceStores: FinanceConvenienceStore[];
    summary: {
        total: number;
        transactionCount: number;
        biggestPurchase: { item: string; amount: number; locatie: string };
    };
}
