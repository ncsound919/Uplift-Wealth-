import { describe, it, expect, vi, afterEach } from 'vitest';
import { isLedgerConfigured, ledgerUrl, postLedgerEvent } from './ledger';

function mockFetch(ok: boolean) {
  return vi.fn().mockResolvedValue({ ok, status: ok ? 201 : 400 } as Response);
}

describe('ledger helper', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('is unconfigured by default', () => {
    expect(isLedgerConfigured()).toBe(false);
    expect(ledgerUrl()).toBeUndefined();
  });

  it('reflects FINANCE_CONNECT_URL and trims trailing slashes', () => {
    vi.stubEnv('FINANCE_CONNECT_URL', 'http://localhost:4000/');
    expect(isLedgerConfigured()).toBe(true);
    expect(ledgerUrl()).toBe('http://localhost:4000');
  });

  it('is inert when unconfigured', async () => {
    const fetchMock = mockFetch(true);
    vi.stubGlobal('fetch', fetchMock);
    expect(await postLedgerEvent({ kind: 'charge.settled', id: 'x', amountCents: 100 })).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts a normalized payload to the ingest endpoint', async () => {
    vi.stubEnv('FINANCE_CONNECT_URL', 'http://localhost:4000');
    vi.stubEnv('FINANCE_CONNECT_TOKEN', 'tk');
    const fetchMock = mockFetch(true);
    vi.stubGlobal('fetch', fetchMock);

    const ok = await postLedgerEvent({
      kind: 'charge.settled',
      id: 'cs_1',
      amountCents: 9900,
      occurredAt: '2026-09-01T00:00:00.000Z',
      memo: 'subscription',
    });

    expect(ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('http://localhost:4000/api/v1/ledger/ingest');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tk');
    expect(JSON.parse(init.body as string)).toMatchObject({
      kind: 'charge.settled',
      id: 'cs_1',
      amount_cents: 9900,
      memo: 'subscription',
    });
  });

  it('rejects bad input without calling fetch', async () => {
    vi.stubEnv('FINANCE_CONNECT_URL', 'http://localhost:4000');
    const fetchMock = mockFetch(true);
    vi.stubGlobal('fetch', fetchMock);
    expect(await postLedgerEvent({ kind: 'charge.settled', id: '', amountCents: 100 })).toBe(false);
    expect(await postLedgerEvent({ kind: 'charge.settled', id: 'x', amountCents: 0 })).toBe(false);
    expect(await postLedgerEvent({ kind: 'charge.settled', id: 'x', amountCents: 1.5 })).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('is fail-soft on a non-ok response and on a thrown error', async () => {
    vi.stubEnv('FINANCE_CONNECT_URL', 'http://localhost:4000');
    vi.stubGlobal('fetch', mockFetch(false));
    expect(await postLedgerEvent({ kind: 'charge.settled', id: 'x', amountCents: 100 })).toBe(false);

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));
    expect(await postLedgerEvent({ kind: 'charge.settled', id: 'x', amountCents: 100 })).toBe(false);
  });
});
