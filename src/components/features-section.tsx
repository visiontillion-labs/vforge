import {
  Router,
  Shield,
  Database,
  CreditCard,
  Sparkles,
  Puzzle,
} from 'lucide-react';

const features = [
  {
    icon: Router,
    title: 'App & Pages Router',
    description:
      'Full support for both Next.js App Router and Pages Router. Choose the architecture that fits your project.',
    color: 'text-foreground',
    bg: 'bg-foreground/5',
  },
  {
    icon: Shield,
    title: 'Authentication',
    description:
      'Built-in support for Auth.js, Better Auth, Clerk, Supabase, and Firebase — with session management out of the box.',
    color: 'text-foreground',
    bg: 'bg-foreground/5',
  },
  {
    icon: Database,
    title: 'Database Integration',
    description:
      'Connect to any database with Prisma, Drizzle, Mongoose, or Firebase. Schema, migrations, and client all pre-configured.',
    color: 'text-foreground',
    bg: 'bg-foreground/5',
  },
  {
    icon: CreditCard,
    title: 'Payment Gateway',
    description:
      'Integrate Stripe, Lemon Squeezy, Paddle, Dodo Payments, or Polar with checkout, webhooks, and billing ready.',
    color: 'text-foreground',
    bg: 'bg-foreground/5',
  },
  {
    icon: Sparkles,
    title: 'AI Integration',
    description:
      'Add AI capabilities with Vercel AI SDK. Streaming, chat interfaces, and model integration configured from the start.',
    color: 'text-foreground',
    bg: 'bg-foreground/5',
  },
  {
    icon: Puzzle,
    title: 'Full Stack Toolkit',
    description:
      'shadcn/ui, tRPC, i18n, SEO, testing, monitoring, Docker, and more. A complete ecosystem at your fingertips.',
    color: 'text-foreground',
    bg: 'bg-foreground/5',
  },
];

export function FeaturesSection() {
  return (
    <section id='features' className='relative py-24 md:py-32'>
      {/* Background */}
      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute inset-0 bg-muted/30 dark:bg-muted/10' />
        <div className='absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent' />
        <div className='absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-border to-transparent' />
      </div>

      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mb-16 space-y-4 text-center'>
          <p className='text-sm font-medium tracking-widest uppercase text-muted-foreground'>
            Everything You Need
          </p>
          <h2 className='text-3xl font-bold tracking-tight sm:text-4xl'>
            Production-ready from{' '}
            <span className='underline decoration-foreground/20 underline-offset-4'>
              day one
            </span>
            .
          </h2>
          <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
            Every feature is battle-tested and follows best practices. No
            half-baked integrations — just clean, maintainable code.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {features.map((feature) => (
            <div
              key={feature.title}
              className='group relative rounded-xl border border-border/50 bg-card p-6 transition-all duration-200 hover:border-border hover:shadow-lg hover:shadow-black/3 dark:hover:shadow-black/20'
            >
              <div
                className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${feature.bg}`}
              >
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
              </div>
              <h3 className='mb-2 text-base font-semibold'>{feature.title}</h3>
              <p className='text-sm leading-relaxed text-muted-foreground'>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
