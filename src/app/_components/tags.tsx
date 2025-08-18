interface TagProps {
    tags: string[]
}

// Tag configuration with colors and ordering
const tagConfig = {
    // Location tags (order: 1)
    "japan": { color: "purple", category: "location", order: 1 },
    "seoul": { color: "blue", category: "location", order: 1 },
    "busan": { color: "red", category: "location", order: 1 },
    "taiwan": { color: "green", category: "location", order: 1 },
    "hong kong": { color: "emerald", category: "location", order: 1 },
    "nederland": { color: "orange", category: "location", order: 1 },

    // Example: Topic tags (order: 2) - add more as needed
    // "food": { color: "yellow", category: "topic", order: 2 },
    // "travel": { color: "indigo", category: "topic", order: 2 },

    // Example: Status tags (order: 3)
    // "featured": { color: "pink", category: "status", order: 3 },
    // "new": { color: "cyan", category: "status", order: 3 },
} as const;

type TagKey = keyof typeof tagConfig;

function sortTags(tags: string[]): string[] {
    return [...tags].sort((a, b) => {
        const configA = tagConfig[a as TagKey];
        const configB = tagConfig[b as TagKey];

        // If both tags have config, sort by order, then alphabetically
        if (configA && configB) {
            if (configA.order !== configB.order) {
                return configA.order - configB.order;
            }
            return a.localeCompare(b);
        }

        // Known tags come before unknown tags
        if (configA && !configB) return -1;
        if (!configA && configB) return 1;

        // Both unknown, sort alphabetically
        return a.localeCompare(b);
    });
}

export default function Tags({ tags }: TagProps) {
    const sortedTags = sortTags(tags);

    return (
        <div>
            <div className="text-sm text-muted-foreground">Tags</div>
            <div className="flex flex-wrap gap-1 mt-1">
                {sortedTags.map((tag) => {
                    const config = tagConfig[tag as TagKey];
                    const color = config?.color ?? "gray";

                    return (
                        <span
                            key={tag}
                            className={`bg-${color}-100 text-${color}-800 px-2 py-1 rounded text-xs`}
                        >
                            #{tag}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}