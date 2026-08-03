import { ChapterShell } from './ChapterShell';
import { wealthChapters } from '../../data/wealthChapters';
import { RealEstateAnalyzer } from './tools/RealEstateAnalyzer';
export function RealEstate() {
  return <ChapterShell chapter={wealthChapters.find(c => c.id === 'real_estate')!} tool={<RealEstateAnalyzer />} />;
}
