import { Suspense } from 'react';
import { GeneratorForm } from '@/components/generator-form';
import { Navbar } from '@/components/navbar';
import { FooterSection } from '@/components/footer-section';

export const metadata = {
  title: 'Generator — VForge',
  description:
    'Configure your Next.js boilerplate with auth, database, payments, AI and more. Generate production-ready code in seconds.',
};

export default function GeneratorPage() {
  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <Navbar />

      <main className='grow relative'>
        {/* Background accents */}
        <div className='pointer-events-none absolute inset-0 -z-10 overflow-hidden'>
          <div className='absolute inset-0 grid-pattern opacity-40' />
          <div className='absolute right-[10%] top-[10%] h-[500px] w-[500px] rounded-full bg-foreground/3 blur-[100px]' />
          <div className='absolute bottom-[10%] left-[10%] h-[400px] w-[400px] rounded-full bg-foreground/3 blur-[100px]' />
        </div>

        <section className='relative z-10 py-12 md:py-16'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <div className='mb-14 space-y-4 text-center'>
              <p className='text-sm font-medium tracking-widest uppercase text-muted-foreground'>
                Configure & Generate
              </p>
              <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
                Build Your{' '}
                <span className='underline decoration-foreground/20 underline-offset-4'>
                  Perfect Stack
                </span>
              </h1>
              <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
                Select your preferred tools and frameworks, then download a
                production-ready project or get the CLI command.
              </p>
            </div>

            <Suspense fallback={null}>
              <GeneratorForm />
            </Suspense>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
