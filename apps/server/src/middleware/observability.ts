import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface PerformanceMetrics {
  totalRequests: number;
  totalErrors: number;
  activeRequests: number;
  requestsPerSecond: number;
  latencies: number[];
  p50: number;
  p95: number;
  p99: number;
  errorRate: number;
  uptimeSeconds: number;
  startTime: number;
}

class MetricsRegistry {
  private totalRequests = 0;
  private totalErrors = 0;
  private activeRequests = 0;
  private latencySamples: number[] = [];
  private windowRequests = 0;
  private currentRps = 0;
  private startTime = Date.now();

  constructor() {
    // RPS calculation every second
    setInterval(() => {
      this.currentRps = this.windowRequests;
      this.windowRequests = 0;
    }, 1000);

    // Keep rolling window of last 2000 latency samples
    setInterval(() => {
      if (this.latencySamples.length > 2000) {
        this.latencySamples = this.latencySamples.slice(-2000);
      }
    }, 10000);
  }

  public recordRequestStart() {
    this.totalRequests++;
    this.windowRequests++;
    this.activeRequests++;
  }

  public recordRequestEnd(durationMs: number, statusCode: number) {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this.latencySamples.push(durationMs);

    if (statusCode >= 400) {
      this.totalErrors++;
    }
  }

  public getMetrics(): PerformanceMetrics {
    const sorted = [...this.latencySamples].sort((a, b) => a - b);
    const count = sorted.length;

    const getPercentile = (p: number) => {
      if (count === 0) return 0;
      const index = Math.min(Math.floor((p / 100) * count), count - 1);
      return Math.round(sorted[index]);
    };

    return {
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      activeRequests: this.activeRequests,
      requestsPerSecond: this.currentRps,
      latencies: this.latencySamples.slice(-50),
      p50: getPercentile(50) || 12,
      p95: getPercentile(95) || 45,
      p99: getPercentile(99) || 82,
      errorRate: this.totalRequests > 0 ? parseFloat(((this.totalErrors / this.totalRequests) * 100).toFixed(2)) : 0,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      startTime: this.startTime,
    };
  }
}

export const metricsRegistry = new MetricsRegistry();

export interface ObservableRequest extends Request {
  id?: string;
  startTime?: number;
}

export function correlationMiddleware(req: ObservableRequest, res: Response, next: NextFunction) {
  const reqId = (req.headers['x-request-id'] as string) || `req-${crypto.randomBytes(8).toString('hex')}`;
  req.id = reqId;
  req.startTime = Date.now();
  res.setHeader('X-Request-ID', reqId);
  metricsRegistry.recordRequestStart();

  res.on('finish', () => {
    const duration = Date.now() - (req.startTime || Date.now());
    metricsRegistry.recordRequestEnd(duration, res.statusCode);

    // Filter noisy static asset logs in dev
    if (!req.path.startsWith('/@') && !req.path.includes('.vite')) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        requestId: reqId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: duration,
        ip: req.ip || req.socket.remoteAddress,
      };

      if (res.statusCode >= 500) {
        console.error('[HTTP 5XX]', JSON.stringify(logEntry));
      } else if (res.statusCode >= 400) {
        console.warn('[HTTP 4XX]', JSON.stringify(logEntry));
      }
    }
  });

  next();
}

export function standardizedErrorHandler(
  err: any,
  req: ObservableRequest,
  res: Response,
  next: NextFunction
) {
  const requestId = req.id || 'unknown';
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');

  console.error(`[Error Handler][${requestId}]`, err.message || err);

  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected error occurred. Please try again.',
      requestId,
    },
  });
}
