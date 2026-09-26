# Korea Blog

This is a custom blog I built to document my 10-week "work-cation" in South Korea.  
Instead of using existing SaaS tools like Polarsteps or WordPress, I wanted full control over design, features, and data.  

Live at [seoulo.nl](https://seoulo.nl).

## Features
- Daily grid with color-coded entries  
- Pages for each day and each week of the trip  
- Support for additional blog posts on specific topics  
- Automatic thumbnail and stats generation via GitHub Actions  
- Fully static site — no server, database, or external image service at runtime  

## Tech Stack
- [Next.js](https://nextjs.org/) (static export) & Tailwind CSS  
- Static Markdown/YAML files for all content  
- [GitHub Pages](https://pages.github.com/) for hosting  
- [sharp](https://sharp.pixelplumbing.com/) for generating photo sizes locally  
- GitHub Releases for storing the processed photo set  
- GitHub Actions for building and deploying  

## How It Works
1. Write or edit a Markdown file in `content/` (directly in the GitHub UI works fine)  
2. For new photos, drop the original into `public/photos/originals/`, run `npm run process-images`, and upload the resulting `thumb`/`display` set to the `images` release as a password-protected `photos.7z` (the password is the `IMAGES_ARCHIVE_PASSWORD` repo secret)  
3. Push to `main` with `[deploy]` in the commit message — GitHub Actions downloads the photos, generates cover thumbnails for anything new, builds the static site, and deploys it to GitHub Pages  
