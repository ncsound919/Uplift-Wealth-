#!/usr/bin/env node
/**
 * Overlay Wealth — CI gate.
 *
 * Single source of truth for the checks that must pass before this site
 * ships. It replaces the GitHub Actions `ci.yml` workflow, which could not
 * run because the repository owner's GitHub account is locked for Actions
 * billing; the same steps now run wherever `npm run ci` runs, including as
 * Vercel's build command (so a failed check fails the deployment and the
 * previous production deployment keeps serving traffic).
 *
 * Steps mirror the old workflow exactly (including the 80% coverage floor):
 *   typecheck  -> tsc --noEmit
 *   tests      -> vitest run --coverage
 *   build      -> vite build && esbuild server.ts ...
 *
 * Usage:
 *   npm run ci            # full gate
 *   SKIP_CI=1 npm run ci  # emergency escape hatch: build only
 */
import { spawnSync } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const skip = /^(1|true|yes|on)$/i.test(String(process.env.SKIP_CI ?? '').trim());

const STEPS = [
  { name: 'typecheck (tsc --noEmit)', args: ['run', 'lint'] },
  { name: 'tests + coverage (vitest --coverage)', args: ['run', 'test:coverage'] },
  { name: 'production build', args: ['run', 'build'] },
];

if (skip) console.warn('[ci] SKIP_CI is set — skipping checks, running build only');

const results = [];
let failed = null;

for (const step of STEPS) {
  if (skip && step.name !== 'production build') continue;
  const started = Date.now();
  const run = spawnSync(npm, step.args, {
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32',
  });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  results.push(`${run.status === 0 ? 'PASS' : 'FAIL'}  ${step.name}  (${seconds}s)`);
  if (run.status !== 0 && !failed) failed = step.name;
}

console.log(`\n[ci] summary\n  ${results.join('\n  ')}`);

if (failed) {
  console.error(`\n[ci] FAILED: ${failed}`);
  process.exit(1);
}

console.log('\n[ci] all checks passed');
