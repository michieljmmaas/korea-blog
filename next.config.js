/** @type {import('next').NextConfig} */
// GitHub Pages serves this as a project site (michieljmmaas.github.io/korea-blog/),
// not at the domain root, so every asset/link needs this prefix. next/image and
// next/link add it automatically; anywhere else (plain <img>, fetch(), <link href>)
// must go through utils/basePath.ts's withBasePath(), which reads this via the
// NEXT_PUBLIC_BASE_PATH env var below.
const BASE_PATH = '/korea-blog';

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
