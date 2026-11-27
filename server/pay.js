// myboutiki payment service (MyFatoorah v3). No dependencies; Node 18+.
// The secret key comes ONLY from the MF_API_KEY environment variable. Never commit it.
'use strict';
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const DATA = process.env.DATA_DIR || '/data';
try { fs.mkdirSync(DATA, { recursive: true }); } catch (_) {}
// Admin login lives in /data/admin.json (created once from the admin page with a one-time setup code).
const ADMIN_FILE = path.join(DATA, 'admin.json');
const readAdmin = () => { try { return JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8')); } catch (_) { return null; } };
const SETUP_SHA_ENV = process.env.SETUP_CODE_SHA256 || '';
const setupSha = () => { try { return fs.readFileSync(path.join(DATA, 'setup.sha'), 'utf8').trim() || SETUP_SHA_ENV; } catch (_) { return SETUP_SHA_ENV; } };
const KEY_FILE = path.join(DATA, 'secret.key');
let SECRET = process.env.SESSION_SECRET || '';
if (!SECRET) { try { SECRET = fs.readFileSync(KEY_FILE, 'utf8').trim(); } catch (_) {} if (!SECRET) { SECRET = crypto.randomBytes(32).toString('hex'); try { fs.writeFileSync(KEY_FILE, SECRET, { mode: 0o600 }); } catch (_) {} } }
const hashPass = pw => { const salt = crypto.randomBytes(16).toString('hex'); return 'scrypt$' + salt + '$' + crypto.scryptSync(String(pw), salt, 64).toString('hex'); };

const API = process.env.MF_API_URL || 'https://api.myfatoorah.com';
const KEY = process.env.MF_API_KEY || '';
const SITE = process.env.SITE_URL || 'https://myboutiki.com';
const SESSION_JS = process.env.MF_SESSION_JS || 'https://portal.myfatoorah.com/sessions/v1/session.js';
const SESS = new Map();
const makeDb = require('./db.js');
const PORT = +process.env.PORT || 8080;

// Everything that can be paid for. Prices are decided here on the server, never by the browser.
// usd = price shown to users, kwd = amount actually charged (MyFatoorah Kuwait charges in KWD).
// To sell something new later, add a line here.
// ---- Prices and settings, editable from the admin page (saved in /data/config.json) ----
const DEFAULT_CONFIG = {
  verified: { monthlyUsd: 18, yearlyUsd: 180, monthlyKwd: 5.5, yearlyKwd: 55 },
  boost: { usdToKwd: 0.31, minDaily: 1, maxDaily: 100, days: [1, 3, 7, 14, 30] },
  placements: { google: { usd: 5, days: 7 }, explore: { usd: 12, days: 7 }, home: { usd: 12, days: 7 } },
  showSamples: true,
};
const CFG_FILE = path.join(DATA, 'config.json');
let CONFIG = DEFAULT_CONFIG;
try { CONFIG = { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(CFG_FILE, 'utf8')) }; } catch (_) {}
if (!CONFIG.placements) CONFIG.placements = DEFAULT_CONFIG.placements;
const PLACES = ['google', 'explore', 'home'];
const num = (v, lo, hi) => { v = +v; return Number.isFinite(v) && v >= lo && v <= hi ? Math.round(v * 1000) / 1000 : null; };
function setConfig(c) {
  const v = c.verified || {}, b = c.boost || {};
  const next = {
    verified: { monthlyUsd: num(v.monthlyUsd, 0.5, 10000), yearlyUsd: num(v.yearlyUsd, 0.5, 100000), monthlyKwd: num(v.monthlyKwd, 0.1, 5000), yearlyKwd: num(v.yearlyKwd, 0.1, 50000) },
    boost: { usdToKwd: num(b.usdToKwd, 0.05, 2), minDaily: num(b.minDaily, 1, 1000), maxDaily: num(b.maxDaily, 1, 10000), days: [...new Set((Array.isArray(b.days) ? b.days : []).map(d => Math.round(+d)).filter(d => d >= 1 && d <= 365))].sort((a, z) => a - z) },
  };
  for (const g of ['verified', 'boost']) for (const [k, val] of Object.entries(next[g])) if (val === null || (Array.isArray(val) && !val.length)) throw new Error('Check ' + g + ' ' + k);
  if (next.boost.minDaily > next.boost.maxDaily) throw new Error('Minimum daily budget is above the maximum');
  const pl = c.placements || CONFIG.placements || DEFAULT_CONFIG.placements; next.placements = {};
  for (const k of PLACES) { const o = pl[k] || DEFAULT_CONFIG.placements[k]; const u = num(o.usd, 0.5, 10000), d = num(o.days, 1, 365); if (u === null || d === null) throw new Error('Check ' + k + ' price and days'); next.placements[k] = { usd: u, days: Math.round(d) }; }
  next.showSamples = c.showSamples === undefined ? CONFIG.showSamples !== false : !!c.showSamples;
  CONFIG = next; fs.writeFileSync(CFG_FILE, JSON.stringify(CONFIG, null, 2));
}
const products = () => ({
  'verified-monthly': { name: 'myboutiki Verified · Monthly', usd: CONFIG.verified.monthlyUsd, kwd: CONFIG.verified.monthlyKwd, days: 30 },
  'verified-yearly': { name: 'myboutiki Verified · Yearly', usd: CONFIG.verified.yearlyUsd, kwd: CONFIG.verified.yearlyKwd, days: 365 },
});

// Boosts: price = daily budget (USD) x days, worked out here. Only the app's 6 Gulf countries can be targeted.
const GCC = ['KW', 'SA', 'AE', 'BH', 'QA', 'OM'], GOALS = ['visits', 'messages', 'views'];
const toKwd = usd => Math.ceil(usd * CONFIG.boost.usdToKwd * 1000) / 1000;

// ---- small append-only logs ----
const logTo = (f, o) => fs.appendFile(path.join(DATA, f), JSON.stringify(o) + '\n', () => {});
const readLog = (f, since) => { try { return fs.readFileSync(path.join(DATA, f), 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch (_) { return null; } }).filter(o => o && (!since || o.t >= since)); } catch (_) { return []; } };
const DB = makeDb({ DATA, SAMPLE_HANDLES: ['noor.abayas', 'cheetah.watches', 'q8.menswear', 'thepinkstore'] });
const paidSeen = new Set(readLog('payments.jsonl').map(p => String(p.invoiceId)));

// ---- admin login (signed cookie) ----
const sign = v => crypto.createHmac('sha256', SECRET).update(v).digest('hex');
const makeSession = () => { const exp = Date.now() + 7 * 864e5, v = 'admin.' + exp; return v + '.' + sign(v); };
const isAdmin = req => { const m = /(?:^|;\s*)mb_admin=([^;]+)/.exec(req.headers.cookie || ''); if (!m) return false; const parts = decodeURIComponent(m[1]).split('.'); if (parts.length !== 3) return false; const v = parts[0] + '.' + parts[1], sig = sign(v); return +parts[1] > Date.now() && sig.length === parts[2].length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(parts[2])); };
const checkPass = pw => { const a = readAdmin(); if (!a) return false; const [alg, salt, hash] = String(a.hash || '').split('$'); if (alg !== 'scrypt' || !salt || !hash) return false; const h = crypto.scryptSync(String(pw), salt, 64).toString('hex'); return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(hash)); };
const loginTries = new Map();
const ORIGINS = new Set([SITE, 'https://www.myboutiki.com', 'https://myboutki.com', 'https://www.myboutki.com']);
const PRODUCTS = new Proxy({}, { get: (_, k) => products()[k], ownKeys: () => Object.keys(products()), getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }) });
const json = (res, code, body, origin) => {
  const h = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  if (origin && (ORIGINS.has(origin) || /^https:\/\/[a-z0-9-]+\.claudeusercontent\.com$/.test(origin))) {
    h['Access-Control-Allow-Origin'] = origin; h['Vary'] = 'Origin';
    h['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'; h['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
  }
  res.writeHead(code, h); res.end(body === null ? '' : JSON.stringify(body));
};
const mf = async (method, path, body) => {
  const r = await fetch(API + path, {
    method, headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(20000),
  });
  let j = null; try { j = await r.json(); } catch (_) {}
  return { ok: r.ok && j && j.IsSuccess, status: r.status, j };
};
const readBody = req => new Promise((ok, no) => {
  let s = ''; req.on('data', c => { s += c; if (s.length > 60000) { no(new Error('too big')); req.destroy(); } });
  req.on('end', () => { try { ok(s ? JSON.parse(s) : {}); } catch (e) { no(e); } });
});
const readRaw = (req, max) => new Promise((ok, no) => { const parts = []; let n = 0; req.on('data', c => { n += c.length; if (n > max) { no(new Error('too big')); req.destroy(); } else parts.push(c); }); req.on('end', () => ok(Buffer.concat(parts))); });
const clean = (v, n) => String(v || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n);

// small in-memory rate limit: 20 creates per IP per 10 minutes
const hits = new Map();
const limited = ip => { const now = Date.now(), a = (hits.get(ip) || []).filter(t => now - t < 6e5); a.push(now); hits.set(ip, a); return a.length > 20; };

http.createServer(async (req, res) => {
  const origin = req.headers.origin, url = new URL(req.url, 'http://x');
  try {
    if (req.method === 'OPTIONS') return json(res, 204, null, origin);
    if (url.pathname === '/api/pay/health') {
      // checks the key is accepted by MyFatoorah without creating anything (looks up a payment that does not exist)
      let auth = 'unknown';
      try { const r = await fetch(API + '/v3/payments/100000', { headers: { Authorization: 'Bearer ' + KEY }, signal: AbortSignal.timeout(15000) }); auth = r.status === 401 || r.status === 403 ? 'rejected' : 'accepted (' + r.status + ')'; } catch (e) { auth = 'unreachable'; }
      let methods = null;
      if (url.searchParams.get('methods') === '1') { try { const r = await fetch(API + '/v2/InitiatePayment', { method: 'POST', headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ InvoiceAmount: 5, CurrencyIso: 'KWD' }), signal: AbortSignal.timeout(15000) }); const j = await r.json(); methods = j && j.Data && j.Data.PaymentMethods ? j.Data.PaymentMethods.map(m => m.PaymentMethodEn + ' (' + m.PaymentMethodCode + ')') : (j && j.Message) || r.status; } catch (e) { methods = 'error'; } }
      return json(res, 200, { ok: true, configured: !!KEY, key: auth, methods, products: Object.keys(PRODUCTS), db: DB.counts() }, origin);
    }

    if (url.pathname === '/api/pay/products' && req.method === 'GET')
      return json(res, 200, Object.fromEntries(Object.entries(PRODUCTS).map(([k, p]) => [k, { name: p.name, usd: p.usd, kwd: p.kwd }])), origin);

    if ((url.pathname === '/api/pay/create' || url.pathname === '/api/pay/session') && req.method === 'POST') {
      const ip = req.headers['x-real-ip'] || req.socket.remoteAddress;
      if (limited(ip)) return json(res, 429, { error: 'Too many attempts. Try again in a few minutes.' }, origin);
      const b = await readBody(req), embedded = url.pathname === '/api/pay/session';
      let p = PRODUCTS[b.product], extra = [];
      if (b.product === 'boost' && PLACES.includes(b.placement)) {
        const cc = [...new Set((Array.isArray(b.countries) ? b.countries : []).filter(c => GCC.includes(c)))];
        const goal = GOALS.includes(b.goal) ? b.goal : 'views', pc = CONFIG.placements[b.placement];
        if (!cc.length) return json(res, 400, { error: 'Pick at least one country' }, origin);
        p = { name: { google: 'Google Search', explore: 'Top of Explore', home: 'Top of Home' }[b.placement] + ` · ${pc.days} days`, usd: pc.usd, kwd: toKwd(pc.usd), days: pc.days, post: true };
        extra = [pc.days, 0, cc.join('.'), goal, b.placement];
      } else if (b.product === 'boost') {
        const daily = Math.round(+b.daily), days = +b.days;
        const cc = [...new Set((Array.isArray(b.countries) ? b.countries : []).filter(c => GCC.includes(c)))];
        const goal = GOALS.includes(b.goal) ? b.goal : 'views';
        if (!(daily >= CONFIG.boost.minDaily && daily <= CONFIG.boost.maxDaily) || !CONFIG.boost.days.includes(days) || !cc.length) return json(res, 400, { error: 'Check the budget, duration and countries' }, origin);
        const usd = daily * days;
        p = { name: `Boost post · ${days} days`, usd, kwd: toKwd(usd), days, post: true };
        extra = [days, daily, cc.join('.'), goal];
      }
      if (!p) return json(res, 400, { error: 'Unknown product' }, origin);
      const handle = clean(b.handle, 40).toLowerCase().replace(/[^a-z0-9._]/g, '');
      if (!handle) return json(res, 400, { error: 'Missing shop' }, origin);
      const post = String(b.post || '').replace(/[^0-9a-zA-Z_-]/g, '').slice(0, 40);
      if (p.post && !post) return json(res, 400, { error: 'Missing post' }, origin);
      const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email || '') ? clean(b.email, 100) : undefined;
      const order = { Amount: p.kwd, Currency: 'KWD', ExternalIdentifier: [b.product, handle, p.post ? post : '', ...extra].join('|') };
      if (embedded) {
        // Payment form shown inside our own page (no MyFatoorah invoice page)
        const body = { PaymentMode: 'COMPLETE_PAYMENT', OperationType: 'PAY', Order: order,
          Customer: { Name: clean(b.name, 60) || handle, Email: email, Reference: handle },
          IntegrationUrls: { Redirection: `${SITE}/pay/return` },
          Language: b.lang === 'ar' ? 'AR' : 'EN',
          SupportedPaymentMethods: (process.env.PAY_METHODS || 'card,applepay,googlepay').split(',') };
        let r = await mf('POST', '/v3/sessions', body);
        if (!r.ok || !r.j || !r.j.Data || !r.j.Data.SessionId) {
          console.error('session failed', r.status, JSON.stringify(r.j && (r.j.Message || r.j.ValidationErrors)));
          r = await mf('POST', '/v3/sessions', { PaymentMode: 'COMPLETE_PAYMENT', Order: order });
        }
        if (!r.ok || !r.j || !r.j.Data || !r.j.Data.SessionId) {
          console.error('session failed (minimal)', r.status, JSON.stringify(r.j && (r.j.Message || r.j.ValidationErrors)));
          return json(res, 502, { error: 'Payment service unavailable. Please try again.' }, origin);
        }
        const d = r.j.Data;
        SESS.set(d.SessionId, { key: d.EncryptionKey || '', at: Date.now() });
        for (const [k, v] of SESS) if (Date.now() - v.at > 3 * 3600e3) SESS.delete(k);
        return json(res, 200, { sessionId: d.SessionId, script: SESSION_JS, amount: p.kwd, currency: 'KWD', usd: p.usd, name: p.name }, origin);
      }
      const r = await mf('POST', '/v3/payments', {
        Order: order,
        Customer: { Name: clean(b.name, 60) || handle, Email: email, Reference: handle },
        IntegrationUrls: { Redirection: `${SITE}/pay/return` },
        Language: b.lang === 'ar' ? 'AR' : 'EN',
        NotificationOption: 'LINK',
        // Cards from any country + Apple Pay + Google Pay (no KNET-only checkout)
        DisplayPaymentMethods: (process.env.PAY_METHODS || 'card,applepay,googlepay').split(','),
      });
      if (!r.ok || !r.j.Data || !r.j.Data.PaymentURL) {
        console.error('create failed', r.status, JSON.stringify(r.j && (r.j.Message || r.j.ValidationErrors)));
        return json(res, 502, { error: 'Payment service unavailable. Please try again.' }, origin);
      }
      return json(res, 200, { url: r.j.Data.PaymentURL, invoiceId: r.j.Data.InvoiceId }, origin);
    }

    if (url.pathname === '/api/pay/session-result' && req.method === 'POST') {
      const b = await readBody(req), sid = String(b.sessionId || ''), ss = SESS.get(sid);
      let id = String(b.paymentId || '').replace(/[^0-9]/g, '');
      if (!id && ss && ss.key && b.paymentData) {
        try {
          const k = Buffer.from(String(ss.key).slice(0, 16), 'utf8');
          const dc = crypto.createDecipheriv('aes-128-cbc', k, k);
          const txt = Buffer.concat([dc.update(Buffer.from(String(b.paymentData), 'base64')), dc.final()]).toString('utf8');
          const pd = JSON.parse(txt), t = pd.Transaction || pd.transaction || {};
          id = String(t.PaymentId || t.paymentId || pd.PaymentId || '').replace(/[^0-9]/g, '');
        } catch (e) { console.error('decrypt', e.message, 'len', String(b.paymentData).length); }
      }
      if (!/^[0-9]{6,40}$/.test(id)) { console.error('session-result: no payment id', sid, Object.keys(b)); return json(res, 400, { paid: false, error: 'Could not confirm the payment yet' }, origin); }
      url.searchParams.set('paymentId', id);
      return payStatus(id);
    }
    if (url.pathname === '/api/pay/status' && req.method === 'GET') {
      const id = url.searchParams.get('paymentId') || '';
      if (!/^[0-9]{6,40}$/.test(id)) return json(res, 400, { error: 'Bad payment id' }, origin);
      return payStatus(id);
    }
    async function payStatus(id) {
      const r = await mf('GET', '/v3/payments/' + id);
      if (!r.ok || !r.j.Data) return json(res, 404, { paid: false, error: 'Payment not found' }, origin);
      const d = r.j.Data, inv = d.Invoice || {}, tr = d.Transaction || {};
      const [product, handle, post, bDays, bDaily, bCc, bGoal, bPl] = String(inv.ExternalIdentifier || '').split('|');
      const paid = String(inv.Status).toUpperCase() === 'PAID' && String(tr.Status).toUpperCase() === 'SUCCESS';
      const p = PRODUCTS[product] || (product === 'boost' ? { days: +bDays || 0 } : null);
      if (paid) { try { DB.applyPaid({ product, handle, post, days: p ? p.days : 0, invoiceId: inv.Id, daily: +bDaily || null, countries: bCc ? bCc.split('.') : [], goal: bGoal || null, placement: PLACES.includes(bPl) ? bPl : null }); } catch (e) { console.error('applyPaid', e.message); } }
      if (paid && inv.Id && !paidSeen.has(String(inv.Id))) { paidSeen.add(String(inv.Id)); logTo('payments.jsonl', { t: Date.now(), invoiceId: inv.Id, product, handle, post: post || null, amount: d.Amount ? d.Amount.ValueInBaseCurrency : null, currency: d.Amount ? d.Amount.BaseCurrency : null, method: tr.PaymentMethod || null }); }
      return json(res, 200, { paid, status: inv.Status, product, handle, post: post || null, daily: +bDaily || null, countries: bCc ? bCc.split('.') : [], goal: bGoal || null, placement: PLACES.includes(bPl) ? bPl : null, paymentId: id, days: p ? p.days : 0, invoiceId: inv.Id, amount: d.Amount ? d.Amount.ValueInBaseCurrency : null, currency: d.Amount ? d.Amount.BaseCurrency : null }, origin);
    }
    // shops, posts and photos
    if (await DB.handle(req, res, url, { json, readBody, readRaw, isAdmin, origin })) return;

    // public settings for the app and website
    if (url.pathname === '/api/config' && req.method === 'GET') return json(res, 200, CONFIG, origin);

    // analytics: tiny anonymous events (no names, no emails)
    if (url.pathname === '/api/t' && req.method === 'POST') {
      const ip = req.headers['x-real-ip'] || req.socket.remoteAddress || '';
      let b = {}; try { b = await readBody(req); } catch (_) {}
      const list = Array.isArray(b) ? b.slice(0, 20) : [b];
      const day = new Date().toISOString().slice(0, 10), vid = crypto.createHash('sha256').update(SECRET + day + ip + (req.headers['user-agent'] || '')).digest('hex').slice(0, 12);
      const mob = /Mobi|Android|iPhone/i.test(req.headers['user-agent'] || '');
      for (const e of list) { if (!e || typeof e.e !== 'string') continue; logTo('events.jsonl', { t: Date.now(), v: vid, m: mob ? 1 : 0, e: clean(e.e, 30), k: clean(e.k, 80), c: clean(e.c, 40), s: clean(e.s, 40), l: clean(e.l, 4), cc: clean(e.cc, 4), src: clean(e.src, 12) }); }
      return json(res, 204, null, origin);
    }

    // per-shop numbers for the seller's own dashboard (counts only, nothing personal)
    if (url.pathname === '/api/shop-stats' && req.method === 'GET') {
      const shop = clean(url.searchParams.get('shop'), 40).toLowerCase();
      if (!/^[a-z0-9._]{2,40}$/.test(shop)) return json(res, 400, { error: 'Bad shop' }, origin);
      const days = Math.min(90, Math.max(7, +url.searchParams.get('days') || 30)), since = Date.now() - days * 864e5;
      const ev = readLog('events.jsonl', since).filter(e => e.s === shop);
      const byDay = {}; for (let i = days - 1; i >= 0; i--) byDay[new Date(Date.now() - i * 864e5).toISOString().slice(0, 10)] = { views: 0, visitors: new Set() };
      for (const e of ev) { const d = new Date(e.t).toISOString().slice(0, 10); if (byDay[d]) { if (e.e === 'item' || e.e === 'shop') byDay[d].views++; byDay[d].visitors.add(e.v); } }
      const items = {}; for (const e of ev) if (e.e === 'item') items[e.k] = (items[e.k] || 0) + 1;
      const taps = k => ev.filter(e => e.e === 'tap' && (Array.isArray(k) ? k.includes(e.k) : e.k === k)).length;
      return json(res, 200, { days, visitors: new Set(ev.map(e => e.v)).size, itemViews: ev.filter(e => e.e === 'item').length, shopVisits: ev.filter(e => e.e === 'shop').length,
        whatsapp: taps(['wa', 'wact', 'waask', 'shwa']), carts: taps('add'), shares: taps(['share', 'igopen', 'copylink']), likes: taps('like'),
        daily: Object.entries(byDay).map(([d, o]) => ({ d, views: o.views, visitors: o.visitors.size })),
        top: Object.entries(items).sort((a, z) => z[1] - a[1]).slice(0, 5),
        sources: (() => { const first = {}; for (const e of ev) if (!(e.v in first)) first[e.v] = e.src || 'direct'; const o = {}; for (const k of Object.values(first)) o[k] = (o[k] || 0) + 1; return o; })() }, origin);
    }

    // ---- admin (login required) ----
    if (url.pathname === '/api/admin/login' && req.method === 'POST') {
      const ip = req.headers['x-real-ip'] || req.socket.remoteAddress, now = Date.now(), a = (loginTries.get(ip) || []).filter(t => now - t < 9e5);
      if (a.length >= 8) return json(res, 429, { error: 'Too many attempts. Wait 15 minutes.' });
      const b = await readBody(req);
      const adm = readAdmin();
      if (!adm || String(b.user || '').trim().toLowerCase() !== String(adm.user).toLowerCase() || !checkPass(b.pass || '')) { a.push(now); loginTries.set(ip, a); return json(res, 401, { error: 'Wrong username or password' }); }
      res.setHeader('Set-Cookie', `mb_admin=${encodeURIComponent(makeSession())}; Path=/; Max-Age=${7 * 86400}; HttpOnly; Secure; SameSite=Strict`);
      return json(res, 200, { ok: true });
    }
    if (url.pathname === '/api/admin/status') return json(res, 200, { setup: !readAdmin() });
    if (url.pathname === '/api/admin/setup' && req.method === 'POST') {
      if (readAdmin()) return json(res, 403, { error: 'Admin login already created' });
      const ip = req.headers['x-real-ip'] || req.socket.remoteAddress, now = Date.now(), a = (loginTries.get(ip) || []).filter(t => now - t < 9e5);
      if (a.length >= 8) return json(res, 429, { error: 'Too many attempts. Wait 15 minutes.' });
      const b = await readBody(req), code = crypto.createHash('sha256').update(String(b.code || '').trim()).digest('hex');
      const SETUP_SHA = setupSha(); if (!SETUP_SHA || code.length !== SETUP_SHA.length || !crypto.timingSafeEqual(Buffer.from(code), Buffer.from(SETUP_SHA))) { a.push(now); loginTries.set(ip, a); return json(res, 401, { error: 'Wrong setup code' }); }
      const user = String(b.user || '').trim().toLowerCase();
      if (!/^[a-z0-9._@-]{3,40}$/.test(user)) return json(res, 400, { error: 'Username: 3 to 40 letters or numbers' });
      const pass = String(b.pass || '');
      if (pass.length < 10 || !/[A-Za-z]/.test(pass) || !/[0-9]/.test(pass)) return json(res, 400, { error: 'Password: at least 10 characters with letters and numbers' });
      fs.writeFileSync(ADMIN_FILE, JSON.stringify({ user, hash: hashPass(pass), created: Date.now() }), { mode: 0o600 });
      res.setHeader('Set-Cookie', `mb_admin=${encodeURIComponent(makeSession())}; Path=/; Max-Age=${7 * 86400}; HttpOnly; Secure; SameSite=Strict`);
      return json(res, 200, { ok: true });
    }
    if (url.pathname === '/api/admin/logout') { res.setHeader('Set-Cookie', 'mb_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict'); return json(res, 200, { ok: true }); }
    if (url.pathname.startsWith('/api/admin/')) {
      if (!isAdmin(req)) return json(res, 401, { error: 'Please sign in' });
      if (url.pathname === '/api/admin/me') return json(res, 200, { user: (readAdmin() || {}).user });
      if (url.pathname === '/api/admin/config' && req.method === 'POST') { try { setConfig(await readBody(req)); return json(res, 200, CONFIG); } catch (e) { return json(res, 400, { error: e.message }); } }
      if (url.pathname === '/api/admin/password' && req.method === 'POST') {
        const b = await readBody(req); if (!checkPass(b.old || '')) return json(res, 401, { error: 'Current password is wrong' });
        const pass = String(b.pass || ''); if (pass.length < 10 || !/[A-Za-z]/.test(pass) || !/[0-9]/.test(pass)) return json(res, 400, { error: 'Password: at least 10 characters with letters and numbers' });
        const adm = readAdmin(); fs.writeFileSync(ADMIN_FILE, JSON.stringify({ ...adm, hash: hashPass(pass), changed: Date.now() }), { mode: 0o600 }); return json(res, 200, { ok: true });
      }
      if (url.pathname === '/api/admin/payments') return json(res, 200, readLog('payments.jsonl').reverse().slice(0, 500));
      if (url.pathname === '/api/admin/stats') {
        const days = Math.min(90, Math.max(1, +url.searchParams.get('days') || 30)), since = Date.now() - days * 864e5, ev = readLog('events.jsonl', since);
        const count = (f, key) => { const m = new Map(); for (const e of ev) if (f(e)) { const k = key(e); if (k) m.set(k, (m.get(k) || 0) + 1); } return [...m].sort((a, z) => z[1] - a[1]).slice(0, 15); };
        const byDay = {}; for (const e of ev) { const d = new Date(e.t).toISOString().slice(0, 10); (byDay[d] = byDay[d] || { views: 0, visitors: new Set() }).views += e.e === 'view' ? 1 : 0; byDay[d].visitors.add(e.v); }
        return json(res, 200, {
          days, events: ev.length, visitors: new Set(ev.map(e => e.v)).size, mobile: ev.filter(e => e.m).length,
          daily: Object.entries(byDay).sort().map(([d, o]) => ({ d, views: o.views, visitors: o.visitors.size })),
          screens: count(e => e.e === 'view', e => e.k), items: count(e => e.e === 'item', e => e.k), categories: count(e => e.e === 'cat' || e.e === 'item', e => e.c),
          shops: count(e => e.e === 'shop' || e.e === 'item', e => e.s), searches: count(e => e.e === 'search', e => (e.k || '').toLowerCase()), clicks: count(e => e.e === 'tap', e => e.k),
          countries: count(() => true, e => e.cc), languages: count(() => true, e => e.l),
          payments: readLog('payments.jsonl', since),
        });
      }
      return json(res, 404, { error: 'Not found' });
    }
    json(res, 404, { error: 'Not found' }, origin);
  } catch (e) {
    console.error('error', e && e.message);
    json(res, 500, { error: 'Something went wrong' }, origin);
  }
}).listen(PORT, () => console.log('myboutiki pay service on', PORT, 'key set:', !!KEY));
