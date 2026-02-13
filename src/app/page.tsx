import { GeneratorForm } from '@/components/generator-form';

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-background'>
      <div className='z-10 w-full max-w-7xl items-center justify-center flex flex-col gap-8'>
        <div className='text-center space-y-4'>
          <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl'>
            Next.js Forge
          </h1>
          <p className='text-xl text-muted-foreground max-w-[600px]'>
            The ultimate comprehensive boilerplate generator for your new
            Next.js projects. Configure, click, and code.
          </p>
        </div>

        <GeneratorForm />

        <footer className='text-sm text-muted-foreground mt-8'>
          Built with Next.js, shadcn/ui, and Tailwind CSS.
        </footer>
      </div>
    </main>
  );
}
