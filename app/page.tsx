import React from 'react';
import { FeedList } from '@/components/feed/FeedList';

export default function HomePage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <FeedList />
    </main>
  );
}

