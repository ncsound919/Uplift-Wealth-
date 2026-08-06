/**
 * Transactional email via Resend. No-op when EMAIL_API_KEY / EMAIL_FROM are
 * unset, so local dev and tests never attempt a send. Add EMAIL_API_KEY to
 * production env to activate welcome + waitlist emails.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export function isEmailConfigured(): boolean {
  return !!process.env.EMAIL_API_KEY && !!process.env.EMAIL_FROM;
}

export interface SendEmailResult {
  sent: boolean;
  error?: string;
}

export async function sendEmail(opts: { to: string; subject: string; html: string; text?: string }): Promise<SendEmailResult> {
  if (!isEmailConfigured()) {
    console.log(`[Email] Not configured — skipping "${opts.subject}" to ${opts.to}`);
    return { sent: false, error: 'EMAIL_API_KEY not set' };
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      }),
    });
    if (!res.ok) {
      return { sent: false, error: `Resend HTTP ${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function sendWelcomeEmail(to: string, name: string): Promise<SendEmailResult> {
  const display = name?.trim() || to.split('@')[0];
  return sendEmail({
    to,
    subject: 'Welcome to Overlay Wealth 🎉',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2>Welcome to Overlay Wealth, ${escapeHtml(display)}!</h2>
        <p>You're now set up to build real financial knowledge — credit, investing,
           real estate, business, and group economics — at your own pace.</p>
        <p><strong>Start here:</strong> open the app and begin Module 1,
           "How Banks & Digital Money Work," or dive into the Wealth Building chapters.</p>
        <p>— The Overlay Wealth team</p>
      </div>`,
  });
}

export function sendWaitlistConfirmEmail(to: string): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: 'You\u2019re on the Overlay Wealth list ✨',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2>You're on the list!</h2>
        <p>Thanks for joining Overlay Wealth. We'll let you know as new courses,
           tools, and community features launch.</p>
        <p>— The Overlay Wealth team</p>
      </div>`,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
