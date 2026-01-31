# NeoWhisper - Modern Tech Blog

> Current version: **v1.5.0**

A high-performance, SEO-optimized tech blog built with **Next.js 16**, **App Router**, and **MDX**.

Features trilingual support (**English**, **日本語**, **العربية**) and a premium, modern aesthetic.

## ✨ Key Features

- **Next.js 16 & MDX**: Blazing fast performance with Server Components and static generation.
- **Reusable Blog Template**: Consistent, premium article layout with automatic reading time calculation.
- **Category Navigation**: Modern glassmorphism navigation bar for easy content discovery.
- **Trilingual Support**: Built-in infrastructure for English, Japanese, and Arabic (RTL) content.
- **Syntax Highlighting**: Beautiful code blocks with `rehype-highlight` and `highlight.js`.
- **Google Analytics (GA4)**: Robust tracking with secure environment variable configuration.
- **SEO Optimized**: Built-in metadata, semantic HTML, and structured content strategy.
- **Multilingual SEO**: Automatic hreflang tags for English, Japanese, and Arabic, plus Open Graph alternateLocale support.
- **Related Posts**: Smart content discovery with category and language-aware recommendations.
- **Performance Optimized**: Responsive image optimization, efficient font loading, and layout tuned for Core Web Vitals.
- **Sitemap & Robots**: Pre-generated `sitemap.xml` and `robots.txt` to guide search engine crawlers.

## 🛠️ Getting Started

### Prerequisites

- Node.js 18.18 or newer
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/NeoWhisper/neowhisper-blog.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_GA_ID=your-ga-id
   NEXT_PUBLIC_ADSENSE_ID=your-adsense-id
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## 📝 Writing Posts

Create new posts in `src/content/posts/` using the `.mdx` extension. Use the following frontmatter:

```md
---
title: "Article Title"
date: "2026-01-14"
excerpt: "Brief summary of the article."
category: "Tutorial"
coverImage: "/images/your-image.png"
author:
  name: "NeoWhisper"
  picture: "/images/author.png"
---
```

## 🚀 Deploy on Vercel

Push to your main branch and connect to [Vercel](https://vercel.com/new) for automatic deployments.

---

Built with ❤️ by **NeoWhisper**
