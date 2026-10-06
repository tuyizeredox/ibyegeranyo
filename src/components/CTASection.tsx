'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function CTASection() {
  const { t } = useI18n();
  return (
    <section className="page-section bg-background">
      <div className="container">
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#16130D] via-background-secondary to-background px-6 py-16 text-center sm:px-12 md:py-24">
          <div aria-hidden className="absolute inset-0 -z-10">
            <div className="absolute -top-32 left-1/2 h-72 w-[40rem] max-w-full -translate-x-1/2 rounded-full bg-gold/[0.08] blur-[110px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          </div>

          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
            <h2 className="font-display text-4xl text-white md:text-6xl">{t('Ready to Start Watching?')}</h2>
            <p className="max-w-2xl text-base text-white/70 md:text-lg">
              {t('Join now and get unlimited access to premium documentaries from Rwanda and around the world. Ad-free, high-quality content.')}
            </p>
            <div className="mt-2 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
              <Link href="/register" className="btn-primary group h-14 px-8 text-base">
                {t('Subscribe Now')}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/documentaries" className="btn-secondary h-14 px-8 text-base">
                {t('Browse Documentaries')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
