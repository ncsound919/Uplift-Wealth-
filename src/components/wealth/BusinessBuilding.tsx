import { ChapterShell } from './ChapterShell';
import { wealthChapters } from '../../data/wealthChapters';
import { BusinessViabilityCalculator } from './tools/BusinessViabilityCalculator';
export function BusinessBuilding() {
  return <ChapterShell chapter={wealthChapters.find(c => c.id === 'business')!} tool={<BusinessViabilityCalculator />} />;
}
