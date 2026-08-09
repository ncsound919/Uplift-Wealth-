// Vercel serverless entry: the exported Express app handles /api/* routes.
// The built client (dist/) is served statically by Vercel; everything else is
// rewritten to index.html (see vercel.json) for SPA routing.
//
// Module-load guard: if importing the server throws (missing deps, env guard,
// fs error), report it as a clear JSON error instead of a silent 500, and log
// to stderr so the Vercel runtime surfaces it.
import app from '../server.ts';

export default app;
