export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { getAllDocumentaries } from '@/lib/db';
import { getDocumentaryThumbnail } from '@/lib/thumbnails';
import { PageHeader } from '@/components/PageHeader';
import { DocumentaryLibrary, type LibraryItem } from '@/components/DocumentaryLibrary';

export const metadata: Metadata = {
  title: 'Documentaries',
  description:
    'Browse the full collection of premium ad-free documentaries from Rwanda and beyond on Ibyegeranyo.com.',
  alternates: {
    canonical: '/documentaries',
  },
  openGraph: {
    title: 'Documentaries | Ibyegeranyo.com',
    description:
      'Browse the full collection of premium ad-free documentaries from Rwanda and beyond.',
    type: 'website',
  },
};

export default async function DocumentariesPage() {
  const documentaries = await getAllDocumentaries();

  // Only plain card fields cross into the client-side library.
  const items: LibraryItem[] = documentaries.map((doc) => ({
    documentary: {
      id: doc.id,
      title: doc.title,
      summary: doc.summary,
      category: doc.category,
      rating: doc.rating,
      releaseDate: doc.releaseDate,
      videoDuration: doc.videoDuration,
    },
    thumbnail: getDocumentaryThumbnail(doc),
  }));

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="OUR COLLECTION"
        title="Documentaries"
        description="Explore our complete collection of premium documentaries. Watch compelling stories and investigations from Rwanda and beyond."
      />
      <div className="container pb-[clamp(4.5rem,8vw,7.5rem)] pt-4">
        <DocumentaryLibrary items={items} />
      </div>
    </div>
  );
}
