import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(path.resolve('package.json'));
const seen = new Set();
const blocks = [];
function collect(name) {
  let dirPath = path.dirname(require.resolve(name));
  while (!fs.existsSync(path.join(dirPath, 'package.json')) || JSON.parse(fs.readFileSync(path.join(dirPath, 'package.json'), 'utf8')).name !== name) {
    const parent = path.dirname(dirPath); if (parent === dirPath) throw new Error(`Cannot locate package ${name}`); dirPath = parent;
  }
  const p = path.join(dirPath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
  const id = `${pkg.name}@${pkg.version}`;
  if (seen.has(id)) return;
  seen.add(id);
  const dir = path.dirname(p);
  const files = fs.readdirSync(dir).filter(f => /^(license|notice|copying)(\.|$)/i.test(f) && fs.statSync(path.join(dir, f)).isFile());
  if (!files.some(f => /^license/i.test(f))) throw new Error(`License missing for ${id}`);
  blocks.push(`${id} (${pkg.license})\n${files.map(f => `${f}\n${fs.readFileSync(path.join(dir, f), 'utf8')}`).join('\n')}`);
  for (const dep of Object.keys(pkg.dependencies ?? {})) collect(dep);
}
collect('echarts');
fs.mkdirSync('build', { recursive: true });
fs.writeFileSync('build/THIRD_PARTY_NOTICES.txt', blocks.join('\n\n================================\n\n'));
console.log(`Collected licenses and notices for: ${[...seen].join(', ')}`);
