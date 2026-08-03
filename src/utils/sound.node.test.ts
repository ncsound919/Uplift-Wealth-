// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { soundManager } from './sound';

describe('soundManager without window', () => {
  it('no-ops all play methods when window is undefined', () => {
    expect(typeof window).toBe('undefined');
    expect(() => {
      soundManager.playTick();
      soundManager.playSuccess();
      soundManager.playFailure();
      soundManager.playWin();
    }).not.toThrow();
  });
});
