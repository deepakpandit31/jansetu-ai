import { UrgencyLevel, RequestCategory } from '../../../../packages/shared/src/types';

export interface PriorityBreakdown {
  citizenDemand: number; // max 25
  populationImpact: number; // max 25
  infrastructureGap: number; // max 20
  urgency: number; // max 15
  accessibility: number; // max 15
  totalScore: number; // max 100
  confidence: number;
}

export function calculatePriorityScore(params: {
  requestCount: number;
  populationAffected: number;
  gapScore: number; // 0-100
  urgencyLevels: UrgencyLevel[];
  category: RequestCategory;
  hasNearbyAlternative: boolean;
}): PriorityBreakdown {
  // 1. Citizen Demand (0-25)
  // 100+ requests approaches 25
  const rawDemand = (Math.min(params.requestCount, 120) / 120) * 25;
  const citizenDemand = parseFloat(rawDemand.toFixed(1));

  // 2. Population Impact (0-25)
  // Scaling against a typical rural block population (~80,000)
  const rawPop = (Math.min(params.populationAffected, 80000) / 80000) * 25;
  const populationImpact = parseFloat(rawPop.toFixed(1));

  // 3. Infrastructure Gap (0-20)
  // Normalizing 0-100 gap score to 0-20
  const rawGap = (Math.min(Math.max(params.gapScore, 0), 100) / 100) * 20;
  const infrastructureGap = parseFloat(rawGap.toFixed(1));

  // 4. Urgency Score (0-15)
  let urgencySum = 0;
  params.urgencyLevels.forEach((u) => {
    if (u === 'CRITICAL') urgencySum += 15;
    else if (u === 'HIGH') urgencySum += 11;
    else if (u === 'MEDIUM') urgencySum += 7;
    else urgencySum += 3;
  });
  const avgUrgency = params.urgencyLevels.length > 0 ? urgencySum / params.urgencyLevels.length : 8;
  const urgency = parseFloat(avgUrgency.toFixed(1));

  // 5. Accessibility & Vulnerability Score (0-15)
  let accessibilityRaw = params.hasNearbyAlternative ? 6.5 : 13.5;
  if (params.category === 'HEALTHCARE' || params.category === 'DISASTER_RESILIENCE') {
    accessibilityRaw = Math.min(15, accessibilityRaw + 1.5);
  }
  const accessibility = parseFloat(accessibilityRaw.toFixed(1));

  const totalScore = parseFloat(
    (citizenDemand + populationImpact + infrastructureGap + urgency + accessibility).toFixed(1)
  );

  const confidence = parseFloat(
    Math.min(0.98, 0.78 + (params.requestCount > 20 ? 0.12 : 0.05) + (params.populationAffected > 10000 ? 0.06 : 0.02)).toFixed(2)
  );

  return {
    citizenDemand,
    populationImpact,
    infrastructureGap,
    urgency,
    accessibility,
    totalScore,
    confidence,
  };
}
