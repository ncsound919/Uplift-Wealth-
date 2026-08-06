import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WaitlistForm } from './WaitlistForm';

describe('WaitlistForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('submits an email to the waitlist endpoint', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) } as Response);
    render(<WaitlistForm source="wealth-hub" />);

    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'friend@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /join the list/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/waitlist', expect.objectContaining({ method: 'POST' }));
    });
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toEqual({ email: 'friend@example.com', source: 'wealth-hub' });
  });

  it('shows a success message after subscribing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) } as Response);
    render(<WaitlistForm />);
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'friend@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /join the list/i }));
    expect(await screen.findByText(/on the list/i)).toBeInTheDocument();
  });

  it('shows an error message on failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 500 } as Response);
    render(<WaitlistForm />);
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'friend@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /join the list/i }));
    expect(await screen.findByText(/Something went wrong/i)).toBeInTheDocument();
  });

  it('disables the button when no email is entered', () => {
    render(<WaitlistForm />);
    expect(screen.getByRole('button', { name: /join the list/i })).toBeDisabled();
  });
});
