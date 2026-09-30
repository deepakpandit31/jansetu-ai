// Shared Types for JanSetu AI Monorepo

export type UserRole =
  | 'CITIZEN'
  | 'DISTRICT_OFFICER'
  | 'STATE_OFFICER'
  | 'NATIONAL_OFFICER'
  | 'ANALYST'
  | 'ADMIN';

export type RequestCategory =
  | 'ROAD_AND_TRANSPORT'
  | 'ROAD'
  | 'WATER'
  | 'SANITATION'
  | 'DRAINAGE_AND_FLOODING'
  | 'ELECTRICITY'
  | 'HEALTHCARE'
  | 'EDUCATION'
  | 'INTERNET_AND_TELECOMMUNICATION'
  | 'DIGITAL_CONNECTIVITY'
  | 'PUBLIC_SAFETY'
  | 'HOUSING'
  | 'AGRICULTURE'
  | 'IRRIGATION'
  | 'PUBLIC_DISTRIBUTION'
  | 'WASTE_MANAGEMENT'
  | 'ENVIRONMENT'
  | 'AIR_QUALITY'
  | 'POLLUTION'
  | 'PUBLIC_TOILETS'
  | 'STREET_LIGHTING'
  | 'PUBLIC_SPACES'
  | 'PARKS'
  | 'BUS_SERVICES'
  | 'RAILWAY'
  | 'TRAFFIC'
  | 'FOOTPATH_AND_PEDESTRIAN'
  | 'BRIDGES'
  | 'DRAINAGE'
  | 'SEWERAGE'
  | 'GOVERNMENT_SERVICES'
  | 'DOCUMENT_SERVICES'
  | 'EMPLOYMENT'
  | 'SOCIAL_WELFARE'
  | 'DISASTER_MANAGEMENT'
  | 'DISASTER_RESILIENCE'
  | 'PUBLIC_TRANSPORT'
  | 'FIRE_SERVICES'
  | 'EMERGENCY_SERVICES'
  | 'COMMUNITY_FACILITIES'
  | 'DIGITAL_SERVICES'
  | 'BANKING_ACCESS'
  | 'OTHER'
  | 'UNKNOWN';


export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RequestStatus =
  | 'SUBMITTED'
  | 'AI_VERIFIED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'ACTION_PLANNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED';

export type InfrastructureType =
  | 'HOSPITAL'
  | 'CLINIC'
  | 'SCHOOL'
  | 'ROAD'
  | 'WATER_FACILITY'
  | 'ELECTRICITY_FACILITY'
  | 'PUBLIC_TRANSPORT'
  | 'INTERNET_FACILITY'
  | 'SANITATION_FACILITY'
  | 'OTHER';

export type RecommendationStatus =
  | 'PROPOSED'
  | 'UNDER_REVIEW'
  | 'APPROVED_FOR_PLANNING'
  | 'REJECTED'
  | 'MORE_DATA_REQUESTED';

export interface User {
  id: string;
  officerId?: string;
  name: string;
  phone?: string;
  email?: string;
  role: UserRole;
  preferredLanguage: string;
  district?: string;
  state?: string;
  createdAt: string;
}

export interface RequestMedia {
  id: string;
  requestId: string;
  type: 'image' | 'audio' | 'video' | 'document';
  url: string;
  mimeType: string;
  fileName?: string;
  storageKey?: string;
  storageProvider?: string;
  thumbnailUrl?: string;
  fileSize?: number;
  createdAt: string;
}

export interface RequestAnalysis {
  id: string;
  requestId: string;
  originalText?: string;
  sanitizedText?: string;
  translatedText?: string;
  detectedLanguage?: string;
  languageType?: 'NATIVE' | 'HINGLISH' | 'CODE_MIXED' | 'STANDARD';
  primaryCategory: RequestCategory;
  subcategory?: string;
  secondaryCategory?: string | null;
  categoryConfidence?: number;
  overallConfidence?: number;
  needsClarification?: boolean;
  reasoningSummary: string;
  aiModel?: string;
  promptVersion?: string;
  detectedProblem: string;
  urgencyReason: string;
  affectedPopulationEstimate: number;
  duplicateGroupId?: string;
  aiConfidence: number;
  createdAt: string;
}

export interface RequestStatusHistory {
  id: string;
  requestId: string;
  status: RequestStatus;
  comment?: string;
  updatedBy: string;
  createdAt: string;
}

export interface CitizenRequest {
  id: string;
  citizenId: string;
  citizenName?: string;
  citizenPhone?: string;
  title: string;
  description: string;
  originalText: string;
  sanitizedText?: string;
  translatedText?: string;
  language: string;
  detectedLanguage?: string;
  languageType?: 'NATIVE' | 'HINGLISH' | 'CODE_MIXED' | 'STANDARD';
  category: RequestCategory;
  subcategory?: string;
  secondaryCategory?: string | null;
  aiCategory?: RequestCategory;
  correctedCategory?: RequestCategory;
  urgency: UrgencyLevel;
  status: RequestStatus;
  latitude?: number;
  longitude?: number;
  state: string;
  district: string;
  block?: string;
  village?: string;
  locationSource?: 'GPS' | 'MAP_SELECTION' | 'MANUAL_SELECTION' | 'ADDRESS' | 'NOT_PROVIDED';
  locationPrecision?: 'EXACT' | 'APPROXIMATE';
  isLocationBlurred?: boolean;
  accuracyMeters?: number | null;
  aiConfidence: number;
  categoryConfidence?: number;
  overallConfidence?: number;
  needsClarification?: boolean;
  reasoningSummary?: string;
  createdAt: string;
  updatedAt: string;
  media?: RequestMedia[];
  analysis?: RequestAnalysis;
  statusHistory?: RequestStatusHistory[];
  similarCount?: number;
}

export interface StructuredAIAnalysis {
  language?: string;
  originalText: string;
  detectedLanguage: string;
  languageType: 'NATIVE' | 'HINGLISH' | 'CODE_MIXED' | 'STANDARD';
  sanitizedText: string;
  semanticMeaning?: string;
  translatedText: string;
  primaryCategory: RequestCategory;
  subcategory: string;
  secondaryCategory?: string | null;
  problem: string;
  detectedProblem: string;
  secondaryImpact: string;
  urgency: UrgencyLevel;
  urgencyReason: string;
  categoryConfidence: number;
  overallConfidence: number;
  languageConfidence?: number;
  sanitizationConfidence?: number;
  locationConfidence?: number;
  aiConfidence: number;
  needsClarification: boolean;
  reasoningSummary: string;
  affectedPopulationEstimate: number;
  summary: string;
  locationMentioned?: string;
  duplicateSearchTerms: string[];
  sensitiveInfoRemoved?: boolean;
  semanticValidation?: 'PASSED' | 'FAILED' | 'RECOVERED';
  promptVersion?: string;
  location?: {
    latitude: number | null;
    longitude: number | null;
    accuracyMeters: number | null;
    source: 'GPS' | 'MAP_SELECTION' | 'MANUAL_SELECTION' | 'ADDRESS' | 'NOT_PROVIDED';
    precision?: 'EXACT' | 'APPROXIMATE';
  };
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  type: InfrastructureType;
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  block?: string;
  capacity?: string;
  status: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface InfrastructureGap {
  id: string;
  location: string;
  category: RequestCategory;
  gapScore: number;
  evidence: string;
  affectedPopulation: number;
  createdAt: string;
}

export interface Hotspot {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  category: RequestCategory;
  requestCount: number;
  populationAffected: number;
  gapScore: number;
  urgencyScore: number;
  priorityScore: number;
  confidence: number;
  breakdown: {
    citizenDemand: number; // max 25
    populationImpact: number; // max 25
    infrastructureGap: number; // max 20
    urgency: number; // max 15
    accessibility: number; // max 15
  };
  evidenceSummary: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: RequestCategory;
  location: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  priorityScore: number;
  confidence: number;
  affectedPopulation: number;
  evidence: {
    requestCount: number;
    existingFacilities: string;
    gapMetric: string;
    keyCitizenQuotations: string[];
    dataSources: string[];
  };
  estimatedImpact: string;
  limitations: string;
  status: RecommendationStatus;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface WhatIfSimulationInput {
  state: string;
  district: string;
  category: RequestCategory;
  interventionType: string;
  capacityLevel: 'BASIC' | 'MEDIUM' | 'MAJOR';
  targetLatitude: number;
  targetLongitude: number;
  estimatedBudgetCr?: number;
}

export interface WhatIfSimulationResult {
  simulationId: string;
  timestamp: string;
  baseline: {
    currentCoveragePercent: number;
    accessiblePopulation: number;
    unservedPopulation: number;
    openCitizenRequests: number;
    currentAvgDistanceKm: number;
  };
  projected: {
    newCoveragePercent: number;
    additionalPopulationReached: number;
    newAccessiblePopulation: number;
    requestsAddressedEstimate: number;
    projectedAvgDistanceKm: number;
    gapReductionPercent: number;
    roiScore: number;
  };
  confidence: number;
  dataSources: string[];
  caveats: string[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'STATUS_CHANGE' | 'HOTSPOT_ALERT' | 'RECOMMENDATION' | 'SYSTEM';
  read: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface DataSourceItem {
  id: string;
  name: string;
  provider: string;
  date: string;
  coverage: string;
  description: string;
  lastUpdated: string;
  license: string;
  status: 'ACTIVE' | 'SYNTHETIC_DEMO' | 'OFFICIAL_PIPELINE';
  recordCount: number;
}

export interface Project {
  id: string;
  recommendationId?: string;
  name: string;
  description: string;
  location: string;
  category: RequestCategory;
  budget: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

