import { RequestCategory, UrgencyLevel, RequestStatus } from './types';

export const CATEGORY_DETAILS: Record<
  string,
  { label: string; icon: string; color: string; description: string }
> = {
  ROAD: {
    label: 'Road Infrastructure',
    icon: 'Navigation',
    color: '#0F766E', // Primary teal
    description: 'Road damage, pothole clusters, rural link roads, bridge access',
  },
  HEALTHCARE: {
    label: 'Healthcare Facilities',
    icon: 'HeartPulse',
    color: '#DC2626', // Critical red
    description: 'PHC shortages, clinic access, emergency ambulance routing delays',
  },
  EDUCATION: {
    label: 'Education & Schools',
    icon: 'GraduationCap',
    color: '#2563EB', // Secondary blue
    description: 'Primary/secondary schools, classroom capacity, STEM connectivity',
  },
  WATER: {
    label: 'Drinking Water Supply',
    icon: 'Droplets',
    color: '#0284C7', // Sky blue
    description: 'Piped drinking water, borewell failures, tank contamination',
  },
  SANITATION: {
    label: 'Sanitation & Drainage',
    icon: 'Trash2',
    color: '#D97706', // Amber
    description: 'Open drains, waste management, public sanitation blocks',
  },
  ELECTRICITY: {
    label: 'Power & Electricity',
    icon: 'Zap',
    color: '#EAB308', // Yellow
    description: 'Transformer outages, low voltage, rural electrification gaps',
  },
  PUBLIC_TRANSPORT: {
    label: 'Public Transit',
    icon: 'Bus',
    color: '#7C3AED', // Purple
    description: 'Bus frequency, transit stops, last-mile feeder routes',
  },
  DIGITAL_CONNECTIVITY: {
    label: 'Digital & Telecom',
    icon: 'Wifi',
    color: '#06B6D4', // Cyan
    description: 'Optical fiber reach, 4G/5G dark spots, CSC digital access',
  },
  HOUSING: {
    label: 'Affordable Housing',
    icon: 'Home',
    color: '#4F46E5', // Indigo
    description: 'Pucca housing rehabilitation, flood-resistant settlements',
  },
  AGRICULTURE: {
    label: 'Agriculture & Irrigation',
    icon: 'Sprout',
    color: '#16A34A', // Green
    description: 'Canal distributaries, mandis, cold storage facilities',
  },
  DISASTER_RESILIENCE: {
    label: 'Disaster Resilience',
    icon: 'ShieldAlert',
    color: '#EA580C', // Orange
    description: 'Flood embankments, cyclone shelters, slope stabilization',
  },
  PUBLIC_SAFETY: {
    label: 'Public Safety',
    icon: 'ShieldCheck',
    color: '#475569', // Slate
    description: 'Street lighting, safety patrols, high-risk intersections',
  },
  OTHER: {
    label: 'Other Infrastructure',
    icon: 'Building2',
    color: '#64748B',
    description: 'Community centers, cremation grounds, municipal amenities',
  },
};

export const INDIAN_STATES_DISTRICTS: Record<string, string[]> = {
  Rajasthan: ['Jaipur', 'Barmer', 'Jodhpur', 'Udaipur', 'Alwar', 'Bikaner', 'Sikar', 'Banswara'],
  Maharashtra: ['Pune', 'Nashik', 'Nagpur', 'Thane', 'Aurangabad', 'Solapur', 'Nanded', 'Gadchiroli'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Dharmapuri', 'Ramanathapuram'],
  'West Bengal': ['Kolkata', 'North 24 Parganas', 'Darjeeling', 'Purulia', 'Bankura', 'Murshidabad', 'Howrah'],
  Odisha: ['Bhubaneswar', 'Cuttack', 'Koraput', 'Kalahandi', 'Mayurbhanj', 'Sambalpur', 'Balasore'],
  Assam: ['Guwahati', 'Kamrup', 'Dhubri', 'Dibrugarh', 'Silchar', 'Nagaon', 'Barpeta'],
  'Uttar Pradesh': ['Lucknow', 'Varanasi', 'Kanpur', 'Prayagraj', 'Gorakhpur', 'Sitapur', 'Sonbhadra'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Chhindwara', 'Jhabua', 'Rewa'],
  Karnataka: ['Bengaluru Urban', 'Mysuru', 'Belagavi', 'Kalaburagi', 'Hubballi-Dharwad', 'Raichur'],
  Telangana: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Adilabad', 'Khammam'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Kurnool', 'Tirupati', 'Anantapur'],
  Bihar: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Purnia', 'Darbhanga', 'Champaran'],
};

export const STATUS_FLOW: RequestStatus[] = [
  'SUBMITTED',
  'AI_VERIFIED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'ACTION_PLANNED',
  'IN_PROGRESS',
  'COMPLETED',
];

export const STATUS_COLORS: Record<RequestStatus, { bg: string; text: string; border: string }> = {
  SUBMITTED: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  AI_VERIFIED: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-300' },
  UNDER_REVIEW: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
  ASSIGNED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
  ACTION_PLANNED: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300' },
  IN_PROGRESS: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
  COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
  REJECTED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300' },
};

export const URGENCY_COLORS: Record<UrgencyLevel, { bg: string; text: string; border: string }> = {
  LOW: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  MEDIUM: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  HIGH: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
  CRITICAL: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300' },
};
