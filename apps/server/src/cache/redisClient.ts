import Redis from 'ioredis';
import { config } from '../config/env';

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  keysCount: number;
  isRedisConnected: boolean;
}

class CacheService {
  private redisClient: Redis | null = null;
  private pubClient: Redis | null = null;
  private subClient: Redis | null = null;
  private memoryStore: Map<string, { value: string; expiresAt: number }> = new Map();
  private subscribers: Map<string, Set<(message: string) => void>> = new Map();
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    keysCount: 0,
    isRedisConnected: false,
  };

  constructor() {
    this.init();
    // Memory cleanup interval
    setInterval(() => this.cleanupMemoryStore(), 60000);
  }

  private init() {
    if (config.redis.url || process.env.REDIS_HOST) {
      try {
        const redisOptions = {
          lazyConnect: true,
          retryStrategy: (times: number) => {
            if (times > 3) {
              console.warn('[JanSetu Redis] Exceeded connection retries. Operating in resilient in-memory cache mode.');
              return null;
            }
            return Math.min(times * 200, 2000);
          },
          maxRetriesPerRequest: 2,
        };

        const client = config.redis.url
          ? new Redis(config.redis.url, redisOptions)
          : new Redis({
              host: config.redis.host,
              port: config.redis.port,
              password: config.redis.password,
              db: config.redis.db,
              ...redisOptions,
            });

        client.on('connect', () => {
          this.metrics.isRedisConnected = true;
          console.log('[JanSetu Redis] Connected to Redis cluster/instance successfully');
        });

        client.on('error', (err) => {
          this.metrics.isRedisConnected = false;
          // Silent fallback to avoid crash
        });

        this.redisClient = client;

        // Try connect non-blocking
        client.connect().catch(() => {
          this.metrics.isRedisConnected = false;
        });
      } catch (err) {
        this.metrics.isRedisConnected = false;
      }
    }
  }

  private cleanupMemoryStore() {
    const now = Date.now();
    for (const [key, item] of this.memoryStore.entries()) {
      if (item.expiresAt > 0 && item.expiresAt < now) {
        this.memoryStore.delete(key);
      }
    }
    this.metrics.keysCount = this.memoryStore.size;
  }

  public async get<T = any>(key: string): Promise<T | null> {
    const fullKey = config.redis.keyPrefix + key;

    if (this.metrics.isRedisConnected && this.redisClient) {
      try {
        const raw = await this.redisClient.get(fullKey);
        if (raw) {
          this.metrics.hits++;
          return JSON.parse(raw) as T;
        }
      } catch (e) {
        // fallback
      }
    }

    // In-memory fallback
    const item = this.memoryStore.get(fullKey);
    if (item) {
      if (item.expiresAt === 0 || item.expiresAt > Date.now()) {
        this.metrics.hits++;
        try {
          return JSON.parse(item.value) as T;
        } catch {
          return null;
        }
      } else {
        this.memoryStore.delete(fullKey);
      }
    }

    this.metrics.misses++;
    return null;
  }

  public async set(key: string, value: any, ttlSeconds: number = config.redis.ttlDefault): Promise<void> {
    const fullKey = config.redis.keyPrefix + key;
    const serialized = JSON.stringify(value);
    this.metrics.sets++;

    if (this.metrics.isRedisConnected && this.redisClient) {
      try {
        if (ttlSeconds > 0) {
          await this.redisClient.set(fullKey, serialized, 'EX', ttlSeconds);
        } else {
          await this.redisClient.set(fullKey, serialized);
        }
        return;
      } catch (e) {
        // fallback
      }
    }

    // In-memory storage
    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : 0;
    this.memoryStore.set(fullKey, { value: serialized, expiresAt });
    this.metrics.keysCount = this.memoryStore.size;
  }

  public async del(key: string): Promise<void> {
    const fullKey = config.redis.keyPrefix + key;
    if (this.metrics.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(fullKey);
      } catch (e) {}
    }
    this.memoryStore.delete(fullKey);
    this.metrics.keysCount = this.memoryStore.size;
  }

  public async invalidatePattern(pattern: string): Promise<void> {
    const prefix = config.redis.keyPrefix;
    if (this.metrics.isRedisConnected && this.redisClient) {
      try {
        const keys = await this.redisClient.keys(`${prefix}${pattern}*`);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } catch (e) {}
    }

    const reg = new RegExp(`^${prefix}${pattern}`);
    for (const k of this.memoryStore.keys()) {
      if (reg.test(k)) {
        this.memoryStore.delete(k);
      }
    }
    this.metrics.keysCount = this.memoryStore.size;
  }

  // Pub/Sub for Server-Sent Events across instances
  public async publish(channel: string, message: any): Promise<void> {
    const payload = typeof message === 'string' ? message : JSON.stringify(message);

    if (this.metrics.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.publish(channel, payload);
      } catch (e) {}
    }

    // Notify local memory subscribers
    const subs = this.subscribers.get(channel);
    if (subs) {
      subs.forEach((cb) => {
        try {
          cb(payload);
        } catch (e) {}
      });
    }
  }

  public subscribe(channel: string, callback: (message: string) => void): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(callback);

    return () => {
      this.subscribers.get(channel)?.delete(callback);
    };
  }

  public getMetrics(): CacheMetrics {
    return {
      ...this.metrics,
      keysCount: this.metrics.isRedisConnected ? this.metrics.keysCount : this.memoryStore.size,
    };
  }
}

export const cache = new CacheService();
