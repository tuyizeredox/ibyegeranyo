'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { CircleAlert, LoaderCircle } from 'lucide-react';

type Props = {
  docId: string;
  poster?: string | null;
  /** Progressive MP4 fallback */
  fallbackUrl?: string | null;
  /** HLS master playlist (preferred) */
  hlsPlaylistUrl?: string | null;
};

export function StreamPlayer({ docId, poster, fallbackUrl, hlsPlaylistUrl }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  // Prefer HLS if available
  useEffect(() => {
    if (!hlsPlaylistUrl || !videoRef.current) return;

    const video = videoRef.current;
    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });
      hls.loadSource(hlsPlaylistUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('HLS fatal error', data);
          setUseFallback(true);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS (Safari / iOS)
      video.src = hlsPlaylistUrl;
    } else {
      setUseFallback(true);
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [hlsPlaylistUrl]);

  // Fallback to progressive MP4
  if (useFallback && fallbackUrl) {
    return (
      <video
        controls
        controlsList="nodownload"
        disablePictureInPicture
        className="w-full h-full"
        poster={poster || undefined}
      >
        <source src={fallbackUrl} type="video/mp4" />
      </video>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-surface text-red-300">
        <CircleAlert size={32} />
        <p>{error}</p>
      </div>
    );
  }

  // HLS player
  if (hlsPlaylistUrl) {
    return (
      <video
        ref={videoRef}
        controls
        controlsList="nodownload"
        disablePictureInPicture
        className="w-full h-full"
        poster={poster || undefined}
        playsInline
      />
    );
  }

  // Still waiting / no HLS yet → show progressive if available
  if (fallbackUrl) {
    return (
      <video
        controls
        controlsList="nodownload"
        disablePictureInPicture
        className="w-full h-full"
        poster={poster || undefined}
      >
        <source src={fallbackUrl} type="video/mp4" />
      </video>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-black text-text-muted">
      <LoaderCircle size={32} className="animate-spin text-gold" />
      <p>Preparing adaptive stream…</p>
    </div>
  );
}
