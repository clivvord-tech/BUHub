import { Suspense } from 'react';
import MessagesClient from '@/components/MessagesClient';

export default function MessagesPage() {
  return (
    <div className="h-screen flex flex-col">
      <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
        <MessagesClient />
      </Suspense>
    </div>
  );
}
