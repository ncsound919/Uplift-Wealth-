import { ChapterShell } from './ChapterShell';
import { wealthChapters } from '../../data/wealthChapters';
import { GroupPoolCalculator } from './tools/GroupPoolCalculator';
export function GroupEconomics() {
  return <ChapterShell chapter={wealthChapters.find(c => c.id === 'group_economics')!} tool={<GroupPoolCalculator />} />;
}
