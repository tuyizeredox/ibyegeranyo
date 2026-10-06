import { getFeaturedDocumentaries } from '@/lib/db';
import { getDocumentaryThumbnail } from '@/lib/thumbnails';
import { DocumentaryCard } from './DocumentaryCard';
import { EmptyState } from './EmptyState';
import { SectionHeading } from './SectionHeading';

export async function FeaturedDocumentaries() {
  const documentaries = await getFeaturedDocumentaries();

  return (
    <section className="page-section bg-background">
      <div className="container">
        <SectionHeading
          eyebrow="CURATED STORIES"
          title="Featured Documentaries"
          description="Discover our most compelling stories and investigations from Rwanda and beyond."
          action={documentaries.length > 0 ? { href: '/documentaries', label: 'View all' } : undefined}
        />

        {documentaries.length === 0 ? (
          <EmptyState
            title="No featured documentaries available yet."
            action={{ href: '/documentaries', label: 'Browse Documentaries' }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {documentaries.map((doc) => (
              <DocumentaryCard key={doc.id} documentary={doc} thumbnail={getDocumentaryThumbnail(doc)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
