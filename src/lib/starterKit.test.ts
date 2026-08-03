import { describe, it, expect, beforeEach, vi } from 'vitest';
import { STARTER_FILES, buildStarterFile, downloadStarterFile, downloadAllStarterFiles } from './starterKit';
import type { BusinessContext } from './starterKit';

const mockCtx: BusinessContext = {
  businessName: 'TestCo',
  founderName: 'Jane Doe',
  founderState: 'California',
  filingState: 'Delaware',
  structure: 'LLC',
  finalLane: 'embedded payments',
  selectedCohort: 'small businesses',
  finalProblem: 'high payment processing fees',
  selectedApis: ['Plaid', 'Stripe'],
  monetization: 'transaction fees',
  equitySplit: '4-year vesting',
  fundingStrategy: 'SAFE notes',
  hqType: 'virtual mailbox',
};

describe('starterKit', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('exports 9 starter files', () => {
    expect(STARTER_FILES).toHaveLength(9);
  });

  it('has files in all 5 categories', () => {
    const categories = new Set(STARTER_FILES.map(f => f.category));
    expect(categories.size).toBe(5);
    expect(categories).toContain('legal');
    expect(categories).toContain('pitch');
    expect(categories).toContain('finance');
    expect(categories).toContain('compliance');
    expect(categories).toContain('product');
  });

  it('builds pitch deck with business name', () => {
    const file = STARTER_FILES.find(f => f.id === 'pitch-deck')!;
    const content = buildStarterFile(file, mockCtx);
    expect(content).toContain('TESTCO');
    expect(content).toContain('Jane Doe');
    expect(content).toContain('embedded payments');
    expect(content).toContain('small businesses');
  });

  it('builds cap table with founder name', () => {
    const file = STARTER_FILES.find(f => f.id === 'cap-table')!;
    const content = buildStarterFile(file, mockCtx);
    expect(content).toContain('TESTCO');
    expect(content).toContain('Jane Doe');
    expect(content).toContain('LLC');
  });

  it('builds financial projection as CSV', () => {
    const file = STARTER_FILES.find(f => f.id === 'financial-projection')!;
    const content = buildStarterFile(file, mockCtx);
    expect(content).toContain('Month,Revenue,Costs');
    expect(content).toContain('1,0,8000');
    expect(content).toContain('36,598000,200000');
  });

  it('builds BOI guide with entity info', () => {
    const file = STARTER_FILES.find(f => f.id === 'boi-guide')!;
    const content = buildStarterFile(file, mockCtx);
    expect(content).toContain('TESTCO LLC');
    expect(content).toContain('Delaware');
    expect(content).toContain('Jane Doe');
  });

  it('builds EIN guide with structure', () => {
    const file = STARTER_FILES.find(f => f.id === 'ein-guide')!;
    const content = buildStarterFile(file, mockCtx);
    expect(content).toContain('LLC');
    expect(content).toContain('TESTCO');
  });

  it('builds compliance checklist', () => {
    const file = STARTER_FILES.find(f => f.id === 'compliance-checklist')!;
    const content = buildStarterFile(file, mockCtx);
    expect(content).toContain('File Articles');
    expect(content).toContain('Apply for EIN');
    expect(content).toContain('FinCEN');
  });

  it('handles empty business name gracefully', () => {
    const emptyCtx = { ...mockCtx, businessName: '' };
    const file = STARTER_FILES.find(f => f.id === 'pitch-deck')!;
    const content = buildStarterFile(file, emptyCtx);
    expect(content).toContain('YOUR FINTECH');
  });

  it('handles C-Corp structure', () => {
    const corpCtx = { ...mockCtx, structure: 'C-Corp' as const, businessName: 'TechCo' };
    const file = STARTER_FILES.find(f => f.id === 'cap-table')!;
    const content = buildStarterFile(file, corpCtx);
    expect(content).toContain('TECHCO');
    expect(content).toContain('common at $0.0001 par value');
  });

  it('downloadStarterFile creates a blob and triggers download', () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const clickMock = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({ click: clickMock } as unknown as HTMLAnchorElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as Node));
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({} as Node));

    const file = STARTER_FILES.find(f => f.id === 'pitch-deck')!;
    downloadStarterFile(file, mockCtx);

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
  });

  it('uses correct file extension', () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const anchorMock = { click: vi.fn(), download: '' } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValue(anchorMock);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => anchorMock);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => anchorMock);

    const mdFile = STARTER_FILES.find(f => f.format === 'md')!;
    downloadStarterFile(mdFile, mockCtx);

    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/markdown');
  });

  it('downloadAllStarterFiles creates blobs for all files', () => {
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

    downloadAllStarterFiles(mockCtx);
    vi.runAllTimers();
    expect(blobCount).toBe(STARTER_FILES.length);
    vi.useRealTimers();
  });

  it('builds EIN guide with C-Corp structure', () => {
    const corpCtx = { ...mockCtx, structure: 'C-Corp' as const, businessName: 'AcmeInc' };
    const file = STARTER_FILES.find(f => f.id === 'ein-guide')!;
    const content = buildStarterFile(file, corpCtx);
    expect(content).toContain('ACMEINC');
    expect(content).toContain('INC');
  });

  it('builds BOI guide with C-Corp structure', () => {
    const corpCtx = { ...mockCtx, structure: 'C-Corp' as const, businessName: 'AcmeInc' };
    const file = STARTER_FILES.find(f => f.id === 'boi-guide')!;
    const content = buildStarterFile(file, corpCtx);
    expect(content).toContain('ACMEINC');
    expect(content).toContain('INC');
  });

  it('handles Sole Prop structure', () => {
    const soleCtx = { ...mockCtx, structure: 'Sole Prop' as const, businessName: 'MyBiz' };
    const capFile = STARTER_FILES.find(f => f.id === 'cap-table')!;
    const capContent = buildStarterFile(capFile, soleCtx);
    expect(capContent).toContain('MYBIZ');
    expect(capContent).toContain('sole proprietorship');

    const einFile = STARTER_FILES.find(f => f.id === 'ein-guide')!;
    const einContent = buildStarterFile(einFile, soleCtx);
    expect(einContent).not.toContain('LLC');
    expect(einContent).not.toContain('INC');
  });

  it('handles empty selectedApis gracefully', () => {
    const emptyApisCtx = { ...mockCtx, selectedApis: [] };
    const file = STARTER_FILES.find(f => f.id === 'pitch-deck')!;
    const content = buildStarterFile(file, emptyApisCtx);
    expect(content).toContain('core banking APIs');
  });

  it('handles unknown format in downloadStarterFile', () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const anchorMock = { click: vi.fn(), download: '' } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValue(anchorMock);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => anchorMock);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => anchorMock);

    const unknownFile = STARTER_FILES.find(f => f.id === 'pitch-deck')!;
    downloadStarterFile({ ...unknownFile, format: 'txt' as any }, mockCtx);

    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/plain');
  });

  it('builds user persona worksheet', () => {
    const file = STARTER_FILES.find(f => f.id === 'user-persona')!;
    const content = buildStarterFile(file, mockCtx);
    expect(content).toContain('small businesses');
  });

  it('builds tech stack', () => {
    const file = STARTER_FILES.find(f => f.id === 'tech-stack')!;
    const content = buildStarterFile(file, mockCtx);
    expect(content).toContain('React 19');
  });

  it('builds investor email', () => {
    const file = STARTER_FILES.find(f => f.id === 'investor-email')!;
    const content = buildStarterFile(file, mockCtx);
    expect(content).toContain('Jane Doe');
    expect(content).toContain('embedded payments');
  });

  it('builds complete set of starter files', () => {
    STARTER_FILES.forEach(file => {
      const content = buildStarterFile(file, mockCtx);
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(0);
    });
  });

  describe('buildTemplate direct field expressions', () => {
    it('resolves expressions not present in the shipped templates', () => {
      const customFile = {
        id: 'custom',
        title: 'Custom',
        description: '',
        category: 'legal' as const,
        format: 'md' as const,
        content: [
          '{{ctx.businessName.toUpperCase()}}',
          '{{ctx.businessName || "Your Fintech"}}',
          '{{ctx.founderState}}',
          '{{ctx.equitySplit}}',
          '{{ctx.fundingStrategy}}',
        ].join('\n'),
      };
      const out = buildStarterFile(customFile, mockCtx);
      expect(out).toContain('TESTCO');
      expect(out).toContain('TestCo');
      expect(out).toContain('California');
      expect(out).toContain('4-year vesting');
      expect(out).toContain('SAFE notes');
    });

    it('returns empty string when a template expression throws', () => {
      const customFile = {
        id: 'custom',
        title: 'Custom',
        description: '',
        category: 'legal' as const,
        format: 'md' as const,
        content: '{{ctx.businessName.toUpperCase()}}',
      };
      const out = buildStarterFile(customFile, null as unknown as BusinessContext);
      expect(out).toBe('');
    });
  });
});
