/**
 * Fail-soft client for the finance-connect double-entry ledger.
 *
 * The ledger keys every journal entry by `kind:id` and ignores replays, so a
 * re-delivered Stripe webhook is safe. This module never throws: a ledger
 * outage must not fail a payment that has already succeeded. Mirrors the
 * raw-HTTP, env-at-call-time style of stripe.ts.
 */
export type LedgerEventKind =
  | 'charge.settled'
  | 'charge.refunded'
  | 'commission.accrued'
  | 'commission.approved'
  | 'commission.reversed'
  | 'payout.paid'
  | 'payout.failed';

export interface LedgerEvent {
  kind: LedgerEventKind;
  id: string;
  amountCents: number;
  occurredAt?: string;
  memo?: string;
}

export function ledgerUrl(): string | undefined {
  return process.env.FINANCE_CONNECT_URL?.replace(/\/+$/, '') || undefined;
}

export function isLedgerConfigured(): boolean {
  return !!ledgerUrl();
}

export async function postLedgerEvent(event: LedgerEvent): Promise<boolean> {
  const base = ledgerUrl();
  if (!base) return false;
  if (!event.id || !Number.isInteger(event.amountCents) || event.amountCents <= 0) return false;
  try {
    const signal =
      typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(5_000)
        : undefined;
    const res = await fetch(`${base}/api/v1/ledger/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FINANCE_CONNECT_TOKEN ?? ''}`,
      },
      body: JSON.stringify({
        kind: event.kind,
        id: event.id,
        amount_cents: event.amountCents,
        occurred_at: event.occurredAt,
        memo: event.memo,
      }),
      signal,
    });
    return res.ok;
  } catch {
    return false;
  }
}
