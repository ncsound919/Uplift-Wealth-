// Vercel serverless entry: the exported Express app handles /api/* routes.
// The built client (dist/) is served statically by Vercel; everything else is
// rewritten to index.html (see vercel.json) for SPA routing.
//
// IMPORTANT: this imports the COMPILED esbuild bundle (dist/server.cjs), NOT the
// TypeScript source. `import ... from '../server.ts'` fails on Vercel's Node ESM
// runtime with ERR_MODULE_NOT_FOUND (/var/task/server.ts) — `.ts` isn't
// resolvable at runtime. The build step (`esbuild server.ts → dist/server.cjs`)
// produces the self-contained bundle this entry re-exports.
//
// The esbuild bundle emits `module.exports = { default: <express app> }`. Node's
// ESM/CJS interop surfaces that as a nested `default`, so unwrap it before
// exporting so Vercel's handler receives the actual Express app.
import serverModule from '../dist/server.cjs';

const app = (serverModule as unknown as { default?: unknown }).default ?? serverModule;

export default app;
