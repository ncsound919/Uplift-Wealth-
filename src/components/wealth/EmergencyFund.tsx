import { ChapterShell } from './ChapterShell';
import { wealthChapters } from '../../data/wealthChapters';
import { EmergencyFundCalculator } from './tools/EmergencyFundCalculator';
export function EmergencyFund() {
  return <ChapterShell chapter={wealthChapters.find(c => c.id === 'emergency_fund')!} tool={<EmergencyFundCalculator />} />;
}
