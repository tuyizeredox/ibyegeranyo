import { NextRequest, NextResponse } from 'next/server';
import { reconcileOpenPayments } from '@/lib/payments';

// GET /api/cron/reconcile-payments - re-checks every open iTechPay payment.
// Add ?dryRun=1 to see what would change without changing anything.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';
    const results = await reconcileOpenPayments({ dryRun });
    return NextResponse.json({
      success: true,
      dryRun,
      checked: results.length,
      confirmed: results.filter((r) => r.after === 'confirmed').length,
      results,
    });
  } catch (error) {
    console.error('Payment reconcile cron error:', error);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
