'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { getReduxState, getDebugOverrideDate } from '../../../../utils/reduxMode';

const STORAGE_KEY = 'redux-mode-filter';

interface ReduxModeContextValue {
    /** True when today (visitor's local date) falls within the trip's annual redux window. */
    windowActive: boolean;
    /** Today's date mapped onto the trip year, e.g. "2025-10-21". */
    tripDateString: string;
    /** Whether the "hide content that hasn't happened yet" filter is switched on. */
    filterOn: boolean;
    toggleFilter: () => void;
    /** Whether a piece of content dated `dateString` should be hidden right now. */
    hasNotHappenedYet: (dateString: string) => boolean;
}

const ReduxModeContext = createContext<ReduxModeContextValue>({
    windowActive: false,
    tripDateString: '',
    filterOn: true,
    toggleFilter: () => { },
    hasNotHappenedYet: () => false,
});

export function ReduxModeProvider({ children }: { children: ReactNode }) {
    const [windowActive, setWindowActive] = useState(false);
    const [tripDateString, setTripDateString] = useState('');
    const [filterOn, setFilterOn] = useState(true);

    useEffect(() => {
        const overrideDate = getDebugOverrideDate();
        const redux = getReduxState(overrideDate ?? undefined);
        setWindowActive(redux.active);
        setTripDateString(redux.tripDateString);
        if (overrideDate) {
            console.info(`[Redux Mode] testing as of ${redux.tripDateString} (via ?asOf=)`, redux);
        }

        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored !== null) setFilterOn(stored === 'true');
    }, []);

    const toggleFilter = useCallback(() => {
        setFilterOn((prev) => {
            const next = !prev;
            window.localStorage.setItem(STORAGE_KEY, String(next));
            return next;
        });
    }, []);

    const hasNotHappenedYet = useCallback(
        (dateString: string) => windowActive && filterOn && dateString > tripDateString,
        [windowActive, filterOn, tripDateString]
    );

    return (
        <ReduxModeContext.Provider value={{ windowActive, tripDateString, filterOn, toggleFilter, hasNotHappenedYet }}>
            {children}
        </ReduxModeContext.Provider>
    );
}

export function useReduxMode() {
    return useContext(ReduxModeContext);
}
