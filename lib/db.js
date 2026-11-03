import { newDB, DEFAULT_CFG, migrate } from './core.js';
import { seed } from './seed.js';
let q = Promise.resolve();
export async function load() {
  const { radar } = await chrome.storage.local.get('radar');
  if (radar) { const v0 = radar.versao || 1; migrate(radar, seed); if (v0 < 2) await chrome.storage.local.set({ radar });
    radar.capturas = radar.capturas || [];
    radar.cfg = { ...DEFAULT_CFG, ...radar.cfg, freq: { ...DEFAULT_CFG.freq, ...(radar.cfg || {}).freq } }; return radar; }
  const db = newDB(seed); await chrome.storage.local.set({ radar: db }); return db;
}
export const save = (db) => chrome.storage.local.set({ radar: db });
// Leitura-modificação-escrita serializada (evita corridas dentro do mesmo contexto).
export function mutate(fn) {
  const run = q.then(async () => { const db = await load(); const r = await fn(db); await save(db); return r; });
  q = run.catch(() => {}); return run;
}
