type DownloadFormat = 'json' | 'csv' | 'txt';

interface DownloadOptions {
  filename: string;
  format?: DownloadFormat;
  timestamp?: boolean;
}

export function downloadResults(data: Record<string, unknown> | unknown[], options: DownloadOptions) {
  const { filename, format = 'json', timestamp = true } = options;
  const finalFilename = timestamp
    ? `${filename}-${new Date().toISOString().split('T')[0]}.${format}`
    : `${filename}.${format}`;

  let content: string;
  let mimeType: string;

  if (format === 'json') {
    content = JSON.stringify(data, null, 2);
    mimeType = 'application/json';
  } else if (format === 'csv') {
    content = convertToCSV(data);
    mimeType = 'text/csv';
  } else {
    content = convertToText(data);
    mimeType = 'text/plain';
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function convertToCSV(data: unknown): string {
  const array = Array.isArray(data) ? data : [data];
  if (array.length === 0) return '';
  const first = array[0] as Record<string, unknown>;
  const headers = Object.keys(first);
  const rows = array.map(item =>
    headers.map(h => {
      const val = (item as Record<string, unknown>)[h];
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

function convertToText(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function downloadCertificate(data: {
  userName: string;
  gameName: string;
  score: number;
  rank?: string;
  metrics?: Record<string, string | number>;
}) {
  const lines = [
    '========================================',
    `  ${data.gameName} - Final Results`,
    '========================================',
    '',
    `Player: ${data.userName}`,
    `Date: ${new Date().toLocaleString()}`,
    `Final Score: ${data.score}`,
  ];
  if (data.rank) lines.push(`Rank: ${data.rank}`);
  if (data.metrics) {
    lines.push('');
    lines.push('Performance Metrics:');
    for (const [k, v] of Object.entries(data.metrics)) {
      lines.push(`  ${k}: ${v}`);
    }
  }
  lines.push('');
  lines.push('========================================');

  downloadResults(
    { results: lines.join('\n'), user: data.userName, score: data.score, rank: data.rank, metrics: data.metrics },
    { filename: `${data.gameName}-certificate`, format: 'txt' }
  );
}
