import { readFile, writeFile } from 'node:fs/promises';

const catalogPath = new URL('../app/catalog.generated.ts', import.meta.url);
const cachePath = new URL('./catalog-translation-cache.json', import.meta.url);
const catalogText = await readFile(catalogPath, 'utf8');
const catalog = JSON.parse(catalogText.replace(/^.*?= /s, '').replace(/ as const;\s*$/, ''));
let cache = {};
try {
  cache = JSON.parse(await readFile(cachePath, 'utf8'));
} catch {
  // The first run creates the cache.
}

const sourceTexts = [...new Set(catalog.sections.flatMap((section) => section.plugins.flatMap((plugin) => [
  plugin.longDescription,
  ...plugin.defaultPrompts,
]).filter((text) => text && !/[\u4e00-\u9fa5]/.test(text))))];

function splitText(text, maxLength = 2600) {
  if (text.length <= maxLength) return [text];
  const lines = text.split('\n');
  const chunks = [];
  let current = '';
  for (const line of lines) {
    const next = current ? `${current}\n${line}` : line;
    if (next.length <= maxLength) {
      current = next;
      continue;
    }
    if (current) chunks.push(current);
    if (line.length <= maxLength) {
      current = line;
    } else {
      for (let offset = 0; offset < line.length; offset += maxLength) chunks.push(line.slice(offset, offset + maxLength));
      current = '';
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function translateChunk(chunk, attempt = 0) {
  const query = encodeURIComponent(chunk);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q=${query}`;
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!response.ok) {
    if (attempt < 2) return translateChunk(chunk, attempt + 1);
    throw new Error(`Translation request failed: ${response.status}`);
  }
  const payload = await response.json();
  const translated = payload?.[0]?.map((item) => item?.[0] ?? '').join('');
  if (!translated) {
    if (attempt < 2) return translateChunk(chunk, attempt + 1);
    throw new Error('Translation response was empty');
  }
  return translated;
}

async function translateText(text) {
  const chunks = splitText(text);
  const translated = [];
  for (const chunk of chunks) translated.push(await translateChunk(chunk));
  return translated.join('\n');
}

const pending = sourceTexts.filter((text) => !cache[text] || !/[\u4e00-\u9fa5]/.test(cache[text]));
let cursor = 0;
async function worker() {
  while (cursor < pending.length) {
    const text = pending[cursor++];
    cache[text] = await translateText(text);
    process.stdout.write(`Translated ${Object.keys(cache).length}/${sourceTexts.length}\r`);
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
await writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
console.log(`\nSaved ${Object.keys(cache).length} translations to ${cachePath.pathname}`);
