import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('download utility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('downloads JSON content', () => {
    const clickMock = vi.fn();
    const anchorMock = {
      href: '',
      download: '',
      click: clickMock,
    } as unknown as HTMLAnchorElement;

    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(anchorMock);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => anchorMock);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => anchorMock);
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    return import('./download').then(({ downloadResults }) => {
      downloadResults({ score: 85, level: 5 }, { filename: 'test-result', format: 'json', timestamp: false });
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickMock).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
      const blobArg = createObjectURLSpy.mock.calls[0][0] as Blob;
      expect(blobArg.type).toBe('application/json');
    });
  });

  it('downloads CSV content', async () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockReturnValue({ click: vi.fn() } as unknown as HTMLAnchorElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as Node));
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({} as Node));

    const { downloadResults } = await import('./download');
    downloadResults(
      [{ name: 'Alice', score: 90 }, { name: 'Bob', score: 75 }],
      { filename: 'results', format: 'csv', timestamp: false }
    );
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/csv');
  });

  it('handles CSV with commas and quotes', async () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockReturnValue({ click: vi.fn() } as unknown as HTMLAnchorElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as Node));
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({} as Node));

    const { downloadResults } = await import('./download');
    downloadResults(
      [{ label: 'He said "hi", then left', value: 42 }],
      { filename: 'csv-test', format: 'csv', timestamp: false }
    );
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    const text = await blob.text();
    expect(text).toContain('"He said ""hi"", then left"');
  });

  it('downloadCertificate includes player data', async () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockReturnValue({ click: vi.fn() } as unknown as HTMLAnchorElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as Node));
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({} as Node));

    const { downloadCertificate } = await import('./download');
    downloadCertificate({
      userName: 'Alice',
      gameName: 'Stock Sim',
      score: 92,
      rank: 'Elite',
      metrics: { PnL: 12500, Trades: 42 },
    });
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    const text = await blob.text();
    expect(text).toContain('Alice');
    expect(text).toContain('Stock Sim');
    expect(text).toContain('92');
    expect(text).toContain('Elite');
  });

  it('handles empty data array', async () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockReturnValue({ click: vi.fn() } as unknown as HTMLAnchorElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as Node));
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({} as Node));

    const { downloadResults } = await import('./download');
    downloadResults([], { filename: 'empty', format: 'csv', timestamp: false });
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    const text = await blob.text();
    expect(text).toBe('');
  });

  it('renders null and undefined CSV values as empty strings', async () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockReturnValue({ click: vi.fn() } as unknown as HTMLAnchorElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as Node));
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({} as Node));

    const { downloadResults } = await import('./download');
    downloadResults([{ a: null, b: undefined, c: 1 }], { filename: 'nulls', format: 'csv', timestamp: false });
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    const text = await blob.text();
    expect(text).toContain('a,b,c');
    expect(text).toContain(',,1');
  });
});
