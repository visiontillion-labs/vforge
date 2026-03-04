export interface ProjectConfig {
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
  email: string;
  ai: string;
  monitoring: string;
  i18n: string;
  i18nRouting?: string;
  languages?: string;
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

interface Preset {
  id: string;
  name: string;
  description: string;
  values: ProjectConfig;
}

const defaultTheme = {
  radius: 0.5,
  baseColor: 'neutral',
  primaryColor: 'default',
  font: 'geist',
  components: ['button', 'card', 'input', 'form', 'dialog', 'select', 'tabs', 'tooltip', 'badge'],
};

export const presets: Preset[] = [
  {
    id: 'shipfast',
    name: 'ShipFast',
    description: 'NextAuth, MongoDB, Stripe, Mailgun & SEO',
    values: {
      projectName: 'my-startup',
      router: 'app',
      language: 'ts',
      linter: 'eslint',
      srcDir: true,
      importAlias: '@/*',
      features: {
        tailwind: true,
        shadcn: true,
        reactCompiler: false,
        docker: false,
        git: true,
        storybook: false,
      },
      auth: 'next-auth',
      database: 'mongoose',
      api: 'none',
      state: 'none',
      payment: 'stripe',
      email: 'mailgun',
      ai: 'none',
      monitoring: 'none',
      i18n: 'none',
      i18nRouting: 'prefix',
      languages: 'en',
      seo: true,
      testing: false,
      theme: defaultTheme,
    },
  },
  {
    id: 'saas',
    name: 'SaaS Starter',
    description: 'Auth, payments, DB & monitoring',
    values: {
      projectName: 'my-saas-app',
      router: 'app',
      language: 'ts',
      linter: 'eslint',
      srcDir: true,
      importAlias: '@/*',
      features: {
        tailwind: true,
        shadcn: true,
        reactCompiler: false,
        docker: true,
        git: true,
        storybook: false,
      },
      auth: 'authjs',
      database: 'prisma',
      api: 'trpc',
      state: 'zustand',
      payment: 'stripe',
      email: 'none',
      ai: 'none',
      monitoring: 'sentry',
      i18n: 'none',
      seo: true,
      testing: true,
      theme: defaultTheme,
    },
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Store with payments & i18n',
    values: {
      projectName: 'my-store',
      router: 'app',
      language: 'ts',
      linter: 'eslint',
      srcDir: true,
      importAlias: '@/*',
      features: {
        tailwind: true,
        shadcn: true,
        reactCompiler: false,
        docker: true,
        git: true,
        storybook: false,
      },
      auth: 'clerk',
      database: 'drizzle',
      api: 'trpc',
      state: 'zustand',
      payment: 'stripe',
      email: 'none',
      ai: 'none',
      monitoring: 'posthog',
      i18n: 'next-intl',
      i18nRouting: 'prefix',
      languages: 'en, ar',
      seo: true,
      testing: true,
      theme: defaultTheme,
    },
  },
  {
    id: 'blog',
    name: 'Blog / CMS',
    description: 'Content site with SEO & AI',
    values: {
      projectName: 'my-blog',
      router: 'app',
      language: 'ts',
      linter: 'biome',
      srcDir: true,
      importAlias: '@/*',
      features: {
        tailwind: true,
        shadcn: true,
        reactCompiler: false,
        docker: false,
        git: true,
        storybook: false,
      },
      auth: 'next-auth',
      database: 'prisma',
      api: 'none',
      state: 'none',
      payment: 'none',
      email: 'none',
      ai: 'vercel-ai-sdk',
      monitoring: 'none',
      i18n: 'next-intl',
      i18nRouting: 'prefix',
      languages: 'en',
      seo: true,
      testing: false,
      theme: defaultTheme,
    },
  },
];

export const presetNames = presets.map((p) => p.id);

export function getPreset(id: string): Preset | undefined {
  return presets.find((p) => p.id === id);
}
