import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildPlanDocument, downloadCompletePlan, type PlanContext } from './planDownload';
import { STARTER_FILES } from './starterKit';

const mockCtx: PlanContext = {
  businessName: 'TestCo',
  founderName: 'Jane Doe',
  founderState: 'California',
  filingState: 'Delaware',
  structure: 'LLC',
  finalLane: 'embedded payments',
  selectedCohort: 'small businesses',
  finalProblem: 'high payment processing fees',
  selectedApis: ['Plaid', 'Stripe'],
  monetization: 'subscription',
  equitySplit: '4-year vesting',
  fundingStrategy: 'SAFE notes',
  hqType: 'virtual mailbox',
  businessType: 'fintech',
  reachUsers: 10000,
  monthlyFee: 12,
  txVolume: 150000,
  marketingChannel: 'Developer Relations & API documentation',
  brandStyle: 'Urban',
  stats: { legit: 92, budget: 50, revenue: 1440000, grade: 'A', cpa: 8, score: 91 },
};

describe('buildPlanDocument', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('includes the business name, executive summary and market opportunity', () => {
    const doc = buildPlanDocument(mockCtx);
    expect(doc).toContain('# TESTCO — COMPLETE BUSINESS PLAN');
    expect(doc).toContain('## 1. Executive Summary');
    expect(doc).toContain('## 2. Market Opportunity');
    expect(doc).toContain('## 3. Pricing & Revenue');
    expect(doc).toContain('embedded payments');
    expect(doc).toContain('small businesses');
    expect(doc).toContain('high payment processing fees');
  });

  it('computes TAM and uses projected year-1 revenue from stats', () => {
    const doc = buildPlanDocument(mockCtx);
    // 10,000 users * $12/mo * 12 months * 6.5 = 9,360,000
    expect(doc).toContain('$9,360,000');
    expect(doc).toContain('$1,440,000');
  });

  it('renders a 12-month revenue pipeline table', () => {
    const doc = buildPlanDocument(mockCtx);
    expect(doc).toContain('| Month 1 |');
    expect(doc).toContain('| Month 12 |');
    expect(doc).toContain('Run-rate Revenue');
  });

  it('includes the state filing portal for the chosen state', () => {
    const doc = buildPlanDocument(mockCtx);
    expect(doc).toContain('Delaware');
    expect(doc).toContain('state corporations portal');
    expect(doc).toContain('https://');
  });

  it('includes free EIN and startup banking guidance', () => {
    const doc = buildPlanDocument(mockCtx);
    expect(doc).toContain('apply-for-an-employer-identification-number-ein-online');
    expect(doc).toContain('Mercury');
    expect(doc).toContain('Brex');
  });

  it('includes the FinCEN BOI compliance deadline', () => {
    const doc = buildPlanDocument(mockCtx);
    expect(doc).toContain('FinCEN BOI Report');
    expect(doc).toContain('90 days');
    expect(doc).toContain('boiefiling.fincen.gov');
  });

  it('adds fintech-specific money-transmitter compliance for fintech types', () => {
    const doc = buildPlanDocument(mockCtx);
    expect(doc).toContain('money-transmitter');
  });

  it('adds general business-license compliance for non-fintech types', () => {
    const doc = buildPlanDocument({ ...mockCtx, businessType: 'retail' });
    expect(doc).toContain('general business license');
    expect(doc).not.toContain('money-transmitter');
  });

  it('notes Delaware franchise tax due dates', () => {
    const doc = buildPlanDocument(mockCtx);
    expect(doc).toContain('Due June 1st (LLCs) or March 1st (Corps) annually.');
  });

  it('renders an LLC operating agreement for LLC structure', () => {
    const doc = buildPlanDocument(mockCtx);
    expect(doc).toContain('LIMITED LIABILITY COMPANY OPERATING AGREEMENT');
    expect(doc).toContain('Pass-through taxation structure default.');
  });

  it('renders corporate bylaws for C-Corp structure', () => {
    const doc = buildPlanDocument({ ...mockCtx, structure: 'C-Corp', businessName: 'TechCo' });
    expect(doc).toContain('CORPORATE BYLAWS OF: TECHCO CORPORATION');
    expect(doc).toContain('Delaware General Corporation Law');
    expect(doc).toContain('10,000,000 shares of common stock');
  });

  it('renders a sole proprietorship charter for Sole Prop', () => {
    const doc = buildPlanDocument({ ...mockCtx, structure: 'Sole Prop', businessName: 'MyBiz' });
    expect(doc).toContain('SOLO PROPRIETORSHIP CHARTER: MYBIZ');
    expect(doc).toContain('Liability Warning'.toUpperCase());
  });

  it('lists the selected tooling and growth stack', () => {
    const doc = buildPlanDocument(mockCtx);
    expect(doc).toContain('Plaid, Stripe');
    expect(doc).toContain('Developer Relations & API documentation');
    expect(doc).toContain('AWS Activate');
  });

  it('handles an empty business name gracefully', () => {
    const doc = buildPlanDocument({ ...mockCtx, businessName: '' });
    expect(doc).toContain('YOUR BUSINESS — COMPLETE BUSINESS PLAN');
  });
});

describe('downloadCompletePlan', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('downloads the plan document and all starter kit files', () => {
    vi.useFakeTimers();
    let blobCount = 0;
    vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
      blobCount++;
      return `blob:mock-${blobCount}`;
    });
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const clickMock = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({ click: clickMock } as unknown as HTMLAnchorElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as Node));
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({} as Node));

    downloadCompletePlan(mockCtx);
    vi.runAllTimers();

    // 1 plan document + all starter kit files
    expect(blobCount).toBe(1 + STARTER_FILES.length);
    expect(clickMock).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('builds a markdown blob for the plan document', () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:plan');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const anchorMock = { click: vi.fn(), download: '' } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValue(anchorMock);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => anchorMock);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => anchorMock);

    downloadCompletePlan(mockCtx);

    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/markdown');
    expect(anchorMock.download).toBe('testco-complete-plan.md');
  });
});
