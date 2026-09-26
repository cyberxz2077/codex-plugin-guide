import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const snapshot = await read('./visible-market-snapshot.json');
const index = await read('../public/catalog/market-index.json');
const expectedIds = new Set(Object.values(snapshot.categories).flat());
const actualIds = new Set(index.plugins.map((plugin) => plugin.id));
assert.equal(index.scope, 'official-category-pages');
assert.equal(index.total, expectedIds.size);
assert.equal(actualIds.size, index.plugins.length, 'Duplicate plugin IDs');
assert.deepEqual(actualIds, expectedIds, 'Catalog must exactly match the visible category-page union');
assert.equal(index.categories.length, Object.keys(snapshot.categories).length);
for (const category of index.categories) {
  assert.deepEqual(category.ids, snapshot.categories[category.id]);
  assert.equal(category.count, category.ids.length);
}
for (const id of index.latest.ids) assert.ok(actualIds.has(id), `Latest references missing plugin ${id}`);
const details = new Map();
for (const category of new Set(index.plugins.map((plugin) => plugin.category))) {
  const bundle = await read(`../public/catalog/details-${category}.json`);
  for (const [id, detail] of Object.entries(bundle)) {
    assert.equal(id, detail.id);
    assert.ok(actualIds.has(id), 'Detail bundle contains a non-visible plugin');
    details.set(id, detail);
  }
}
assert.equal(details.size, actualIds.size, 'Every plugin needs a detail record');
for (const plugin of index.plugins) {
  assert.match(plugin.description, /[\u4e00-\u9fff]/, `${plugin.name} missing Chinese summary`);
  assert.match(plugin.productIntro, /[\u4e00-\u9fff]/, `${plugin.name} missing Chinese overview`);
}
const doc = await readFile(new URL('../docs/当前插件目录.md', import.meta.url), 'utf8');
const rows = doc.split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('| 插件名') && !line.startsWith('| ---'));
assert.equal(rows.length, actualIds.size, 'Markdown must contain every plugin exactly once');
const pendingDescriptions = [...details.values()].filter((plugin) => plugin.longDescriptionZh.startsWith('（翻译待补')).length;
const pendingPrompts = [...details.values()].reduce((count, plugin) => count + plugin.defaultPromptsZh.filter((prompt) => prompt.startsWith('（翻译待补')).length, 0);
console.log(JSON.stringify({ total: index.total, categories: index.categories.length, markdownRows: rows.length, pendingDescriptions, pendingPrompts }));
