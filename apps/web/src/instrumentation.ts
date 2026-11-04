/**
 * Next.js instrumentation: register() runs once when the server starts (not at build time).
 * It starts the background lead-queue worker, in the Node runtime only (fs, timers).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startOutboxWorker } = await import('@/lib/leads/outbox-worker');
    startOutboxWorker();
  }
}
