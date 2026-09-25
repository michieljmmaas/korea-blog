import { withBasePath } from "./basePath";

// next/image's default loader/`unoptimized` path doesn't apply next.config.js's
// basePath to plain string `src` values (only Next's own generated assets like
// CSS/JS chunks and statically-imported images get it automatically). Since
// every photo is already pre-sized locally, there's no optimization to do here
// — just return the path with basePath applied.
export default function imageLoader({ src }: { src: string; width: number; quality?: number }): string {
  return withBasePath(src);
}
