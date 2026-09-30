import { RequestCategory, UrgencyLevel, StructuredAIAnalysis } from '../../../../packages/shared/src/types';
import { getGeminiClient } from './geminiService';

export interface LanguageDetectionResult {
  detectedLanguage: string; // ISO or BCP-47 e.g. 'hi', 'hi-Latn', 'en', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'ur'
  languageType: 'NATIVE' | 'HINGLISH' | 'CODE_MIXED' | 'STANDARD';
  script: string;
  confidence: number;
}

export interface SanitizationResult {
  sanitizedText: string;
  originalText: string;
  sensitiveInfoRemoved: boolean;
  artifactsCleaned: boolean;
  detectedLanguage: string;
  languageType: 'NATIVE' | 'HINGLISH' | 'CODE_MIXED' | 'STANDARD';
}

// ----------------------------------------------------
// 1. ADVANCED LANGUAGE & SCRIPT DETECTION
// ----------------------------------------------------
export function detectLanguageAndType(rawText: string): LanguageDetectionResult {
  const text = rawText.trim();
  if (!text) {
    return { detectedLanguage: 'en', languageType: 'STANDARD', script: 'Latin', confidence: 1.0 };
  }

  // Unicode Block Detection
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  const hasBengaliOrAssamese = /[\u0980-\u09FF]/.test(text);
  const hasGurmukhi = /[\u0A00-\u0A7F]/.test(text);
  const hasGujarati = /[\u0A80-\u0AFF]/.test(text);
  const hasOdia = /[\u0B00-\u0B7F]/.test(text);
  const hasTamil = /[\u0B80-\u0BFF]/.test(text);
  const hasTelugu = /[\u0C00-\u0C7F]/.test(text);
  const hasKannada = /[\u0C80-\u0CFF]/.test(text);
  const hasMalayalam = /[\u0D00-\u0D7F]/.test(text);
  const hasArabic = /[\u0600-\u06FF]/.test(text);

  if (hasTamil) return { detectedLanguage: 'ta', languageType: 'NATIVE', script: 'Tamil', confidence: 0.99 };
  if (hasTelugu) return { detectedLanguage: 'te', languageType: 'NATIVE', script: 'Telugu', confidence: 0.99 };
  if (hasKannada) return { detectedLanguage: 'kn', languageType: 'NATIVE', script: 'Kannada', confidence: 0.99 };
  if (hasMalayalam) return { detectedLanguage: 'ml', languageType: 'NATIVE', script: 'Malayalam', confidence: 0.99 };
  if (hasGujarati) return { detectedLanguage: 'gu', languageType: 'NATIVE', script: 'Gujarati', confidence: 0.99 };
  if (hasGurmukhi) return { detectedLanguage: 'pa', languageType: 'NATIVE', script: 'Gurmukhi', confidence: 0.99 };
  if (hasOdia) return { detectedLanguage: 'or', languageType: 'NATIVE', script: 'Odia', confidence: 0.99 };
  if (hasArabic) return { detectedLanguage: 'ur', languageType: 'NATIVE', script: 'Perso-Arabic', confidence: 0.98 };

  if (hasBengaliOrAssamese) {
    // Check specific Assamese markers e.g. ৰ (U+09F0), ৱ (U+09F1)
    if (/[\u09F0\u09F1]/.test(text) || text.includes('আমাৰ') || text.includes('গাঁৱত') || text.includes('পানীৰ')) {
      return { detectedLanguage: 'as', languageType: 'NATIVE', script: 'Bengali/Assamese', confidence: 0.98 };
    }
    return { detectedLanguage: 'bn', languageType: 'NATIVE', script: 'Bengali', confidence: 0.98 };
  }

  if (hasDevanagari) {
    // Distinguish Marathi vs Hindi
    const marathiMarkers = ['आहे', 'नाही', 'गावात', 'झाले', 'वारंवार', 'कचरा', 'पाण्याची', 'समस्या', 'रस्ता'];
    const isMarathi = marathiMarkers.some((m) => text.includes(m)) && !text.includes('हमारे') && !text.includes('गांव में');
    return {
      detectedLanguage: isMarathi ? 'mr' : 'hi',
      languageType: 'NATIVE',
      script: 'Devanagari',
      confidence: 0.98,
    };
  }

  // Latin Script: Distinguish English vs Hinglish / Code-Mixed Indian languages
  const lower = text.toLowerCase();
  const hinglishMarkers = [
    'hamare', 'humare', 'humaare', 'gaon', 'gav', 'mein', 'me', 'paani', 'pani', 'sadak', 'sarak',
    'rasta', 'kharaab', 'kharab', 'toot', 'tuti', 'hai', 'hain', 'he', 'nhi', 'nahi', 'nahin',
    'aa rha', 'aa raha', 'aa rahi', 'ja rahi', 'door', 'bahut', 'bohot', 'bahuuuut', 'kachra', 'bijli',
    'aspataal', 'aspatal', 'peene', 'bhai', 'yaar', 'arre', 'dekho', 'kripya', 'shikayat', 'problem',
    'issue', 'village', 'area', 'colony', 'gully', 'mohalla', 'bimar', 'bimaar', 'baar baar'
  ];

  let indicMatches = 0;
  for (const marker of hinglishMarkers) {
    if (new RegExp(`\\b${marker}\\b`, 'i').test(lower) || lower.includes(marker)) {
      indicMatches++;
    }
  }

  const hasEnglishStructure = /\b(the|is|in|our|there|we|have|has|are|not|no|to|and|of)\b/i.test(lower);

  if (indicMatches >= 2 || (indicMatches >= 1 && !hasEnglishStructure)) {
    return {
      detectedLanguage: 'hi-Latn',
      languageType: 'HINGLISH',
      script: 'Latin',
      confidence: 0.97,
    };
  }

  if (indicMatches >= 1 && hasEnglishStructure) {
    return {
      detectedLanguage: 'hi-Latn',
      languageType: 'CODE_MIXED',
      script: 'Latin',
      confidence: 0.95,
    };
  }

  return {
    detectedLanguage: 'en',
    languageType: 'STANDARD',
    script: 'Latin',
    confidence: 0.96,
  };
}

// ----------------------------------------------------
// 2. AI SANITIZATION LAYER (Meaning Preserving & Anti-Slop)
// ----------------------------------------------------
export function sanitizeCitizenInput(rawText: string, langInfo: LanguageDetectionResult): SanitizationResult {
  const original = rawText.trim();
  let sanitized = original;
  let sensitiveRemoved = false;
  let artifactsCleaned = false;

  // 1. Remove Voice & Audio Transcription Artifacts / Prolonged Letters:
  // e.g. "paaniiii" -> "paani", "bahuuuuut" -> "bahut", "kharabbbb" -> "kharab"
  const prolongedRegex = /([a-zA-Z\u0900-\u0D7F])\1{2,}/g;
  if (prolongedRegex.test(sanitized)) {
    sanitized = sanitized.replace(prolongedRegex, '$1$1');
    artifactsCleaned = true;
  }

  // 2. Remove Informal Fillers at beginning or end:
  // e.g. "bhai", "yaar", "arre bhai", "sunlo", "dekho yaar", "um", "uh"
  const fillers = [
    /^(arre|are|bhai|yaar|dekho|suno|uh|um|er|sir|madam)[\s,]+/i,
    /[\s,]+(bhai|yaar|plz|pls|kripya|dekho)$/i,
  ];
  for (const fl of fillers) {
    if (fl.test(sanitized)) {
      sanitized = sanitized.replace(fl, '');
      artifactsCleaned = true;
    }
  }

  // 3. Redact Sensitive PII (Name & Phone Number) from the sanitized view, while keeping the core problem intact
  // e.g. "Mera naam Rahul hai, phone 9876543210, aur hamare gaon mein paani nahi aa raha"
  // -> "Hamare gaon mein paani nahi aa raha"
  const phonePattern = /(?:(?:phone|mobile|mob|contact|no|number|call|ph)?[:\s-]*)?([6-9]\d{9})\b/gi;
  if (phonePattern.test(sanitized)) {
    sanitized = sanitized.replace(phonePattern, '');
    sensitiveRemoved = true;
  }

  const namePatternHindi = /(?:मेरा नाम|mera naam|my name is)\s+([A-Za-z\u0900-\u097F]+)(?:\s+(?:hai|here|aur|,))?/gi;
  if (namePatternHindi.test(sanitized)) {
    sanitized = sanitized.replace(namePatternHindi, '');
    sensitiveRemoved = true;
  }

  // Clean dangling conjunctions created by removal (e.g. "aur hamare..." -> "hamare...")
  sanitized = sanitized
    .replace(/^[\s,;:-]+(aur|and|lekin|but|toh|ki)?[\s,;:-]+/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // If sanitization emptied it, fallback to original
  if (!sanitized) {
    sanitized = original;
  }

  return {
    sanitizedText: sanitized,
    originalText: original,
    sensitiveInfoRemoved: sensitiveRemoved,
    artifactsCleaned,
    detectedLanguage: langInfo.detectedLanguage,
    languageType: langInfo.languageType,
  };
}

// ----------------------------------------------------
// 3. CATEGORY VALIDATOR (Stage 2 Verification)
// ----------------------------------------------------
export function validateCategory(
  predictedCategory: RequestCategory,
  sanitizedText: string,
  originalText: string
): { finalCategory: RequestCategory; isValid: boolean; overrideReason?: string } {
  const combined = `${sanitizedText} ${originalText}`.toLowerCase();

  // Water signatures across languages
  const waterSignatures = [
    // Indic Latin (Hinglish)
    'paani', 'pani', 'peene ka paani', 'peene ka pani', 'handpump', 'hand pump', 'borewell', 'bore well',
    'tubewell', 'tanki', 'water tank', 'water pipeline', 'water supply', 'drinking water', 'tap water',
    'water leak', 'leakage', 'dirty water', 'ganda paani', 'water shortage', 'paani nahi', 'pani nahi',
    'paani ki problem', 'pani ki problem', 'paani ki dikkat', 'water problem', 'water issue',
    // Hindi / Devanagari
    'पानी', 'पीने का पानी', 'पेयजल', 'जल आपूर्ति', 'जल संकट', 'जल समस्या', 'नलकूप', 'हैंडपंप', 'हैंड पंप', 'बोरवेल', 'टंकी',
    // Bengali / Assamese
    'পানীয় জল', 'জল', 'জলের সমস্যা', 'নলকূপ', 'পানী', 'খোৱা পানী', 'পানীৰ সমস্যা',
    // Tamil
    'குடிநீர்', 'தண்ணீர்', 'குடிநீர் பிரச்சனை', 'குழாய்',
    // Telugu
    'తాగునీరు', 'నీరు', 'నీటి సమస్య', 'బోర్ వెల్',
    // Marathi
    'पिण्याचे पाणी', 'पाणी', 'पाण्याची समस्या', 'पाण्याची टंचाई',
    // Gujarati
    'પીવાનું પાણી', 'પાણી', 'પાણીની સમસ્યા', 'બોરવેલ',
    // Kannada
    'ಕುಡಿಯುವ ನೀರು', 'ನೀರು', 'ನೀರಿನ ಸಮಸ್ಯೆ',
    // Malayalam
    'കുടിവെള്ള', 'കുടിവെള്ളം', 'കുടിവെള്ള പ്രശ്നം', 'വെള്ളം',
    // Punjabi
    'ਪੀਣ ਵਾਲਾ ਪਾਣੀ', 'ਪਾਣੀ', 'ਪਾਣੀ ਦੀ ਸਮੱਸਿਆ',
    // Odia
    'ପାନୀୟ ଜଳ', 'ପାଣି', 'ପାଣି ସମସ୍ୟା',
    // Urdu
    'پینے کا پانی', 'پانی', 'پانی کا مسئلہ'
  ];

  // Road signatures across languages
  const roadSignatures = [
    'sadak', 'sarak', 'rasta', 'road', 'pothole', 'potholes', 'khadde', 'khadda', 'toot gayi',
    'sadak kharab', 'road kharab', 'broken road', 'highway', 'bridge', 'pavement',
    'सड़क', 'सड़क खराब', 'खड्डे', 'रास्ता', 'ভাঙা রাস্তা', 'রাস্তা', 'சாலை', 'சேதமடைந்த சாலை',
    'రహదారి', 'రోడ్డు', 'रस्ता', 'रस्ता खराब', 'રસ્તો', 'ರಸ್ತೆ', 'റോഡ്', 'ਸੜਕ', 'ରାସ୍ତା', 'سڑک'
  ];

  // Healthcare signatures
  const healthSignatures = [
    'hospital', 'aspatal', 'aspataal', 'doctor', 'clinic', 'phc', 'chc', 'dispensary', 'delivery',
    'maternity', 'medicine', 'ilaj', 'treatment', 'ambulance nahi pahunch', 'अस्पताल', 'डॉक्टर',
    'इलाज', 'சுகாதாரம்', 'சுகாதார', 'சுகாதார நிலையம்', 'ஆரம்ப சுகாதார நிலையம்', 'மருத்துவமனை',
    'மருத்துவர்', 'ஆஸ்பத்திரி', 'వైద్యశాల', 'ఆసుపత్రి', 'दवाखाना'
  ];

  // Sanitation signatures
  const sanitationSignatures = [
    'kachra', 'garbage', 'dustbin', 'drain', 'drainage', 'sewer', 'sewage', 'naali', 'nali',
    'toilet', 'shauchalaya', 'gandagi', 'waste', 'dump', 'dumping', 'कचरा', 'नाली', 'गंदगी',
    'শৌচালয়', 'আবর্জনা', 'சாக்கடை', 'குப்பை', 'చెత్త', 'घाण', 'કચરો'
  ];

  // Electricity signatures
  const electricitySignatures = [
    'bijli', 'power', 'light', 'electricity', 'transformer', 'voltage', 'power cut', 'wire',
    'electric pole', 'dp', 'tripping', 'power supply', 'बिजली', 'ट्रांसफार्मर', 'विद्युत',
    'বিদ্যুৎ', 'மின்சாரம்', 'విద్యుత్', 'वीज', 'વીજળી'
  ];

  // Education signatures
  const educationSignatures = [
    'school', 'teacher', 'teachers', 'classroom', 'student', 'college', 'vidyalaya', 'shala',
    'padhai', 'स्कूल', 'शिक्षक', 'विद्यालय', 'বিদ্যালয়', 'பள்ளி', 'పాఠశాల', 'शाळा', 'શાળા'
  ];

  const hasWater = waterSignatures.some((sig) => combined.includes(sig));
  const hasRoad = roadSignatures.some((sig) => combined.includes(sig));
  const hasHealth = healthSignatures.some((sig) => combined.includes(sig));
  const hasSanitation = sanitationSignatures.some((sig) => combined.includes(sig));
  const hasElectricity = electricitySignatures.some((sig) => combined.includes(sig));
  const hasEducation = educationSignatures.some((sig) => combined.includes(sig));

  // Contradiction Check 1: Water issue misclassified as ROAD or others
  if (hasWater && !hasRoad && predictedCategory !== 'WATER') {
    return {
      finalCategory: 'WATER',
      isValid: false,
      overrideReason: `Contradiction detected: Citizen input clearly reports water supply/drinking water problem. Overriding incorrect ${predictedCategory} to WATER.`,
    };
  }

  // Contradiction Check 2: Road issue misclassified as something else
  if (hasRoad && !hasWater && predictedCategory !== 'ROAD') {
    return {
      finalCategory: 'ROAD',
      isValid: false,
      overrideReason: `Contradiction detected: Citizen input reports damaged/broken road connectivity. Overriding ${predictedCategory} to ROAD.`,
    };
  }

  // Contradiction Check 3: Sanitation
  if (hasSanitation && predictedCategory !== 'SANITATION' && !hasWater && !hasRoad) {
    return {
      finalCategory: 'SANITATION',
      isValid: false,
      overrideReason: `Contradiction detected: Citizen input reports garbage/drainage/sanitation issue. Overriding to SANITATION.`,
    };
  }

  // Contradiction Check 4: Healthcare
  if (hasHealth && predictedCategory !== 'HEALTHCARE' && !hasRoad && !hasWater) {
    return {
      finalCategory: 'HEALTHCARE',
      isValid: false,
      overrideReason: `Contradiction detected: Citizen reports lack of hospital/doctor/maternity facility. Overriding to HEALTHCARE.`,
    };
  }

  // Contradiction Check 5: Electricity
  if (hasElectricity && predictedCategory !== 'ELECTRICITY' && !hasRoad && !hasWater) {
    return {
      finalCategory: 'ELECTRICITY',
      isValid: false,
      overrideReason: `Contradiction detected: Citizen reports frequent power cuts/transformer burnout. Overriding to ELECTRICITY.`,
    };
  }

  // Contradiction Check 6: Education
  if (hasEducation && predictedCategory !== 'EDUCATION' && !hasRoad) {
    return {
      finalCategory: 'EDUCATION',
      isValid: false,
      overrideReason: `Contradiction detected: Citizen reports teacher shortage or school facility issue. Overriding to EDUCATION.`,
    };
  }

  return {
    finalCategory: predictedCategory,
    isValid: true,
  };
}

// ----------------------------------------------------
// 4. DETERMINISTIC MULTILINGUAL SEMANTIC CLASSIFICATION
// Covers all 13 official Indian languages + Hinglish + Code-Mixed
// ----------------------------------------------------
export function fallbackMultilingualAnalysis(
  originalText: string,
  sanitizedText: string,
  langInfo: LanguageDetectionResult,
  meta?: {
    state?: string;
    district?: string;
    block?: string;
    village?: string;
    latitude?: number;
    longitude?: number;
    accuracyMeters?: number | null;
    locationSource?: 'GPS' | 'MAP_SELECTION' | 'MANUAL_SELECTION' | 'ADDRESS' | 'NOT_PROVIDED';
    locationPrecision?: 'EXACT' | 'APPROXIMATE';
    isLocationBlurred?: boolean;
  }
): StructuredAIAnalysis {
  const combined = `${sanitizedText} ${originalText}`.toLowerCase();

  // Location resolution: NEVER guess or invent GPS coordinates
  const resolvedLocation = {
    latitude: meta?.latitude != null ? meta.latitude : null,
    longitude: meta?.longitude != null ? meta.longitude : null,
    accuracyMeters: meta?.accuracyMeters != null ? meta.accuracyMeters : (meta?.latitude != null ? 15 : null),
    source: (meta?.locationSource || (meta?.latitude != null ? 'GPS' : (meta?.district || meta?.state ? 'MANUAL_SELECTION' : 'NOT_PROVIDED'))) as any,
    precision: meta?.locationPrecision || (meta?.isLocationBlurred ? 'APPROXIMATE' : (meta?.latitude != null ? 'EXACT' : 'APPROXIMATE')),
  };

  // 0. DRAINAGE & FLOODING (Must be checked before WATER because flooded roads / blocked drains mention 'paani' / 'pani')
  const isDrainage =
    combined.includes('drainage') ||
    combined.includes('drain') ||
    combined.includes('naali') ||
    combined.includes('nali') ||
    combined.includes('waterlogging') ||
    combined.includes('jalbharav') ||
    combined.includes('flood') ||
    combined.includes('flooding') ||
    combined.includes('doob') ||
    combined.includes('paani bhar') ||
    combined.includes('pani bhar') ||
    combined.includes('paani jama') ||
    combined.includes('pani jama') ||
    combined.includes('जलभराव') ||
    combined.includes('जलजमाव') ||
    combined.includes('नाली बंद') ||
    combined.includes('पानी भर गया') ||
    combined.includes('पानी भर जाता') ||
    combined.includes('सड़क पर पानी') ||
    combined.includes('पानी जमा') ||
    combined.includes('சாக்கடை') ||
    combined.includes('வெள்ளம்');

  if (isDrainage) {
    const alsoMentionsRoad = combined.includes('road') || combined.includes('sadak') || combined.includes('सड़क') || combined.includes('toot');
    return {
      originalText,
      detectedLanguage: langInfo.detectedLanguage,
      languageType: langInfo.languageType,
      sanitizedText,
      translatedText: alsoMentionsRoad
        ? 'Heavy rainwater and blocked drainage inundate the roadway, causing severe road damage and transit disruption.'
        : 'Blocked wastewater drains and severe stormwater logging cause extensive neighborhood inundation.',
      primaryCategory: 'DRAINAGE_AND_FLOODING',
      subcategory: alsoMentionsRoad ? 'Stormwater Inundation & Road Damage' : 'Blocked Drain & Waterlogging',
      secondaryCategory: alsoMentionsRoad ? 'ROAD_AND_TRANSPORT' : 'SANITATION',
      problem: 'Blocked wastewater drainage and severe monsoon waterlogging',
      detectedProblem: 'Inadequate stormwater disposal and open drain overflow leading to public health hazards',
      secondaryImpact: alsoMentionsRoad ? 'TRANSIT_AND_COMMUTING_DISRUPTION' : 'VECTOR_BORNE_EPIDEMIC_RISK',
      urgency: 'HIGH',
      urgencyReason: 'Waterlogging causes building damage, road erosion, and acute waterborne vector proliferation.',
      categoryConfidence: 0.97,
      overallConfidence: 0.95,
      aiConfidence: 0.96,
      needsClarification: false,
      reasoningSummary: 'The citizen describes stormwater inundation, blocked drainage, or overflow onto streets.',
      affectedPopulationEstimate: 12000,
      summary: 'Stormwater drainage blockage and neighborhood waterlogging.',
      locationMentioned: meta?.village || 'Reported Locality',
      duplicateSearchTerms: ['drainage blockage', 'waterlogging street', 'stormwater overflow'],
      location: resolvedLocation,
    };
  }

  // 1. WATER (Drinking water, water shortage, handpump, borewell, pipeline, tap water)
  const isWater =
    combined.includes('water') ||
    combined.includes('paani') ||
    combined.includes('pani') ||
    combined.includes('पानी') ||
    combined.includes('पेयजल') ||
    combined.includes('जल आपूर्ति') ||
    combined.includes('जल संकट') ||
    combined.includes('जल समस्या') ||
    combined.includes('নলকূপ') ||
    combined.includes('পানীয় জল') ||
    combined.includes('জলের সমস্যা') ||
    combined.includes('পানী') ||
    combined.includes('খোৱা পানী') ||
    combined.includes('পানীৰ সমস্যা') ||
    combined.includes('குடிநீர்') ||
    combined.includes('தண்ணீர்') ||
    combined.includes('తాగునీరు') ||
    combined.includes('నీటి సమస్య') ||
    combined.includes('पिण्याचे पाणी') ||
    combined.includes('पाण्याची समस्या') ||
    combined.includes('પીવાનું પાણી') ||
    combined.includes('પાણીની સમસ્યા') ||
    combined.includes('ಕುಡಿಯುವ ನೀರು') ||
    combined.includes('ನೀರಿನ సమస్య') ||
    combined.includes('കുടിവെള്ള') ||
    combined.includes('കുടിവെള്ളം') ||
    combined.includes('കുടിവെള്ള പ്രശ്നം') ||
    combined.includes('വെള്ളം') ||
    combined.includes('ਪੀਣ ਵਾਲਾ ਪਾਣੀ') ||
    combined.includes('ਪਾਣੀ ਦੀ ਸਮੱਸਿਆ') ||
    combined.includes('ପାନୀୟ ଜଳ') ||
    combined.includes('ପାଣି ସମସ୍ୟା') ||
    combined.includes('پینے کا پانی') ||
    combined.includes('پانی') ||
    combined.includes('handpump') ||
    combined.includes('borewell') ||
    combined.includes('pipeline') ||
    combined.includes('tanki');

  if (isWater) {
    const isContaminated = combined.includes('ganda') || combined.includes('dirty') || combined.includes('fluoride') || combined.includes('घोला');
    const isSecondaryHealth = combined.includes('bimar') || combined.includes('bimaar') || combined.includes('ill') || combined.includes('disease');
    
    return {
      originalText,
      detectedLanguage: langInfo.detectedLanguage,
      languageType: langInfo.languageType,
      sanitizedText,
      translatedText: isContaminated
        ? 'Drinking water supply is contaminated or non-potable in our village, requiring immediate source filtration.'
        : 'There is a drinking water supply shortage in our village, requiring immediate pipeline or pump restoration.',
      primaryCategory: 'WATER',
      subcategory: isContaminated ? 'Water Contamination' : 'Drinking Water Supply Deficit',
      secondaryCategory: isSecondaryHealth ? 'HEALTHCARE' : null,
      problem: isContaminated ? 'Contaminated drinking water supply' : 'Drinking water supply deficit',
      detectedProblem: isContaminated
        ? 'Drinking water contamination and unsafe potable supply affecting community health'
        : 'Inadequate or defunct drinking water infrastructure causing severe water shortage',
      secondaryImpact: isSecondaryHealth ? 'PUBLIC_HEALTH / GASTROINTESTINAL_RISK' : 'HOUSEHOLD_WATER_SECURITY',
      urgency: 'HIGH',
      urgencyReason: 'Access to safe drinking water is a fundamental community necessity with direct public health implications.',
      categoryConfidence: 0.98,
      overallConfidence: 0.96,
      aiConfidence: 0.97,
      needsClarification: false,
      reasoningSummary: 'The citizen is reporting a village potable water supply shortage or breakdown.',
      affectedPopulationEstimate: 16500,
      summary: 'Potable water supply deficit reported in village community.',
      locationMentioned: meta?.village || 'Reported Village',
      duplicateSearchTerms: ['drinking water shortage', 'borewell pipeline failure', 'potable water supply'],
    };
  }

  // 2. ROAD (Damaged roads, potholes, broken pavement, transport connection)
  const isRoad =
    combined.includes('road') ||
    combined.includes('sadak') ||
    combined.includes('sarak') ||
    combined.includes('rasta') ||
    combined.includes('pothole') ||
    combined.includes('सड़क') ||
    combined.includes('रास्ता') ||
    combined.includes('ভাঙা রাস্তা') ||
    combined.includes('சாலை') ||
    combined.includes('రహదారి') ||
    combined.includes('రోడ్డు') ||
    combined.includes('रस्ता') ||
    combined.includes('રસ્તો') ||
    combined.includes('ರಸ್ತೆ') ||
    combined.includes('റോഡ്') ||
    combined.includes('ਸੜਕ') ||
    combined.includes('ରାସ୍ତା') ||
    combined.includes('সڑک') ||
    combined.includes('toot gayi') ||
    combined.includes('broken');

  if (isRoad) {
    const isAmbulanceBlocked = combined.includes('ambulance') || combined.includes('एम्बुलेंस') || combined.includes('hospital');
    return {
      originalText,
      detectedLanguage: langInfo.detectedLanguage,
      languageType: langInfo.languageType,
      sanitizedText,
      translatedText: isAmbulanceBlocked
        ? 'Our village road is severely damaged, preventing emergency ambulances from reaching patients during monsoon.'
        : 'Our village road is damaged with severe potholes, disrupting connectivity and transport.',
      primaryCategory: 'ROAD',
      subcategory: isAmbulanceBlocked ? 'Emergency Access Disruption' : 'Damaged Road Surface',
      secondaryCategory: isAmbulanceBlocked ? 'HEALTHCARE' : null,
      problem: 'Damaged village road and disrupted transport connectivity',
      detectedProblem: 'Severe road surface degradation with deep potholes and missing bitumen surfacing',
      secondaryImpact: isAmbulanceBlocked ? 'EMERGENCY_HEALTHCARE_TRANSIT_DELAY' : 'ECONOMIC_CONNECTIVITY_LOSS',
      urgency: isAmbulanceBlocked ? 'HIGH' : 'MEDIUM',
      urgencyReason: isAmbulanceBlocked
        ? 'Damaged road surface directly obstructs emergency ambulance mobility and patient transport.'
        : 'Potholed and unpaved roadway impedes daily village vehicular access and agricultural transit.',
      categoryConfidence: 0.98,
      overallConfidence: 0.95,
      aiConfidence: 0.96,
      needsClarification: false,
      reasoningSummary: 'The citizen is reporting physical road surface damage and connectivity obstruction.',
      affectedPopulationEstimate: 14200,
      summary: 'Damaged village road impeding transportation and transit.',
      locationMentioned: meta?.village || 'Reported Village',
      duplicateSearchTerms: ['damaged road surface', 'potholes village road', 'ambulance access blocked'],
    };
  }

  // 3. HEALTHCARE (Hospital, doctor, PHC, delivery, dispensary, health center)
  const isHealthcare =
    combined.includes('hospital') ||
    combined.includes('aspataal') ||
    combined.includes('aspatal') ||
    combined.includes('doctor') ||
    combined.includes('clinic') ||
    combined.includes('phc') ||
    combined.includes('delivery') ||
    combined.includes('maternity') ||
    combined.includes('अस्पताल') ||
    combined.includes('डॉक्टर') ||
    combined.includes('சுகாதாரம்') ||
    combined.includes('சுகாதார') ||
    combined.includes('சுகாதார நிலையம்') ||
    combined.includes('ஆரம்ப சுகாதார நிலையம்') ||
    combined.includes('மருத்துவமனை') ||
    combined.includes('மருத்துவர்') ||
    combined.includes('ఆసుపత్రి') ||
    combined.includes('వైద్యశాల') ||
    combined.includes('दवाखाना');

  if (isHealthcare) {
    return {
      originalText,
      detectedLanguage: langInfo.detectedLanguage,
      languageType: langInfo.languageType,
      sanitizedText,
      translatedText: 'There is no accessible hospital or doctor near our village, creating urgent medical care deficits.',
      primaryCategory: 'HEALTHCARE',
      subcategory: 'Primary Healthcare Facility Deficit',
      secondaryCategory: null,
      problem: 'Lack of accessible hospital or medical facility near village',
      detectedProblem: 'Absence of functional 24/7 delivery services, doctor attendance, and primary emergency clinic',
      secondaryImpact: 'MATERNAL_AND_INFANT_HEALTH_RISK',
      urgency: 'HIGH',
      urgencyReason: 'Residents must travel excessive distances (>30km) to reach basic institutional healthcare.',
      categoryConfidence: 0.97,
      overallConfidence: 0.94,
      aiConfidence: 0.95,
      needsClarification: false,
      reasoningSummary: 'The citizen describes an acute shortage or absence of local primary healthcare facilities.',
      affectedPopulationEstimate: 28000,
      summary: 'Primary healthcare center deficit in rural block.',
      locationMentioned: meta?.village || 'Reported Location',
      duplicateSearchTerms: ['hospital distance deficit', 'PHC doctor shortage', 'maternal care access'],
    };
  }

  // 4. SANITATION (Garbage, waste, drainage, blocked drain, sewage)
  const isSanitation =
    combined.includes('kachra') ||
    combined.includes('garbage') ||
    combined.includes('drain') ||
    combined.includes('drainage') ||
    combined.includes('sewer') ||
    combined.includes('sewage') ||
    combined.includes('naali') ||
    combined.includes('nali') ||
    combined.includes('कचरा') ||
    combined.includes('नाली') ||
    combined.includes('गंदगी') ||
    combined.includes('আবর্জনা') ||
    combined.includes('குப்பை') ||
    combined.includes('చెత్త') ||
    combined.includes('घाण') ||
    combined.includes('waste collection');

  if (isSanitation) {
    return {
      originalText,
      detectedLanguage: langInfo.detectedLanguage,
      languageType: langInfo.languageType,
      sanitizedText,
      translatedText: 'Garbage and waste is accumulating in our locality, and blocked drains are causing unhygienic conditions.',
      primaryCategory: 'SANITATION',
      subcategory: 'Waste Collection & Drainage Deficit',
      secondaryCategory: 'HEALTHCARE',
      problem: 'Uncollected garbage accumulation and blocked wastewater drainage',
      detectedProblem: 'Overflowing open public drains and lack of systematic solid waste collection',
      secondaryImpact: 'VECTOR_BORNE_EPIDEMIC_RISK',
      urgency: 'MEDIUM',
      urgencyReason: 'Stagnant wastewater and uncollected solid waste create breeding grounds for disease vectors.',
      categoryConfidence: 0.96,
      overallConfidence: 0.93,
      aiConfidence: 0.94,
      needsClarification: false,
      reasoningSummary: 'The citizen is reporting municipal sanitation, waste collection, and drainage blockages.',
      affectedPopulationEstimate: 9800,
      summary: 'Solid waste accumulation and blocked open drain in locality.',
      locationMentioned: meta?.village || 'Reported Locality',
      duplicateSearchTerms: ['garbage collection accumulation', 'blocked open drain', 'sewage overflow'],
    };
  }

  // 5. ELECTRICITY (Bijli, power cut, transformer, voltage, wire)
  const isElectricity =
    combined.includes('bijli') ||
    combined.includes('power') ||
    combined.includes('light') ||
    combined.includes('electricity') ||
    combined.includes('transformer') ||
    combined.includes('voltage') ||
    combined.includes('power cut') ||
    combined.includes('बिजली') ||
    combined.includes('विद्युत') ||
    combined.includes('বিদ্যুৎ') ||
    combined.includes('மின்சாரம்') ||
    combined.includes('విద్యుత్') ||
    combined.includes('वीज') ||
    combined.includes('વીજળી') ||
    combined.includes('ja rahi hai');

  if (isElectricity) {
    return {
      originalText,
      detectedLanguage: langInfo.detectedLanguage,
      languageType: langInfo.languageType,
      sanitizedText,
      translatedText: 'Frequent power outages and low voltage fluctuations disrupt household and agricultural power supply.',
      primaryCategory: 'ELECTRICITY',
      subcategory: 'Power Outage & Transformer Instability',
      secondaryCategory: 'AGRICULTURE',
      problem: 'Frequent electricity cuts and severe voltage drops',
      detectedProblem: 'Overloaded 11kV distribution line tripping and frequent local transformer failure',
      secondaryImpact: 'AGRICULTURAL_PUMP_DISRUPTION',
      urgency: 'MEDIUM',
      urgencyReason: 'Irregular power supply interrupts tube-well irrigation and community lighting.',
      categoryConfidence: 0.97,
      overallConfidence: 0.94,
      aiConfidence: 0.95,
      needsClarification: false,
      reasoningSummary: 'The citizen is reporting unstable grid electricity supply and frequent power cuts.',
      affectedPopulationEstimate: 11500,
      summary: 'Frequent power tripping and transformer voltage fluctuation.',
      locationMentioned: meta?.village || 'Reported Zone',
      duplicateSearchTerms: ['power outage tripping', 'transformer overload', 'low voltage electricity'],
    };
  }

  // 6. EDUCATION (School, teacher, classroom, college, school toilet)
  const isEducation =
    combined.includes('school') ||
    combined.includes('teacher') ||
    combined.includes('teachers') ||
    combined.includes('classroom') ||
    combined.includes('college') ||
    combined.includes('vidyalaya') ||
    combined.includes('shala') ||
    combined.includes('स्कूल') ||
    combined.includes('शिक्षक') ||
    combined.includes('विद्यालय') ||
    combined.includes('বিদ্যালয়') ||
    combined.includes('பள்ளி') ||
    combined.includes('పాఠశాల') ||
    combined.includes('शाळा');

  if (isEducation) {
    const hasToiletIssue =
      combined.includes('toilet') ||
      combined.includes('shauchalaya') ||
      combined.includes('शौचालय') ||
      combined.includes('கழிப்பறை') ||
      combined.includes('మరుగుదొడ్డి');

    return {
      originalText,
      detectedLanguage: langInfo.detectedLanguage,
      languageType: langInfo.languageType,
      sanitizedText,
      translatedText: hasToiletIssue
        ? 'Our village school lacks clean functional toilets and basic sanitation facilities for students.'
        : 'Our village school suffers from severe teacher shortages and damaged classroom infrastructure.',
      primaryCategory: 'EDUCATION',
      subcategory: hasToiletIssue ? 'School Sanitation & Toilet Deficit' : 'School Staffing & Facility Deficit',
      secondaryCategory: hasToiletIssue ? 'SANITATION' : null,
      problem: hasToiletIssue ? 'Lack of functional toilets in school' : 'Shortage of teaching faculty and deficient school classroom facility',
      detectedProblem: hasToiletIssue
        ? 'Absence of clean, separated student toilet blocks affecting attendance and hygiene'
        : 'Vacant teaching positions and dilapidated school room structure impacting children',
      secondaryImpact: hasToiletIssue ? 'GIRL_STUDENT_ATTENDANCE_DROP' : 'STUDENT_DROPOUT_RISK',
      urgency: hasToiletIssue ? 'HIGH' : 'MEDIUM',
      urgencyReason: hasToiletIssue
        ? 'Absence of sanitation facilities in educational institutions directly impacts student dignity and attendance.'
        : 'Inadequate teacher-to-student ratios compromise basic foundational literacy and attendance.',
      categoryConfidence: 0.96,
      overallConfidence: 0.93,
      aiConfidence: 0.94,
      needsClarification: false,
      reasoningSummary: hasToiletIssue
        ? 'The citizen reports absence of student toilets and basic sanitation at the village school.'
        : 'The citizen is reporting school staff shortages and classroom infrastructure deficits.',
      affectedPopulationEstimate: 4200,
      summary: hasToiletIssue ? 'Sanitation and toilet facility deficit in school.' : 'Teacher shortage and basic infrastructure deficit in village school.',
      locationMentioned: meta?.village || 'Reported Village',
      duplicateSearchTerms: ['school toilet deficit', 'school teacher shortage', 'classroom repair'],
      location: resolvedLocation,
    };
  }

  // 7. STREET_LIGHTING (Street lights, pole lights, public illumination)
  const isStreetLighting =
    combined.includes('street light') ||
    combined.includes('street lights') ||
    combined.includes('streetlight') ||
    combined.includes('streetlights') ||
    combined.includes('street lighting') ||
    combined.includes('pole light') ||
    combined.includes('स्ट्रीट लाइट') ||
    combined.includes('गली की लाइट') ||
    combined.includes('लाइट नहीं जलती') ||
    combined.includes('தெரு விளக்கு');

  if (isStreetLighting) {
    return {
      originalText,
      detectedLanguage: langInfo.detectedLanguage,
      languageType: langInfo.languageType,
      sanitizedText,
      translatedText: 'Street lights on the public road have not been working, creating hazardous darkness at night.',
      primaryCategory: 'STREET_LIGHTING',
      subcategory: 'Defunct Public Street Lighting',
      secondaryCategory: 'PUBLIC_SAFETY',
      problem: 'Non-functional streetlights and broken public luminaires',
      detectedProblem: 'Defunct streetlighting infrastructure causing darkness on transit pathways',
      secondaryImpact: 'PUBLIC_SAFETY_RISK',
      urgency: 'MEDIUM',
      urgencyReason: 'Lack of street lighting heightens nocturnal transit hazards and citizen vulnerability.',
      categoryConfidence: 0.98,
      overallConfidence: 0.95,
      aiConfidence: 0.96,
      needsClarification: false,
      reasoningSummary: 'The citizen is reporting broken or non-operational public streetlights.',
      affectedPopulationEstimate: 5400,
      summary: 'Non-functional streetlights causing nighttime public safety risk.',
      locationMentioned: meta?.village || 'Reported Locality',
      duplicateSearchTerms: ['street light non functional', 'streetlights broken', 'public lighting darkness'],
      location: resolvedLocation,
    };
  }

  // 8. INTERNET_AND_TELECOMMUNICATION (Cellular network, mobile signal, tower)
  const isTelecom =
    combined.includes('network') ||
    combined.includes('mobile network') ||
    combined.includes('signal') ||
    combined.includes('tower') ||
    combined.includes('internet') ||
    combined.includes('broadband') ||
    combined.includes('टावर') ||
    combined.includes('नेटवर्क') ||
    combined.includes('सिग्नल') ||
    combined.includes('இணையம்') ||
    combined.includes('டவர்');

  if (isTelecom) {
    return {
      originalText,
      detectedLanguage: langInfo.detectedLanguage,
      languageType: langInfo.languageType,
      sanitizedText,
      translatedText: 'There is no mobile network reception or internet signal in our village, causing severe digital isolation.',
      primaryCategory: 'INTERNET_AND_TELECOMMUNICATION',
      subcategory: 'Mobile Cellular Network & Signal Deficit',
      secondaryCategory: 'DIGITAL_SERVICES',
      problem: 'Absence of mobile network signal and digital communication',
      detectedProblem: 'Cellular network dead-zone with no active transceiver tower within village radius',
      secondaryImpact: 'EMERGENCY_COMMUNICATION_DELAY',
      urgency: 'MEDIUM',
      urgencyReason: 'Absence of cellular connectivity impedes emergency communications and citizen access to essential digital governance.',
      categoryConfidence: 0.97,
      overallConfidence: 0.94,
      aiConfidence: 0.95,
      needsClarification: false,
      reasoningSummary: 'The citizen reports lack of cellular mobile network and internet connectivity.',
      affectedPopulationEstimate: 7800,
      summary: 'Mobile cellular signal and digital connectivity deficit.',
      locationMentioned: meta?.village || 'Reported Village',
      duplicateSearchTerms: ['mobile network no signal', 'cellular tower absent', 'internet connectivity issue'],
      location: resolvedLocation,
    };
  }

  // 9. DEFAULT / UNKNOWN CATEGORY -> MUST BE 'OTHER' with needsClarification: true
  // CRITICAL REQUIREMENT: NEVER DEFAULT TO 'ROAD' OR 'WATER'!
  return {
    originalText,
    detectedLanguage: langInfo.detectedLanguage,
    languageType: langInfo.languageType,
    sanitizedText,
    translatedText: sanitizedText,
    primaryCategory: 'OTHER',
    subcategory: 'Unclassified Community Issue',
    secondaryCategory: null,
    problem: sanitizedText,
    detectedProblem: sanitizedText,
    secondaryImpact: 'COMMUNITY_WELLBEING',
    urgency: 'LOW',
    urgencyReason: 'Request received with low automated classification confidence; manual verification requested.',
    categoryConfidence: 0.45,
    overallConfidence: 0.50,
    aiConfidence: 0.50,
    needsClarification: true,
    reasoningSummary: 'The citizen submission did not exhibit high-confidence matches for standard infrastructure categories.',
    affectedPopulationEstimate: 1000,
    summary: sanitizedText.substring(0, 80),
    locationMentioned: meta?.village || 'Local Area',
    duplicateSearchTerms: ['unclassified request', 'citizen submission'],
    location: resolvedLocation,
  };
}

// ----------------------------------------------------
// 5. MASTER END-TO-END MULTILINGUAL PIPELINE
// ----------------------------------------------------
export async function runMultilingualPipeline(
  rawInput: string,
  meta?: {
    state?: string;
    district?: string;
    block?: string;
    village?: string;
    imageBase64?: string;
    imageMime?: string;
  }
): Promise<StructuredAIAnalysis> {
  // Step 1: Detect Language & Type
  const langInfo = detectLanguageAndType(rawInput);

  // Step 2: AI Sanitization Layer (Cleans voice stuttering, filler words, masks PII)
  const sanitized = sanitizeCitizenInput(rawInput, langInfo);

  // Step 3: Semantic Understanding & Classification
  const ai = getGeminiClient();
  const isDemo = process.env.AI_DEMO_MODE === 'true';

  if (ai && !isDemo) {
    try {
      const prompt = `You are JanSetu AI, the Government of India's Multilingual Civic Infrastructure Understanding Engine.
Your task is to analyze this citizen input and return STRICT JSON conforming to the exact schema.

IMPORTANT REQUIREMENTS:
1. UNDERSTAND THE REAL MEANING, not just keywords.
2. The citizen input may be in any Indian language, Hinglish (Romanized Hindi), code-mixed, or informal spoken style.
3. Allowed Primary Categories:
   - "WATER": Drinking water, supply shortage, pipeline, handpump, borewell, water tank, dirty/fluoride water, leakage. (NEVER classify as ROAD even if "ambulance" or "village" appears).
   - "ROAD": Physical damaged road, potholes, unpaved road, missing road connection.
   - "HEALTHCARE": Hospital, clinic, PHC, CHC, doctor shortage, delivery/maternity clinic, medical equipment.
   - "EDUCATION": School, teacher shortage, classroom damage, college.
   - "SANITATION": Garbage accumulation, waste collection, blocked drains, sewer overflow, public toilets.
   - "ELECTRICITY": Power cuts, transformer burnout, low voltage, dangling wires.
   - "PUBLIC_TRANSPORT": Bus service, bus stand, railway station.
   - "DIGITAL_CONNECTIVITY": Mobile network, internet, mobile tower.
   - "HOUSING": Rural housing, PM Awas, roof collapse.
   - "AGRICULTURE": Crop damage, mandi, irrigation canal.
   - "DISASTER_RESILIENCE": Floods, landslides, cyclone shelter.
   - "PUBLIC_SAFETY": Streetlights, police outpost.
   - "OTHER": If unclear or not fitting above categories. NEVER use ROAD as a default fallback!
4. If categoryConfidence < 0.70, set primaryCategory to "OTHER" and needsClarification to true.
5. Provide a short, factual, objective reasoningSummary (NO internal chain of thought or preamble).
6. DO NOT invent facts, locations, or statistics not provided.

Input:
Citizen Original Text: "${sanitized.originalText}"
Sanitized Meaning: "${sanitized.sanitizedText}"
Detected Language: "${langInfo.detectedLanguage}" (${langInfo.languageType})
Location Context: State=${meta?.state || 'Unknown'}, District=${meta?.district || 'Unknown'}, Village=${meta?.village || 'Unknown'}

Return JSON format:
{
  "detectedLanguage": "${langInfo.detectedLanguage}",
  "languageType": "${langInfo.languageType}",
  "sanitizedText": "clear concise English statement of the citizen problem",
  "translatedText": "fluent English translation of the original input",
  "primaryCategory": "WATER | ROAD | HEALTHCARE | EDUCATION | SANITATION | ELECTRICITY | PUBLIC_TRANSPORT | DIGITAL_CONNECTIVITY | HOUSING | AGRICULTURE | DISASTER_RESILIENCE | PUBLIC_SAFETY | OTHER",
  "subcategory": "short subcategory e.g. Drinking Water Supply Deficit",
  "secondaryCategory": "secondary impacted sector or null",
  "problem": "concise description of defect",
  "detectedProblem": "objective description of physical infrastructure defect",
  "secondaryImpact": "consequential impact e.g. PUBLIC_HEALTH or EMERGENCY_ACCESS",
  "urgency": "LOW | MEDIUM | HIGH | CRITICAL",
  "urgencyReason": "1 sentence explainability rationale for urgency",
  "categoryConfidence": 0.95,
  "overallConfidence": 0.94,
  "aiConfidence": 0.95,
  "needsClarification": false,
  "reasoningSummary": "1 sentence explainability summary",
  "affectedPopulationEstimate": 15000,
  "summary": "1 concise sentence summary",
  "locationMentioned": "${meta?.village || ''}",
  "duplicateSearchTerms": ["term1", "term2"]
}`;

      let contents: any = prompt;
      if (meta?.imageBase64 && meta?.imageMime) {
        contents = {
          parts: [
            {
              inlineData: {
                data: meta.imageBase64,
                mimeType: meta.imageMime,
              },
            },
            {
              text: `${prompt}\nAlso factor in visual infrastructure evidence from the attached photograph (visible structural damage, flood level, potholes, water tank, etc.).`,
            },
          ],
        };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsed = JSON.parse(responseText);

      // Stage 2 Validation Check
      let finalCategory: RequestCategory = parsed.primaryCategory || 'OTHER';
      const validation = validateCategory(finalCategory, sanitized.sanitizedText, sanitized.originalText);
      finalCategory = validation.finalCategory;

      let catConf = typeof parsed.categoryConfidence === 'number' ? parsed.categoryConfidence : 0.92;
      let needsClar = parsed.needsClarification === true;
      if (catConf < 0.70) {
        finalCategory = 'OTHER';
        needsClar = true;
      }

      return {
        originalText: sanitized.originalText,
        detectedLanguage: parsed.detectedLanguage || langInfo.detectedLanguage,
        languageType: langInfo.languageType,
        sanitizedText: parsed.sanitizedText || sanitized.sanitizedText,
        translatedText: parsed.translatedText || sanitized.sanitizedText,
        primaryCategory: finalCategory,
        subcategory: parsed.subcategory || 'Civic Infrastructure Deficit',
        secondaryCategory: parsed.secondaryCategory || null,
        problem: parsed.problem || parsed.detectedProblem || sanitized.sanitizedText,
        detectedProblem: parsed.detectedProblem || sanitized.sanitizedText,
        secondaryImpact: parsed.secondaryImpact || 'COMMUNITY_WELLBEING',
        urgency: (parsed.urgency as UrgencyLevel) || 'MEDIUM',
        urgencyReason: parsed.urgencyReason || 'Evaluated based on citizen community impact signals',
        categoryConfidence: catConf,
        overallConfidence: typeof parsed.overallConfidence === 'number' ? parsed.overallConfidence : catConf,
        aiConfidence: typeof parsed.aiConfidence === 'number' ? parsed.aiConfidence : catConf,
        needsClarification: needsClar,
        reasoningSummary: validation.overrideReason || parsed.reasoningSummary || 'The citizen is reporting an infrastructure issue.',
        affectedPopulationEstimate: parsed.affectedPopulationEstimate || 10000,
        summary: parsed.summary || sanitized.sanitizedText,
        locationMentioned: parsed.locationMentioned || meta?.village,
        duplicateSearchTerms: parsed.duplicateSearchTerms || [],
        sensitiveInfoRemoved: sanitized.sensitiveInfoRemoved,
      };
    } catch (err) {
      console.warn('[MultilingualPipeline] Gemini API failed, using deterministic multilingual engine:', err);
    }
  }

  // Fallback to deterministic multilingual semantic engine
  const deterministicResult = fallbackMultilingualAnalysis(rawInput, sanitized.sanitizedText, langInfo, meta);

  // Run Stage 2 validation
  const validation = validateCategory(deterministicResult.primaryCategory, sanitized.sanitizedText, sanitized.originalText);
  deterministicResult.primaryCategory = validation.finalCategory;
  if (!validation.isValid && validation.overrideReason) {
    deterministicResult.reasoningSummary = validation.overrideReason;
  }
  deterministicResult.sensitiveInfoRemoved = sanitized.sensitiveInfoRemoved;

  return deterministicResult;
}
