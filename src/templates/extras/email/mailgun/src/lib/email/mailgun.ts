import formData from 'form-data';
import Mailgun from 'mailgun.js';

const apiKey = process.env.MAILGUN_API_KEY;
const domain = process.env.MAILGUN_DOMAIN;
const region = process.env.MAILGUN_REGION || 'us';

if (!apiKey || !domain) {
  throw new Error(
    'Missing Mailgun config. Set MAILGUN_API_KEY and MAILGUN_DOMAIN in your environment.',
  );
}

const mailgun = new Mailgun(formData);

export const mailgunClient = mailgun.client({
  username: 'api',
  key: apiKey,
  url: region === 'eu' ? 'https://api.eu.mailgun.net' : 'https://api.mailgun.net',
});

export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  const fromEmail = process.env.MAILGUN_FROM_EMAIL || 'noreply@example.com';
  const fromName = process.env.MAILGUN_FROM_NAME || 'VForge App';

  return mailgunClient.messages.create(domain, {
    from: `${fromName} <${fromEmail}>`,
    to: [params.to],
    subject: params.subject,
    text: params.text,
    html: params.html,
  });
}
