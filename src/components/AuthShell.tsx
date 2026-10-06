'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { Check, Eye, EyeOff, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

/** Two-column frame for login/register: brand pitch on the left, form on the right. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const perks = [t('Full documentary access'), t('Ad-free viewing'), t('Watch on any device')];

  return (
    <div className="relative isolate overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full bg-gold/[0.06] blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_30%_40%,black,transparent_70%)]" />
      </div>

      <div className="container grid min-h-[calc(100svh-4rem)] items-center gap-12 py-12 lg:grid-cols-[1fr_28rem] lg:gap-20 lg:py-16 xl:grid-cols-[1fr_30rem]">
        <div className="hidden flex-col items-start gap-8 lg:flex">
          <p className="eyebrow">{t('MEMBERSHIP')}</p>
          <h2 className="max-w-xl font-display text-5xl text-white xl:text-6xl">{t('Stories worth staying for.')}</h2>
          <ul className="flex flex-col gap-4">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-white/80">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <Check size={16} strokeWidth={3} />
                </span>
                {perk}
              </li>
            ))}
          </ul>
          <p className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.06] px-4 py-2 text-sm text-sand">
            <ShieldCheck size={16} className="shrink-0 text-gold" />
            {t('paymentInfo')}
          </p>
        </div>

        <div className="mx-auto w-full max-w-md animate-fade-up motion-reduce:animate-none lg:max-w-none">{children}</div>
      </div>
    </div>
  );
}

export const authCardClass =
  'glass flex flex-col gap-6 rounded-3xl p-7 shadow-[0_40px_100px_-40px_rgba(0,0,0,.9)] sm:p-9';

/** Labelled input with a leading icon; `children` is the input element. */
export function Field({ label, icon: Icon, hint, children }: { label: string; icon: LucideIcon; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-white/85">{label}</span>
      <span className="relative block">
        <Icon size={18} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-text-muted" />
        {children}
      </span>
      {hint && <span className="text-xs text-text-muted">{hint}</span>}
    </label>
  );
}

export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'>) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <input {...props} type={visible ? 'text' : 'password'} className="input pl-11 pr-12" />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-white/10 hover:text-white"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </>
  );
}
