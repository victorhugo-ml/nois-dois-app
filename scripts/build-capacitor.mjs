// Copia os arquivos web pra www/ pro Capacitor empacotar no APK
import { mkdir, copyFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'www');

const FILES = [
  'index.html',
  'app.js',
  'app.css',
  'icon.svg',
  'manifest.webmanifest',
  'firebase-messaging-sw.js',
  'capacitor-bridge.js',
  'config/public-config.js',
  'services/firebase.js',
  'services/auth.js'
];

async function main() {
  if (existsSync(OUT)) await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  for (const f of FILES) {
    const src = join(ROOT, f);
    if (!existsSync(src)) {
      console.warn(`[build:web] aviso: ${f} não encontrado`);
      continue;
    }
    const dest = join(OUT, f);
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(src, dest);
    console.log(`[build:web] ${f}`);
  }
  console.log(`[build:web] ✓ www/ pronto`);
}

main().catch(e => { console.error(e); process.exit(1); });
