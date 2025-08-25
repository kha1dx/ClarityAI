import type { Metadata, Viewport } from 'next';

const baseUrl = process.env.NODE_ENV === 'production' 
  ? 'https://promptstudio.khal1dx.com'
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'Prompt Studio - Perfect AI Prompts Every Time',
  description: 'Transform your ideas into perfect prompts with AI-powered precision. Create, optimize, and manage prompts for any AI model.',
  keywords: 'AI prompts, prompt engineering, AI tools, prompt optimization, ChatGPT prompts, Claude prompts',
  authors: [{ name: 'Prompt Studio Team' }],
  openGraph: {
    title: 'Prompt Studio - Perfect AI Prompts Every Time',
    description: 'Transform your ideas into perfect prompts with AI-powered precision',
    url: baseUrl,
    siteName: 'Prompt Studio',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Prompt Studio Platform'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prompt Studio - Perfect AI Prompts Every Time',
    description: 'Transform your ideas into perfect prompts with AI-powered precision',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}