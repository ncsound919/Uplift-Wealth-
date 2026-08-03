import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '../lib/apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    localStorage.clear();
  });

  it('getStoredUser returns null when no user stored', () => {
    expect(apiClient.getStoredUser()).toBeNull();
  });

  it('loads a stored user id from localStorage on construction', async () => {
    localStorage.setItem('hacu_user_id', 'custom-user-123');
    vi.resetModules();
    const { apiClient: freshClient } = await import('../lib/apiClient');
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    const profile = await freshClient.getProfile();
    expect(profile.id).toBe('custom-user-123');
  });

  it('getStoredUser returns stored user', () => {
    const user = { id: 'test', name: 'Test User' };
    localStorage.setItem('hacu_user_data', JSON.stringify(user));
    expect(apiClient.getStoredUser()).toEqual(user);
  });

  it('getHealth returns status from API', async () => {
    const mockResponse = { status: 'ok', uptime: 12345, dbReady: true };
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) } as any);
    const result = await apiClient.getHealth();
    expect(result).toEqual(mockResponse);
  });

  it('getProfile returns profile on success', async () => {
    const mockProfile = { id: 'test', name: 'Test', role: 'student', track: 'all', badges: [], streakDays: 1, lastActive: new Date().toISOString() };
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve(mockProfile) } as any);
    const result = await apiClient.getProfile();
    expect(result.name).toBe('Test');
  });

  it('getProfile falls back to local on network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    const result = await apiClient.getProfile();
    expect(result.name).toBe('HBCU Fintech Scholar');
    expect(result.role).toBe('student');
  });

  it('updateProfile sends PUT request and returns updated profile', async () => {
    const mockProfile = { id: 'test', name: 'Updated', role: 'student', track: 'beginner', badges: ['pioneer'], streakDays: 3, lastActive: new Date().toISOString() };
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve(mockProfile) } as any);
    const result = await apiClient.updateProfile({ name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('updateProfile falls back to local fallback on error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    const result = await apiClient.updateProfile({ name: 'Fallback User', badges: ['pioneer_scholar'] });
    expect(result.name).toBe('Fallback User');
    expect(result.badges).toContain('pioneer_scholar');
  });

  it('getProgress falls back to localStorage on fetch failure', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    localStorage.setItem('hacu_progress', JSON.stringify({ userId: 'test', completedLessons: ['l1'] }));
    const progress = await apiClient.getProgress();
    expect(progress.completedLessons).toContain('l1');
  });

  it('saveLessonProgress falls back to localStorage', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    const result = await apiClient.saveLessonProgress('lesson-1', 'module-1');
    expect(result.completedLessons).toContain('lesson-1');
  });

  it('saveLessonProgress deduplicates on fallback', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    const result = await apiClient.saveLessonProgress('lesson-1', 'module-1');
    expect(result.completedLessons.filter(l => l === 'lesson-1').length).toBe(1);
  });

  it('saveLessonProgress stores server response locally on success', async () => {
    const mockProgress = { userId: 'test', completedLessons: ['l1', 'lesson-1'], completedModules: [] };
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve(mockProgress) } as any);
    const result = await apiClient.saveLessonProgress('lesson-1', 'module-1');
    expect(result.completedLessons).toContain('lesson-1');
    expect(JSON.parse(localStorage.getItem('hacu_progress') || '{}')).toEqual(mockProgress);
  });

  it('submitQuizScore falls back to local on failure', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    const result = await apiClient.submitQuizScore('module-1', 8, 10);
    expect(result.passed).toBe(true);
  });

  it('submitQuizScore returns failed when below 70%', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    const result = await apiClient.submitQuizScore('module-1', 5, 10);
    expect(result.passed).toBe(false);
  });

  it('saveSandboxState falls back to localStorage', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    const result = await apiClient.saveSandboxState({ sandboxType: 'trading', stateData: { balance: 1000 } });
    expect(result).toHaveProperty('savedOffline', true);
  });

  it('loadSandboxState returns null stateData when no local data', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    const result = await apiClient.loadSandboxState('trading');
    expect(result.stateData).toBeNull();
  });

  it('loadSandboxState returns stored local data on fallback', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    localStorage.setItem('hacu_sandbox_trading', JSON.stringify({ balance: 5000 }));
    const result = await apiClient.loadSandboxState('trading');
    expect(result.stateData).toEqual({ balance: 5000 });
  });

  it('logDonationIntent falls back to offline on error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    const result = await apiClient.logDonationIntent({ amount: 50 });
    expect(result).toEqual({ logged: true, offline: true });
  });

  it('loginWithEmail sends POST and stores token/user on success', async () => {
    const mockRes = { success: true, token: 'abc123', user: { id: 'u1', name: 'User', role: 'student', track: 'all', badges: [], streakDays: 0, lastActive: new Date().toISOString() } };
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve(mockRes) } as any);
    const result = await apiClient.loginWithEmail('test@example.com', 'pass');
    expect(result.success).toBe(true);
    expect(localStorage.getItem('hacu_auth_token')).toBe('abc123');
    expect(localStorage.getItem('hacu_user_data')).toBeTruthy();
  });

  it('loginWithGoogle sends POST and stores token/user on success', async () => {
    const mockRes = { success: true, token: 'google-token', user: { id: 'u2', name: 'G User', role: 'student', track: 'all', badges: [], streakDays: 0, lastActive: new Date().toISOString() } };
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve(mockRes) } as any);
    const result = await apiClient.loginWithGoogle('guser@example.com');
    expect(result.success).toBe(true);
    expect(localStorage.getItem('hacu_auth_token')).toBe('google-token');
  });

  it('logout clears stored tokens', async () => {
    localStorage.setItem('hacu_auth_token', 'abc');
    localStorage.setItem('hacu_user_data', JSON.stringify({ id: 'u1' }));
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    await apiClient.logout();
    expect(localStorage.getItem('hacu_auth_token')).toBeNull();
    expect(localStorage.getItem('hacu_user_data')).toBeNull();
  });

  it('getStockQuote fetches quote from API', async () => {
    const mockQuote = { price: 150.25, change: 2.50 };
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve(mockQuote) } as any);
    const result = await apiClient.getStockQuote('AAPL');
    expect(result).toEqual(mockQuote);
  });

  it('getStockQuote returns undefined fields on network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    const result = await apiClient.getStockQuote('AAPL');
    expect(result).toEqual({ price: undefined, change: undefined, changePercent: undefined });
  });

  it('throws on non-OK response', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500, statusText: 'Server Error', json: () => Promise.resolve({ message: 'Internal error' }) } as any);
    await expect(apiClient.getHealth()).rejects.toThrow('Internal error');
  });

  it('throws on non-OK response with fallback to statusText', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 503, statusText: 'Service Unavailable', json: () => Promise.reject(new Error('parse fail')) } as any);
    await expect(apiClient.getHealth()).rejects.toThrow('Service Unavailable');
  });
});
