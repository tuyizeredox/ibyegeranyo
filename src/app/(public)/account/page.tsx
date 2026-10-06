'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, CalendarClock, CalendarDays, CircleAlert, Film, Hourglass, Lock, Phone, ShieldCheck } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { PLANS } from '@/lib/types';
import { useI18n } from '@/lib/i18n';

type User = { fullName: string; phone: string; subscriptionStatus: string; selectedPlan: string | null; paymentStatus: string; startDate: string | null; endDate: string | null; expiresAt: string | null; documentaryIds: string[] };

const DAY = 86_400_000;

const tones = {
  active: { icon: ShieldCheck, box: 'bg-emerald-500/15 text-emerald-400' },
  pending: { icon: Hourglass, box: 'bg-amber-500/15 text-amber-400' },
  inactive: { icon: Lock, box: 'bg-white/[0.06] text-white/60' },
};

const paymentBadges: Record<string, string> = { pending: 'badge-warning', confirmed: 'badge-success', rejected: 'badge-danger', failed: 'badge-danger' };

export default function AccountPage() {
  const { t } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = () => fetch('/api/me')
      .then(async (r) => {
        const d = await r.json();
        if (!d.user) { location.href = '/login?next=/account'; return; }
        setUser(d.user);
      })
      .catch(() => setError('Unable to load your account. Please try again.'));
    loadUser();
    // Settle a payment left pending (e.g. the tab was closed before it was
    // confirmed), then refresh if that changed anything.
    fetch('/api/payments/pending')
      .then((r) => r.json())
      .then((d) => { if (d.payment?.changed) loadUser(); })
      .catch(() => undefined);
  }, []);

  if (error) {
    return <div className="container max-w-xl py-20"><EmptyState icon={CircleAlert} title={error} /></div>;
  }
  if (!user) {
    return (
      <div className="container max-w-5xl py-12 md:py-16">
        <div className="skeleton h-20 w-72" />
        <div className="mt-10 grid gap-5 md:grid-cols-5">
          <div className="skeleton h-72 md:col-span-3" />
          <div className="skeleton h-72 md:col-span-2" />
        </div>
      </div>
    );
  }

  const now = new Date();
  const ending = user.expiresAt && new Date(user.expiresAt) < now;
  const pending = user.paymentStatus === 'pending';
  const active = !pending && !ending && user.subscriptionStatus === 'active';
  const tone = tones[pending ? 'pending' : active ? 'active' : 'inactive'];
  const StatusIcon = tone.icon;
  const statusLabel = pending ? 'Payment being confirmed' : ending ? 'Access has ended' : user.subscriptionStatus === 'active' ? 'Full access' : 'No active subscription';
  const plan = PLANS.find((item) => item.id === user.selectedPlan);
  const initials = user.fullName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—');
  const paymentLabel: Record<string, string> = { pending: t('pending'), confirmed: t('Confirmed'), rejected: t('Rejected'), failed: t('Not completed') };

  // Remaining share of the current access window, for the progress bar.
  let progress: { daysLeft: number; percent: number } | null = null;
  if (active && user.startDate && user.expiresAt) {
    const start = new Date(user.startDate).getTime();
    const end = new Date(user.expiresAt).getTime();
    const remaining = Math.max(0, end - now.getTime());
    progress = { daysLeft: Math.ceil(remaining / DAY), percent: end > start ? Math.min(100, (remaining / (end - start)) * 100) : 0 };
  }

  return (
    <div className="relative isolate overflow-hidden">

      <div className="container max-w-5xl py-12 md:py-16">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-gold to-gold-deep text-2xl font-bold text-background">
            {initials}
          </span>
          <div className="flex flex-col items-start gap-2">
            <p className="eyebrow">YOUR ACCOUNT</p>
            <h1 className="font-display text-4xl text-white md:text-5xl">{user.fullName}</h1>
          </div>
        </header>

        <div className="mt-10 grid gap-5 md:grid-cols-5">
          <section className="glass flex flex-col rounded-3xl p-6 md:col-span-3 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-text-muted">{t('Access status')}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{t(statusLabel)}</p>
              </div>
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone.box}`}>
                <StatusIcon size={22} />
              </span>
            </div>

            {progress && (
              <div className="mt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">{t('daysLeft').replace('{n}', String(progress.daysLeft))}</span>
                  <span className="text-text-muted">{Math.round(progress.percent)}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold" style={{ width: `${progress.percent}%` }} />
                </div>
              </div>
            )}

            <div className="mt-auto pt-6">
              <dl className="grid grid-cols-2 gap-4 border-t border-white/[0.08] pt-6 text-sm">
                <div>
                  <dt className="text-text-muted">{t('Plan')}</dt>
                  <dd className="mt-1 font-medium text-white">{plan ? t(plan.name) : '—'}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">{t('Payment')}</dt>
                  <dd className="mt-1">
                    {paymentLabel[user.paymentStatus] ? (
                      <span className={`badge ${paymentBadges[user.paymentStatus]}`}>{paymentLabel[user.paymentStatus]}</span>
                    ) : (
                      <span className="font-medium text-white">—</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="glass flex flex-col rounded-3xl p-6 md:col-span-2 md:p-8">
            <p className="text-sm text-text-muted">{t('Account details')}</p>
            <dl className="mt-5 flex flex-col gap-4 text-sm">
              {[
                { icon: Phone, label: t('Phone number'), value: user.phone },
                { icon: CalendarDays, label: t('Start'), value: formatDate(user.startDate) },
                { icon: CalendarClock, label: t('Expires'), value: formatDate(user.expiresAt) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-text-muted">
                    <Icon size={15} />
                    {label}
                  </dt>
                  <dd className="text-right font-medium text-white">{value}</dd>
                </div>
              ))}
            </dl>
            {user.documentaryIds.length > 0 && (
              <p className="mt-6 flex items-center gap-2 rounded-2xl bg-white/[0.04] p-3 text-sm text-text-muted">
                <Film size={15} className="shrink-0 text-gold" />
                <span>{t('Individual documentary access:')} {user.documentaryIds.length}</span>
              </p>
            )}
          </section>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/pricing" className="btn-primary group">
            {t(ending || !user.selectedPlan ? 'Choose a plan' : 'Renew subscription')}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/documentaries" className="btn-secondary">
            {t('Browse Documentaries')}
          </Link>
        </div>
      </div>
    </div>
  );
}
