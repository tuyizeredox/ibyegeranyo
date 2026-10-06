'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUp, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

// lucide-react no longer ships brand marks, so the two social icons are inline.
const socialLinks = [
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@Aimechristian01',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-[18px] w-[18px]">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@aimechristian01',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-[18px] w-[18px]">
        <path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.8 5.8 0 0 0-.8-.1 5.8 5.8 0 1 0 5.8 5.8V9.2a7.4 7.4 0 0 0 4.3 1.4V7.5a4.3 4.3 0 0 1-3.3-1.7Z" />
      </svg>
    ),
  },
];

export function Footer() {
  const { t } = useI18n();
  const columns = [
    { heading: t('explore'), links: [['/', t('home')], ['/documentaries', t('documentaries')], ['/about', t('about')], ['/pricing', t('pricing')]] },
    { heading: t('account'), links: [['/login', t('login')], ['/register', t('register')], ['/account', t('account')]] },
    { heading: t('legal'), links: [['/privacy', t('privacy')], ['/terms', t('terms')]] },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-background-secondary">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

      <div className="container relative py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="flex flex-col items-start gap-6">
            <Link href="/" className="inline-flex items-center transition-opacity hover:opacity-90" aria-label="Ibyegeranyo home">
              <Image src="/logo.png" alt="Ibyegeranyo" width={900} height={240} className="h-12 w-auto" />
            </Link>
            <p className="max-w-sm text-sm leading-7 text-text-muted">{t('footerDescription')}</p>
            <div className="flex gap-3">
              {socialLinks.map(({ name, href, icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-background"
                >
                  {icon}
                </a>
              ))}
            </div>
            <p className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.06] px-3.5 py-2 text-xs text-sand">
              <ShieldCheck size={14} className="shrink-0 text-gold" />
              {t('paymentInfo')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {columns.map(({ heading, links }) => (
              <div key={heading}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-sand">{heading}</h2>
                <ul className="mt-5 flex flex-col gap-3">
                  {links.map(([href, label]) => (
                    <li key={href}>
                      <Link href={href} className="text-sm text-text-muted transition-colors hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-5 border-t border-white/[0.06] pt-8 text-sm text-text-muted sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1.5">
            <p>© {new Date().getFullYear()} Aime Christian Documentaries.</p>
            <p>
              Powered by{' '}
              <span className="font-medium text-white/90">MEDIALINK AFRICA GROUP (MAG) LTD</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-white"
          >
            {t('Back to top')}
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition-colors group-hover:border-white/30">
              <ArrowUp size={15} className="transition-transform group-hover:-translate-y-0.5" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
