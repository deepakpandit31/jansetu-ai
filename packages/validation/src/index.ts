import { z } from 'zod';

export const RequestCategoryEnum = z.enum([
  'ROAD_AND_TRANSPORT',
  'ROAD',
  'WATER',
  'SANITATION',
  'DRAINAGE_AND_FLOODING',
  'ELECTRICITY',
  'HEALTHCARE',
  'EDUCATION',
  'INTERNET_AND_TELECOMMUNICATION',
  'DIGITAL_CONNECTIVITY',
  'PUBLIC_SAFETY',
  'HOUSING',
  'AGRICULTURE',
  'IRRIGATION',
  'PUBLIC_DISTRIBUTION',
  'WASTE_MANAGEMENT',
  'ENVIRONMENT',
  'AIR_QUALITY',
  'POLLUTION',
  'PUBLIC_TOILETS',
  'STREET_LIGHTING',
  'PUBLIC_SPACES',
  'PARKS',
  'BUS_SERVICES',
  'RAILWAY',
  'TRAFFIC',
  'FOOTPATH_AND_PEDESTRIAN',
  'BRIDGES',
  'DRAINAGE',
  'SEWERAGE',
  'GOVERNMENT_SERVICES',
  'DOCUMENT_SERVICES',
  'EMPLOYMENT',
  'SOCIAL_WELFARE',
  'DISASTER_MANAGEMENT',
  'DISASTER_RESILIENCE',
  'PUBLIC_TRANSPORT',
  'FIRE_SERVICES',
  'EMERGENCY_SERVICES',
  'COMMUNITY_FACILITIES',
  'DIGITAL_SERVICES',
  'BANKING_ACCESS',
  'OTHER',
  'UNKNOWN',
]);


export const UrgencyLevelEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const RequestStatusEnum = z.enum([
  'SUBMITTED',
  'AI_VERIFIED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'ACTION_PLANNED',
  'IN_PROGRESS',
  'COMPLETED',
  'REJECTED',
]);

export const RoleEnum = z.enum([
  'CITIZEN',
  'DISTRICT_OFFICER',
  'STATE_OFFICER',
  'NATIONAL_OFFICER',
  'ANALYST',
  'ADMIN',
]);

export const RegisterUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: RoleEnum.default('CITIZEN'),
  preferredLanguage: z.string().default('hi'),
  state: z.string().optional(),
  district: z.string().optional(),
});

export const LoginUserSchema = z.object({
  identifier: z.string().min(3, 'Phone or email is required'),
  password: z.string().min(4, 'Password is required'),
});

export const CreateCitizenRequestSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(5, 'Description is required'),
  originalText: z.string().min(3, 'Original statement is required'),
  sanitizedText: z.string().optional(),
  translatedText: z.string().optional(),
  detectedLanguage: z.string().optional(),
  languageType: z.string().optional(),
  language: z.string().default('hi'),
  category: RequestCategoryEnum,
  subcategory: z.string().optional(),
  secondaryCategory: z.string().nullable().optional(),
  aiCategory: RequestCategoryEnum.optional(),
  correctedCategory: RequestCategoryEnum.optional(),
  urgency: UrgencyLevelEnum.default('MEDIUM'),
  categoryConfidence: z.number().optional(),
  overallConfidence: z.number().optional(),
  needsClarification: z.boolean().optional(),
  reasoningSummary: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  state: z.string().min(2),
  district: z.string().min(2),
  block: z.string().optional(),
  village: z.string().optional(),
  locationSource: z.enum(['GPS', 'MAP_SELECTION', 'MANUAL_SELECTION', 'ADDRESS', 'NOT_PROVIDED']).optional(),
  locationPrecision: z.enum(['EXACT', 'APPROXIMATE']).optional(),
  isLocationBlurred: z.boolean().optional(),
  accuracyMeters: z.number().nullable().optional(),
  mediaUrls: z.array(z.string()).optional(),
  media: z.array(z.object({
    id: z.string().optional(),
    url: z.string(),
    type: z.enum(['image', 'audio', 'video', 'document']).optional().default('image'),
    mimeType: z.string().optional().default('image/jpeg'),
    fileName: z.string().optional(),
    storageKey: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    fileSize: z.number().optional(),
  })).optional(),
  audioUrl: z.string().optional(),
});

export const UpdateRequestStatusSchema = z.object({
  status: RequestStatusEnum,
  comment: z.string().optional(),
});

export const WhatIfSimulationSchema = z.object({
  state: z.string(),
  district: z.string(),
  category: RequestCategoryEnum,
  interventionType: z.string().min(2),
  capacityLevel: z.enum(['BASIC', 'MEDIUM', 'MAJOR']),
  targetLatitude: z.number(),
  targetLongitude: z.number(),
  estimatedBudgetCr: z.number().optional(),
});

export const ReviewRecommendationSchema = z.object({
  status: z.enum([
    'PROPOSED',
    'UNDER_REVIEW',
    'APPROVED_FOR_PLANNING',
    'REJECTED',
    'MORE_DATA_REQUESTED',
  ]),
  notes: z.string().optional(),
  approvedBudgetCr: z.number().optional(),
});
