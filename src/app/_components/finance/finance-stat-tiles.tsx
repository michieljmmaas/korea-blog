import { FinanceData } from './types';

interface FinanceStatTilesProps {
    summary: FinanceData['summary'];
}

const FinanceStatTiles = ({ summary }: FinanceStatTilesProps) => {
    const tiles = [
        {
            label: 'Total spent',
            value: `€${summary.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        },
        {
            label: 'Transactions',
            value: summary.transactionCount.toLocaleString('en-US'),
        },
        {
            label: 'Biggest purchase',
            value: `€${summary.biggestPurchase.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: `${summary.biggestPurchase.item} · ${summary.biggestPurchase.locatie}`,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tiles.map((tile) => (
                <div
                    key={tile.label}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4"
                >
                    <div className="text-sm text-gray-500 dark:text-gray-400">{tile.label}</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">{tile.value}</div>
                    {tile.sub && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{tile.sub}</div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FinanceStatTiles;
