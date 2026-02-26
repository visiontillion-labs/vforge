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

interface ManualStep {
  label: string;
  command: string;
  description?: string;
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
  if (values.database !== 'none')
    cliFlags.push(`--database ${values.database}`);

  const cliCommand = `npx create-forge-app ${values.projectName}${cliFlags.length ? ' ' + cliFlags.join(' ') : ''}`;

  // ── Manual steps ────────────────────────────────────────────────
  const steps: ManualStep[] = [];

  // ━━ 1. Create Next.js project ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

  // ━━ 2. Navigate ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  steps.push({
    label: 'Navigate to project',
    command: `cd ${values.projectName}`,
  });

  // ━━ 3. Core dependencies ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const deps: string[] = [];

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

  const dbDeps: Record<string, string[]> = {
    prisma: ['@prisma/client'],
    drizzle: ['drizzle-orm', 'drizzle-kit', 'postgres'],
    mongoose: ['mongoose'],
    firebase: ['firebase', 'firebase-admin'],
  };
  if (values.database !== 'none' && dbDeps[values.database]) {
    const newDeps = dbDeps[values.database].filter((d) => !deps.includes(d));
    deps.push(...newDeps);
  }

  if (values.api === 'trpc') {
    deps.push(
      '@trpc/server',
      '@trpc/client',
      '@trpc/react-query',
      '@tanstack/react-query',
      'superjson',
    );
  } else if (values.api === 'graphql') {
    deps.push('@apollo/server', '@apollo/client', 'graphql');
  }

  const stateDeps: Record<string, string[]> = {
    zustand: ['zustand'],
    redux: ['@reduxjs/toolkit', 'react-redux'],
    jotai: ['jotai'],
  };
  if (values.state !== 'none' && stateDeps[values.state]) {
    deps.push(...stateDeps[values.state]);
  }

  const paymentDeps: Record<string, string[]> = {
    stripe: ['stripe', '@stripe/stripe-js'],
    lemonsqueezy: ['@lemonsqueezy/lemonsqueezy.js'],
    paddle: ['@paddle/paddle-node-sdk', '@paddle/paddle-js'],
    dodo: ['dodopayments'],
    polar: ['@polar-sh/sdk'],
  };
  if (values.payment !== 'none' && paymentDeps[values.payment]) {
    deps.push(...paymentDeps[values.payment]);
  }

  if (values.ai === 'vercel-ai-sdk') {
    deps.push('ai', '@ai-sdk/openai');
  }

  const monitoringDeps: Record<string, string[]> = {
    sentry: ['@sentry/nextjs'],
    posthog: ['posthog-js', 'posthog-node'],
    logrocket: ['logrocket'],
    'google-analytics': ['@next/third-parties'],
    'vercel-analytics': ['@vercel/analytics', '@vercel/speed-insights'],
  };
  if (values.monitoring !== 'none' && monitoringDeps[values.monitoring]) {
    deps.push(...monitoringDeps[values.monitoring]);
  }

  if (values.i18n === 'next-intl') {
    deps.push('next-intl');
  } else if (values.i18n === 'react-i18next') {
    deps.push('react-i18next', 'i18next', 'i18next-resources-to-backend');
  }

  if (values.seo) {
    deps.push('next-sitemap');
  }

  if (deps.length > 0) {
    steps.push({
      label: 'Install dependencies',
      command: `npm install ${deps.join(' ')}`,
    });
  }

  // ━━ 4. Dev dependencies ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const devDeps: string[] = [];
  if (values.database === 'prisma') devDeps.push('prisma');
  if (values.testing)
    devDeps.push(
      'vitest',
      '@vitejs/plugin-react',
      '@testing-library/react',
      '@testing-library/jest-dom',
      'jsdom',
    );
  if (values.linter === 'biome') devDeps.push('@biomejs/biome');
  if (values.features.reactCompiler)
    devDeps.push('babel-plugin-react-compiler');

  if (devDeps.length > 0) {
    steps.push({
      label: 'Install dev dependencies',
      command: `npm install -D ${devDeps.join(' ')}`,
    });
  }

  // ━━ 5. Git init ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (values.features.git) {
    steps.push({
      label: 'Initialize Git repository',
      command:
        'git init && git add -A && git commit -m "Initial commit from Forge"',
    });
  }

  // ━━ 6. Linter setup ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (values.linter === 'biome') {
    steps.push({
      label: 'Initialize Biome linter',
      command: 'npx @biomejs/biome init',
    });
  }

  // ━━ 7. shadcn/ui setup ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

  // ━━ 8. Database setup ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (values.database === 'prisma') {
    const srcPrefix = values.srcDir ? 'src/' : '';

    steps.push({
      label: 'Initialize Prisma',
      command: 'npx prisma init',
    });

    steps.push({
      label: 'Create Prisma client helper',
      command:
        platformAwareMkdir(`${srcPrefix}lib`) +
        ` && cat > ${srcPrefix}lib/prisma.${values.language === 'ts' ? 'ts' : 'js'} << 'PRISMAEOF'
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
PRISMAEOF`,
    });

    steps.push({
      label: 'Run Prisma migrations (after editing schema)',
      command: 'npx prisma migrate dev --name init',
    });
  } else if (values.database === 'drizzle') {
    const srcPrefix = values.srcDir ? 'src/' : '';

    steps.push({
      label: 'Create Drizzle config',
      command: `cat > drizzle.config.${values.language === 'ts' ? 'ts' : 'js'} << 'DRIZZLEEOF'
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./${srcPrefix}lib/db/schema.${values.language === 'ts' ? 'ts' : 'js'}",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
DRIZZLEEOF`,
    });

    steps.push({
      label: 'Create Drizzle schema',
      command:
        platformAwareMkdir(`${srcPrefix}lib/db`) +
        ` && cat > ${srcPrefix}lib/db/schema.${values.language === 'ts' ? 'ts' : 'js'} << 'SCHEMAEOF'
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
SCHEMAEOF`,
    });

    steps.push({
      label: 'Create Drizzle client',
      command: `cat > ${srcPrefix}lib/db/index.${values.language === 'ts' ? 'ts' : 'js'} << 'CLIENTEOF'
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)
export const db = drizzle(client, { schema })
CLIENTEOF`,
    });

    steps.push({
      label: 'Generate Drizzle migrations',
      command: 'npx drizzle-kit generate',
    });
  } else if (values.database === 'mongoose') {
    const srcPrefix = values.srcDir ? 'src/' : '';

    steps.push({
      label: 'Create MongoDB connection helper',
      command:
        platformAwareMkdir(`${srcPrefix}lib`) +
        ` && cat > ${srcPrefix}lib/mongodb.${values.language === 'ts' ? 'ts' : 'js'} << 'MONGOEOF'
import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

let cached = (global as any).mongoose
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose)
  }
  cached.conn = await cached.promise
  return cached.conn
}

export default dbConnect
MONGOEOF`,
    });
  }

  // ━━ 9. Auth setup ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (values.auth === 'authjs') {
    const srcPrefix = values.srcDir ? 'src/' : '';

    steps.push({
      label: 'Create Auth.js config',
      command: `cat > ${srcPrefix}auth.${values.language === 'ts' ? 'ts' : 'js'} << 'AUTHEOF'
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
})
AUTHEOF`,
    });

    steps.push({
      label: 'Create Auth.js API route',
      command:
        platformAwareMkdir(`${srcPrefix}app/api/auth/[...nextauth]`) +
        ` && cat > ${srcPrefix}app/api/auth/[...nextauth]/route.${values.language === 'ts' ? 'ts' : 'js'} << 'ROUTEEOF'
import { handlers } from "${values.importAlias.replace('*', '')}auth"
export const { GET, POST } = handlers
ROUTEEOF`,
    });

    steps.push({
      label: 'Create Auth.js middleware',
      command: `cat > ${srcPrefix}middleware.${values.language === 'ts' ? 'ts' : 'js'} << 'MIDDLEWAREEOF'
export { auth as middleware } from "${values.importAlias.replace('*', '')}auth"

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
MIDDLEWAREEOF`,
    });
  } else if (values.auth === 'next-auth') {
    const srcPrefix = values.srcDir ? 'src/' : '';

    steps.push({
      label: 'Create NextAuth config',
      command:
        platformAwareMkdir(`${srcPrefix}app/api/auth/[...nextauth]`) +
        ` && cat > ${srcPrefix}app/api/auth/[...nextauth]/route.${values.language === 'ts' ? 'ts' : 'js'} << 'NAEOF'
import NextAuth from "next-auth"
import GitHubProvider from "next-auth/providers/github"

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
})

export { handler as GET, handler as POST }
NAEOF`,
    });
  } else if (values.auth === 'clerk') {
    const srcPrefix = values.srcDir ? 'src/' : '';

    steps.push({
      label: 'Create Clerk middleware',
      command: `cat > ${srcPrefix}middleware.${values.language === 'ts' ? 'ts' : 'js'} << 'CLERKEOF'
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ["/((?!.*\\\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
CLERKEOF`,
    });

    steps.push({
      label: 'Wrap layout with ClerkProvider',
      description:
        'Add <ClerkProvider> around {children} in your root layout.tsx',
      command: `echo "Wrap your root layout with <ClerkProvider> from '@clerk/nextjs'"`,
    });
  } else if (values.auth === 'supabase') {
    const srcPrefix = values.srcDir ? 'src/' : '';

    steps.push({
      label: 'Create Supabase client utilities',
      command:
        platformAwareMkdir(`${srcPrefix}lib/supabase`) +
        ` && cat > ${srcPrefix}lib/supabase/client.${values.language === 'ts' ? 'ts' : 'js'} << 'SUPACEOF'
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
SUPACEOF`,
    });

    steps.push({
      label: 'Create Supabase server client',
      command: `cat > ${srcPrefix}lib/supabase/server.${values.language === 'ts' ? 'ts' : 'js'} << 'SUPASEOF'
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { /* Server Component — ignored */ }
        },
      },
    }
  )
}
SUPASEOF`,
    });

    steps.push({
      label: 'Create Supabase middleware',
      command: `cat > ${srcPrefix}middleware.${values.language === 'ts' ? 'ts' : 'js'} << 'SUPAMEOF'
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  await supabase.auth.getUser()
  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
SUPAMEOF`,
    });
  } else if (values.auth === 'better-auth') {
    const srcPrefix = values.srcDir ? 'src/' : '';

    steps.push({
      label: 'Create Better Auth config',
      command:
        platformAwareMkdir(`${srcPrefix}lib`) +
        ` && cat > ${srcPrefix}lib/auth.${values.language === 'ts' ? 'ts' : 'js'} << 'BAEOF'
import { betterAuth } from "better-auth"

export const auth = betterAuth({
  database: {
    provider: "pg",
    url: process.env.DATABASE_URL!,
  },
  emailAndPassword: {
    enabled: true,
  },
})
BAEOF`,
    });

    steps.push({
      label: 'Create Better Auth client',
      command: `cat > ${srcPrefix}lib/auth-client.${values.language === 'ts' ? 'ts' : 'js'} << 'BACEOF'
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
})

export const { signIn, signOut, signUp, useSession } = authClient
BACEOF`,
    });

    steps.push({
      label: 'Create Better Auth API route',
      command:
        platformAwareMkdir(`${srcPrefix}app/api/auth/[...all]`) +
        ` && cat > ${srcPrefix}app/api/auth/[...all]/route.${values.language === 'ts' ? 'ts' : 'js'} << 'BAREOF'
import { auth } from "${values.importAlias.replace('*', '')}lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth)
BAREOF`,
    });
  } else if (values.auth === 'firebase') {
    const srcPrefix = values.srcDir ? 'src/' : '';

    steps.push({
      label: 'Create Firebase client config',
      command:
        platformAwareMkdir(`${srcPrefix}lib/firebase`) +
        ` && cat > ${srcPrefix}lib/firebase/config.${values.language === 'ts' ? 'ts' : 'js'} << 'FBEOF'
import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)
export default app
FBEOF`,
    });
  }

  // ━━ 10. API layer setup ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (values.api === 'trpc') {
    const srcPrefix = values.srcDir ? 'src/' : '';

    steps.push({
      label: 'Create tRPC server config',
      command:
        platformAwareMkdir(`${srcPrefix}server/trpc`) +
        ` && cat > ${srcPrefix}server/trpc/trpc.${values.language === 'ts' ? 'ts' : 'js'} << 'TRPCEOF'
import { initTRPC } from "@trpc/server"
import superjson from "superjson"

const t = initTRPC.create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure
TRPCEOF`,
    });

    steps.push({
      label: 'Create tRPC root router',
      command: `cat > ${srcPrefix}server/trpc/router.${values.language === 'ts' ? 'ts' : 'js'} << 'TRPCREOF'
import { router, publicProcedure } from "./trpc"
import { z } from "zod"

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return { greeting: \`Hello \${input.text}\` }
    }),
})

export type AppRouter = typeof appRouter
TRPCREOF`,
    });

    steps.push({
      label: 'Create tRPC API route handler',
      command:
        platformAwareMkdir(`${srcPrefix}app/api/trpc/[trpc]`) +
        ` && cat > ${srcPrefix}app/api/trpc/[trpc]/route.${values.language === 'ts' ? 'ts' : 'js'} << 'TRPCAEOF'
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { appRouter } from "${values.importAlias.replace('*', '')}server/trpc/router"

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  })

export { handler as GET, handler as POST }
TRPCAEOF`,
    });
  } else if (values.api === 'graphql') {
    const srcPrefix = values.srcDir ? 'src/' : '';

    steps.push({
      label: 'Create GraphQL API route',
      command:
        platformAwareMkdir(`${srcPrefix}app/api/graphql`) +
        ` && cat > ${srcPrefix}app/api/graphql/route.${values.language === 'ts' ? 'ts' : 'js'} << 'GQLEOF'
import { ApolloServer } from "@apollo/server"
import { startServerAndCreateNextHandler } from "@as-integrations/next"

const typeDefs = \`
  type Query {
    hello: String
  }
\`

const resolvers = {
  Query: {
    hello: () => "Hello from GraphQL!",
  },
}

const server = new ApolloServer({ typeDefs, resolvers })
const handler = startServerAndCreateNextHandler(server)

export { handler as GET, handler as POST }
GQLEOF`,
    });
  }

  // ━━ 11. State management setup ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (values.state === 'zustand') {
    const srcPrefix = values.srcDir ? 'src/' : '';

    steps.push({
      label: 'Create Zustand example store',
      command:
        platformAwareMkdir(`${srcPrefix}store`) +
        ` && cat > ${srcPrefix}store/use-counter.${values.language === 'ts' ? 'ts' : 'js'} << 'ZUEOF'
import { create } from "zustand"

${
  values.language === 'ts'
    ? `interface CounterState {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

`
    : ''
}export const useCounter = create${values.language === 'ts' ? '<CounterState>' : ''}((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))
ZUEOF`,
    });
  } else if (values.state === 'redux') {
    const srcPrefix = values.srcDir ? 'src/' : '';

    steps.push({
      label: 'Create Redux store',
      command:
        platformAwareMkdir(`${srcPrefix}store`) +
        ` && cat > ${srcPrefix}store/index.${values.language === 'ts' ? 'ts' : 'js'} << 'REDUXEOF'
import { configureStore } from "@reduxjs/toolkit"
import counterReducer from "./counter-slice"

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
REDUXEOF`,
    });

    steps.push({
      label: 'Create Redux counter slice',
      command: `cat > ${srcPrefix}store/counter-slice.${values.language === 'ts' ? 'ts' : 'js'} << 'SLICEEOF'
import { createSlice } from "@reduxjs/toolkit"

const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1 },
    decrement: (state) => { state.value -= 1 },
    reset: (state) => { state.value = 0 },
  },
})

export const { increment, decrement, reset } = counterSlice.actions
export default counterSlice.reducer
SLICEEOF`,
    });

    steps.push({
      label: 'Create Redux Provider component',
      command:
        platformAwareMkdir(`${srcPrefix}components/providers`) +
        ` && cat > ${srcPrefix}components/providers/redux-provider.${values.language === 'ts' ? 'tsx' : 'jsx'} << 'RPEOF'
"use client"
import { Provider } from "react-redux"
import { store } from "${values.importAlias.replace('*', '')}store"

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>
}
RPEOF`,
    });
  } else if (values.state === 'jotai') {
    const srcPrefix = values.srcDir ? 'src/' : '';

    steps.push({
      label: 'Create Jotai example atoms',
      command:
        platformAwareMkdir(`${srcPrefix}store`) +
        ` && cat > ${srcPrefix}store/atoms.${values.language === 'ts' ? 'ts' : 'js'} << 'JOTAIEOF'
import { atom } from "jotai"

export const countAtom = atom(0)
export const doubleCountAtom = atom((get) => get(countAtom) * 2)
JOTAIEOF`,
    });
  }

  // ━━ 12. Payment setup ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (values.payment === 'stripe') {
    const srcPrefix = values.srcDir ? 'src/' : '';

    steps.push({
      label: 'Create Stripe server client',
      command:
        platformAwareMkdir(`${srcPrefix}lib`) +
        ` && cat > ${srcPrefix}lib/stripe.${values.language === 'ts' ? 'ts' : 'js'} << 'STRIPEEOF'
import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
})
STRIPEEOF`,
    });

    steps.push({
      label: 'Create Stripe checkout API route',
      command:
        platformAwareMkdir(`${srcPrefix}app/api/checkout`) +
        ` && cat > ${srcPrefix}app/api/checkout/route.${values.language === 'ts' ? 'ts' : 'js'} << 'CHKEOF'
import { NextResponse } from "next/server"
import { stripe } from "${values.importAlias.replace('*', '')}lib/stripe"

export async function POST(req: Request) {
  const { priceId } = await req.json()

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}\`,
    cancel_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/pricing\`,
  })

  return NextResponse.json({ url: session.url })
}
CHKEOF`,
    });

    steps.push({
      label: 'Create Stripe webhook handler',
      command:
        platformAwareMkdir(`${srcPrefix}app/api/webhooks/stripe`) +
        ` && cat > ${srcPrefix}app/api/webhooks/stripe/route.${values.language === 'ts' ? 'ts' : 'js'} << 'WHEOF'
import { NextResponse } from "next/server"
import { stripe } from "${values.importAlias.replace('*', '')}lib/stripe"
import { headers } from "next/headers"

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")!

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed":
      // Handle successful checkout
      break
    case "customer.subscription.updated":
      // Handle subscription update
      break
    case "customer.subscription.deleted":
      // Handle cancellation
      break
  }

  return NextResponse.json({ received: true })
}
WHEOF`,
    });
  } else if (values.payment === 'lemonsqueezy') {
    const srcPrefix = values.srcDir ? 'src/' : '';

    steps.push({
      label: 'Create Lemon Squeezy client',
      command:
        platformAwareMkdir(`${srcPrefix}lib`) +
        ` && cat > ${srcPrefix}lib/lemonsqueezy.${values.language === 'ts' ? 'ts' : 'js'} << 'LSEOF'
import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js"

export function configureLemonSqueezy() {
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY!,
    onError: (error) => console.error("Lemon Squeezy Error:", error),
  })
}
LSEOF`,
    });
  } else if (values.payment === 'paddle') {
    const srcPrefix = values.srcDir ? 'src/' : '';

    steps.push({
      label: 'Create Paddle server client',
      command:
        platformAwareMkdir(`${srcPrefix}lib`) +
        ` && cat > ${srcPrefix}lib/paddle.${values.language === 'ts' ? 'ts' : 'js'} << 'PADDLEEOF'
import { Paddle, Environment } from "@paddle/paddle-node-sdk"

export const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment: Environment.sandbox, // Change to production when ready
})
PADDLEEOF`,
    });
  }

  // ━━ 13. AI setup ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (values.ai === 'vercel-ai-sdk') {
    const srcPrefix = values.srcDir ? 'src/' : '';

    steps.push({
      label: 'Create AI chat API route',
      command:
        platformAwareMkdir(`${srcPrefix}app/api/chat`) +
        ` && cat > ${srcPrefix}app/api/chat/route.${values.language === 'ts' ? 'ts' : 'js'} << 'AIEOF'
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages,
  })

  return result.toDataStreamResponse()
}
AIEOF`,
    });

    steps.push({
      label: 'Create AI chat page component',
      command: `cat > ${srcPrefix}app/chat/page.${values.language === 'ts' ? 'tsx' : 'jsx'} << 'AIPEOF'
"use client"
import { useChat } from "ai/react"

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  return (
    <div className="flex flex-col w-full max-w-md mx-auto py-24 stretch">
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap mb-4">
          <strong>{m.role === "user" ? "You" : "AI"}:</strong> {m.content}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  )
}
AIPEOF`,
    });
  }

  // ━━ 14. Monitoring setup ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (values.monitoring === 'sentry') {
    steps.push({
      label: 'Initialize Sentry (interactive wizard)',
      command: 'npx @sentry/wizard@latest -i nextjs',
    });
  } else if (values.monitoring === 'posthog') {
    const srcPrefix = values.srcDir ? 'src/' : '';

    steps.push({
      label: 'Create PostHog provider',
      command:
        platformAwareMkdir(`${srcPrefix}components/providers`) +
        ` && cat > ${srcPrefix}components/providers/posthog-provider.${values.language === 'ts' ? 'tsx' : 'jsx'} << 'PHEOF'
"use client"
import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect } from "react"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      person_profiles: "identified_only",
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
PHEOF`,
    });
  } else if (values.monitoring === 'vercel-analytics') {
    steps.push({
      label: 'Add Vercel Analytics to layout',
      description:
        'Add <Analytics /> and <SpeedInsights /> to your root layout',
      command: `echo "Add these imports to your root layout:\\nimport { Analytics } from '@vercel/analytics/react'\\nimport { SpeedInsights } from '@vercel/speed-insights/next'\\n\\nThen add <Analytics /> and <SpeedInsights /> inside the <body> tag."`,
    });
  } else if (values.monitoring === 'google-analytics') {
    steps.push({
      label: 'Add Google Analytics to layout',
      description: 'Add <GoogleAnalytics> to your root layout',
      command: `echo "Add to your root layout:\\nimport { GoogleAnalytics } from '@next/third-parties/google'\\n\\nThen add <GoogleAnalytics gaId='G-XXXXXXX' /> inside <head> or <body>."`,
    });
  }

  // ━━ 15. i18n setup ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (values.i18n === 'next-intl') {
    const srcPrefix = values.srcDir ? 'src/' : '';
    const langs = (values.languages || 'en')
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);
    const defaultLang = langs[0] || 'en';

    steps.push({
      label: 'Create next-intl config',
      command: `cat > ${srcPrefix}i18n/request.${values.language === 'ts' ? 'ts' : 'js'} << 'I18NEOF'
import { getRequestConfig } from "next-intl/server"

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) || "${defaultLang}"
  return {
    locale,
    messages: (await import(\`../../messages/\${locale}.json\`)).default,
  }
})
I18NEOF`,
    });

    for (const lang of langs) {
      steps.push({
        label: `Create ${lang} messages file`,
        command:
          platformAwareMkdir('messages') +
          ` && cat > messages/${lang}.json << 'MSGEOF'
{
  "common": {
    "welcome": "${lang === 'ar' ? 'مرحبا' : 'Welcome'}",
    "home": "${lang === 'ar' ? 'الرئيسية' : 'Home'}",
    "about": "${lang === 'ar' ? 'حول' : 'About'}"
  }
}
MSGEOF`,
      });
    }

    steps.push({
      label: 'Create next-intl middleware',
      command: `cat > ${srcPrefix}middleware.${values.language === 'ts' ? 'ts' : 'js'} << 'I18NMEOF'
import createMiddleware from "next-intl/middleware"
import { routing } from "${values.importAlias.replace('*', '')}i18n/routing"

export default createMiddleware(routing)

export const config = {
  matcher: ["/((?!api|_next|.*\\\\..*).*)"],
}
I18NMEOF`,
    });

    steps.push({
      label: 'Create routing config',
      command:
        platformAwareMkdir(`${srcPrefix}i18n`) +
        ` && cat > ${srcPrefix}i18n/routing.${values.language === 'ts' ? 'ts' : 'js'} << 'RTEOF'
import { defineRouting } from "next-intl/routing"
import { createNavigation } from "next-intl/navigation"

export const routing = defineRouting({
  locales: [${langs.map((l) => `"${l}"`).join(', ')}],
  defaultLocale: "${defaultLang}",
  ${values.i18nRouting === 'no-prefix' ? 'localePrefix: "never",' : ''}
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
RTEOF`,
    });
  } else if (values.i18n === 'react-i18next') {
    const srcPrefix = values.srcDir ? 'src/' : '';
    const langs = (values.languages || 'en')
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);

    steps.push({
      label: 'Create i18next config',
      command:
        platformAwareMkdir(`${srcPrefix}lib`) +
        ` && cat > ${srcPrefix}lib/i18n.${values.language === 'ts' ? 'ts' : 'js'} << 'RI18EOF'
import i18n from "i18next"
import { initReactI18next } from "react-i18next"

i18n.use(initReactI18next).init({
  resources: {
${langs.map((l) => `    ${l}: { translation: {} },`).join('\n')}
  },
  lng: "${langs[0] || 'en'}",
  fallbackLng: "${langs[0] || 'en'}",
  interpolation: { escapeValue: false },
})

export default i18n
RI18EOF`,
    });
  }

  // ━━ 16. SEO setup ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (values.seo) {
    steps.push({
      label: 'Create next-sitemap config',
      command: `cat > next-sitemap.config.js << 'SEOEOF'
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://example.com",
  generateRobotsTxt: true,
  sitemapSize: 7000,
}
SEOEOF`,
    });

    steps.push({
      label: 'Add postbuild script to package.json',
      command: 'npm pkg set scripts.postbuild="next-sitemap"',
    });
  }

  // ━━ 17. Testing setup ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (values.testing) {
    steps.push({
      label: 'Create Vitest config',
      command: `cat > vitest.config.${values.language === 'ts' ? 'ts' : 'js'} << 'VTEOF'
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.${values.language === 'ts' ? 'ts' : 'js'}"],
    include: ["**/*.test.${values.language === 'ts' ? '{ts,tsx}' : '{js,jsx}'}"],
  },
  resolve: {
    alias: {
      "${values.importAlias.replace('/*', '')}": path.resolve(__dirname, "./${values.srcDir ? 'src' : '.'}"),
    },
  },
})
VTEOF`,
    });

    steps.push({
      label: 'Create Vitest setup file',
      command: `cat > vitest.setup.${values.language === 'ts' ? 'ts' : 'js'} << 'VSEOF'
import "@testing-library/jest-dom/vitest"
VSEOF`,
    });

    steps.push({
      label: 'Add test script to package.json',
      command:
        'npm pkg set scripts.test="vitest" && npm pkg set scripts.test:run="vitest run"',
    });
  }

  // ━━ 18. Storybook ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (values.features.storybook) {
    steps.push({
      label: 'Initialize Storybook',
      command: 'npx storybook@latest init',
    });
  }

  // ━━ 19. Docker setup ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (values.features.docker) {
    steps.push({
      label: 'Create Dockerfile',
      command: `cat > Dockerfile << 'DOCKEREOF'
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
DOCKEREOF`,
    });

    steps.push({
      label: 'Create .dockerignore',
      command: `cat > .dockerignore << 'DIEOF'
node_modules
.next
.git
*.md
.env*
DIEOF`,
    });

    steps.push({
      label: 'Create docker-compose.yml',
      command: `cat > docker-compose.yml << 'DCEOF'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production${values.database === 'prisma' || values.database === 'drizzle' ? '\n      - DATABASE_URL=postgresql://postgres:postgres@db:5432/' + values.projectName : ''}${values.database === 'mongoose' ? '\n      - MONGODB_URI=mongodb://mongo:27017/' + values.projectName : ''}
    depends_on:${values.database === 'prisma' || values.database === 'drizzle' ? '\n      db:\n        condition: service_healthy' : values.database === 'mongoose' ? '\n      mongo:\n        condition: service_started' : '\n      []'}
${
  values.database === 'prisma' || values.database === 'drizzle'
    ? `
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ${values.projectName}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5`
    : ''
}${
        values.database === 'mongoose'
          ? `
  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db`
          : ''
      }
${
  values.database === 'prisma' || values.database === 'drizzle'
    ? `
volumes:
  postgres_data:`
    : values.database === 'mongoose'
      ? `
volumes:
  mongo_data:`
      : ''
}
DCEOF`,
    });

    steps.push({
      label: 'Enable standalone output in next.config',
      description: 'Required for Docker deployment',
      command: `echo "Add output: 'standalone' to your next.config.${values.language === 'ts' ? 'ts' : 'js'} under the nextConfig object."`,
    });
  }

  // ━━ 20. React Compiler ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (values.features.reactCompiler) {
    steps.push({
      label: 'Enable React Compiler in next.config',
      command: `echo "Add the following to your next.config.${values.language === 'ts' ? 'ts' : 'js'}:\\n\\nconst nextConfig = {\\n  experimental: {\\n    reactCompiler: true,\\n  },\\n}"`,
    });
  }

  // ━━ 21. Environment variables template ━━━━━━━━━━━━━━━━━━━━━━━━━
  const envVars: string[] = [];
  envVars.push('# App');
  envVars.push('NEXT_PUBLIC_APP_URL=http://localhost:3000');
  envVars.push('');

  if (values.auth === 'authjs' || values.auth === 'next-auth') {
    envVars.push('# Auth');
    envVars.push('NEXTAUTH_URL=http://localhost:3000');
    envVars.push('NEXTAUTH_SECRET= # Generate with: openssl rand -base64 32');
    envVars.push('GITHUB_ID=');
    envVars.push('GITHUB_SECRET=');
    envVars.push('');
  } else if (values.auth === 'clerk') {
    envVars.push('# Clerk Auth');
    envVars.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=');
    envVars.push('CLERK_SECRET_KEY=');
    envVars.push('NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in');
    envVars.push('NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up');
    envVars.push('');
  } else if (values.auth === 'supabase') {
    envVars.push('# Supabase');
    envVars.push('NEXT_PUBLIC_SUPABASE_URL=');
    envVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
    envVars.push('');
  } else if (values.auth === 'firebase') {
    envVars.push('# Firebase');
    envVars.push('NEXT_PUBLIC_FIREBASE_API_KEY=');
    envVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=');
    envVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID=');
    envVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=');
    envVars.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=');
    envVars.push('NEXT_PUBLIC_FIREBASE_APP_ID=');
    envVars.push('');
  } else if (values.auth === 'better-auth') {
    envVars.push('# Better Auth');
    envVars.push(
      'BETTER_AUTH_SECRET= # Generate with: openssl rand -base64 32',
    );
    envVars.push('');
  }

  if (values.database === 'prisma' || values.database === 'drizzle') {
    envVars.push('# Database');
    envVars.push(
      'DATABASE_URL=postgresql://postgres:postgres@localhost:5432/' +
        values.projectName,
    );
    envVars.push('');
  } else if (values.database === 'mongoose') {
    envVars.push('# Database');
    envVars.push('MONGODB_URI=mongodb://localhost:27017/' + values.projectName);
    envVars.push('');
  }

  if (values.payment === 'stripe') {
    envVars.push('# Stripe');
    envVars.push('STRIPE_SECRET_KEY=');
    envVars.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=');
    envVars.push('STRIPE_WEBHOOK_SECRET=');
    envVars.push('');
  } else if (values.payment === 'lemonsqueezy') {
    envVars.push('# Lemon Squeezy');
    envVars.push('LEMONSQUEEZY_API_KEY=');
    envVars.push('LEMONSQUEEZY_WEBHOOK_SECRET=');
    envVars.push('');
  } else if (values.payment === 'paddle') {
    envVars.push('# Paddle');
    envVars.push('PADDLE_API_KEY=');
    envVars.push('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=');
    envVars.push('');
  } else if (values.payment === 'dodo') {
    envVars.push('# Dodo Payments');
    envVars.push('DODO_API_KEY=');
    envVars.push('');
  } else if (values.payment === 'polar') {
    envVars.push('# Polar');
    envVars.push('POLAR_ACCESS_TOKEN=');
    envVars.push('');
  }

  if (values.ai === 'vercel-ai-sdk') {
    envVars.push('# AI');
    envVars.push('OPENAI_API_KEY=');
    envVars.push('');
  }

  if (values.monitoring === 'sentry') {
    envVars.push('# Sentry');
    envVars.push('SENTRY_DSN=');
    envVars.push('SENTRY_AUTH_TOKEN=');
    envVars.push('');
  } else if (values.monitoring === 'posthog') {
    envVars.push('# PostHog');
    envVars.push('NEXT_PUBLIC_POSTHOG_KEY=');
    envVars.push('NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com');
    envVars.push('');
  } else if (values.monitoring === 'google-analytics') {
    envVars.push('# Google Analytics');
    envVars.push('NEXT_PUBLIC_GA_ID=');
    envVars.push('');
  }

  if (envVars.length > 3) {
    steps.push({
      label: 'Create environment variables file',
      command: `cat > .env.local << 'ENVEOF'\n${envVars.join('\n')}\nENVEOF`,
    });
  }

  return {
    cli: cliCommand,
    manual: steps,
  };
}

function platformAwareMkdir(dir: string): string {
  return `mkdir -p ${dir}`;
}
