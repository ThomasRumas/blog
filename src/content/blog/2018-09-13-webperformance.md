---
title: "Testing Web Page Performance"
date: 2018-09-13
description: Use powerful tools to analyze and improve your web page performance
img: sitespeed.png
tags: [Development, Developer Experience]
---

Today I'll show you how to analyze your web pages' performance—whether in development, staging, or production—using tools from WebPageTest and Sitespeed.io.

## Why Fast Web Pages Matter

It's well-established that page load speed directly impacts user experience. Faster response and execution times are essential for all websites. Recent studies show that 57% of users will abandon a site if it takes more than 3 seconds to load. Among those users, 80% report they'll never return after this poor first experience. Sites loading in 58+ seconds have bounce rates 2x higher than those loading in 1 second.

For e-commerce sites, the impact is even more pronounced. Studies indicate that each additional second of load time reduces conversion rates by an average of 7%. The same research found that 20% of cart abandonments are due to load times users perceive as "too long."

### Real-World Impact

Some compelling examples:
- **Amazon**: A 100ms (0.1 second) increase in load time equals a 1% loss in sales—which in 2016 would have represented €1.36 billion in lost revenue
- **Shopzilla**: Reducing load time from 7 to 2 seconds increased revenue by 7-12%
- **Etam**: Reported in 2015 that reducing average page load time by 0.7 seconds led to a 20% increase in conversion rate

## SEO Implications

Google increasingly prioritizes page optimization for user experience, especially for mobile users. Ignoring your site's load time is no longer an option for good SEO rankings.

## Available Tools

To test web performance, you need the right tools. Today we'll explore two excellent options: [Sitespeed.io](https://www.sitespeed.io) and [WebPageTest](https://www.webpagetest.org/).

Both tools are open-source and maintained by active communities to meet Google's latest criteria for web performance and accessibility. I won't detail their usage here—the documentation is comprehensive and well-explained.

Instead, we'll address a common enterprise need: testing pages locally that aren't accessible from outside a private network. I've created a repository that lets you test websites locally using WebPageTest or Sitespeed.io: [WebPerformance](https://github.com/ThomasRumas/WebPerformance).

### Requirements

To run these scripts, you'll need:
- Docker
- Node.js
- Firefox and/or Chrome

Installation for each is straightforward—just follow the official documentation.

### Features

The scripts are simple but powerful, allowing you to:
- Test websites with bandwidth throttling for realistic conditions
- Test pages with mobile user agents (using Chrome)
- Run tests on pages not publicly accessible

## Conclusion

These tools are fantastic for revealing both weaknesses and strengths in your websites. They enable teams to centralize improvement efforts around the same metrics Google uses. If there's interest, I can follow up with an article exploring specific techniques to improve user experience on your websites.
