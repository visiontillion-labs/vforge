# CLI Setup & Publishing Guide

Complete guide to build, test, and publish `create-vforge-app` so users can run `npx create-vforge-app my-app`.

---

## How It Works

```
User runs: npx create-vforge-app my-app
                    │
                    ▼
        cli/src/index.ts (commander)
           │
           ├── --yes flag? → Use defaults
           ├── --preset?   → Load preset from presets.ts
           └── Otherwise   → Interactive prompts (prompts.ts)
                    │
                    ▼
        cli/src/generator.ts
           │
           ├── POST config JSON to https://vforge.dev/api/generate
           │         (or VFORGE_API_URL env var if set)
           │
           ▼
        Next.js API route (src/app/api/generate/route.ts)
           │
           ├── Reads template files from src/templates/
           ├── Assembles ZIP with all selected features
           ├── Generates package.json, README, .env.example, globals.css
           │
           ▼
        CLI receives ZIP → Extracts to ./my-app/ → Prints next steps
```

> **Key Point:** The CLI is a thin client. It sends the user's configuration to your deployed `/api/generate` endpoint and downloads the resulting ZIP. The API must be live for the CLI to work.

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- An [npm](https://www.npmjs.com/) account (for publishing)
- Your Next.js web app deployed with `/api/generate` accessible

---

## Step 1: Deploy Your Next.js App

The CLI calls your API at the URL defined in `cli/src/generator.ts`:

```ts
const API_URL = process.env.VFORGE_API_URL || 'https://vforge.dev';
```

### Option A: Deploy to Vercel (Recommended)

1. Push your repo to GitHub: `https://github.com/Visiontillion/forge`
2. Go to [vercel.com/new](https://vercel.com/new) and import your repo
3. Deploy — Vercel will auto-detect Next.js
4. Once deployed, your API is live at `https://your-domain.vercel.app/api/generate`
5. (Optional) Add a custom domain like `vforge.dev` in Vercel dashboard → Settings → Domains

### Option B: Any Other Host

Deploy anywhere that supports Next.js (Railway, Render, AWS, etc.) and ensure `/api/generate` returns a ZIP when POSTed to.

### Verify the API Works

```bash
curl -X POST https://your-deployed-url/api/generate \
  -H "Content-Type: application/json" \
  -d '{"projectName":"test","router":"app","language":"ts","linter":"eslint","srcDir":true,"importAlias":"@/*","features":{"tailwind":true,"shadcn":false,"reactCompiler":false,"docker":false,"git":true,"storybook":false},"auth":"none","database":"none","api":"none","state":"none","payment":"none","ai":"none","monitoring":"none","i18n":"none","seo":false,"testing":false,"theme":{"radius":0.5,"baseColor":"neutral","primaryColor":"default","font":"geist","components":[]}}' \
  -o test.zip
```

If `test.zip` downloads successfully, the API is working.

---

## Step 2: Update the API URL (if needed)

If your deployed domain is not `vforge.dev`, update the default in `cli/src/generator.ts`:

```ts
const API_URL = process.env.VFORGE_API_URL || 'https://your-actual-domain.com';
```

---

## Step 3: Build the CLI

```bash
cd cli
npm install
npm run build
```

This compiles TypeScript to `cli/dist/index.js` using `tsup`.

---

## Step 4: Test Locally

### 4a. Run directly

```bash
cd cli
node dist/index.js my-test-app
```

### 4b. Use `npm link` for global testing

```bash
cd cli
npm link
```

Now from **any directory**:

```bash
create-vforge-app my-test-app
```

### 4c. Test against your local dev server

First, start the Next.js dev server in the root:

```bash
# In the project root
npm run dev
```

Then in another terminal:

**macOS / Linux:**

```bash
VFORGE_API_URL=http://localhost:3000 create-vforge-app my-test-app
```

**Windows PowerShell:**

```powershell
$env:VFORGE_API_URL="http://localhost:3000"; create-vforge-app my-test-app
```

**Windows CMD:**

```cmd
set VFORGE_API_URL=http://localhost:3000 && create-vforge-app my-test-app
```

### 4d. Test all modes

```bash
# Interactive mode (prompts for everything)
create-vforge-app

# With a preset
create-vforge-app my-saas --preset saas

# Skip prompts, use defaults
create-vforge-app my-app -y

# Specific flags
create-vforge-app my-app --auth clerk --database prisma

# JavaScript instead of TypeScript
create-vforge-app my-app --javascript

# Pages Router
create-vforge-app my-app --router pages
```

### 4e. Unlink after testing

```bash
cd cli
npm unlink -g
```

---

## Step 5: Publish to npm

### 5a. Check package name availability

Visit: https://www.npmjs.com/package/create-vforge-app

If the name is taken, change it in `cli/package.json`:

```json
{
  "name": "create-vforge-app"
}
```

### 5b. Login to npm

```bash
npm login
```

### 5c. Publish

```bash
cd cli
npm publish
```

The `prepublishOnly` script automatically runs `npm run build` before publishing.

### 5d. Verify it works

```bash
# From any machine / directory
npx create-vforge-app my-app
```

---

## Step 6: Releasing Updates

### Bump version and publish

```bash
cd cli

# Patch release (1.0.0 → 1.0.1) — bug fixes
npm version patch

# Minor release (1.0.0 → 1.1.0) — new features
npm version minor

# Major release (1.0.0 → 2.0.0) — breaking changes
npm version major

# Publish the new version
npm publish
```

### What to update when adding features

| Change | Files to Update |
|--------|----------------|
| New auth provider | `cli/src/prompts.ts` (add choice), `cli/src/presets.ts` (update interface), `src/app/api/generate/route.ts` (add template logic) |
| New database option | Same as above |
| New payment/AI/monitoring option | Same as above |
| New CLI flag | `cli/src/index.ts` (add `.option()`), update defaults in `-y` mode |
| New preset template | `cli/src/presets.ts` (add to `presets` array) |

---

## Deployment Checklist

- [ ] Next.js app deployed and accessible
- [ ] `/api/generate` endpoint returns ZIP correctly
- [ ] `API_URL` in `generator.ts` points to deployed domain
- [ ] `src/templates/` directory exists with all template files on the server
- [ ] CLI builds without errors (`npm run build` in `cli/`)
- [ ] Local testing works (`npm link` → `create-vforge-app my-app`)
- [ ] npm account created and logged in (`npm login`)
- [ ] Package name `create-vforge-app` is available on npm
- [ ] Published to npm (`npm publish`)
- [ ] `npx create-vforge-app my-app` works from a clean machine

---

## Troubleshooting

### "Could not connect to the API"

The CLI can't reach your `/api/generate` endpoint. Check:

- Is the Next.js app deployed and running?
- Is the URL correct in `generator.ts`?
- Try setting the env var: `VFORGE_API_URL=https://your-url.com`

### "API responded with status 500"

The API crashed while generating. Check:

- Server logs on Vercel/your host
- Does `src/templates/` exist in the deployed build?
- Are all template files committed to git?

### "Could not extract ZIP file"

The ZIP extraction failed. The CLI tries:

1. PowerShell `Expand-Archive` (Windows)
2. `unzip` (macOS/Linux)
3. `tar` (fallback)

Make sure one of these is available on the user's system.

### "Directory already exists and is not empty"

The target folder already has files. Either delete it or choose a different project name.

### npm publish fails with 403

- Make sure you're logged in: `npm whoami`
- The package name might be taken — try a scoped name: `@visiontillion/create-vforge-app`
- If scoped, publish with: `npm publish --access public`

---

## Quick Commands Reference

```bash
# ── Development ──────────────────────────
cd cli
npm install              # Install dependencies
npm run dev              # Watch mode (rebuilds on save)
npm run build            # One-time build

# ── Local Testing ────────────────────────
npm link                 # Link globally
create-vforge-app my-app # Test the CLI
npm unlink -g            # Remove global link

# ── Publishing ───────────────────────────
npm login                # Login to npm
npm publish              # Publish to registry
npm version patch        # Bump version 1.0.0 → 1.0.1
npm version minor        # Bump version 1.0.0 → 1.1.0

# ── Debugging ────────────────────────────
VFORGE_API_URL=http://localhost:3000 create-vforge-app test  # Test against local
node dist/index.js test --yes                                # Quick test with defaults
```
