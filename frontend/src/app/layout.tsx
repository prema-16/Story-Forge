import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'StoryForge AI — AI YouTube Video Generation Platform',
    template: '%s | StoryForge AI',
  },
  description:
    'Transform a single idea into a complete YouTube-ready video project with AI. Generate scripts, scenes, voiceovers, thumbnails, and SEO in minutes.',
  keywords: ['AI video generation', 'YouTube automation', 'AI script writer', 'video production AI'],
  authors: [{ name: 'StoryForge AI' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'StoryForge AI',
    description: 'AI-powered YouTube video production studio',
    siteName: 'StoryForge AI',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="bg-mesh" aria-hidden="true" />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(10, 10, 26, 0.95)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              fontSize: '14px',
              borderRadius: '10px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}
