import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className='relative py-24 md:py-32'>
      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div className='animate-blob-1 absolute right-[10%] top-[10%] h-[500px] w-[500px] rounded-full bg-foreground/3 blur-[100px]' />
        <div className='animate-blob-2 absolute bottom-[10%] left-[10%] h-[400px] w-[400px] rounded-full bg-foreground/3 blur-[100px]' />
      </div>

      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 md:p-16 text-center'>
          <div className='pointer-events-none absolute inset-0 grid-pattern opacity-30' />

          <div className='relative z-10'>
            <p className='text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4'>
              Configure & Generate
            </p>
            <h2 className='text-3xl font-bold tracking-tight sm:text-4xl mb-4'>
              Build Your{' '}
              <span className='underline decoration-foreground/20 underline-offset-4'>
                Perfect Stack
              </span>
            </h2>
            <p className='mx-auto max-w-2xl text-lg text-muted-foreground mb-8'>
              Select your preferred tools and frameworks, then download a
              production-ready project or get the CLI command.
            </p>
            <Link href='/generator'>
              <Button size='lg' className='gap-2 px-8 h-12 text-base shadow-lg'>
                Open Generator
                <ArrowRight className='h-4 w-4' />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
