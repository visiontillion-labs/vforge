'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Github, Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className='sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl'>
      <nav className='mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8'>
        {/* Logo */}
        <div className='flex items-center gap-3'>
          <Link href='/' className='flex items-center gap-2.5'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-foreground'>
              <span className='text-sm font-bold text-background'>O</span>
            </div>
            <span className='text-lg font-bold tracking-tight'>ORIUMS.</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <div className='hidden md:flex flex-1 justify-end items-center gap-8'>
          <div className='flex items-center gap-6'>
            <Link
              href='/#features'
              className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
            >
              Features
            </Link>
            <Link
              href='/generator'
              className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
            >
              Generator
            </Link>
            <a
              href='https://github.com/mustaquenadim/oriums-boilerplate'
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
            >
              GitHub
            </a>
          </div>

          <div className='h-6 w-px bg-border' />

          <div className='flex items-center gap-2'>
            <a
              href='https://github.com/mustaquenadim/oriums-boilerplate'
              target='_blank'
              rel='noopener noreferrer'
            >
              <Button variant='ghost' size='icon' className='h-9 w-9'>
                <Github className='h-4 w-4' />
              </Button>
            </a>

            {mounted && (
              <Button
                variant='ghost'
                size='icon'
                className='h-9 w-9'
                onClick={() =>
                  setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
                }
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className='h-4 w-4' />
                ) : (
                  <Moon className='h-4 w-4' />
                )}
              </Button>
            )}

            <Link href='/generator'>
              <Button size='sm' className='ml-1 px-4'>
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile toggle */}
        <div className='flex items-center gap-2 md:hidden'>
          {mounted && (
            <Button
              variant='ghost'
              size='icon'
              className='h-9 w-9'
              onClick={() =>
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
              }
            >
              {resolvedTheme === 'dark' ? (
                <Sun className='h-4 w-4' />
              ) : (
                <Moon className='h-4 w-4' />
              )}
            </Button>
          )}
          <Button
            variant='ghost'
            size='icon'
            className='h-9 w-9'
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className='md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl px-6 py-4 space-y-3'>
          <Link
            href='/#features'
            className='block text-sm font-medium text-muted-foreground hover:text-foreground'
            onClick={() => setMobileOpen(false)}
          >
            Features
          </Link>
          <Link
            href='/generator'
            className='block text-sm font-medium text-muted-foreground hover:text-foreground'
            onClick={() => setMobileOpen(false)}
          >
            Generator
          </Link>
          <a
            href='https://github.com/mustaquenadim/oriums-boilerplate'
            target='_blank'
            rel='noopener noreferrer'
            className='block text-sm font-medium text-muted-foreground hover:text-foreground'
          >
            GitHub
          </a>
          <div className='pt-2'>
            <Link href='/generator' onClick={() => setMobileOpen(false)}>
              <Button size='sm' className='w-full'>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
