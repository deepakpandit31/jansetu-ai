import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TRANSLATIONS } from '../packages/shared/src/translations';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const localesDir = path.join(rootDir, 'locales');
const publicLocalesDir = path.join(rootDir, 'public', 'locales');

if (!fs.existsSync(localesDir)) fs.mkdirSync(localesDir, { recursive: true });
if (!fs.existsSync(publicLocalesDir)) fs.mkdirSync(publicLocalesDir, { recursive: true });

for (const [lang, content] of Object.entries(TRANSLATIONS)) {
  const filePath = path.join(localesDir, `${lang}.json`);
  const publicFilePath = path.join(publicLocalesDir, `${lang}.json`);
  const jsonStr = JSON.stringify(content, null, 2);
  fs.writeFileSync(filePath, jsonStr, 'utf-8');
  fs.writeFileSync(publicFilePath, jsonStr, 'utf-8');
  console.log(`[Locales] Generated ${filePath}`);
}
console.log('[Locales] All 13 Indian language locale JSON files generated successfully.');
