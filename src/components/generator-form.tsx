'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  Rocket,
  ShoppingCart,
  Newspaper,
  RotateCcw,
  AlertTriangle,
  Share2,
  Check,
  Link2,
  Palette,
  Download,
  Terminal,
  FileCode,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { ProjectPreview } from '@/components/project-preview';
import { CommandBlock } from '@/components/command-block';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { buildShareUrl, decodeConfig } from '@/lib/config-url';
import { analytics } from '@/lib/analytics';
import { generateCommands } from '@/lib/generate-commands';
import {
  radiusOptions,
  baseColorPresets,
  primaryColorPresets,
  fontOptions,
  shadcnComponents,
  shadcnComponentCategories,
} from '@/lib/color-presets';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  projectName: z
    .string()
    .min(1, 'Project name is required')
    .regex(
      /^[a-z0-9-_]+$/,
      'Only lowercase letters, numbers, hyphens, and underscores are allowed',
    ),
  router: z.enum(['app', 'pages']),
  language: z.enum(['ts', 'js']),
  linter: z.enum(['eslint', 'biome', 'none']),
  version: z.string(),
  srcDir: z.boolean(),
  importAlias: z
    .string()
    .min(1, 'Alias required')
    .regex(/^@\/.*$/, 'Must start with @/'),
  features: z.object({
    tailwind: z.boolean(),
    shadcn: z.boolean(),
    reactCompiler: z.boolean(),
    docker: z.boolean(),
    git: z.boolean(),
    storybook: z.boolean(),
  }),
  // New Features
  auth: z.enum([
    'none',
    'authjs',
    'next-auth',
    'clerk',
    'supabase',
    'firebase',
    'better-auth',
  ]),
  database: z.enum(['none', 'prisma', 'drizzle', 'mongoose', 'firebase']),
  api: z.enum(['none', 'trpc', 'graphql']),
  state: z.enum(['none', 'zustand', 'redux', 'jotai']),
  payment: z.enum([
    'none',
    'stripe',
    'lemonsqueezy',
    'paddle',
    'dodo',
    'polar',
  ]),
  email: z.enum(['none', 'mailgun']),
  ai: z.enum(['none', 'vercel-ai-sdk']),
  monitoring: z.enum([
    'none',
    'sentry',
    'posthog',
    'logrocket',
    'google-analytics',
    'vercel-analytics',
  ]),
  i18n: z.enum(['none', 'next-intl', 'react-i18next']),
  i18nRouting: z.enum(['prefix', 'no-prefix']).optional(),
  languages: z.string().optional(),
  seo: z.boolean(),
  testing: z.boolean(),
  theme: z.object({
    radius: z.number(),
    baseColor: z.enum(['neutral', 'slate', 'zinc', 'gray', 'stone']),
    primaryColor: z.enum([
      'default',
      'red',
      'orange',
      'amber',
      'yellow',
      'green',
      'emerald',
      'blue',
      'violet',
      'purple',
      'pink',
      'rose',
    ]),
    font: z.enum([
      'inter',
      'geist',
      'plus-jakarta-sans',
      'manrope',
      'outfit',
      'raleway',
    ]),
    components: z.array(z.string()),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface GeneratorFormProps {
  sharedConfig?: string;
}

const defaultValues: FormValues = {
  projectName: 'my-next-app',
  router: 'app',
  language: 'ts',
  linter: 'eslint',
  version: 'latest',
  srcDir: true,
  importAlias: '@/*',
  features: {
    tailwind: true,
    shadcn: false,
    reactCompiler: false,
    docker: false,
    git: true,
    storybook: false,
  },
  auth: 'none',
  database: 'none',
  api: 'none',
  state: 'none',
  payment: 'none',
  email: 'none',
  ai: 'none',
  monitoring: 'none',
  i18n: 'none',
  i18nRouting: 'prefix',
  languages: 'en',
  seo: false,
  testing: false,
  theme: {
    radius: 0.5,
    baseColor: 'neutral',
    primaryColor: 'default',
    font: 'geist',
    components: ['button', 'card', 'input', 'form', 'dialog'],
  },
};

interface Preset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  featured?: boolean;
  stack?: string[];
  values: Partial<FormValues>;
}

const presets: Preset[] = [
  {
    id: 'shipfast',
    name: 'ShipFast',
    description:
      'Exact stack: Mongo + Mailgun + Stripe + Next.js + Tailwind + NextAuth',
    icon: <Rocket className='size-4' />,
    featured: true,
    stack: ['NextAuth', 'MongoDB', 'Stripe', 'Mailgun', 'Tailwind', 'SEO'],
    values: {
      projectName: 'my-startup',
      router: 'app',
      language: 'ts',
      linter: 'eslint',
      srcDir: true,
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
    },
  },
  {
    id: 'saas',
    name: 'SaaS Starter',
    description: 'Auth, payments, DB & monitoring',
    icon: <Rocket className='size-4' />,
    stack: ['Auth', 'Payments', 'Database', 'Monitoring'],
    values: {
      projectName: 'my-saas-app',
      router: 'app',
      language: 'ts',
      linter: 'eslint',
      srcDir: true,
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
      ai: 'none',
      monitoring: 'sentry',
      i18n: 'none',
      i18nRouting: 'prefix',
      seo: true,
      testing: true,
    },
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Store with payments & i18n',
    icon: <ShoppingCart className='size-4' />,
    stack: ['Store', 'Payments', 'i18n'],
    values: {
      projectName: 'my-store',
      router: 'app',
      language: 'ts',
      linter: 'eslint',
      srcDir: true,
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
      ai: 'none',
      monitoring: 'posthog',
      i18n: 'next-intl',
      i18nRouting: 'prefix',
      languages: 'en, ar',
      seo: true,
      testing: true,
    },
  },
  {
    id: 'blog',
    name: 'Blog / CMS',
    description: 'Content site with SEO & AI',
    icon: <Newspaper className='size-4' />,
    stack: ['SEO', 'CMS', 'AI'],
    values: {
      projectName: 'my-blog',
      router: 'app',
      language: 'ts',
      linter: 'biome',
      srcDir: true,
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
      ai: 'vercel-ai-sdk',
      monitoring: 'none',
      i18n: 'next-intl',
      i18nRouting: 'prefix',
      languages: 'en',
      seo: true,
      testing: false,
    },
  },
];

export function GeneratorForm({ sharedConfig }: GeneratorFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [isSharedConfig, setIsSharedConfig] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // ── Restore config from URL on mount ──────────────────────────────
  useEffect(() => {
    const configParam = sharedConfig;
    if (configParam) {
      const decoded = decodeConfig(configParam);
      if (decoded) {
        form.reset({ ...defaultValues, ...decoded } as FormValues);
        setIsSharedConfig(true);
        toast.success('Shared configuration loaded!', {
          description: 'The form has been pre-filled with a shared setup.',
        });
      }
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Share handler ─────────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    const values = form.getValues();
    const url = buildShareUrl(values);

    try {
      await navigator.clipboard.writeText(url);
      setHasCopied(true);
      toast.success('Share link copied!', {
        description: 'Anyone with this link will see your exact configuration.',
      });
      analytics.trackShareLinkCreated();
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setHasCopied(true);
      toast.success('Share link copied!');
      setTimeout(() => setHasCopied(false), 2000);
    }
  }, [form]);

  function applyPreset(preset: Preset) {
    if (activePreset === preset.id) {
      // Clicking active preset resets to defaults
      form.reset(defaultValues);
      setActivePreset(null);
    } else {
      form.reset({ ...defaultValues, ...preset.values });
      setActivePreset(preset.id);
      analytics.trackPresetSelected(preset.id);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error('Generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${values.projectName}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Project generated successfully!');

      // Track generation analytics
      analytics.trackGeneration({
        router: values.router,
        language: values.language,
        linter: values.linter,
        srcDir: values.srcDir,
        tailwind: values.features.tailwind,
        shadcn: values.features.shadcn,
        auth: values.auth,
        database: values.database,
        api: values.api,
        state: values.state,
        payment: values.payment,
        email: values.email,
        ai: values.ai,
        monitoring: values.monitoring,
        i18n: values.i18n,
        seo: values.seo,
        testing: values.testing,
        docker: values.features.docker,
        storybook: values.features.storybook,
        theme_radius: values.theme.radius,
        theme_baseColor: values.theme.baseColor,
        theme_primaryColor: values.theme.primaryColor,
        theme_font: values.theme.font,
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate project. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  const watchedValues = form.watch();

  const getConflictWarnings = (values: FormValues) => {
    const warnings: string[] = [];

    // Firebase Auth + SQL
    if (
      values.auth === 'firebase' &&
      (values.database === 'prisma' || values.database === 'drizzle')
    ) {
      warnings.push(
        'Mixing Firebase Auth with SQL databases (Prisma/Drizzle) requires manual user syncing and is generally not recommended.',
      );
    }

    // Firebase DB + Non-Firebase Auth
    if (
      values.database === 'firebase' &&
      values.auth !== 'firebase' &&
      values.auth !== 'none'
    ) {
      warnings.push(
        'Firebase Database (Firestore) is tightly integrated with Firebase Auth. Using a different provider may be difficult.',
      );
    }

    // Supabase Auth + NoSQL
    if (
      values.auth === 'supabase' &&
      (values.database === 'firebase' || values.database === 'mongoose')
    ) {
      warnings.push(
        'Supabase is built on PostgreSQL. Using Supabase Auth with NoSQL databases is unusual and loses many ecosystem benefits.',
      );
    }

    // AI SDK + Pages Router
    if (values.router === 'pages' && values.ai === 'vercel-ai-sdk') {
      warnings.push(
        'Vercel AI SDK streaming UI hooks are optimized for the App Router. Implementation in Pages Router is more complex.',
      );
    }

    return warnings;
  };

  const warnings = getConflictWarnings(watchedValues);

  return (
    <div className='w-full grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start'>
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <CardTitle>Configure Your Project</CardTitle>
              <CardDescription>
                Select from a wide range of features to boost your development.
              </CardDescription>
            </div>

            {/* Share Configuration Button */}
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleShare}
                    className='shrink-0 gap-2 transition-all'
                  >
                    {hasCopied ? (
                      <>
                        <Check className='size-4 text-green-500' />
                        <span className='hidden sm:inline'>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className='size-4' />
                        <span className='hidden sm:inline'>Share</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='bottom'>
                  <p>Copy a shareable link with your current configuration</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Shared Config Banner */}
          {isSharedConfig && (
            <div className='flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 mt-3'>
              <Link2 className='size-4 shrink-0' />
              <span>
                This configuration was loaded from a shared link. Feel free to
                modify it before generating.
              </span>
              <button
                type='button'
                onClick={() => {
                  setIsSharedConfig(false);
                  // Clean the URL without reloading
                  window.history.replaceState({}, '', window.location.pathname);
                }}
                className='ml-auto text-xs underline hover:no-underline shrink-0'
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Preset Templates */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3 pt-4'>
            {presets.map((preset) => (
              <button
                key={preset.id}
                type='button'
                onClick={() => applyPreset(preset)}
                className={`rounded-xl border p-3 text-left transition-all hover:bg-accent/60 ${
                  activePreset === preset.id
                    ? 'border-primary bg-accent shadow-sm ring-1 ring-primary/20'
                    : 'border-border bg-background hover:border-primary/30'
                }`}
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex items-start gap-2.5'>
                    <span
                      className={
                        activePreset === preset.id
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }
                    >
                      {preset.icon}
                    </span>
                    <div>
                      <div className='font-medium leading-none'>{preset.name}</div>
                      <div className='text-xs text-muted-foreground mt-1 leading-relaxed'>
                        {preset.description}
                      </div>
                    </div>
                  </div>
                  {preset.featured && (
                    <span className='rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary'>
                      Featured
                    </span>
                  )}
                </div>
                {preset.stack && preset.stack.length > 0 && (
                  <div className='mt-3 flex flex-wrap gap-1.5'>
                    {preset.stack.map((item) => (
                      <span
                        key={`${preset.id}-${item}`}
                        className='rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground'
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
                {preset.id === 'shipfast' && (
                  <div className='mt-2 text-[11px] text-muted-foreground'>
                    Use this when you want the exact ShipFast-style launch stack.
                  </div>
                )}
              </button>
            ))}
            {activePreset && (
              <button
                type='button'
                onClick={() => {
                  form.reset(defaultValues);
                  setActivePreset(null);
                }}
                className='flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all md:col-span-2'
              >
                <RotateCcw className='size-3.5' />
                Reset to base configuration
              </button>
            )}
          </div>
          {activePreset === 'shipfast' && (
            <div className='mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground'>
              ShipFast exact preset loaded: Next.js + NextAuth + MongoDB +
              Stripe + Mailgun + SEO + Tailwind.
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              {/* Core Settings */}
              <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
                <div className='col-span-12 md:col-span-5'>
                  <FormField
                    control={form.control}
                    name='projectName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder='my-next-app' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='col-span-12 md:col-span-4'>
                  <FormField
                    control={form.control}
                    name='importAlias'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Import Alias</FormLabel>
                        <FormControl>
                          <Input placeholder='@/*' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='col-span-12 md:col-span-3'>
                  <FormField
                    control={form.control}
                    name='srcDir'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm h-[74px]'>
                        <div className='space-y-0.5'>
                          <FormLabel>Use /src</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='language'
                  render={({ field }) => (
                    <FormItem className='border p-4 rounded-lg'>
                      <FormLabel>Language</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className='flex flex-col space-y-1 mt-2'
                        >
                          <FormItem className='flex items-center space-x-3 space-y-0'>
                            <FormControl>
                              <RadioGroupItem value='ts' />
                            </FormControl>
                            <FormLabel className='font-normal'>
                              TypeScript
                            </FormLabel>
                          </FormItem>
                          <FormItem className='flex items-center space-x-3 space-y-0'>
                            <FormControl>
                              <RadioGroupItem value='js' />
                            </FormControl>
                            <FormLabel className='font-normal'>
                              JavaScript
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='router'
                  render={({ field }) => (
                    <FormItem className='border p-4 rounded-lg'>
                      <FormLabel>Router</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className='flex flex-col space-y-1 mt-2'
                        >
                          <FormItem className='flex items-center space-x-3 space-y-0'>
                            <FormControl>
                              <RadioGroupItem value='app' />
                            </FormControl>
                            <FormLabel className='font-normal'>
                              App Router
                            </FormLabel>
                          </FormItem>
                          <FormItem className='flex items-center space-x-3 space-y-0'>
                            <FormControl>
                              <RadioGroupItem value='pages' />
                            </FormControl>
                            <FormLabel className='font-normal'>
                              Pages Router
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Feature Selections (Selects) */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Auth */}
                <FormField
                  control={form.control}
                  name='auth'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authentication</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select Auth Provider' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='none'>None</SelectItem>
                          <SelectItem value='authjs'>Auth.js (v5)</SelectItem>
                          <SelectItem value='next-auth'>
                            NextAuth (v4)
                          </SelectItem>
                          <SelectItem value='clerk'>Clerk</SelectItem>
                          <SelectItem value='supabase'>Supabase</SelectItem>
                          <SelectItem value='firebase'>Firebase</SelectItem>
                          <SelectItem value='better-auth'>
                            Better Auth
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Database */}
                <FormField
                  control={form.control}
                  name='database'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Database</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select Database' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='none'>None</SelectItem>
                          <SelectItem value='prisma'>Prisma (SQL)</SelectItem>
                          <SelectItem value='drizzle'>Drizzle (SQL)</SelectItem>
                          <SelectItem value='mongoose'>
                            Mongoose (NoSQL)
                          </SelectItem>
                          <SelectItem value='firebase'>
                            Firebase (NoSQL)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* API */}
                <FormField
                  control={form.control}
                  name='api'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Layer</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select API Layer' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='none'>None (REST)</SelectItem>
                          <SelectItem value='trpc'>tRPC</SelectItem>
                          <SelectItem value='graphql'>GraphQL</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* State */}
                <FormField
                  control={form.control}
                  name='state'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State Management</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select State Manager' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='none'>None</SelectItem>
                          <SelectItem value='zustand'>Zustand</SelectItem>
                          <SelectItem value='redux'>Redux Toolkit</SelectItem>
                          <SelectItem value='jotai'>Jotai</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment */}
                <FormField
                  control={form.control}
                  name='payment'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Gateway</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select Payment Gateway' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='none'>None</SelectItem>
                          <SelectItem value='stripe'>Stripe</SelectItem>
                          <SelectItem value='lemonsqueezy'>
                            Lemon Squeezy
                          </SelectItem>
                          <SelectItem value='paddle'>Paddle</SelectItem>
                          <SelectItem value='dodo'>Dodo Payments</SelectItem>
                          <SelectItem value='polar'>Polar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* AI */}
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Provider</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select Email Provider' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='none'>None</SelectItem>
                          <SelectItem value='mailgun'>Mailgun</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* AI */}
                <FormField
                  control={form.control}
                  name='ai'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Integration</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select AI' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='none'>None</SelectItem>
                          <SelectItem value='vercel-ai-sdk'>
                            Vercel AI SDK
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Monitoring */}
                <FormField
                  control={form.control}
                  name='monitoring'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Analytics & Monitoring</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select Monitoring' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='none'>None</SelectItem>
                          <SelectItem value='sentry'>Sentry</SelectItem>
                          <SelectItem value='posthog'>PostHog</SelectItem>
                          <SelectItem value='logrocket'>LogRocket</SelectItem>
                          <SelectItem value='google-analytics'>
                            Google Analytics
                          </SelectItem>
                          <SelectItem value='vercel-analytics'>
                            Vercel Analytics
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* I18n */}
                <FormField
                  control={form.control}
                  name='i18n'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internationalization</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select i18n Strategy' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='none'>None</SelectItem>
                          <SelectItem value='next-intl'>next-intl</SelectItem>
                          <SelectItem value='react-i18next'>
                            react-i18next
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedValues.i18n !== 'none' && (
                  <FormField
                    control={form.control}
                    name='i18nRouting'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Routing Strategy</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || 'prefix'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select Routing' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='prefix'>
                              Prefix (/en/about)
                            </SelectItem>
                            <SelectItem value='no-prefix'>
                              No Prefix / Domain (/about)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {form.watch('i18n') !== 'none' && (
                  <FormField
                    control={form.control}
                    name='languages'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Languages (comma separated)</FormLabel>
                        <FormControl>
                          <Input placeholder='en, ar' {...field} />
                        </FormControl>
                        <FormDescription>
                          Default: en. Add &lsquo;ar&rsquo; for RTL demo.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Toggles (Switches) */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4'>
                <FormField
                  control={form.control}
                  name='seo'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>SEO Pack</FormLabel>
                        <FormDescription>
                          Includes next-sitemap, meta.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='testing'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>
                          Testing (Vitest)
                        </FormLabel>
                        <FormDescription>Setup unit testing.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='features.tailwind'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>
                          Tailwind CSS
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='features.shadcn'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>shadcn/ui</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='features.docker'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>Docker</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='features.git'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>Git Init</FormLabel>
                        <FormDescription>Include .gitignore</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='features.storybook'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>Storybook</FormLabel>
                        <FormDescription>Install Storybook v8</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Theme & Styling */}
              {watchedValues.features.shadcn && (
                <div className='border-t pt-4 space-y-6'>
                  <div className='flex items-center gap-2'>
                    <Palette className='size-5 text-primary' />
                    <h3 className='text-lg font-semibold'>Theme & Styling</h3>
                  </div>

                  {/* Radius */}
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>Border Radius</Label>
                    <div className='flex gap-2'>
                      {radiusOptions.map((r) => (
                        <button
                          key={r}
                          type='button'
                          onClick={() =>
                            form.setValue('theme.radius', r, {
                              shouldValidate: true,
                            })
                          }
                          className={cn(
                            'flex h-10 w-10 items-center justify-center border-2 text-xs font-medium transition-colors',
                            watchedValues.theme.radius === r
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background hover:border-primary/50',
                          )}
                          style={{ borderRadius: `${r * 0.5}rem` }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Base Color */}
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>Base Color</Label>
                    <div className='flex gap-2 flex-wrap'>
                      {baseColorPresets.map((preset) => (
                        <button
                          key={preset.id}
                          type='button'
                          onClick={() =>
                            form.setValue('theme.baseColor', preset.id, {
                              shouldValidate: true,
                            })
                          }
                          className={cn(
                            'flex h-9 items-center justify-center rounded-md border px-3 text-xs font-medium transition-colors',
                            watchedValues.theme.baseColor === preset.id
                              ? 'border-primary ring-2 ring-primary/20'
                              : 'border-border hover:border-primary/50',
                          )}
                        >
                          {watchedValues.theme.baseColor === preset.id && (
                            <Check className='size-3 mr-1' />
                          )}
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary Color */}
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>Primary Color</Label>
                    <div className='flex gap-2 flex-wrap'>
                      {primaryColorPresets.map((preset) => (
                        <button
                          key={preset.id}
                          type='button'
                          onClick={() =>
                            form.setValue('theme.primaryColor', preset.id, {
                              shouldValidate: true,
                            })
                          }
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-md border transition-all',
                            watchedValues.theme.primaryColor === preset.id
                              ? 'ring-2 ring-offset-2 ring-offset-background scale-110'
                              : 'hover:scale-105',
                          )}
                          style={{
                            backgroundColor: preset.swatch,
                            borderColor:
                              watchedValues.theme.primaryColor === preset.id
                                ? preset.swatch
                                : 'transparent',
                          }}
                          title={preset.label}
                        >
                          {watchedValues.theme.primaryColor === preset.id && (
                            <Check className='size-3 text-white' />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font */}
                  <FormField
                    control={form.control}
                    name='theme.font'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Font Family</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select Font' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fontOptions.map((font) => (
                              <SelectItem key={font.id} value={font.id}>
                                {font.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {/* shadcn Components */}
                  <div className='space-y-3'>
                    <Label className='text-sm font-medium'>
                      shadcn/ui Components
                    </Label>
                    <p className='text-xs text-muted-foreground'>
                      Select components to include in your project.
                    </p>
                    {shadcnComponentCategories.map((category) => (
                      <div key={category} className='space-y-2'>
                        <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                          {category}
                        </p>
                        <div className='flex flex-wrap gap-1.5'>
                          {shadcnComponents
                            .filter((c) => c.category === category)
                            .map((comp) => {
                              const isSelected =
                                watchedValues.theme.components?.includes(
                                  comp.id,
                                ) ?? false;
                              return (
                                <button
                                  key={comp.id}
                                  type='button'
                                  onClick={() => {
                                    const current =
                                      form.getValues('theme.components') || [];
                                    const next = isSelected
                                      ? current.filter((c) => c !== comp.id)
                                      : [...current, comp.id];
                                    form.setValue('theme.components', next, {
                                      shouldValidate: true,
                                    });
                                  }}
                                  className={cn(
                                    'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                                    isSelected
                                      ? 'border-primary bg-primary text-primary-foreground'
                                      : 'border-border bg-background hover:border-primary/50 hover:bg-accent',
                                  )}
                                >
                                  {comp.label}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                    <div className='flex gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          form.setValue(
                            'theme.components',
                            shadcnComponents.map((c) => c.id),
                            { shouldValidate: true },
                          );
                        }}
                      >
                        Select All
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          form.setValue('theme.components', [], {
                            shouldValidate: true,
                          });
                        }}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {warnings.length > 0 && (
                <div className='space-y-3'>
                  {warnings.map((warning) => (
                    <Alert
                      variant='destructive'
                      key={warning}
                      className='border-yellow-600/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400'
                    >
                      <AlertTriangle className='h-4 w-4' />
                      <AlertTitle>Compatibility Warning</AlertTitle>
                      <AlertDescription>{warning}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Action Tabs: Download / CLI / Manual Steps */}
              <Tabs defaultValue='download' className='w-full'>
                <TabsList className='grid w-full grid-cols-3'>
                  <TabsTrigger value='download' className='gap-1.5'>
                    <Download className='size-3.5' />
                    <span className='hidden sm:inline'>Download</span>
                  </TabsTrigger>
                  <TabsTrigger value='cli' className='gap-1.5'>
                    <Terminal className='size-3.5' />
                    <span className='hidden sm:inline'>CLI</span>
                  </TabsTrigger>
                  <TabsTrigger value='manual' className='gap-1.5'>
                    <FileCode className='size-3.5' />
                    <span className='hidden sm:inline'>Manual</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='download' className='space-y-3 mt-4'>
                  <Button
                    type='submit'
                    className='w-full'
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className='mr-2 h-4 w-4' />
                        Download ZIP
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value='cli' className='space-y-3 mt-4'>
                  <p className='text-sm text-muted-foreground'>
                    Run this command to generate your project via CLI:
                  </p>
                  <CommandBlock
                    commands={generateCommands(watchedValues).cli}
                    onCopy={() => analytics.trackCommandCopied('cli')}
                  />
                </TabsContent>

                <TabsContent value='manual' className='space-y-4 mt-4'>
                  <p className='text-sm text-muted-foreground'>
                    Follow these steps to set up your project manually:
                  </p>
                  {generateCommands(watchedValues).manual.map((step, idx) => (
                    <div key={step.label} className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary'>
                          {idx + 1}
                        </span>
                        <p className='text-xs font-semibold text-foreground'>
                          {step.label}
                        </p>
                      </div>
                      {step.description && (
                        <p className='ml-7 text-xs text-muted-foreground'>
                          {step.description}
                        </p>
                      )}
                      <div className='ml-7'>
                        <CommandBlock
                          commands={step.command}
                          onCopy={() =>
                            analytics.trackCommandCopied(`manual-${step.label}`)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Live Preview Panel */}
      <div className='hidden lg:block sticky top-6'>
        <Card className='max-h-[calc(100vh-3rem)] flex flex-col'>
          <CardContent className='p-4 flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full'>
            <ProjectPreview formValues={watchedValues} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
