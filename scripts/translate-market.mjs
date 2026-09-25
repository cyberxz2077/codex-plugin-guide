import { readFile, writeFile } from 'node:fs/promises';
import { readOfficialCatalog } from './catalog-source.mjs';

const cachePath = new URL('./market-translation-cache.json', import.meta.url);
const source = await readOfficialCatalog();
let cache = {};
try { cache = JSON.parse(await readFile(cachePath, 'utf8')); } catch { /* First full-market sync. */ }
try { Object.assign(cache, JSON.parse(await readFile(new URL('./catalog-translation-cache.json', import.meta.url), 'utf8'))); } catch { /* Optional prior homepage translations. */ }

const texts = [...new Set(source.plugins
  .filter((plugin) => plugin.scope === 'GLOBAL' && plugin.discoverability === 'LISTED')
  .flatMap((plugin) => {
    const detail = plugin.release?.interface ?? {};
    return [detail.short_description, detail.long_description, ...(detail.default_prompts ?? [])];
  })
  .filter((value) => value && !/[\u4e00-\u9fff]/.test(value)))];

function chunks(text, limit = 2400) {
  if (text.length <= limit) return [text];
  const result = [];
  let rest = text;
  while (rest.length > limit) {
    let end = rest.lastIndexOf('\n', limit);
    if (end < limit / 2) end = rest.lastIndexOf(' ', limit);
    if (end < limit / 2) end = limit;
    result.push(rest.slice(0, end));
    rest = rest.slice(end).trimStart();
  }
  if (rest) result.push(rest);
  return result;
}

const pending = texts.filter((value) => !cache[value]);
const pieces = pending.flatMap((value) => chunks(value).map((part, index, parts) => ({ value, part, index, count: parts.length })));
const batches = [];
let batch = [];
let length = 0;
for (const piece of pieces) {
  if (batch.length && (batch.length >= 8 || length + piece.part.length > 2800)) {
    batches.push(batch);
    batch = [];
    length = 0;
  }
  batch.push(piece);
  length += piece.part.length;
}
if (batch.length) batches.push(batch);

async function translate(text, attempt = 0) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(25000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    return payload[0].map((item) => item[0] ?? '').join('');
  } catch (error) {
    if (attempt >= 3) throw error;
    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    return translate(text, attempt + 1);
  }
}

const translatedPieces = new Map();
let cursor = 0;
let completed = 0;
let failures = 0;
async function worker() {
  while (cursor < batches.length) {
    const current = batches[cursor++];
    const input = current.map((item, index) => `__CODEX_${index}__\n${item.part}`).join('\n');
    try {
      const output = await translate(input);
      const matches = [...output.matchAll(/__CODEX_(\d+)__\s*\n?/g)];
      if (matches.length !== current.length) throw new Error('Translation markers did not match');
      for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index + matches[i][0].length;
        const end = matches[i + 1]?.index ?? output.length;
        const translated = output.slice(start, end).trim();
        if (!translated) throw new Error('Empty translation segment');
        const item = current[Number(matches[i][1])];
        if (!item) throw new Error('Unexpected translation marker');
        const parts = translatedPieces.get(item.value) ?? Array(item.count).fill(null);
        parts[item.index] = translated;
        translatedPieces.set(item.value, parts);
      }
    } catch {
      for (const item of current) {
        try {
          const parts = translatedPieces.get(item.value) ?? Array(item.count).fill(null);
          parts[item.index] = (await translate(item.part)).trim();
          translatedPieces.set(item.value, parts);
        } catch { failures++; }
      }
    }
    completed++;
    if (completed % 50 === 0) console.log(`Translated batches ${completed}/${batches.length}; failed pieces ${failures}`);
    const delay = Number(process.env.CODEX_TRANSLATION_DELAY_MS ?? 0);
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
await Promise.all(Array.from({ length: Number(process.env.CODEX_TRANSLATION_WORKERS ?? 8) }, worker));
for (const [original, parts] of translatedPieces) {
  if (parts.every(Boolean)) cache[original] = parts.join('\n');
}
await writeFile(cachePath, `${JSON.stringify(cache)}\n`);
console.log(`Saved ${Object.keys(cache).length} translations; ${pending.filter((item) => !cache[item]).length} texts remain untranslated (${failures} failed pieces).`);
