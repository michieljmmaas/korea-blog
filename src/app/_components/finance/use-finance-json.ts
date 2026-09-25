import { useEffect, useState } from 'react';
import { withBasePath } from '../../../../utils/basePath';

// Fetches one of the prebuilt public/*.json finance data files, handling
// cancellation on unmount so a slow response can't set state after the
// component using it has gone away.
export function useFinanceJson<T>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetch(withBasePath(url))
            .then((res) => {
                if (!res.ok) throw new Error(`Failed to load ${url}`);
                return res.json();
            })
            .then((json: T) => {
                if (!cancelled) setData(json);
            })
            .catch((err: Error) => {
                if (!cancelled) setError(err.message);
            });

        return () => {
            cancelled = true;
        };
    }, [url]);

    return { data, error };
}
