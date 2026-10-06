'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Check, CheckCircle2, CreditCard, LoaderCircle, Smartphone, XCircle } from 'lucide-react';
import { PLANS, type Plan, type PlanType } from '@/lib/types';
import { useI18n } from '@/lib/i18n';

type Method = 'mobile_money' | 'airtel_money' | 'card';

const METHODS: { id: Method; label: string; hint: string; icon: typeof Smartphone }[] = [
  { id: 'mobile_money', label: 'MTN MoMo', hint: 'Approve with your MoMo PIN', icon: Smartphone },
  { id: 'airtel_money', label: 'Airtel Money', hint: 'Approve with your Airtel PIN', icon: Smartphone },
  { id: 'card', label: 'Card', hint: 'Visa or Mastercard', icon: CreditCard },
];

const STORAGE_KEY = 'ibyegeranyo:pending-payment';
const POLL_MS = 5000;

function readStoredReference(): string | undefined {
  try { return sessionStorage.getItem(STORAGE_KEY) || undefined; } catch { return undefined; }
}
function storeReference(reference?: string) {
  try {
    if (reference) sessionStorage.setItem(STORAGE_KEY, reference);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable; polling still works for this page view.
  }
}

export function PaymentFlow({ initialPlan = 'monthly', documentaryId }: { initialPlan?: PlanType; documentaryId?: string }) {
  const { locale, t } = useI18n();
  const [plan, setPlan] = useState<PlanType>(initialPlan);
  const [method, setMethod] = useState<Method>('mobile_money');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'plan' | 'method'>('plan');
  const [reference, setReference] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const selected = useMemo<Plan>(() => PLANS.find((item) => item.id === plan)!, [plan]);
  const formatDays = (days: number) => (locale === 'rw' ? `${t('days')} ${days}` : `${days} ${t('days')}`);

  useEffect(() => {
    fetch('/api/me').then((r) => r.json()).then((data) => {
      if (!data.user) return;
      if (data.user.phone) setPhone((current) => current || data.user.phone);
      // Resume a payment that was in progress before a reload.
      const stored = readStoredReference();
      if (stored) setReference((current) => current || stored);
    }).catch(() => undefined);
  }, []);

  async function pay(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError(undefined);
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, method, phone, email, documentaryId: plan === 'single' ? documentaryId : undefined }),
      });
      const data = await response.json();
      if (!response.ok) {
        // The prompt may have gone out even though we couldn't confirm it:
        // keep watching that payment rather than inviting a second one.
        if (data.reference) { storeReference(data.reference); setNotice(data.error); setReference(data.reference); return; }
        throw new Error(data.error || 'Could not start your payment.');
      }
      storeReference(data.reference);
      if (data.paymentUrl) { window.location.href = data.paymentUrl; return; }
      setNotice(data.message);
      setReference(data.reference);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'A network error occurred.');
    } finally {
      setBusy(false);
    }
  }

  if (reference) {
    return (
      <PaymentStatusWatcher
        reference={reference}
        notice={notice}
        onRetry={() => { storeReference(undefined); setReference(undefined); setNotice(undefined); setStep('method'); }}
      />
    );
  }

  const steps = [t('chooseAccess'), t('Payment method'), t('Approve payment')];
  const currentStep = step === 'plan' ? 0 : 1;

  return (
    <div className="glass flex flex-col gap-8 rounded-3xl p-6 sm:p-8 md:p-10">
      <ol className="grid grid-cols-3 gap-2" aria-label="Progress">
        {steps.map((label, index) => {
          const done = index < currentStep;
          const current = index === currentStep;
          return (
            <li key={index} aria-current={current ? 'step' : undefined} className="flex min-w-0 flex-col gap-2">
              <span className={`h-1.5 rounded-full transition-colors ${done || current ? 'bg-gold' : 'bg-white/10'}`} />
              <span className={`flex min-w-0 items-center gap-1.5 text-xs font-medium ${current ? 'text-white' : 'text-text-muted'}`}>
                {done ? <Check size={12} strokeWidth={3} className="shrink-0 text-gold" /> : <span className="shrink-0">{index + 1}.</span>}
                <span className="truncate">{label}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <h2 className="font-display text-3xl text-white md:text-4xl">{step === 'plan' ? t('chooseAccess') : t('Payment method')}</h2>

      {step === 'plan' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {PLANS.filter((item) => !documentaryId || item.id === 'single').map((item) => {
              const isSelected = plan === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setPlan(item.id)}
                  aria-pressed={isSelected}
                  className={`relative flex flex-col items-start rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 md:p-6 ${
                    isSelected ? 'border-gold/60 bg-gold/[0.06]' : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  <span className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 ${isSelected ? 'border-gold bg-gold text-background' : 'border-white/25'}`}>
                    {isSelected && <Check size={11} strokeWidth={3.5} />}
                  </span>
                  <span className="pr-8 text-base font-semibold text-white">{t(item.name)}</span>
                  <span className="mt-4 text-3xl font-bold text-white">
                    {item.price.toLocaleString()} <small className="text-sm font-medium text-text-muted">RWF</small>
                  </span>
                  <span className="mt-2 text-sm leading-6 text-text-muted">{t(item.description)}</span>
                  <span className="mt-4 inline-flex rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-text-secondary">{formatDays(item.duration)}</span>
                </button>
              );
            })}
          </div>
          <button onClick={() => setStep('method')} className="btn-primary h-14 w-full text-base">
            {`Continue with ${selected.price.toLocaleString()} RWF`}
          </button>
        </>
      ) : (
        <form onSubmit={pay} className="flex flex-col gap-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {METHODS.map((item) => {
              const isSelected = method === item.id;
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setMethod(item.id)}
                  aria-pressed={isSelected}
                  className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors ${
                    isSelected ? 'border-gold/60 bg-gold/[0.06]' : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  <Icon size={20} className={isSelected ? 'text-gold' : 'text-white/60'} />
                  <span className="font-semibold text-white">{item.label}</span>
                  <span className="text-xs text-text-muted">{t(item.hint)}</span>
                </button>
              );
            })}
          </div>

          {method === 'card' ? (
            <label className="flex flex-col gap-2 text-sm text-text-muted">
              {t('Email for your receipt')}
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" autoComplete="email" />
            </label>
          ) : (
            <label className="flex flex-col gap-2 text-sm text-text-muted">
              {t(method === 'airtel_money' ? 'Airtel Money number' : 'MTN MoMo number')}
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="07XXXXXXXX" autoComplete="tel" inputMode="tel" />
            </label>
          )}

          <div className="flex items-center justify-between rounded-2xl border border-gold/25 bg-gold/[0.04] px-5 py-4 text-sm">
            <span className="text-text-muted">{t(selected.name)}</span>
            <span className="font-semibold text-white">{selected.price.toLocaleString()} RWF</span>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button type="button" onClick={() => setStep('plan')} className="btn-secondary h-14 sm:w-40">{t('Back')}</button>
            <button type="submit" disabled={busy} className="btn-primary h-14 flex-1 text-base">
              {busy ? <><LoaderCircle size={18} className="animate-spin" /><span>{t('Starting payment…')}</span></> : `${t('Pay')} ${selected.price.toLocaleString()} RWF`}
            </button>
          </div>
        </form>
      )}
      {error && <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-300">{error}</p>}
    </div>
  );
}

/** Polls a payment until iTechPay confirms or fails it. */
export function PaymentStatusWatcher({ reference, notice, onRetry }: { reference: string; notice?: string; onRetry?: () => void }) {
  const { t } = useI18n();
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');
  const [detail, setDetail] = useState<string>();

  useEffect(() => {
    let stopped = false;
    let timer: number | undefined;
    async function check() {
      try {
        const response = await fetch(`/api/payments/status/${encodeURIComponent(reference)}`, { cache: 'no-store' });
        const data = await response.json();
        if (stopped) return;
        if (response.status === 404 || response.status === 401) {
          storeReference(undefined); setStatus('failed'); setDetail(data.error); return;
        }
        if (data.status === 'confirmed') { storeReference(undefined); setStatus('confirmed'); return; }
        if (data.status === 'failed' || data.status === 'rejected') { storeReference(undefined); setStatus('failed'); setDetail(data.detail); return; }
      } catch {
        // Network blip: keep polling.
      }
      if (!stopped) timer = window.setTimeout(check, POLL_MS);
    }
    check();
    return () => { stopped = true; window.clearTimeout(timer); };
  }, [reference]);

  if (status === 'confirmed') {
    return (
      <div className="glass flex flex-col items-center gap-4 rounded-3xl p-8 text-center md:p-12">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 ring-8 ring-emerald-500/5">
          <CheckCircle2 size={40} />
        </span>
        <h2 className="max-w-lg text-lg font-semibold text-white">{t('Payment confirmed. Your access is active.')}</h2>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link href="/documentaries" className="btn-primary">{t('Browse Documentaries')}</Link>
          <Link href="/account" className="btn-secondary">{t('account')}</Link>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="glass flex flex-col items-center gap-4 rounded-3xl p-8 text-center md:p-12">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-danger/15 text-red-300 ring-8 ring-danger/5">
          <XCircle size={40} />
        </span>
        <h2 className="max-w-lg text-lg font-semibold text-white">{t('The payment was not completed.')}</h2>
        <p className="max-w-lg text-text-muted">{t('No access was granted. If money left your account, it will be matched automatically; contact us if access does not appear within a day.')}</p>
        {detail && <p className="text-xs text-text-muted">{detail}</p>}
        {onRetry ? (
          <button onClick={onRetry} className="btn-primary mt-2">{t('Try again')}</button>
        ) : (
          <Link href="/register" className="btn-primary mt-2">{t('Try again')}</Link>
        )}
      </div>
    );
  }

  return (
    <div className="glass flex flex-col items-center gap-4 rounded-3xl p-8 text-center md:p-12">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/15 text-gold ring-8 ring-gold/5">
        <Smartphone size={36} />
      </span>
      <h2 className="max-w-lg text-lg font-semibold text-white">{t('Waiting for your payment')}</h2>
      <p className="max-w-lg text-text-muted">{notice || t('Approve the payment on your phone or in the payment window. This page updates by itself.')}</p>
      <LoaderCircle size={22} className="animate-spin text-text-muted" aria-label={t('Checking payment status')} />
    </div>
  );
}
