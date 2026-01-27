# Astro Blog Architecture & How It Works

This document explains the architecture and inner workings of the Astro blog for AI agents and developers.

## 🏗️ Architecture Overview

### What is Astro?

Astro is a modern static site generator that:
- Builds static HTML by default (zero JavaScript)
- Uses component-based architecture
- Supports multiple UI frameworks (React, Vue, Svelte)
- Provides content collections for type-safe content management
- Ships with Vite for fast development

### Key Principles

1. **Content-First**: Blog posts are Markdown files with YAML frontmatter
2. **Static Generation**: All pages pre-rendered at build time
3. **Zero JS by Default**: Only CSS is sent to the browser (fast loading)
4. **File-Based Routing**: Pages in `src/pages/` become routes
5. **Component Reusability**: Shared UI in `src/components/`

---

## 📁 Project Structure

```
/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Header.astro        # Site header with navigation
│   │   ├── Footer.astro        # Footer with social links
│   │   ├── PostCard.astro      # Blog post preview card
│   │   └── ShareButtons.astro  # X/LinkedIn share buttons
│   │
│   ├── layouts/          # Page layouts (wrappers)
│   │   ├── BaseLayout.astro    # Root layout (HTML structure, global styles)
│   │   └── PostLayout.astro    # Blog post layout (extends BaseLayout)
│   │
│   ├── pages/            # File-based routing
│   │   ├── index.astro         # Homepage (/) - lists all posts
│   │   ├── about.astro         # About page (/about)
│   │   ├── posts/[slug].astro  # Dynamic post pages (/posts/*)
│   │   ├── tags/index.astro    # Tags list (/tags)
│   │   ├── tags/[tag].astro    # Posts by tag (/tags/*)
│   │   └── rss.xml.ts          # RSS feed generation
│   │
│   ├── content/          # Content collections (type-safe)
│   │   ├── config.ts           # Content schema definition
│   │   └── blog/               # Blog posts (Markdown)
│   │       └── *.md
│   │
│   ├── utils/            # Helper functions
│   │   └── helpers.ts          # Reading time, date formatting
│   │
│   └── config.ts         # Site configuration (title, author, socials)
│
├── public/               # Static assets (copied as-is)
│   ├── img/              # Images
│   ├── CNAME             # Custom domain
│   └── favicon.*         # Icons
│
├── dist/                 # Build output (generated)
├── astro.config.mjs      # Astro configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

---

## 🔄 How Pages Are Generated

### 1. Static Pages (e.g., About, Homepage)

```astro
// src/pages/about.astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
const title = "About";
---
<BaseLayout title={title}>
  <h1>About Me</h1>
</BaseLayout>
```

**Process:**
1. Astro reads `about.astro`
2. Executes frontmatter (code between `---`)
3. Renders component to static HTML
4. Outputs to `dist/about/index.html`

### 2. Dynamic Routes (e.g., Blog Posts)

```astro
// src/pages/posts/[slug].astro
export const getStaticPaths = (async () => {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
});
```

**Process:**
1. `getStaticPaths()` runs at build time
2. Fetches all posts from `src/content/blog/`
3. Returns array of routes (one per post)
4. Astro generates HTML for each route

**Example:**
- Post file: `2026-01-27-moltbot.md`
- Slug: `2026-01-27-moltbot`
- Output: `dist/posts/2026-01-27-moltbot/index.html`
- URL: `/posts/2026-01-27-moltbot/`

---

## 📝 Content Collections

### Schema Definition

```typescript
// src/content/config.ts
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    tags: z.array(z.string()),
    img: z.string().optional(),
  }),
});
```

**Benefits:**
- Type safety (TypeScript validation)
- Auto-completion in editors
- Build-time error checking

### Post Structure

```markdown
---
title: "Post Title"
date: 2026-01-27
description: Brief summary
tags: [Tag1, Tag2]
img: image.png
---

Markdown content here...
```

### Accessing Content

```typescript
// Get all posts
const posts = await getCollection('blog');

// Get single post
const post = await getEntry('blog', 'slug-name');

// Render markdown to HTML
const { Content } = await post.render();
```

---

## 🎨 Styling System

### CSS Custom Properties (Variables)

```css
:root {
  --color-text: #000;
  --color-background: #fff;
  --color-accent: #263959;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-text: #e5e5e5;
    --color-background: #0a0a0a;
    --color-accent: #4a90e2;
  }
}
```

**How Dark Mode Works:**
1. CSS variables defined in `BaseLayout.astro`
2. Light mode values set in `:root`
3. Dark mode overrides in `@media (prefers-color-scheme: dark)`
4. All components use `var(--color-name)`
5. Browser automatically switches based on system preference

### Scoped Styles

```astro
<div class="card">...</div>

<style>
  .card {
    /* Scoped to this component only */
  }
</style>
```

### Global Styles

```astro
<style is:global>
  body {
    /* Applied globally */
  }
</style>
```

---

## 🧩 Component System

### Component Anatomy

```astro
---
// Frontmatter: Server-side code (runs at build time)
interface Props {
  title: string;
}
const { title } = Astro.props;
---

<!-- Template: HTML markup -->
<div class="component">
  <h1>{title}</h1>
</div>

<style>
  /* Scoped CSS */
  .component { }
</style>
```

### Layout Hierarchy

```
BaseLayout.astro
  └─ <html>, <head>, global styles
      └─ <slot /> (content injected here)

PostLayout.astro (extends BaseLayout)
  └─ Header, Footer, post structure
      └─ <Content /> (rendered markdown)
```

### Using Components

```astro
---
import PostCard from '../components/PostCard.astro';
---
<PostCard 
  title="Post Title"
  date={new Date()}
  description="Summary"
  tags={["Tag1"]}
  slug="post-slug"
/>
```

---

## 🚀 Build & Deployment Process

### Local Development

```bash
npm run dev
# 1. Starts Vite dev server
# 2. Hot module reload enabled
# 3. Visit http://localhost:4321
```

### Production Build

```bash
npm run build
# 1. Content collections validated
# 2. TypeScript type-checked
# 3. All routes generated
# 4. Assets optimized
# 5. Output to dist/
```

**What Gets Built:**
- Static HTML for every route
- Optimized CSS (scoped + global)
- Images copied to dist/
- CNAME file for custom domain

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
- Setup Node 24
- Install dependencies (npm ci)
- Build site (npm run build)
- Upload dist/ to GitHub Pages
- Deploy to https://thomas.rumas.fr
```

**Trigger:** Push to main/master branch

---

## 🔍 How Features Work

### 1. Homepage (Post Listing)

```astro
// src/pages/index.astro
const allPosts = await getCollection('blog');
const sortedPosts = allPosts.sort((a, b) => 
  b.data.date.getTime() - a.data.date.getTime()
);
```

- Fetches all blog posts
- Sorts by date (newest first)
- Maps to `PostCard` components
- Renders as grid layout

### 2. Individual Post Pages

```astro
// src/pages/posts/[slug].astro
export const getStaticPaths = async () => {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post }
  }));
};

const { post } = Astro.props;
const { Content } = await post.render();
```

- `getStaticPaths()` generates route for each post
- Post data passed as props
- Markdown rendered to HTML with `post.render()`
- Syntax highlighting via Shiki (GitHub Dark theme)

### 3. Tag Filtering

```astro
// src/pages/tags/[tag].astro
const allTags = new Set();
allPosts.forEach(post => {
  post.data.tags.forEach(tag => allTags.add(tag.toLowerCase()));
});

return Array.from(allTags).map(tag => {
  const filteredPosts = allPosts.filter(post =>
    post.data.tags.some(t => t.toLowerCase() === tag)
  );
  return { params: { tag }, props: { posts: filteredPosts } };
});
```

- Aggregates all unique tags
- Creates route for each tag
- Filters posts by tag
- Displays filtered list

### 4. RSS Feed

```typescript
// src/pages/rss.xml.ts
export async function GET(context) {
  const posts = await getCollection('blog');
  return rss({
    title: SITE.title,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      link: `/posts/${post.slug}/`,
    })),
  });
}
```

- Dynamic endpoint (not static HTML)
- Generates XML at build time
- Available at `/rss.xml`

### 5. Reading Time Calculation

```typescript
// src/utils/helpers.ts
export function getReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 250); // Average reading speed
  return `${minutes} min read`;
}
```

- Counts words in markdown content
- Assumes 250 words/minute
- Displayed in post metadata

---

## 🛠️ Extending the Blog

### Adding a New Page

1. Create file in `src/pages/`
2. Import layout and components
3. Add link in Header navigation

```astro
// src/pages/contact.astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Contact">
  <h1>Contact Me</h1>
</BaseLayout>
```

### Adding a New Post

1. Create `.md` file in `src/content/blog/`
2. Add frontmatter (title, date, description, tags)
3. Write markdown content
4. Build → auto-generates page

### Adding a Component

1. Create `.astro` file in `src/components/`
2. Define Props interface (TypeScript)
3. Import and use in pages/layouts

### Modifying Theme Colors

Edit CSS variables in `src/layouts/BaseLayout.astro`:

```css
:root {
  --color-accent: #your-color; /* Light mode */
}
@media (prefers-color-scheme: dark) {
  :root {
    --color-accent: #your-dark-color; /* Dark mode */
  }
}
```

---

## 🧪 Key Astro Concepts

### Islands Architecture

Astro components are "islands" of HTML:
- By default: Pure HTML (no JS)
- Can add interactivity with `client:*` directives
- This blog: 100% static (no client JS)

### Partial Hydration

```astro
<!-- Only this component gets JS -->
<ReactCounter client:load />
```

Not used in this blog (no interactive components).

### Content Collections vs Pages

| Content Collections | Pages |
|---------------------|-------|
| Type-safe content   | Routes |
| Markdown + frontmatter | Astro components |
| Stored in `src/content/` | Stored in `src/pages/` |
| Fetched with `getCollection()` | File = Route |

---

## 📊 Performance Characteristics

### Build Time
- ~400-500ms for 7 pages
- Scales linearly with post count
- Faster than Jekyll (10-100x)

### Page Load
- Zero JavaScript shipped
- Only HTML + CSS
- Instant navigation (pre-rendered)
- Images served from `/public/img/`

### SEO
- Static HTML (search engine friendly)
- Open Graph meta tags
- Twitter Cards
- Semantic HTML structure

---

## 🔧 Configuration Files

### astro.config.mjs

```javascript
export default defineConfig({
  site: 'https://thomas.rumas.fr',  // Base URL
  base: '/',                         // Subpath
  output: 'static',                  // Static site
  markdown: {
    shikiConfig: {
      theme: 'github-dark',          // Code highlighting
    },
  },
});
```

### src/config.ts

Site-wide settings:
- Title, description
- Author name & image
- Social media links
- Used throughout components

---

## 🐛 Common Troubleshooting

### Build Fails

1. Check TypeScript errors: `npm run astro check`
2. Verify frontmatter matches schema
3. Ensure all imports are correct

### Images Not Loading

- Images must be in `public/img/`
- Reference with `/img/filename.png` (absolute path)
- Frontmatter: `img: filename.png` (no `/img/` prefix)

### Dark Mode Not Working

- Ensure CSS variables used (not hardcoded colors)
- Check both `:root` and `@media (prefers-color-scheme: dark)`
- Test with system dark mode enabled

---

## 📚 Additional Resources

- [Astro Docs](https://docs.astro.build)
- [Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Routing](https://docs.astro.build/en/core-concepts/routing/)
- [Markdown & MDX](https://docs.astro.build/en/guides/markdown-content/)

---

## 🎯 Summary

**This blog is:**
- Static site generator (Astro)
- Content in Markdown files
- Type-safe with TypeScript
- Zero JavaScript runtime
- Dark mode via CSS variables
- Deployed to GitHub Pages

**Key files to understand:**
1. `src/layouts/BaseLayout.astro` - Global structure
2. `src/content/config.ts` - Content schema
3. `src/pages/posts/[slug].astro` - Dynamic routing
4. `src/config.ts` - Site settings
5. `.github/workflows/deploy.yml` - Deployment

**To maintain:**
- Add posts in `src/content/blog/`
- Modify styles in components
- Update config in `src/config.ts`
- Deploy with `git push`
