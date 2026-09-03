import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ClientShell } from '@/components/layout/ClientShell';

export const metadata: Metadata = {
  title: 'NOD — Accessible Social Platform & WebMCP Agent Experience',
  description: 'Say less. Do more. An agent-native reading and publishing platform for individuals with dyslexia, ADHD, and motor impairments.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-bg text-brand-text font-lexend antialiased selection:bg-brand-green/20 selection:text-brand-text">
        <ClientShell>
          {children}
        </ClientShell>
      </body>
    </html>
  );
}
