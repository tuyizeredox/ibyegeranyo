import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { PricingSection } from '@/components/PricingSection';
import { HowItWorks } from '@/components/HowItWorks';

export const metadata: Metadata = { title: 'Pricing | Aime Christian Documentaries', description: 'Choose flexible documentary access and pay instantly with MTN MoMo, Airtel Money or card.', alternates: { canonical: '/pricing' } };

export default function PricingPage() {
  return (
    <div>
      <PageHeader
        align="center"
        eyebrow="MEMBERSHIP"
        title="Stories worth staying for."
        description="Pay with MTN MoMo, Airtel Money or card. Your access starts as soon as the payment is confirmed."
      />
      <PricingSection showHeading={false} />
      <HowItWorks />
    </div>
  );
}
