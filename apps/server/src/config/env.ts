import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '3000', 10),
  appUrl: process.env.APP_URL || 'http://localhost:3000',

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || '',
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: 'jansetu:',
    ttlDefault: parseInt(process.env.CACHE_DEFAULT_TTL || '300', 10), // 5 min
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://jansetu:jansetu_secret@localhost:5432/jansetu_db',
    poolMin: parseInt(process.env.DB_POOL_MIN || '5', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '50', 10),
    idleTimeoutMs: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMs: parseInt(process.env.DB_CONN_TIMEOUT || '5000', 10),
  },

  // JWT Security
  jwt: {
    secret: process.env.JWT_SECRET || 'jansetu-gov-secure-jwt-production-secret-key-2026',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'jansetu-refresh-secret-token-key-2026',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // AI & Circuit Breakers
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    demoMode: process.env.AI_DEMO_MODE === 'true' || !process.env.GEMINI_API_KEY,
    workerConcurrency: parseInt(process.env.AI_WORKER_CONCURRENCY || '10', 10),
    timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '12000', 10),
    circuitBreaker: {
      failureThreshold: parseInt(process.env.CB_FAILURE_THRESHOLD || '5', 10),
      resetTimeoutMs: parseInt(process.env.CB_RESET_TIMEOUT_MS || '30000', 10),
    },
  },

  // Rate Limiting
  rateLimits: {
    anonymousRpm: parseInt(process.env.RATE_LIMIT_ANON || '100', 10),
    authenticatedRpm: parseInt(process.env.RATE_LIMIT_AUTH || '600', 10),
    citizenRequestRpm: parseInt(process.env.RATE_LIMIT_REQUESTS || '30', 10),
    aiEndpointRpm: parseInt(process.env.RATE_LIMIT_AI || '20', 10),
    adminRpm: parseInt(process.env.RATE_LIMIT_ADMIN || '300', 10),
  },

  // Object Storage (Citizen Media: Photos, Audio Recordings, Documents)
  storage: {
    bucket: process.env.STORAGE_BUCKET || 'jansetu-media-assets',
    accessKey: process.env.STORAGE_ACCESS_KEY || '',
    secretKey: process.env.STORAGE_SECRET_KEY || '',
    endpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9000',
    region: process.env.STORAGE_REGION || 'ap-south-1',
    useSSL: process.env.STORAGE_USE_SSL === 'true',
  },

  // Feature Flags
  features: {
    enableRealtime: process.env.ENABLE_REALTIME !== 'false',
    enableAiCopilot: process.env.ENABLE_AI_COPILOT !== 'false',
    enableAdvancedAnalytics: process.env.ENABLE_ADVANCED_ANALYTICS !== 'false',
    enableAsyncAi: process.env.ENABLE_ASYNC_AI !== 'false',
  },
};

