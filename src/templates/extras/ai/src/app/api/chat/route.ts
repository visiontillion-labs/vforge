import { model } from '@/lib/ai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: model,
    messages,
  });

  return result.toDataStreamResponse();
}
