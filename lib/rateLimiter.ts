type RateLimitKeyFn = (ip: string) => string;

class InMemoryRateLimiter {
  private windowMs: number;
  private max: number;
  private hits: Map<string, { count: number; resetAt: number }>;
  private keyFn: RateLimitKeyFn;

  constructor(options: {
    windowMs: number;
    max: number;
    keyFn?: RateLimitKeyFn;
  }) {
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.keyFn = options.keyFn || ((ip) => ip);
    this.hits = new Map();
  }

  async check(
    ip: string
  ): Promise<{ allowed: boolean; remaining: number; resetMs: number }> {
    const key = this.keyFn(ip);
    const now = Date.now();
    const current = this.hits.get(key);
    if (!current || current.resetAt <= now) {
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.max - 1, resetMs: this.windowMs };
    }
    if (current.count >= this.max) {
      return { allowed: false, remaining: 0, resetMs: current.resetAt - now };
    }
    current.count += 1;
    this.hits.set(key, current);
    return {
      allowed: true,
      remaining: this.max - current.count,
      resetMs: current.resetAt - now,
    };
  }
}

export const subscribeLimiter = new InMemoryRateLimiter({
  windowMs: 60_000,
  max: 5,
});
export const sendLimiter = new InMemoryRateLimiter({
  windowMs: 60_000,
  max: 2,
});



