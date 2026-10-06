import Link from 'next/link';
import { ArrowRight, Clock3, Play, Star } from 'lucide-react';
import type { Documentary } from '@/lib/types';

export type DocumentaryCardData = Pick<
  Documentary,
  'id' | 'title' | 'summary' | 'category' | 'rating' | 'releaseDate' | 'videoDuration'
>;

interface DocumentaryCardProps {
  documentary: DocumentaryCardData;
  /** Resolved on the server with getDocumentaryThumbnail. */
  thumbnail: string;
  /** Wide spotlight layout for the homepage “latest documentary”. */
  large?: boolean;
}

export function DocumentaryCard({ documentary, thumbnail, large = false }: DocumentaryCardProps) {
  const year = documentary.releaseDate ? new Date(documentary.releaseDate).getFullYear() : null;
  const minutes = documentary.videoDuration ? Math.floor(documentary.videoDuration / 60) : null;
  const hasMeta = Boolean(documentary.rating || year || large);

  return (
    <Link
      href={`/documentaries/${documentary.id}`}
      className={`card group flex flex-col ${large ? 'md:grid md:grid-cols-[1.35fr_1fr]' : ''}`}
    >
      <div className={`relative overflow-hidden ${large ? 'aspect-video md:aspect-auto md:min-h-[24rem]' : 'aspect-video'}`}>
        <img
          src={thumbnail}
          alt={documentary.title}
          loading={large ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
        <div className="absolute inset-0 bg-background/0 transition-colors duration-300 group-hover:bg-background/25" />

        {documentary.category && (
          <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
            {documentary.category}
          </span>
        )}
        {minutes ? (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
            <Clock3 size={12} />
            {minutes} min
          </span>
        ) : null}

        <span className="absolute inset-0 flex items-center justify-center">
          <span
            className={`flex scale-75 items-center justify-center rounded-full bg-white text-background opacity-0 shadow-[0_10px_40px_rgba(0,0,0,.5)] transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 ${
              large ? 'h-20 w-20' : 'h-14 w-14'
            }`}
          >
            <Play size={large ? 28 : 20} fill="currentColor" className="translate-x-0.5" />
          </span>
        </span>
      </div>

      <div className={`flex flex-1 flex-col gap-3 ${large ? 'p-6 md:justify-center md:p-10' : 'p-5'}`}>
        <h3
          className={`line-clamp-2 text-white transition-colors group-hover:text-gold ${
            large ? 'font-display text-3xl md:text-4xl' : 'text-lg font-semibold leading-snug'
          }`}
        >
          {documentary.title}
        </h3>
        {documentary.summary && (
          <p className={`text-text-muted ${large ? 'line-clamp-4 text-base' : 'line-clamp-2 text-sm'}`}>
            {documentary.summary}
          </p>
        )}
        {hasMeta && (
          <div className="mt-auto flex items-center gap-4 pt-2 text-xs text-text-muted">
            {documentary.rating ? (
              <span className="inline-flex items-center gap-1 font-semibold text-gold">
                <Star size={13} className="fill-gold" />
                {documentary.rating.toFixed(1)}
              </span>
            ) : null}
            {year && <span>{year}</span>}
            {large && (
              <span className="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-white">
                <span>Watch now</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
