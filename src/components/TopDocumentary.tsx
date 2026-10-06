import { getCurrentUser } from '@/lib/auth';
import { getRecentDocumentaries } from '@/lib/db';
import { getDocumentaryThumbnail } from '@/lib/thumbnails';
import { DocumentaryCard } from './DocumentaryCard';
import { SectionHeading } from './SectionHeading';

export async function TopDocumentary() {
  const user = await getCurrentUser();

  // Only for logged-in users with an active full subscription (not single-doc)
  const hasFullAccess =
    !!user &&
    user.subscriptionStatus === 'active' &&
    user.selectedPlan !== 'single' &&
    !!user.expiresAt &&
    new Date(user.expiresAt) >= new Date();

  if (!hasFullAccess) return null;

  const [latest] = await getRecentDocumentaries(1);
  if (!latest) return null;

  return (
    <section className="page-section bg-background">
      <div className="container">
        <SectionHeading
          eyebrow="JUST ADDED"
          title="Latest Documentary"
          description="The newest release on Ibyegeranyo — available with your subscription."
        />
        <DocumentaryCard documentary={latest} thumbnail={getDocumentaryThumbnail(latest)} large />
      </div>
    </section>
  );
}
