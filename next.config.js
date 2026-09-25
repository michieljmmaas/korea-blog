/** @type {import('next').NextConfig} */
// Served at the domain root (seoulo.nl), not under a /korea-blog/ subpath, so
// no basePath is needed here. All the withBasePath()/imageLoader.ts plumbing
// is a harmless no-op when this is empty — kept in place in case the site
// ever moves back to a project-page URL (michieljmmaas.github.io/korea-blog/).
const BASE_PATH = '';

const nextConfig = {
  output: 'export',
  basePath: BASE_PATH,
  env: {
    NEXT_PUBLIC_BASE_PATH: BASE_PATH,
  },
  images: {
    loader: 'custom',
    loaderFile: './utils/imageLoader.ts',
  },
}

module.exports = nextConfig
