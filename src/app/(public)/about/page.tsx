import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Coffee, Globe2, HeartHandshake, Landmark, Newspaper, Search, TrendingUp, Vote } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

export const metadata: Metadata = { title: 'About Ibyegeranyo | Ibyegeranyo.com', description: 'Advertisement-free documentaries from Rwanda and beyond.', alternates: { canonical: '/about' } };

const topics = [
  { label: 'History', icon: Landmark },
  { label: 'Economics', icon: TrendingUp },
  { label: 'Politics', icon: Vote },
  { label: 'Social welfare', icon: HeartHandshake },
  { label: 'Lifestyle', icon: Coffee },
  { label: 'Diplomacy', icon: Globe2 },
  { label: 'Investigations', icon: Search },
  { label: 'Current affairs', icon: Newspaper },
];

export default function AboutPage() {
  return (
    <div>
      <PageHeader
        eyebrow="ABOUT IBYEGERANYO"
        title="Stories with the patience to look closer."
        description="Ibyegeranyo is a home for documentaries people can watch without advertising: a focused, uninterrupted place for stories that deserve your full attention."
      />

      <section className="page-section">
        <div className="container grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div className="flex flex-col gap-6 text-lg text-text-secondary/85">
            <p className="font-display text-2xl text-white md:text-3xl">
              Our collection follows the people, systems and choices shaping Rwanda and its place in the world. Expect thoughtful documentaries on history, economics, politics, social welfare, lifestyle, diplomacy, investigations and current affairs.
            </p>
            <p className="text-text-muted">
              Every subscription supports an ad-free viewing experience, so you can spend time with each film without distractions.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <p className="eyebrow">WHAT WE COVER</p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {topics.map(({ label, icon: Icon }) => (
                <li
                  key={label}
                  className="group flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-surface/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:bg-gold/[0.04]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05] text-gold transition-colors group-hover:bg-gold group-hover:text-background">
                    <Icon size={20} />
                  </span>
                  <span className="text-sm font-semibold text-white">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="pb-[clamp(4.5rem,8vw,7.5rem)]">
        <div className="container">
          <div className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#16130D] via-background-secondary to-background p-8 md:p-14">
            <div aria-hidden className="absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full bg-gold/[0.08] blur-[100px]" />
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex max-w-2xl flex-col gap-4">
                <h2 className="font-display text-3xl text-white md:text-5xl">Support independent viewing.</h2>
                <p className="text-text-muted md:text-lg">
                  Membership helps sustain thoughtful reporting while giving you an ad-free, focused place to watch.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link href="/documentaries" className="btn-primary group">
                  <span>Explore documentaries</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/pricing" className="btn-secondary">
                  View pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
