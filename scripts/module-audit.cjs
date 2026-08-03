const fs = require('fs');
let content = fs.readFileSync('src/data/courseData.ts', 'utf8');
content = content.replace(/\r\n/g, '\n');

const parts = content.split(/\n\s+id: ['"]module-/);
parts.shift();

const rows = [];
for (const part of parts) {
  const idMatch = part.match(/^(\d+)['"],\n\s+level: ['"]([^'"]+)['"],\n\s+title: ['"]([^'"]+)['"]/);
  if (!idMatch) { console.log('NO MATCH for part starting:', part.slice(0, 40).replace(/\n/g, '\\n')); continue; }
  const id = +idMatch[1];
  const level = idMatch[2];
  const title = idMatch[3];
  const lessons = (part.match(/id: ['"]m\d+-\w+['"]/g) || []).length;
  const text = (part.match(/type: ['"]text['"]/g) || []).length;
  const quiz = (part.match(/type: ['"]quiz['"]/g) || []).length;
  const game = (part.match(/type: ['"]game['"]/g) || []).length;
  const video = (part.match(/type: ['"]video['"]/g) || []).length;
  const contentChars = (part.match(/content: `[^`]*`(?:[^`]*`[^`]*`)*/g) || []).reduce((a, c) => a + c.length, 0);
  rows.push({ id, level, title, lessons, text, quiz, game, video, contentChars });
}
rows.sort((a, b) => a.id - b.id);

console.log('ID  | Level       | Lsn | T/Q/G/V      | Content chars | Title');
rows.forEach(r => {
  console.log(
    String(r.id).padStart(2).padEnd(4) + '| ' +
    r.level.padEnd(11) + '| ' +
    String(r.lessons).padStart(2).padEnd(4) + '| ' +
    `${r.text}/${r.quiz}/${r.game}/${r.video}`.padEnd(13) + '| ' +
    String(r.contentChars).padStart(6).padEnd(14) + '| ' +
    r.title
  );
});
console.log('\nTotals: modules=' + rows.length + ' lessons=' + rows.reduce((a, b) => a + b.lessons, 0));
