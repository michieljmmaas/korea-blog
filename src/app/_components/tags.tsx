
interface TagProps {
    tags: string[]
}



export default function Tags({ tags }: TagProps) {
    let map = new Map<string, string>([
        ["japan", "purple"],
        ["seoul", "blue"],
        ["busan", "red"],
        ["taiwan", "green"],
        ["hong kong", "emerald"],
        ["nederland", "orange"],
    ]);



    return (
        <div>
            <div className="text-sm text-muted-foreground">Tags</div>
            <div className="flex flex-wrap gap-1 mt-1">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className={`bg-${map.get(tag) ?? "gray"}-100 text-${map.get(tag) ?? "gray"}-800 px-2 py-1 rounded text-xs`}
                    >
                        #{tag}
                    </span>
                ))}
            </div>
        </div>
    );

};