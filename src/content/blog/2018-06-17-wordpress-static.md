---
title: "Converting WordPress to Static HTML (Part 1/2)"
date: 2018-06-18
description: Learn how to convert your WordPress site into static HTML files for improved security and performance
img: wordpress.png
tags: [Development, DevOps]
---

WordPress is one of the world's most popular content management systems, thanks to its flexibility, extensive plugin ecosystem, and active community.

However, popularity comes with a price. Like any widely-used platform, WordPress attracts significant attention from attackers looking to exploit vulnerabilities, steal data, or compromise websites.

One effective solution to mitigate these security risks is to convert your WordPress site into static HTML files. This approach was actually used for an earlier version of this blog.

## Benefits of Static Site Generation

Converting WordPress to static HTML offers several compelling advantages:

### Security Hardening
- **No Direct Internet Exposure**: Your WordPress installation remains on a local or private server, never exposed to the public internet
- **Reduced Attack Surface**: Static files eliminate common WordPress vulnerabilities related to plugins, themes, and core software
- **Database Protection**: No database queries means no SQL injection attacks or database breaches

### Performance Improvements
Static sites are significantly faster because:
- No PHP compilation required at runtime
- No database queries to process
- Web servers deliver pre-rendered HTML, CSS, and assets directly
- Reduced server overhead means better response times and lower hosting costs

### Simplified Hosting
- Deploy anywhere that serves static files (CDNs, object storage, static hosting platforms)
- Minimal server requirements
- Lower hosting costs

## Trade-offs to Consider

While static generation offers many benefits, there are limitations:

### Loss of Dynamic Features
- **No Database Interaction**: Forms, comments, and search require external solutions
- **No Server-Side Processing**: Features requiring PHP execution won't work
- **Manual Regeneration**: Content changes require rebuilding and redeploying the site

### Missing WordPress Features
- Native commenting system
- Built-in search functionality
- Real-time content updates

## Adding Dynamic Features to Static Sites

You can restore dynamic functionality using third-party services:

### Comments
Use [Disqus](https://disqus.com/) to embed a comment system that works entirely on the client side.

### Search
[Algolia](https://www.algolia.com/) provides fast, instant search that can be integrated into static sites.

### WordPress REST API
Since WordPress 4.7, the REST API is enabled by default. You can:
- Query your WordPress data via HTTP requests
- Build a headless CMS architecture
- Create custom integrations between your static site and WordPress backend

More details in the [official documentation](http://v2.wp-api.org/).

## Converting WordPress to Static HTML

Now that we understand the benefits and trade-offs, let's explore how to actually generate static HTML from WordPress.

### Using Simply Static Plugin

The **Simply Static** plugin is the easiest way to export your WordPress site as static files. It requires no special technical skills and integrates directly into WordPress.

#### Installation and Configuration

1. Install the Simply Static plugin from the WordPress plugin directory
2. Navigate to the plugin settings
3. Choose your URL structure in the *General* tab:

**Absolute URLs**  
Use this if your WordPress runs locally and you want to specify the production domain where the static site will be hosted.

**Relative URLs**  
URLs adapt to any domain, making the site portable across different hosts.

**Offline Use**  
Generates files that work without a web server (can be browsed from the filesystem). This requires using relative URLs throughout your content.

#### Export Options

Simply Static can export your site as:
- **ZIP Archive**: Download and extract on your hosting server
- **Local Directory**: Save directly to a folder on your server

Explore the plugin settings to customize the export process for your specific needs. The documentation provides detailed guidance for advanced configurations.
