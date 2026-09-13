import { TripDay, WeekData, BlogPost } from "@/app/types";

// The trip ran 2025-09-25 (Day 0) through 2025-12-04 (Day 70).
const TRIP_YEAR = 2025;
const TRIP_START = { month: 9, day: 25 };
const TRIP_END = { month: 12, day: 4 };

function monthDayValue(month: number, day: number): number {
    return month * 100 + day;
}

export interface ReduxState {
    /** True when today falls within the trip's original date range, some whole number of years later. */
    active: boolean;
    /** How many years after the original trip today is. */
    yearsAgo: number;
    /** Today's month/day mapped onto the trip year (e.g. "2025-10-21"), for matching against content frontmatter. */
    tripDateString: string;
}

/**
 * Determines "redux mode" state from a date - the visitor's local browser date by default,
 * so this only works correctly when called client-side.
 */
export function getReduxState(now: Date = new Date()): ReduxState {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const yearsAgo = year - TRIP_YEAR;
    const withinRange =
        monthDayValue(month, day) >= monthDayValue(TRIP_START.month, TRIP_START.day) &&
        monthDayValue(month, day) <= monthDayValue(TRIP_END.month, TRIP_END.day);

    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");

    return {
        active: yearsAgo >= 1 && withinRange,
        yearsAgo,
        tripDateString: `${TRIP_YEAR}-${mm}-${dd}`,
    };
}

/**
 * Reads a `?asOf=YYYY-MM-DD` override from the URL, for manually testing redux mode at
 * different dates without touching the system clock. A date in (or before) the trip year
 * itself is bumped a year forward, so pasting an actual trip date (e.g. 2025-10-21) still
 * activates redux mode instead of being treated as "during the trip".
 */
export function getDebugOverrideDate(): Date | null {
    if (typeof window === "undefined") return null;

    const raw = new URLSearchParams(window.location.search).get("asOf");
    if (!raw) return null;

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (!match) return null;

    let year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (year <= TRIP_YEAR) year = TRIP_YEAR + 1;

    return new Date(year, month - 1, day);
}

/** The day post from exactly this date, N years ago. */
export function findReduxDay(days: TripDay[], tripDateString: string): TripDay | null {
    return days.find((d) => d.frontmatter.date === tripDateString) ?? null;
}

/** The week post covering this date. */
export function findReduxWeek(weeks: WeekData[], tripDateString: string): WeekData | null {
    return weeks.find((w) => w.days.includes(tripDateString)) ?? null;
}

/** The most recently "published" blogpost as of this date in the original trip timeline. */
export function findReduxBlog(posts: BlogPost[], tripDateString: string): BlogPost | null {
    const eligible = posts.filter((p) => p.frontmatter.publishdate <= tripDateString);
    if (eligible.length === 0) return null;
    return eligible.reduce((latest, p) =>
        p.frontmatter.publishdate > latest.frontmatter.publishdate ? p : latest
    );
}
