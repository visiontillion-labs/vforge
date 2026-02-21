# Contributing to Oriums

Thank you for your interest in contributing to Oriums! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 18.x or later
- npm, yarn, pnpm, or bun

### Getting Started

1. Fork the repository
2. Clone your fork:

```bash
git clone https://github.com/<your-username>/oriums-boilerplate.git
cd oriums-boilerplate
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env.local` file (optional, for analytics):

```
NEXT_PUBLIC_POSTHOG_KEY=your_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your-domain.com
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
oriums-boilerplate/
├── src/
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   └── providers/       # Context providers
│   ├── lib/                 # Utilities and helpers
│   ├── hooks/               # Custom React hooks
│   └── templates/           # Boilerplate template files
├── cli/                     # CLI package (create-oriums-app)
└── public/                  # Static assets
```

## How to Contribute

### Reporting Bugs

- Use the [Bug Report](https://github.com/Oriums/oriums-boilerplate/issues/new?template=bug_report.md) issue template
- Include steps to reproduce
- Include expected vs actual behavior
- Include screenshots if applicable

### Suggesting Features

- Use the [Feature Request](https://github.com/Oriums/oriums-boilerplate/issues/new?template=feature_request.md) issue template
- Describe the use case clearly
- Explain why this feature would be useful

### Submitting Pull Requests

1. Create a new branch from `master`:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes following the coding guidelines below
3. Test your changes locally
4. Commit with clear, descriptive messages:

```bash
git commit -m "feat: add new auth provider template"
```

5. Push to your fork and open a PR against `master`

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Coding Guidelines

- Use TypeScript for all new code
- Follow the existing code style (Prettier + ESLint)
- Use shadcn/ui components for UI elements
- Keep components small and focused
- Add proper TypeScript types (avoid `any`)
- Use meaningful variable and function names

## Adding New Templates

Templates live in `src/templates/`. To add a new integration:

1. Create template files in the appropriate `extras/` subdirectory
2. Update the form schema in `src/components/generator-form.tsx`
3. Add generation logic in `src/app/api/generate/route.ts`
4. Update the tree preview in `src/lib/generate-tree-data.ts`
5. Add relevant dependencies to the generated `package.json`

## Questions?

Feel free to open an issue or start a discussion if you have questions about contributing.
