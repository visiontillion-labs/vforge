import { NextRequest, NextResponse } from 'next/server';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { PassThrough } from 'stream';
import {
  generateThemeCSS,
  type BaseColorId,
  type PrimaryColorId,
} from '@/lib/color-presets';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      projectName,
      router,
      language,
      linter,
      i18n,
      languages, // comma separated string e.g. "en, ar"
      seo,
      testing,
      // Re-adding variables used in loop
      srcDir,
      importAlias,
      features,
      auth,
      database,
      api,
      state,
      payment,
      ai,
      monitoring,
      i18nRouting,
      theme,
    } = body;

    // ── Theme defaults ──────────────────────────────────────────────
    const themeRadius = theme?.radius ?? 0.5;
    const themeBaseColor = theme?.baseColor ?? 'neutral';
    const themePrimaryColor = theme?.primaryColor ?? 'default';
    const _themeFont: string = theme?.font ?? 'geist';
    const themeComponents: string[] = theme?.components ?? ['button', 'card', 'input', 'form', 'dialog'];

    const stream = new PassThrough();
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(stream);

    const templatesDir = path.join(process.cwd(), 'src', 'templates');
    const langDir = path.join(templatesDir, language);
    const commonDir = path.join(langDir, 'common');
    const routerDir = path.join(langDir, router === 'app' ? 'app' : 'pages');
    const extrasDir = path.join(templatesDir, 'extras');

    // Parse languages
    const supportedLocales = languages
      ? languages
          .split(',')
          .map((l: string) => l.trim())
          .filter(Boolean)
      : ['en'];
    if (supportedLocales.length === 0) supportedLocales.push('en');

    const addDirectory = (source: string, destinationPrefix: string = '') => {
      if (!fs.existsSync(source)) return;

      const walk = (
        dir: string,
        fileList: string[] = [],
        baseDir: string = dir,
      ) => {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            walk(filePath, fileList, baseDir);
          } else {
            fileList.push(path.relative(baseDir, filePath));
          }
        });
        return fileList;
      };

      const allFiles = walk(source);

      allFiles.forEach((file) => {
        const fullPath = path.join(source, file);
        let content = fs.readFileSync(fullPath);
        let archivePath = path.join(destinationPrefix, file);

        // Skip package.json (handled separately)
        if (file === 'package.json') return;

        // Start Git check
        if (file === '.gitignore') {
          if (!features?.git) return;
          if (features?.storybook) {
            let gitIgnoreContent = content.toString('utf-8');
            gitIgnoreContent += '\n# Storybook\nstorybook-static\n';
            content = Buffer.from(gitIgnoreContent);
          }
        }
        // End Git check

        // Handle Linter Configs
        if (
          linter !== 'eslint' &&
          (file.includes('.eslintrc') || file.includes('eslint.config'))
        )
          return;
        if (linter !== 'biome' && file === 'biome.json') return;

        // Handle Analytics for App Router
        if (
          router === 'app' &&
          source === routerDir &&
          ['google-analytics', 'vercel-analytics'].includes(monitoring)
        ) {
          const normalizedFile = file.replace(/\\/g, '/');
          if (normalizedFile === 'src/app/layout.tsx') {
            let layoutContent = content.toString('utf-8');

            if (monitoring === 'google-analytics') {
              layoutContent =
                `import { GoogleAnalytics } from '@next/third-parties/google';\n` +
                layoutContent;
              layoutContent = layoutContent.replace(
                '</body>',
                `<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ""} /></body>`,
              );
            }

            if (monitoring === 'vercel-analytics') {
              layoutContent =
                `import { Analytics } from '@vercel/analytics/react';\n` +
                layoutContent;
              layoutContent = layoutContent.replace(
                '</body>',
                `<Analytics /></body>`,
              );
            }

            content = Buffer.from(layoutContent);
          }
        }

        // Handle Localization Restructuring for App Router (next-intl)
        if (
          router === 'app' &&
          i18n === 'next-intl' &&
          i18nRouting !== 'no-prefix' &&
          source === routerDir // Ensure we are processing the main app files
        ) {
          const normalizedFile = file.replace(/\\/g, '/');
          // Move layout.tsx and page.tsx to [locale]
          if (
            normalizedFile === 'src/app/layout.tsx' ||
            normalizedFile === 'src/app/page.tsx'
          ) {
            archivePath = archivePath.replace('src/app/', 'src/app/[locale]/');

            // Modify layout.tsx for RTL & Locale
            if (normalizedFile === 'src/app/layout.tsx') {
              let layoutContent = content.toString('utf-8');

              // Update globals.css import path
              layoutContent = layoutContent.replace(
                "import './globals.css';",
                "import '../../globals.css';",
              );

              // Inject Params
              layoutContent = layoutContent.replace(
                'children,',
                'children, params: { locale },',
              );
              // Update type definition (regex approach)
              layoutContent = layoutContent.replace(
                'Readonly<{',
                'Readonly<{\n  params: { locale: string };',
              );

              // Inject HTML attributes
              // Replace <html lang='en'> with dynamic one
              layoutContent = layoutContent.replace(
                /<html.*?>/,
                `<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>`,
              );

              // Add generateStaticParams for static export support (optional but good)
              layoutContent += `
export function generateStaticParams() {
  return [${supportedLocales.map((l: string) => `'${l}'`).join(', ')}].map((locale: { locale: string }) => ({ locale }));
}
`;

              content = Buffer.from(layoutContent);
            }

            // Modify page.tsx to show it works
            if (normalizedFile === 'src/app/page.tsx') {
              let pageContent = content.toString('utf-8');
              // Add useTranslations import
              pageContent =
                `import { useTranslations } from 'next-intl';\n` + pageContent;
              // Add hook usage inside component
              pageContent = pageContent.replace(
                'export default function Home() {',
                `export default function Home() {\n  const t = useTranslations('Index');`,
              );
              // Replace some text
              pageContent = pageContent.replace(
                'Get started by editing',
                `{t('title')} - (Current locale: {t('locale')}) <br/> Edit`,
              );
              content = Buffer.from(pageContent);
            }
          }
        }

        // Handle Analytics for Pages Router
        if (
          router === 'pages' &&
          source === routerDir &&
          ['google-analytics', 'vercel-analytics'].includes(monitoring)
        ) {
          const normalizedFile = file.replace(/\\/g, '/');
          if (normalizedFile.endsWith('_app.tsx')) {
            let appContent = content.toString('utf-8');

            if (monitoring === 'google-analytics') {
              appContent =
                `import { GoogleAnalytics } from '@next/third-parties/google';\n` +
                appContent;
              // Wrap Component with Fragment and add GA
              if (appContent.includes('<Component {...pageProps} />')) {
                appContent = appContent.replace(
                  '<Component {...pageProps} />',
                  `<><Component {...pageProps} /><GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ""} /></>`,
                );
              }
            }

            if (monitoring === 'vercel-analytics') {
              appContent =
                `import { Analytics } from '@vercel/analytics/react';\n` +
                appContent;
              if (appContent.includes('<Component {...pageProps} />')) {
                appContent = appContent.replace(
                  '<Component {...pageProps} />',
                  `<><Component {...pageProps} /><Analytics /></>`,
                );
              }
            }

            content = Buffer.from(appContent);
          }
        }

        // Handle Localization for Pages Router
        if (router === 'pages' && i18n !== 'none' && source === routerDir) {
          const normalizedFile = file.replace(/\\/g, '/');

          // Update _document.tsx for RTL
          if (normalizedFile.endsWith('_document.tsx')) {
            let docContent = content.toString('utf-8');
            // Inject props to Document (Next.js Document doesn't get props easily in default export without getInitialProps)
            // But we can use this.props.locale if we did getInitialProps.
            // Easier: Use HEAD to set dir? No, html attribute needs it.
            // Standard way:
            /*
                 class MyDocument extends Document {
                    render() {
                        const { locale } = this.props.__NEXT_DATA__;
                        const dir = locale === 'ar' ? 'rtl' : 'ltr';
                        return (
                            <Html lang={locale} dir={dir}>
                 */
            if (!docContent.includes('class MyDocument')) {
              // Convert functional to class or use props if functional (Document is special)
              // Let's just do a simple replacement for now assuming standard functional component structure
              docContent = docContent.replace(
                /<Html.*?>/,
                `<Html lang='en' dir='ltr'>`, // Temporary placeholder to ensure replacement works later or if valid
              );
              // We need to change the implementation to access locale.
              // Replacing the whole file might be safer if we knew specific template content.
              // Let's try to inject the logic into the functional component.
              docContent = docContent.replace(
                'export default function Document() {',
                `import { DocumentProps } from 'next/document';
                        export default function Document(props: DocumentProps) {
                            const { locale } = props.__NEXT_DATA__;
                            const dir = locale === 'ar' ? 'rtl' : 'ltr';`,
              );
              docContent = docContent.replace(
                /<Html.*?>/,
                `<Html lang={locale} dir={dir}>`,
              );
            }
            content = Buffer.from(docContent);
          }

          // Update _app.tsx for next-intl provider
          if (normalizedFile.endsWith('_app.tsx') && i18n === 'next-intl') {
            let appContent = content.toString('utf-8');
            appContent =
              `import { NextIntlClientProvider } from 'next-intl';\n` +
              appContent;
            if (appContent.includes('<Component {...pageProps} />')) {
              appContent = appContent.replace(
                '<Component {...pageProps} />',
                `<NextIntlClientProvider messages={pageProps.messages}>
          <Component {...pageProps} />
        </NextIntlClientProvider>`,
              );
            }
            content = Buffer.from(appContent);
          }

          // Update index.tsx to load messages
          if (normalizedFile.endsWith('index.tsx') && i18n === 'next-intl') {
            let indexContent = content.toString('utf-8');
            indexContent += `
export async function getStaticProps(context) {
  return {
    props: {
      messages: (await import(\`../../messages/\${context.locale}.json\`)).default
    }
  };
}
`;
            // Add usage to component
            indexContent =
              `import { useTranslations } from 'next-intl';\n` + indexContent;
            indexContent = indexContent.replace(
              'export default function Home() {',
              `export default function Home() {\n  const t = useTranslations('Index');`,
            );
            indexContent = indexContent.replace(
              'Get started by editing',
              `{t('title')} <br/> Edit`,
            );
            content = Buffer.from(indexContent);
          }
        }

        // Parse middleware.ts for i18n routing
        if (
          (file === 'middleware.ts' || file === 'src/middleware.ts') &&
          i18n === 'next-intl'
        ) {
          if (i18nRouting === 'no-prefix') {
            let mwContent = content.toString('utf-8');
            // Inject localePrefix: 'never'
            mwContent = mwContent.replace(
              "defaultLocale: 'en',",
              "defaultLocale: 'en',\n  localePrefix: 'never',",
            );
            // Update matcher to catch all (excluding next internals)
            mwContent = mwContent.replace(
              /matcher: \[.*\]/s,
              `matcher: ['/((?!api|_next|.*\\\\..*).*)']`,
            );
            content = Buffer.from(mwContent);
          }
        }

        // Handle Src Directory
        const normalizedPath = archivePath.split(path.sep).join('/');
        if (srcDir === false) {
          if (normalizedPath.startsWith('src/')) {
            archivePath = normalizedPath.substring(4);
          }
        }

        // Handle Import Alias
        if (importAlias !== '@/*') {
          const aliasPrefix = importAlias.replace('/*', '').replace('/', '');
          const ext = path.extname(file);

          if (['.ts', '.tsx', '.js', '.jsx', '.json', '.css'].includes(ext)) {
            const contentStr = content.toString('utf-8');
            let newContent = contentStr.replaceAll('@/', `${aliasPrefix}/`);

            if (
              file.endsWith('config.json') ||
              file.endsWith('tsconfig.json')
            ) {
              const aliasKey = importAlias.endsWith('/*')
                ? importAlias
                : `${importAlias}/*`;
              newContent = newContent.replace('"@/*"', `"${aliasKey}"`);
              if (srcDir === false) {
                newContent = newContent.replace('["./src/*"]', '["./*"]');
              }
            }
            content = Buffer.from(newContent);
          }
        } else if (
          srcDir === false &&
          (file.endsWith('config.json') || file.endsWith('tsconfig.json'))
        ) {
          const contentStr = content.toString('utf-8');
          const newContent = contentStr.replace('["./src/*"]', '["./*"]');
          content = Buffer.from(newContent);
        }

        archive.append(content, { name: archivePath });
      });
    };

    // 1. Add Common Files
    addDirectory(commonDir);

    // 2. Add Router Files (App or Pages)
    addDirectory(routerDir);

    // 3. Add Extras

    // Biome
    if (linter === 'biome') {
      addDirectory(path.join(extrasDir, 'biome.json'), ''); // It's a file, but addDirectory handles dirs. Logic needs check.
      // Actually addDirectory expects a dir. For single files:
      const biomePath = path.join(extrasDir, 'biome.json');
      if (fs.existsSync(biomePath)) {
        archive.file(biomePath, { name: 'biome.json' });
      }
    }

    // Docker
    if (features?.docker) {
      // Existing docker logic
      const dockerPath = path.join(extrasDir, 'docker', 'Dockerfile');
      if (fs.existsSync(dockerPath)) {
        archive.file(dockerPath, { name: 'Dockerfile' });
      }
      // Add docker-compose if exists?
      const composePath = path.join(extrasDir, 'docker', 'docker-compose.yml');
      if (fs.existsSync(composePath)) {
        archive.file(composePath, { name: 'docker-compose.yml' });
      }
    }

    // --- Feature Implementation ---

    // Authentication
    if (auth && auth !== 'none') {
      const authPath = path.join(extrasDir, 'auth', auth);
      addDirectory(authPath);
    }

    // Database
    if (database && database !== 'none') {
      const dbPath = path.join(
        extrasDir,
        database === 'prisma'
          ? 'prisma'
          : database === 'drizzle'
            ? 'drizzle'
            : database === 'mongoose'
              ? 'mongoose'
              : 'firebase',
      );
      addDirectory(dbPath);
    }

    // API
    if (api && api !== 'none') {
      const apiPath = path.join(extrasDir, 'api', api);
      addDirectory(apiPath);
    }

    // State Management
    if (state && state !== 'none') {
      const statePath = path.join(extrasDir, 'state', state);
      addDirectory(statePath);
    }

    // Payment
    if (payment && payment !== 'none') {
      const payPath = path.join(extrasDir, 'payment', payment);
      addDirectory(payPath);
    }

    // AI
    if (ai === 'vercel-ai-sdk') {
      addDirectory(path.join(extrasDir, 'ai'));
    }

    // Monitoring
    if (monitoring && monitoring !== 'none') {
      addDirectory(path.join(extrasDir, 'monitoring', monitoring));
    }

    // I18n
    if (i18n && i18n !== 'none') {
      // Logic for adding i18n extra files
      // For next-intl, we need custom logic to inject locales
      if (i18n === 'next-intl') {
        const intlDir = path.join(extrasDir, 'i18n', 'next-intl');
        // Manually handle i18n.ts to inject locales
        const i18nTsPath = path.join(intlDir, 'src', 'i18n.ts');
        if (fs.existsSync(i18nTsPath)) {
          let i18nContent = fs.readFileSync(i18nTsPath, 'utf-8');
          // Replace locales
          i18nContent = i18nContent.replace(
            /const locales = \[.*\];/,
            `const locales = [${supportedLocales.map((l: string) => `'${l}'`).join(', ')}];`,
          );
          archive.append(Buffer.from(i18nContent), {
            name: srcDir ? 'src/i18n.ts' : 'i18n.ts',
          });
        }

        // Middleware (required for next-intl)
        const middlewarePath = path.join(intlDir, 'middleware.ts');
        if (fs.existsSync(middlewarePath)) {
          const mContent = fs.readFileSync(middlewarePath, 'utf-8');
          // Update locales in middleware if hardcoded (usually it imports from config, but lets check)
          // If it imports from somewhere else, we good. Assuming standard template.
          // Just add the file.
          archive.append(Buffer.from(mContent), { name: 'middleware.ts' });
        }

        // Messages
        const messagesDir = path.join(intlDir, 'src', 'messages');
        if (fs.existsSync(messagesDir)) {
          // Read en.json as base
          const enPath = path.join(messagesDir, 'en.json');
          if (fs.existsSync(enPath)) {
            const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

            // Create message file for EACH supported locale
            supportedLocales.forEach((locale: string) => {
              const localeContent = { ...enContent };
              localeContent.Index = { ...localeContent.Index, locale: locale }; // Inject locale name for demo
              if (locale === 'ar') localeContent.Index.title = 'مرحبا بالعالم'; // Simple demo

              archive.append(
                Buffer.from(JSON.stringify(localeContent, null, 2)),
                { name: `messages/${locale}.json` },
              );
            });
          }
        }
      } else {
        // Fallback for react-i18next or others
        addDirectory(path.join(extrasDir, 'i18n', i18n));
      }
    }

    // SEO
    if (seo) {
      addDirectory(path.join(extrasDir, 'seo'));
    }

    // Testing
    if (testing) {
      addDirectory(path.join(extrasDir, 'testing'));
    }

    // Storybook
    if (features?.storybook) {
      addDirectory(path.join(extrasDir, 'storybook'));
    }

    // --- Providers Generation ---
    // We need to generate a Providers component that wraps everything.
    // Logic:
    // 1. Collect imports
    // 2. Collect wrapper components

    const providersImports: string[] = [`import React from 'react'`];
    const providersWrappers: string[] = [];

    // Auth Providers
    if (auth === 'clerk') {
      providersImports.push(`import { ClerkProvider } from '@clerk/nextjs'`);
      providersWrappers.push('ClerkProvider');
    } else if (auth === 'authjs' || auth === 'next-auth') {
      providersImports.push(
        `import { SessionProvider } from 'next-auth/react'`,
      );
      providersWrappers.push('SessionProvider');
    } else if (auth === 'firebase') {
      providersImports.push(
        `import { AuthContextProvider } from '@/context/AuthContext'`,
      );
      providersWrappers.push('AuthContextProvider');
    }

    // State Providers
    if (state === 'redux') {
      providersImports.push(
        `import { Provider as ReduxProvider } from 'react-redux'`,
      );
      providersImports.push(`import { makeStore } from '@/store/store'`);
      // Redux needs a store instance or refs.
      // Standard pattern: <ReduxProvider store={store}>
      // But makeStore creates it.
      // We'll assume the component handles it or we pass it.
      // For simplicity, let's assume we create it here or the provider handles it.
      // Actually best to just import a pre-made provider from template if complex.
      // But let's try to inline it:
      // const store = makeStore(); <ReduxProvider store={store}>
      // This is hard to gen in string.
      // Alternative: The template should provide a `ReduxProvider` component like we did for PostHog.
      // I'll skip complex Redux logic for now and just wrap if I can, or maybe I should have made a `ReduxProvider` component in the template. source/store/ReduxProvider.tsx
    }

    // Monitoring Providers
    if (monitoring === 'posthog') {
      providersImports.push(
        `import { CSPostHogProvider } from '@/app/providers/posthog-provider'`,
      );
      providersWrappers.push('CSPostHogProvider');
    } else if (monitoring === 'logrocket') {
      providersImports.push(
        `import { LogRocketProvider } from '@/app/providers/logrocket-provider'`,
      );
      providersWrappers.push('LogRocketProvider');
    }

    // API Providers (tRPC)
    if (api === 'trpc') {
      // tRPC usually needs a provider wrapping query client.
      // I should have made a TRPCProvider in the template.
    }

    // Construct the file content
    let providersContent = `
${providersImports.join('\n')}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
`;

    // Open wrappers
    providersWrappers.forEach((wrapper) => {
      providersContent += `      <${wrapper}>\n`;
    });

    providersContent += `        {children}\n`;

    // Close wrappers (reverse)
    [...providersWrappers].reverse().forEach((wrapper) => {
      providersContent += `      </${wrapper}>\n`;
    });

    providersContent += `    </>
  );
}
`;
    // Replace the default Providers component
    const providersPath = srcDir
      ? 'src/components/providers.tsx'
      : 'components/providers.tsx';
    archive.append(Buffer.from(providersContent), { name: providersPath });

    // --- Process package.json ---
    const packageJsonPath = path.join(commonDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);

      packageJson.name = projectName;

      // Add dependencies based on features

      // Auth
      if (auth === 'authjs') {
        packageJson.dependencies['next-auth'] = 'beta';
      } else if (auth === 'next-auth') {
        packageJson.dependencies['next-auth'] = '^4.24.5';
      } else if (auth === 'clerk') {
        packageJson.dependencies['@clerk/nextjs'] = '^4.29.3';
      } else if (auth === 'supabase') {
        packageJson.dependencies['@supabase/supabase-js'] = '^2.39.3';
        packageJson.dependencies['@supabase/ssr'] = '^0.1.0';
      } else if (auth === 'firebase') {
        packageJson.dependencies['firebase'] = '^10.7.1';
      } else if (auth === 'better-auth') {
        // better-auth deps
      }

      // Database
      if (database === 'prisma') {
        packageJson.devDependencies['prisma'] = '^5.10.2';
        packageJson.dependencies['@prisma/client'] = '^5.10.2';
      } else if (database === 'drizzle') {
        packageJson.dependencies['drizzle-orm'] = '^0.29.3';
        packageJson.dependencies['postgres'] = '^3.4.3';
        packageJson.devDependencies['drizzle-kit'] = '^0.20.14';
      } else if (database === 'mongoose') {
        packageJson.dependencies['mongoose'] = '^8.1.1';
      }

      // API
      if (api === 'trpc') {
        packageJson.dependencies['@trpc/server'] = '^10.45.0';
        packageJson.dependencies['@trpc/client'] = '^10.45.0';
        packageJson.dependencies['@trpc/react-query'] = '^10.45.0';
        packageJson.dependencies['@tanstack/react-query'] = '^5.17.19';
        packageJson.dependencies['zod'] = '^3.22.4';
      } else if (api === 'graphql') {
        packageJson.dependencies['graphql'] = '^16.8.1';
        packageJson.dependencies['graphql-yoga'] = '^5.1.1';
      }

      // State
      if (state === 'zustand') {
        packageJson.dependencies['zustand'] = '^4.5.0';
      } else if (state === 'redux') {
        packageJson.dependencies['react-redux'] = '^9.1.0';
        packageJson.dependencies['@reduxjs/toolkit'] = '^2.1.0';
      } else if (state === 'jotai') {
        packageJson.dependencies['jotai'] = '^2.6.4';
      }

      // Payment
      if (payment === 'stripe') {
        packageJson.dependencies['stripe'] = '^14.16.0';
      } else if (payment === 'lemonsqueezy') {
        packageJson.dependencies['@lemonsqueezy/lemonsqueezy.js'] = '^2.2.0';
      } else if (payment === 'paddle') {
        packageJson.dependencies['@paddle/paddle-node-sdk'] = '^1.0.0';
      } else if (payment === 'dodo') {
        packageJson.dependencies['dodopayments'] = '^0.0.1'; // Check version
      } else if (payment === 'polar') {
        packageJson.dependencies['@polar-sh/sdk'] = '^0.1.0';
      }

      // AI
      if (ai === 'vercel-ai-sdk') {
        packageJson.dependencies['ai'] = '^2.2.31';
        packageJson.dependencies['openai'] = '^4.26.0';
        packageJson.dependencies['@ai-sdk/openai'] = '^0.0.12';
      }

      // Monitoring
      if (monitoring === 'sentry') {
        packageJson.dependencies['@sentry/nextjs'] = '^7.100.1';
      } else if (monitoring === 'posthog') {
        packageJson.dependencies['posthog-js'] = '^1.100.0';
      } else if (monitoring === 'logrocket') {
        packageJson.dependencies['logrocket'] = '^8.0.0';
      } else if (monitoring === 'google-analytics') {
        packageJson.dependencies['@next/third-parties'] = '^13.4.0';
      } else if (monitoring === 'vercel-analytics') {
        packageJson.dependencies['@vercel/analytics'] = '^1.1.1';
      }

      // I18n
      if (i18n === 'next-intl') {
        packageJson.dependencies['next-intl'] = '^3.5.0';
      } else if (i18n === 'react-i18next') {
        packageJson.dependencies['i18next'] = '^23.8.1';
        packageJson.dependencies['react-i18next'] = '^14.0.1';
        packageJson.dependencies['i18next-resources-to-backend'] = '^1.2.0';
        packageJson.dependencies['i18next-browser-languagedetector'] = '^7.2.0';
      }

      // SEO
      if (seo) {
        packageJson.dependencies['next-sitemap'] = '^4.2.3';
      }

      // Testing
      if (testing) {
        packageJson.devDependencies['vitest'] = '^1.2.2';
        packageJson.devDependencies['@vitejs/plugin-react'] = '^4.2.1';
        packageJson.devDependencies['jsdom'] = '^24.0.0';
        packageJson.devDependencies['@testing-library/react'] = '^14.2.0';
        packageJson.devDependencies['@testing-library/jest-dom'] = '^6.4.2';
      }

      // Storybook
      if (features?.storybook) {
        packageJson.devDependencies['storybook'] = '^8.0.0';
        packageJson.devDependencies['@storybook/react'] = '^8.0.0';
        packageJson.devDependencies['@storybook/nextjs'] = '^8.0.0';
        packageJson.devDependencies['@storybook/addon-essentials'] = '^8.0.0';
        packageJson.devDependencies['@storybook/addon-interactions'] = '^8.0.0';
        packageJson.devDependencies['@storybook/addon-links'] = '^8.0.0';
        packageJson.devDependencies['@storybook/addon-onboarding'] = '^8.0.0';
        packageJson.devDependencies['@storybook/blocks'] = '^8.0.0';
        packageJson.devDependencies['@storybook/test'] = '^8.0.0';

        packageJson.scripts['storybook'] = 'storybook dev -p 6006';
        packageJson.scripts['build-storybook'] = 'storybook build';
      }

      archive.append(JSON.stringify(packageJson, null, 2), {
        name: 'package.json',
      });
    }

    // Handle next.config for Pages Router i18n
    if (router === 'pages' && i18n !== 'none') {
      // We probably need to update next.config.ts/js
      // Assuming boilerplate has next.config.ts
      const configPath = path.join(commonDir, 'next.config.ts');
      if (fs.existsSync(configPath)) {
        let configContent = fs.readFileSync(configPath, 'utf-8');
        // Inject i18n config
        const i18nConfig = `
  i18n: {
    locales: [${supportedLocales.map((l: string) => `'${l}'`).join(', ')}],
    defaultLocale: 'en',
    localeDetection: false,
  },`;
        configContent = configContent.replace(
          'const nextConfig: NextConfig = {',
          `const nextConfig: NextConfig = {${i18nConfig}`,
        );

        // Note: boilerplate might be using .mjs for config in some templates, but assuming common has one.
        // If checking fails, we might miss it.
        archive.append(Buffer.from(configContent), { name: 'next.config.ts' });
      }
    }

    // ── Helper maps for human-readable names ────────────────────────
    const authNames: Record<string, string> = {
      authjs: 'Auth.js (v5)',
      'next-auth': 'NextAuth.js (v4)',
      clerk: 'Clerk',
      supabase: 'Supabase Auth',
      firebase: 'Firebase Auth',
      'better-auth': 'Better Auth',
    };
    const dbNames: Record<string, string> = {
      prisma: 'Prisma',
      drizzle: 'Drizzle ORM',
      mongoose: 'Mongoose',
      firebase: 'Firebase (Firestore)',
    };
    const apiNames: Record<string, string> = {
      trpc: 'tRPC',
      graphql: 'GraphQL (graphql-yoga)',
    };
    const stateNames: Record<string, string> = {
      zustand: 'Zustand',
      redux: 'Redux Toolkit',
      jotai: 'Jotai',
    };
    const paymentNames: Record<string, string> = {
      stripe: 'Stripe',
      lemonsqueezy: 'Lemon Squeezy',
      paddle: 'Paddle',
      dodo: 'Dodo Payments',
      polar: 'Polar',
    };
    const monitoringNames: Record<string, string> = {
      sentry: 'Sentry',
      posthog: 'PostHog',
      logrocket: 'LogRocket',
      'google-analytics': 'Google Analytics',
      'vercel-analytics': 'Vercel Analytics',
    };
    const i18nNames: Record<string, string> = {
      'next-intl': 'next-intl',
      'react-i18next': 'react-i18next',
    };
    const linterNames: Record<string, string> = {
      eslint: 'ESLint',
      biome: 'Biome',
    };

    // Generate .env.example
    let envContent = '';

    // Core
    envContent += `# App\nNEXT_PUBLIC_APP_URL="http://localhost:3000"\n\n`;

    // Authentication
    if (auth !== 'none') {
      envContent += `# Authentication (${authNames[auth] || auth})\n`;
      if (auth === 'authjs') {
        envContent += `AUTH_SECRET="your_generated_secret"\nAUTH_URL="http://localhost:3000"\n`;
        envContent += `# AUTH_GOOGLE_ID=""\n# AUTH_GOOGLE_SECRET=""\n`;
      } else if (auth === 'next-auth') {
        envContent += `NEXTAUTH_URL="http://localhost:3000"\nNEXTAUTH_SECRET="your_generated_secret"\n`;
        envContent += `# GITHUB_ID=""\n# GITHUB_SECRET=""\n`;
      } else if (auth === 'clerk') {
        envContent += `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."\nCLERK_SECRET_KEY="sk_test_..."\n`;
        envContent += `NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"\nNEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"\n`;
      } else if (auth === 'supabase') {
        envContent += `NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"\nNEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"\n`;
      } else if (auth === 'firebase') {
        envContent += `NEXT_PUBLIC_FIREBASE_API_KEY=""\nNEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""\nNEXT_PUBLIC_FIREBASE_PROJECT_ID=""\nNEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""\nNEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""\nNEXT_PUBLIC_FIREBASE_APP_ID=""\n`;
      } else if (auth === 'better-auth') {
        envContent += `BETTER_AUTH_SECRET="your_generated_secret"\nBETTER_AUTH_URL="http://localhost:3000"\n`;
      }
      envContent += '\n';
    }

    // Database
    if (database !== 'none') {
      envContent += `# Database (${dbNames[database] || database})\n`;
      if (database === 'prisma') {
        envContent += `DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"\n`;
        envContent += `# DIRECT_URL="postgresql://user:password@localhost:5432/mydb?schema=public" # For serverless (Neon/Supabase)\n`;
      } else if (database === 'drizzle') {
        envContent += `DATABASE_URL="postgresql://user:password@localhost:5432/mydb"\n`;
      } else if (database === 'mongoose') {
        envContent += `MONGODB_URI="mongodb://localhost:27017/mydb"\n`;
      }
      envContent += '\n';
    }

    // Payments
    if (payment !== 'none') {
      envContent += `# Payments (${paymentNames[payment] || payment})\n`;
      if (payment === 'stripe') {
        envContent += `STRIPE_SECRET_KEY="sk_test_..."\nNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."\nSTRIPE_WEBHOOK_SECRET="whsec_..."\n`;
      } else if (payment === 'lemonsqueezy') {
        envContent += `LEMONSQUEEZY_API_KEY=""\nLEMONSQUEEZY_STORE_ID=""\nLEMONSQUEEZY_WEBHOOK_SECRET=""\n`;
      } else if (payment === 'paddle') {
        envContent += `PADDLE_API_KEY=""\nNEXT_PUBLIC_PADDLE_CLIENT_TOKEN=""\nPADDLE_WEBHOOK_SECRET=""\n`;
      } else if (payment === 'dodo') {
        envContent += `DODO_PAYMENTS_API_KEY=""\nDODO_PAYMENTS_WEBHOOK_SECRET=""\n`;
      } else if (payment === 'polar') {
        envContent += `POLAR_ACCESS_TOKEN=""\nPOLAR_ORGANIZATION_ID=""\n`;
      }
      envContent += '\n';
    }

    // AI
    if (ai === 'vercel-ai-sdk') {
      envContent += `# AI (Vercel AI SDK)\nOPENAI_API_KEY="sk-..."\n\n`;
    }

    // Monitoring & Analytics
    if (monitoring !== 'none') {
      envContent += `# Monitoring (${monitoringNames[monitoring] || monitoring})\n`;
      if (monitoring === 'sentry') {
        envContent += `SENTRY_AUTH_TOKEN=""\nSENTRY_DSN=""\nSENTRY_ORG=""\nSENTRY_PROJECT=""\n`;
      } else if (monitoring === 'posthog') {
        envContent += `NEXT_PUBLIC_POSTHOG_KEY="phc_..."\nNEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"\n`;
      } else if (monitoring === 'logrocket') {
        envContent += `NEXT_PUBLIC_LOGROCKET_APP_ID="org/app"\n`;
      } else if (monitoring === 'google-analytics') {
        envContent += `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-..."\n`;
      }
      envContent += '\n';
    }

    // Email / Resend (if relevant, but not explicitly selected in form yet, maybe implicitly?)
    // Skipping for now as it's not in the main feature list.

    if (envContent.trim() !== '') {
      archive.append(Buffer.from(envContent), { name: '.env.example' });
    }

    // Generate README.md

    let readmeContent = `# ${projectName}

This is a [Next.js](https://nextjs.org/) project bootstrapped with [Orium Boilerplate](https://github.com/mustaquenadim/oriums-boilerplate).

## Tech Stack

| Category | Choice |
| --- | --- |
| Framework | Next.js ${router === 'app' ? '(App Router)' : '(Pages Router)'} |
| Language | ${language === 'ts' ? 'TypeScript' : 'JavaScript'} |
| Styling | ${features?.tailwind ? 'Tailwind CSS' : 'CSS Modules'}${features?.shadcn ? ' + shadcn/ui' : ''} |
| Linter | ${linterNames[linter] || 'None'} |
`;
    if (auth !== 'none')
      readmeContent += `| Authentication | ${authNames[auth] || auth} |\n`;
    if (database !== 'none')
      readmeContent += `| Database | ${dbNames[database] || database} |\n`;
    if (api !== 'none')
      readmeContent += `| API Layer | ${apiNames[api] || api} |\n`;
    if (state !== 'none')
      readmeContent += `| State Management | ${stateNames[state] || state} |\n`;
    if (payment !== 'none')
      readmeContent += `| Payments | ${paymentNames[payment] || payment} |\n`;
    if (ai !== 'none') readmeContent += `| AI | Vercel AI SDK |\n`;
    if (monitoring !== 'none')
      readmeContent += `| Analytics & Monitoring | ${monitoringNames[monitoring] || monitoring} |\n`;
    if (i18n !== 'none')
      readmeContent += `| Internationalization | ${i18nNames[i18n] || i18n} |\n`;
    if (seo) readmeContent += `| SEO | next-sitemap |\n`;
    if (testing)
      readmeContent += `| Testing | Vitest + React Testing Library |\n`;
    if (features?.docker) readmeContent += `| Containerisation | Docker |\n`;
    if (features?.storybook) readmeContent += `| Component Dev | Storybook |\n`;

    // ── Prerequisites ───────────────────────────────────────────────
    readmeContent += `
## Prerequisites

- [Node.js](https://nodejs.org/) 18.17 or later
- npm / yarn / pnpm / bun
`;
    if (features?.docker)
      readmeContent += `- [Docker](https://www.docker.com/) (for containerised deployment)\n`;
    if (database === 'prisma' || database === 'drizzle')
      readmeContent += `- A PostgreSQL database (local or cloud)\n`;
    if (database === 'mongoose')
      readmeContent += `- A MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))\n`;

    // ── Getting Started ─────────────────────────────────────────────
    readmeContent += `
## Getting Started

### 1. Install dependencies

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

### 2. Set up environment variables

Copy the example env file and fill in the values:

\`\`\`bash
cp .env.example .env.local
\`\`\`

> See the **Integration Setup** sections below for details on each variable.
`;

    // ── Database-specific first-time setup ───────────────────────────
    if (database === 'prisma') {
      readmeContent += `
### 3. Initialise the database (Prisma)

\`\`\`bash
# Generate the Prisma client
npx prisma generate

# Create and apply the initial migration
npx prisma migrate dev --name init
\`\`\`

`;
    } else if (database === 'drizzle') {
      readmeContent += `
### 3. Initialise the database (Drizzle)

\`\`\`bash
# Push the schema to your database
npm run db:push
\`\`\`

`;
    } else if (database === 'mongoose') {
      readmeContent += `
### 3. Start MongoDB

Ensure your MongoDB instance is running and the \`MONGODB_URI\` in \`.env.local\` points to it.

`;
    }

    readmeContent += `### ${database !== 'none' ? '4' : '3'}. Run the development server

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
`;

    // ── Project Structure ───────────────────────────────────────────
    const structureLines: string[] = [
      `${projectName}/`,
      `├── public/                  # Static assets`,
    ];
    if (srcDir) {
      structureLines.push(`├── src/`);
      structureLines.push(
        `│   ├── ${router === 'app' ? 'app/' : 'pages/'}${' '.repeat(Math.max(0, 18 - (router === 'app' ? 4 : 6)))}# ${router === 'app' ? 'App Router pages & layouts' : 'Pages Router views'}`,
      );
      structureLines.push(
        `│   ├── components/          # Reusable UI components`,
      );
      structureLines.push(
        `│   ├── lib/                 # Utility functions & shared logic`,
      );
      if (auth !== 'none')
        structureLines.push(
          `│   ├── ${auth === 'firebase' ? 'context/' : 'auth/'}               # Authentication helpers`,
        );
      if (database === 'prisma')
        structureLines.push(
          `│   ├── prisma/              # Prisma schema & migrations`,
        );
      if (database === 'drizzle')
        structureLines.push(
          `│   ├── db/                  # Drizzle schema & config`,
        );
      if (state !== 'none')
        structureLines.push(
          `│   ├── store/               # ${stateNames[state] || state} store`,
        );
      if (api === 'trpc')
        structureLines.push(
          `│   ├── server/              # tRPC router & procedures`,
        );
      if (i18n !== 'none')
        structureLines.push(
          `│   ├── messages/            # Translation JSON files`,
        );
    } else {
      structureLines.push(
        `├── ${router === 'app' ? 'app/' : 'pages/'}                    # ${router === 'app' ? 'App Router pages & layouts' : 'Pages Router views'}`,
      );
      structureLines.push(
        `├── components/              # Reusable UI components`,
      );
      structureLines.push(
        `├── lib/                     # Utility functions & shared logic`,
      );
    }
    if (features?.docker)
      structureLines.push(
        `├── Dockerfile               # Production Docker image`,
      );
    if (features?.docker)
      structureLines.push(
        `├── docker-compose.yml       # Docker Compose config`,
      );
    if (features?.storybook)
      structureLines.push(
        `├── .storybook/              # Storybook configuration`,
      );
    structureLines.push(
      `├── .env.example             # Required env variables`,
    );
    structureLines.push(`└── package.json`);

    readmeContent += `
## Project Structure

\`\`\`
${structureLines.join('\n')}
\`\`\`
`;

    // ═════════════════════════════════════════════════════════════════
    //  Integration Setup Sections
    // ═════════════════════════════════════════════════════════════════

    // ── Auth ─────────────────────────────────────────────────────────
    if (auth === 'authjs') {
      readmeContent += `
## 🔐 Authentication — Auth.js (v5)

1. Generate a secret:
   \`\`\`bash
   npx auth secret
   \`\`\`
2. Add the following to \`.env.local\`:
   \`\`\`env
   AUTH_SECRET=<generated_secret>
   AUTH_URL=http://localhost:3000
   \`\`\`
3. Configure your OAuth providers in \`auth.ts\` (Google, GitHub, etc.).

📖 [Auth.js Documentation](https://authjs.dev/)
`;
    } else if (auth === 'next-auth') {
      readmeContent += `
## 🔐 Authentication — NextAuth.js (v4)

1. Add the following to \`.env.local\`:
   \`\`\`env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<random_string>
   \`\`\`
   Generate a secret with: \`openssl rand -base64 32\`
2. Configure your providers in \`[...nextauth].ts\`.

📖 [NextAuth.js Documentation](https://next-auth.js.org/)
`;
    } else if (auth === 'clerk') {
      readmeContent += `
## 🔐 Authentication — Clerk

1. Create a Clerk application at [clerk.com](https://clerk.com).
2. Add the following to \`.env.local\`:
   \`\`\`env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   \`\`\`
3. The \`<ClerkProvider>\` is already wired up in the providers component.

📖 [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
`;
    } else if (auth === 'supabase') {
      readmeContent += `
## 🔐 Authentication — Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Add the following to \`.env.local\`:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
   \`\`\`
3. The Supabase client is initialised in \`lib/supabase.ts\`.

📖 [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
`;
    } else if (auth === 'firebase') {
      readmeContent += `
## 🔐 Authentication — Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable Authentication and your preferred sign-in methods.
3. Add the following to \`.env.local\`:
   \`\`\`env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   \`\`\`
4. The \`AuthContextProvider\` is already wired up in the providers component.

📖 [Firebase Auth Docs](https://firebase.google.com/docs/auth)
`;
    } else if (auth === 'better-auth') {
      readmeContent += `
## 🔐 Authentication — Better Auth

1. Follow the Better Auth setup guide for your preferred strategy.
2. Add the required env variables to \`.env.local\`.

📖 [Better Auth Documentation](https://www.better-auth.com/)
`;
    }

    // ── Database ─────────────────────────────────────────────────────
    if (database === 'prisma') {
      readmeContent += `
## 🗄️ Database — Prisma

| Command | Description |
| --- | --- |
| \`npx prisma generate\` | Regenerate the Prisma client after schema changes |
| \`npx prisma migrate dev --name <name>\` | Create and apply a new migration |
| \`npx prisma studio\` | Open the visual database editor |
| \`npx prisma db seed\` | Run the seed script (if configured) |

**Environment variable:**

\`\`\`env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
\`\`\`

📖 [Prisma with Next.js](https://www.prisma.io/nextjs)
`;
    } else if (database === 'drizzle') {
      readmeContent += `
## 🗄️ Database — Drizzle ORM

| Command | Description |
| --- | --- |
| \`npm run db:push\` | Push schema changes to the database |
| \`npm run db:studio\` | Open Drizzle Studio (if script is configured) |
| \`npx drizzle-kit generate\` | Generate SQL migration files |

**Environment variable:**

\`\`\`env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
\`\`\`

📖 [Drizzle ORM Docs](https://orm.drizzle.team/)
`;
    } else if (database === 'mongoose') {
      readmeContent += `
## 🗄️ Database — Mongoose

The MongoDB connection is initialised in \`lib/mongodb.ts\`. Models are defined in the \`models/\` directory.

**Environment variable:**

\`\`\`env
MONGODB_URI="mongodb://localhost:27017/mydb"
\`\`\`

📖 [Mongoose Documentation](https://mongoosejs.com/docs/)
`;
    } else if (database === 'firebase') {
      readmeContent += `
## 🗄️ Database — Firebase (Firestore)

Firestore is configured via the same Firebase project as Authentication. See the Firebase Auth section above for env variables.

📖 [Firestore Documentation](https://firebase.google.com/docs/firestore)
`;
    }

    // ── API Layer ────────────────────────────────────────────────────
    if (api === 'trpc') {
      readmeContent += `
## 🔌 API Layer — tRPC

tRPC is set up with end-to-end type safety.

- **Server router**: \`${srcDir ? 'src/' : ''}server/routers/\`
- **Client hook**: import from \`@/lib/trpc\`

No additional env variables are required for tRPC itself.

📖 [tRPC Documentation](https://trpc.io/docs)
`;
    } else if (api === 'graphql') {
      readmeContent += `
## 🔌 API Layer — GraphQL

GraphQL is set up with [graphql-yoga](https://the-guild.dev/graphql/yoga-server).

- **Schema & resolvers**: \`${srcDir ? 'src/' : ''}${router === 'app' ? 'app/api/graphql/' : 'pages/api/graphql.ts'}\`
- **Endpoint**: \`/api/graphql\`

📖 [graphql-yoga Docs](https://the-guild.dev/graphql/yoga-server/docs)
`;
    }

    // ── State Management ─────────────────────────────────────────────
    if (state === 'zustand') {
      readmeContent += `
## 🧠 State Management — Zustand

Stores are located in \`${srcDir ? 'src/' : ''}store/\`. Import and use them directly in your components:

\`\`\`tsx
import { useStore } from '@/store/store';

function MyComponent() {
  const { count, increment } = useStore();
  return <button onClick={increment}>{count}</button>;
}
\`\`\`

📖 [Zustand Documentation](https://docs.pmnd.rs/zustand)
`;
    } else if (state === 'redux') {
      readmeContent += `
## 🧠 State Management — Redux Toolkit

The Redux store is configured in \`${srcDir ? 'src/' : ''}store/store.ts\`. Slices live alongside in the \`store/\` directory.

📖 [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
`;
    } else if (state === 'jotai') {
      readmeContent += `
## 🧠 State Management — Jotai

Atoms are defined in \`${srcDir ? 'src/' : ''}store/\`. Use them with the \`useAtom\` hook:

\`\`\`tsx
import { useAtom } from 'jotai';
import { countAtom } from '@/store/atoms';

function MyComponent() {
  const [count, setCount] = useAtom(countAtom);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
\`\`\`

📖 [Jotai Documentation](https://jotai.org/)
`;
    }

    // ── Payment ──────────────────────────────────────────────────────
    if (payment === 'stripe') {
      readmeContent += `
## 💳 Payments — Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com).
2. Add the following to \`.env.local\`:
   \`\`\`env
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   \`\`\`
3. For local webhook testing, use the Stripe CLI:
   \`\`\`bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   \`\`\`

📖 [Stripe Next.js Integration](https://stripe.com/docs/stripe-js/react)
`;
    } else if (payment === 'lemonsqueezy') {
      readmeContent += `
## 💳 Payments — Lemon Squeezy

1. Create a Lemon Squeezy account at [lemonsqueezy.com](https://www.lemonsqueezy.com).
2. Add the following to \`.env.local\`:
   \`\`\`env
   LEMONSQUEEZY_API_KEY=...
   LEMONSQUEEZY_STORE_ID=...
   LEMONSQUEEZY_WEBHOOK_SECRET=...
   \`\`\`

📖 [Lemon Squeezy Docs](https://docs.lemonsqueezy.com/)
`;
    } else if (payment === 'paddle') {
      readmeContent += `
## 💳 Payments — Paddle

1. Create a Paddle account at [paddle.com](https://www.paddle.com).
2. Add the required API keys to \`.env.local\`.

📖 [Paddle Developer Docs](https://developer.paddle.com/)
`;
    } else if (payment === 'dodo') {
      readmeContent += `
## 💳 Payments — Dodo Payments

1. Create a Dodo Payments account.
2. Add the required API keys to \`.env.local\`.

📖 [Dodo Payments Documentation](https://dodopayments.com/docs)
`;
    } else if (payment === 'polar') {
      readmeContent += `
## 💳 Payments — Polar

1. Create a Polar account at [polar.sh](https://polar.sh).
2. Add the required API keys to \`.env.local\`.

📖 [Polar Documentation](https://docs.polar.sh/)
`;
    }

    // ── AI ────────────────────────────────────────────────────────────
    if (ai === 'vercel-ai-sdk') {
      readmeContent += `
## 🤖 AI — Vercel AI SDK

1. Add your OpenAI key (or another supported provider) to \`.env.local\`:
   \`\`\`env
   OPENAI_API_KEY=sk-...
   \`\`\`
2. The AI route handler is located at \`${srcDir ? 'src/' : ''}${router === 'app' ? 'app/api/chat/route.ts' : 'pages/api/chat.ts'}\`.
3. Use the \`useChat\` or \`useCompletion\` hooks on the client:
   \`\`\`tsx
   import { useChat } from 'ai/react';

   export default function Chat() {
     const { messages, input, handleInputChange, handleSubmit } = useChat();
     // ...
   }
   \`\`\`

📖 [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
`;
    }

    // ── Monitoring ───────────────────────────────────────────────────
    if (monitoring === 'sentry') {
      readmeContent += `
## 📊 Monitoring — Sentry

1. Create a Sentry project at [sentry.io](https://sentry.io).
2. Add the following to \`.env.local\`:
   \`\`\`env
   SENTRY_DSN=https://<key>@sentry.io/<project>
   \`\`\`
3. Sentry is initialised in \`sentry.client.config.ts\` and \`sentry.server.config.ts\`.

📖 [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
`;
    } else if (monitoring === 'posthog') {
      readmeContent += `
## 📊 Analytics — PostHog

1. Create a PostHog project at [posthog.com](https://posthog.com).
2. Add the following to \`.env.local\`:
   \`\`\`env
   NEXT_PUBLIC_POSTHOG_KEY=phc_...
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   \`\`\`
3. The PostHog provider is wired up in the providers component.

📖 [PostHog Next.js Docs](https://posthog.com/docs/libraries/next-js)
`;
    } else if (monitoring === 'logrocket') {
      readmeContent += `
## 📊 Monitoring — LogRocket

1. Create a LogRocket project at [logrocket.com](https://logrocket.com).
2. Update the App ID in the LogRocket provider component.

📖 [LogRocket Documentation](https://docs.logrocket.com/)
`;
    } else if (monitoring === 'google-analytics') {
      readmeContent += `
## 📊 Analytics — Google Analytics

1. Create a GA4 property at [analytics.google.com](https://analytics.google.com).
2. Add the following to \`.env.local\`:
   \`\`\`env
   NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   \`\`\`
3. The \`<GoogleAnalytics>\` component is already included in your root layout.

📖 [Next.js Third-Party Libraries](https://nextjs.org/docs/messages/next-script-for-ga)
`;
    } else if (monitoring === 'vercel-analytics') {
      readmeContent += `
## 📊 Analytics — Vercel Analytics

Vercel Analytics is zero-config on Vercel deployments. The \`<Analytics />\` component is already included in your root layout.

For local development, analytics events are logged to the console.

📖 [Vercel Analytics Docs](https://vercel.com/docs/analytics)
`;
    }

    // ── I18n ─────────────────────────────────────────────────────────
    if (i18n === 'next-intl') {
      readmeContent += `
## 🌐 Internationalization — next-intl

**Configured locales:** ${supportedLocales.join(', ')}

- Translation files are in \`messages/\` (e.g. \`messages/en.json\`).
- Use the \`useTranslations\` hook in components:
  \`\`\`tsx
  import { useTranslations } from 'next-intl';

  export default function MyPage() {
    const t = useTranslations('MyNamespace');
    return <h1>{t('title')}</h1>;
  }
  \`\`\`
${i18nRouting === 'prefix' ? '- Locale prefixed routes are enabled (e.g. `/en/about`, `/ar/about`).' : '- Locale detection is enabled without URL prefixes.'}

📖 [next-intl Documentation](https://next-intl-docs.vercel.app/)
`;
    } else if (i18n === 'react-i18next') {
      readmeContent += `
## 🌐 Internationalization — react-i18next

- Translation files are in the \`locales/\` directory.
- Use the \`useTranslation\` hook in components:
  \`\`\`tsx
  import { useTranslation } from 'react-i18next';

  export default function MyPage() {
    const { t } = useTranslation();
    return <h1>{t('title')}</h1>;
  }
  \`\`\`

📖 [react-i18next Documentation](https://react.i18next.com/)
`;
    }

    // ── SEO ──────────────────────────────────────────────────────────
    if (seo) {
      readmeContent += `
## 🔍 SEO — next-sitemap

A sitemap is automatically generated at build time.

- Config file: \`next-sitemap.config.js\`
- After building, the sitemap is available at \`/sitemap.xml\`.

\`\`\`bash
npm run build
# sitemap generated at public/sitemap.xml
\`\`\`

📖 [next-sitemap Documentation](https://github.com/iamvishnusankar/next-sitemap)
`;
    }

    // ── Testing ──────────────────────────────────────────────────────
    if (testing) {
      readmeContent += `
## 🧪 Testing — Vitest

| Command | Description |
| --- | --- |
| \`npm run test\` | Run all tests |
| \`npm run test:watch\` | Run tests in watch mode |
| \`npm run test:coverage\` | Generate a coverage report |

Tests are written with **Vitest** and **React Testing Library**.
Place test files next to their components (e.g. \`Button.test.tsx\`) or in a \`__tests__/\` directory.

📖 [Vitest Documentation](https://vitest.dev/) · [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
`;
    }

    // ── Docker ───────────────────────────────────────────────────────
    if (features?.docker) {
      readmeContent += `
## 🐳 Docker

Build and run the production container:

\`\`\`bash
# Build the image
docker build -t ${projectName} .

# Run the container
docker run -p 3000:3000 ${projectName}
\`\`\`

Or use Docker Compose:

\`\`\`bash
docker compose up -d
\`\`\`

📖 [Next.js Docker Example](https://github.com/vercel/next.js/tree/canary/examples/with-docker)
`;
    }

    // ── Storybook ────────────────────────────────────────────────────
    if (features?.storybook) {
      readmeContent += `
## 📖 Storybook

| Command | Description |
| --- | --- |
| \`npm run storybook\` | Start Storybook dev server on port 6006 |
| \`npm run build-storybook\` | Build a static Storybook site |

Stories are located alongside components (e.g. \`Button.stories.tsx\`).

📖 [Storybook for Next.js](https://storybook.js.org/recipes/next)
`;
    }

    // ── Linter ───────────────────────────────────────────────────────
    if (linter === 'eslint') {
      readmeContent += `
## 🧹 Linting — ESLint

\`\`\`bash
npm run lint          # Check for issues
npm run lint -- --fix # Auto-fix issues
\`\`\`

📖 [ESLint Documentation](https://eslint.org/)
`;
    } else if (linter === 'biome') {
      readmeContent += `
## 🧹 Linting & Formatting — Biome

\`\`\`bash
npx @biomejs/biome check .       # Check for issues
npx @biomejs/biome check --write . # Auto-fix & format
\`\`\`

📖 [Biome Documentation](https://biomejs.dev/)
`;
    }

    // ── Deployment ───────────────────────────────────────────────────
    readmeContent += `
## 🚀 Deployment

The easiest way to deploy your Next.js app is on [Vercel](https://vercel.com/new):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Alternatively, you can deploy anywhere that supports Node.js:

\`\`\`bash
npm run build
npm start
\`\`\`
${features?.docker ? '\nOr deploy using the included Dockerfile (see the Docker section above).\n' : ''}
## Learn More

- [Next.js Documentation](https://nextjs.org/docs) — learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) — an interactive Next.js tutorial.
`;

    archive.append(Buffer.from(readmeContent), { name: 'README.md' });

    // ── Theme-aware globals.css generation ───────────────────────────
    if (features?.tailwind) {
      const themeCSS = generateThemeCSS({
        radius: themeRadius,
        baseColor: themeBaseColor as BaseColorId,
        primaryColor: themePrimaryColor as PrimaryColorId,
      });

      const lightVars = Object.entries(themeCSS.light)
        .map(([key, value]) => `  ${key}: ${value};`)
        .join('\n');

      const darkVars = Object.entries(themeCSS.dark)
        .map(([key, value]) => `  ${key}: ${value};`)
        .join('\n');

      const globalsCssContent = `@import "tailwindcss";
@import "tw-animate-css";
${features?.shadcn ? '@import "shadcn/tailwind.css";\n' : ''}
@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
}

:root {
  --radius: ${themeCSS.radius};
${lightVars}
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
${darkVars}
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply font-sans bg-background text-foreground;
  }
}
`;

      const cssPath = srcDir ? 'src/app/globals.css' : 'app/globals.css';
      if (router === 'app') {
        archive.append(Buffer.from(globalsCssContent), { name: cssPath });
      }
    }

    // ── Generate shadcn components.json if shadcn enabled ───────────
    if (features?.shadcn) {
      const componentsJsonContent = {
        $schema: 'https://ui.shadcn.com/schema.json',
        style: 'new-york',
        rsc: router === 'app',
        tsx: language === 'ts',
        tailwind: {
          css: srcDir ? 'src/app/globals.css' : 'app/globals.css',
          baseColor: themeBaseColor,
          cssVariables: true,
        },
        iconLibrary: 'lucide',
        aliases: {
          components: `${importAlias.replace('/*', '')}/components`,
          utils: `${importAlias.replace('/*', '')}/lib/utils`,
          ui: `${importAlias.replace('/*', '')}/components/ui`,
        },
      };
      archive.append(JSON.stringify(componentsJsonContent, null, 2), {
        name: 'components.json',
      });

      // Add a setup script for selected components
      if (themeComponents.length > 0) {
        const setupScript = `#!/bin/bash
# Install selected shadcn/ui components
npx shadcn@latest add ${themeComponents.join(' ')}
`;
        archive.append(Buffer.from(setupScript), {
          name: 'scripts/setup-components.sh',
        });
      }
    }


    archive.finalize();

    return new NextResponse(stream as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${projectName}.zip"`,
      },
    });
  } catch (error) {
    console.error('Generator error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
