import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { reconcilePayment } from '@/lib/payments';

export const runtime = 'nodejs';

function secretMatches(given: string | null, expected: string): boolean {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function readReference(body: Record<string, unknown>): string | null {
  const data = body.data && typeof body.data === 'object' ? (body.data as Record<string, unknown>) : {};
  const ref = body.req_ref ?? data.req_ref ?? body.reference ?? data.reference;
  return typeof ref === 'string' && ref ? ref : null;
}

// POST /api/payments/itecpay/callback - iTechPay webhook.
//
// iTechPay doesn't sign webhooks, so register this URL with a secret:
//   https://<site>/api/payments/itecpay/callback?secret=<ITECPAY_CALLBACK_SECRET>  (= ITECPAY_CALLBACK_URL)
// Only the reference is read from the body. The status, amount and everything
// else are ignored: the payment is re-verified with iTechPay before activation.
export async function POST(request: NextRequest) {
  const secret = process.env.ITECPAY_CALLBACK_SECRET;
  if (secret && !secretMatches(request.nextUrl.searchParams.get('secret'), secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.text();
  console.info(`[itecpay] webhook: ${raw.slice(0, 2000)}`);

  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(raw);
  } catch {
    body = Object.fromEntries(new URLSearchParams(raw));
  }

  const reference = readReference(body);
  if (!reference) {
    return NextResponse.json({ error: 'Missing req_ref' }, { status: 400 });
  }

  try {
    const result = await reconcilePayment(reference, 'webhook');
    if (result.status === 'not_found') {
      return NextResponse.json({ error: 'Unknown payment' }, { status: 404 });
    }
    return NextResponse.json({ received: true, status: result.status });
  } catch (error) {
    console.error('iTechPay webhook error:', error);
    // 500 so iTechPay retries, if it retries.
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
