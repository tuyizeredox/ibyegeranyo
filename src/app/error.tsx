'use client';

import Link from 'next/link';
import { RotateCw, TriangleAlert } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  void error;
  return (
    <div className="relative isolate overflow-hidden">
      <div className="container flex min-h-[70vh] flex-col items-center justify-center gap-5 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
          <TriangleAlert size={28} />
        </span>
        <h1 className="font-display text-4xl text-white md:text-5xl">Unable to load this page</h1>
        <p className="max-w-md text-text-muted">Please check your connection and try again.</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <button onClick={reset} className="btn-primary">
            <RotateCw size={16} />
            <span>Try again</span>
          </button>
          <Link href="/" className="btn-secondary">Home</Link>
        </div>
      </div>
    </div>
  );
}
