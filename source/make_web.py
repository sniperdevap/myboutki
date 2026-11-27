import re,json,shutil,os
SRC='/home/claude/proto/index.html';WEB='/home/claude/web'
s=open(SRC).read()
def R(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:90],s.count(a));s=s.replace(a,b)
# 1. absolute asset paths
names='abaya|watch|bag|polo|av_pink|av_cheetah|av_diamond|av_noor|mark|logo'
s=re.sub(r'(?<![\w/.-])((?:%s)\.(?:jpg|svg|png))'%names,r'/img/\1',s);s=s.replace('/img/mark.svg','/img/mark.svg?v=2')
s=re.sub(r'url\(((?:ibm-plex-sans-arabic-arabic|cairo-arabic)-\d+-normal\.woff2)\)',r'url(/fonts/\1)',s)
# 2. remove dashboard switch, hide dashboard
# 3. website CSS
WEBCSS="""
/* website: full screen, Instagram-web layout on desktop */
body{background:var(--bg)}.dash,.switch{display:none!important}
.stage{display:block;padding:0}
.phone,.phone[style]{width:100%!important;height:100dvh!important;border:0!important;border-radius:0!important;box-shadow:none!important;position:relative!important;top:0!important}
.pv{display:flex;align-items:center;justify-content:center;gap:8px;padding:6px 12px;background:var(--soft);color:var(--ink);font-size:13px;font-weight:600;line-height:1.3;text-align:center;flex:none;border-bottom:1px solid var(--line)}.pv .pvb{width:28px;height:28px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;background:var(--bg);border:1px solid var(--line)}
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
 #app[data-v=auth]>.bar{grid-column:2;grid-row:1;justify-self:center;width:100%;max-width:460px;border:0}
 #app[data-v=auth]>.body{grid-column:2;grid-row:2 / -1;justify-self:center;width:100%;max-width:460px;overflow:auto}
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
R('<nav class="nav">${','<nav class="nav"><a class="side-brand" href="/" data-a="gohome" dir="ltr" data-notr><img src="/img/mark.svg?v=2" alt="" style="height:34px"><span class="brand" style="font-size:25px">boutiki</span></a>${')
R('class="${cur===t?\'on\':\'\'}" aria-label="${l}">','class="${cur===t?\'on\':\'\'}" aria-label="${l}" data-l="${tr(l)}">')

# 3b. wide desktop layout: right rail on feed, view-aware widths
R("if(S.tab==='feed')return [","if(S.tab==='feed')return [")
s=s.replace(",stories()+(()=>{const l=vSort(P.filter(x=>S.fcat==='All'||x.c===S.fcat),'home');return l.length?l.map(post).join(''):`<p class=\"muted\" style=\"text-align:center;padding:60px 24px\">No posts in ${esc(S.fcat)} yet.</p>`})(),1];",
 ",'<div class=\"fcol\">'+stories()+(()=>{const l=vSort(P.filter(x=>S.fcat==='All'||x.c===S.fcat),'home');return l.length?l.map(post).join(''):`<p class=\"muted\" style=\"text-align:center;padding:60px 24px\">No posts in ${esc(S.fcat)} yet.</p>`})()+'<div class=\"appdl\" style=\"padding:24px 14px 30px;text-align:center\"><div style=\"font-weight:600;margin-bottom:10px\">Get the myboutiki app</div><div style=\"display:flex;justify-content:center\">'+storeBtns()+'</div></div></div>'+rail(),1];",1)
assert 'rail(),1]' in s
R("function stories(){","""function storeBtns(){const b=(k,top,name,svg)=>`<button data-a=\"store\" data-k=\"${k}\" class=\"row\" style=\"gap:8px;height:44px;padding:0 14px;border-radius:10px;background:#000;color:#fff;text-align:start\">${svg}<span style=\"line-height:1.1\"><span style=\"display:block;font-size:10px;opacity:.85\">${top}</span><span style=\"display:block;font-size:15px;font-weight:600\">${name}</span></span></button>`;return `<div class=\"row\" style=\"gap:8px;flex-wrap:wrap\" dir=\"ltr\" data-notr>${b('ios','Download on the','App Store','<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"#fff\" aria-hidden=\"true\"><path d=\"M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.6-1-2.6-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z\"/></svg>')}${b('android','GET IT ON','Google Play','<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"#34A853\" d=\"M3.6 2.3 13.4 12l-9.8 9.7c-.4-.2-.6-.6-.6-1.1V3.4c0-.5.2-.9.6-1.1z\"/><path fill=\"#FBBC04\" d=\"m17 8.4-3.6 3.6L17 15.6l4-2.3c.8-.5.8-1.6 0-2.1z\"/><path fill=\"#EA4335\" d=\"M3.6 21.7 13.4 12l3.6 3.6L5.1 22.3c-.5.3-1.1.2-1.5-.6z\"/><path fill=\"#4285F4\" d=\"M3.6 2.3 17 8.4 13.4 12z\"/></svg>')}</div>`}
function rail(){const shops=[...new Set(vSort(P).map(p=>p.s))].filter(h=>h!==me()).slice(0,6),u=S.user;
const meRow=u?`<div class="row" style="gap:12px;margin-bottom:22px"><button data-a="tab" data-t="profile">${av(u.handle,48)}</button><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:14px">${esc(u.handle)}</div><div class="muted" style="font-size:14px">${esc(u.name)}</div></div><button data-a="tab" data-t="sell" style="color:${FOLLOW};font-size:13px;font-weight:600">Sell</button></div>`
:`<div class="rcard"><div style="font-weight:600;font-size:15px;margin-bottom:4px">Open your shop on myboutiki</div><p class="muted" style="font-size:13px;margin:0 0 12px">Post items, get orders on WhatsApp. No shop rent.</p><button class="pri w" data-a="tab" data-t="sell" style="height:40px">Start selling</button></div>`;
return `<aside class="rail">${meRow}<div class="row" style="justify-content:space-between;margin-bottom:10px"><span class="muted" style="font-weight:600;font-size:14px">Suggested shops</span><button data-a="tab" data-t="explore" style="font-size:12px;font-weight:600">See all</button></div>
${shops.map(h=>{const f=S.follow.has(h);return `<div class="row" style="gap:12px;padding:7px 0"><button data-a="seller" data-s="${esc(h)}">${av(h,44)}</button><button data-a="seller" data-s="${esc(h)}" style="flex:1;min-width:0;text-align:start"><div class="row" style="gap:3px;font-weight:600;font-size:14px"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(h)}</span>${VB(h,14)}</div><div class="muted" style="font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(nameOf(h))}</div></button><button data-a="follow" data-s="${esc(h)}" style="font-size:12px;font-weight:600;color:${f?'var(--ink)':FOLLOW}">${f?'Following':'Follow'}</button></div>`}).join('')}
<div style="margin-top:22px"><div class="muted" style="font-weight:600;font-size:13px;margin-bottom:8px">Get the app</div>${storeBtns()}</div><div class="rlinks"><a href="${S.lang==='ar'?'/ar/blog/':'/blog/'}">Blog</a> · <a href="/about/">About</a> · <a href="${S.lang==='ar'?'/':'/ar/'}" data-notr>${S.lang==='ar'?'English':'العربية'}</a> · <a href="mailto:support@myboutki.com">Support</a> · <a href="/sitemap.xml">Sitemap</a><div style="margin-top:12px" data-notr dir="ltr">© ${new Date().getFullYear()} MYBOUTKI · Kuwait · Saudi Arabia · UAE · Bahrain · Qatar · Oman</div></div></aside>`}
function stories(){""")

# 4. preview banner (honest: no real accounts yet)
R("app.innerHTML=h+`<div class=\"body\">${b}</div>`","app.innerHTML=(S.pvOff?'':`<div class=\"pv\" role=\"note\"><button data-a=\"store\" data-k=\"ios\" class=\"pvb\" aria-label=\"iPhone app coming soon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.6-1-2.6-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z\"/></svg></button><button data-a=\"store\" data-k=\"android\" class=\"pvb\" aria-label=\"Android app coming soon\">${ic('android','','font-size:18px;color:#3ddc84')}</button><span>iOS & Android apps coming soon</span><button data-a=\"pvoff\" aria-label=\"Dismiss\">×</button></div>`)+h+`<div class=\"body\">${b}</div>`")
R("case 'pcat':","case 'store':toast(el.dataset.k==='ios'?'Coming soon on the App Store':'Coming soon on Google Play');break;\ncase 'pvoff':S.pvOff=1;try{sessionStorage.setItem('mb_pv','1')}catch(_){}render(true);break;\ncase 'pcat':")
R("S={lang:'en',","S={pvOff:(()=>{try{return /myboutkiApp/.test(navigator.userAgent)||sessionStorage.getItem('mb_pv')==='1'}catch(_){return 0}})(),lang:'en',")
m=re.search(r'const AR=(\{.*?\});\nconst LOC',s,re.S);d=json.loads(m.group(1))
d.update({"iOS & Android apps coming soon":"تطبيقات iOS وأندرويد قريباً","Dismiss":"إغلاق","Get the app":"حمّل التطبيق","Get the myboutiki app":"حمّل تطبيق ماي بوتيكي","Coming soon on the App Store":"قريباً على App Store","Coming soon on Google Play":"قريباً على Google Play","Open your shop on myboutiki":"افتح متجرك على ماي بوتيكي","Post items, get orders on WhatsApp. No shop rent.":"انشر منتجاتك واستقبل الطلبات عبر واتساب. بدون إيجار محل.","Start selling":"ابدأ البيع","Suggested shops":"متاجر مقترحة","See all":"عرض الكل","About":"من نحن","Support":"الدعم","Sitemap":"خريطة الموقع","Blog":"المدونة"})
s=s[:m.start(1)]+json.dumps(d,ensure_ascii=False)+s[m.end(1):]
R("app.innerHTML=(S.pvOff?","app.dataset.v=S.stage!=='none'?'auth':(S.stack.length?S.stack[S.stack.length-1].k:S.tab);app.innerHTML=(S.pvOff?")
R("(typeof n==='string'?n:'')","(typeof n==='string'&&n?`<div class=\"xfoot\">${n}</div>`:'')")
R("app.innerHTML=(S.stage==='setup'?","app.dataset.v='auth';app.innerHTML=(S.stage==='setup'?")
# 5. deep links + language from URL
R("try{restore(st)}catch(_){}\nconst fromPay=","""try{restore(st)}catch(_){}
const path=location.pathname;if(/^\\/ar(\\/|$)/.test(path)&&!(st&&st.lang))S.lang='ar';
{const qq=new URLSearchParams(location.search).get('q');if(qq){S.tab='explore';S.q=qq.slice(0,60)}}{const mp=path.match(/\\/p\\/(\\d+)/),ms=path.match(/\\/@([a-z0-9._]+)/i);if(mp&&P.some(p=>p.id===+mp[1]))S.stack=[{k:'detail',id:+mp[1]}];else if(ms&&P.some(p=>p.s===ms[1]))S.stack=[{k:'seller',s:ms[1]}];else if(mp)S.wantPost=+mp[1];else if(ms)S.wantShop=ms[1];if(mp||ms)try{history.replaceState(null,'',S.lang==='ar'?'/ar/':'/')}catch(_){}}
const fromPay=""")
R("let i18nQ=0;","document.documentElement.lang=S.lang;let i18nQ=0;") if "let i18nQ=0;" in s else None
open('/tmp/app_web.html','w').write(s)
print('ok',len(s))

# 6. REAL Google sign-in with Firebase Auth (website only)
R("case 'google':S.stage='pick';render();break;","case 'google':fbGoogle(el);break;")
R("case 'logout':S.menu=false;","case 'logout':fbOut();S.menu=false;")
R("async function boot(){",r"""const FB_CFG={apiKey:"AIzaSyDMIqQ41Oedco4163S9_mxzR4lGxEwHbYo",authDomain:/(^|\.)myboutki\.com$/.test(location.hostname)?location.host:"myboutki.firebaseapp.com",projectId:"myboutiki",storageBucket:"myboutki.firebasestorage.app",messagingSenderId:"757704906396",appId:"1:757704906396:web:a35f81f10838edf0753f59"};
const FBV='11.0.2';let fbP=null;
function fbLoad(){return fbP||(fbP=Promise.all([import(`https://www.gstatic.com/firebasejs/${FBV}/firebase-app.js`),import(`https://www.gstatic.com/firebasejs/${FBV}/firebase-auth.js`)]).then(([A,U])=>{const app=A.initializeApp(FB_CFG),auth=U.getAuth(app);return {U,auth}}).catch(e=>{fbP=null;throw e}))}
function fbAccount(fu){const em=(fu.email||'').toLowerCase(),n=fu.displayName||em.split('@')[0];
const mine=storesOf(em);if(mine.length){S.user=mine[0];markSigned(S.user);S.cur=S.user.cur;seedChats();S.stage='none';afterAuth();render();toast('Welcome back, @'+S.user.handle)}
else{S.pending={name:n,email:em,uid:fu.uid};S.un=n.toLowerCase().replace(/[^a-z0-9]+/g,'.').replace(/^\.|\.$/g,'').slice(0,24)||em.split('@')[0].replace(/[^a-z0-9._]/g,'');S.pn='';S.ci=0;S.stage='setup';render()}}
async function fbGoogle(el){const t=el&&el.innerHTML;if(el){el.style.pointerEvents='none';el.style.opacity='.75';el.textContent=tr('Opening Google…')}
try{const {U,auth}=await fbLoad(),pv=new U.GoogleAuthProvider();pv.setCustomParameters({prompt:'select_account'});
if(innerWidth<900||/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)){saveNow();await U.signInWithRedirect(auth,pv);return}let r;try{r=await U.signInWithPopup(auth,pv)}catch(e){if(/popup-blocked|operation-not-supported/.test(e.code||'')){await U.signInWithRedirect(auth,pv);return}throw e}
fbAccount(r.user)}catch(e){if(!/popup-closed|cancelled-popup/.test(e&&e.code||''))toast("Couldn't sign in with Google. Please try again.")}finally{if(el&&el.isConnected){el.style.pointerEvents='';el.style.opacity='';el.innerHTML=t}}}
function fbOut(){fbLoad().then(({U,auth})=>U.signOut(auth)).catch(()=>{})}
async function fbRedirectResult(){if(S.user)return;try{const {U,auth}=await fbLoad(),r=await U.getRedirectResult(auth);if(r&&r.user)fbAccount(r.user)}catch(_){}}
async function boot(){""")
R("applyLang();render();payReturn();","applyLang();render();payReturn();fbRedirectResult();{const warm=()=>{removeEventListener('pointerdown',warm,true);fbLoad().catch(()=>{})};addEventListener('pointerdown',warm,true);setTimeout(()=>(window.requestIdleCallback||setTimeout)(warm),6000)}")
# finish: remember the Google uid on the account
R("case 'finish':{","case 'finish':{if(S.pending&&S.pending.uid)S.pendingUid=S.pending.uid;")
m=re.search(r'const AR=(\{.*?\});\nconst LOC',s,re.S);d=json.loads(m.group(1))
d.update({"Couldn't sign in with Google. Please try again.":"تعذّر تسجيل الدخول عبر Google. حاول مرة أخرى.","Opening Google…":"جارٍ فتح Google…"})
s=s[:m.start(1)]+json.dumps(d,ensure_ascii=False)+s[m.end(1):]

# 7. SPEED: fonts don't block the first paint; no 3 MB full icon font
s=re.sub(r'<link href="(https://fonts\.googleapis\.com/css2\?family=Playfair[^"]+)" rel="stylesheet">',r"""<link rel="preload" as="style" href="\1" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="\1"></noscript>""",s,count=1)
s=re.sub(r'<link href="(https://fonts\.googleapis\.com/css2\?family=Material\+Symbols[^"]+)" rel="stylesheet">',r"""<link rel="preload" as="style" href="\1" onload="this.onload=null;this.rel='stylesheet';document.documentElement.classList.add('icok')">""",s,count=1)
assert 'onload="this.onload=null;this.rel' in s
R("</style>","html:not(.icok) .ms{color:transparent!important}\n</style>")
R("setTimeout(()=>(window.requestIdleCallback||setTimeout)(lateFont),2500);","")

# 8. CENTRAL DATABASE SYNC (website only): shops, posts and photos saved on the server for every device
R("const taken=u=>{u=u.toLowerCase();return isReserved(u)||","const SRV_TAKEN=new Set();const taken=u=>{u=u.toLowerCase();return SRV_TAKEN.has(u)||isReserved(u)||")
R("async function boot(){",r"""// ---------- server sync ----------
const API=PAY_API;let SYNC={on:false,t:0,busy:false,email:'',uid:'',lastPull:0};
async function fbToken(){try{const {auth}=await fbLoad();if(auth.authStateReady)await auth.authStateReady();const u=auth.currentUser;if(!u)return null;SYNC.email=(u.email||'').toLowerCase();SYNC.uid=u.uid;return await u.getIdToken()}catch(_){return null}}
async function api(method,path,body,raw){const tok=await fbToken();if(!tok)throw Object.assign(new Error('signin'),{code:401});const r=await fetch(API+path,{method,headers:{Authorization:'Bearer '+tok,...(raw?{'Content-Type':raw.type||'image/jpeg'}:{'Content-Type':'application/json'})},body:raw||(body?JSON.stringify(body):undefined)});let j=null;try{j=await r.json()}catch(_){}if(!r.ok)throw Object.assign(new Error((j&&j.error)||('Error '+r.status)),{code:r.status,j});return j}
async function upImg(u){if(typeof u!=='string')return null;if(/^\/(u|img)\//.test(u))return u;if(u.startsWith('blob:')){const b=await (await fetch(u)).blob();const j=await api('POST','/api/upload',null,b);return j.url}return null}
const isMine=h=>Object.values(REG).some(r=>r.handle===h&&r.uid&&r.uid===SYNC.uid);
function srvStore(s){const ex=Object.values(REG).find(r=>r.handle===s.handle);if(ex&&ex.uid&&ex.uid===SYNC.uid)return ex;const r=ex||{};Object.assign(r,{handle:s.handle,name:s.name,bio:s.bio,avatar:s.avatar,links:s.links,hl:s.hl,k:s.k,phone:s.phone,cur:s.cur,fc:s.fc,fg:s.fg,ver:s.ver&&s.ver.status==='active'?{...s.ver}:r.ver&&r.ver.status!=='active'?r.ver:null,srv:1});if(!ex){r.id='srv:'+s.handle;r.email='srv:'+s.handle;REG[r.id]=r}return r}
async function syncPull(){try{const r=await fetch(API+'/api/feed',{cache:'no-store'});const j=await r.json();if(!j||!j.posts)return;SYNC.lastPull=Date.now();
const keep=new Set();(j.stores||[]).forEach(s=>{SRV_TAKEN.add(s.handle);srvStore(s)});
for(const sp of j.posts){keep.add(String(sp.id));if(isMine(sp.s))continue;const x=P.find(p=>String(p.id)===String(sp.id));if(x)Object.assign(x,sp,{remote:1,cm:x.cm||[],l:x.l||0});else P.push({...sp,remote:1,cm:[],l:0})}
for(let i=P.length-1;i>=0;i--){const x=P[i];if(x.remote&&!keep.has(String(x.id))&&!isMine(x.s))P.splice(i,1)}
if(S.wantPost&&P.some(p=>p.id===S.wantPost)){S.stack=[{k:'detail',id:S.wantPost}];S.wantPost=0;render();return}if(S.wantShop&&P.some(p=>p.s===S.wantShop)){S.stack=[{k:'seller',s:S.wantShop}];S.wantShop=0;render();return}if(S.stage==='none'&&!document.activeElement?.matches('input,textarea'))render(true)}catch(_){}}
async function syncMe(){const j=await api('GET','/api/me');SYNC.email=j.user.email;SYNC.uid=j.user.uid;
for(const s of j.stores){let r=Object.values(REG).find(x=>x.handle===s.handle&&x.email===SYNC.email);if(!r){r=Object.values(REG).find(x=>x.handle===s.handle)||{};if(r.id)delete REG[r.id];r.id=storesOf(SYNC.email).length?SYNC.email+'#'+s.handle:SYNC.email;REG[r.id]=r}
Object.assign(r,{handle:s.handle,email:SYNC.email,uid:SYNC.uid,name:s.name,bio:s.bio,avatar:s.avatar,links:s.links,hl:s.hl,k:s.k,phone:s.phone,cur:s.cur||r.cur||'KWD',fc:s.fc,fg:s.fg,srvOk:1});delete r.srv;if(s.ver&&s.ver.status==='active')r.ver={...(r.ver||{}),...s.ver};r._sh=storeSig(r)}
const rm=new Set((j.removed||[]).map(String));for(let i=P.length-1;i>=0;i--){if(rm.has(String(P[i].id))){P.splice(i,1)}}
for(const sp of j.posts){const x=P.find(p=>String(p.id)===String(sp.id));if(x){if(sp.boost)x.boost=sp.boost;if(sp.top)x.top=sp.top;x.synced=1;x.remote=0;if(!x._sh)x._sh=postSig(x)}else{const n={...sp,cm:[],l:sp.l||0,synced:1,remote:0};n._sh=postSig(n);P.push(n)}}
P.sort((a,b)=>b.at-a.at);fwInit();msgPull();return j}
const storeSig=r=>JSON.stringify([r.handle,r.name,r.bio,r.avatar,r.links,r.hl,r.k,r.phone,r.cur]);
const postSig=x=>JSON.stringify([x.s,x.h,x.d,x.p,x.c,x.imgs,!!x.sold,x.rp,x.cur,x.po]);
function queueSync(){if(!SYNC.uid)return;clearTimeout(SYNC.t);SYNC.t=setTimeout(syncPush,1200)}
async function syncPush(){if(SYNC.busy||!SYNC.uid){return}SYNC.busy=true;try{
const mine=Object.values(REG).filter(r=>r.email===SYNC.email&&r.handle);
for(const r of mine){if(r.syncErr===r.handle)continue;
 if(!r.srvOk){try{await api('POST','/api/stores',{handle:r.handle,name:r.name,phone:r.phone,k:r.k,cur:r.cur,bio:r.bio||''});r.srvOk=1;r.uid=SYNC.uid;r.srvHandle=r.handle;r._sh=''}catch(e){if(e.code===409){r.syncErr=r.handle;toast('@'+r.handle+' is already taken. Change your username in Edit profile.')}continue}}
 if(storeSig(r)!==r._sh){try{const av=r.avatar?await upImg(r.avatar):null;const hl=[];for(const x of r.hl||[])hl.push({...x,cover:x.cover?await upImg(x.cover):null});
  const old=r.srvHandle||r.handle;const j=await api('PUT','/api/stores/'+encodeURIComponent(old),{handle:r.handle,name:r.name,bio:r.bio,avatar:av,links:r.links||[],hl,k:r.k,phone:r.phone,cur:r.cur});r.srvHandle=j.store.handle;r._sh=storeSig(r)}catch(e){if(e.code===409){r.syncErr=r.handle;toast('@'+r.handle+' is already taken. Choose another username.')}}}}
const hs=new Set(mine.filter(r=>r.srvOk).map(r=>r.handle));
let done=new Set(JSON.parse(localStorage.getItem('mb_synced')||'[]'));
for(const x of P.filter(p=>hs.has(p.s))){if(x.imgs&&x.imgs.some(u=>typeof u==='string'&&u.startsWith('loading:')))continue;if(postSig(x)===x._sh&&x.synced)continue;
 try{const imgs=[];for(const u of x.imgs||[]){const v=await upImg(u);if(v)imgs.push(v)}if(!imgs.length)continue;const j=await api('PUT','/api/posts/'+x.id,{s:x.s,h:x.h,d:x.d,p:x.p,cur:x.cur,po:x.po,c:x.c,imgs,ic:x.ic,bg:x.bg,fg:x.fg,sold:!!x.sold,soldAt:x.soldAt,soldPrice:x.soldPrice,rp:x.rp,at:x.at});x.imgs=imgs;x.synced=1;x._sh=postSig(x);done.add(String(x.id))}catch(e){if(e.code===410){const i=P.indexOf(x);if(i>=0)P.splice(i,1);toast('One of your posts was removed by myboutiki')}}}
for(const id of [...done]){const x=P.find(p=>String(p.id)===id);if(!x||(!hs.has(x.s)&&!isMine(x.s))){if(!x){try{await api('DELETE','/api/posts/'+id)}catch(_){}}done.delete(id)}}
localStorage.setItem('mb_synced',JSON.stringify([...done]));queueSave()}catch(_){}finally{SYNC.busy=false}}
// follows (followers / following) on the server
async function fwInit(){const h=me();if(!h||!SYNC.uid||!isMine(h))return;try{const j=await (await fetch(API+'/api/follows?h='+encodeURIComponent(h),{cache:'no-store'})).json();if(!j||!j.following)return;const srv=new Set(j.following),k='mb_fwp_'+h;
if(!localStorage.getItem(k)&&(!S.followOf||S.followOf===h)){for(const t of [...S.follow])if(!srv.has(t)&&t!==h){try{await api('PUT','/api/follows/'+encodeURIComponent(t)+'?from='+encodeURIComponent(h));srv.add(t)}catch(_){}}localStorage.setItem(k,'1')}
if(me()!==h)return;S.follow=srv;S.followOf=h;FW[h]={followers:j.followers||[],following:[...srv]};render(true)}catch(_){}}
async function syncStart(){const tok=await fbToken();if(!tok)return;try{await syncMe();SYNC.on=true;render(true);queueSync()}catch(_){}}
setInterval(()=>{if(document.visibilityState==='visible'){syncPull();if(SYNC.uid)syncMe().then(()=>render(true)).catch(()=>{})}},60000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&Date.now()-SYNC.lastPull>15000)syncPull()});
async function boot(){""")
# pull on boot; resume sync if Firebase session exists
R("payReturn();fbRedirectResult();","payReturn();fbRedirectResult();syncPull();setTimeout(()=>syncStart(),400);")
# after every render: push my changes
R("function render(keep){queueMicrotask(trkView);","function render(keep){queueMicrotask(trkView);queueSync();")
# Google sign-in -> load my shops from the server first
R("function fbAccount(fu){const em=(fu.email||'').toLowerCase(),n=fu.displayName||em.split('@')[0];","async function fbAccount(fu){const em=(fu.email||'').toLowerCase(),n=fu.displayName||em.split('@')[0];SYNC.uid=fu.uid;SYNC.email=em;try{await syncMe()}catch(_){}")
# new store: make sure the username is free on the server before creating it
R("case 'finish':{","case 'finish':{if(SYNC.uid&&S._hOk!==S.un){const v=S.un;if(/^[a-z0-9._]{3,30}$/.test(v)){fetch(API+'/api/handle?h='+encodeURIComponent(v)).then(r=>r.json()).then(j=>{if(j.available){S._hOk=v;el.click()}else{SRV_TAKEN.add(v);checkUser(true)}}).catch(()=>{S._hOk=v;el.click()});break}}")
R("const u={name:S.pending.name,email:S.pending.email,handle:S.un,","const u={uid:SYNC.uid||undefined,name:S.pending.name,email:S.pending.email,handle:S.un,")
# logout: also stop syncing
R("case 'logout':fbOut();S.menu=false;","case 'logout':fbOut();SYNC.uid='';SYNC.email='';S.menu=false;")
# follows: load lists, follow/unfollow/remove on the server
R("function fwLoad(h){}","function fwLoad(h){fetch(API+'/api/follows?h='+encodeURIComponent(h),{cache:'no-store'}).then(r=>r.json()).then(j=>{if(j&&j.followers){FW[h]=j;if(h===me()&&isMine(h)){j.following=[...S.follow]}render(true)}}).catch(()=>{})}")
R("function fwPush(t,on){}","function fwPush(t,on){const h=me();if(!h||!SYNC.uid||!isMine(h))return;api(on?'PUT':'DELETE','/api/follows/'+encodeURIComponent(t)+'?from='+encodeURIComponent(h)).catch(()=>{})}")
R("function fwRemove(f){}","function fwRemove(f){const h=me();if(!h||!SYNC.uid||!isMine(h))return;api('DELETE','/api/follows/'+encodeURIComponent(f)+'?from='+encodeURIComponent(h)+'&remove=1').catch(()=>{})}")
R("if(r&&(!S.user||regKey(r)!==regKey(S.user))){S.user=r;","if(r&&(!S.user||regKey(r)!==regKey(S.user))){S.user=r;if(isMine(r.handle)){S.follow=new Set();S.followOf=r.handle;setTimeout(fwInit,0)}")
# real messages between shops (server)
R("function msgPush(c,m){}","function msgPush(c,m){const h=me();if(!SYNC.uid||!isMine(h)||!m)return;api('POST','/api/messages',{from:h,to:other(c),text:m.t,pid:c.pid||null}).then(j=>{m.sid=j.message.id;queueSave()}).catch(e=>{if(e.code===404||e.code===429)toast(e.message)})}")
R("function msgClear(list){}","function msgClear(list){const h=me();if(!SYNC.uid||!isMine(h))return;api('POST','/api/messages/clear',list?{h,with:list}:{h,all:true}).catch(()=>{})}\nlet MSGL={};async function msgPull(){const h=me();if(!SYNC.uid||!h||!isMine(h))return;try{const j=await api('GET','/api/messages?h='+encodeURIComponent(h)+'&since='+(MSGL[h]||0));let got=0;for(const r of j.messages||[]){MSGL[h]=Math.max(MSGL[h]||0,r.id);const o=r.f===h?r.t:r.f;const c=chatWith(o,r.pid?(isNaN(+r.pid)?r.pid:+r.pid):undefined);if(c.m.some(x=>x.sid===r.id))continue;const loc=r.f===h&&c.m.find(x=>!x.sid&&x.f===h&&x.t===r.text);if(loc){loc.sid=r.id;continue}c.m.push({f:r.f,t:r.text,at:r.at,sid:r.id});c.m.sort((a,b)=>a.at-b.at);if(r.f!==h)got++}if(got){queueSave();const f=S.stack[S.stack.length-1];if(f&&f.k==='chat')rerenderChat(f.u);else if(!document.activeElement?.matches('input,textarea'))render(true)}}catch(_){}}\nsetInterval(()=>{if(document.visibilityState==='visible')msgPull()},8000);")
# email / username / phone + password accounts, and native sign-in inside the phone apps
R("async function emailSignup(d){makeUser(d.name,d.email,d.avatar?{avatar:d.avatar}:{})}",r"""const AUTHERR=e=>{const c=e&&e.code||'';return c==='auth/email-already-in-use'?tr('This email already has an account. Log in instead.'):/invalid-credential|wrong-password|user-not-found|invalid-email/.test(c)?tr('Wrong login or password'):c==='auth/weak-password'?tr('Password must be at least 8 characters'):c==='auth/too-many-requests'?tr('Too many attempts. Try again in a few minutes.'):c==='auth/network-request-failed'?tr('No internet connection'):(e&&e.message)||tr('Could not create the account. Try again.')};
async function emailSignup(d){try{const h=await (await fetch(API+'/api/handle?h='+encodeURIComponent(S.un))).json();if(!h.available){SRV_TAKEN.add(S.un);checkUser(true);throw new Error('@'+S.un+' '+tr('is already taken. Try another.'))}}catch(e){if(e.message&&e.message.startsWith('@'))throw e}
const {U,auth}=await fbLoad();let r;try{r=await U.createUserWithEmailAndPassword(auth,d.email,d.pw)}catch(e){throw new Error(AUTHERR(e))}
try{await U.updateProfile(r.user,{displayName:d.name})}catch(_){}SYNC.uid=r.user.uid;SYNC.email=d.email;makeUser(d.name,d.email,{uid:r.user.uid,...(d.avatar?{avatar:d.avatar}:{})});queueSync()}""")
R("async function emailLogin(id,pw){",r"""async function emailLogin(id,pw){let email=id;if(!id.includes('@')){const r=await fetch(API+'/api/login-id',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,pw})});const j=await r.json().catch(()=>({}));if(!r.ok||!j.email)throw new Error(tr(j.error||'Wrong login or password'));email=j.email}
const {U,auth}=await fbLoad();let r;try{r=await U.signInWithEmailAndPassword(auth,email,pw)}catch(e){throw new Error(AUTHERR(e))}await fbAccount(r.user)}
async function emailLoginLocal(id,pw){""")
R("async function emailForgot(email){toast(tr('Password reset link sent to')+' '+email)}",r"""async function emailForgot(id){if(!id.includes('@'))throw new Error(tr('Enter the email of your account to reset the password'));const {U,auth}=await fbLoad();try{await U.sendPasswordResetEmail(auth,id)}catch(e){if(!/user-not-found/.test(e&&e.code||''))throw new Error(AUTHERR(e))}toast(tr('Password reset link sent to')+' '+id)}""")
R("async function fbGoogle(el){",r"""window.mbNativeAuth=async d=>{if(!d||d.cancel)return;if(d.error){toast(tr("Couldn't sign in. Please try again."));return}try{const {U,auth}=await fbLoad();const cred=d.provider==='apple'?new U.OAuthProvider('apple.com').credential({idToken:d.idToken,rawNonce:d.rawNonce}):U.GoogleAuthProvider.credential(d.idToken,d.accessToken);const r=await U.signInWithCredential(auth,cred);if(d.name&&!r.user.displayName){try{await U.updateProfile(r.user,{displayName:d.name})}catch(_){}}await fbAccount(r.user)}catch(e){toast(tr("Couldn't sign in. Please try again."))}};
async function fbGoogle(el){if(IS_APP&&window.MBApp){MBApp.postMessage(JSON.stringify({type:'google'}));return}""")
R("case 'apple':toast(tr('Sign in with Apple works in the iPhone app'));break;","case 'apple':if(window.MBApp)MBApp.postMessage(JSON.stringify({type:'apple'}));else toast(tr('Sign in with Apple works in the iPhone app'));break;")
# admin switch to hide the sample shops
R("function applyCfg(c){if(!c||!c.verified)return;","function applyCfg(c){if(!c||!c.verified)return;if(c.showSamples===false){for(let i=P.length-1;i>=0;i--)if(P[i].id<100&&!P[i].remote&&['noor.abayas','cheetah.watches','q8.menswear','thepinkstore'].includes(P[i].s))P.splice(i,1)}")

# ---- write pages into the Astro public folder with SEO heads
import html
def head(lang):
    ar=lang=='ar'
    title='ماي بوتيكي — تسوّق وبِع من متاجر الخليج' if ar else 'myboutiki — Shop and sell with your community | Gulf social marketplace'
    desc=('ماي بوتيكي سوق بأسلوب إنستغرام في الخليج: تصفّح منتجات المتاجر المحلية، احفظ ما يعجبك، واطلب مباشرة عبر واتساب. افتح متجرك بدون إيجار محل — الكويت والسعودية والإمارات والبحرين وقطر وعُمان.' if ar else
          'myboutiki is an Instagram-style marketplace for the Gulf. Browse items from local shops, save favourites and order straight on WhatsApp. Open your own shop without renting a store — Kuwait, Saudi Arabia, UAE, Bahrain, Qatar and Oman.')
    url='https://myboutki.com/ar/' if ar else 'https://myboutki.com/'
    ld=[{"@context":"https://schema.org","@type":"WebSite","name":"myboutiki","alternateName":"ماي بوتيكي","url":"https://myboutki.com/","inLanguage":["en","ar"]},
        {"@context":"https://schema.org","@type":"Organization","name":"myboutiki","url":"https://myboutki.com/","logo":"https://myboutki.com/img/favicon.png?v=2","email":"support@myboutki.com","areaServed":["KW","SA","AE","BH","QA","OM"]}]
    e=html.escape
    return f'''<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="en" href="https://myboutki.com/">
<link rel="alternate" hreflang="ar" href="https://myboutki.com/ar/">
<link rel="alternate" hreflang="x-default" href="https://myboutki.com/">
<meta property="og:type" content="website"><meta property="og:site_name" content="myboutiki">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}"><meta property="og:image" content="https://myboutki.com/img/og.jpg?v=4">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:locale" content="{'ar_KW' if ar else 'en_US'}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://myboutki.com/img/og.jpg?v=4">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#17212b" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="myboutiki">
<link rel="icon" type="image/svg+xml" href="/img/mark.svg?v=2"><link rel="icon" type="image/png" sizes="512x512" href="/img/favicon.png?v=2"><link rel="apple-touch-icon" href="/img/favicon.png?v=2">
<link rel="manifest" href="/manifest.webmanifest">\n<link rel="preconnect" href="https://www.gstatic.com" crossorigin><link rel="preconnect" href="https://identitytoolkit.googleapis.com" crossorigin>
<script type="application/ld+json">{json.dumps(ld,ensure_ascii=False)}</script>
<noscript><style>.stage{{display:none}}</style><p style="padding:24px;font:16px system-ui">{'ماي بوتيكي يحتاج إلى تفعيل JavaScript.' if ar else 'myboutiki needs JavaScript turned on.'} <a href="{'/ar/about/' if ar else '/about/'}">{'عن ماي بوتيكي' if ar else 'About myboutiki'}</a></p></noscript>'''
for lang,out in [('en','index.html'),('ar','ar/index.html')]:
    t=s.replace('<title>myboutiki app preview</title>',head(lang),1)
    if lang=='ar':t=t.replace('<html lang="en">','<html lang="ar">',1)
    p=os.path.join(WEB,'public',out);os.makedirs(os.path.dirname(p),exist_ok=True);open(p,'w').write(t)
for f in ['av_pink.jpg','av_cheetah.jpg','av_diamond.jpg','av_noor.jpg']:
    shutil.copy('/home/claude/proto/'+f,os.path.join(WEB,'public/img',f))
open(os.path.join(WEB,'public/manifest.webmanifest'),'w').write(json.dumps({"name":"myboutiki","short_name":"myboutiki","start_url":"/","display":"standalone","background_color":"#ffffff","theme_color":"#ffffff","icons":[{"src":"/img/favicon.png?v=2","sizes":"512x512","type":"image/png"}]}))
open(os.path.join(WEB,'public/sitemap.xml'),'w').write('''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
'''+''.join(f'''<url><loc>https://myboutki.com{a}</loc><xhtml:link rel="alternate" hreflang="en" href="https://myboutki.com{e_}"/><xhtml:link rel="alternate" hreflang="ar" href="https://myboutki.com{r}"/><changefreq>daily</changefreq><priority>{pr}</priority></url>
''' for a,e_,r,pr in [('/','/','/ar/','1.0'),('/ar/','/','/ar/','1.0'),('/about/','/about/','/ar/about/','0.8'),('/ar/about/','/about/','/ar/about/','0.8')])+'</urlset>\n')

# ---- SEO pages for every product and shop (also give WhatsApp/Instagram a photo preview)
PROD=json.load(open('/home/claude/build/products.json'))
def kwd(v): return f"KWD {v:,.3f}"
def page(path,title,desc,img,url,ld,extra_meta='',noscript=''):
    e=html.escape
    h=f"""<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{url}">
<meta property="og:site_name" content="myboutiki"><meta property="og:url" content="{url}">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}">
<meta property="og:image" content="{img}"><meta property="og:image:alt" content="{e(title)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(title)}"><meta name="twitter:description" content="{e(desc)}"><meta name="twitter:image" content="{img}">
{extra_meta}
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#17212b" media="(prefers-color-scheme: dark)">
<link rel="icon" type="image/svg+xml" href="/img/mark.svg?v=2"><link rel="apple-touch-icon" href="/img/favicon.png?v=2"><link rel="manifest" href="/manifest.webmanifest">
<script type="application/ld+json">{json.dumps(ld,ensure_ascii=False)}</script>
<noscript><style>.stage{{display:none}}</style>{noscript}</noscript>"""
    t=s.replace('<title>myboutiki app preview</title>',h,1)
    p=os.path.join(WEB,'public',path.strip('/'),'index.html');os.makedirs(os.path.dirname(p),exist_ok=True);open(p,'w').write(t)
SITE='https://myboutki.com'
shops={}
for x in PROD:
    url=x['link'];path=url.replace(SITE,'');img=SITE+x['img']
    title=f"{x['h']} – {kwd(x['p'])} | {x['shop']} on myboutiki"
    desc=f"{x['d']} Order on WhatsApp from {x['shop']} (@{x['s']}). Product code {x['code']}."[:300]
    ld=[{"@context":"https://schema.org","@type":"Product","name":x['h'],"description":x['d'],"image":[img],"sku":x['code'],"productID":x['code'],"category":x['c'],
         "brand":{"@type":"Brand","name":x['shop']},
         "offers":{"@type":"Offer","url":url,"price":f"{x['p']:.3f}","priceCurrency":"KWD","availability":"https://schema.org/InStock","itemCondition":"https://schema.org/NewCondition","seller":{"@type":"Organization","name":x['shop'],"url":f"{SITE}/@{x['s']}"}}},
        {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"myboutiki","item":SITE+"/"},{"@type":"ListItem","position":2,"name":x['c'],"item":f"{SITE}/?q={x['c']}"},{"@type":"ListItem","position":3,"name":x['h'],"item":url}]}]
    meta=f'<meta property="og:type" content="product"><meta property="product:price:amount" content="{x["p"]:.3f}"><meta property="product:price:currency" content="KWD"><meta property="og:locale" content="en_US">'
    ns=f'<article style="padding:24px;font:16px system-ui"><h1>{html.escape(x["h"])}</h1><p>{html.escape(kwd(x["p"]))} · {html.escape(x["c"])} · Code {x["code"]}</p><img src="{x["img"]}" alt="{html.escape(x["h"])}" width="320"><p>{html.escape(x["d"])}</p><p>Sold by <a href="/@{x["s"]}">{html.escape(x["shop"])}</a></p></article>'
    page(path,title,desc,img,url,ld,meta,ns)
    shops.setdefault(x['s'],{'name':x['shop'],'items':[]})['items'].append(x)
for h,v in shops.items():
    url=f"{SITE}/@{h}";first=v['items'][0];img=SITE+first['img']
    cats=sorted({i['c'] for i in v['items']})
    title=f"{v['name']} (@{h}) – {', '.join(cats)} shop on myboutiki"
    desc=f"Shop {v['name']} on myboutiki: {', '.join(i['h'] for i in v['items'])[:180]}. Order on WhatsApp, delivery across the Gulf."
    ld=[{"@context":"https://schema.org","@type":"Store","name":v['name'],"url":url,"image":img,"alternateName":"@"+h,"areaServed":["KW","SA","AE","BH","QA","OM"],
         "makesOffer":[{"@type":"Offer","itemOffered":{"@type":"Product","name":i['h'],"sku":i['code'],"image":SITE+i['img']},"price":f"{i['p']:.3f}","priceCurrency":"KWD","url":i['link']} for i in v['items']]}]
    ns='<section style="padding:24px;font:16px system-ui"><h1>'+html.escape(v['name'])+'</h1>'+''.join(f'<p><a href="{i["link"].replace(SITE,"")}">{html.escape(i["h"])}</a> – {html.escape(kwd(i["p"]))}</p>' for i in v['items'])+'</section>'
    page(f"/@{h}",title,desc,img,url,ld,'<meta property="og:type" content="profile">',ns)
# homepage: list of products for search engines (ItemList) + sitelinks search box
for out in ['index.html','ar/index.html']:
    p=os.path.join(WEB,'public',out);t=open(p).read()
    il={"@context":"https://schema.org","@type":"ItemList","name":"Latest on myboutiki","itemListElement":[{"@type":"ListItem","position":n+1,"url":x['link'],"name":x['h']} for n,x in enumerate(PROD)]}
    sa={"@context":"https://schema.org","@type":"WebSite","url":SITE+"/","name":"myboutiki","potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":SITE+"/?q={search_term_string}"},"query-input":"required name=search_term_string"}}
    t=t.replace('<noscript>',f'<script type="application/ld+json">{json.dumps(il,ensure_ascii=False)}</script><script type="application/ld+json">{json.dumps(sa,ensure_ascii=False)}</script><noscript>',1)
    open(p,'w').write(t)
# sitemap with products, shops and images
urls=[('/','daily','1.0',None),('/ar/','daily','1.0',None),('/about/','monthly','0.7',None),('/ar/about/','monthly','0.7',None)]
import re as _re
_slugs=_re.findall(r"slug: '([a-z0-9-]+)'",open('/home/claude/web/src/blog/posts.js').read())
urls+=[('/blog/','weekly','0.8',None),('/ar/blog/','weekly','0.8',None)]+[(f'/blog/{x}/','monthly','0.8',None) for x in _slugs]+[(f'/ar/blog/{x}/','monthly','0.8',None) for x in _slugs]
urls+=[(x['link'].replace(SITE,''),'weekly','0.8',SITE+x['img']) for x in PROD]
urls+=[(f'/@{h}','weekly','0.7',SITE+v['items'][0]['img']) for h,v in shops.items()]
sm='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
for u,f,pr,img in urls:
    alt=''
    if u in ('/','/ar/'): alt='<xhtml:link rel="alternate" hreflang="en" href="https://myboutki.com/"/><xhtml:link rel="alternate" hreflang="ar" href="https://myboutki.com/ar/"/><xhtml:link rel="alternate" hreflang="x-default" href="https://myboutki.com/"/>'
    if u.startswith('/blog/') or u.startswith('/ar/blog/'):
        en=u.replace('/ar/blog/','/blog/');alt=f'<xhtml:link rel="alternate" hreflang="en" href="https://myboutki.com{en}"/><xhtml:link rel="alternate" hreflang="ar" href="https://myboutki.com/ar{en}"/>'
    if u in ('/about/','/ar/about/'): alt='<xhtml:link rel="alternate" hreflang="en" href="https://myboutki.com/about/"/><xhtml:link rel="alternate" hreflang="ar" href="https://myboutki.com/ar/about/"/>'
    sm+=f'<url><loc>{SITE}{html.escape(u)}</loc>{alt}{f"<image:image><image:loc>{img}</image:loc></image:image>" if img else ""}<changefreq>{f}</changefreq><priority>{pr}</priority></url>\n'
open(os.path.join(WEB,'public/sitemap.xml'),'w').write(sm+'</urlset>\n')
open(os.path.join(WEB,'public/robots.txt'),'w').write('User-agent: *\nAllow: /\nDisallow: /admin/\nAllow: /api/sitemap.xml\nDisallow: /api/\nDisallow: /pay/\n\nSitemap: https://myboutki.com/sitemap.xml\nSitemap: https://myboutki.com/api/sitemap.xml\n')
print('pages written')
