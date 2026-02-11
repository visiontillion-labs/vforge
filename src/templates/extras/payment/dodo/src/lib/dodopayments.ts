import DodoPayments from 'dodopayments';

export const dodo = new DodoPayments({
  bearerAuth: process.env.DODO_PAYMENTS_API_KEY,
  environment:
    process.env.NEXT_PUBLIC_DODO_ENVIRONMENT === 'production'
      ? 'production'
      : 'sandbox',
});
