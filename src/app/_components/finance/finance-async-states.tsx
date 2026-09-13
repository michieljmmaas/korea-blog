export function FinanceErrorState({ message }: { message: string }) {
    return (
        <div className="w-full py-12 flex items-center justify-center bg-red-50 dark:bg-red-950/30 rounded-lg text-red-600 dark:text-red-400">
            {message}
        </div>
    );
}

export function FinanceLoadingState() {
    return (
        <div className="w-full h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-500 dark:text-gray-400">
            Loading spending data...
        </div>
    );
}
