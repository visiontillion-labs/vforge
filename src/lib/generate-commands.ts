interface FormValues {
  projectName: string;
  router: string;
  language: string;
  linter: string;
  srcDir: boolean;
  importAlias: string;
  features: {
    tailwind: boolean;
    shadcn: boolean;
    reactCompiler: boolean;
    docker: boolean;
    git: boolean;
    storybook: boolean;
  };
  auth: string;
  database: string;
  api: string;
  state: string;
  payment: string;
  ai: string;
  monitoring: string;
  i18n: string;
  seo: boolean;
  testing: boolean;
  theme: {
    radius: number;
    baseColor: string;
    primaryColor: string;
    font: string;
    components: string[];
  };
}

interface ManualStep {
  label: string;
  command: string;
}

interface GeneratedCommands {
  cli: string;
  manual: ManualStep[];
}

export function generateCommands(values: FormValues): GeneratedCommands {
  // ── CLI command ─────────────────────────────────────────────────
  const cliFlags: string[] = [];
  if (values.router !== 'app') cliFlags.push(`--router ${values.router}`);
  if (values.language !== 'ts') cliFlags.push('--javascript');
  if (values.auth !== 'none') cliFlags.push(`--auth ${values.auth}`);
  if (values.database !== 'none') cliFlags.push(`--database ${values.database}`);

  const cliCommand = `npx create-oriums-app ${values.projectName}${cliFlags.length ? ' ' + cliFlags.join(' ') : ''}`;

  // ── Manual steps ────────────────────────────────────────────────
  const steps: ManualStep[] = [];

  // Step 1: Create project
  const createFlags = [
    values.language === 'ts' ? '--typescript' : '--javascript',
    values.features.tailwind ? '--tailwind' : '--no-tailwind',
    values.router === 'app' ? '--app' : '--no-app',
    values.srcDir ? '--src-dir' : '--no-src-dir',
    values.linter === 'eslint' ? '--eslint' : '--no-eslint',
    `--import-alias "${values.importAlias}"`,
  ];

  steps.push({
    label: 'Create Next.js project',
    command: `npx create-next-app@latest ${values.projectName} ${createFlags.join(' ')}`,
  });

  // Step 2: Navigate
  steps.push({
    label: 'Navigate to project',
    command: `cd ${values.projectName}`,
  });

  // Step 3: Core dependencies
  const deps: string[] = [];

  // Auth deps
  const authDeps: Record<string, string[]> = {
    authjs: ['next-auth@beta', '@auth/core'],
    'next-auth': ['next-auth'],
    clerk: ['@clerk/nextjs'],
    supabase: ['@supabase/supabase-js', '@supabase/ssr'],
    firebase: ['firebase', 'firebase-admin'],
    'better-auth': ['better-auth'],
  };
  if (values.auth !== 'none' && authDeps[values.auth]) {
    deps.push(...authDeps[values.auth]);
  }

  // DB deps
  const dbDeps: Record<string, string[]> = {
    prisma: ['@prisma/client'],
    drizzle: ['drizzle-orm', 'drizzle-kit'],
    mongoose: ['mongoose'],
    firebase: ['firebase', 'firebase-admin'],
  };
  if (values.database !== 'none' && dbDeps[values.database]) {
    const newDeps = dbDeps[values.database].filter((d) => !deps.includes(d));
    deps.push(...newDeps);
  }

  // API deps
  if (values.api === 'trpc') {
    deps.push('@trpc/server', '@trpc/client', '@trpc/react-query', '@tanstack/react-query', 'superjson');
  } else if (values.api === 'graphql') {
    deps.push('@apollo/server', '@apollo/client', 'graphql');
  }

  // State deps
  const stateDeps: Record<string, string[]> = {
    zustand: ['zustand'],
    redux: ['@reduxjs/toolkit', 'react-redux'],
    jotai: ['jotai'],
  };
  if (values.state !== 'none' && stateDeps[values.state]) {
    deps.push(...stateDeps[values.state]);
  }

  // Payment deps
  const paymentDeps: Record<string, string[]> = {
    stripe: ['stripe', '@stripe/stripe-js'],
    lemonsqueezy: ['@lemonsqueezy/lemonsqueezy.js'],
    paddle: ['@paddle/paddle-node-sdk'],
    dodo: ['dodopayments'],
    polar: ['@polar-sh/sdk'],
  };
  if (values.payment !== 'none' && paymentDeps[values.payment]) {
    deps.push(...paymentDeps[values.payment]);
  }

  // AI deps
  if (values.ai === 'vercel-ai-sdk') {
    deps.push('ai', '@ai-sdk/openai');
  }

  // Monitoring deps
  const monitoringDeps: Record<string, string[]> = {
    sentry: ['@sentry/nextjs'],
    posthog: ['posthog-js'],
    logrocket: ['logrocket'],
    'google-analytics': ['@next/third-parties'],
    'vercel-analytics': ['@vercel/analytics'],
  };
  if (values.monitoring !== 'none' && monitoringDeps[values.monitoring]) {
    deps.push(...monitoringDeps[values.monitoring]);
  }

  // i18n deps
  if (values.i18n === 'next-intl') {
    deps.push('next-intl');
  } else if (values.i18n === 'react-i18next') {
    deps.push('react-i18next', 'i18next');
  }

  // SEO
  if (values.seo) {
    deps.push('next-sitemap');
  }

  if (deps.length > 0) {
    steps.push({
      label: 'Install dependencies',
      command: `npm install ${deps.join(' ')}`,
    });
  }

  // Dev dependencies
  const devDeps: string[] = [];
  if (values.database === 'prisma') devDeps.push('prisma');
  if (values.testing) devDeps.push('vitest', '@testing-library/react', '@testing-library/jest-dom');
  if (values.linter === 'biome') devDeps.push('@biomejs/biome');

  if (devDeps.length > 0) {
    steps.push({
      label: 'Install dev dependencies',
      command: `npm install -D ${devDeps.join(' ')}`,
    });
  }

  // shadcn/ui setup
  if (values.features.shadcn) {
    steps.push({
      label: 'Initialize shadcn/ui',
      command: 'npx shadcn@latest init',
    });

    if (values.theme.components.length > 0) {
      steps.push({
        label: 'Add shadcn/ui components',
        command: `npx shadcn@latest add ${values.theme.components.join(' ')}`,
      });
    }
  }

  // Database setup
  if (values.database === 'prisma') {
    steps.push({
      label: 'Initialize Prisma',
      command: 'npx prisma init',
    });
  } else if (values.database === 'drizzle') {
    steps.push({
      label: 'Generate Drizzle migrations',
      command: 'npx drizzle-kit generate',
    });
  }

  // Storybook
  if (values.features.storybook) {
    steps.push({
      label: 'Initialize Storybook',
      command: 'npx storybook@latest init',
    });
  }

  return {
    cli: cliCommand,
    manual: steps,
  };
}
