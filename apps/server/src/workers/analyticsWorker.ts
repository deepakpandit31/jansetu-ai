import { jobQueue, QueueJob } from '../queue/jobQueue';
import { db } from '../db/inMemoryDb';
import { cache } from '../cache/redisClient';
import { calculatePriorityScore } from '../analytics/priorityEngine';

export function initializeAnalyticsWorker() {
  jobQueue.registerWorker(
    'hotspot-analysis',
    async (job: QueueJob) => {
      console.log('[AnalyticsWorker] Computing spatial demand clusters and precomputed KPIs...');
      const requests = db.getRequests();
      const hotspots = db.getHotspots();

      // Recalculate priority scores for existing hotspots
      hotspots.forEach((h) => {
        const factor = calculatePriorityScore({
          requestCount: h.requestCount,
          populationAffected: h.populationAffected,
          gapScore: h.gapScore || h.breakdown.infrastructureGap * 5,
          urgencyLevels: ['HIGH', 'CRITICAL', 'MEDIUM'],
          category: h.category,
          hasNearbyAlternative: false,
        });
        h.priorityScore = factor.totalScore;
        h.confidence = factor.confidence;
        h.breakdown = {
          citizenDemand: factor.citizenDemand,
          populationImpact: factor.populationImpact,
          infrastructureGap: factor.infrastructureGap,
          urgency: factor.urgency,
          accessibility: factor.accessibility,
        };
      });

      // Precompute Dashboard Overview
      const criticalCount = requests.filter((r) => r.urgency === 'CRITICAL' || r.urgency === 'HIGH').length;
      const categoryCounts: Record<string, number> = {};
      requests.forEach((r) => {
        categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
      });

      const stateCounts: Record<string, number> = {};
      requests.forEach((r) => {
        stateCounts[r.state] = (stateCounts[r.state] || 0) + 1;
      });

      const precomputedOverview = {
        kpis: {
          totalRequests: requests.length,
          criticalIssues: criticalCount,
          activeHotspots: hotspots.length,
          infrastructureGaps: 18,
          aiRecommendations: db.getRecommendations().length,
          approvedProjects: db.getRecommendations().filter((r) => r.status === 'APPROVED_FOR_PLANNING').length,
          citizenVoiceAccuracy: 94.6,
          cacheStatus: 'PRECOMPUTED_ASYNCHRONOUSLY',
          computedAt: new Date().toISOString(),
        },
        categoryDistribution: Object.entries(categoryCounts).map(([name, count]) => ({ name, count })),
        stateDistribution: Object.entries(stateCounts).map(([name, count]) => ({ name, count })),
        urgencyDistribution: [
          { name: 'LOW', count: requests.filter((r) => r.urgency === 'LOW').length },
          { name: 'MEDIUM', count: requests.filter((r) => r.urgency === 'MEDIUM').length },
          { name: 'HIGH', count: requests.filter((r) => r.urgency === 'HIGH').length },
          { name: 'CRITICAL', count: requests.filter((r) => r.urgency === 'CRITICAL').length },
        ],
        languageDistribution: [
          { name: 'Hindi', count: 1840 },
          { name: 'Tamil', count: 920 },
          { name: 'Bengali', count: 710 },
          { name: 'Marathi', count: 640 },
          { name: 'English', count: 580 },
        ],
      };

      // Store in Redis/Cache with 10-minute TTL
      await cache.set('dashboard:overview:precomputed', precomputedOverview, 600);

      // Publish update event
      await cache.publish('events:analytics-updated', {
        type: 'ANALYTICS_RECOMPUTED',
        hotspotCount: hotspots.length,
        timestamp: new Date().toISOString(),
      });

      return { success: true, hotspotCount: hotspots.length, timestamp: new Date().toISOString() };
    },
    2 // Concurrency
  );

  // Initial precomputation tick
  setTimeout(() => {
    jobQueue.addJob('hotspot-analysis', { trigger: 'STARTUP' });
  }, 1000);

  // Periodic recomputation every 5 minutes
  setInterval(() => {
    jobQueue.addJob('hotspot-analysis', { trigger: 'PERIODIC_SCHEDULE' });
  }, 300000);
}
