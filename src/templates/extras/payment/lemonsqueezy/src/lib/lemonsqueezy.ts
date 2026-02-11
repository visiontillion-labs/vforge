import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

export function configureLemonSqueezy() {
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY,
    onError: (error) => console.error('Lemon Squeezy Error:', error),
  });
}
