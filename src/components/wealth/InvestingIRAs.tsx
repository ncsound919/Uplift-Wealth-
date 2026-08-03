import { ChapterShell } from './ChapterShell';
import { wealthChapters } from '../../data/wealthChapters';
import { CompoundGrowthVisualizer } from './tools/CompoundGrowthVisualizer';
export function InvestingIRAs() {
  return <ChapterShell chapter={wealthChapters.find(c => c.id === 'investing')!} tool={<CompoundGrowthVisualizer />} />;
}
