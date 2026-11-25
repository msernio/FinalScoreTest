#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════════
// BUILD INDEX — finds every piece in groups/ (any folder holding a score.json;
// folders starting with "_" or "." are skipped), checks it, and writes
// groups/index.json, which the conductor and the editor read for their menus.
//
//   node scripts/build-index.mjs           write groups/index.json
//   node scripts/build-index.mjs --check   only check (for pull requests);
//                                          exits with an error if a piece has problems
//
// Runs on GitHub Actions (.github/workflows/pages.yml) at every push to main
// and every pull request; run it by hand to test locally. No dependencies.
// ═══════════════════════════════════════════════════════════════════════════════
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const GROUPS = path.join(ROOT, 'groups');
const CHECK = process.argv.includes('--check');
const MB = 1024 * 1024, MAX_FILE = 10 * MB, MAX_FOLDER = 50 * MB;
const inGitHub = !!process.env.GITHUB_ACTIONS;

const problems = []; // { file, msg, level }
const report = (file, msg, level = 'error') => problems.push({ file: path.relative(ROOT, file), msg, level });

// Folders holding a score.json
function findPieces(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name.startsWith('_') || e.name.startsWith('.')) continue;
    const d = path.join(dir, e.name);
    if (fs.existsSync(path.join(d, 'score.json'))) out.push(d);
    else out.push(...findPieces(d));
  }
  return out;
}

const folderSize = d => fs.readdirSync(d, { withFileTypes: true }).reduce((n, e) => {
  const p = path.join(d, e.name);
  return n + (e.isDirectory() ? folderSize(p) : fs.statSync(p).size);
}, 0);

// Same rule as soundPath in app/score-engine.js
function soundPath(id, score) {
  id = String(id ?? '').trim();
  const listed = score.sounds && typeof score.sounds === 'object' && score.sounds[id];
  if (listed) return String(listed);
  return /\.[a-z0-9]+$/i.test(id) ? id : id + '.wav';
}

const pieces = [];
for (const dir of findPieces(GROUPS).sort()) {
  const rel = path.relative(GROUPS, dir).split(path.sep).join('/');
  const file = path.join(dir, 'score.json');
  const example = rel.startsWith('00-examples/');
  let score;
  try { score = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { report(file, `score.json is not valid JSON: ${e.message}`); continue; }
  if (!score || typeof score !== 'object' || Array.isArray(score)) { report(file, 'score.json should hold one score: { "title": …, "events": [ … ] }'); continue; }

  if (!/^[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*$/.test(rel))
    report(file, `folder name "${rel}": use lowercase letters, digits and hyphens only`);
  if (!score.title) report(file, 'missing "title"');
  if (!Array.isArray(score.events) || !score.events.length) report(file, 'missing "events"');
  if (!example) for (const k of ['group', 'theme', 'members']) if (!score[k] || (Array.isArray(score[k]) && !score[k].length)) report(file, `missing "${k}"`);

  // Every sound a play event uses must exist (paths are case-sensitive on GitHub)
  const used = new Set((score.events || []).filter(e => e && e.play !== undefined).map(e => soundPath(e.play, score)));
  for (const p of used) {
    const f = path.join(dir, p);
    if (/^(\.\.\/|\/|[a-z]+:)/i.test(p)) report(file, `sound "${p}" is outside the folder: put it in audio/`);
    else if (!fs.existsSync(f)) report(file, `sound file not found: ${p} (names are case-sensitive)`);
    else if (fs.statSync(f).size > MAX_FILE) report(f, `${p} is ${(fs.statSync(f).size / MB).toFixed(1)} MB; keep each file under 10 MB`);
  }
  const size = folderSize(dir);
  if (size > MAX_FOLDER) report(file, `the folder is ${(size / MB).toFixed(1)} MB; keep it under 50 MB`);

  const members = Array.isArray(score.members) ? score.members : score.members ? [String(score.members)] : [];
  pieces.push({ path: rel, title: score.title || rel, group: score.group || '', theme: score.theme || '', members, example });
}

// Examples first (00-examples sorts first), then the final projects by folder name
pieces.sort((a, b) => (b.example - a.example) || a.path.localeCompare(b.path));

for (const p of problems) {
  if (inGitHub) console.log(`::${p.level === 'error' ? 'error' : 'warning'} file=${p.file}::${p.msg}`);
  else console.log(`${p.level.toUpperCase()} ${p.file}: ${p.msg}`);
}
console.log(`${pieces.length} piece(s): ${pieces.map(p => p.path).join(', ')}`);

if (CHECK) process.exit(problems.some(p => p.level === 'error') ? 1 : 0);
fs.writeFileSync(path.join(GROUPS, 'index.json'), JSON.stringify({ pieces }, null, 2) + '\n');
console.log('wrote groups/index.json');
