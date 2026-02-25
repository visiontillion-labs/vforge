'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Copy, Check } from 'lucide-react';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

export function HeroSection() {
  const [copied, setCopied] = useState(false);

  const copyCommand = useCallback(async () => {
    try {
      await navigator.clipboard.writeText('npx create-forge-app my-app');
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, []);

  return (
    <section className='relative overflow-hidden'>
      {/* Background layer */}
      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div className='animate-blob-1 absolute -top-40 left-[15%] h-[600px] w-[600px] rounded-full bg-foreground/3 blur-[100px]' />
        <div className='animate-blob-2 absolute -top-20 right-[15%] h-[500px] w-[500px] rounded-full bg-foreground/3 blur-[100px]' />
        <div className='animate-blob-3 absolute top-40 left-[40%] h-[400px] w-[400px] rounded-full bg-foreground/3 blur-[100px]' />
      </div>

      <div className='mx-auto max-w-7xl px-6 lg:px-8 pb-24 pt-20 md:pb-32 md:pt-28'>
        <div className='flex flex-col items-center text-center max-w-3xl mx-auto'>
          {/* Badge */}
          <div className='animate-fade-in-up mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm'>
            <span className='relative flex h-2 w-2'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground opacity-75' />
              <span className='relative inline-flex h-2 w-2 rounded-full bg-foreground' />
            </span>
            Own Your Stack
          </div>

          {/* Title */}
          <h1 className='animate-fade-in-up delay-100 text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6'>
            Build your{' '}
            <span className='underline decoration-foreground/20 underline-offset-4'>
              foundation
            </span>
          </h1>

          {/* Subtitle */}
          <p className='animate-fade-in-up delay-200 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10'>
            Configure the ultimate Next.js starter kit in seconds. Select your
            stack, customize your features, and deploy instantly.
          </p>

          {/* CLI Command Block */}
          <div className='animate-fade-in-up delay-300 mb-8'>
            <button
              onClick={copyCommand}
              className='group flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-5 py-3 font-mono text-sm shadow-sm backdrop-blur-sm transition-all hover:border-border hover:bg-muted/50 hover:shadow-md'
            >
              <span className='text-muted-foreground/60'>$</span>
              <span>npx create-forge-app my-app</span>
              {copied ? (
                <Check className='h-4 w-4 text-foreground' />
              ) : (
                <Copy className='h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground' />
              )}
            </button>
          </div>

          {/* CTA Buttons */}
          <div className='animate-fade-in-up delay-400 flex flex-wrap items-center justify-center gap-3'>
            <Link href='/generator'>
              <Button size='lg' className='gap-2 px-6 h-12 text-base shadow-lg'>
                Configure Your Stack
                <ArrowRight className='h-4 w-4' />
              </Button>
            </Link>
            <a
              href='https://github.com/visiontillion-labs/forge'
              target='_blank'
              rel='noopener noreferrer'
            >
              <Button
                variant='outline'
                size='lg'
                className='gap-2 px-6 h-12 text-base'
              >
                Star on GitHub
              </Button>
            </a>
          </div>
        </div>

        {/* Code Preview Card */}
        <div className='animate-fade-in-up delay-500 relative mt-20 w-full max-w-2xl mx-auto'>
          <div className='animate-soft-pulse absolute -inset-px rounded-xl bg-foreground/5 blur-xl' />

          <div className='relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl shadow-black/8 dark:shadow-black/30'>
            {/* Window bar */}
            <div className='flex items-center justify-between border-b border-border/40 bg-muted/40 px-4 py-3'>
              <div className='flex gap-1.5'>
                <div className='h-3 w-3 rounded-full bg-foreground/20' />
                <div className='h-3 w-3 rounded-full bg-foreground/15' />
                <div className='h-3 w-3 rounded-full bg-foreground/10' />
              </div>
              <div className='text-xs font-mono text-muted-foreground font-medium'>
                config.ts
              </div>
              <div className='w-8' />
            </div>

            {/* Code */}
            <div className='p-5 font-mono text-[13px] leading-7'>
              <p>
                <span className='text-muted-foreground'>export const</span>{' '}
                <span className='text-foreground'>config</span> ={' '}
                <span className='text-foreground font-semibold'>
                  createForge
                </span>
                ({'{'}
              </p>
              <p className='pl-6'>
                <span className='text-foreground/50'>router</span>:{' '}
                <span className='text-muted-foreground'>&quot;app&quot;</span>,
              </p>
              <p className='pl-6'>
                <span className='text-foreground/50'>auth</span>:{' '}
                <span className='text-muted-foreground'>
                  &quot;better-auth&quot;
                </span>
                ,
              </p>
              <p className='pl-6'>
                <span className='text-foreground/50'>database</span>:{' '}
                <span className='text-muted-foreground'>
                  &quot;prisma&quot;
                </span>
                ,
              </p>
              <p className='pl-6'>
                <span className='text-foreground/50'>payment</span>:{' '}
                <span className='text-muted-foreground'>
                  &quot;stripe&quot;
                </span>
                ,
              </p>
              <p className='pl-6'>
                <span className='text-foreground/50'>plugins</span>: [
              </p>
              <p className='pl-12'>
                <span className='text-foreground font-semibold'>shadcnUI</span>
                (), <span className='text-foreground font-semibold'>seo</span>
                (),
              </p>
              <p className='pl-6'>]</p>
              <p>{'}'});</p>
            </div>

            {/* Terminal footer */}
            <div className='bg-foreground px-4 py-3 border-t border-border'>
              <div className='flex items-center gap-2 text-xs font-mono'>
                <span className='text-muted-foreground'>➜</span>
                <span className='text-muted-foreground'>~</span>
                <span className='text-background/40'>
                  Ready to initiate build sequence...
                </span>
                <span className='w-2 h-4 bg-background/50 animate-pulse' />
              </div>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className='animate-fade-in-up delay-500 mt-12 flex items-center justify-center gap-4'>
          <div className='flex -space-x-2'>
            {['A', 'B', 'C', 'D', 'E'].map((label) => (
              <div
                key={label}
                className='inline-flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-background bg-muted text-xs font-bold text-muted-foreground'
              >
                {label}
              </div>
            ))}
          </div>
          <p className='text-sm text-muted-foreground'>
            Trusted by <span className='font-bold text-foreground'>2,000+</span>{' '}
            developers
          </p>
        </div>
      </div>

      {/* Fade into next section */}
      <div className='pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent' />
    </section>
  );
}
