import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
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
  const clarityProjectId =
    process.env.CLARITY_PROJECT_ID || process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

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
        {clarityProjectId && (
          <Script id='microsoft-clarity' strategy='afterInteractive'>
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${clarityProjectId}");`}
          </Script>
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
          <TooltipProvider>
            {children}
            <Toaster position='bottom-right' richColors />
          </TooltipProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
