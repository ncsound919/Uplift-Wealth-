import { describe, it, expect } from 'vitest';
import { resolveIcon } from './iconResolver';

describe('resolveIcon', () => {
  it('returns the icon when passed a component', () => {
    const FakeIcon = () => null;
    expect(resolveIcon(FakeIcon)).toBe(FakeIcon);
  });

  it('returns a known icon when passed a string key', () => {
    const icon = resolveIcon('Wallet');
    expect(icon).toBeDefined();
  });

  it('returns fallback for unknown string', () => {
    const icon = resolveIcon('NonExistentIcon');
    expect(icon).toBeDefined();
  });

  it('returns fallback for null', () => {
    const icon = resolveIcon(null);
    expect(icon).toBeDefined();
  });
});
