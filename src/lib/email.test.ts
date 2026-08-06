import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { sendEmail, sendWelcomeEmail, sendWaitlistConfirmEmail, isEmailConfigured } from './email';

function mockFetch(ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve({}),
  } as Response);
}

describe('email', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('isEmailConfigured reflects env', () => {
    expect(isEmailConfigured()).toBe(false);
    vi.stubEnv('EMAIL_API_KEY', 're_test');
    vi.stubEnv('EMAIL_FROM', 'noreply@overlaywealth.org');
    expect(isEmailConfigured()).toBe(true);
  });

  it('is a no-op without a key', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response);
    vi.stubGlobal('fetch', fetchMock);
    const result = await sendEmail({ to: 'a@b.co', subject: 'Hi', html: '<p>hi</p>' });
    expect(result.sent).toBe(false);
    expect(result.error).toContain('EMAIL_API_KEY');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts to Resend when configured', async () => {
    vi.stubEnv('EMAIL_API_KEY', 're_test');
    vi.stubEnv('EMAIL_FROM', 'noreply@overlaywealth.org');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const result = await sendEmail({ to: 'a@b.co', subject: 'Hi', html: '<p>hi</p>', text: 'hi' });
    expect(result.sent).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.headers.Authorization).toBe('Bearer re_test');
    const body = JSON.parse(init.body);
    expect(body.to).toEqual(['a@b.co']);
    expect(body.from).toBe('noreply@overlaywealth.org');
  });

  it('reports failure on non-OK response', async () => {
    vi.stubEnv('EMAIL_API_KEY', 're_test');
    vi.stubEnv('EMAIL_FROM', 'noreply@overlaywealth.org');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 422 } as Response));
    const result = await sendEmail({ to: 'a@b.co', subject: 'Hi', html: '<p>hi</p>' });
    expect(result.sent).toBe(false);
    expect(result.error).toContain('422');
  });

  it('builds a welcome email with the user name', async () => {
    vi.stubEnv('EMAIL_API_KEY', 're_test');
    vi.stubEnv('EMAIL_FROM', 'noreply@overlaywealth.org');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response);
    vi.stubGlobal('fetch', fetchMock);
    await sendWelcomeEmail('jane@example.com', 'Jane');
    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.subject).toContain('Welcome');
    expect(body.html).toContain('Jane');
  });

  it('builds a waitlist confirmation email', async () => {
    vi.stubEnv('EMAIL_API_KEY', 're_test');
    vi.stubEnv('EMAIL_FROM', 'noreply@overlaywealth.org');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response);
    vi.stubGlobal('fetch', fetchMock);
    await sendWaitlistConfirmEmail('jane@example.com');
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body).subject).toContain('list');
  });
});
