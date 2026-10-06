'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, LoaderCircle, Lock, Phone } from 'lucide-react';
import { AuthShell, Field, PasswordInput, authCardClass } from '@/components/AuthShell';

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      router.push(search.get('next') || '/account');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <form onSubmit={submit} className={authCardClass}>
        <h1 className="font-display text-4xl text-white">Welcome back</h1>
        <Field label="Phone number" icon={Phone}>
          <input required name="phone" className="input pl-11" inputMode="tel" autoComplete="tel" placeholder="078 123 4567" />
        </Field>
        <Field label="Password" icon={Lock}>
          <PasswordInput required name="password" autoComplete="current-password" />
        </Field>
        {error && (
          <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}
        <button disabled={busy} className="btn-primary w-full">
          {busy ? <LoaderCircle size={18} className="animate-spin" /> : null}
          <span>{busy ? 'Signing in…' : 'Log in'}</span>
          {!busy && <ArrowRight size={18} />}
        </button>
        <p className="border-t border-white/[0.08] pt-6 text-center text-sm text-text-muted">
          <span>New here?</span>{' '}
          <Link href="/register" className="font-medium text-white underline decoration-gold/60 underline-offset-4 hover:decoration-gold">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container py-16"><div className="skeleton mx-auto h-96 max-w-md" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
