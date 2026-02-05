// Client-side rate limiting utility
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export const checkRateLimit = (
  key: string,
  config: RateLimitConfig = { maxRequests: 5, windowMs: 60000 }
): { allowed: boolean; remainingTime: number } => {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // Clean up expired entries
  if (record && now > record.resetTime) {
    rateLimitStore.delete(key);
  }

  const current = rateLimitStore.get(key);

  if (!current) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remainingTime: 0 };
  }

  if (current.count >= config.maxRequests) {
    return { 
      allowed: false, 
      remainingTime: Math.ceil((current.resetTime - now) / 1000) 
    };
  }

  current.count++;
  return { allowed: true, remainingTime: 0 };
};

export const RATE_LIMIT_CONFIGS = {
  reportSubmission: { maxRequests: 5, windowMs: 60000 }, // 5 reports per minute
  search: { maxRequests: 10, windowMs: 30000 }, // 10 searches per 30 seconds
} as const;
