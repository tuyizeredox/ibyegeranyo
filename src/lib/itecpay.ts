// iTechPay (https://pay.itecpay.rw) gateway client: MTN MoMo, Airtel Money and
// card (via Pesapal). Server-only — API keys must never reach the browser.
//
// The success/failure status rules below were inferred from real responses, not
// from iTechPay documentation. Every raw response is logged with the
// `[itecpay]` prefix so the rules can be checked against real transactions.

export type GatewayMethod = 'mobile_money' | 'airtel_money' | 'card';

export const GATEWAY_METHODS: GatewayMethod[] = ['mobile_money', 'airtel_money', 'card'];

// ITECPAY_BASE_URL may include a path (e.g. https://pay.itecpay.rw/api); the
// endpoints below live under both /api and /api2, so only the origin is used.
const BASE_URL = new URL(process.env.ITECPAY_BASE_URL || 'https://pay.itecpay.rw').origin;

const PAID_STATUSES = ['completed', 'success', 'successful', 'paid', 'approved'];
const FAILED_STATUSES = ['cancelled', 'canceled', 'rejected', 'failed', 'error', 'declined'];

export class ItecPayError extends Error {}

function apiKey(method: GatewayMethod): string {
  const name = {
    mobile_money: 'ITECPAY_API_KEY_MOBILE_MONEY',
    airtel_money: 'ITECPAY_API_KEY_AIRTEL_MONEY',
    card: 'ITECPAY_API_KEY_CARD',
  }[method];
  const key = process.env[name];
  if (!key) throw new ItecPayError(`${name} is not configured`);
  return key;
}

/** iTechPay wants the local format 07XXXXXXXX. */
export function toItecPayPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('250')) return '0' + digits.slice(3);
  if (digits.startsWith('7')) return '0' + digits;
  return digits;
}

type Json = Record<string, unknown>;

/**
 * POSTs to iTechPay. Returns the parsed JSON body, or `null` when the gateway
 * answered 2xx with a body that isn't JSON — that means "outcome unknown", not
 * "failed". Throws on network errors and non-2xx responses.
 */
async function post(path: string, body: Json): Promise<Json | null> {
  let response: Response;
  try {
    response = await fetch(BASE_URL + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    throw new ItecPayError(`iTechPay request to ${path} failed: ${error instanceof Error ? error.message : error}`);
  }

  const text = await response.text();
  console.info(`[itecpay] ${path} req_ref=${body.req_ref} HTTP ${response.status}: ${text.slice(0, 2000)}`);

  if (!response.ok) throw new ItecPayError(`iTechPay ${path} returned HTTP ${response.status}`);
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? (parsed as Json) : null;
  } catch {
    return null;
  }
}

function field(obj: unknown, ...path: string[]): unknown {
  let current = obj;
  for (const key of path) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Json)[key];
  }
  return current;
}

function firstString(obj: unknown, paths: string[][]): string | null {
  for (const path of paths) {
    const value = field(obj, ...path);
    if (value !== undefined && value !== null && value !== '') return String(value);
  }
  return null;
}

function toNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export interface CollectResult {
  /** `false` only when iTechPay clearly refused the request. */
  accepted: boolean;
  /** `true` when the gateway's answer couldn't be read (prompt may have been sent). */
  unknown: boolean;
  transactionId: string | null;
  message: string | null;
}

/** Sends a MoMo / Airtel Money push prompt to the customer's phone. */
export async function requestMobileMoney(params: {
  method: 'mobile_money' | 'airtel_money';
  amount: number;
  phone: string;
  reference: string;
}): Promise<CollectResult> {
  const result = await post('/api2/pay', {
    amount: params.amount,
    phone: toItecPayPhone(params.phone),
    key: apiKey(params.method),
    req_ref: params.reference,
  });
  if (!result) return { accepted: true, unknown: true, transactionId: null, message: null };

  const status = result.status;
  const accepted =
    status === 200 || status === true || status === 1 ||
    (typeof status === 'string' && ['200', 'success', 'ok'].includes(status.toLowerCase()));

  return {
    accepted,
    unknown: false,
    transactionId: firstString(result, [['data', 'transaction_id'], ['data', 'financial_transaction_id']]),
    message: firstString(result, [['message'], ['data', 'message']]),
  };
}

/** Creates a Pesapal card payment page. */
export async function createCardPayment(params: {
  amount: number;
  email: string;
  reference: string;
  callbackUrl: string;
}): Promise<{ paymentUrl: string; pcode: string }> {
  const result = await post('/api/pay/apis/pesapal/generatecode', {
    amount: params.amount,
    email: params.email,
    key: apiKey('card'),
    req_ref: params.reference,
    currency: 'RWF',
    callback_url: params.callbackUrl,
  });
  const pcode = firstString(result, [['PCODE'], ['pcode'], ['data', 'PCODE']]);
  if (!pcode) throw new ItecPayError('iTechPay did not return a card payment code');
  const link = firstString(result, [['link'], ['data', 'link']]);
  return {
    pcode,
    paymentUrl: link || `${BASE_URL}/api/pay/apis/pesapal/index?PCODE=${encodeURIComponent(pcode)}`,
  };
}

export interface VerifyResult {
  state: 'paid' | 'failed' | 'pending';
  /** Amount iTechPay reports for the transaction, when it reports one. */
  amount: number | null;
  transactionId: string | null;
  rawStatus: string | null;
}

/**
 * Asks iTechPay for the live status of a payment. A top-level `status: 200`
 * only means the API call worked; the payment state is read from the inner
 * transaction status. Throws when the gateway can't be reached or answers in a
 * way we can't read — callers must then leave the payment pending.
 */
export async function verifyPayment(reference: string, method: GatewayMethod): Promise<VerifyResult> {
  const result = await post('/api2/verify', {
    action: 'status_check',
    req_ref: reference,
    key: apiKey(method),
  });
  if (!result) throw new ItecPayError('iTechPay verify returned a non-JSON response');

  const rawStatus = firstString(result, [
    ['transaction_status'],
    ['data', 'transaction_status'],
    ['payment_status'],
    ['data', 'payment_status'],
    ['data', 'status'],
  ]);
  const normalized = rawStatus?.toLowerCase() ?? '';
  const state = PAID_STATUSES.includes(normalized) ? 'paid' : FAILED_STATUSES.includes(normalized) ? 'failed' : 'pending';

  return {
    state,
    rawStatus,
    amount: toNumber(field(result, 'amount') ?? field(result, 'data', 'amount')),
    transactionId: firstString(result, [
      ['transaction_id'],
      ['data', 'transaction_id'],
      ['data', 'financial_transaction_id'],
    ]),
  };
}
