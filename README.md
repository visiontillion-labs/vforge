# VForge

The most comprehensive boilerplate generator for Next.js. Configure your stack, customize your theme, and generate production-ready projects in seconds.

From Visiontillion Labs.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)

## Features

- **Full Stack Configuration** - Choose from 30+ integrations including auth, database, payments, state management, and more
- **Theme Customization** - Customize radius, colors, fonts, and shadcn/ui components (like the shadcn themes page)
- **Preset Templates** - Quick-start presets for SaaS, E-commerce, and Blog/CMS projects
- **Live Preview** - Real-time file tree preview as you configure
- **CLI Support** - Generate projects via `npm create vforge@latest` or download as ZIP
- **Copyable Commands** - Copy installation commands directly from the UI
- **Shareable Configs** - Share your configuration via URL

## Supported Integrations

| Category | Options |
|----------|---------|
| **Authentication** | Auth.js, NextAuth.js, Clerk, Supabase, Firebase, Better Auth |
| **Database** | Prisma, Drizzle ORM, Mongoose, Firebase Firestore |
| **API Layer** | tRPC, GraphQL |
| **State Management** | Zustand, Redux Toolkit, Jotai |
| **Payments** | Stripe, LemonSqueezy, Paddle, Dodo Payments, Polar |
| **AI** | Vercel AI SDK |
| **Monitoring** | Sentry, PostHog, LogRocket, Google Analytics, Vercel Analytics |
| **i18n** | next-intl, react-i18next |
| **SEO** | next-sitemap |
| **Testing** | Vitest |
| **DevOps** | Docker, Storybook |

## Quick Start

### Using the CLI

```bash
npm create vforge@latest my-app
```

Or with a preset:

```bash
npx create-vforge my-app --preset saas
```

### Using the Web App

Visit [vforge.dev](https://vforge.dev) to configure and download your boilerplate.

## Development

### Prerequisites

- Node.js 18.x or later
- npm, yarn, pnpm, or bun

### Setup

```bash
# Clone the repository
git clone https://github.com/Visiontillion/forge.git
cd forge

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables (Optional)

Create a `.env.local` file for analytics:

```
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your-domain.com
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Forms:** React Hook Form + Zod
- **Analytics:** Plausible + PostHog
- **Archiving:** Archiver (ZIP generation)

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com) for the incredible component library
- [Next.js](https://nextjs.org) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
