export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerStats {
  name: string;
  state: CircuitState;
  failureCount: number;
  successCount: number;
  totalCalls: number;
  lastFailureTime?: string;
  nextAttemptTime?: string;
}

export class CircuitBreaker {
  private name: string;
  private state: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private successCount: number = 0;
  private totalCalls: number = 0;
  private failureThreshold: number;
  private resetTimeoutMs: number;
  private nextAttempt: number = 0;
  private lastFailureTime?: string;

  constructor(name: string, failureThreshold = 5, resetTimeoutMs = 30000) {
    this.name = name;
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
  }

  public async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T> | T
  ): Promise<T> {
    this.totalCalls++;
    const now = Date.now();

    if (this.state === 'OPEN') {
      if (now > this.nextAttempt) {
        this.state = 'HALF_OPEN';
        console.log(`[CircuitBreaker:${this.name}] Transitioned to HALF_OPEN. Probing downstream health.`);
      } else {
        if (fallback) {
          return fallback();
        }
        throw new Error(
          `Circuit breaker for ${this.name} is OPEN. Fast failing to prevent cascading timeout.`
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (err: any) {
      this.onFailure(err);
      if (fallback) {
        return fallback();
      }
      throw err;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.successCount++;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log(`[CircuitBreaker:${this.name}] Recovery probe succeeded. Circuit CLOSED.`);
    }
  }

  private onFailure(err: any) {
    this.failureCount++;
    this.lastFailureTime = new Date().toISOString();
    console.warn(
      `[CircuitBreaker:${this.name}] Failure ${this.failureCount}/${this.failureThreshold}: ${err.message}`
    );

    if (this.failureCount >= this.failureThreshold || this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeoutMs;
      console.error(
        `[CircuitBreaker:${this.name}] Threshold exceeded. Circuit is now OPEN for ${this.resetTimeoutMs}ms.`
      );
    }
  }

  public getStats(): CircuitBreakerStats {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalCalls: this.totalCalls,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.state === 'OPEN' ? new Date(this.nextAttempt).toISOString() : undefined,
    };
  }

  public forceReset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
  }
}

// Singleton instances for core external integrations
export const geminiCircuitBreaker = new CircuitBreaker('Gemini-Multimodal-API', 4, 25000);
export const speechCircuitBreaker = new CircuitBreaker('Speech-Transcription-Service', 3, 20000);
export const geocodingCircuitBreaker = new CircuitBreaker('Geocoding-Maps-Service', 4, 30000);
