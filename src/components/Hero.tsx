'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MonitorSmartphone, Pause, Play, ShieldCheck, Smartphone } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const topics = ['History', 'Economics', 'Politics', 'Social welfare', 'Lifestyle', 'Diplomacy', 'Investigations', 'Current affairs'];

// Fine film grain keeps the dark overlays from looking flat over the footage.
const grain =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function Hero() {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Playback starts after hydration so the play/pause events reach React,
    // and never starts on its own for visitors who prefer reduced motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    videoRef.current?.play().catch(() => undefined);
  }, []);

  const toggleVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => undefined);
    else video.pause();
  };

  const features = [
    { icon: ShieldCheck, label: t('Ad-free viewing') },
    { icon: MonitorSmartphone, label: t('Watch on any device') },
    { icon: Smartphone, label: t('payMomo') },
  ];

  return (
    // Pulled up beneath the fixed glass navbar so the footage runs edge to edge.
    <section className="relative isolate -mt-16 flex min-h-svh flex-col overflow-hidden lg:h-svh lg:max-h-[60rem] lg:min-h-[44rem]">
      {/* Background footage and cinematic grading */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="h-full w-full scale-105 object-cover"
        >
          <source src="/media/hero-broll.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/65 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-background/90 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_55%,rgba(0,0,0,.55))]" />
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: grain }} />
      </div>

      {/* Content */}
      <div className="container relative flex flex-1 flex-col justify-center pt-28 pb-14">
        <div className="flex max-w-3xl flex-col items-start gap-8">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex animate-fade-up items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/85 backdrop-blur-md motion-reduce:animate-none sm:text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
              </span>
              {t('heroEyebrow')}
            </span>

            <h1 className="animate-fade-up text-[clamp(2.1rem,3vw+0.75rem,3.6rem)] font-extrabold leading-[1.06] tracking-[-0.035em] text-white [animation-delay:120ms] motion-reduce:animate-none">
              {t('heroTitleLead')}{' '}
              <span className="bg-gradient-to-r from-gold via-[#FFD98A] to-sand bg-clip-text pe-[0.08em] font-[family-name:var(--font-fraunces)] font-semibold italic tracking-[-0.02em] text-transparent">
                {t('heroTitleAccent')}
              </span>
            </h1>

            <p className="max-w-xl animate-fade-up text-base text-white/75 [animation-delay:240ms] motion-reduce:animate-none md:text-lg">
              {t('heroDescription')}
            </p>
          </div>

          <div className="flex w-full flex-col items-start gap-8">
            <div className="flex w-full animate-fade-up flex-col gap-3 [animation-delay:360ms] motion-reduce:animate-none sm:w-auto sm:flex-row">
              <Link
                href="/pricing"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold px-7 text-[0.95rem] font-semibold text-background shadow-[inset_0_1px_0_rgba(255,255,255,.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-hover"
              >
                {t('subscribe')}
                <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/documentaries"
                className="group inline-flex h-12 items-center justify-center gap-3 rounded-full border border-white/20 bg-white/[0.07] pl-1.5 pr-6 text-[0.95rem] font-semibold text-white backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.12]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-background transition-transform duration-200 group-hover:scale-110">
                  <Play size={16} fill="currentColor" className="translate-x-px" />
                </span>
                {t('exploreLibrary')}
              </Link>
            </div>

            <ul className="flex animate-fade-up flex-wrap gap-x-6 gap-y-3 [animation-delay:480ms] motion-reduce:animate-none">
              {features.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-white/70">
                  <Icon size={16} className="text-gold" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Topics band */}
      <div className="relative animate-fade-up border-t border-white/10 bg-background/50 backdrop-blur-md [animation-delay:600ms] motion-reduce:animate-none">
        <div className="container flex h-16 items-center gap-5">
          <p className="hidden shrink-0 text-xs font-semibold tracking-[0.18em] text-gold sm:block">{t('WHAT WE COVER')}</p>
          <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            {/* The list is rendered twice so the -50% marquee loop is seamless. */}
            <ul className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
              {[...topics, ...topics].map((topic, index) => (
                <li
                  key={`${topic}-${index}`}
                  aria-hidden={index >= topics.length || undefined}
                  className="flex items-center gap-6 whitespace-nowrap pr-6 text-sm font-medium text-white/65"
                >
                  {t(topic)}
                  <span aria-hidden className="h-1 w-1 rounded-full bg-gold/70" />
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={toggleVideo}
            aria-label={isPlaying ? 'Pause background video' : 'Play background video'}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 transition-colors hover:bg-white/15 hover:text-white"
          >
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="translate-x-px" />}
          </button>
        </div>
      </div>
    </section>
  );
}
