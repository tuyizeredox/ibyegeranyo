import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="container flex min-h-[75vh] flex-col items-center justify-center gap-5 py-20 text-center">
        <p className="bg-gradient-to-b from-white to-white/10 bg-clip-text font-display text-[clamp(6rem,20vw,12rem)] font-semibold leading-none text-transparent">
          404
        </p>
        <h1 className="font-display text-3xl text-white md:text-5xl">Page not found</h1>
        <p className="max-w-md text-text-muted">The page you are looking for does not exist or has moved.</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn-primary group">
            <span>Home</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/documentaries" className="btn-secondary">Browse Documentaries</Link>
        </div>
      </div>
    </div>
  );
}
