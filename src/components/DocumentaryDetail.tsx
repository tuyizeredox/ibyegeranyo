import Link from 'next/link';
import { ArrowLeft, CalendarDays, CircleCheck, Clock3, Film, Lock, Play, Star } from 'lucide-react';
import { PLANS, type Documentary } from '@/lib/types';

interface DocumentaryDetailProps {
  documentary: Documentary;
  thumbnail: string;
  hasAccess: boolean;
  accessReason: string;
}

const singlePlan = PLANS.find((plan) => plan.id === 'single');

export function DocumentaryDetail({ documentary, thumbnail, hasAccess, accessReason }: DocumentaryDetailProps) {
  const trailerMessage = accessReason === 'not_authenticated'
    ? 'Sign in or subscribe to watch the full documentary. Until then, you can watch the trailer.'
    : 'Your payment has not been confirmed or your access has ended. You can watch the trailer until access is active.';
  const year = documentary.releaseDate ? new Date(documentary.releaseDate).getFullYear() : null;
  const minutes = documentary.videoDuration ? Math.floor(documentary.videoDuration / 60) : null;
  const playerHref = `/player?doc=${documentary.id}`;
  const singleHref = `/register?plan=single&doc=${documentary.id}`;

  return (
    <>
      {/* Backdrop hero */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10">
          <img src={thumbnail} alt="" className="h-full w-full scale-110 object-cover opacity-40 blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </div>

        <div className="container pb-14 pt-8 md:pb-20 md:pt-10">
          <Link
            href="/documentaries"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-2 pl-3 pr-4 text-sm text-text-muted backdrop-blur-md transition-colors hover:border-white/25 hover:text-white"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Back to documentaries</span>
          </Link>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <div className="order-2 flex flex-col items-start gap-6 lg:order-1">
              <div className="flex flex-wrap items-center gap-2.5 text-sm text-white/75">
                {documentary.category && <span className="badge badge-gold">{documentary.category}</span>}
                {documentary.rating ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-gold">
                    <Star size={15} className="fill-gold" />
                    {documentary.rating.toFixed(1)}
                  </span>
                ) : null}
                {year && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={15} className="text-text-muted" />
                    {year}
                  </span>
                )}
                {minutes ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={15} className="text-text-muted" />
                    {minutes} min
                  </span>
                ) : null}
              </div>

              <h1 className="font-display text-4xl text-white sm:text-5xl md:text-6xl">{documentary.title}</h1>
              {documentary.summary && <p className="line-clamp-4 max-w-2xl text-lg text-white/70">{documentary.summary}</p>}

              {hasAccess ? (
                <div className="flex flex-wrap items-center gap-4">
                  <Link href={playerHref} className="btn-primary h-14 px-8 text-base">
                    <Play size={18} fill="currentColor" />
                    <span>Open player</span>
                  </Link>
                  <span className="badge badge-success py-1.5">
                    <CircleCheck size={14} />
                    <span>You have access</span>
                  </span>
                </div>
              ) : (
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  <Link href="/pricing" className="btn-primary h-14 px-8 text-base">
                    <span>Subscribe now</span>
                  </Link>
                  {singlePlan && (
                    <Link href={singleHref} className="btn-secondary h-14 px-6 text-sm">
                      <span>Buy only this documentary</span>
                      <span className="text-white/60">· {singlePlan.price.toLocaleString()} RWF</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Poster */}
            <div className="order-1 lg:order-2">
              <div className="group relative aspect-video overflow-hidden rounded-3xl border border-white/10 shadow-[0_40px_100px_-40px_rgba(0,0,0,.9)]">
                <img src={thumbnail} alt={documentary.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {hasAccess ? (
                  <Link href={playerHref} aria-label="Open player" className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-background shadow-[0_10px_50px_rgba(0,0,0,.6)] transition-transform duration-300 group-hover:scale-110">
                      <Play size={30} fill="currentColor" className="translate-x-0.5" />
                    </span>
                  </Link>
                ) : (
                  <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-gold backdrop-blur-md">
                      <Lock size={18} />
                    </span>
                    <span className="text-sm font-medium text-white">Premium content</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trailer, synopsis and access */}
      <section className="container grid gap-8 pb-20 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex min-w-0 flex-col gap-8">
          {!hasAccess && documentary.trailerUrl && (
            <div id="trailer" className="flex flex-col gap-4">
              <h2 className="flex items-center gap-2.5 text-xl font-semibold text-white">
                <Film size={20} className="text-gold" />
                <span>Watch trailer</span>
              </h2>
              <div className="video-container aspect-video border border-white/10">
                <video controls className="h-full w-full" poster={thumbnail}>
                  <source src={documentary.trailerUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}
          {!hasAccess && !documentary.trailerUrl && (
            <div className="flex items-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-text-muted">
              <Film size={22} className="shrink-0 text-white/40" />
              <p>
                <span>No trailer available.</span> <span>{trailerMessage}</span>
              </p>
            </div>
          )}

          <div className="glass rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-white">About this documentary</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-text-secondary/85">{documentary.summary}</p>
          </div>
        </div>

        <aside>
          <div className="glass sticky top-24 flex flex-col items-center gap-4 rounded-3xl p-6 text-center md:p-8">
            <h2 className="self-start text-sm font-semibold uppercase tracking-[0.16em] text-sand">Access Status</h2>
            {hasAccess ? (
              <>
                <span className="mt-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                  <CircleCheck size={30} />
                </span>
                <p className="text-lg font-semibold text-emerald-400">You have access</p>
                <p className="text-sm text-text-muted">Watch this documentary ad-free</p>
                <Link href={playerHref} className="btn-primary mt-2 w-full">
                  <Play size={16} fill="currentColor" />
                  <span>Open player</span>
                </Link>
              </>
            ) : (
              <>
                <span className="mt-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                  <Lock size={28} />
                </span>
                <p className="text-lg font-semibold text-white">Premium content</p>
                <p className="break-words text-sm text-text-muted">{trailerMessage}</p>
                <Link href="/pricing" className="btn-primary mt-2 w-full">
                  <span>Subscribe Now</span>
                </Link>
                {singlePlan && (
                  <Link href={singleHref} className="text-sm text-text-muted underline decoration-white/20 underline-offset-4 transition-colors hover:text-white">
                    <span>Buy only this documentary</span> · {singlePlan.price.toLocaleString()} RWF
                  </Link>
                )}
              </>
            )}
          </div>
        </aside>
      </section>
    </>
  );
}
