import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPaymentById } from '@/lib/db';
import { isGatewayPayment, reconcilePayment } from '@/lib/payments';

// GET /api/payments/pending - called when the account page loads. Re-checks the
// user's latest payment so access is granted even if they closed the tab
// before it was confirmed.
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payment = user.paymentId ? await getPaymentById(user.paymentId) : null;
    if (!payment || payment.status !== 'pending' || !isGatewayPayment(payment)) {
      return NextResponse.json({ success: true, payment: null });
    }

    const result = await reconcilePayment(payment.id, 'sweep');
    return NextResponse.json({
      success: true,
      payment: { reference: payment.id, status: result.status, changed: result.status !== payment.status },
    });
  } catch (error) {
    console.error('Error checking pending payment:', error);
    return NextResponse.json({ error: 'Failed to check pending payment' }, { status: 500 });
  }
}
