import { ChapterShell } from './ChapterShell';
import { wealthChapters } from '../../data/wealthChapters';
import { CreditActionPlan } from './tools/CreditActionPlan';
export function CreditMastery() {
  return <ChapterShell chapter={wealthChapters.find(c => c.id === 'credit')!} tool={<CreditActionPlan />} />;
}
