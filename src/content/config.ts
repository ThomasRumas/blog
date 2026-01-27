import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    tags: z.array(z.string()),
    img: z.string().optional(),
    figCaption: z.string().optional(),
  }),
});

const talks = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    tags: z.array(z.string()),
    img: z.string().optional(),
    youtubeUrl: z.string().optional(),
    event: z.string().optional(),
    location: z.string().optional(),
    slides: z.string().optional(),
  }),
});

export const collections = { blog, talks };
