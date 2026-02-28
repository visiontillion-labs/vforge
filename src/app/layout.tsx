import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
import { PostHogProvider } from '@/components/providers/posthog-provider';
import { ThemeProvider } from 'next-themes';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'VForge - Next.js Generator by Visiontillion Labs',
  description:
    'VForge by Visiontillion Labs helps you configure auth, database, payments, AI, and more, then generate production-ready Next.js code.',
  openGraph: {
    title: 'VForge - Next.js Generator by Visiontillion Labs',
    description:
      'Configure auth, database, payments, AI, and more — then generate production-ready Next.js code with VForge.',
    siteName: 'VForge',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        {plausibleDomain && (
          <Script
            defer
            data-domain={plausibleDomain}
            src='https://plausible.io/js/script.js'
            strategy='afterInteractive'
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <PostHogProvider>
            <TooltipProvider>
              {children}
              <Toaster position='bottom-right' richColors />
            </TooltipProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
