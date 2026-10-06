'use client';

import { BadgeCheck, ListChecks, Smartphone } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { SectionHeading } from './SectionHeading';

export function HowItWorks() {
  const { t } = useI18n();
  const steps = [
    { icon: ListChecks, title: t('Choose a plan'), text: t('Pick weekly, monthly, yearly or a single documentary.') },
    { icon: Smartphone, title: t('payMomo'), text: t('Use MTN MoMo, Airtel Money or a card. Mobile money sends a prompt to your phone.') },
    { icon: BadgeCheck, title: t('uploadProof'), text: t('Approve the payment and your access unlocks automatically.') },
  ];

  return (
    <section className="page-section bg-background">
      <div className="container">
        <SectionHeading align="center" eyebrow={t('HOW IT WORKS')} title={t('Start watching in three steps')} />
        <div className="relative">
          {/* Connector running behind the three step icons on wide screens. */}
          <div aria-hidden className="absolute left-[16%] right-[16%] top-18 hidden h-px bg-gradient-to-r from-gold/0 via-gold/30 to-gold/0 md:block" />
          <ol className="relative grid gap-5 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <li key={index} className="flex flex-col items-center gap-4 rounded-3xl border border-white/[0.07] bg-surface/40 p-8 text-center backdrop-blur-sm">
                <span className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-background text-gold">
                  <Icon size={30} />
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-background">
                    {index + 1}
                  </span>
                </span>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="max-w-xs text-sm text-text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
