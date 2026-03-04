import Image from 'next/image';
import { Github } from 'lucide-react';
import Link from 'next/link';

const logos = [
  { name: 'Vercel' },
  { name: 'Supabase' },
  { name: 'Tailwind' },
  { name: 'Prisma' },
  { name: 'Turborepo' },
];

export function FooterSection() {
  return (
    <>
      {/* Powered-by logos strip */}
      <div className='border-t border-border/40 bg-card py-12'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <p className='text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8'>
            Powering next-gen applications with
          </p>
          <div className='flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-50 hover:opacity-80 transition-opacity duration-500'>
            {logos.map((logo) => (
              <span
                key={logo.name}
                className='text-xl font-bold text-muted-foreground'
              >
                {logo.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className='relative border-t border-border/40'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='flex flex-col items-center justify-between gap-6 py-8 md:flex-row'>
            <div className='flex items-center gap-2'>
              <Image
                src='/brand/logo.svg'
                alt='VForge logo'
                width={24}
                height={24}
                className='h-6 w-6 rounded-md invert-100 dark:invert-0'
              />
              <span className='text-sm font-semibold tracking-tight'>
                VFORGE.
              </span>
            </div>

            <p className='text-center text-sm text-muted-foreground'>
              From Visiontillion Labs. Built with Next.js, shadcn/ui, and Tailwind CSS.
            </p>

            <div className='flex items-center gap-5'>
              <Link
                href='/#features'
                className='text-sm text-muted-foreground transition-colors hover:text-foreground'
              >
                Features
              </Link>
              <Link
                href='/generator'
                className='text-sm text-muted-foreground transition-colors hover:text-foreground'
              >
                Generator
              </Link>
              <a
                href='https://github.com/visiontillion-labs/forge'
                target='_blank'
                rel='noopener noreferrer'
                className='text-muted-foreground transition-colors hover:text-foreground'
              >
                <Github className='h-4 w-4' />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
