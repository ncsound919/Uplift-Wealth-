import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../lib/apiClient';

function mockOk(payload: unknown) {
  vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve(payload) } as never);
}

async function expectRequest(
  run: () => Promise<unknown>,
  payload: unknown,
  urlContains: string,
  method?: string
): Promise<[string, RequestInit | undefined]> {
  mockOk(payload);
  const result = await run();
  expect(result).toEqual(payload);
  const call = vi.mocked(fetch).mock.calls[0];
  expect(String(call[0])).toContain(urlContains);
  if (method) expect(call[1]?.method).toBe(method);
  return [String(call[0]), call[1]];
}

describe('apiClient remaining API surface', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    localStorage.clear();
  });

  it('setUserId persists the id', () => {
    apiClient.setUserId('uid-svc');
    expect(localStorage.getItem('hacu_user_id')).toBe('uid-svc');
  });

  it('getPublicProfile fetches a public profile', () =>
    expectRequest(() => apiClient.getPublicProfile('usr-1'), { id: 'usr-1', name: 'Nia' }, '/api/profile/usr-1'));

  it('listThreads fetches without filters', () =>
    expectRequest(() => apiClient.listThreads({}), { threads: [] }, '/api/threads'));

  it('listThreads appends module/lesson filters', async () => {
    const [url] = await expectRequest(() => apiClient.listThreads({ moduleId: 'm1', lessonId: 'l1' }), { threads: [] }, '/api/threads');
    expect(url).toContain('moduleId=m1');
    expect(url).toContain('lessonId=l1');
  });

  it('getThread fetches a thread with comments', () =>
    expectRequest(() => apiClient.getThread('t1'), { thread: {}, comments: [] }, '/api/threads/t1'));

  it('createThread POSTs a new thread', () =>
    expectRequest(() => apiClient.createThread({ title: 'Hi', body: 'Body' }), { success: true, thread: {} }, '/api/threads', 'POST'));

  it('addComment POSTs a comment', () =>
    expectRequest(() => apiClient.addComment('t1', 'Nice'), { success: true, comment: {} }, '/api/threads/t1/comments', 'POST'));

  it('upvoteThread POSTs an upvote', () =>
    expectRequest(() => apiClient.upvoteThread('t1'), { success: true, upvoted: true, upvotes: 2 }, '/api/threads/t1/upvote', 'POST'));

  it('upvoteComment POSTs an upvote', () =>
    expectRequest(() => apiClient.upvoteComment('c1'), { success: true, upvoted: true, upvotes: 1 }, '/api/comments/c1/upvote', 'POST'));

  it('report POSTs a report', () =>
    expectRequest(() => apiClient.report('thread', 't1', 'spam'), { success: true, report: {} }, '/api/reports', 'POST'));

  it('deleteThread DELETEs a thread', () =>
    expectRequest(() => apiClient.deleteThread('t1'), { success: true, deleted: true }, '/api/threads/t1', 'DELETE'));

  it('deleteComment DELETEs a comment', () =>
    expectRequest(() => apiClient.deleteComment('c1'), { success: true, deleted: true }, '/api/comments/c1', 'DELETE'));

  it('listMyCohorts fetches cohorts', () =>
    expectRequest(() => apiClient.listMyCohorts(), { cohorts: [] }, '/api/cohorts'));

  it('createCohort POSTs a new cohort', () =>
    expectRequest(() => apiClient.createCohort({ name: 'Class' }), { success: true, cohort: {} }, '/api/cohorts', 'POST'));

  it('getCohort fetches a cohort leaderboard', () =>
    expectRequest(() => apiClient.getCohort('coh-1'), { cohort: {}, members: [] }, '/api/cohorts/coh-1'));

  it('joinCohortByCode POSTs an invite code', () =>
    expectRequest(() => apiClient.joinCohortByCode('AB12CD'), { success: true, cohort: {} }, '/api/cohorts/join', 'POST'));

  it('leaveCohort POSTs a leave', () =>
    expectRequest(() => apiClient.leaveCohort('coh-1'), { success: true, cohort: {} }, '/api/cohorts/coh-1/leave', 'POST'));

  it('deleteCohort DELETEs a cohort', () =>
    expectRequest(() => apiClient.deleteCohort('coh-1'), { success: true, deleted: true }, '/api/cohorts/coh-1', 'DELETE'));

  it('setCohortCurriculum PUTs assigned modules', () =>
    expectRequest(() => apiClient.setCohortCurriculum('coh-1', ['m1']), { success: true, cohort: {} }, '/api/cohorts/coh-1/curriculum', 'PUT'));

  it('getCohortRoster fetches the roster', () =>
    expectRequest(() => apiClient.getCohortRoster('coh-1'), { roster: [] }, '/api/cohorts/coh-1/roster'));

  it('listInstitutionClasses fetches classes + rosters', () =>
    expectRequest(() => apiClient.listInstitutionClasses(), { classes: [] }, '/api/institution/classes'));

  it('getNotifications fetches notifications', () =>
    expectRequest(() => apiClient.getNotifications(), { notifications: [], unreadCount: 0 }, '/api/notifications'));

  it('markAllNotificationsRead POSTs read-all', () =>
    expectRequest(() => apiClient.markAllNotificationsRead(), { success: true, changed: 1 }, '/api/notifications/read-all', 'POST'));

  it('markNotificationRead POSTs a read', () =>
    expectRequest(() => apiClient.markNotificationRead('n1'), { success: true, notification: {} }, '/api/notifications/n1/read', 'POST'));

  it('getEffectiveContent fetches an override', () =>
    expectRequest(() => apiClient.getEffectiveContent('m1', 'l1'), { overridden: true, content: 'x', version: 2 }, '/api/content/m1/l1'));

  it('listOverrides fetches content overrides', () =>
    expectRequest(() => apiClient.listOverrides(), { overrides: [] }, '/api/content/overrides'));

  it('getContentRevisions fetches revisions', () =>
    expectRequest(() => apiClient.getContentRevisions('m1', 'l1'), { revisions: [] }, '/api/content/m1/l1/revisions'));

  it('saveLessonOverride PUTs content', () =>
    expectRequest(() => apiClient.saveLessonOverride('m1', 'l1', 'new'), { success: true, override: {} }, '/api/content/m1/l1', 'PUT'));

  it('deleteLessonOverride DELETEs content', () =>
    expectRequest(() => apiClient.deleteLessonOverride('m1', 'l1'), { success: true, deleted: true }, '/api/content/m1/l1', 'DELETE'));

  it('applyAsCreator POSTs an application', () =>
    expectRequest(() => apiClient.applyAsCreator('I teach finance'), { success: true, application: {} }, '/api/creator/apply', 'POST'));

  it('getCreatorStatus fetches creator status', () =>
    expectRequest(() => apiClient.getCreatorStatus(), { verified: false, bio: undefined, application: null }, '/api/creator/status'));

  it('listCreatorApplications fetches applications', () =>
    expectRequest(() => apiClient.listCreatorApplications(), { applications: [] }, '/api/creator/applications'));

  it('reviewCreatorApplication PUTs a review', () =>
    expectRequest(() => apiClient.reviewCreatorApplication('cre-1', 'approved'), { success: true, application: {} }, '/api/creator/applications/cre-1', 'PUT'));

  it('getBillingPlans fetches plans', () =>
    expectRequest(() => apiClient.getBillingPlans(), { plans: [], stripeConfigured: false }, '/api/billing/plans'));

  it('getBillingStatus fetches billing status', () =>
    expectRequest(() => apiClient.getBillingStatus(), { tier: 'free', email: '', hasStripeCustomer: false, stripeConfigured: false }, '/api/billing/status'));

  it('startCheckout POSTs an institutional checkout', () =>
    expectRequest(() => apiClient.startCheckout('institutional'), { success: true, url: 'https://x' }, '/api/billing/checkout', 'POST'));

  it('openBillingPortal POSTs a portal session', () =>
    expectRequest(() => apiClient.openBillingPortal(), { success: true, url: 'https://x' }, '/api/billing/portal', 'POST'));
});
