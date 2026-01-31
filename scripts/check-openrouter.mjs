/**
 * Sprawdza połączenie z OpenRouter API.
 * Odczytuje OPENROUTER_API_KEY z .env w katalogu głównym projektu.
 * Uruchom: node scripts/check-openrouter.mjs
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const envPath = resolve(root, '.env');

function loadEnv() {
  try {
    const raw = readFileSync(envPath, 'utf8');
    const env = {};
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1);
      env[key] = val;
    }
    return env;
  } catch (e) {
    console.error('Błąd odczytu .env:', e.message);
    process.exit(1);
  }
}

const env = loadEnv();
const apiKey = env.OPENROUTER_API_KEY;

if (!apiKey || apiKey.trim() === '') {
  console.error('OPENROUTER_API_KEY nie jest ustawiony w .env');
  process.exit(1);
}

console.log('Sprawdzam połączenie z OpenRouter...');

try {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'arcee-ai/trinity-mini:free',
      messages: [{ role: 'user', content: 'Say OK' }],
      max_tokens: 5,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.error?.message || data?.message || res.statusText;
    console.error('Błąd OpenRouter:', msg);
    if (data?.error) console.error('Szczegóły:', JSON.stringify(data.error, null, 2));
    process.exit(1);
  }

  console.log('OK – połączenie z OpenRouter działa.');
  if (data?.model) console.log('Model:', data.model);
  if (data?.choices?.[0]?.message?.content) console.log('Odpowiedź:', data.choices[0].message.content.trim());
} catch (err) {
  console.error('Błąd sieci:', err.message);
  process.exit(1);
}
