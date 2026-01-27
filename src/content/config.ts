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

export const collections = { blog };
