import { withBasePath } from "./basePath";

// next/image's default loader/`unoptimized` path doesn't apply next.config.js's
// basePath to plain string `src` values (only Next's own generated assets like
// CSS/JS chunks and statically-imported images get it automatically). Since
// every photo is already pre-sized locally, there's no optimization to do here
// — just return the path with basePath applied. The `?w=` query string doesn't
// change what file is served (static hosting ignores it); it's only there so
// Next's dev-mode loader sanity check sees output vary with `width`.
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  return `${withBasePath(src)}?w=${width}`;
}
