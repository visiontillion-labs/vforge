export interface TreeItem {
  name: string;
  children?: string[];
  fileExtension?: string;
}

export type TreeData = Record<string, TreeItem>;

interface FormValues {
  projectName: string;
  router: 'app' | 'pages';
  language: 'ts' | 'js';
  linter: 'eslint' | 'biome' | 'none';
  srcDir: boolean;
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
  i18nRouting?: string;
  languages?: string;
  seo: boolean;
  testing: boolean;
}

// Helper to get file extension
function getExt(filename: string): string | undefined {
  const parts = filename.split('.');
  if (parts.length > 1) return parts[parts.length - 1];
  return undefined;
}

// Helper to add a file path to the tree, creating intermediate folders
function addPath(tree: TreeData, filePath: string) {
  const parts = filePath.split('/');
  let currentId = 'root';

  for (let i = 0; i < parts.length; i++) {
    const isLast = i === parts.length - 1;
    const pathSoFar = parts.slice(0, i + 1).join('/');

    // Ensure current parent exists
    if (!tree[currentId]) {
      tree[currentId] = {
        name: currentId === 'root' ? 'root' : currentId,
        children: [],
      };
    }

    // Add this path as a child of the current parent if not already
    if (!tree[currentId].children) {
      tree[currentId].children = [];
    }
    if (!tree[currentId].children!.includes(pathSoFar)) {
      tree[currentId].children!.push(pathSoFar);
    }

    if (isLast) {
      // It's a file
      if (!tree[pathSoFar]) {
        tree[pathSoFar] = {
          name: parts[i],
          fileExtension: getExt(parts[i]),
        };
      }
    } else {
      // It's a folder
      if (!tree[pathSoFar]) {
        tree[pathSoFar] = {
          name: parts[i],
          children: [],
        };
      }
    }

    currentId = pathSoFar;
  }
}

export function buildTreeData(values: FormValues): TreeData {
  const tree: TreeData = {
    root: {
      name: values.projectName || 'my-next-app',
      children: [],
    },
  };

  const src = values.srcDir ? 'src/' : '';
  const ext = values.language === 'ts' ? 'ts' : 'js';
  const extx = values.language === 'ts' ? 'tsx' : 'jsx';

  // ── Base config files ──
  addPath(tree, 'package.json');
  addPath(tree, values.language === 'ts' ? 'tsconfig.json' : 'jsconfig.json');
  addPath(tree, 'next.config.mjs');
  addPath(tree, 'README.md');
  if (values.features.git) {
    addPath(tree, '.gitignore');
  }

  // Linter config
  if (values.linter === 'eslint') {
    addPath(tree, `eslint.config.mjs`);
  } else if (values.linter === 'biome') {
    addPath(tree, 'biome.json');
  }

  // ── Router files ──
  if (values.router === 'app') {
    const appDir =
      values.i18n === 'next-intl' && values.i18nRouting !== 'no-prefix'
        ? `${src}app/[locale]`
        : `${src}app`;
    addPath(tree, `${appDir}/layout.${extx}`);
    addPath(tree, `${appDir}/page.${extx}`);
    addPath(tree, `${src}app/globals.css`);
  } else {
    addPath(tree, `${src}pages/_app.${extx}`);
    addPath(tree, `${src}pages/_document.${extx}`);
    addPath(tree, `${src}pages/index.${extx}`);
    addPath(tree, `${src}styles/globals.css`);
  }

  // Providers
  addPath(tree, `${src}components/providers.${extx}`);

  // ── Public ──
  addPath(tree, 'public/favicon.ico');

  // ── Docker ──
  if (values.features.docker) {
    addPath(tree, 'Dockerfile');
    addPath(tree, 'docker-compose.yml');
  }

  // ── Auth ──
  if (values.auth && values.auth !== 'none') {
    switch (values.auth) {
      case 'authjs':
        addPath(tree, `auth.config.${ext}`);
        addPath(tree, `auth.${ext}`);
        break;
      case 'next-auth':
        addPath(tree, `${src}app/api/auth/[...nextauth]/route.${ext}`);
        break;
      case 'clerk':
        addPath(tree, `middleware.${ext}`);
        addPath(tree, `${src}app/sign-in/[[...sign-in]]/page.${extx}`);
        addPath(tree, `${src}app/sign-up/[[...sign-up]]/page.${extx}`);
        addPath(tree, `${src}components/providers/clerk-provider.${extx}`);
        break;
      case 'supabase':
        addPath(tree, `middleware.${ext}`);
        addPath(tree, `${src}utils/supabase/client.${ext}`);
        addPath(tree, `${src}utils/supabase/server.${ext}`);
        break;
      case 'firebase':
        addPath(tree, `${src}context/AuthContext.${extx}`);
        addPath(tree, `${src}lib/firebase.${ext}`);
        break;
      case 'better-auth':
        addPath(tree, `${src}lib/auth.${ext}`);
        break;
    }
  }

  // ── Database ──
  if (values.database && values.database !== 'none') {
    switch (values.database) {
      case 'prisma':
        addPath(tree, 'prisma/schema.prisma');
        addPath(tree, `${src}lib/db/index.${ext}`);
        break;
      case 'drizzle':
        addPath(tree, `db.${ext}`);
        addPath(tree, `drizzle.config.${ext}`);
        addPath(tree, `schema.${ext}`);
        break;
      case 'mongoose':
        addPath(tree, `${src}lib/db/index.${ext}`);
        addPath(tree, `${src}models/User.${ext}`);
        break;
      case 'firebase':
        addPath(tree, `${src}lib/firebase.${ext}`);
        break;
    }
  }

  // ── API ──
  if (values.api && values.api !== 'none') {
    switch (values.api) {
      case 'trpc':
        addPath(tree, `${src}app/api/trpc/[trpc]/route.${ext}`);
        addPath(tree, `${src}server/api/root.${ext}`);
        addPath(tree, `${src}server/api/trpc.${ext}`);
        break;
      case 'graphql':
        addPath(tree, `${src}app/api/graphql/route.${ext}`);
        break;
    }
  }

  // ── State ──
  if (values.state && values.state !== 'none') {
    switch (values.state) {
      case 'zustand':
        addPath(tree, `${src}store/useStore.${ext}`);
        break;
      case 'redux':
        addPath(tree, `${src}store/store.${ext}`);
        addPath(tree, `${src}store/hooks.${ext}`);
        addPath(tree, `${src}store/slices/counterSlice.${ext}`);
        break;
      case 'jotai':
        addPath(tree, `${src}store/atoms.${ext}`);
        break;
    }
  }

  // ── Payment ──
  if (values.payment && values.payment !== 'none') {
    switch (values.payment) {
      case 'stripe':
        addPath(tree, `${src}lib/stripe.${ext}`);
        addPath(tree, `${src}app/api/webhooks/stripe/route.${ext}`);
        break;
      case 'lemonsqueezy':
        addPath(tree, `${src}lib/lemonsqueezy.${ext}`);
        break;
      case 'paddle':
        addPath(tree, `${src}lib/paddle.${ext}`);
        break;
      case 'dodo':
        addPath(tree, `${src}lib/dodopayments.${ext}`);
        break;
      case 'polar':
        addPath(tree, `${src}lib/polar.${ext}`);
        break;
    }
  }

  // ── AI ──
  if (values.ai === 'vercel-ai-sdk') {
    addPath(tree, `${src}app/api/chat/route.${ext}`);
    addPath(tree, `${src}lib/ai.${ext}`);
  }

  // ── Monitoring ──
  if (values.monitoring && values.monitoring !== 'none') {
    switch (values.monitoring) {
      case 'sentry':
        addPath(tree, `sentry.client.config.${ext}`);
        addPath(tree, `sentry.edge.config.${ext}`);
        addPath(tree, `sentry.server.config.${ext}`);
        break;
      case 'posthog':
        addPath(tree, `${src}app/providers/posthog-provider.${extx}`);
        break;
      case 'logrocket':
        addPath(tree, `${src}app/providers/logrocket-provider.${extx}`);
        break;
      case 'logrocket':
        addPath(tree, `${src}app/providers/logrocket-provider.${extx}`);
        break;
      case 'google-analytics':
        // No extra file, but maybe layout modification?
        // Usually GA is just injected, but let's show it in package.json (already done implicitly)
        // Or if we had a component
        break;
      case 'vercel-analytics':
        // Same, usually just injection
        break;
    }
  }

  // ── I18n ──
  if (values.i18n && values.i18n !== 'none') {
    const langs = values.languages
      ? values.languages
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean)
      : ['en'];
    if (langs.length === 0) langs.push('en');

    if (values.i18n === 'next-intl') {
      addPath(tree, `${src}i18n.${ext}`);
      addPath(tree, `middleware.${ext}`);
      langs.forEach((lang) => {
        addPath(tree, `messages/${lang}.json`);
      });
    } else {
      // react-i18next
      langs.forEach((lang) => {
        addPath(tree, `${src}locales/${lang}/common.json`);
      });
    }
  }

  // ── SEO ──
  if (values.seo) {
    addPath(tree, 'next-sitemap.config.js');
    addPath(tree, `${src}utils/ai-seo.${ext}`);
  }

  // ── Testing ──
  if (values.testing) {
    addPath(tree, `vitest.config.${ext}`);
    addPath(tree, `${src}test/setup.${ext}`);
  }

  // ── .env.example ──
  const needsEnv =
    values.auth !== 'none' ||
    values.database !== 'none' ||
    values.payment !== 'none' ||
    values.ai === 'vercel-ai-sdk' ||
    values.monitoring !== 'none';
  if (needsEnv) {
    addPath(tree, '.env.example');
  }

  // ── Storybook ──
  if (values.features.storybook) {
    addPath(tree, '.storybook/main.ts');
    addPath(tree, '.storybook/preview.ts');
    // Example stories
    const storiesDir = values.srcDir ? 'src/stories' : 'stories';
    addPath(tree, `${storiesDir}/Button.tsx`);
    addPath(tree, `${storiesDir}/Button.stories.ts`);
    addPath(tree, `${storiesDir}/button.css`);
  }

  // Sort children: folders first, then files, alphabetically
  for (const key of Object.keys(tree)) {
    if (tree[key].children) {
      tree[key].children!.sort((a, b) => {
        const aIsFolder = !!tree[a]?.children;
        const bIsFolder = !!tree[b]?.children;
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        return (tree[a]?.name ?? '').localeCompare(tree[b]?.name ?? '');
      });
    }
  }

  return tree;
}

export function countFiles(tree: TreeData): number {
  return Object.values(tree).filter((item) => !item.children).length;
}
