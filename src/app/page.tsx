import { Suspense } from 'react';
import { GeneratorForm } from '@/components/generator-form';
import { ThemeCustomizer } from '@/components/theme-customizer';

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-background'>
      <div className='z-10 w-full max-w-7xl items-center justify-center flex flex-col gap-8'>
        <div className='text-center space-y-4'>
          <div className='flex items-center justify-center gap-3'>
            <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl'>
              Next.js Forge
            </h1>
          </div>
          <p className='text-xl text-muted-foreground max-w-[600px]'>
            The ultimate comprehensive boilerplate generator for your new
            Next.js projects. Configure, click, and code.
          </p>
          <div className='flex items-center justify-center gap-2'>
            <ThemeCustomizer />
          </div>
        </div>

        <Suspense fallback={null}>
          <GeneratorForm />
        </Suspense>

        <footer className='text-sm text-muted-foreground mt-8 flex items-center gap-2'>
          <span>Built with Next.js, shadcn/ui, and Tailwind CSS.</span>
          <span className='text-muted-foreground/50'>|</span>
          <a
            href='https://github.com/Oriums/oriums-boilerplate'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:text-foreground transition-colors underline underline-offset-4'
          >
            GitHub
          </a>
        </footer>
      </div>
    </main>
  );
}
