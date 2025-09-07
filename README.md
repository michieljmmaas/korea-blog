# Korea Blog

This is a custom blog I built to document my 10-week "work-cation" in South Korea.  
Instead of using existing SaaS tools like Polarsteps or WordPress, I wanted full control over design, features, and data.  

## Features
- Daily grid with color-coded entries  
- Pages for each day and each week of the trip  
- Support for additional blog posts on specific topics  
- Automatic thumbnail generation via GitHub Actions  
- Optimized image hosting and transformations  

## Tech Stack
- [Next.js](https://nextjs.org/) & Tailwind CSS  
- Static Markdown files for blog posts  
- [Vercel](https://vercel.com/) for hosting and deployment  
- [ImageKit](https://imagekit.io/) for image hosting/optimization  
- GitHub Actions for thumbnail processing  

## How It Works
1. Upload images to ImageKit  
2. Edit a Markdown file directly in the Github UI interface  
3. GitHub Actions automatically generates thumbnails and deploys to Vercel  