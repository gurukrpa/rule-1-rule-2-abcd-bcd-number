import { readFileSync } from 'fs';

const content = readFileSync('src/components/PlanetsAnalysisPage.jsx', 'utf8');
const lines = content.split('\n');

let braceCount = 0;
let inTryBlock = false;
let tryStart = -1;

console.log('📋 Brace Analysis for PlanetsAnalysisPage.jsx:');
console.log('='.repeat(50));

for (let i = 230; i < 330; i++) {
  const line = lines[i];
  if (!line) continue;
  
  const openBraces = (line.match(/\{/g) || []).length;
  const closeBraces = (line.match(/\}/g) || []).length;
  
  if (line.includes('try {')) {
    tryStart = i + 1;
    inTryBlock = true;
    console.log(`${(i+1).toString().padStart(3, ' ')}: TRY START >>> ${line.trim()}`);
  } else if (line.includes('} catch')) {
    console.log(`${(i+1).toString().padStart(3, ' ')}: CATCH      >>> ${line.trim()}`);
    inTryBlock = false;
  } else if (openBraces > 0 || closeBraces > 0) {
    const net = openBraces - closeBraces;
    braceCount += net;
    const status = inTryBlock ? '[TRY]' : '[---]';
    console.log(`${(i+1).toString().padStart(3, ' ')}: ${status} {${openBraces} }${closeBraces} (${net >= 0 ? '+' : ''}${net}) >>> ${line.trim().substring(0, 60)}`);
  }
}

console.log('='.repeat(50));
console.log(`Final brace balance: ${braceCount}`);
