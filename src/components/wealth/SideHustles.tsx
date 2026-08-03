import { ChapterShell } from './ChapterShell';
import { wealthChapters } from '../../data/wealthChapters';
import { SideHustleCalculator } from './tools/SideHustleCalculator';
export function SideHustles() {
  return <ChapterShell chapter={wealthChapters.find(c => c.id === 'side_hustles')!} tool={<SideHustleCalculator />} />;
}
