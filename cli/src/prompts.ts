import { input, select, confirm, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import { type ProjectConfig, presets } from './presets.js';

export async function runInteractivePrompts(
  initialName?: string,
): Promise<ProjectConfig> {
  // Project name
  const projectName = initialName || await input({
    message: 'Project name:',
    default: 'my-next-app',
    validate: (value) => {
      if (!value) return 'Project name is required';
      if (!/^[a-z0-9-_]+$/.test(value))
        return 'Only lowercase letters, numbers, hyphens, and underscores';
      return true;
    },
  });

  // Template preset
  const usePreset = await select({
    message: 'Start from a preset?',
    choices: [
      ...presets.map((p) => ({
        name: `${p.name} — ${chalk.dim(p.description)}`,
        value: p.id,
      })),
      { name: `Custom — ${chalk.dim('Configure everything yourself')}`, value: 'custom' },
    ],
  });

  if (usePreset !== 'custom') {
    const preset = presets.find((p) => p.id === usePreset)!;
    return { ...preset.values, projectName };
  }

  // Language
  const language = await select({
    message: 'Language:',
    choices: [
      { name: 'TypeScript', value: 'ts' },
      { name: 'JavaScript', value: 'js' },
    ],
  });

  // Router
  const router = await select({
    message: 'Router:',
    choices: [
      { name: 'App Router (recommended)', value: 'app' },
      { name: 'Pages Router', value: 'pages' },
    ],
  });

  // Linter
  const linter = await select({
    message: 'Linter:',
    choices: [
      { name: 'ESLint', value: 'eslint' },
      { name: 'Biome', value: 'biome' },
      { name: 'None', value: 'none' },
    ],
  });

  // Source directory
  const srcDir = await confirm({
    message: 'Use /src directory?',
    default: true,
  });

  // Authentication
  const auth = await select({
    message: 'Authentication:',
    choices: [
      { name: 'None', value: 'none' },
      { name: 'Auth.js (v5)', value: 'authjs' },
      { name: 'NextAuth (v4)', value: 'next-auth' },
      { name: 'Clerk', value: 'clerk' },
      { name: 'Supabase', value: 'supabase' },
      { name: 'Firebase', value: 'firebase' },
      { name: 'Better Auth', value: 'better-auth' },
    ],
  });

  // Database
  const database = await select({
    message: 'Database:',
    choices: [
      { name: 'None', value: 'none' },
      { name: 'Prisma (SQL)', value: 'prisma' },
      { name: 'Drizzle (SQL)', value: 'drizzle' },
      { name: 'Mongoose (NoSQL)', value: 'mongoose' },
      { name: 'Firebase (NoSQL)', value: 'firebase' },
    ],
  });

  // API Layer
  const api = await select({
    message: 'API Layer:',
    choices: [
      { name: 'None (REST)', value: 'none' },
      { name: 'tRPC', value: 'trpc' },
      { name: 'GraphQL', value: 'graphql' },
    ],
  });

  // State Management
  const state = await select({
    message: 'State Management:',
    choices: [
      { name: 'None', value: 'none' },
      { name: 'Zustand', value: 'zustand' },
      { name: 'Redux Toolkit', value: 'redux' },
      { name: 'Jotai', value: 'jotai' },
    ],
  });

  // Payment
  const payment = await select({
    message: 'Payment Gateway:',
    choices: [
      { name: 'None', value: 'none' },
      { name: 'Stripe', value: 'stripe' },
      { name: 'Lemon Squeezy', value: 'lemonsqueezy' },
      { name: 'Paddle', value: 'paddle' },
      { name: 'Dodo Payments', value: 'dodo' },
      { name: 'Polar', value: 'polar' },
    ],
  });

  // Email
  const email = await select({
    message: 'Email Provider:',
    choices: [
      { name: 'None', value: 'none' },
      { name: 'Mailgun', value: 'mailgun' },
    ],
  });

  // AI
  const ai = await select({
    message: 'AI Integration:',
    choices: [
      { name: 'None', value: 'none' },
      { name: 'Vercel AI SDK', value: 'vercel-ai-sdk' },
    ],
  });

  // Monitoring
  const monitoring = await select({
    message: 'Analytics & Monitoring:',
    choices: [
      { name: 'None', value: 'none' },
      { name: 'Sentry', value: 'sentry' },
      { name: 'PostHog', value: 'posthog' },
      { name: 'LogRocket', value: 'logrocket' },
      { name: 'Google Analytics', value: 'google-analytics' },
      { name: 'Vercel Analytics', value: 'vercel-analytics' },
    ],
  });

  // i18n
  const i18n = await select({
    message: 'Internationalization:',
    choices: [
      { name: 'None', value: 'none' },
      { name: 'next-intl', value: 'next-intl' },
      { name: 'react-i18next', value: 'react-i18next' },
    ],
  });

  let i18nRouting: string | undefined;
  let languages: string | undefined;

  if (i18n !== 'none') {
    if (i18n === 'next-intl') {
      i18nRouting = await select({
        message: 'Routing Strategy:',
        choices: [
          { name: 'Prefix (/en/about)', value: 'prefix' },
          { name: 'No prefix (/about)', value: 'no-prefix' },
        ],
        default: 'prefix',
      });
    }

    languages = await input({
      message: 'Languages (comma separated):',
      default: 'en',
      validate: (value) => {
        if (!value.trim()) return 'At least one language is required';
        const locales = value
          .split(',')
          .map((locale) => locale.trim())
          .filter(Boolean);

        if (locales.length === 0) return 'At least one language is required';
        if (locales.some((locale) => !/^[a-z]{2}(-[A-Z]{2})?$/.test(locale))) {
          return 'Use locale codes like: en, ar, en-US';
        }

        return true;
      },
    });
  }

  // Feature toggles
  const featureToggles = await checkbox({
    message: 'Additional features:',
    choices: [
      { name: 'shadcn/ui', value: 'shadcn', checked: true },
      { name: 'Docker', value: 'docker' },
      { name: 'Storybook', value: 'storybook' },
      { name: 'SEO Pack (next-sitemap)', value: 'seo' },
      { name: 'Testing (Vitest)', value: 'testing' },
    ],
  });

  // Theme customization
  console.log('');
  console.log(chalk.bold('  Theme Customization'));

  const themeRadius = await select({
    message: 'Border radius:',
    choices: [
      { name: '0 (sharp)', value: 0 },
      { name: '0.3 (subtle)', value: 0.3 },
      { name: '0.5 (default)', value: 0.5 },
      { name: '0.75 (rounded)', value: 0.75 },
      { name: '1.0 (pill)', value: 1.0 },
    ],
  });

  const themeBaseColor = await select({
    message: 'Base color:',
    choices: [
      { name: 'Neutral', value: 'neutral' },
      { name: 'Slate', value: 'slate' },
      { name: 'Zinc', value: 'zinc' },
      { name: 'Gray', value: 'gray' },
      { name: 'Stone', value: 'stone' },
    ],
  });

  const themePrimaryColor = await select({
    message: 'Primary color:',
    choices: [
      { name: 'Default (dark)', value: 'default' },
      { name: 'Red', value: 'red' },
      { name: 'Orange', value: 'orange' },
      { name: 'Blue', value: 'blue' },
      { name: 'Green', value: 'green' },
      { name: 'Violet', value: 'violet' },
      { name: 'Purple', value: 'purple' },
      { name: 'Pink', value: 'pink' },
      { name: 'Rose', value: 'rose' },
    ],
  });

  const themeFont = await select({
    message: 'Font:',
    choices: [
      { name: 'Geist', value: 'geist' },
      { name: 'Inter', value: 'inter' },
      { name: 'Plus Jakarta Sans', value: 'plus-jakarta-sans' },
      { name: 'Manrope', value: 'manrope' },
      { name: 'Outfit', value: 'outfit' },
      { name: 'Raleway', value: 'raleway' },
    ],
  });

  return {
    projectName,
    router,
    language,
    linter,
    srcDir,
    importAlias: '@/*',
    features: {
      tailwind: true,
      shadcn: featureToggles.includes('shadcn'),
      reactCompiler: false,
      docker: featureToggles.includes('docker'),
      git: true,
      storybook: featureToggles.includes('storybook'),
    },
    auth,
    database,
    api,
    state,
    payment,
    email,
    ai,
    monitoring,
    i18n,
    ...(i18nRouting ? { i18nRouting } : {}),
    ...(languages ? { languages } : {}),
    seo: featureToggles.includes('seo'),
    testing: featureToggles.includes('testing'),
    theme: {
      radius: themeRadius,
      baseColor: themeBaseColor,
      primaryColor: themePrimaryColor,
      font: themeFont,
      components: ['button', 'card', 'input', 'form', 'dialog', 'select', 'tabs', 'tooltip', 'badge'],
    },
  };
}
