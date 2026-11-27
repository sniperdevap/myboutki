// myboutki payment service (MyFatoorah v3). No dependencies; Node 18+.
// The secret key comes ONLY from the MF_API_KEY environment variable. Never commit it.
'use strict';
const http = require('http');

const API = process.env.MF_API_URL || 'https://api.myfatoorah.com';
const KEY = process.env.MF_API_KEY || '';
const SITE = process.env.SITE_URL || 'https://myboutki.com';
const PORT = +process.env.PORT || 8080;

// Everything that can be paid for. Prices are decided here on the server, never by the browser.
// usd = price shown to users, kwd = amount actually charged (MyFatoorah Kuwait charges in KWD).
// To sell something new later, add a line here.
const PRODUCTS = {
  'verified-monthly': { name: 'myboutki Verified · Monthly', usd: 18, kwd: 5.5, days: 30 },
  'verified-yearly': { name: 'myboutki Verified · Yearly', usd: 180, kwd: 55, days: 365 },
  'boost-1d': { name: 'Boost post · 1 day', usd: 3, kwd: 1, days: 1, post: true },
  'boost-3d': { name: 'Boost post · 3 days', usd: 8, kwd: 2.5, days: 3, post: true },
  'boost-7d': { name: 'Boost post · 7 days', usd: 15, kwd: 4.5, days: 7, post: true },
  'boost-14d': { name: 'Boost post · 14 days', usd: 25, kwd: 7.5, days: 14, post: true },
};

// Boosts: price = daily budget (USD) x days, worked out here. Only the app's 6 Gulf countries can be targeted.
const GCC = ['KW', 'SA', 'AE', 'BH', 'QA', 'OM'], DAYS = [1, 3, 7, 14, 30], GOALS = ['visits', 'messages', 'views'];
const USD_KWD = 0.31, toKwd = usd => Math.ceil(usd * USD_KWD * 1000) / 1000;
const ORIGINS = new Set([SITE, 'https://www.myboutki.com']);
const json = (res, code, body, origin) => {
  const h = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  if (origin && (ORIGINS.has(origin) || /^https:\/\/[a-z0-9-]+\.claudeusercontent\.com$/.test(origin))) {
    h['Access-Control-Allow-Origin'] = origin; h['Vary'] = 'Origin';
    h['Access-Control-Allow-Headers'] = 'Content-Type'; h['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
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
  let s = ''; req.on('data', c => { s += c; if (s.length > 10000) { no(new Error('too big')); req.destroy(); } });
  req.on('end', () => { try { ok(s ? JSON.parse(s) : {}); } catch (e) { no(e); } });
});
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
      return json(res, 200, { ok: true, configured: !!KEY, key: auth, methods, products: Object.keys(PRODUCTS) }, origin);
    }

    if (url.pathname === '/api/pay/products' && req.method === 'GET')
      return json(res, 200, Object.fromEntries(Object.entries(PRODUCTS).map(([k, p]) => [k, { name: p.name, usd: p.usd, kwd: p.kwd }])), origin);

    if (url.pathname === '/api/pay/create' && req.method === 'POST') {
      const ip = req.headers['x-real-ip'] || req.socket.remoteAddress;
      if (limited(ip)) return json(res, 429, { error: 'Too many attempts. Try again in a few minutes.' }, origin);
      const b = await readBody(req);
      let p = PRODUCTS[b.product], extra = [];
      if (b.product === 'boost') {
        const daily = Math.round(+b.daily), days = +b.days;
        const cc = [...new Set((Array.isArray(b.countries) ? b.countries : []).filter(c => GCC.includes(c)))];
        const goal = GOALS.includes(b.goal) ? b.goal : 'views';
        if (!(daily >= 1 && daily <= 100) || !DAYS.includes(days) || !cc.length) return json(res, 400, { error: 'Check the budget, duration and countries' }, origin);
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
      const r = await mf('POST', '/v3/payments', {
        Order: { Amount: p.kwd, Currency: 'KWD', ExternalIdentifier: [b.product, handle, p.post ? post : '', ...extra].join('|') },
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

    if (url.pathname === '/api/pay/status' && req.method === 'GET') {
      const id = url.searchParams.get('paymentId') || '';
      if (!/^[0-9]{6,40}$/.test(id)) return json(res, 400, { error: 'Bad payment id' }, origin);
      const r = await mf('GET', '/v3/payments/' + id);
      if (!r.ok || !r.j.Data) return json(res, 404, { paid: false, error: 'Payment not found' }, origin);
      const d = r.j.Data, inv = d.Invoice || {}, tr = d.Transaction || {};
      const [product, handle, post, bDays, bDaily, bCc, bGoal] = String(inv.ExternalIdentifier || '').split('|');
      const paid = String(inv.Status).toUpperCase() === 'PAID' && String(tr.Status).toUpperCase() === 'SUCCESS';
      const p = PRODUCTS[product] || (product === 'boost' ? { days: +bDays || 0 } : null);
      return json(res, 200, { paid, status: inv.Status, product, handle, post: post || null, daily: +bDaily || null, countries: bCc ? bCc.split('.') : [], goal: bGoal || null, days: p ? p.days : 0, invoiceId: inv.Id, amount: d.Amount ? d.Amount.ValueInBaseCurrency : null, currency: d.Amount ? d.Amount.BaseCurrency : null }, origin);
    }
    json(res, 404, { error: 'Not found' }, origin);
  } catch (e) {
    console.error('error', e && e.message);
    json(res, 500, { error: 'Something went wrong' }, origin);
  }
}).listen(PORT, () => console.log('myboutki pay service on', PORT, 'key set:', !!KEY));
