/**
 * JanSetu AI — Automated Concurrency & High-Throughput Load Test Runner
 * Run via: npx tsx scripts/load-test.ts
 */

const TARGET_HOST = process.env.TARGET_URL || 'http://localhost:3000';
const TOTAL_REQUESTS = parseInt(process.env.LOAD_REQUESTS || '1000', 10);
const CONCURRENCY = parseInt(process.env.LOAD_CONCURRENCY || '50', 10);

interface TestStats {
  completed: number;
  errors: number;
  latencies: number[];
}

async function runBenchmark() {
  console.log(`====================================================`);
  console.log(`  JANSETU AI CONCURRENCY & SCALABILITY BENCHMARK`);
  console.log(`  Target URL: ${TARGET_HOST}`);
  console.log(`  Simulated Requests: ${TOTAL_REQUESTS}`);
  console.log(`  Concurrent Connections: ${CONCURRENCY}`);
  console.log(`====================================================\n`);

  const endpoints = [
    '/health',
    '/api/v1/health',
    '/api/v1/dashboard/overview',
    '/api/v1/map/layers?zoom=6',
    '/api/v1/hotspots',
  ];

  const stats: TestStats = {
    completed: 0,
    errors: 0,
    latencies: [],
  };

  const startTime = Date.now();
  let remaining = TOTAL_REQUESTS;

  async function worker() {
    while (remaining > 0) {
      remaining--;
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const t0 = Date.now();

      try {
        const res = await fetch(`${TARGET_HOST}${endpoint}`);
        const duration = Date.now() - t0;
        stats.latencies.push(duration);

        if (res.ok) {
          stats.completed++;
        } else {
          stats.errors++;
        }
      } catch (err) {
        stats.errors++;
      }
    }
  }

  // Launch concurrent workers
  const workers = Array.from({ length: CONCURRENCY }).map(() => worker());
  await Promise.all(workers);

  const totalTimeSeconds = (Date.now() - startTime) / 1000;
  stats.latencies.sort((a, b) => a - b);

  const getPercentile = (p: number) => {
    if (stats.latencies.length === 0) return 0;
    const index = Math.min(Math.floor((p / 100) * stats.latencies.length), stats.latencies.length - 1);
    return stats.latencies[index];
  };

  const rps = Math.round(stats.completed / totalTimeSeconds);
  const p50 = getPercentile(50);
  const p95 = getPercentile(95);
  const p99 = getPercentile(99);
  const errorRate = ((stats.errors / TOTAL_REQUESTS) * 100).toFixed(2);

  console.log(`\n================ BENCHMARK RESULTS ================`);
  console.log(`  Total Requests Dispatched : ${TOTAL_REQUESTS}`);
  console.log(`  Successful Responses      : ${stats.completed}`);
  console.log(`  Failed Requests           : ${stats.errors} (${errorRate}%)`);
  console.log(`  Duration                  : ${totalTimeSeconds.toFixed(2)} seconds`);
  console.log(`  Effective Throughput      : ${rps} requests/sec`);
  console.log(`  --------------------------------------------------`);
  console.log(`  P50 Latency (Median)      : ${p50} ms`);
  console.log(`  P95 Latency               : ${p95} ms (Target: < 500 ms)`);
  console.log(`  P99 Latency               : ${p99} ms`);
  console.log(`====================================================\n`);

  if (p95 < 500 && parseFloat(errorRate) < 1.0) {
    console.log(`[PASS] The system successfully met high-concurrency target metrics.`);
  } else {
    console.warn(`[WARN] Performance thresholds need optimization.`);
  }
}

runBenchmark().catch((err) => {
  console.error('Load test runner encountered error:', err.message);
  process.exit(1);
});
