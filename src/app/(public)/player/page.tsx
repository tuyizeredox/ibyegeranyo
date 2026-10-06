import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDocumentaryById } from '@/lib/db';
import { checkDocumentaryAccess, getCurrentUser } from '@/lib/auth';
import { ArrowLeft, Clock3, Film, Lock, LoaderCircle } from 'lucide-react';
import { StreamPlayer } from '@/components/StreamPlayer';
import { EmptyState } from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

export default async function PlayerPage({
  searchParams,
}: {
  searchParams: Promise<{ doc?: string }>;
}) {
  const { doc: docId } = await searchParams;
  if (!docId) redirect('/documentaries');

  const documentary = await getDocumentaryById(docId);
  if (!documentary) {
    return (
      <div className="container flex min-h-[70vh] items-center justify-center py-20">
        <div className="w-full max-w-xl">
          <EmptyState
            icon={Film}
            title="Documentary not found"
            action={{ href: '/documentaries', label: 'Browse Documentaries' }}
          />
        </div>
      </div>
    );
  }

  const user = await getCurrentUser();
  const access = await checkDocumentaryAccess(user?.id, documentary.id);

  const useStream =
    Boolean(documentary.streamUid) &&
    documentary.streamStatus !== 'error' &&
    access.hasAccess;
  // Prefer free HLS if encoding is ready
  const hlsPlaylistUrl =
    documentary.hlsPlaylistKey && documentary.encodingStatus === 'ready'
      ? `/api/media/r2?key=${encodeURIComponent(documentary.hlsPlaylistKey)}`
      : null;

  const canPlay = access.hasAccess && Boolean(useStream || documentary.videoUrl || hlsPlaylistUrl);
  // The locked panel carries the page's h1; otherwise the title below does.
  const TitleTag = canPlay ? 'h1' : 'h2';

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-black">

      <div className="border-b border-white/[0.06] bg-background/60 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between gap-4">
          <Link
            href={`/documentaries/${documentary.id}`}
            className="group inline-flex shrink-0 items-center gap-2 text-sm text-text-muted transition-colors hover:text-white"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Back</span>
          </Link>
          <p className="truncate text-sm font-medium text-white/80">{documentary.title}</p>
          <nav className="hidden shrink-0 gap-5 text-sm text-text-muted sm:flex">
            <Link href="/documentaries" className="transition-colors hover:text-white">Documentaries</Link>
            <Link href="/pricing" className="transition-colors hover:text-white">Pricing</Link>
          </nav>
        </div>
      </div>

      <main className="container max-w-6xl py-8 md:py-12">
        {canPlay ? (
          <div className="video-container aspect-video rounded-2xl ring-1 ring-white/10 shadow-[0_40px_120px_-40px_rgba(0,0,0,.9)] md:rounded-3xl">
            <StreamPlayer
              docId={documentary.id}
              poster={documentary.thumbnailUrl}
              fallbackUrl={documentary.videoUrl}
              hlsPlaylistUrl={hlsPlaylistUrl}
            />
          </div>
        ) : (
          <div className="relative flex min-h-[26rem] items-center justify-center overflow-hidden rounded-2xl bg-surface ring-1 ring-white/10 md:aspect-video md:min-h-0 md:rounded-3xl">
            {documentary.thumbnailUrl && (
              <img
                src={documentary.thumbnailUrl}
                alt=""
                className="absolute inset-0 h-full w-full scale-105 object-cover opacity-25 blur-sm"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
            <div className="relative flex flex-col items-center gap-4 p-8 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
                <Lock size={28} />
              </span>
              <h1 className="font-display text-3xl text-white md:text-4xl">{documentary.title}</h1>
              <p className="max-w-md text-text-muted">This full documentary is available after your subscription or single-documentary payment is verified.</p>
              <Link
                href={
                  user
                    ? `/register?plan=single&doc=${documentary.id}`
                    : `/login?next=/player?doc=${documentary.id}`
                }
                className="btn-primary mt-2"
              >
                Subscribe to Watch
              </Link>
              {documentary.trailerUrl && (
                <video
                  controls
                  className="mt-4 w-full max-w-xl rounded-2xl ring-1 ring-white/10"
                  poster={documentary.thumbnailUrl || undefined}
                >
                  <source src={documentary.trailerUrl} type="video/mp4" />
                </video>
              )}
            </div>
          </div>
        )}

        <section className="flex flex-col gap-4 py-10">
          <div className="flex flex-wrap items-center gap-2.5 text-sm text-text-muted">
            {documentary.category && <span className="badge badge-gold">{documentary.category}</span>}
            {documentary.videoDuration ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={15} />
                {Math.floor(documentary.videoDuration / 60)} minutes
              </span>
            ) : null}
            {(documentary.encodingStatus === 'pending' || documentary.encodingStatus === 'processing') && (
              <span className="badge badge-warning">
                <LoaderCircle size={12} className="animate-spin" />
                Adaptive qualities encoding…
              </span>
            )}
            {documentary.encodingStatus === 'ready' && (
              <span className="badge badge-gold">Adaptive streaming ready</span>
            )}
            {documentary.streamStatus === 'processing' && (
              <span className="badge badge-warning">
                <LoaderCircle size={12} className="animate-spin" />
                Stream encoding…
              </span>
            )}
          </div>
          <TitleTag className="font-display text-3xl text-white md:text-5xl">{documentary.title}</TitleTag>
          <p className="max-w-3xl whitespace-pre-line text-text-muted md:text-lg">{documentary.summary}</p>
        </section>
      </main>
    </div>
  );
}
