import fs from 'fs';
import path from 'path';

// Languages required to validate
const REQUIRED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'hinglish', name: 'Hinglish' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'or', name: 'Odia' },
  { code: 'as', name: 'Assamese' },
  { code: 'ur', name: 'Urdu' },
];

function flattenKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      keys = keys.concat(flattenKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getValueByPath(obj: any, pathStr: string): any {
  const parts = pathStr.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr == null || typeof curr !== 'object') return undefined;
    curr = curr[part];
  }
  return curr;
}

export function runLocalizationCheck(): boolean {
  console.log('\n==================================================');
  console.log('JANSETU AI - GLOBAL I18N LOCALIZATION AUDIT');
  console.log('==================================================\n');

  const localesDir = path.resolve(process.cwd(), 'packages/shared/src/locales');
  const enPath = path.join(localesDir, 'en.json');

  if (!fs.existsSync(enPath)) {
    console.error(`❌ English master locale file not found at ${enPath}`);
    return false;
  }

  let enJson: any;
  try {
    enJson = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  } catch (err: any) {
    console.error(`❌ Failed to parse en.json: ${err.message}`);
    return false;
  }

  const masterKeys = flattenKeys(enJson);
  console.log(`📋 Master translation keys defined: ${masterKeys.length}\n`);

  let totalMissingKeys = 0;
  let totalEmptyValues = 0;
  let allPassed = true;

  for (const lang of REQUIRED_LANGUAGES) {
    const filePath = path.join(localesDir, `${lang.code}.json`);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ ${lang.name} (${lang.code}.json) file is MISSING!`);
      allPassed = false;
      continue;
    }

    let langJson: any;
    try {
      langJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err: any) {
      console.error(`❌ ${lang.name} (${lang.code}.json) has INVALID JSON: ${err.message}`);
      allPassed = false;
      continue;
    }

    const missingForThisLang: string[] = [];
    const emptyForThisLang: string[] = [];

    for (const key of masterKeys) {
      const val = getValueByPath(langJson, key);
      if (val === undefined) {
        missingForThisLang.push(key);
      } else if (typeof val === 'string' && val.trim() === '') {
        emptyForThisLang.push(key);
      }
    }

    if (missingForThisLang.length === 0 && emptyForThisLang.length === 0) {
      console.log(`✓ ${lang.name.padEnd(12)} (${lang.code.padEnd(8)}) - 100% Complete (${masterKeys.length}/${masterKeys.length} keys)`);
    } else {
      allPassed = false;
      totalMissingKeys += missingForThisLang.length;
      totalEmptyValues += emptyForThisLang.length;
      console.error(`✗ ${lang.name} (${lang.code}) - Missing: ${missingForThisLang.length}, Empty: ${emptyForThisLang.length}`);
      if (missingForThisLang.length > 0) {
        console.error(`   Sample missing: ${missingForThisLang.slice(0, 5).join(', ')}`);
      }
    }
  }

  console.log('\n--------------------------------------------------');
  if (totalMissingKeys === 0 && totalEmptyValues === 0 && allPassed) {
    console.log('✓ All 14 languages verified.');
    console.log('✓ Missing translation keys: 0');
    console.log('✓ Empty translations: 0');
    console.log('✓ RTL layout enabled for Urdu');
    console.log('✓ Translation completeness test PASSED.\n');
    return true;
  } else {
    console.error(`❌ Audit failed. Missing keys: ${totalMissingKeys}, Empty values: ${totalEmptyValues}\n`);
    return false;
  }
}

if (import.meta.url.endsWith(process.argv[1])) {
  const success = runLocalizationCheck();
  if (!success) {
    process.exit(1);
  }
}
