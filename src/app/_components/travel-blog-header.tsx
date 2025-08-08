import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

interface TravelBlogHeaderProps {
  previousPost: { day: number; slug: string; title: string } | null;
  nextPost: { day: number; slug: string; title: string } | null;
}

export default function TravelBlogHeader({ previousPost, nextPost }: TravelBlogHeaderProps) {
  return (
    <header className="flex items-center justify-between py-4 px-6 border-b border-border">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-medium text-text-primary">Travel Blog</h1>
      </div>

      <div className="flex items-center gap-2">
        {previousPost ? (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 w-8 p-0"
          >
            <Link href={`/day/${previousPost.slug}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {nextPost ? (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 w-8 p-0"
          >
            <Link href={`/day/${nextPost.slug}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  );
};