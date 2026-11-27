// myboutki database: shops (stores), posts and photos. SQLite file in /data, photos in /data/img.
// Writes need a Firebase Google sign-in token; each shop belongs to the Google account that created it.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

module.exports = function makeDb({ DATA, PROJECT = 'myboutki', SAMPLE_HANDLES = [] }) {
  const IMG = path.join(DATA, 'img'), PRIV = path.join(DATA, 'private');
  for (const d of [IMG, PRIV]) fs.mkdirSync(d, { recursive: true });
  try { fs.chmodSync(DATA, 0o711); fs.chmodSync(IMG, 0o755); fs.chmodSync(PRIV, 0o700); } catch (_) {}

  const db = new DatabaseSync(path.join(DATA, 'myboutki.db'));
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=3000;
    CREATE TABLE IF NOT EXISTS stores (handle TEXT PRIMARY KEY, uid TEXT NOT NULL, email TEXT, data TEXT NOT NULL, created INTEGER, updated INTEGER, banned INTEGER DEFAULT 0);
    CREATE INDEX IF NOT EXISTS stores_uid ON stores(uid);
    CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, handle TEXT NOT NULL, data TEXT NOT NULL, at INTEGER, updated INTEGER, deleted INTEGER DEFAULT 0, deleted_by TEXT);
    CREATE INDEX IF NOT EXISTS posts_handle ON posts(handle);
    CREATE TABLE IF NOT EXISTS follows (f TEXT NOT NULL, t TEXT NOT NULL, at INTEGER, PRIMARY KEY (f, t));
    CREATE INDEX IF NOT EXISTS follows_t ON follows(t);`);
  const q = sql => db.prepare(sql);
  const J = s => { try { return JSON.parse(s); } catch (_) { return {}; } };

  // ---------- Firebase ID token check (RS256, Google public keys) ----------
  let KEYS = { at: 0, keys: {} };
  async function keys() {
    if (Date.now() - KEYS.at < 3600e3 && Object.keys(KEYS.keys).length) return KEYS.keys;
    const r = await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com', { signal: AbortSignal.timeout(10000) });
    const j = await r.json(); const out = {};
    for (const k of j.keys || []) out[k.kid] = crypto.createPublicKey({ key: k, format: 'jwk' });
    KEYS = { at: Date.now(), keys: out }; return out;
  }
  const b64 = s => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  async function verifyToken(tok) {
    if (process.env.TEST_AUTH === '1' && /^test:[a-z0-9]+$/.test(tok || '')) return { uid: tok.slice(5), email: tok.slice(5) + '@test', name: 'Test' }; // local tests only
    if (!tok || tok.split('.').length !== 3) return null;
    const [h, p, sig] = tok.split('.');
    let head, pay; try { head = JSON.parse(b64(h)); pay = JSON.parse(b64(p)); } catch (_) { return null; }
    if (head.alg !== 'RS256') return null;
    const k = (await keys())[head.kid]; if (!k) return null;
    if (!crypto.verify('RSA-SHA256', Buffer.from(h + '.' + p), k, b64(sig))) return null;
    const now = Date.now() / 1000;
    if (pay.aud !== PROJECT || pay.iss !== 'https://securetoken.google.com/' + PROJECT || !pay.sub || pay.exp < now || pay.iat > now + 300) return null;
    return { uid: pay.sub, email: (pay.email || '').toLowerCase(), name: pay.name || '' };
  }

  // ---------- helpers ----------
  const HANDLE = /^[a-z0-9._]{3,30}$/;
  const clean = (v, n) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f<>]/g, '').slice(0, n);
  const okUrl = u => typeof u === 'string' && (/^\/u\/[a-f0-9]{32}\.(jpg|png|webp)$/.test(u) || /^\/img\/[a-z0-9_]+\.(jpg|png|svg)$/.test(u));
  const storeOut = r => { const d = J(r.data); return { handle: r.handle, name: d.name, bio: d.bio || '', avatar: d.avatar || null, links: d.links || [], hl: d.hl || [], k: d.k, phone: d.phone || '', cur: d.cur, fc: q('SELECT COUNT(*) n FROM follows WHERE t=?').get(r.handle).n, fg: q('SELECT COUNT(*) n FROM follows WHERE f=?').get(r.handle).n, ver: d.ver && d.ver.status === 'active' ? { status: 'active', until: d.ver.until, plan: d.ver.plan } : (d.ver ? { status: d.ver.status } : null), created: r.created }; };
  const postOut = r => ({ ...J(r.data), id: isNaN(+r.id) ? r.id : +r.id, s: r.handle, at: r.at, synced: 1 });
  const ownerOf = h => q('SELECT uid FROM stores WHERE handle=? AND banned=0').get(h);
  const reserved = h => SAMPLE_HANDLES.includes(h) || /^(admin|myboutki|support|help|api|www|root)$/.test(h);

  function sanitizeStore(b, d = {}) {
    const links = (Array.isArray(b.links) ? b.links : d.links || []).slice(0, 4).map(l => ({ u: /^https?:\/\//.test(l.u || '') ? clean(l.u, 300) : '', t: clean(l.t, 30) })).filter(l => l.u);
    const hl = (Array.isArray(b.hl) ? b.hl : d.hl || []).slice(0, 30).map(x => ({ id: +x.id || Date.now(), name: clean(x.name, 15), cover: okUrl(x.cover) ? x.cover : null, items: (Array.isArray(x.items) ? x.items : []).slice(0, 100).map(String) }));
    return { ...d, name: clean(b.name ?? d.name, 60), bio: clean(b.bio ?? d.bio, 150), avatar: b.avatar === null ? null : okUrl(b.avatar) ? b.avatar : d.avatar || null, links, hl,
      k: /^(KW|SA|AE|BH|QA|OM)$/.test(b.k) ? b.k : d.k || 'KW', phone: clean(b.phone ?? d.phone, 24), cur: /^(KWD|SAR|AED|BHD|QAR|OMR)$/.test(b.cur) ? b.cur : d.cur || 'KWD' };
  }
  function sanitizePost(b, d = {}) {
    const imgs = (Array.isArray(b.imgs) ? b.imgs : d.imgs || []).filter(okUrl).slice(0, 10);
    const cur = /^(KWD|SAR|AED|BHD|QAR|OMR)$/.test(b.cur) ? b.cur : d.cur || null, po = b.po != null && isFinite(+b.po) ? Math.max(0, Math.min(1e8, +b.po)) : d.po ?? null;
    return { ...d, h: clean(b.h ?? d.h, 120), d: clean(b.d ?? d.d, 2200), p: Math.max(0, Math.min(1e7, +b.p || +d.p || 0)), cur, po, c: clean(b.c ?? d.c, 40), imgs,
      ic: clean(b.ic ?? d.ic, 30), bg: clean(b.bg ?? d.bg, 12), fg: clean(b.fg ?? d.fg, 12), l: Math.max(0, +d.l || 0),
      sold: !!(b.sold ?? d.sold), soldAt: b.sold ? (+b.soldAt || d.soldAt || Date.now()) : null, soldPrice: b.sold ? (+b.soldPrice || d.soldPrice || null) : null, rp: +b.rp || d.rp || null,
      boost: d.boost || null }; // boosts are only set by the payment check, never by the browser
  }

  // ---------- API ----------
  async function handle(req, res, url, { json, readBody, readRaw, isAdmin, origin }) {
    const p = url.pathname;
    const auth = async () => { const m = /^Bearer (.+)$/.exec(req.headers.authorization || ''); return m ? verifyToken(m[1]) : null; };

    if (p === '/api/feed' && req.method === 'GET') {
      const stores = q('SELECT * FROM stores WHERE banned=0').all().map(storeOut);
      const posts = q('SELECT p.* FROM posts p JOIN stores s ON s.handle=p.handle WHERE p.deleted=0 AND s.banned=0 ORDER BY p.at DESC LIMIT 1000').all().map(postOut);
      return json(res, 200, { stores, posts, at: Date.now() }, origin), true;
    }
    if (p === '/api/handle' && req.method === 'GET') {
      const h = String(url.searchParams.get('h') || '').toLowerCase();
      return json(res, 200, { available: HANDLE.test(h) && !reserved(h) && !q('SELECT 1 FROM stores WHERE handle=?').get(h) }, origin), true;
    }
    if (p === '/api/me' && req.method === 'GET') {
      const u = await auth(); if (!u) return json(res, 401, { error: 'Please sign in again' }, origin), true;
      const stores = q('SELECT * FROM stores WHERE uid=? AND banned=0 ORDER BY created').all(u.uid).map(r => ({ ...storeOut(r), email: r.email }));
      const hs = stores.map(s => s.handle);
      const posts = hs.length ? q(`SELECT * FROM posts WHERE deleted=0 AND handle IN (${hs.map(() => '?').join(',')})`).all(...hs).map(postOut) : [];
      const removed = hs.length ? q(`SELECT id FROM posts WHERE deleted=1 AND handle IN (${hs.map(() => '?').join(',')})`).all(...hs).map(r => isNaN(+r.id) ? r.id : +r.id) : [];
      return json(res, 200, { user: u, stores, posts, removed }, origin), true;
    }
    if (p === '/api/stores' && req.method === 'POST') {
      const u = await auth(); if (!u) return json(res, 401, { error: 'Please sign in again' }, origin), true;
      const b = await readBody(req), h = String(b.handle || '').toLowerCase();
      if (!HANDLE.test(h) || reserved(h)) return json(res, 400, { error: 'Pick a different username' }, origin), true;
      if (q('SELECT 1 FROM stores WHERE handle=?').get(h)) return json(res, 409, { error: 'That username is taken' }, origin), true;
      if (q('SELECT COUNT(*) n FROM stores WHERE uid=?').get(u.uid).n >= 10) return json(res, 400, { error: 'You can have up to 10 stores' }, origin), true;
      const now = Date.now();
      q('INSERT INTO stores(handle,uid,email,data,created,updated) VALUES(?,?,?,?,?,?)').run(h, u.uid, u.email, JSON.stringify(sanitizeStore(b)), now, now);
      return json(res, 200, { ok: true, store: storeOut(q('SELECT * FROM stores WHERE handle=?').get(h)) }, origin), true;
    }
    let m;
    // ---------- follows ----------
    if (p === '/api/follows' && req.method === 'GET') {
      const h = String(url.searchParams.get('h') || '').toLowerCase();
      if (!HANDLE.test(h)) return json(res, 400, { error: 'Bad handle' }, origin), true;
      const followers = q("SELECT f.f h FROM follows f LEFT JOIN stores s ON s.handle=f.f WHERE f.t=? AND COALESCE(s.banned,0)=0 ORDER BY f.at DESC LIMIT 2000").all(h).map(r => r.h);
      const following = q("SELECT f.t h FROM follows f LEFT JOIN stores s ON s.handle=f.t WHERE f.f=? AND COALESCE(s.banned,0)=0 ORDER BY f.at DESC LIMIT 2000").all(h).map(r => r.h);
      return json(res, 200, { followers, following }, origin), true;
    }
    if ((m = /^\/api\/follows\/([a-z0-9._]+)$/.exec(p)) && (req.method === 'PUT' || req.method === 'DELETE')) {
      const u = await auth(); if (!u) return json(res, 401, { error: 'Please sign in again' }, origin), true;
      const from = String(url.searchParams.get('from') || '').toLowerCase(), remove = url.searchParams.get('remove') === '1';
      const own = q('SELECT 1 FROM stores WHERE handle=? AND uid=?').get(from, u.uid);
      if (!own) return json(res, 403, { error: 'Not your store' }, origin), true;
      if (remove) { // remove one of my followers: m[1] follows `from`
        q('DELETE FROM follows WHERE f=? AND t=?').run(m[1], from);
      } else if (req.method === 'PUT') {
        if (m[1] === from || !HANDLE.test(m[1])) return json(res, 400, { error: 'Can\'t follow that' }, origin), true;
        if (q('SELECT COUNT(*) n FROM follows WHERE f=?').get(from).n >= 7500) return json(res, 400, { error: 'Following limit reached' }, origin), true;
        q('INSERT OR IGNORE INTO follows(f,t,at) VALUES(?,?,?)').run(from, m[1], Date.now());
      } else q('DELETE FROM follows WHERE f=? AND t=?').run(from, m[1]);
      return json(res, 200, { ok: true }, origin), true;
    }
    if ((m = /^\/api\/stores\/([a-z0-9._]+)$/.exec(p)) && req.method === 'PUT') {
      const u = await auth(); if (!u) return json(res, 401, { error: 'Please sign in again' }, origin), true;
      const r = q('SELECT * FROM stores WHERE handle=?').get(m[1]);
      if (!r || r.uid !== u.uid) return json(res, 403, { error: 'Not your shop' }, origin), true;
      const b = await readBody(req), d = sanitizeStore(b, J(r.data)), nh = String(b.handle || m[1]).toLowerCase(), now = Date.now();
      if (nh !== m[1]) {
        if (!HANDLE.test(nh) || reserved(nh) || q('SELECT 1 FROM stores WHERE handle=?').get(nh)) return json(res, 409, { error: 'That username is taken' }, origin), true;
        db.exec('BEGIN'); try { q('UPDATE stores SET handle=?,data=?,updated=? WHERE handle=?').run(nh, JSON.stringify(d), now, m[1]); q('UPDATE posts SET handle=? WHERE handle=?').run(nh, m[1]); q('UPDATE OR IGNORE follows SET f=? WHERE f=?').run(nh, m[1]); q('UPDATE OR IGNORE follows SET t=? WHERE t=?').run(nh, m[1]); db.exec('COMMIT'); } catch (e) { db.exec('ROLLBACK'); throw e; }
      } else q('UPDATE stores SET data=?,updated=? WHERE handle=?').run(JSON.stringify(d), now, m[1]);
      return json(res, 200, { ok: true, store: storeOut(q('SELECT * FROM stores WHERE handle=?').get(nh)) }, origin), true;
    }
    if ((m = /^\/api\/posts\/([0-9a-zA-Z_-]{1,40})$/.exec(p)) && (req.method === 'PUT' || req.method === 'DELETE')) {
      const u = await auth(); if (!u) return json(res, 401, { error: 'Please sign in again' }, origin), true;
      const cur = q('SELECT * FROM posts WHERE id=?').get(m[1]);
      if (req.method === 'DELETE') {
        if (!cur) return json(res, 200, { ok: true }, origin), true;
        const o = ownerOf(cur.handle); if (!o || o.uid !== u.uid) return json(res, 403, { error: 'Not your post' }, origin), true;
        q('UPDATE posts SET deleted=1,deleted_by=?,updated=? WHERE id=?').run('owner', Date.now(), m[1]); return json(res, 200, { ok: true }, origin), true;
      }
      const b = await readBody(req), h = String(b.s || '').toLowerCase(), o = ownerOf(h);
      if (!o || o.uid !== u.uid) return json(res, 403, { error: 'Not your shop' }, origin), true;
      if (cur && cur.deleted) return json(res, 410, { error: 'This post was removed', removed: true }, origin), true;
      if (cur) { const co = ownerOf(cur.handle); if (!co || co.uid !== u.uid) return json(res, 403, { error: 'Not your post' }, origin), true; }
      if (!cur && q('SELECT COUNT(*) n FROM posts WHERE handle=? AND deleted=0').get(h).n >= 2000) return json(res, 400, { error: 'Too many posts' }, origin), true;
      const d = sanitizePost(b, cur ? J(cur.data) : {}); if (!d.imgs.length) return json(res, 400, { error: 'Add at least one photo' }, origin), true;
      const at = cur ? (b.rp && +b.at ? Math.min(Date.now(), +b.at) : cur.at) : Math.min(Date.now(), +b.at || Date.now());
      if (cur) q('UPDATE posts SET handle=?,data=?,at=?,updated=? WHERE id=?').run(h, JSON.stringify(d), at, Date.now(), m[1]);
      else q('INSERT INTO posts(id,handle,data,at,updated) VALUES(?,?,?,?,?)').run(m[1], h, JSON.stringify(d), at, Date.now());
      return json(res, 200, { ok: true, post: postOut(q('SELECT * FROM posts WHERE id=?').get(m[1])) }, origin), true;
    }
    if (p === '/api/upload' && req.method === 'POST') {
      const u = await auth(); if (!u) return json(res, 401, { error: 'Please sign in again' }, origin), true;
      const buf = await readRaw(req, 6 * 1024 * 1024);
      const ext = buf[0] === 0xff && buf[1] === 0xd8 ? 'jpg' : buf.slice(0, 8).toString('hex') === '89504e470d0a1a0a' ? 'png' : buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP' ? 'webp' : null;
      if (!ext) return json(res, 400, { error: 'Photos must be JPG, PNG or WebP' }, origin), true;
      const name = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 32) + '.' + ext;
      const f = path.join(IMG, name); if (!fs.existsSync(f)) fs.writeFileSync(f, buf, { mode: 0o644 });
      return json(res, 200, { url: '/u/' + name }, origin), true;
    }

    // link previews (WhatsApp, Instagram, Google) for posts and shops that have no static page
    if ((m = /^\/(p\/([0-9]{1,20})(?:-[^/]*)?|@([a-z0-9._]{3,30}))\/?$/.exec(p)) && req.method === 'GET') {
      let html; try { html = fs.readFileSync(process.env.SITE_INDEX || '/site/index.html', 'utf8'); } catch (_) { return false; }
      const e = t => String(t || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      let title, desc, img, link, ld;
      if (m[2]) { const r = q('SELECT p.*, s.data sd FROM posts p JOIN stores s ON s.handle=p.handle WHERE p.id=? AND p.deleted=0 AND s.banned=0').get(m[2]); if (!r) { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }); res.end(html); return true; }
        const d = J(r.data), sd = J(r.sd), dec = { KWD: 3, BHD: 3, OMR: 3 }[d.cur] ?? 2, price = d.cur && d.po != null ? d.cur + ' ' + (+d.po).toFixed(d.cur ? dec : 3) : 'KWD ' + (+d.p || 0).toFixed(3);
        title = `${d.h} – ${price} | ${sd.name || r.handle} on myboutki`; desc = `${d.d} Order on WhatsApp from @${r.handle}.`.slice(0, 300); img = d.imgs && d.imgs[0]; link = `https://myboutki.com/p/${r.id}`;
        ld = { '@context': 'https://schema.org', '@type': 'Product', name: d.h, description: d.d, image: (d.imgs || []).map(u => 'https://myboutki.com' + u), category: d.c, offers: { '@type': 'Offer', url: link, price: d.cur && d.po != null ? (+d.po).toFixed(dec) : (+d.p || 0).toFixed(3), priceCurrency: d.cur && d.po != null ? d.cur : 'KWD', availability: d.sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock' } };
      } else { const r = q('SELECT * FROM stores WHERE handle=? AND banned=0').get(m[3]); if (!r) { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }); res.end(html); return true; } const d = J(r.data);
        const first = q('SELECT data FROM posts WHERE handle=? AND deleted=0 ORDER BY at DESC LIMIT 1').get(r.handle);
        title = `${d.name} (@${r.handle}) on myboutki`; desc = (d.bio || `Shop ${d.name} on myboutki. Order on WhatsApp.`).slice(0, 300); img = d.avatar || (first && (J(first.data).imgs || [])[0]); link = `https://myboutki.com/@${r.handle}`;
        ld = { '@context': 'https://schema.org', '@type': 'Store', name: d.name, url: link };
      }
      const abs = img ? 'https://myboutki.com' + img : 'https://myboutki.com/img/og.jpg?v=3';
      html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${e(title)}</title>`)
        .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${e(desc)}">`)
        .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${link}">`)
        .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${e(title)}">`)
        .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${e(desc)}">`)
        .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${link}">`)
        .replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${abs}">`)
        .replace(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${abs}">`)
        .replace('</head>', `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script></head>`);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }); res.end(html); return true;
    }

    // ---------- admin ----------
    if (p.startsWith('/api/admin/db/')) {
      if (!isAdmin(req)) return json(res, 401, { error: 'Please sign in' }), true;
      if (p === '/api/admin/db/stores') return json(res, 200, q('SELECT * FROM stores ORDER BY created DESC').all().map(r => ({ ...storeOut(r), email: r.email, banned: !!r.banned, posts: q('SELECT COUNT(*) n FROM posts WHERE handle=? AND deleted=0').get(r.handle).n, updated: r.updated }))), true;
      if (p === '/api/admin/db/posts') return json(res, 200, q('SELECT * FROM posts WHERE deleted=0 ORDER BY at DESC LIMIT 1000').all().map(postOut)), true;
      if ((m = /^\/api\/admin\/db\/posts\/([0-9a-zA-Z_-]{1,40})$/.exec(p)) && req.method === 'DELETE') { q("UPDATE posts SET deleted=1,deleted_by='admin',updated=? WHERE id=?").run(Date.now(), m[1]); return json(res, 200, { ok: true }), true; }
      if ((m = /^\/api\/admin\/db\/stores\/([a-z0-9._]+)\/(ban|unban)$/.exec(p)) && req.method === 'POST') { q('UPDATE stores SET banned=?,updated=? WHERE handle=?').run(m[2] === 'ban' ? 1 : 0, Date.now(), m[1]); return json(res, 200, { ok: true }), true; }
      return json(res, 404, { error: 'Not found' }), true;
    }
    return false;
  }

  // called by the payment check once MyFatoorah confirms a payment
  function applyPaid({ product, handle, post, days, invoiceId, daily, countries, goal }) {
    const now = Date.now();
    if (/^verified-/.test(product || '')) {
      const r = q('SELECT * FROM stores WHERE handle=?').get(handle); if (!r) return;
      const d = J(r.data), v = d.ver || {}; if ((v.paid || []).includes(String(invoiceId))) return;
      const from = v.status === 'active' && v.until > now ? v.until : now;
      d.ver = { ...v, status: 'active', plan: product.split('-')[1], since: v.since || now, until: from + days * 864e5, paid: [...(v.paid || []), String(invoiceId)] };
      q('UPDATE stores SET data=?,updated=? WHERE handle=?').run(JSON.stringify(d), now, handle);
    } else if (product === 'boost' && post) {
      const r = q('SELECT * FROM posts WHERE id=? AND handle=?').get(String(post), handle); if (!r) return;
      const d = J(r.data), b = d.boost || {}; if ((b.paid || []).includes(String(invoiceId))) return;
      const from = b.until > now ? b.until : now;
      d.boost = { until: from + days * 864e5, cc: countries || [], daily, goal, paid: [...(b.paid || []), String(invoiceId)] };
      q('UPDATE posts SET data=?,updated=? WHERE id=?').run(JSON.stringify(d), now, r.id);
    }
  }
  const counts = () => ({ stores: q('SELECT COUNT(*) n FROM stores').get().n, posts: q('SELECT COUNT(*) n FROM posts WHERE deleted=0').get().n });
  return { handle, applyPaid, counts, verifyToken };
};
