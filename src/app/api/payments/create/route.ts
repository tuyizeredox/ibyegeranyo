import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDocumentaryById } from '@/lib/db';
import { GATEWAY_METHODS, type GatewayMethod } from '@/lib/itecpay';
import { PaymentStartError, startGatewayPayment } from '@/lib/payments';
import { isValidPhone } from '@/lib/utils';
import { PLANS } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to make a payment' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan, documentaryId, method, phone, email } = body;

    // Validate plan
    if (!plan) {
      return NextResponse.json(
        { error: 'Subscription plan is required' },
        { status: 400 }
      );
    }

    const selectedPlan = PLANS.find((p) => p.id === plan);
    if (!selectedPlan) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

    if (!GATEWAY_METHODS.includes(method)) {
      return NextResponse.json({ error: 'Choose a payment method' }, { status: 400 });
    }

    const payPhone = typeof phone === 'string' && phone.trim() ? phone.trim() : user.phone;
    if (method !== 'card' && !isValidPhone(payPhone)) {
      return NextResponse.json({ error: 'Enter a valid Rwandan phone number' }, { status: 400 });
    }
    if (method === 'card' && (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) {
      return NextResponse.json({ error: 'Enter a valid email address for the card receipt' }, { status: 400 });
    }

    // For single documentary plan, documentaryId is required
    if (plan === 'single' && !documentaryId) {
      return NextResponse.json(
        { error: 'Documentary ID is required for single documentary plan' },
        { status: 400 }
      );
    }
    if (plan === 'single' && documentaryId) {
      const documentary = await getDocumentaryById(documentaryId);
      if (!documentary || documentary.status !== 'published') {
        return NextResponse.json({ error: 'Documentary not found' }, { status: 404 });
      }
    }

    // Amount comes from the server's plan list, never from the client
    const result = await startGatewayPayment({
      user,
      plan: selectedPlan,
      documentaryId: plan === 'single' ? documentaryId : undefined,
      method: method as GatewayMethod,
      phone: payPhone,
      email: typeof email === 'string' ? email.trim() : undefined,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || request.nextUrl.origin,
    });

    return NextResponse.json({
      success: true,
      reference: result.reference,
      paymentUrl: result.paymentUrl,
      method,
      plan: selectedPlan,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof PaymentStartError) {
      return NextResponse.json({ error: error.message, reference: error.reference }, { status: 502 });
    }
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
