import { cache } from '../cache/redisClient';

export type JobType =
  | 'ai-analysis'
  | 'transcription'
  | 'hotspot-analysis'
  | 'notifications'
  | 'simulation'
  | 'dataset-processing';

export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface QueueJob<T = any> {
  id: string;
  type: JobType;
  data: T;
  status: JobStatus;
  progress: number;
  attempts: number;
  maxAttempts: number;
  result?: any;
  error?: string;
  createdAt: string;
  processedAt?: string;
  completedAt?: string;
}

export interface QueueStats {
  queueName: JobType;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  activeWorkers: number;
}

type JobHandler<T = any, R = any> = (job: QueueJob<T>) => Promise<R>;

class JobQueueManager {
  private jobs: Map<string, QueueJob> = new Map();
  private handlers: Map<JobType, JobHandler> = new Map();
  private processingCount: Map<JobType, number> = new Map();
  private concurrencyLimits: Map<JobType, number> = new Map([
    ['ai-analysis', 10],
    ['transcription', 5],
    ['hotspot-analysis', 2],
    ['notifications', 20],
    ['simulation', 5],
    ['dataset-processing', 2],
  ]);

  constructor() {
    // Run worker tick loop every 100ms
    setInterval(() => this.processNextJobs(), 100);
  }

  public registerWorker<T, R>(type: JobType, handler: JobHandler<T, R>, concurrency?: number) {
    this.handlers.set(type, handler);
    if (concurrency) {
      this.concurrencyLimits.set(type, concurrency);
    }
    console.log(`[JobQueue] Registered worker for '${type}' (concurrency: ${this.concurrencyLimits.get(type)})`);
  }

  public async addJob<T>(type: JobType, data: T, maxAttempts = 3): Promise<QueueJob<T>> {
    const id = `job-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const job: QueueJob<T> = {
      id,
      type,
      data,
      status: 'PENDING',
      progress: 0,
      attempts: 0,
      maxAttempts,
      createdAt: new Date().toISOString(),
    };

    this.jobs.set(id, job);

    // Broadcast queue event to Redis pubsub / SSE subscribers
    await cache.publish('queue:events', {
      event: 'JOB_ENQUEUED',
      jobId: id,
      type,
    });

    return job;
  }

  private async processNextJobs() {
    for (const [type, handler] of this.handlers.entries()) {
      const active = this.processingCount.get(type) || 0;
      const limit = this.concurrencyLimits.get(type) || 5;

      if (active >= limit) continue;

      // Find pending job
      const pendingJob = Array.from(this.jobs.values()).find(
        (j) => j.type === type && j.status === 'PENDING'
      );

      if (pendingJob) {
        this.runJob(pendingJob, handler);
      }
    }
  }

  private async runJob(job: QueueJob, handler: JobHandler) {
    const type = job.type;
    this.processingCount.set(type, (this.processingCount.get(type) || 0) + 1);

    job.status = 'PROCESSING';
    job.attempts++;
    job.processedAt = new Date().toISOString();

    try {
      const result = await handler(job);
      job.status = 'COMPLETED';
      job.progress = 100;
      job.result = result;
      job.completedAt = new Date().toISOString();

      await cache.publish('queue:events', {
        event: 'JOB_COMPLETED',
        jobId: job.id,
        type: job.type,
      });
    } catch (err: any) {
      console.error(`[JobQueue] Error executing job ${job.id}:`, err.message);
      if (job.attempts < job.maxAttempts) {
        // Exponential backoff retry
        job.status = 'PENDING';
        job.error = `Attempt ${job.attempts} failed: ${err.message}. Retrying...`;
      } else {
        job.status = 'FAILED';
        job.error = err.message;
        job.completedAt = new Date().toISOString();
        await cache.publish('queue:events', {
          event: 'JOB_FAILED',
          jobId: job.id,
          type: job.type,
          error: err.message,
        });
      }
    } finally {
      this.processingCount.set(type, Math.max(0, (this.processingCount.get(type) || 1) - 1));
    }
  }

  public getJob(id: string): QueueJob | undefined {
    return this.jobs.get(id);
  }

  public getAllJobs(type?: JobType): QueueJob[] {
    const all = Array.from(this.jobs.values()).reverse();
    return type ? all.filter((j) => j.type === type) : all;
  }

  public retryJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job || job.status !== 'FAILED') return false;
    job.status = 'PENDING';
    job.attempts = 0;
    job.error = undefined;
    return true;
  }

  public getStats(): QueueStats[] {
    const types: JobType[] = [
      'ai-analysis',
      'transcription',
      'hotspot-analysis',
      'notifications',
      'simulation',
      'dataset-processing',
    ];

    return types.map((type) => {
      const list = Array.from(this.jobs.values()).filter((j) => j.type === type);
      return {
        queueName: type,
        pending: list.filter((j) => j.status === 'PENDING').length,
        processing: this.processingCount.get(type) || 0,
        completed: list.filter((j) => j.status === 'COMPLETED').length,
        failed: list.filter((j) => j.status === 'FAILED').length,
        activeWorkers: this.handlers.has(type) ? this.concurrencyLimits.get(type) || 1 : 0,
      };
    });
  }
}

export const jobQueue = new JobQueueManager();
