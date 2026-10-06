import type { Metadata } from 'next';
import { PaymentStatusWatcher } from '@/components/PaymentFlow';

export const metadata: Metadata = { title: 'Payment | Aime Christian Documentaries', robots: { index: false } };

// Pesapal sends card customers back here after checkout. The page only watches
// the payment; the server confirms it with iTechPay before granting access.
export default async function PaymentReturnPage({ searchParams }: { searchParams: Promise<{ reference?: string }> }) {
  const { reference } = await searchParams;
  return (
    <div className="container max-w-3xl py-12 md:py-16">
      {reference ? (
        <PaymentStatusWatcher reference={reference} />
      ) : (
        <p className="text-center text-text-muted">Missing payment reference.</p>
      )}
    </div>
  );
}
