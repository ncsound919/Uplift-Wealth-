import { describe, it, expect, afterEach } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  resolveRequestUser,
  GUEST_USER,
  userIdFromEmail,
  isValidEmail,
  getAccessSecret,
  getRefreshSecret,
  REFRESH_COOKIE_NAME,
} from './auth';

const USER = { id: 'usr-test', role: 'student' as const };

describe('auth: password hashing', () => {
  it('hashes and verifies a correct password', async () => {
    const hash = await hashPassword('correct horse battery staple');
    expect(hash).not.toBe('correct horse battery staple');
    await expect(verifyPassword('correct horse battery staple', hash)).resolves.toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('right-password');
    await expect(verifyPassword('wrong-password', hash)).resolves.toBe(false);
  });

  it('produces unique salts per hash', async () => {
    const a = await hashPassword('same-password');
    const b = await hashPassword('same-password');
    expect(a).not.toBe(b);
  });
});

describe('auth: JWT access tokens', () => {
  it('signs and verifies an access token', () => {
    const token = signAccessToken(USER);
    expect(verifyAccessToken(token)).toEqual(USER);
  });

  it('returns null for a tampered token', () => {
    const token = signAccessToken(USER);
    const tampered = token.slice(0, -4) + 'aaaa';
    expect(verifyAccessToken(tampered)).toBeNull();
  });

  it('returns null for a garbage token', () => {
    expect(verifyAccessToken('not-a-jwt')).toBeNull();
  });

  it('rejects an access token when secrets differ', () => {
    const token = signAccessToken(USER);
    const original = process.env.JWT_ACCESS_SECRET;
    process.env.JWT_ACCESS_SECRET = 'overlay-test-other-secret';
    try {
      expect(verifyAccessToken(token)).toBeNull();
    } finally {
      if (original === undefined) delete process.env.JWT_ACCESS_SECRET;
      else process.env.JWT_ACCESS_SECRET = original;
    }
  });
});

describe('auth: JWT refresh tokens', () => {
  it('signs and verifies a refresh token', () => {
    const token = signRefreshToken(USER);
    expect(verifyRefreshToken(token)).toEqual({ ...USER, tokenVersion: 0 });
  });

  it('embeds and returns the token version', () => {
    const token = signRefreshToken(USER, 7);
    expect(verifyRefreshToken(token)).toEqual({ ...USER, tokenVersion: 7 });
  });

  it('does not accept an access token as a refresh token', () => {
    const access = signAccessToken(USER);
    expect(verifyRefreshToken(access)).toBeNull();
  });

  it('does not accept a refresh token as an access token', () => {
    const refresh = signRefreshToken(USER);
    expect(verifyAccessToken(refresh)).toBeNull();
  });

  it('returns null for an invalid refresh token', () => {
    expect(verifyRefreshToken('garbage')).toBeNull();
  });
});

describe('auth: resolveRequestUser', () => {
  it('returns the guest identity when no token is provided', () => {
    expect(resolveRequestUser(undefined)).toEqual(GUEST_USER);
    expect(resolveRequestUser('')).toEqual(GUEST_USER);
    expect(resolveRequestUser(null)).toEqual(GUEST_USER);
  });

  it('returns the guest identity for a tampered/garbage token', () => {
    expect(resolveRequestUser('not-a-real-jwt')).toEqual(GUEST_USER);
    expect(resolveRequestUser(signAccessToken(USER).slice(0, -4) + 'aaaa')).toEqual(GUEST_USER);
  });

  it('returns the token user for a valid access token', () => {
    expect(resolveRequestUser(signAccessToken(USER))).toEqual(USER);
  });

  it('never elevates a guest to an admin role', () => {
    const resolved = resolveRequestUser(null);
    expect(resolved.role).not.toBe('admin');
    expect(resolved.role).not.toBe('institution');
    expect(resolved.id).toBe('demo-student-01');
  });
});

describe('auth: helpers', () => {
  afterEach(() => {
    delete process.env.JWT_ACCESS_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
  });

  it('derives a stable user id from an email', () => {
    expect(userIdFromEmail('Foo@Example.COM')).toBe(userIdFromEmail('foo@example.com'));
    expect(userIdFromEmail('foo@example.com')).toMatch(/^usr-/);
  });

  it('validates emails', () => {
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('uses secrets from env when provided', () => {
    process.env.JWT_ACCESS_SECRET = 'access-secret';
    process.env.JWT_REFRESH_SECRET = 'refresh-secret';
    expect(getAccessSecret()).toBe('access-secret');
    expect(getRefreshSecret()).toBe('refresh-secret');
  });

  it('falls back to dev secrets when env is unset', () => {
    expect(getAccessSecret()).toContain('dev-access-secret');
    expect(getRefreshSecret()).toContain('dev-refresh-secret');
  });

  it('exposes a refresh cookie name', () => {
    expect(REFRESH_COOKIE_NAME).toBe('ow_refresh');
  });
});
