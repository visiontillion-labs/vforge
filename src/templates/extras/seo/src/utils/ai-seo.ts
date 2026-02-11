import { model } from '@/lib/ai';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function generateMetadata(description: string) {
  const { object } = await generateObject({
    model,
    schema: z.object({
      title: z.string(),
      description: z.string(),
      keywords: z.array(z.string()),
    }),
    prompt: `Generate SEO metadata (title, description, keywords) for a page with the following content/description: ${description}`,
  });

  return {
    title: object.title,
    description: object.description,
    keywords: object.keywords,
  };
}
