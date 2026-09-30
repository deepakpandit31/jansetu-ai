import { jobQueue, QueueJob } from '../queue/jobQueue';
import { db } from '../db/inMemoryDb';
import { cache } from '../cache/redisClient';

export interface NotificationJobPayload {
  userId: string;
  title: string;
  message: string;
  type: 'STATUS_CHANGE' | 'HOTSPOT_ALERT' | 'RECOMMENDATION' | 'SYSTEM';
  requestId?: string;
}

export function initializeNotificationWorker() {
  jobQueue.registerWorker<NotificationJobPayload, any>(
    'notifications',
    async (job: QueueJob<NotificationJobPayload>) => {
      const { userId, title, message, type, requestId } = job.data;

      // Create notification in database
      const notifId = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      db.createNotification({
        id: notifId,
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: new Date().toISOString(),
      });

      // Publish to real-time stream
      await cache.publish(`user:${userId}:notifications`, {
        id: notifId,
        title,
        message,
        type,
        requestId,
        createdAt: new Date().toISOString(),
      });

      return { notifId, sent: true, recipient: userId };
    },
    20 // Concurrency
  );
}
