---
slug: how-its-made
title: How it's made
description: The tools I used to build this custom blog from scratch. 
publishdate: '2025-09-25'
draft: false
photos: ["foo", "bar"]
tags: ["Programming"]
thumb: thumb
---

I wanted to document my 10-week "work-cation" to South Korea. The idea was to keep my family, friends, and colleagues updated on my adventures—and at the same time have a nice way to save my memories.    

At first, I looked at [Polarsteps](https://www.polarsteps.com/) as a SaaS solution, but I wasn’t happy with the features it offered. I wanted full control over the design and what kind of information I could show.  

Most importantly, I wanted a grid showing all the days of my trip, color coding, and—of course—statistics!  

I also checked out other blogging solutions like WordPress, BearBlog, Wix, SquareSpace, Ghost, and more. They were either too expensive, too limiting, or too hard to use.  

Then I realized: I’m a trained programmer. I could just build it myself!  

# The Limitations
My project came with a few interesting requirements.  

### 1. Editable from my tablet
I’ll have my work laptop with me on the trip, but I’d rather not use it for personal things like blogging. Instead, I plan to use my Samsung tablet. The catch is: I can’t really code on it. So editing should be limited to text writing and uploading images.  

### 2. Not too expensive
I’ll be relying on multiple tools to host this blog, so I want to stay within free-tier options wherever possible.  

### 3. Durable
The blog should last. I don’t want to rely too heavily on services that might suddenly change their policies or pricing.  

# The Start
I began with the [Next.js Blog Starter Kit](https://vercel.com/templates/next.js/blog-starter-kit), which already looked close to what I wanted.  

Then I made a list of features I needed:  
* A big grid with all the days of the trip, color-coded  
* A page for every day, where I could write a short story and upload photos  
* A page for every week, with a longer recap  
* The ability to write “blogs” covering specific topics  

I had more ideas (like search functionality and tracking which posts were already read), but I had to prioritize.  

Since I had used [Vercel](https://vercel.com/) for small projects before, I chose it for hosting. It’s super convenient, but I’d need to stick to the free tier to avoid costs.  

# Design Decisions
While developing, I quickly ran into some limitations.  

## Storing images in the Git repository won’t work
My first idea was to store all the images directly in the GitHub repository. That seemed simple—I could even write a build script to generate multiple sizes for optimization.  

But in practice, this was terrible. Vercel wouldn’t handle it.  

Here’s the math:  
* 70 days + 10 weeks + ~20 blog posts ≈ 100 pages  
* ~5 images per page = 500 images  
* 2.5 MB per image × 500 = 1.25 GB of raw images  

And if I stored 3 different resolutions, the repo could easily reach ~2 GB. Every time I added new photos, Vercel would need to download the entire repo. That would exceed both their build time and data limits. Especially the building limit, which is 45 minutes a month. I want to deploy everyday, with gives me at most 90 seconds per deploy.   

So I needed an image hosting service that could also handle optimization.  

## Where to host?
I compared a few options:  
* **[Imgur](https://imgur.com/)** – Easy, but requires images to be public and isn’t great to configure  
* **[Catbox.moe](https://catbox.moe/)** – Open source, simple, but hard to take seriously because of the anime branding  
* **[Cloudinary](https://cloudinary.com/)** – The biggest player, very powerful, but expensive ($89/month for the cheapest paid tier)  
* **[ImageKit](https://imagekit.io/)** – Similar features to Cloudinary, but cheaper and easier to use  

I went with **ImageKit**. It gave me everything I needed (image transformations and a usable UI on my tablet), and their free tier was enough to get started. If I need more, the upgrade is just $9/month.  

## But hosting all the images has a downside
I wanted the grid of my trip to show a thumbnail for each day. By the end, that would mean loading 70 thumbnails every time someone visited the page.  

Here’s the math:  
* Let’s say 5 people check the site daily  
* On average, there will be ~35 images in the grid during the trip  
* 5 people × 70 days × 35 images = 12,250 requests  

Now imagine someone new discovers the blog and decides to read all 70 posts:  
* Grid (70 requests) → Day 1 → Grid (70 requests) → Day 2 → Grid (70 requests) …  
* By the end, just reading everything = 4,900 requests!  

My solution: **Save compressed thumbnails statically in the repo.** That way, the grid doesn’t need to hit ImageKit every time.  

(Yes, I could’ve used caching, but I didn’t want to add state to the blog yet.)  

## How to generate the thumbnails?
This created a new problem: how do I add thumbnails to the repo from my tablet?  

I didn’t want to compress images manually—ImageKit already does that.  

So I set up **GitHub Actions**. Whenever I finish editing a blog post (`.md` file in the repo), an action runs. It checks for new images, fetches compressed thumbnails from ImageKit, and commits them automatically.  

This way, all I have to do is:  
1. Upload photos to ImageKit  
2. Write a blog post in the GitHub web interface  
3. Commit  

That’s it. I even added a GitHub Action to auto-deploy to Vercel, making the process even smoother.  

# Vibe Coding
I’ve written a lot about the process here, but honestly, most of the code was “vibe-coded” with Claude.AI.  

I had a clear vision of what I wanted, but not all the skills to build every feature. Claude helped me get 80% of the way there quickly—but the last 20% was always the hardest. Sometimes the generated code was messy, hard to follow, or tricky to debug since I hadn’t written it myself.  

It definitely boosted my productivity, but the downside is that the codebase is now a patchwork of quick fixes. If I had more time, I’d prefer to build things more carefully and understand each part better.  

# Conclusion
The project uses the following tools:  
* Next.js & Tailwind CSS  
* Static Markdown files for posts  
* Vercel for hosting and deployment  
* ImageKit for image hosting and transformations  
* GitHub Actions for thumbnail generation and deployment  

Check out the full [GitHub repository here](https://github.com/michieljmmaas/korea-blog).  
