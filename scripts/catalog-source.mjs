import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFile, readdir, stat } from 'node:fs/promises';

export async function readOfficialCatalog() {
  const explicit = process.env.CODEX_PLUGIN_CATALOG;
  if (explicit) return JSON.parse(await readFile(explicit, 'utf8'));
  const directory = join(process.env.CODEX_HOME ?? join(homedir(), '.codex'), 'cache', 'remote_plugin_catalog');
  const candidates = (await readdir(directory)).filter((name) => name.endsWith('.json'));
  const paths = await Promise.all(candidates.map(async (name) => ({ path: join(directory, name), modified: (await stat(join(directory, name))).mtimeMs })));
  paths.sort((a, b) => b.modified - a.modified);
  for (const { path } of paths) {
    try {
      const catalog = JSON.parse(await readFile(path, 'utf8'));
      if (Array.isArray(catalog.plugins) && catalog.plugins.some((plugin) => plugin.release?.interface && plugin.discoverability)) return catalog;
    } catch { /* Try the next cache snapshot. */ }
  }
  throw new Error(`No complete Codex plugin catalog found in ${directory}. Run the Codex plugin list command first, or set CODEX_PLUGIN_CATALOG.`);
}
