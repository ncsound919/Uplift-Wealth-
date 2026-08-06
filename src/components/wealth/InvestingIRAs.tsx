import { ChapterShell } from './ChapterShell';
import { wealthChapters } from '../../data/wealthChapters';

export function InvestingIRAs() {
  return <ChapterShell chapter={wealthChapters.find(c => c.id === 'investing')!} />;
}