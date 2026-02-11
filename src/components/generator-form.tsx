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
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

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
  ai: z.enum(['none', 'vercel-ai-sdk']),
  monitoring: z.enum(['none', 'sentry', 'posthog', 'logrocket']),
  i18n: z.enum(['none', 'next-intl', 'react-i18next']),
  seo: z.boolean(),
  testing: z.boolean(),
});

export function GeneratorForm() {
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
      },
      auth: 'none',
      database: 'none',
      api: 'none',
      state: 'none',
      payment: 'none',
      ai: 'none',
      monitoring: 'none',
      i18n: 'none',
      seo: false,
      testing: false,
    },
  });

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
    } catch (error) {
      console.error(error);
      alert('Failed to generate project');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle>Configure Your Next.js Application</CardTitle>
        <CardDescription>
          Select from a wide range of features to boost your development.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            {/* Core Settings */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
                        defaultValue={field.value}
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
                        defaultValue={field.value}
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
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Auth Provider' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='none'>None</SelectItem>
                        <SelectItem value='authjs'>Auth.js (v5)</SelectItem>
                        <SelectItem value='next-auth'>NextAuth (v4)</SelectItem>
                        <SelectItem value='clerk'>Clerk</SelectItem>
                        <SelectItem value='supabase'>Supabase</SelectItem>
                        <SelectItem value='firebase'>Firebase</SelectItem>
                        <SelectItem value='better-auth'>Better Auth</SelectItem>
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
                      defaultValue={field.value}
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
                      defaultValue={field.value}
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
                      defaultValue={field.value}
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
                      defaultValue={field.value}
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
                name='ai'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Integration</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                    <FormLabel>Monitoring</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                    <FormLabel>Localization</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Localization' />
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
                      <FormLabel className='text-base'>Tailwind CSS</FormLabel>
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
            </div>

            <Button type='submit' className='w-full' disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Generating...
                </>
              ) : (
                'Generate Project'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
