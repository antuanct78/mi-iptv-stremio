const express = require('express');
const app = express();
const PORT = process.env.PORT || 7000;
const M3U_URL = process.env.M3U_URL;
const BASE = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
const ADDON_ID = 'org.personal.miiptv';

let cache = { at: 0, channels: [] };
function slug(s) {
  return String(s || 'canal').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'canal';
}
async function getChannels() {
  if (!M3U_URL) throw new Error('Falta configurar la variable M3U_URL con la URL de tu lista.');
  if (Date.now() - cache.at < 60000 && cache.channels.length) return cache.channels;
  const response = await fetch(M3U_URL, { headers: { 'user-agent': 'MiIPTV-Stremio/1.0' }, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`La lista M3U respondió HTTP ${response.status}`);
  const body = await response.text();
  const lines = body.replace(/^\uFEFF/, '').split(/\r?\n/);
  const channels = [];
  let info = '';
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('#EXTINF')) { info = line; continue; }
    if (line.startsWith('#')) continue;
    if (/^https?:\/\//i.test(line)) {
      const nameMatch = info.match(/,(.*)$/);
      const attr = (key) => (info.match(new RegExp(`${key}="([^"]*)"`, 'i')) || [])[1] || '';
      const name = (nameMatch && nameMatch[1].trim()) || `Canal ${channels.length + 1}`;
      const id = `miiptv.${slug(name)}.${channels.length + 1}`;
      channels.push({ id, name, url: line, logo: attr('tvg-logo'), group: attr('group-title') });
      info = '';
    }
  }
  cache = { at: Date.now(), channels };
  return channels;
}
const manifest = {
  id: ADDON_ID,
  version: '1.0.0',
  name: 'Mi IPTV',
  description: 'Tus canales de una lista M3U personal en Stremio',
  resources: ['catalog', 'stream'],
  types: ['tv'],
  catalogs: [{ type: 'tv', id: 'miiptv-channels', name: 'Mi IPTV', extra: [{ name: 'skip' }] }],
  idPrefixes: ['miiptv.'],
  behaviorHints: { configurable: false, configurationRequired: false }
};
app.get('/manifest.json', (_req, res) => res.json(manifest));
app.get('/catalog/tv/miiptv-channels.json', async (req, res) => {
  try {
    const skip = Math.max(0, Number(req.query.skip) || 0);
    const channels = await getChannels();
    res.json({ metas: channels.slice(skip, skip + 100).map(c => ({ id: c.id, type: 'tv', name: c.name, poster: c.logo || undefined, description: c.group || 'Canal de mi lista IPTV' })) });
  } catch (e) { res.status(502).json({ metas: [], error: e.message }); }
});
app.get('/stream/tv/:id.json', async (req, res) => {
  try {
    const channels = await getChannels();
    const c = channels.find(x => x.id === req.params.id);
    if (!c) return res.json({ streams: [] });
    res.json({ streams: [{ title: c.name, url: c.url }] });
  } catch (e) { res.status(502).json({ streams: [], error: e.message }); }
});
app.get('/', (_req, res) => res.type('text').send('Mi IPTV para Stremio está activo. Abre /manifest.json en Stremio.'));
app.listen(PORT, () => console.log(`Mi IPTV escuchando en ${PORT}`));
