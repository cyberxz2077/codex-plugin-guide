import { readFile, writeFile } from 'node:fs/promises';
import { readOfficialCatalog } from './catalog-source.mjs';

const source = await readOfficialCatalog();
const cachePath = new URL('./market-translation-cache.json', import.meta.url);
const cache = JSON.parse(await readFile(cachePath, 'utf8'));
const listed = source.plugins.filter((plugin) => plugin.scope === 'GLOBAL' && plugin.discoverability === 'LISTED');
const ordered = [...new Set([
  ...listed.map((plugin) => plugin.release.interface.short_description),
  ...listed.map((plugin) => plugin.release.interface.long_description),
  ...listed.flatMap((plugin) => plugin.release.interface.default_prompts ?? []),
].filter((value) => value && !cache[value] && !/[\u4e00-\u9fff]/.test(value)))];
const pieces = [];
for (const value of ordered) {
  const parts = [];
  let remaining = value;
  while (remaining.length > 330) {
    let end = remaining.lastIndexOf(' ', 330);
    if (end < 160) end = 330;
    parts.push(remaining.slice(0, end));
    remaining = remaining.slice(end).trimStart();
  }
  if (remaining) parts.push(remaining);
  parts.forEach((part, index) => pieces.push({ value, part, index, count: parts.length }));
}
const batches = [];
let current = [];
let length = 0;
for (const piece of pieces) {
  if (current.length && (current.length === 4 || length + piece.part.length > 390)) {
    batches.push(current);
    current = [];
    length = 0;
  }
  current.push(piece);
  length += piece.part.length;
}
if (current.length) batches.push(current);

const partial = new Map();
let done = 0;
let stopped = false;
for (const batch of batches) {
  const input = batch.map((item, index) => `§${index}§\n${item.part}`).join('\n');
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(input)}&langpair=en|zh-CN`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const payload = await response.json();
    if (payload.responseStatus !== 200) throw new Error(`API status ${payload.responseStatus}`);
    const output = payload.responseData?.translatedText ?? '';
    const markers = [...output.matchAll(/§\s*(\d+)\s*§/g)];
    if (markers.length !== batch.length) throw new Error('Markers changed in translation');
    for (let i = 0; i < markers.length; i++) {
      const text = output.slice(markers[i].index + markers[i][0].length, markers[i + 1]?.index ?? output.length).trim();
      const item = batch[Number(markers[i][1])];
      if (!item || !text) throw new Error('Incomplete translation');
      const parts = partial.get(item.value) ?? Array(item.count).fill(null);
      parts[item.index] = text;
      partial.set(item.value, parts);
    }
  } catch (error) {
    console.log(`Stopped after ${done} batches: ${error.message}`);
    stopped = true;
  }
  done++;
  if (done % 20 === 0 || stopped || done === batches.length) {
    for (const [value, parts] of partial) if (parts.every(Boolean)) cache[value] = parts.join('\n');
    await writeFile(cachePath, `${JSON.stringify(cache)}\n`);
    console.log(`Saved ${Object.keys(cache).length} translations after ${done}/${batches.length} fallback batches.`);
  }
  if (stopped) break;
  await new Promise((resolve) => setTimeout(resolve, 250));
}
