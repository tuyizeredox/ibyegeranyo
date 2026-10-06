'use client';

import Link from 'next/link';
import { PLANS } from '@/lib/types';
import { ArrowRight, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { SectionHeading } from './SectionHeading';

export function PricingSection({ showHeading = true }: { showHeading?: boolean }) {
  const { locale, t } = useI18n();
  const formatDays = (days: number) => (locale === 'rw' ? `${t('days')} ${days}` : `${days} ${t('days')}`);

  return (
    <section className="page-section relative isolate overflow-hidden bg-background-secondary">
      <div className="container">
        {showHeading && (
          <SectionHeading
            align="center"
            eyebrow={t('MEMBERSHIP')}
            title={t('Choose Your Plan')}
            description={t('Get unlimited access to all documentaries with our flexible subscription plans.')}
          />
        )}

        <div className="grid grid-cols-1 gap-5 pt-3 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan) => {
            const popular = plan.id === 'monthly';
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 ${
                  popular
                    ? 'border border-gold/40 bg-gradient-to-b from-gold/[0.07] via-surface/80 to-surface/60'
                    : 'border border-white/[0.08] bg-surface/50 hover:border-white/15'
                }`}
              >
                {popular && (
                  <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-gold px-3.5 py-1 text-xs font-semibold text-background">
                    <Sparkles size={12} />
                    {t('Most Popular')}
                  </span>
                )}

                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">{t(plan.name)}</h3>
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-text-muted">
                    {formatDays(plan.duration)}
                  </span>
                </div>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-5xl font-bold tracking-tight text-white">{plan.price.toLocaleString()}</span>
                  <span className="text-sm font-semibold text-text-muted">RWF</span>
                </div>
                <p className="mt-3 text-sm text-text-muted">{t(plan.description)}</p>

                <div className="my-6 h-px bg-white/[0.08]" />

                <ul className="flex flex-1 flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-text-secondary">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          popular ? 'bg-gold text-background' : 'bg-white/[0.07] text-white/70'
                        }`}
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {t(feature)}
                    </li>
                  ))}
                </ul>

                <Link href={`/register?plan=${plan.id}`} className={`${popular ? 'btn-primary' : 'btn-secondary'} group mt-8 w-full`}>
                  {t('Get Started')}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <p className="inline-flex items-start gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-sm text-text-muted sm:items-center sm:rounded-full">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-gold sm:mt-0" />
            {t('Secure payments with MTN MoMo, Airtel Money or card. Access is granted automatically once paid.')}
          </p>
        </div>
      </div>
    </section>
  );
}
