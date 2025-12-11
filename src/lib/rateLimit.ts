const store: Record<string, { count: number; resetAt: number }> = {};

export function rateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const entry = store[key] || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count += 1;
  store[key] = entry;
  return { ok: entry.count <= limit, remaining: Math.max(0, limit - entry.count), resetAt: entry.resetAt };
}
