# Deployment Guide

## ✅ Migration Complete!

Your Jekyll blog has been successfully migrated to Astro.

## 📍 Location

The new Astro blog is in: `/Users/thomas/Documents/workspace/blog/astro-blog/`

## 🚀 Next Steps to Deploy

### 1. Test Locally (Optional)

```bash
cd astro-blog
npm run dev  # Visit http://localhost:4321
```

### 2. Commit and Push

The GitHub Actions workflow is already set up at `.github/workflows/deploy.yml`.

```bash
git add astro-blog/
git add .github/workflows/deploy.yml
git commit -m "Migrate to Astro - modern, minimal blog"
git push origin master
```

### 3. Configure GitHub Pages

1. Go to your repository on GitHub
2. Settings → Pages
3. Under "Source", select **"GitHub Actions"**
4. The workflow will automatically deploy on push

### 4. Verify Deployment

Once pushed, GitHub Actions will:
- Build the Astro site
- Deploy to GitHub Pages
- Site will be live at https://thomas.rumas.fr

## ✨ What's New

- **Modern Design**: Vercel-inspired minimal aesthetic
- **Faster Builds**: 10-100x faster than Jekyll
- **Node 24**: Latest LTS with modern features
- **Shiki Highlighting**: GitHub Dark theme for code
- **No Analytics**: Privacy-first, no tracking
- **Clean URLs**: /posts/slug/ instead of /year/month/day/title/
- **RSS Feed**: Available at /rss.xml
- **Tag Pages**: Dynamic tag filtering
- **Share Buttons**: Twitter and LinkedIn only

## 📝 Adding New Posts

Create files in `astro-blog/src/content/blog/`:

```markdown
---
title: "Your Post Title"
date: 2026-01-27
description: Brief description for post cards
tags: [Tag1, Tag2]
img: folder/image.png  # Optional, in public/img/
---

Your markdown content...
```

## 🔧 Configuration

Edit `astro-blog/src/config.ts` to update:
- Site title
- Author info  
- Social links
- About text

## 📁 Images

Place images in `astro-blog/public/img/` and reference them as:
```markdown
![Alt text](/img/folder/image.png)
```

## 🛠️ Troubleshooting

If build fails:
1. Check Node version: `node --version` (should be 24+)
2. Install dependencies: `cd astro-blog && npm install`
3. Test build: `npm run build`
4. Check GitHub Actions logs for errors

## 📞 Support

The blog preview is available at http://localhost:4321 (if dev server is running).
