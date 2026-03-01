# create-vforge

The CLI companion for [VForge](https://vforge.dev) - generate production-ready Next.js boilerplate projects from your terminal.

## Usage

```bash
npm create vforge@latest my-app
```

### With Presets

```bash
# SaaS starter with auth, payments, DB & monitoring
npx create-vforge my-saas --preset saas

# E-commerce with payments & i18n
npx create-vforge my-store --preset ecommerce

# Blog/CMS with SEO & AI
npx create-vforge my-blog --preset blog
```

### Interactive Mode

Running without flags will start interactive prompts:

```bash
npm create vforge@latest
```

You'll be guided through:

1. Project name
2. Template preset (or custom configuration)
3. Language (TypeScript/JavaScript)
4. Router (App/Pages)
5. Authentication provider
6. Database ORM
7. API layer
8. State management
9. Payment gateway
10. Additional features

## Options

| Flag | Description |
|------|-------------|
| `--preset <name>` | Use a preset template (saas, ecommerce, blog) |
| `--router <type>` | Router type: app or pages |
| `--javascript` | Use JavaScript instead of TypeScript |
| `--auth <provider>` | Auth provider (authjs, clerk, supabase, etc.) |
| `--database <orm>` | Database ORM (prisma, drizzle, mongoose, etc.) |
| `-y, --yes` | Skip prompts and use defaults |

## License

MIT
