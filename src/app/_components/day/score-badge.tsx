import { Medal, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

// Ranking is out of ~71 days — tweak these to change how exclusive each tier is.
// Good tiers: rank at or below the cutoff. Bad tiers: rank at or above the cutoff.
const TIER_CUTOFFS = { top: 1, podium: 3, high: 10, notable: 25, low: 60, worst: 69 };

type Tier = "top" | "podium" | "high" | "notable" | "plain" | "low" | "worst";

function getTier(rank: number): Tier {
    if (rank >= TIER_CUTOFFS.worst) return "worst";
    if (rank >= TIER_CUTOFFS.low) return "low";
    if (rank <= TIER_CUTOFFS.top) return "top";
    if (rank <= TIER_CUTOFFS.podium) return "podium";
    if (rank <= TIER_CUTOFFS.high) return "high";
    if (rank <= TIER_CUTOFFS.notable) return "notable";
    return "plain";
}

// Each tier builds on the last, ending in the "best" look from food-item.tsx.
const TIER_STYLES: Record<Tier, string> = {
    // Bad days use cool colors (blue = "meh", rose = "rough") rather than grey, so they read as a verdict, not as disabled.
    worst:
        "border-rose-300 bg-rose-50/50 text-rose-700 " +
        "dark:border-rose-800 dark:bg-rose-950/20 dark:text-rose-400",
    low:
        "border-sky-200 bg-sky-50/50 text-sky-700 " +
        "dark:border-sky-900 dark:bg-sky-950/20 dark:text-sky-400",
    plain:
        "border-border text-muted-foreground",
    notable:
        "border-amber-200 text-amber-700 dark:border-amber-900 dark:text-amber-500",
    high:
        "border-amber-300 bg-amber-50/40 text-amber-700 ring-1 ring-amber-300/40 " +
        "dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400 dark:ring-amber-700/40",
    podium:
        "border-amber-300 bg-amber-50/40 text-amber-700 ring-1 ring-amber-400/60 " +
        "shadow-[0_0_12px_rgba(251,191,36,0.15)] " +
        "dark:border-amber-700 dark:bg-amber-950/20 dark:text-amber-400 dark:ring-amber-500/50",
    top:
        "border-amber-400 bg-gradient-to-br from-amber-100 to-yellow-50 font-semibold text-amber-800 " +
        "ring-1 ring-amber-400/60 shadow-[0_0_16px_rgba(251,191,36,0.3)] " +
        "dark:border-amber-500 dark:from-amber-900/40 dark:to-yellow-950/20 dark:text-amber-300 dark:ring-amber-400/60",
};

const ICON_STYLES: Record<Tier, string> = {
    worst: "text-rose-500",
    low: "text-sky-500",
    plain: "text-neutral-400",
    notable: "text-amber-400",
    high: "text-amber-500",
    podium: "text-amber-500",
    top: "text-amber-500 fill-amber-400",
};

interface ScoreBadgeProps {
    score: number;
    rank: number;
}

export default function ScoreBadge({ score, rank }: ScoreBadgeProps) {
    const tier = getTier(rank);
    const Icon = tier === "top" ? Trophy : Medal;
    const verdict =
        tier === "low" ? " — a bit boring" : tier === "worst" ? " — a rough one" : "";

    return (
        <div
            className={cn(
                // Fixed width + tabular numbers so the badge (and everything beside it) never shifts between cards
                "inline-flex w-24 shrink-0 items-center justify-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-medium tabular-nums",
                TIER_STYLES[tier]
            )}
            title={`Score ${score}, ranked #${rank}${verdict}`}
        >
            <Icon className={cn("h-3.5 w-3.5 shrink-0", ICON_STYLES[tier])} />
            {/* Fixed-width slots (3 digits of score, "(NN)" of rank) so the icon and numbers don't shift when the score has fewer digits */}
            <span className="w-[3ch] text-right">{Math.round(score)}</span>
            <span className="w-[4ch] text-left opacity-70">({rank})</span>
        </div>
    );
}
