import { Request, Response, NextFunction } from 'express';
import { cache } from '../cache/redisClient';
import { config } from '../config/env';

interface RateLimitConfig {
  max: number;
  windowSeconds: number;
  tierName: string;
}

export function createRateLimiter(options: RateLimitConfig) {
  const { max, windowSeconds, tierName } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Identify client by user ID if logged in, else IP address
    const authHeader = req.headers.authorization;
    const clientKey = authHeader ? `user:${authHeader.substring(0, 24)}` : `ip:${req.ip || '127.0.0.1'}`;
    const cacheKey = `ratelimit:${tierName}:${clientKey}`;

    try {
      const current = await cache.get<number>(cacheKey);

      if (current === null) {
        // First request in this window
        await cache.set(cacheKey, 1, windowSeconds);
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', max - 1);
        return next();
      }

      if (current >= max) {
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('Retry-After', windowSeconds);
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit exceeded for ${tierName}. Maximum ${max} requests per ${windowSeconds}s.`,
            retryAfterSeconds: windowSeconds,
          },
        });
      }

      // Increment
      await cache.set(cacheKey, current + 1, windowSeconds);
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - (current + 1)));
      return next();
    } catch (e) {
      // Fail open to avoid blocking users if rate limiter has transient fault
      return next();
    }
  };
}

// Preset rate limiters
export const anonymousRateLimiter = createRateLimiter({
  max: config.rateLimits.anonymousRpm,
  windowSeconds: 60,
  tierName: 'anonymous',
});

export const authenticatedRateLimiter = createRateLimiter({
  max: config.rateLimits.authenticatedRpm,
  windowSeconds: 60,
  tierName: 'authenticated',
});

export const citizenRequestRateLimiter = createRateLimiter({
  max: config.rateLimits.citizenRequestRpm,
  windowSeconds: 60,
  tierName: 'citizen-request',
});

export const aiEndpointRateLimiter = createRateLimiter({
  max: config.rateLimits.aiEndpointRpm,
  windowSeconds: 60,
  tierName: 'ai-endpoint',
});

export const adminRateLimiter = createRateLimiter({
  max: config.rateLimits.adminRpm,
  windowSeconds: 60,
  tierName: 'admin',
});
