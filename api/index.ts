// Vercel serverless entry: the exported Express app handles /api/* routes.
// The built client (dist/) is served statically by Vercel; everything else is
// rewritten to index.html (see vercel.json) for SPA routing.
import app from '../server.ts';

export default app;
