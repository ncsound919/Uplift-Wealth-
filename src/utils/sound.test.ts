import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { soundManager } from './sound';

function createMockAudioCtx() {
  const gainNode = {
    gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  };
  const oscNode = {
    type: '',
    frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
  return {
    createOscillator: vi.fn(() => ({ ...oscNode, connect: vi.fn() })),
    createGain: vi.fn(() => ({ ...gainNode, connect: vi.fn() })),
    createBiquadFilter: vi.fn(() => ({
      type: '', frequency: { setValueAtTime: vi.fn() }, connect: vi.fn(),
    })),
    destination: 'mock-dest',
    currentTime: 1000,
    state: 'running',
    resume: vi.fn().mockResolvedValue(undefined),
  };
}

describe('soundManager', () => {
  beforeEach(() => {
    while (soundManager.isMuted()) soundManager.toggleMute();
  });

  afterEach(() => {
    while (soundManager.isMuted()) soundManager.toggleMute();
  });

  it('starts unmuted', () => {
    expect(soundManager.isMuted()).toBe(false);
  });

  it('toggleMute switches state', () => {
    const before = soundManager.isMuted();
    soundManager.toggleMute();
    expect(soundManager.isMuted()).toBe(!before);
    soundManager.toggleMute();
    expect(soundManager.isMuted()).toBe(before);
  });

  it('play methods exist and do not throw', () => {
    expect(typeof soundManager.playTick).toBe('function');
    expect(typeof soundManager.playSuccess).toBe('function');
    expect(typeof soundManager.playFailure).toBe('function');
    expect(typeof soundManager.playWin).toBe('function');
  });

  it('play methods are no-ops when muted', () => {
    soundManager.toggleMute();
    expect(() => {
      soundManager.playTick();
      soundManager.playSuccess();
      soundManager.playFailure();
      soundManager.playWin();
    }).not.toThrow();
    soundManager.toggleMute();
  });

  it('does not throw when unmuted without AudioContext', () => {
    expect(() => {
      soundManager.playTick();
      soundManager.playSuccess();
      soundManager.playFailure();
      soundManager.playWin();
    }).not.toThrow();
  });
});

describe('soundManager with AudioContext mocked', () => {
  let mockAudioCtx: ReturnType<typeof createMockAudioCtx>;

  beforeEach(async () => {
    vi.resetModules();
    mockAudioCtx = createMockAudioCtx();
    vi.stubGlobal('AudioContext', function() { return mockAudioCtx; });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('playTick creates oscillator and gain nodes', async () => {
    const { soundManager: sm } = await import('./sound');
    while (sm.isMuted()) sm.toggleMute();
    sm.playTick();
    expect(mockAudioCtx.createOscillator).toHaveBeenCalled();
    expect(mockAudioCtx.createGain).toHaveBeenCalled();
  });

  it('playSuccess creates three oscillators and gain nodes', async () => {
    const { soundManager: sm } = await import('./sound');
    while (sm.isMuted()) sm.toggleMute();
    sm.playSuccess();
    expect(mockAudioCtx.createOscillator).toHaveBeenCalledTimes(3);
    expect(mockAudioCtx.createGain).toHaveBeenCalledTimes(3);
  });

  it('playFailure creates oscillator biquad filter and gain', async () => {
    const { soundManager: sm } = await import('./sound');
    while (sm.isMuted()) sm.toggleMute();
    sm.playFailure();
    expect(mockAudioCtx.createOscillator).toHaveBeenCalled();
    expect(mockAudioCtx.createBiquadFilter).toHaveBeenCalled();
    expect(mockAudioCtx.createGain).toHaveBeenCalled();
  });

  it('playWin creates seven oscillators', async () => {
    const { soundManager: sm } = await import('./sound');
    while (sm.isMuted()) sm.toggleMute();
    sm.playWin();
    expect(mockAudioCtx.createOscillator).toHaveBeenCalledTimes(7);
  });

  it('resumes suspended AudioContext', async () => {
    mockAudioCtx.state = 'suspended';
    const { soundManager: sm } = await import('./sound');
    while (sm.isMuted()) sm.toggleMute();
    sm.playTick();
    expect(mockAudioCtx.resume).toHaveBeenCalled();
  });

  it('swallows a rejected resume on a suspended AudioContext', async () => {
    mockAudioCtx.state = 'suspended';
    mockAudioCtx.resume.mockRejectedValueOnce(new Error('resume failed'));
    const { soundManager: sm } = await import('./sound');
    while (sm.isMuted()) sm.toggleMute();
    expect(() => sm.playTick()).not.toThrow();
    expect(mockAudioCtx.resume).toHaveBeenCalled();
  });

  it('does not play when muted even with AudioContext', async () => {
    const { soundManager: sm } = await import('./sound');
    sm.toggleMute();
    sm.playTick();
    expect(mockAudioCtx.createOscillator).not.toHaveBeenCalled();
  });
});
