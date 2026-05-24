/**
 * Client-side Rate Limiting Service
 * Prevents abuse of API calls
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // in milliseconds
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }) {
    this.config = config;
  }

  /**
   * Check if a request is allowed
   * Returns true if allowed, false if rate limited
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get or create timestamp array for this key
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const timestamps = this.requests.get(key)!;

    // Remove old timestamps outside the window
    const validTimestamps = timestamps.filter((ts) => ts > windowStart);

    // Check if limit exceeded
    if (validTimestamps.length >= this.config.maxRequests) {
      return false;
    }

    // Add current timestamp and update
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);

    return true;
  }

  /**
   * Get remaining requests for a key
   */
  getRemainingRequests(key: string): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter((ts) => ts > windowStart);

    return Math.max(0, this.config.maxRequests - validTimestamps.length);
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.requests.clear();
  }
}

// Create rate limiters for different actions
export const createPostRateLimiter = () =>
  new RateLimiter({ maxRequests: 20, windowMs: 60000 }); // 20 posts per minute

export const createCommentRateLimiter = () =>
  new RateLimiter({ maxRequests: 30, windowMs: 60000 }); // 30 comments per minute

export const createLikeRateLimiter = () =>
  new RateLimiter({ maxRequests: 60, windowMs: 60000 }); // 60 likes per minute

export const createSearchRateLimiter = () =>
  new RateLimiter({ maxRequests: 30, windowMs: 60000 }); // 30 searches per minute

// Global instances
let postLimiter: RateLimiter | null = null;
let commentLimiter: RateLimiter | null = null;
let likeLimiter: RateLimiter | null = null;

export const getPostRateLimiter = () => {
  if (!postLimiter) postLimiter = createPostRateLimiter();
  return postLimiter;
};

export const getCommentRateLimiter = () => {
  if (!commentLimiter) commentLimiter = createCommentRateLimiter();
  return commentLimiter;
};

export const getLikeRateLimiter = () => {
  if (!likeLimiter) likeLimiter = createLikeRateLimiter();
  return likeLimiter;
};
