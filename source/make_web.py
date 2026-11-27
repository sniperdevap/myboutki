import re,json,shutil,os
SRC='/home/claude/proto/index.html';WEB='/home/claude/web'
s=open(SRC).read()
def R(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:90],s.count(a));s=s.replace(a,b)
# 1. absolute asset paths
names='abaya|watch|bag|polo|av_pink|av_cheetah|av_diamond|av_noor|mark|logo'
s=re.sub(r'(?<![\w/.-])((?:%s)\.(?:jpg|svg|png))'%names,r'/img/\1',s)
s=re.sub(r'url\((ibm-plex-sans-arabic-arabic-\d+-normal\.woff2)\)',r'url(/fonts/\1)',s)
# 2. remove dashboard switch, hide dashboard
s=re.sub(r'<div class="switch" role="tablist">.*?</div>\n','',s,count=1,flags=re.S)
R("const dashVisible=()=>innerWidth>=1100||document.body.dataset.view==='dash';","const dashVisible=()=>false;")
R('<section class="dash" id="dash" aria-label="Admin dashboard"></section>','<section class="dash" id="dash" hidden></section>')
R("document.querySelector('.switch').addEventListener(","(document.querySelector('.switch')||{addEventListener(){}}).addEventListener(")
# 3. website CSS
WEBCSS="""
/* website: full screen, Instagram-web layout on desktop */
body{background:var(--bg)}.dash,.switch{display:none!important}
.stage{display:block;padding:0}
.phone,.phone[style]{width:100%!important;height:100dvh!important;border:0!important;border-radius:0!important;box-shadow:none!important;position:relative!important;top:0!important}
.pv{display:flex;align-items:center;justify-content:center;gap:8px;padding:6px 12px;background:var(--goldsoft);color:var(--ink);font-size:12px;line-height:1.3;text-align:center;flex:none}
.pv button{font-size:16px;line-height:1;opacity:.6;padding:2px 4px}
.side-brand{display:none}.xfoot{flex:none;display:flex;flex-direction:column}.xfoot>*{flex:none}
.rail{display:none}
@media(min-width:900px){
 #app{display:grid!important;grid-template-columns:244px minmax(0,1fr);grid-template-rows:auto auto minmax(0,1fr) auto}
 #app>.pv{grid-row:1}#app>.bar{grid-row:2}#app>.body{grid-row:3}#app>.xfoot{grid-row:4}
 #app>.pv{grid-column:2}
 #app>.nav{grid-column:1;grid-row:1 / -1;flex-direction:column;justify-content:flex-start;align-items:stretch;gap:6px;border-top:0;border-inline-end:1px solid var(--line);padding:26px 12px 20px;order:-1}
 #app>.bar,#app>.body{grid-column:2;width:100%;box-sizing:border-box}
 #app>.bar{max-width:975px;margin:0 auto;border-bottom-color:transparent;padding-inline:24px}
 #app>.body{padding:0 24px 40px}
 #app>.body>*{max-width:935px;margin-inline:auto}
 #app[data-v=feed]>.bar>span[dir=ltr]{visibility:hidden}
 #app[data-v=feed]>.body{display:grid;grid-template-columns:minmax(0,560px) 320px;justify-content:center;column-gap:64px;align-items:start}
 #app[data-v=feed]>.body>*{max-width:none;margin:0}
 .fcol article{border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:8px}
 .fcol article img{border-radius:6px}
 .rail{display:block;position:sticky;top:24px;padding-top:28px;font-size:14px}
 .rcard{border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:24px;background:var(--soft)}
 .rlinks{margin-top:26px;font-size:12px;color:var(--muted);line-height:1.8}.rlinks a{color:var(--muted);text-decoration:none}.rlinks a:hover{text-decoration:underline}
 #app:is([data-v=sell],[data-v=cart],[data-v=edit],[data-v=hl],[data-v=verify],[data-v=chat],[data-v=inbox],[data-v=settings],[data-v=auth])>.body>*{max-width:600px}
 #app[data-v=detail]>.body>*{max-width:760px}
 .grid{gap:4px!important}
 #app>.xfoot{grid-column:2;width:100%;max-width:808px;margin:0 auto;padding:0 24px;box-sizing:border-box}
 #app:is([data-v=seller],[data-v=profile])>.body>*{max-width:1240px}
 #app:is([data-v=seller],[data-v=profile]) .igp{display:grid;grid-template-columns:minmax(200px,300px) minmax(0,1fr);max-width:1040px!important;margin-inline:auto;padding:36px 16px 8px!important;align-items:start}
 .igp>.row:first-child{display:contents}
 .igp>.row:first-child>.ring{grid-column:1;grid-row:1 / span 12;justify-self:center;align-self:start;margin:0!important;transform:none!important}
 .igp>.row:first-child>.ring .av{width:150px!important;height:150px!important;font-size:58px!important}
 .igp>*{grid-column:2;max-width:640px}
 .igp>.row:first-child>div:last-child{grid-column:2}
 .igp>.row:first-child>div:last-child>.row{font-size:20px!important;font-weight:600!important;margin-bottom:14px!important}
 .igp>.row:first-child>div:last-child>div:last-child{gap:32px!important;margin-bottom:6px}
 .igp>.row:first-child>div:last-child>div:last-child>div{display:flex;gap:5px;align-items:baseline}
 .igp>.row:first-child>div:last-child>div:last-child>div>div:first-child{font-size:16px!important;font-weight:600!important}
 .igp>.row:first-child>div:last-child>div:last-child>div>div:last-child{font-size:16px!important}
 .igp>.row:has(>button),.igp>.row:has(>.wa){max-width:560px}
 .igp>.row>button,.igp>.row>.wa{height:40px!important;border-radius:10px!important}
 .igp>:is(.sxw,.scrollx){grid-column:1 / -1;max-width:none;margin-top:30px}
 .igp .scrollx{gap:34px!important;padding:6px 0 10px calc(150px - 77px)!important;-webkit-mask-image:none!important;mask-image:none!important}
 .phone[dir=rtl] .igp .scrollx{padding:6px calc(150px - 77px) 10px 0!important}
 .igp .scrollx>button{width:88px!important;flex:none}
 .igp .scrollx>button>div:first-child{width:86px!important;height:86px!important}
 .igp .scrollx>button>div:last-child{font-size:13px!important;font-weight:600}
 .toast{left:50%!important;right:auto!important;transform:translateX(-50%)!important;width:max-content;max-width:min(420px,90vw);bottom:32px!important}
 #app:is([data-v=seller],[data-v=profile]) .body>div:last-child{margin-top:28px!important}
 #app:is([data-v=seller],[data-v=profile]) .grid:not(.mosaic){gap:4px!important}
 #app[data-v=explore]>.body>*{max-width:1240px}
 .igp .ring{transform:scale(1.25);transform-origin:center;margin:14px 28px 14px 14px}
 .nav button{width:auto!important;height:50px!important;display:flex!important;align-items:center;gap:16px;padding:0 12px!important;border-radius:10px;justify-content:flex-start!important;font-size:16px;color:var(--ink)!important;transition:background .15s}
 .nav button:hover{background:var(--soft)}
 .nav button:hover .ms{transform:scale(1.08)}
 .nav button.on{font-weight:700}
 .nav button::after{content:attr(data-l)}
 .nav .badge{left:30px!important;right:auto!important}
 .side-brand{display:flex;align-items:center;gap:2px;padding:4px 12px 30px;text-decoration:none;color:var(--ink)}
 .sheetwrap{left:244px!important}
 #app[data-v=auth]{display:flex!important;flex-direction:column;width:100%;max-width:460px;margin:0 auto;border-inline:1px solid var(--line)}
 #app[data-v=auth]~.sheetwrap,#app[data-v=auth] .sheetwrap{left:0!important}
 .sheet{max-width:560px;margin-inline:auto;border-radius:20px 20px 0 0}
}
@media(min-width:1180px){#app:is([data-v=seller],[data-v=profile],[data-v=explore],[data-v=saved]) .grid:not(.mosaic){grid-template-columns:repeat(4,minmax(0,1fr))!important}}
@media(min-width:1560px){#app:is([data-v=seller],[data-v=profile],[data-v=explore],[data-v=saved]) .grid:not(.mosaic){grid-template-columns:repeat(5,minmax(0,1fr))!important}}
@media(min-width:1280px){#app{grid-template-columns:300px minmax(0,1fr)}#app>.nav{padding-inline:20px}.sheetwrap{left:300px!important}}
@media(min-width:900px) and (max-width:1159px){#app[data-v=feed]>.body{grid-template-columns:minmax(0,600px)}#app[data-v=feed] .rail{display:none}}
@media(min-width:900px){.phone[dir=rtl] .nav .badge{right:30px!important;left:auto!important}}
"""
R("</style>",WEBCSS+"</style>")
# nav: brand + text labels (translated via data-l set in JS)
R('<nav class="nav">${','<nav class="nav"><a class="side-brand" href="/" data-a="tab" data-t="feed" dir="ltr" data-notr><img src="/img/mark.svg" alt="" style="height:34px"><span class="brand" style="font-size:25px">boutki</span></a>${')
R('class="${S.tab===t?\'on\':\'\'}" aria-label="${l}">','class="${S.tab===t?\'on\':\'\'}" aria-label="${l}" data-l="${tr(l)}">')

# 3b. wide desktop layout: right rail on feed, view-aware widths
R("if(S.tab==='feed')return [","if(S.tab==='feed')return [")
s=s.replace(",stories()+(()=>{const l=vSort(P.filter(x=>S.fcat==='All'||x.c===S.fcat));return l.length?l.map(post).join(''):`<p class=\"muted\" style=\"text-align:center;padding:60px 24px\">No posts in ${esc(S.fcat)} yet.</p>`})(),1];",
 ",'<div class=\"fcol\">'+stories()+(()=>{const l=vSort(P.filter(x=>S.fcat==='All'||x.c===S.fcat));return l.length?l.map(post).join(''):`<p class=\"muted\" style=\"text-align:center;padding:60px 24px\">No posts in ${esc(S.fcat)} yet.</p>`})()+'</div>'+rail(),1];",1)
assert 'rail(),1]' in s
R("function stories(){","""function rail(){const shops=[...new Set(vSort(P).map(p=>p.s))].filter(h=>h!==me()).slice(0,6),u=S.user;
const meRow=u?`<div class="row" style="gap:12px;margin-bottom:22px"><button data-a="tab" data-t="profile">${av(u.handle,48)}</button><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:14px">${esc(u.handle)}</div><div class="muted" style="font-size:14px">${esc(u.name)}</div></div><button data-a="tab" data-t="sell" style="color:${FOLLOW};font-size:13px;font-weight:600">Sell</button></div>`
:`<div class="rcard"><div style="font-weight:600;font-size:15px;margin-bottom:4px">Open your shop on myboutki</div><p class="muted" style="font-size:13px;margin:0 0 12px">Post items, get orders on WhatsApp. No shop rent.</p><button class="pri w" data-a="tab" data-t="sell" style="height:40px">Start selling</button></div>`;
return `<aside class="rail">${meRow}<div class="row" style="justify-content:space-between;margin-bottom:10px"><span class="muted" style="font-weight:600;font-size:14px">Suggested shops</span><button data-a="tab" data-t="explore" style="font-size:12px;font-weight:600">See all</button></div>
${shops.map(h=>{const f=S.follow.has(h);return `<div class="row" style="gap:12px;padding:7px 0"><button data-a="seller" data-s="${esc(h)}">${av(h,44)}</button><button data-a="seller" data-s="${esc(h)}" style="flex:1;min-width:0;text-align:start"><div class="row" style="gap:3px;font-weight:600;font-size:14px"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(h)}</span>${VB(h,14)}</div><div class="muted" style="font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(nameOf(h))}</div></button><button data-a="follow" data-s="${esc(h)}" style="font-size:12px;font-weight:600;color:${f?'var(--ink)':FOLLOW}">${f?'Following':'Follow'}</button></div>`}).join('')}
<div class="rlinks"><a href="/about/">About</a> · <a href="${S.lang==='ar'?'/':'/ar/'}" data-notr>${S.lang==='ar'?'English':'العربية'}</a> · <a href="mailto:support@myboutki.com">Support</a> · <a href="/sitemap.xml">Sitemap</a><div style="margin-top:12px" data-notr dir="ltr">© ${new Date().getFullYear()} MYBOUTKI · Kuwait · Saudi Arabia · UAE · Bahrain · Qatar · Oman</div></div></aside>`}
function stories(){""")

# 4. preview banner (honest: no real accounts yet)
R("app.innerHTML=h+`<div class=\"body\">${b}</div>`","app.innerHTML=(S.pvOff?'':`<div class=\"pv\" role=\"note\"><span>Preview — the myboutki app launches soon. Accounts and posts are saved on this device only.</span><button data-a=\"pvoff\" aria-label=\"Dismiss\">×</button></div>`)+h+`<div class=\"body\">${b}</div>`")
R("case 'pcat':","case 'pvoff':S.pvOff=1;try{sessionStorage.setItem('mb_pv','1')}catch(_){}render(true);break;\ncase 'pcat':")
R("S={lang:'en',","S={pvOff:(()=>{try{return sessionStorage.getItem('mb_pv')==='1'}catch(_){return 0}})(),lang:'en',")
m=re.search(r'const AR=(\{.*?\});\nconst LOC',s,re.S);d=json.loads(m.group(1))
d.update({"Preview — the myboutki app launches soon. Accounts and posts are saved on this device only.":"نسخة تجريبية — تطبيق ماي بوتيكي قريباً. الحسابات والمنشورات تُحفظ على هذا الجهاز فقط.","Dismiss":"إغلاق","Open your shop on myboutki":"افتح متجرك على ماي بوتيكي","Post items, get orders on WhatsApp. No shop rent.":"انشر منتجاتك واستقبل الطلبات عبر واتساب. بدون إيجار محل.","Start selling":"ابدأ البيع","Suggested shops":"متاجر مقترحة","See all":"عرض الكل","About":"من نحن","Support":"الدعم","Sitemap":"خريطة الموقع"})
s=s[:m.start(1)]+json.dumps(d,ensure_ascii=False)+s[m.end(1):]
R("app.innerHTML=(S.pvOff?","app.dataset.v=S.stage!=='none'?'auth':(S.stack.length?S.stack[S.stack.length-1].k:S.tab);app.innerHTML=(S.pvOff?")
R("(typeof n==='string'?n:'')","(typeof n==='string'&&n?`<div class=\"xfoot\">${n}</div>`:'')")
R("app.innerHTML=S.stage==='setup'?","app.dataset.v='auth';app.innerHTML=S.stage==='setup'?")
# 5. deep links + language from URL
R("try{restore(st)}catch(_){}\nconst fromPay=","""try{restore(st)}catch(_){}
const path=location.pathname;if(/^\\/ar(\\/|$)/.test(path)&&!(st&&st.lang))S.lang='ar';
{const mp=path.match(/\\/p\\/(\\d+)/),ms=path.match(/\\/@([a-z0-9._]+)/i);if(mp&&P.some(p=>p.id===+mp[1]))S.stack=[{k:'detail',id:+mp[1]}];else if(ms&&P.some(p=>p.s===ms[1]))S.stack=[{k:'seller',s:ms[1]}];if(mp||ms)try{history.replaceState(null,'',S.lang==='ar'?'/ar/':'/')}catch(_){}}
const fromPay=""")
R("let i18nQ=0;","document.documentElement.lang=S.lang;let i18nQ=0;") if "let i18nQ=0;" in s else None
open('/tmp/app_web.html','w').write(s)
print('ok',len(s))

# ---- write pages into the Astro public folder with SEO heads
import html
def head(lang):
    ar=lang=='ar'
    title='ماي بوتيكي — تسوّق وبِع من متاجر الخليج' if ar else 'myboutki — Shop and sell with your community | Gulf social marketplace'
    desc=('ماي بوتيكي سوق بأسلوب إنستغرام في الخليج: تصفّح منتجات المتاجر المحلية، احفظ ما يعجبك، واطلب مباشرة عبر واتساب. افتح متجرك بدون إيجار محل — الكويت والسعودية والإمارات والبحرين وقطر وعُمان.' if ar else
          'myboutki is an Instagram-style marketplace for the Gulf. Browse items from local shops, save favourites and order straight on WhatsApp. Open your own shop without renting a store — Kuwait, Saudi Arabia, UAE, Bahrain, Qatar and Oman.')
    url='https://myboutki.com/ar/' if ar else 'https://myboutki.com/'
    ld=[{"@context":"https://schema.org","@type":"WebSite","name":"myboutki","alternateName":"ماي بوتيكي","url":"https://myboutki.com/","inLanguage":["en","ar"]},
        {"@context":"https://schema.org","@type":"Organization","name":"myboutki","url":"https://myboutki.com/","logo":"https://myboutki.com/img/favicon.png","email":"support@myboutki.com","areaServed":["KW","SA","AE","BH","QA","OM"]}]
    e=html.escape
    return f'''<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="en" href="https://myboutki.com/">
<link rel="alternate" hreflang="ar" href="https://myboutki.com/ar/">
<link rel="alternate" hreflang="x-default" href="https://myboutki.com/">
<meta property="og:type" content="website"><meta property="og:site_name" content="myboutki">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}"><meta property="og:image" content="https://myboutki.com/img/og.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:locale" content="{'ar_KW' if ar else 'en_US'}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://myboutki.com/img/og.jpg">
<meta name="theme-color" content="#ffffff">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="myboutki">
<link rel="icon" type="image/svg+xml" href="/img/mark.svg"><link rel="icon" type="image/png" sizes="512x512" href="/img/favicon.png"><link rel="apple-touch-icon" href="/img/favicon.png">
<link rel="manifest" href="/manifest.webmanifest">
<script type="application/ld+json">{json.dumps(ld,ensure_ascii=False)}</script>
<noscript><style>.stage{{display:none}}</style><p style="padding:24px;font:16px system-ui">{'ماي بوتيكي يحتاج إلى تفعيل JavaScript.' if ar else 'myboutki needs JavaScript turned on.'} <a href="{'/ar/about/' if ar else '/about/'}">{'عن ماي بوتيكي' if ar else 'About myboutki'}</a></p></noscript>'''
for lang,out in [('en','index.html'),('ar','ar/index.html')]:
    t=s.replace('<title>myboutki app preview</title>',head(lang),1)
    if lang=='ar':t=t.replace('<html lang="en">','<html lang="ar">',1)
    p=os.path.join(WEB,'public',out);os.makedirs(os.path.dirname(p),exist_ok=True);open(p,'w').write(t)
for f in ['av_pink.jpg','av_cheetah.jpg','av_diamond.jpg','av_noor.jpg']:
    shutil.copy('/home/claude/proto/'+f,os.path.join(WEB,'public/img',f))
open(os.path.join(WEB,'public/manifest.webmanifest'),'w').write(json.dumps({"name":"myboutki","short_name":"myboutki","start_url":"/","display":"standalone","background_color":"#ffffff","theme_color":"#ffffff","icons":[{"src":"/img/favicon.png","sizes":"512x512","type":"image/png"}]}))
open(os.path.join(WEB,'public/sitemap.xml'),'w').write('''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
'''+''.join(f'''<url><loc>https://myboutki.com{a}</loc><xhtml:link rel="alternate" hreflang="en" href="https://myboutki.com{e_}"/><xhtml:link rel="alternate" hreflang="ar" href="https://myboutki.com{r}"/><changefreq>daily</changefreq><priority>{pr}</priority></url>
''' for a,e_,r,pr in [('/','/','/ar/','1.0'),('/ar/','/','/ar/','1.0'),('/about/','/about/','/ar/about/','0.8'),('/ar/about/','/about/','/ar/about/','0.8')])+'</urlset>\n')
print('pages written')
