import { jobQueue, QueueJob } from '../queue/jobQueue';
import { analyzeCitizenInput } from '../ai/geminiService';
import { db } from '../db/inMemoryDb';
import { geminiCircuitBreaker } from '../resilience/circuitBreaker';
import { cache } from '../cache/redisClient';
import {
  detectLanguageAndType,
  sanitizeCitizenInput,
  fallbackMultilingualAnalysis,
} from '../ai/multilingualPipeline';

export interface AiJobPayload {
  requestId: string;
  originalText: string;
  location: {
    state: string;
    district: string;
    block?: string;
    village?: string;
  };
  imageBase64?: string;
  imageMime?: string;
}

export function initializeAiWorker() {
  jobQueue.registerWorker<AiJobPayload, any>(
    'ai-analysis',
    async (job: QueueJob<AiJobPayload>) => {
      const { requestId, originalText, location, imageBase64, imageMime } = job.data;
      const request = db.getRequestById(requestId);

      if (!request) {
        throw new Error(`Request ${requestId} not found in database`);
      }

      // Update state to AI_PROCESSING
      db.updateRequestStatus(
        requestId,
        'AI_PROCESSING' as any,
        'Request is being processed by the asynchronous JanSetu AI Worker pool.',
        'JanSetu AI Pipeline'
      );

      // Execute AI analysis through Circuit Breaker
      const analysis = await geminiCircuitBreaker.execute(
        async () => {
          return await analyzeCitizenInput(originalText, {
            state: location.state,
            district: location.district,
            block: location.block,
            village: location.village,
            imageBase64,
            imageMime,
          });
        },
        // Circuit breaker fallback: semantic multilingual fallback, never default to ROAD
        () => {
          console.warn('[AiWorker] Using fallback deterministic analysis due to Circuit Breaker.');
          const langInfo = detectLanguageAndType(originalText);
          const sanitized = sanitizeCitizenInput(originalText, langInfo);
          return fallbackMultilingualAnalysis(originalText, sanitized.sanitizedText, langInfo, location);
        }
      );

      // Update request with structured findings and advance to AI_VERIFIED
      request.sanitizedText = analysis.sanitizedText;
      request.translatedText = analysis.translatedText;
      request.detectedLanguage = analysis.detectedLanguage;
      request.languageType = analysis.languageType;
      request.category = analysis.primaryCategory || request.category || 'OTHER';
      request.aiConfidence = analysis.aiConfidence;
      request.categoryConfidence = analysis.categoryConfidence;
      request.overallConfidence = analysis.overallConfidence;
      request.needsClarification = analysis.needsClarification;
      request.reasoningSummary = analysis.reasoningSummary;
      request.subcategory = analysis.subcategory;
      request.secondaryCategory = analysis.secondaryCategory;
      request.urgency = analysis.urgency;
      request.analysis = {
        id: `ana-${Date.now()}`,
        requestId: request.id,
        originalText: request.originalText,
        sanitizedText: analysis.sanitizedText,
        translatedText: analysis.translatedText,
        detectedLanguage: analysis.detectedLanguage,
        languageType: analysis.languageType,
        primaryCategory: analysis.primaryCategory,
        subcategory: analysis.subcategory,
        secondaryCategory: analysis.secondaryCategory,
        categoryConfidence: analysis.categoryConfidence,
        overallConfidence: analysis.overallConfidence,
        needsClarification: analysis.needsClarification,
        reasoningSummary: analysis.reasoningSummary,
        aiModel: 'gemini-3.8-flash',
        promptVersion: 'v2.1-multilingual-sanitized',
        detectedProblem: analysis.detectedProblem,
        urgencyReason: analysis.urgencyReason,
        affectedPopulationEstimate: analysis.affectedPopulationEstimate,
        aiConfidence: analysis.aiConfidence,
        createdAt: new Date().toISOString(),
      };

      db.updateRequestStatus(
        requestId,
        'AI_VERIFIED',
        `AI verified: ${analysis.detectedProblem}. Clustered into spatial demand layer with confidence ${Math.round(
          analysis.aiConfidence * 100
        )}%.`,
        'JanSetu AI Engine'
      );

      // Invalidate relevant cache patterns
      await cache.invalidatePattern('dashboard:');
      await cache.invalidatePattern('map:');
      await cache.invalidatePattern('hotspots:');

      // Publish real-time event for web and mobile clients
      await cache.publish('events:request-updated', {
        type: 'REQUEST_STATUS_UPDATED',
        requestId: request.id,
        status: 'AI_VERIFIED',
        category: request.category,
        detectedProblem: analysis.detectedProblem,
        timestamp: new Date().toISOString(),
      });

      return {
        requestId,
        analysis,
        status: 'AI_VERIFIED',
      };
    },
    10 // Concurrency
  );
}
