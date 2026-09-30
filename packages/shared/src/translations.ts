// JANSETU AI - Complete Centralized Multilingual Localization System
// Supporting 13 Official Indian Languages + English + Hinglish (14 total) with RTL support for Urdu

import en from './locales/en.json';
import hi from './locales/hi.json';
import hinglish from './locales/hinglish.json';
import bn from './locales/bn.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import mr from './locales/mr.json';
import gu from './locales/gu.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import pa from './locales/pa.json';
import orLocale from './locales/or.json';
import asLocale from './locales/as.json';
import ur from './locales/ur.json';

export interface SupportedLanguage {
  code: string;
  name: string;
  englishName: string;
  script: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi', script: 'Devanagari', dir: 'ltr' },
  { code: 'en', name: 'English', englishName: 'English', script: 'Latin', dir: 'ltr' },
  { code: 'hinglish', name: 'Hinglish', englishName: 'Hinglish', script: 'Latin', dir: 'ltr' },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali', script: 'Bengali', dir: 'ltr' },
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil', script: 'Tamil', dir: 'ltr' },
  { code: 'te', name: 'తెలుగు', englishName: 'Telugu', script: 'Telugu', dir: 'ltr' },
  { code: 'mr', name: 'मराठी', englishName: 'Marathi', script: 'Devanagari', dir: 'ltr' },
  { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati', script: 'Gujarati', dir: 'ltr' },
  { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada', script: 'Kannada', dir: 'ltr' },
  { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam', script: 'Malayalam', dir: 'ltr' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', script: 'Gurmukhi', dir: 'ltr' },
  { code: 'or', name: 'ଓଡ଼ିଆ', englishName: 'Odia', script: 'Odia', dir: 'ltr' },
  { code: 'as', name: 'অসমীয়া', englishName: 'Assamese', script: 'Bengali', dir: 'ltr' },
  { code: 'ur', name: 'اردو', englishName: 'Urdu', script: 'Perso-Arabic', dir: 'rtl' },
];

export const TRANSLATIONS: Record<string, any> = {
  en,
  hi,
  hinglish,
  bn,
  ta,
  te,
  mr,
  gu,
  kn,
  ml,
  pa,
  or: orLocale,
  as: asLocale,
  ur,
};

export function isRtl(lang: string): boolean {
  return (lang || '').toLowerCase() === 'ur';
}

export function getLanguageDirection(lang: string): 'rtl' | 'ltr' {
  return isRtl(lang) ? 'rtl' : 'ltr';
}

export interface TranslationSchema {
  appName: string;
  tagline: string;
  common: Record<string, string>;
  navigation: Record<string, string>;
  request: Record<string, string>;
  categories: Record<string, string>;
  subcategories: Record<string, string>;
  location: Record<string, string>;
  urgency: Record<string, string>;
  status: Record<string, string>;
  validation: Record<string, string>;
  errors: Record<string, string>;
  success: Record<string, string>;
  voice: Record<string, string>;
  aiConfirmation: Record<string, string>;
  dashboard: Record<string, string>;
  map: Record<string, string>;
  copilot: Record<string, string>;
  settings: Record<string, string>;

  // Backwards compatibility flat properties
  citizenPortal: string;
  officerDashboard: string;
  reportIssue: string;
  speakToReport: string;
  typeToReport: string;
  uploadPhoto: string;
  recording: string;
  tapToStop: string;
  tapToSpeak: string;
  processingVoice: string;
  aiUnderstood: string;
  confirmSubmission: string;
  isThisCorrect: string;
  confirm: string;
  edit: string;
  cancel: string;
  category: string;
  problem: string;
  impact: string;
  urgencies: Record<string, string>;
  myRequests: string;
  nearbyIssues: string;
  notifications: string;
  profile: string;
  help: string;
  statusSubmitted: string;
  statusVerified: string;
  statusUnderReview: string;
  statusAssigned: string;
  statusActionPlanned: string;
  statusInProgress: string;
  statusCompleted: string;
  communityVoiceCount: string;
  listenToAudio: string;
  trustNotice: string;
  selectCategoryTitle: string;
  sanitizedMeaningTitle: string;
  translationTitle: string;
  gpsLocked: string;
  districtBlockOnly: string;
  exactGps: string;
  switchExact: string;
  blurPrivacy: string;
  recordAgain: string;
  confirmAndSubmit: string;
  processWithAi: string;
  citizenCorrected: string;
  automatedPriority: string;
  janSetuVerification: string;
  blurGpsPrompt: string;
  blurGpsActiveDesc: string;
  blurGpsInactiveDesc: string;
  noAudioDetected: string;
  dir: 'ltr' | 'rtl';
  isRtl: boolean;

  // Callable translation helper
  (key: string, params?: Record<string, string | number>): string;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export function createTranslator(lang: string) {
  const code = (lang || 'hi').toLowerCase();
  const raw = TRANSLATIONS[code] || TRANSLATIONS['hi'] || TRANSLATIONS['en'];
  const enRaw = TRANSLATIONS['en'];

  return function t(key: string, params?: Record<string, string | number>): string {
    if (!key) return '';

    // First try dot notation lookup in current language
    const parts = key.split('.');
    let curr: any = raw;
    let found = true;
    for (const part of parts) {
      if (curr && typeof curr === 'object' && part in curr) {
        curr = curr[part];
      } else {
        found = false;
        break;
      }
    }

    if (found && typeof curr === 'string') {
      if (!params) return curr;
      let res = curr;
      for (const [pKey, pVal] of Object.entries(params)) {
        res = res.replace(new RegExp(`{${pKey}}`, 'g'), String(pVal));
      }
      return res;
    }

    // Fallback to English for dot notation
    let enCurr: any = enRaw;
    let enFound = true;
    for (const part of parts) {
      if (enCurr && typeof enCurr === 'object' && part in enCurr) {
        enCurr = enCurr[part];
      } else {
        enFound = false;
        break;
      }
    }
    if (enFound && typeof enCurr === 'string') {
      if (!params) return enCurr;
      let res = enCurr;
      for (const [pKey, pVal] of Object.entries(params)) {
        res = res.replace(new RegExp(`{${pKey}}`, 'g'), String(pVal));
      }
      return res;
    }

    // Direct category / urgency / status fallback
    if (raw.categories && key in raw.categories) return raw.categories[key];
    if (raw.subcategories && key in raw.subcategories) return raw.subcategories[key];
    if (raw.urgency && key in raw.urgency) return raw.urgency[key];
    if (raw.status && key in raw.status) return raw.status[key];
    if (raw.common && key in raw.common) return raw.common[key];

    // Fallback to last token of key
    return parts[parts.length - 1] || key;
  };
}

export function getTranslation(lang: string): TranslationSchema {
  const code = (lang || 'hi').toLowerCase();
  const raw = TRANSLATIONS[code] || TRANSLATIONS['hi'] || TRANSLATIONS['en'];
  const tFn = createTranslator(code);

  const schemaFn: any = function (key: string, params?: Record<string, string | number>) {
    return tFn(key, params);
  };

  // Copy raw grouped translations
  Object.assign(schemaFn, raw);

  // Flat convenience aliases
  schemaFn.appName = raw.appName || 'JanSetu AI';
  schemaFn.tagline = raw.tagline || '';
  schemaFn.citizenPortal = raw.navigation?.citizenPortal || 'Citizen Portal';
  schemaFn.officerDashboard = raw.navigation?.officerDashboard || 'Officer Dashboard';
  schemaFn.reportIssue = raw.navigation?.reportIssue || 'Report Issue';
  schemaFn.speakToReport = raw.request?.speakToReport || 'Speak to Report';
  schemaFn.typeToReport = raw.request?.typeToReport || 'Type to Report';
  schemaFn.uploadPhoto = raw.request?.uploadPhoto || 'Upload Photo';
  schemaFn.recording = raw.voice?.recording || 'Recording...';
  schemaFn.tapToStop = raw.voice?.tapToStop || 'Tap to Stop';
  schemaFn.tapToSpeak = raw.voice?.tapToSpeak || 'Tap to Speak';
  schemaFn.processingVoice = raw.voice?.processingVoice || 'Processing Voice...';
  schemaFn.aiUnderstood = raw.aiConfirmation?.title || 'AI Understood Your Request As:';
  schemaFn.confirmSubmission = raw.request?.confirmDetails || 'Confirm Submission';
  schemaFn.isThisCorrect = raw.request?.isThisCorrect || 'Is this understanding correct?';
  schemaFn.confirm = raw.common?.confirm || 'Confirm';
  schemaFn.edit = raw.common?.edit || 'Edit';
  schemaFn.cancel = raw.common?.cancel || 'Cancel';
  schemaFn.category = raw.categories?.WATER ? raw.request?.selectCategory : 'Category';
  schemaFn.problem = raw.request?.problemDescription || 'Problem Description';
  schemaFn.impact = raw.dashboard?.impact || 'Impact';
  schemaFn.location = raw.location?.title || 'Location';
  schemaFn.urgency = raw.urgency?.title || 'Urgency';
  schemaFn.urgencies = raw.urgency || {};
  schemaFn.myRequests = raw.navigation?.myRequests || 'My Requests';
  schemaFn.nearbyIssues = raw.navigation?.nearbyIssues || 'Nearby Issues';
  schemaFn.notifications = raw.navigation?.notifications || 'Notifications';
  schemaFn.profile = raw.navigation?.profile || 'Profile';
  schemaFn.help = raw.navigation?.settings || 'Help';
  schemaFn.statusSubmitted = raw.status?.SUBMITTED || 'Submitted';
  schemaFn.statusVerified = raw.status?.VERIFIED || 'Verified';
  schemaFn.statusUnderReview = raw.status?.UNDER_REVIEW || 'Under Review';
  schemaFn.statusAssigned = raw.status?.ASSIGNED || 'Assigned';
  schemaFn.statusActionPlanned = raw.status?.ACTION_PLANNED || 'Action Planned';
  schemaFn.statusInProgress = raw.status?.IN_PROGRESS || 'In Progress';
  schemaFn.statusCompleted = raw.status?.COMPLETED || 'Completed';
  schemaFn.communityVoiceCount = raw.navigation?.community || 'Community Voice';
  schemaFn.listenToAudio = raw.voice?.listening || 'Listen';
  schemaFn.trustNotice = raw.copilot?.disclaimer || '';
  schemaFn.selectCategoryTitle = raw.request?.selectCorrectCategory || 'Select Correct Infrastructure Category:';
  schemaFn.sanitizedMeaningTitle = raw.aiConfirmation?.sanitizedMeaning || 'Sanitized Problem Meaning:';
  schemaFn.translationTitle = raw.aiConfirmation?.translation || 'English Translation:';
  schemaFn.gpsLocked = raw.location?.gpsLocked || 'GPS Locked';
  schemaFn.districtBlockOnly = raw.location?.districtBlockOnly || 'District & Block only';
  schemaFn.exactGps = raw.location?.exactGps || 'Exact GPS';
  schemaFn.switchExact = raw.request?.switchExact || 'Switch to Exact GPS';
  schemaFn.blurPrivacy = raw.request?.blurPrivacy || 'Blur GPS for Privacy';
  schemaFn.recordAgain = raw.request?.recordAgain || 'Record Again';
  schemaFn.confirmAndSubmit = raw.common?.confirm || 'Confirm';
  schemaFn.processWithAi = raw.request?.processWithAi || 'Process with JanSetu AI';
  schemaFn.citizenCorrected = raw.aiConfirmation?.citizenCorrected || 'Citizen Corrected';
  schemaFn.automatedPriority = raw.aiConfirmation?.automatedPriority || 'Automated Priority';
  schemaFn.janSetuVerification = raw.aiConfirmation?.janSetuVerification || 'JanSetu Verification';
  schemaFn.blurGpsPrompt = raw.location?.blurPrompt || 'Blur exact GPS coordinates for privacy';
  schemaFn.blurGpsActiveDesc = raw.location?.blurActiveDesc || '';
  schemaFn.blurGpsInactiveDesc = raw.location?.blurInactiveDesc || '';
  schemaFn.noAudioDetected = raw.errors?.noAudioDetected || 'No audio detected.';
  schemaFn.dir = isRtl(code) ? 'rtl' : 'ltr';
  schemaFn.isRtl = isRtl(code);
  schemaFn.t = tFn;

  return schemaFn as TranslationSchema;
}
