'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, LoaderCircle, Lock, Phone, Sparkles, UserRound } from 'lucide-react';
import { PaymentFlow } from '@/components/PaymentFlow';
import { AuthShell, Field, PasswordInput, authCardClass } from '@/components/AuthShell';
import { PLANS, type PlanType } from '@/lib/types';
import { useI18n } from '@/lib/i18n';

function RegisterForm() {
  const router = useRouter();
  const search = useSearchParams();
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const plan = (search.get('plan') || 'monthly') as PlanType;
  const doc = search.get('doc') || undefined;
  const selectedPlan = PLANS.find((item) => item.id === (doc ? 'single' : plan));

  useEffect(() => {
    fetch('/api/me').then((r) => r.json()).then((data) => { if (data.user) setDone(true); }).catch(() => undefined);
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(e.currentTarget);
    try {
      const body = Object.fromEntries(form);
      let r = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, plan }) });
      let d = await r.json();
      if (!r.ok) throw new Error(d.error);
      r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: body.phone, password: body.password }) });
      d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not register.');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="container max-w-3xl py-12 md:py-16">
        <PaymentFlow initialPlan={doc ? 'single' : plan} documentaryId={doc} />
      </div>
    );
  }

  return (
    <AuthShell>
      <form onSubmit={submit} className={authCardClass}>
        <h1 className="font-display text-4xl text-white">Create your account</h1>

        {selectedPlan && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <Sparkles size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.14em] text-text-muted">{t('Selected plan')}</p>
                <p className="truncate font-semibold text-white">
                  {t(selectedPlan.name)} · {selectedPlan.price.toLocaleString()} RWF
                </p>
              </div>
            </div>
            {!doc && (
              <Link href="/pricing" className="shrink-0 text-sm font-medium text-gold hover:underline">
                {t('Change')}
              </Link>
            )}
          </div>
        )}

        <Field label="Full name" icon={UserRound}>
          <input required name="fullName" className="input pl-11" autoComplete="name" />
        </Field>
        <Field label="Rwanda phone number" icon={Phone}>
          <input required name="phone" className="input pl-11" placeholder="078 123 4567" inputMode="tel" autoComplete="tel" />
        </Field>
        <Field label="Password" icon={Lock} hint="At least 6 characters.">
          <PasswordInput required name="password" minLength={6} autoComplete="new-password" />
        </Field>
        {error && (
          <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}
        <button disabled={busy} className="btn-primary w-full">
          {busy ? <LoaderCircle size={18} className="animate-spin" /> : null}
          <span>{busy ? 'Creating account…' : 'Continue to payment'}</span>
          {!busy && <ArrowRight size={18} />}
        </button>
        <p className="border-t border-white/[0.08] pt-6 text-center text-sm text-text-muted">
          <span>Already a member?</span>{' '}
          <Link href="/login" className="font-medium text-white underline decoration-gold/60 underline-offset-4 hover:decoration-gold">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="container py-16"><div className="skeleton mx-auto h-[32rem] max-w-md" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
