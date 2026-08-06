/**
 * Server-side authentication primitives for Overlay Wealth.
 *
 * Pure, dependency-injectable helpers used by the Express server (server.ts)
 * and covered by unit tests. Kept out of the client bundle — the browser never
 * imports this module (it only handles tokens issued here).
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  role: 'student' | 'builder' | 'institution' | 'admin';
}

/** Authenticated user plus the refresh-token version used for revocation.
 *  Bumping a user's tokenVersion invalidates every refresh token issued
 *  before the bump (used by logout). */
export interface RefreshTokenPayload extends AuthUser {
  tokenVersion: number;
}

/** Anonymous/guest identity. Fixed id + student role only — never elevated.
 *  Elevated roles are granted exclusively by a signed access token. */
export const GUEST_USER: AuthUser = { id: 'demo-student-01', role: 'student' };

/** Resolve the authenticated user from an optional bearer token.
 *  Without a valid token the caller is treated as the anonymous guest.
 *  Spoofable headers (X-User-Id / X-User-Role / ?userId) are deliberately
 *  ignored so they cannot escalate privileges or impersonate other users. */
export function resolveRequestUser(bearerToken: string | null | undefined): AuthUser {
  if (bearerToken) {
    const verified = verifyAccessToken(bearerToken);
    if (verified) return verified;
  }
  return GUEST_USER;
}

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const BCRYPT_ROUNDS = 10;

/** JWT secrets. Real values must be set in production env; dev fallbacks keep
 *  local runs working without configuration. Never commit real secrets. */
export function getAccessSecret(): string {
  return process.env.JWT_ACCESS_SECRET || 'overlay-dev-access-secret';
}

export function getRefreshSecret(): string {
  return process.env.JWT_REFRESH_SECRET || 'overlay-dev-refresh-secret';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

/** Stable, deterministic user id derived from a normalized email address. */
export function userIdFromEmail(email: string, prefix = 'usr'): string {
  const clean = email.toLowerCase().trim();
  return `${prefix}-${Buffer.from(clean).toString('hex').slice(0, 12)}`;
}

function newTokenId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function signAccessToken(user: AuthUser): string {
  return jwt.sign({ type: 'access', ...user }, getAccessSecret(), { expiresIn: ACCESS_TOKEN_TTL });
}

export function signRefreshToken(user: AuthUser, tokenVersion = 0): string {
  return jwt.sign({ type: 'refresh', ...user, tv: tokenVersion, jti: newTokenId() }, getRefreshSecret(), {
    expiresIn: REFRESH_TOKEN_TTL,
  });
}

/** Returns the authenticated user or null when the token is absent/invalid. */
export function verifyAccessToken(token: string): AuthUser | null {
  try {
    const payload = jwt.verify(token, getAccessSecret()) as { type?: string; id?: string; role?: AuthUser['role'] };
    if (payload && payload.type === 'access' && typeof payload.id === 'string' && payload.role) {
      return { id: payload.id, role: payload.role };
    }
    return null;
  } catch {
    return null;
  }
}

/** Returns the user + token version, or null when the refresh token is invalid. */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const payload = jwt.verify(token, getRefreshSecret()) as {
      type?: string; id?: string; role?: AuthUser['role']; tv?: number;
    };
    if (payload && payload.type === 'refresh' && typeof payload.id === 'string' && payload.role) {
      return { id: payload.id, role: payload.role, tokenVersion: payload.tv ?? 0 };
    }
    return null;
  } catch {
    return null;
  }
}

export function isValidEmail(email: string): boolean {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const REFRESH_COOKIE_NAME = 'ow_refresh';
export const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // seconds
