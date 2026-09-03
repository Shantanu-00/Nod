import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ClientShell } from '@/components/layout/ClientShell';

export const metadata: Metadata = {
  title: 'NOD — Accessible Social Platform & WebMCP Agent Experience',
  description: 'Say less. Do more. An agent-native reading and publishing platform for individuals with dyslexia, ADHD, and motor impairments.',
  icons: {
    icon: '/favicon.ico',
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
