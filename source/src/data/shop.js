export const SITE = 'https://myboutiki.com';
export const CATS = ['Bath & Body','Eyewear','Contact Lenses','Apparel','Footwear','Sports','Derma Beauty','Electronics','Home & Living','Accessories','Watches','Perfume','Jewelry','Other'];
export const SHOPS = {
  'noor.abayas':    { name:'Noor Abayas',     avatar:'/img/av_noor.jpg',    verified:false, bio:'Apparel shop in Kuwait\n🚚 Delivery across the Gulf\n💬 Message or WhatsApp to order' },
  'cheetah.watches':{ name:'Cheetah Watches', avatar:'/img/av_cheetah.jpg', verified:true,  bio:'Watches shop in Kuwait\n🚚 Delivery across the Gulf\n💬 Message or WhatsApp to order' },
  'q8.menswear':    { name:'Q8 Menswear',     avatar:'/img/av_diamond.jpg', verified:false, bio:'Apparel shop in Kuwait\n🚚 Delivery across the Gulf\n💬 Message or WhatsApp to order' },
  'thepinkstore':   { name:'The Pink Store',  avatar:'/img/av_pink.jpg',    verified:true,  bio:'Accessories shop in Kuwait\n🚚 Delivery across the Gulf\n💬 Message or WhatsApp to order' },
};
export const PRODUCTS = [
  { id:2, shop:'cheetah.watches', img:'/img/watch.jpg', price:3950, cat:'Watches', likes:612, caption:'Steel GMT watch with black ceramic bezel. Full set with box and papers. Excellent condition.' },
  { id:3, shop:'thepinkstore',    img:'/img/bag.jpg',   price:1250, cat:'Accessories', likes:980, caption:'Burgundy leather shoulder bag with gold clasp. Pebbled leather, barely used.' },
  { id:1, shop:'noor.abayas',     img:'/img/abaya.jpg', price:45,   cat:'Apparel', likes:214, caption:'Black abaya with gold lace trim. Open front with wide sleeves. Sizes 52 to 60. Delivery across Kuwait.' },
  { id:4, shop:'q8.menswear',     img:'/img/polo.jpg',  price:18,   cat:'Apparel', likes:143, caption:'Green knit polo with open collar. Breathable cotton, sizes S to XL. Free delivery in Kuwait City.' },
];
// same headline + link rules as the app, so shared links match
export function headline(d){let t=String(d||'').split('\n').find(l=>l.trim())||'';t=t.split(/[.!?؟:;|]|\s[-–]\s/)[0].trim();const c=t.split(/[,،]/)[0].trim();if(c.split(' ').length>=2)t=c;let w=t.split(' ').filter(Boolean).slice(0,7);t=w.join(' ');return t?t[0].toUpperCase()+t.slice(1):'New listing'}
export const slug=t=>String(t||'').toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-+|-+$/g,'').slice(0,50);
export const pathOf=p=>`/p/${p.id}${slug(headline(p.caption))?'-'+slug(headline(p.caption)):''}`;
export const kwd=v=>'KWD '+v.toLocaleString('en-US',{minimumFractionDigits:3,maximumFractionDigits:3});
export const byVerified=list=>list.slice().sort((a,b)=>(SHOPS[b.shop].verified-SHOPS[a.shop].verified));
