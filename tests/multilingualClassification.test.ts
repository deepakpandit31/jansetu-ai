import {
  detectLanguageAndType,
  sanitizeCitizenInput,
  fallbackMultilingualAnalysis,
  validateCategory,
} from '../apps/server/src/ai/multilingualPipeline';

interface TestCase {
  id: number;
  input: string;
  expectedCategory: string;
  languageName: string;
  inputType: 'Text' | 'Voice' | 'Image+Text';
}

export const TEST_MATRIX: TestCase[] = [
  // 1. Critical Water Tests across 13 languages + Hinglish + English
  { id: 1, input: 'There is a water issue in my village.', expectedCategory: 'WATER', languageName: 'English', inputType: 'Text' },
  { id: 2, input: 'हमारे गांव में पानी की समस्या है।', expectedCategory: 'WATER', languageName: 'Hindi', inputType: 'Text' },
  { id: 3, input: 'Hamare gaon mein paani ki problem hai.', expectedCategory: 'WATER', languageName: 'Hinglish', inputType: 'Text' },
  { id: 4, input: 'আমাদের গ্রামে পানীয় জলের समस्या রয়েছে।', expectedCategory: 'WATER', languageName: 'Bengali', inputType: 'Text' },
  { id: 5, input: 'எங்கள் கிராமத்தில் குடிநீர் பிரச்சனை உள்ளது.', expectedCategory: 'WATER', languageName: 'Tamil', inputType: 'Text' },
  { id: 6, input: 'మా గ్రామంలో తాగునీటి సమస్య ఉంది.', expectedCategory: 'WATER', languageName: 'Telugu', inputType: 'Text' },
  { id: 7, input: 'आमच्या गावात पिण्याच्या पाण्याची समस्या आहे.', expectedCategory: 'WATER', languageName: 'Marathi', inputType: 'Text' },
  { id: 8, input: 'અમારા ગામમાં પીવાના પાણીની સમસ્યા છે.', expectedCategory: 'WATER', languageName: 'Gujarati', inputType: 'Text' },
  { id: 9, input: 'ನಮ್ಮ ಗ್ರಾಮದಲ್ಲಿ ಕುಡಿಯುವ ನೀರಿನ ಸಮಸ್ಯೆ ಇದೆ.', expectedCategory: 'WATER', languageName: 'Kannada', inputType: 'Text' },
  { id: 10, input: 'ഞങ്ങളുടെ ഗ്രാമത്തിൽ കുടിവെള്ള പ്രശ്നമുണ്ട്.', expectedCategory: 'WATER', languageName: 'Malayalam', inputType: 'Text' },
  { id: 11, input: 'ਸਾਡੇ ਪਿੰਡ ਵਿੱਚ ਪੀਣ ਵਾਲੇ ਪਾਣੀ ਦੀ ਸਮੱਸਿਆ ਹੈ।', expectedCategory: 'WATER', languageName: 'Punjabi', inputType: 'Text' },
  { id: 12, input: 'ଆମ ଗାଁରେ ପାନୀୟ ଜଳର ସମସ୍ୟା ଅଛି।', expectedCategory: 'WATER', languageName: 'Odia', inputType: 'Text' },
  { id: 13, input: 'আমাৰ গাঁৱত খোৱা পানীৰ समस्या আছে।', expectedCategory: 'WATER', languageName: 'Assamese', inputType: 'Text' },
  { id: 14, input: 'ہمارے گاؤں میں پینے کے پانی کا مسئلہ ہے۔', expectedCategory: 'WATER', languageName: 'Urdu', inputType: 'Text' },

  // Water Hinglish variations & Voice transcripts
  { id: 15, input: 'Hamare gaon mein paani nahi aa raha.', expectedCategory: 'WATER', languageName: 'Hinglish', inputType: 'Voice' },
  { id: 16, input: 'Village mein drinking water ka issue hai.', expectedCategory: 'WATER', languageName: 'Hinglish Code-Mixed', inputType: 'Text' },
  { id: 17, input: 'hamare gaon me paaniiii nhi aa rha bhai', expectedCategory: 'WATER', languageName: 'Noisy Hinglish', inputType: 'Voice' },
  { id: 18, input: 'Hamare village ki water pipeline toot gayi hai.', expectedCategory: 'WATER', languageName: 'Hinglish Code-Mixed', inputType: 'Text' },

  // 2. Critical Road Tests
  { id: 19, input: 'Our village road is broken.', expectedCategory: 'ROAD', languageName: 'English', inputType: 'Text' },
  { id: 20, input: 'हमारे गांव की सड़क खराब है।', expectedCategory: 'ROAD', languageName: 'Hindi', inputType: 'Text' },
  { id: 21, input: 'Hamare gaon ki road bahut kharab hai.', expectedCategory: 'ROAD', languageName: 'Hinglish', inputType: 'Text' },
  { id: 22, input: 'Road mein bahut potholes hain.', expectedCategory: 'ROAD', languageName: 'Hinglish', inputType: 'Voice' },
  { id: 23, input: 'आमच्या गावातील रस्ता खराब आहे.', expectedCategory: 'ROAD', languageName: 'Marathi', inputType: 'Text' },

  // 3. Healthcare Tests
  { id: 24, input: 'There is no hospital near our village.', expectedCategory: 'HEALTHCARE', languageName: 'English', inputType: 'Text' },
  { id: 25, input: 'Hospital bahut door hai.', expectedCategory: 'HEALTHCARE', languageName: 'Hinglish', inputType: 'Text' },
  { id: 26, input: 'हमारे गांव में कोई अस्पताल या डॉक्टर नहीं है।', expectedCategory: 'HEALTHCARE', languageName: 'Hindi', inputType: 'Voice' },
  { id: 27, input: 'எங்கள் கிராமத்தில் ஆரம்ப சுகாதார நிலையம் இல்லை.', expectedCategory: 'HEALTHCARE', languageName: 'Tamil', inputType: 'Text' },

  // 4. Sanitation Tests
  { id: 28, input: 'हमारे इलाके में कचरा जमा है।', expectedCategory: 'SANITATION', languageName: 'Hindi', inputType: 'Text' },
  { id: 29, input: 'Mohalle mein kachra jama hai.', expectedCategory: 'SANITATION', languageName: 'Hinglish', inputType: 'Text' },
  { id: 30, input: 'Area mein garbage collection nahi hota.', expectedCategory: 'SANITATION', languageName: 'Hinglish Code-Mixed', inputType: 'Voice' },
  { id: 31, input: 'The open sewer drain is blocked and overflowing.', expectedCategory: 'SANITATION', languageName: 'English', inputType: 'Text' },

  // 5. Electricity Tests
  { id: 32, input: 'Bijli baar baar ja rahi hai.', expectedCategory: 'ELECTRICITY', languageName: 'Hinglish', inputType: 'Text' },
  { id: 33, input: 'हमारे गांव में बार-बार बिजली कटती है।', expectedCategory: 'ELECTRICITY', languageName: 'Hindi', inputType: 'Voice' },
  { id: 34, input: 'The distribution transformer burnt out and voltage is low.', expectedCategory: 'ELECTRICITY', languageName: 'English', inputType: 'Text' },

  // 6. Education Tests
  { id: 35, input: 'School mein teacher nahi hain.', expectedCategory: 'EDUCATION', languageName: 'Hinglish', inputType: 'Text' },
  { id: 36, input: 'हमारे प्राथमिक विद्यालय में शिक्षकों की कमी है।', expectedCategory: 'EDUCATION', languageName: 'Hindi', inputType: 'Voice' },

  // 7. PII Sanitization Test (Extracts problem, strips private info)
  {
    id: 37,
    input: 'Mera naam Rahul hai, phone 9876543210, aur hamare gaon mein paani nahi aa raha.',
    expectedCategory: 'WATER',
    languageName: 'Hinglish with PII',
    inputType: 'Text',
  },
];

export function runMultilingualTestSuite() {
  console.log('====================================================');
  console.log('JANSETU AI - MULTILINGUAL CLASSIFICATION TEST SUITE');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;
  const results: any[] = [];

  for (const test of TEST_MATRIX) {
    const langInfo = detectLanguageAndType(test.input);
    const sanitized = sanitizeCitizenInput(test.input, langInfo);
    const analysis = fallbackMultilingualAnalysis(test.input, sanitized.sanitizedText, langInfo);
    const validated = validateCategory(analysis.primaryCategory, sanitized.sanitizedText, test.input);

    const isMatch = validated.finalCategory === test.expectedCategory;
    if (isMatch) {
      passed++;
    } else {
      failed++;
    }

    results.push({
      id: test.id,
      input: test.input,
      expected: test.expectedCategory,
      actual: validated.finalCategory,
      detectedLang: langInfo.detectedLanguage,
      languageType: langInfo.languageType,
      sanitizedText: sanitized.sanitizedText,
      sensitiveInfoRemoved: sanitized.sensitiveInfoRemoved,
      passed: isMatch,
    });

    const statusIcon = isMatch ? '✅' : '❌';
    console.log(
      `${statusIcon} Test #${test.id} [${test.languageName} - ${test.inputType}]`
    );
    console.log(`   Input: "${test.input}"`);
    console.log(`   Sanitized: "${sanitized.sanitizedText}"`);
    console.log(
      `   Result: ${validated.finalCategory} (Expected: ${test.expectedCategory}) | Confidence: ${(analysis.categoryConfidence * 100).toFixed(0)}%`
    );
    if (!isMatch) {
      console.error(`   >>> ERROR: Expected ${test.expectedCategory} but got ${validated.finalCategory}`);
    }
  }

  console.log('----------------------------------------------------');
  console.log(`Summary: ${passed} PASSED, ${failed} FAILED (Total: ${TEST_MATRIX.length})`);
  console.log(`Success Rate: ${((passed / TEST_MATRIX.length) * 100).toFixed(1)}%`);
  console.log('====================================================');

  return { passed, failed, total: TEST_MATRIX.length, results };
}

// Run directly if invoked
if (process.argv[1]?.includes('multilingualClassification.test.ts')) {
  const result = runMultilingualTestSuite();
  if (result.failed > 0) {
    process.exit(1);
  }
}
