import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPaymentById } from '@/lib/db';
import { reconcilePayment } from '@/lib/payments';

// GET /api/payments/status/:reference - polled by the payment page every few
// seconds. Asks iTechPay for the live status and activates on success.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { reference } = await params;
    const payment = await getPaymentById(reference);
    if (!payment || payment.userId !== user.id) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const result = await reconcilePayment(reference, 'poll');
    return NextResponse.json({ success: true, status: result.status, detail: result.detail });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json({ error: 'Failed to check payment status' }, { status: 500 });
  }
}
