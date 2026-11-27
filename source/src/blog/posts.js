// myboutiki blog. Each post has the same slug in English and Arabic so hreflang pairs line up.
// Figures come from public listings and news published in 2026 (linked in each article).

const SRC = {
  shops: 'https://www.mourjan.com/kw/shops/rental/en/7/',
  shops2: 'https://www.mourjan.com/kw/al-kuwayt/shops/rental/en/c-2643-2/6/',
  salmiya: 'https://www.mourjan.com/kw/hawalli-governorate/shops/rental/en/c-2432-2/2/',
  booth: 'https://sa.opensooq.com/en/search/288644326',
  freelance: 'https://curlytales.com/middle-east/ct-scoop/kuwait-introduces-new-freelance-licence-allowing-citizens-to-run-one-person-businesses-from-home/',
  freelance2: 'https://arynews.tv/kuwait-overhauls-commercial-laws-to-let-freelance-businesses-operate-without-traditional-offices',
  law: 'https://chambers.com/articles/kuwait-s-new-digital-commerce-law-what-businesses-need-to-know',
  law2: 'https://www.arabtimesonline.com/news/online-sellers-must-now-secure-a-license-in-kuwait',
};
const a = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const cta = {
  en: `<div class="cta"><b>Open your shop on myboutiki</b><p>Post your items, get orders on WhatsApp, and keep the money you would spend on rent.</p><a class="btn" href="/">Start selling free</a></div>`,
  ar: `<div class="cta"><b>افتح متجرك على ماي بوتيكي</b><p>انشر منتجاتك واستقبل الطلبات عبر واتساب، ووفّر المبلغ الذي كنت ستدفعه للإيجار.</p><a class="btn" href="/ar/">ابدأ البيع مجاناً</a></div>`,
};

export const posts = [
  {
    slug: 'booth-and-shop-rent-cost-kuwait',
    date: '2026-11-27',
    img: '/img/bag.jpg',
    en: {
      title: 'Booth and shop rent in Kuwait: what it really costs, and a cheaper way to sell',
      desc: 'Real shop and booth rent examples in Kuwait and the Gulf, the hidden costs on top of rent, and how small sellers can reach buyers without paying for a physical space.',
      tag: 'Costs',
      body: `
<p>If you sell abayas, perfumes, accessories or homemade products, the first big question is usually <em>where</em> to sell. For many small sellers in Kuwait and the Gulf, the answer has been a shop, a mall kiosk or a booth at an exhibition. Before you sign anything, it helps to see what that space really costs.</p>
<h2>What shops cost to rent in Kuwait</h2>
<p>Public listings in November 2026 give a clear picture. ${a(SRC.shops, 'A 16 square metre shop in Jahra was listed at KWD 500 a month')}. In Shuwaikh, ${a(SRC.shops2, 'a 30 m² shop was listed at KWD 600 and a 50 m² shop at KWD 1,000 to 1,200')}. On Gulf Street in Salmiya, ${a(SRC.salmiya, 'a 28 m² shop was listed at KWD 1,300 a month')}.</p>
<p>That is before the extras. Many listings ask for ${a(SRC.shops2, 'a security deposit of one month’s rent plus an agency commission')}, so a KWD 600 shop can need around KWD 1,500 on day one, before you buy a single shelf.</p>
<h2>Booths and exhibition spaces</h2>
<p>Short-term booths look cheaper, but they add up. In Saudi Arabia, for example, ${a(SRC.booth, 'booths at Boulevard World were advertised from SAR 1,000')} for a stay. Exhibition booths usually come with design, printing, transport and staff costs, and you only sell for the days the event runs.</p>
<h2>The hidden costs on top of rent</h2>
<ul>
<li><b>Fit-out:</b> shelves, lighting, mirrors, signage and a counter.</li>
<li><b>Staff:</b> someone has to stand in the shop every hour it is open.</li>
<li><b>Utilities and fees:</b> electricity, internet and municipality fees.</li>
<li><b>Lock-in:</b> leases often run a year or more, even if sales are slow.</li>
<li><b>Limited reach:</b> a shop only sells to people who walk past it.</li>
</ul>
<h2>A quick comparison</h2>
<table><tr><th></th><th>Small shop</th><th>myboutiki shop</th></tr>
<tr><td>Monthly rent</td><td>KWD 500 to 1,300+</td><td>KWD 0</td></tr>
<tr><td>Deposit and commission</td><td>Often 1 to 2 months’ rent</td><td>None</td></tr>
<tr><td>Who can see your products</td><td>People who walk in</td><td>Buyers across Kuwait, Saudi Arabia, UAE, Bahrain, Qatar and Oman</td></tr>
<tr><td>Open hours</td><td>When staff are there</td><td>24 hours a day</td></tr>
<tr><td>Time to start</td><td>Weeks</td><td>Minutes</td></tr></table>
<h2>Selling without paying rent</h2>
<p>myboutiki gives every seller a shop profile, like an Instagram page built only for selling. You post photos and a price, buyers browse and save items, then send you one WhatsApp message with everything in their cart. Opening a shop is free. If you want extra reach, you can boost a post or get the blue Verified badge, and you only pay when you choose to.</p>
<p>You can still keep a physical shop if it works for you. Many sellers use myboutiki first to test which products sell, and only rent space once they know the demand is there.</p>
${cta.en}`,
    },
    ar: {
      title: 'إيجار البوث والمحل في الكويت: كم يكلّف فعلاً، وما الطريقة الأوفر للبيع',
      desc: 'أمثلة حقيقية لإيجارات المحلات والبوثات في الكويت والخليج، والتكاليف الخفية فوق الإيجار، وكيف يصل البائع الصغير إلى المشترين بدون دفع إيجار مكان.',
      tag: 'التكاليف',
      body: `
<p>إذا كنت تبيع العبايات أو العطور أو الإكسسوارات أو المنتجات المنزلية، فأول سؤال كبير غالباً هو: <em>أين</em> أبيع؟ كثير من البائعين في الكويت والخليج يتجهون إلى محل أو كشك في مول أو بوث في معرض. قبل أن توقّع أي عقد، من المهم أن تعرف التكلفة الحقيقية.</p>
<h2>كم يكلّف إيجار محل في الكويت</h2>
<p>الإعلانات المنشورة في نوفمبر 2026 تعطي صورة واضحة: ${a(SRC.shops, 'محل مساحته 16 متراً مربعاً في الجهراء معروض بـ 500 دينار شهرياً')}، وفي الشويخ ${a(SRC.shops2, 'محل 30 متراً بـ 600 دينار ومحل 50 متراً بين 1,000 و1,200 دينار')}، وفي شارع الخليج بالسالمية ${a(SRC.salmiya, 'محل 28 متراً بـ 1,300 دينار شهرياً')}.</p>
<p>وهذا قبل المصاريف الإضافية؛ فكثير من الإعلانات تطلب ${a(SRC.shops2, 'تأميناً بقيمة إيجار شهر مع عمولة المكتب')}، أي أن محلاً بـ 600 دينار قد يحتاج حوالي 1,500 دينار في اليوم الأول قبل شراء أي رف.</p>
<h2>البوثات ومساحات المعارض</h2>
<p>البوث القصير يبدو أرخص، لكن التكاليف تتراكم. في السعودية مثلاً ${a(SRC.booth, 'أُعلن عن بوثات في البوليفارد وورلد ابتداءً من 1,000 ريال')}. ومعظم بوثات المعارض تحتاج تصميماً وطباعة ونقلاً وموظفين، وتبيع فقط خلال أيام المعرض.</p>
<h2>التكاليف الخفية فوق الإيجار</h2>
<ul>
<li><b>التجهيز:</b> رفوف وإضاءة ومرايا ولوحة وكاونتر.</li>
<li><b>الموظفون:</b> لا بد من وجود شخص في المحل طوال ساعات العمل.</li>
<li><b>الخدمات والرسوم:</b> الكهرباء والإنترنت ورسوم البلدية.</li>
<li><b>الالتزام:</b> العقود غالباً سنة أو أكثر حتى لو كانت المبيعات ضعيفة.</li>
<li><b>وصول محدود:</b> المحل يبيع فقط لمن يمر من أمامه.</li>
</ul>
<h2>مقارنة سريعة</h2>
<table><tr><th></th><th>محل صغير</th><th>متجر على ماي بوتيكي</th></tr>
<tr><td>الإيجار الشهري</td><td>من 500 إلى 1,300 دينار وأكثر</td><td>0 دينار</td></tr>
<tr><td>التأمين والعمولة</td><td>غالباً إيجار شهر أو شهرين</td><td>لا يوجد</td></tr>
<tr><td>من يرى منتجاتك</td><td>من يدخل المحل</td><td>مشترون في الكويت والسعودية والإمارات والبحرين وقطر وعُمان</td></tr>
<tr><td>ساعات العمل</td><td>بوجود الموظف</td><td>24 ساعة</td></tr>
<tr><td>وقت البدء</td><td>أسابيع</td><td>دقائق</td></tr></table>
<h2>البيع بدون إيجار</h2>
<p>ماي بوتيكي يعطي كل بائع صفحة متجر تشبه حساب إنستغرام لكنها مخصّصة للبيع فقط. تنشر الصور والسعر، ويتصفح المشترون ويحفظون المنتجات، ثم يرسلون لك رسالة واتساب واحدة بكل ما في السلة. فتح المتجر مجاني، وإذا أردت وصولاً أكبر يمكنك ترويج منشور أو الحصول على شارة التوثيق الزرقاء، ولا تدفع إلا عندما تختار ذلك.</p>
<p>يمكنك أيضاً الاحتفاظ بمحلك إذا كان مناسباً لك. كثير من البائعين يبدؤون على ماي بوتيكي لاختبار المنتجات الأكثر طلباً، ثم يستأجرون مساحة بعد التأكد من الطلب.</p>
${cta.ar}`,
    },
  },
  {
    slug: 'selling-platform-vs-instagram',
    date: '2026-11-27',
    img: '/img/watch.jpg',
    en: {
      title: 'Why a platform made only for selling beats posting on social media',
      desc: 'Instagram and Snapchat are built for entertainment. Here is why sellers in the Gulf get more orders on a platform built only for buying and selling, and how myboutiki works.',
      tag: 'Marketing',
      body: `
<p>Most small shops in the Gulf started on Instagram, Snapchat or TikTok. They are great for being seen, but they were not built for buying. Buyers scroll past your post between videos, friends and ads, and your products compete with everything else on their screen.</p>
<h2>The problem with selling on a general social app</h2>
<ul>
<li><b>Buyers are not in shopping mode.</b> People open social apps to be entertained, not to compare abayas or watches.</li>
<li><b>No prices, no search.</b> Many posts say “price in DM”. Buyers who just want a quick answer leave.</li>
<li><b>Orders are messy.</b> Sizes, colours and addresses are scattered across chats and comments.</li>
<li><b>Reach keeps shrinking.</b> Without paid ads, a new post may only reach a small part of your followers.</li>
</ul>
<h2>What a selling-only platform does differently</h2>
<p>On myboutiki, everyone who opens the app is there to shop. Every post is an item with a price and a product code. Buyers can search, filter by category such as Apparel, Watches or Derma Beauty, save items to Favourites and follow shops.</p>
<ul>
<li><b>Clear prices</b> in KWD, SAR, AED, BHD, QAR or OMR.</li>
<li><b>One cart, one WhatsApp message.</b> The buyer adds items and sends the seller a single message listing every item, price and link.</li>
<li><b>Shop highlights and links</b> so buyers see your collections, branches and reviews at a glance.</li>
<li><b>Verified shops shown first</b>, so buyers trust you more.</li>
<li><b>Boost a post</b> to show it first in Home, Explore and search in the Gulf countries you choose.</li>
</ul>
<h2>It is not either-or</h2>
<p>Keep your Instagram for brand stories. Use myboutiki as your shop window and checkout. You can share any item to Instagram as a ready-made post or story image, with your price and a link back to the item, so your followers can order in a few taps.</p>
<h2>Why this matters more in 2026</h2>
<p>Kuwait now regulates online selling. ${a(SRC.law, 'Decree-Law No. 10 of 2026')} covers online sales, and ${a(SRC.law2, 'online sellers must now secure a licence')}. A clear shop with fixed prices, product codes and order records makes running a proper business much easier than a feed of DMs.</p>
${cta.en}`,
    },
    ar: {
      title: 'لماذا تتفوّق منصة مخصّصة للبيع على النشر في وسائل التواصل',
      desc: 'إنستغرام وسناب شات صُمّما للترفيه. إليك لماذا يحصل البائعون في الخليج على طلبات أكثر من منصة مخصّصة للبيع والشراء فقط، وكيف يعمل ماي بوتيكي.',
      tag: 'التسويق',
      body: `
<p>معظم المتاجر الصغيرة في الخليج بدأت على إنستغرام أو سناب شات أو تيك توك. هذه التطبيقات ممتازة للظهور، لكنها لم تُصمَّم للشراء. المشتري يمرّ على منشورك بين الفيديوهات والأصدقاء والإعلانات، ومنتجاتك تنافس كل شيء آخر على شاشته.</p>
<h2>مشكلة البيع على تطبيق تواصل عام</h2>
<ul>
<li><b>المشتري ليس في وضع التسوّق.</b> الناس يفتحون تطبيقات التواصل للترفيه، لا لمقارنة العبايات أو الساعات.</li>
<li><b>لا أسعار ولا بحث.</b> كثير من المنشورات تقول «السعر بالخاص»، والمشتري المستعجل يغادر.</li>
<li><b>الطلبات متفرّقة.</b> المقاسات والألوان والعناوين موزّعة بين الرسائل والتعليقات.</li>
<li><b>الوصول يقلّ.</b> بدون إعلانات مدفوعة قد لا يصل المنشور الجديد إلا لجزء صغير من متابعيك.</li>
</ul>
<h2>ما الذي تفعله منصة البيع بشكل مختلف</h2>
<p>في ماي بوتيكي كل من يفتح التطبيق هدفه التسوّق. كل منشور هو منتج بسعر ورمز منتج. يستطيع المشتري البحث والتصفية حسب الفئة مثل الملابس أو الساعات أو العناية بالبشرة، وحفظ المنتجات في المفضلة ومتابعة المتاجر.</p>
<ul>
<li><b>أسعار واضحة</b> بالدينار الكويتي أو الريال السعودي أو الدرهم أو الدينار البحريني أو الريال القطري أو العُماني.</li>
<li><b>سلة واحدة ورسالة واتساب واحدة.</b> يضيف المشتري المنتجات ويرسل للبائع رسالة واحدة فيها كل منتج وسعره ورابطه.</li>
<li><b>هايلايت وروابط للمتجر</b> ليرى المشتري مجموعاتك وفروعك وآراء العملاء بسرعة.</li>
<li><b>المتاجر الموثّقة تظهر أولاً</b> فيثق بك المشتري أكثر.</li>
<li><b>ترويج المنشور</b> ليظهر أولاً في الرئيسية والاستكشاف والبحث في الدول الخليجية التي تختارها.</li>
</ul>
<h2>ليس خياراً بين هذا وذاك</h2>
<p>احتفظ بحسابك في إنستغرام لقصص علامتك التجارية، واستخدم ماي بوتيكي كواجهة متجرك وصندوق الطلبات. يمكنك مشاركة أي منتج إلى إنستغرام كصورة منشور أو قصة جاهزة فيها السعر ورابط المنتج، ليطلب متابعوك بضغطات قليلة.</p>
<h2>لماذا يهمّ هذا أكثر في 2026</h2>
<p>أصبحت الكويت تنظّم البيع عبر الإنترنت؛ ف${a(SRC.law, 'المرسوم بقانون رقم 10 لسنة 2026')} يشمل البيع الإلكتروني، و${a(SRC.law2, 'أصبح على البائعين عبر الإنترنت الحصول على ترخيص')}. متجر واضح بأسعار ثابتة ورموز منتجات وسجل طلبات يجعل إدارة نشاط تجاري نظامي أسهل بكثير من صندوق رسائل.</p>
${cta.ar}`,
    },
  },
  {
    slug: 'sell-from-home-kuwait-2026',
    date: '2026-11-27',
    img: '/img/abaya.jpg',
    en: {
      title: 'How to sell from home in Kuwait in 2026: licence, photos, delivery and WhatsApp orders',
      desc: 'A practical guide to starting a home shop in Kuwait in 2026: the new freelance licence, the digital commerce law, taking good photos, pricing, delivery and getting orders on WhatsApp.',
      tag: 'Guide',
      body: `
<p>Selling from home has never been easier in Kuwait, and in 2026 it also became more official. Here is a simple path from your first product to your first order.</p>
<h2>1. Check the licence you need</h2>
<p>In November 2026, Kuwait’s Ministry of Commerce and Industry ${a(SRC.freelance, 'allowed eligible Kuwaiti citizens to run one-person freelance companies without renting a shop or office')}, with applications through Kuwait Business Centre and the Sahel apps. These licences ${a(SRC.freelance, 'cover selling your own products through exhibits, temporary markets and online platforms')}. Separately, the ${a(SRC.law, 'Digital Commerce Law (Decree-Law No. 10 of 2026)')} means ${a(SRC.law2, 'online sellers need a licence')}.</p>
<p class="note">Rules change and depend on your situation, so confirm the exact requirements with the Ministry of Commerce and Industry before you start. This article is general information, not legal advice.</p>
<h2>2. Take photos that sell</h2>
<ul><li>Use daylight near a window and a plain wall or sheet.</li><li>Show the whole item, then close-ups of the fabric, stitching or details.</li><li>Add a photo of the item being worn or used. On myboutiki you can post up to 10 photos per item.</li></ul>
<h2>3. Write a clear caption and price</h2>
<p>Say what it is, the size or measurements, the material and the condition. Always show the price. myboutiki writes a short headline from your caption automatically and gives every item a product code, so buyers can ask for “MB000123” instead of describing it.</p>
<h2>4. Decide on delivery and payment</h2>
<p>Pick one or two delivery options you trust and say them in your bio, for example “Delivery across Kuwait in 24 hours”. Tell buyers how they can pay. On myboutiki, the buyer sends you one WhatsApp message with every item and the total, and you confirm delivery and payment directly.</p>
<h2>5. Build trust</h2>
<ul><li>Add your logo, a short bio, your phone and links such as your Instagram.</li><li>Use highlights for “New collection”, “Feedback” and “Branches”.</li><li>Get the blue Verified badge: you show an ID to myboutiki once, and buyers see a real, accountable shop. Verified shops also appear first.</li></ul>
<h2>6. Grow</h2>
<p>Post new items regularly, share them to Instagram as ready-made images, and boost your best item to show it first in Home, Explore and search in the Gulf countries you choose.</p>
${cta.en}`,
    },
    ar: {
      title: 'كيف تبيع من البيت في الكويت في 2026: الترخيص والتصوير والتوصيل وطلبات واتساب',
      desc: 'دليل عملي لبدء متجر منزلي في الكويت في 2026: ترخيص العمل الحر الجديد، وقانون التجارة الرقمية، والتصوير الجيد، والتسعير، والتوصيل، واستقبال الطلبات عبر واتساب.',
      tag: 'دليل',
      body: `
<p>البيع من البيت في الكويت أصبح أسهل من أي وقت، وفي 2026 أصبح أكثر تنظيماً أيضاً. إليك طريقاً بسيطاً من أول منتج إلى أول طلب.</p>
<h2>1. تأكّد من الترخيص المطلوب</h2>
<p>في نوفمبر 2026 ${a(SRC.freelance, 'سمحت وزارة التجارة والصناعة للمواطنين الكويتيين المؤهّلين بتأسيس شركات عمل حر من شخص واحد بدون استئجار محل أو مكتب')}، مع التقديم عبر مركز الكويت للأعمال وتطبيقات سهل، وتشمل هذه التراخيص ${a(SRC.freelance, 'بيع منتجاتك عبر المعارض والأسواق المؤقتة والمنصات الإلكترونية')}. ومن جهة أخرى، فإن ${a(SRC.law, 'قانون التجارة الرقمية (المرسوم بقانون رقم 10 لسنة 2026)')} يعني أن ${a(SRC.law2, 'البائع عبر الإنترنت يحتاج إلى ترخيص')}.</p>
<p class="note">القوانين تتغيّر وتختلف حسب وضعك، لذا تأكّد من المتطلبات الدقيقة مع وزارة التجارة والصناعة قبل البدء. هذا المقال معلومات عامة وليس استشارة قانونية.</p>
<h2>2. صوّر صوراً تبيع</h2>
<ul><li>استخدم ضوء النهار قرب النافذة وخلفية سادة.</li><li>صوّر المنتج كاملاً ثم لقطات قريبة للقماش أو الخياطة أو التفاصيل.</li><li>أضف صورة للمنتج أثناء الاستخدام. في ماي بوتيكي يمكنك نشر حتى 10 صور لكل منتج.</li></ul>
<h2>3. اكتب وصفاً واضحاً وسعراً</h2>
<p>اذكر ما هو المنتج ومقاسه وخامته وحالته، واكتب السعر دائماً. ماي بوتيكي يكتب عنواناً قصيراً من وصفك تلقائياً ويعطي كل منتج رمزاً، فيطلب المشتري «MB000123» بدل أن يصف المنتج.</p>
<h2>4. حدّد التوصيل والدفع</h2>
<p>اختر طريقة أو طريقتين للتوصيل تثق بهما واذكرهما في البايو، مثل «توصيل لكل مناطق الكويت خلال 24 ساعة»، ووضّح للمشترين طريقة الدفع. في ماي بوتيكي يرسل لك المشتري رسالة واتساب واحدة فيها كل المنتجات والإجمالي، وتؤكّد معه التوصيل والدفع مباشرة.</p>
<h2>5. اكسب الثقة</h2>
<ul><li>أضف شعارك ونبذة قصيرة ورقمك وروابطك مثل إنستغرام.</li><li>استخدم الهايلايت لـ«مجموعة جديدة» و«آراء العملاء» و«الفروع».</li><li>احصل على شارة التوثيق الزرقاء: تُظهر هويتك لماي بوتيكي مرة واحدة، فيرى المشتري متجراً حقيقياً ومسؤولاً، والمتاجر الموثّقة تظهر أولاً.</li></ul>
<h2>6. نمِّ متجرك</h2>
<p>انشر منتجات جديدة باستمرار، وشاركها في إنستغرام كصور جاهزة، وروّج أفضل منتج ليظهر أولاً في الرئيسية والاستكشاف والبحث في الدول الخليجية التي تختارها.</p>
${cta.ar}`,
    },
  },
  {
    slug: 'increase-shop-sales-without-rent',
    date: '2026-11-27',
    img: '/img/polo.jpg',
    en: {
      title: '7 ways to increase your shop’s sales without paying more rent',
      desc: 'Practical ways for small shops in Kuwait and the Gulf to sell more: reach buyers online, use product codes, boost the right posts, get verified and turn WhatsApp chats into orders.',
      tag: 'Growth',
      body: `
<p>Whether you already have a shop or sell from home, more sales rarely come from a bigger space. They come from more people seeing your products and an easier way to order. Here are seven things that work.</p>
<h2>1. Put every product online with a price</h2>
<p>A buyer who sees the price decides faster. List every item on myboutiki with photos, size details and the price, so people can shop even when your shop is closed.</p>
<h2>2. Reach the whole Gulf, not just your street</h2>
<p>A shop in one area sells to one area. On myboutiki, buyers across Kuwait, Saudi Arabia, the UAE, Bahrain, Qatar and Oman can find you, see prices in their own currency and message you.</p>
<h2>3. Make ordering one message</h2>
<p>Lost orders often happen in long chats. With the myboutiki cart, the buyer sends one WhatsApp message with every item, quantity, price and link. You just confirm.</p>
<h2>4. Use product codes</h2>
<p>Every item gets a code like MB000123. Use it in your stories and branch shelves so buyers can find the exact item online, and so you can track what sells.</p>
<h2>5. Boost only your best items</h2>
<p>Instead of paying for a booth for a whole weekend, boost one item for a few days. Choose the goal, the Gulf countries and a daily budget from $1, and your post shows first in Home, Explore and search with a small “Sponsored” label.</p>
<h2>6. Get verified</h2>
<p>The blue badge tells buyers a real person is behind the shop, and verified shops appear before others in the feed and search.</p>
<h2>7. Watch what people like</h2>
<p>Check which items get the most likes, saves and cart adds in your insights. Restock those, and use their photos in your next boost.</p>
<h2>The rent you don’t pay is profit</h2>
<p>If a small shop costs ${a(SRC.shops, 'KWD 500 or more a month')} before staff and fit-out, even keeping a few months of that rent in your pocket can fund new stock, better photos or a few targeted boosts.</p>
${cta.en}`,
    },
    ar: {
      title: '7 طرق لزيادة مبيعات متجرك بدون دفع إيجار أكثر',
      desc: 'طرق عملية للمتاجر الصغيرة في الكويت والخليج لبيع أكثر: الوصول للمشترين أونلاين، واستخدام رموز المنتجات، وترويج المنشورات المناسبة، والتوثيق، وتحويل محادثات واتساب إلى طلبات.',
      tag: 'النمو',
      body: `
<p>سواء كان عندك محل أو تبيع من البيت، فالمبيعات الأكثر نادراً ما تأتي من مساحة أكبر، بل من عدد أكبر من الناس يرون منتجاتك وطريقة أسهل للطلب. إليك سبع طرق ناجحة.</p>
<h2>1. ضع كل منتج أونلاين مع سعره</h2>
<p>المشتري الذي يرى السعر يقرّر أسرع. اعرض كل منتج على ماي بوتيكي بالصور والمقاسات والسعر، ليتسوّق الناس حتى عندما يكون محلك مغلقاً.</p>
<h2>2. اوصل للخليج كله لا لشارعك فقط</h2>
<p>المحل في منطقة واحدة يبيع لمنطقة واحدة. في ماي بوتيكي يجدك المشترون في الكويت والسعودية والإمارات والبحرين وقطر وعُمان، ويرون الأسعار بعملتهم ويراسلونك.</p>
<h2>3. اجعل الطلب رسالة واحدة</h2>
<p>الطلبات تضيع غالباً في المحادثات الطويلة. مع سلة ماي بوتيكي يرسل المشتري رسالة واتساب واحدة فيها كل منتج والكمية والسعر والرابط، وأنت تؤكّد فقط.</p>
<h2>4. استخدم رموز المنتجات</h2>
<p>كل منتج يحصل على رمز مثل MB000123. استخدمه في قصصك ورفوف فروعك ليجد المشتري المنتج نفسه أونلاين، ولتعرف ما الذي يُباع أكثر.</p>
<h2>5. روّج أفضل منتجاتك فقط</h2>
<p>بدل دفع إيجار بوث لعطلة كاملة، روّج منتجاً واحداً لأيام قليلة. اختر الهدف والدول الخليجية وميزانية يومية تبدأ من دولار واحد، فيظهر منشورك أولاً في الرئيسية والاستكشاف والبحث مع علامة صغيرة «مُموَّل».</p>
<h2>6. وثّق متجرك</h2>
<p>الشارة الزرقاء تخبر المشتري أن شخصاً حقيقياً وراء المتجر، والمتاجر الموثّقة تظهر قبل غيرها في الصفحة الرئيسية والبحث.</p>
<h2>7. راقب ما يعجب الناس</h2>
<p>تابع في الإحصائيات المنتجات الأكثر إعجاباً وحفظاً وإضافة للسلة، ووفّر منها مخزوناً أكثر، واستخدم صورها في ترويجك القادم.</p>
<h2>الإيجار الذي لا تدفعه ربح</h2>
<p>إذا كان المحل الصغير يكلّف ${a(SRC.shops, '500 دينار أو أكثر شهرياً')} قبل الموظفين والتجهيز، فإن توفير إيجار بضعة أشهر فقط يكفي لشراء بضاعة جديدة أو تحسين التصوير أو تمويل ترويج موجّه.</p>
${cta.ar}`,
    },
  },
  {
    slug: 'open-online-store-kuwait-free',
    date: '2026-11-27',
    img: '/img/blog-bag.jpg',
    en: {
      title: 'How to open an online store in Kuwait for free (step by step)',
      desc: 'Open your own online store in Kuwait and the Gulf for free: create your shop, add products with photos, set prices in KWD and receive orders on WhatsApp — no rent, no website to build.',
      tag: 'Guide',
      body: `
<p>You don’t need a website, a developer or a rented shop to start selling online in Kuwait. With a marketplace like myboutiki you can have a working store in about ten minutes.</p>
<h2>1. Create your shop</h2>
<p>Sign up with your email, Google or Apple. Choose your store name, a username (this becomes your link, for example <b>myboutiki.com/@yourshop</b>), your country and your phone number for WhatsApp.</p>
<h2>2. Make your profile look professional</h2>
<ul><li>Upload your logo as the profile photo.</li><li>Write a short bio: what you sell, delivery areas and working hours.</li><li>Add your Instagram or website links.</li></ul>
<h2>3. Add your first products</h2>
<p>Tap <b>Sell</b>, add up to 10 photos, a title, a description and the category. The price is optional — if you leave it empty, buyers see “Ask for price” and message you directly.</p>
<h2>4. Receive orders</h2>
<p>Buyers can chat with you in the app (text, photos and voice messages), call you, or send one WhatsApp message with all the items in their cart. You arrange payment and delivery directly.</p>
<h2>5. Get found</h2>
<p>Every product gets its own page that Google can index. Share your items to Instagram Stories, WhatsApp, X and Facebook with one tap, and boost your best items to appear first.</p>
${cta.en}`,
    },
    ar: {
      title: 'كيف تفتح متجراً إلكترونياً في الكويت مجاناً (خطوة بخطوة)',
      desc: 'افتح متجرك الإلكتروني في الكويت والخليج مجاناً: أنشئ متجرك، أضف منتجاتك بالصور، حدّد الأسعار بالدينار واستقبل الطلبات على واتساب، بدون إيجار وبدون بناء موقع.',
      tag: 'دليل',
      body: `
<p>لا تحتاج إلى موقع إلكتروني أو مبرمج أو محل مستأجر لتبدأ البيع أونلاين في الكويت. مع سوق مثل ماي بوتيكي يمكنك تجهيز متجرك خلال عشر دقائق تقريباً.</p>
<h2>1. أنشئ متجرك</h2>
<p>سجّل بالبريد الإلكتروني أو جوجل أو آبل، واختر اسم متجرك واسم المستخدم (سيصبح رابط متجرك مثل <b>myboutiki.com/@yourshop</b>) ودولتك ورقم هاتفك للواتساب.</p>
<h2>2. اجعل ملفك احترافياً</h2>
<ul><li>ضع شعارك كصورة للملف.</li><li>اكتب نبذة قصيرة: ماذا تبيع، ومناطق التوصيل، وأوقات العمل.</li><li>أضف رابط إنستغرام أو موقعك.</li></ul>
<h2>3. أضف أول منتجاتك</h2>
<p>اضغط <b>بيع</b> وأضف حتى 10 صور وعنواناً ووصفاً والقسم. السعر اختياري، وإذا تركته فارغاً يظهر للمشتري «اسأل عن السعر» ويراسلك مباشرة.</p>
<h2>4. استقبل الطلبات</h2>
<p>يمكن للمشتري مراسلتك داخل التطبيق (نص وصور ورسائل صوتية) أو الاتصال بك أو إرسال رسالة واتساب واحدة بكل المنتجات في السلة، وتتفق معه مباشرة على الدفع والتوصيل.</p>
<h2>5. اجعل الناس يجدونك</h2>
<p>لكل منتج صفحة خاصة يمكن لجوجل فهرستها. شارك منتجاتك في ستوري إنستغرام وواتساب وإكس وفيسبوك بلمسة، وروّج أفضل منتجاتك لتظهر أولاً.</p>
${cta.ar}`,
    },
  },
  {
    slug: 'sell-perfume-online-kuwait',
    date: '2026-11-27',
    img: '/img/blog-gifts.jpg',
    en: {
      title: 'How to sell perfume and gift sets online in Kuwait',
      desc: 'Tips to sell perfumes, oud and gift boxes online in Kuwait and the Gulf: photos that sell, honest descriptions, pricing in KWD, gift seasons and WhatsApp orders.',
      tag: 'Tips',
      body: `
<p>Perfume, oud and gift boxes are some of the most popular gifts in the Gulf. Here is how to present them so buyers trust you and order.</p>
<h2>Photograph the bottle and the box</h2>
<ul><li>Shoot on a clean, light background with soft daylight.</li><li>Show the full set first, then each bottle, the box and any extras.</li><li>Keep photos sharp — avoid filters that change the colour of the liquid.</li></ul>
<h2>Describe it honestly</h2>
<p>Mention the size (ml), concentration (eau de parfum, oud, attar), the scent notes, whether it is new and sealed, and exactly what is included in a gift set.</p>
<h2>Price clearly</h2>
<p>Show the price in KWD (myboutiki converts it for buyers in other Gulf countries). If prices change often, leave the price empty so buyers ask you on chat.</p>
<h2>Plan for gift seasons</h2>
<p>Ramadan, Eid, Valentine’s, Mother’s Day and National Day are peak times. Post new gift sets a week before, and boost them to the top of Home and Explore.</p>
<h2>Make ordering easy</h2>
<p>Say your delivery areas and times in your bio. Buyers can message, call or send one WhatsApp order with the whole cart.</p>
${cta.en}`,
    },
    ar: {
      title: 'كيف تبيع العطور وأطقم الهدايا أونلاين في الكويت',
      desc: 'نصائح لبيع العطور والعود وبوكسات الهدايا أونلاين في الكويت والخليج: صور تبيع، ووصف صادق، وتسعير بالدينار، ومواسم الهدايا، وطلبات واتساب.',
      tag: 'نصائح',
      body: `
<p>العطور والعود وبوكسات الهدايا من أكثر الهدايا طلباً في الخليج. إليك طريقة عرضها ليثق المشتري ويطلب.</p>
<h2>صوّر العبوة والبوكس</h2>
<ul><li>صوّر على خلفية فاتحة ونظيفة مع ضوء النهار.</li><li>اعرض الطقم كاملاً أولاً، ثم كل عبوة والبوكس والإضافات.</li><li>اجعل الصور واضحة وتجنّب الفلاتر التي تغيّر لون العطر.</li></ul>
<h2>اكتب وصفاً صادقاً</h2>
<p>اذكر الحجم (مل) والتركيز (أو دو بارفان، عود، دهن) والمكوّنات العطرية، وهل هو جديد ومغلّف، وماذا يحتوي طقم الهدية بالضبط.</p>
<h2>سعّر بوضوح</h2>
<p>اكتب السعر بالدينار الكويتي، وماي بوتيكي يحوّله للمشترين في دول الخليج الأخرى. وإذا كانت الأسعار تتغيّر كثيراً اترك السعر فارغاً ليسألك المشتري في المحادثة.</p>
<h2>استعد لمواسم الهدايا</h2>
<p>رمضان والعيد والفالنتاين وعيد الأم والعيد الوطني أوقات ذروة. انشر أطقم الهدايا الجديدة قبلها بأسبوع، وروّجها لتظهر أعلى الرئيسية والاستكشاف.</p>
<h2>سهّل الطلب</h2>
<p>اذكر مناطق وأوقات التوصيل في البايو. يمكن للمشتري مراسلتك أو الاتصال بك أو إرسال طلب واتساب واحد بكل السلة.</p>
${cta.ar}`,
    },
  },
  {
    slug: 'product-photos-with-your-phone',
    date: '2026-11-27',
    img: '/img/blog-shoes.jpg',
    en: {
      title: 'Take product photos that sell — with just your phone',
      desc: 'Simple phone photography tips for online sellers: light, background, angles, details and how many photos to post for clothes, shoes, watches and perfume.',
      tag: 'Tips',
      body: `
<p>Good photos sell more than long descriptions. You don’t need a camera — your phone is enough.</p>
<h2>Use daylight</h2><p>Stand near a window in the morning or afternoon. Turn off the flash and ceiling lights to avoid yellow colours.</p>
<h2>Keep the background simple</h2><p>A white wall, a sheet or a wooden floor works well. Remove anything that distracts from the product.</p>
<h2>Show every angle</h2><ul><li>Front, back and side.</li><li>Close-ups: fabric, stitching, logo, sole, clasp or dial.</li><li>The item worn or in use, so buyers see the real size.</li></ul>
<h2>Post several photos</h2><p>On myboutiki you can add up to 10 photos per item, crop them, change the order and choose the cover photo.</p>
<h2>Be honest</h2><p>Show any marks or wear clearly. Honest photos mean fewer returns and better reviews.</p>
${cta.en}`,
    },
    ar: {
      title: 'صوّر منتجاتك بجوالك صوراً تبيع',
      desc: 'نصائح تصوير بسيطة للبائعين أونلاين بالجوال: الإضاءة، والخلفية، والزوايا، والتفاصيل، وعدد الصور المناسب للملابس والأحذية والساعات والعطور.',
      tag: 'نصائح',
      body: `
<p>الصور الجيدة تبيع أكثر من الوصف الطويل، ولا تحتاج إلى كاميرا، فجوالك يكفي.</p>
<h2>استخدم ضوء النهار</h2><p>قف قرب النافذة صباحاً أو عصراً، وأطفئ الفلاش وإضاءة السقف لتجنّب الألوان الصفراء.</p>
<h2>اجعل الخلفية بسيطة</h2><p>جدار أبيض أو قماش أو أرضية خشبية مناسبة. أبعد أي شيء يشتّت النظر عن المنتج.</p>
<h2>اعرض كل الزوايا</h2><ul><li>الأمام والخلف والجانب.</li><li>لقطات قريبة: القماش، والخياطة، والشعار، والنعل، والقفل أو ميناء الساعة.</li><li>المنتج أثناء اللبس أو الاستخدام ليعرف المشتري حجمه الحقيقي.</li></ul>
<h2>انشر عدة صور</h2><p>في ماي بوتيكي يمكنك إضافة حتى 10 صور لكل منتج، وقصّها، وتغيير ترتيبها، واختيار صورة الغلاف.</p>
<h2>كن صادقاً</h2><p>أظهر أي آثار استخدام بوضوح. الصور الصادقة تعني مرتجعات أقل وتقييمات أفضل.</p>
${cta.ar}`,
    },
  },
  {
    slug: 'sell-abayas-online-gulf',
    date: '2026-11-27',
    img: '/img/abaya.jpg',
    en: {
      title: 'Selling abayas online in the Gulf: a simple guide for home designers',
      desc: 'How abaya designers and home sellers can sell online across Kuwait, Saudi Arabia, the UAE, Bahrain, Qatar and Oman: sizes, fabrics, photos, made-to-order and WhatsApp orders.',
      tag: 'Guide',
      body: `
<p>Many of the best abayas in the Gulf are designed at home. Selling online lets you reach buyers in every Gulf country without a shop.</p>
<h2>List sizes and fabric clearly</h2><p>Write the available lengths (for example 52 to 60), the fabric (crepe, nida, linen, chiffon), the embroidery or lace details, and whether it comes with a matching sheila.</p>
<h2>Show it worn</h2><p>Add at least one photo of the abaya being worn, plus close-ups of the embroidery, sleeves and trims.</p>
<h2>Say if it is ready or made to order</h2><p>If you tailor to measurements, state the preparation time, for example “Ready in 5 days”.</p>
<h2>Use highlights</h2><p>Group your collections in highlights such as “New collection”, “Ramadan” and “Feedback”, so buyers can browse quickly.</p>
<h2>Sell across the Gulf</h2><p>Prices show in each buyer’s currency. Mention which countries you deliver to in your bio.</p>
${cta.en}`,
    },
    ar: {
      title: 'بيع العبايات أونلاين في الخليج: دليل بسيط للمصممات من البيت',
      desc: 'كيف تبيع مصممات العبايات والبائعات من البيت أونلاين في الكويت والسعودية والإمارات والبحرين وقطر وعُمان: المقاسات والأقمشة والصور والتفصيل وطلبات واتساب.',
      tag: 'دليل',
      body: `
<p>كثير من أجمل العبايات في الخليج تُصمَّم في البيت، والبيع أونلاين يوصلك للمشترين في كل دول الخليج بدون محل.</p>
<h2>اكتبي المقاسات والقماش بوضوح</h2><p>اذكري الأطوال المتوفرة (مثلاً من 52 إلى 60) ونوع القماش (كريب، ندى، كتان، شيفون) وتفاصيل التطريز أو الدانتيل، وهل تأتي مع شيلة.</p>
<h2>اعرضيها ملبوسة</h2><p>أضيفي صورة واحدة على الأقل للعباية ملبوسة، ولقطات قريبة للتطريز والأكمام والأطراف.</p>
<h2>وضّحي إن كانت جاهزة أو تفصيل</h2><p>إذا كنتِ تفصّلين على المقاس، اذكري مدة التجهيز مثل «جاهزة خلال 5 أيام».</p>
<h2>استخدمي الهايلايت</h2><p>رتّبي مجموعاتك في هايلايت مثل «مجموعة جديدة» و«رمضان» و«آراء العملاء» ليتصفّح المشتري بسرعة.</p>
<h2>بيعي في كل الخليج</h2><p>الأسعار تظهر بعملة كل مشترٍ، واذكري الدول التي توصلين لها في البايو.</p>
${cta.ar}`,
    },
  },
];
