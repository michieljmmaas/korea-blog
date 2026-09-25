// next/image, next/link and next/script prefix their URLs with next.config.js's
// basePath automatically. Nothing else does — plain <img src>, fetch(), and
// static <link>/<meta> hrefs need it applied by hand via this helper.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(path: string): string {
  if (!path || !BASE_PATH || path.startsWith(BASE_PATH)) return path;
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}
