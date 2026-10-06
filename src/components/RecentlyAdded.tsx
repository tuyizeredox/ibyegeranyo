import { getRecentDocumentaries } from '@/lib/db';
import { getDocumentaryThumbnail } from '@/lib/thumbnails';
import { DocumentaryCard } from './DocumentaryCard';
import { EmptyState } from './EmptyState';
import { SectionHeading } from './SectionHeading';

export async function RecentlyAdded() {
  const documentaries = await getRecentDocumentaries(8);

  return (
    <section className="page-section border-y border-white/[0.04] bg-background-secondary">
      <div className="container">
        <SectionHeading
          eyebrow="NEW RELEASES"
          title="Recently Added"
          description="The latest documentaries added to our collection."
          action={documentaries.length > 0 ? { href: '/documentaries', label: 'View all' } : undefined}
        />

        {documentaries.length === 0 ? (
          <EmptyState title="No documentaries available yet." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {documentaries.map((doc) => (
              <DocumentaryCard key={doc.id} documentary={doc} thumbnail={getDocumentaryThumbnail(doc)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
