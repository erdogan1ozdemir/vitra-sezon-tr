// === Banyo Mob. Fırsat Analizi sekmesi ===
// Bağımsız dosya. Veri: 2026 hacimleri (window.BANYO2026) + 2024/2025 (window.DATA, salt-okunur)
// + VitrA sıralama/KD/niyet (Ahrefs) + SEOmonitor görünürlük (rakip & kategori) + 360° kanal & forward öneriler.
// Mevcut sekmeleri/veriyi değiştirmez; window.TABS'a yalnızca FirsatTab ekler.
(function(){
  const { fmtNum, fmtFull, fmtPct, trendClass, toCSV, downloadCSV, hmColor, hmText, aggregateMonthly, TR_MONTHS } = window.U;
  const { Kpi, YoYPill, LineChart, Donut, ShareBars, MultiSelect, InfoIcon, Explainer, SectionHeader, ChartActions, EmptyState } = window.C;
  const h = React.createElement;
  const I = window.ICONS || {};
  const BD = window.BANYO2026;
  const D = window.DATA;
  const HIST = (D && D.keywords ? D.keywords.filter(k => k.k1 === 'Banyo Mobilyaları') : []);

  // 28 aylık trend etiketleri (2024-01 -> 2026-04), çeyrekte etiket + Ocak'larda yıl
  const TREND_LABELS = Array.from({length:28}, (_,i) => {
    const m = i % 12, y = 2024 + Math.floor(i/12);
    return m % 3 === 0 ? (TR_MONTHS[m] + (m === 0 ? " '" + String(y).slice(2) : '')) : '';
  });
  // Sezon takvimi: son 12 ay, ay isimlerinde yıl (May 25 ... Nis 26)
  const ROLL_LABELS = [...TR_MONTHS.slice(4).map(m=>m+" 25"), ...TR_MONTHS.slice(0,4).map(m=>m+" 26")];

  const K2_COLORS = {
    'Banyo Dolapları': '#8B5CF6', 'Banyo Aynaları': '#0EA5E9', 'Lavabo Dolapları': '#10B981',
    'Banyo Tezgahları': '#F59E0B', 'Banyo Mobilyaları': '#EC4899',
    'Banyo Mobilya Tamamlayıcıları': '#6366F1', 'Banyo Set Modülleri': '#14B8A6',
  };
  const PALETTE = ['#8B5CF6','#0EA5E9','#10B981','#F59E0B','#EC4899','#6366F1','#14B8A6','#EF4444','#F97316','#06B6D4','#A855F7','#84CC16'];
  const k2color = k => K2_COLORS[k] || '#8A8A8A';
  const COMP_COLOR = { Low:'#10B981', Medium:'#F59E0B', High:'#EF4444' };
  const COMP_TR = { Low:'Düşük', Medium:'Orta', High:'Yüksek' };
  const clamp = (x,a,b) => Math.max(a, Math.min(b, x));
  const YOY_TIP = 'YoY = geçen yılın aynı ayına göre değişim (2026 vs 2025 aynı ay)';

  // VitrA pozisyon (SEOmonitor mobil) rozeti
  const posColor = p => p==null ? '#B0B0B0' : p<=3 ? '#10B981' : p<=10 ? '#0EA5E9' : p<=20 ? '#F59E0B' : '#EF4444';
  function PosBadge({pos, chg, seo}){
    if(pos==null){
      if(seo===false) return h('span',{className:'pill', title:'Bu kelime SEOmonitor izleme listesinde değil', style:{background:'var(--line-soft)', color:'var(--ink-3)', fontWeight:600}}, '–');
      return h('span',{className:'pill', title:'VitrA şu an ilk 100 sıralamada değil', style:{background:'color-mix(in srgb, #EF4444 13%, transparent)', color:'#EF4444', fontWeight:700}}, 'üst sırada değil');
    }
    const c = posColor(pos);
    return h('span',{className:'pill', title:'VitrA mobil organik sırası (SEOmonitor)', style:{background:'color-mix(in srgb, '+c+' 15%, transparent)', color:c, fontWeight:700, fontVariantNumeric:'tabular-nums', display:'inline-flex', alignItems:'center', gap:4}},
      '#'+pos, chg ? h('span',{style:{fontSize:9, fontWeight:700, color: chg>0?'#0a8f5b':'#c23'}}, (chg>0?'↑':'↓')+Math.abs(chg)) : null);
  }

  // SEOmonitor görünürlük (Oca-Haz 2026 değişimi) - kategori bazında
  const SEO_VIS = {
    'Banyo Dolapları': {vis:60, chg:25}, 'Banyo Mobilya Tamamlayıcıları': {vis:23, chg:2.4},
    'Lavabo Dolapları': {vis:77, chg:12}, 'Banyo Aynaları': {vis:72, chg:-5.8},
    'Banyo Tezgahları': {vis:15, chg:3.3}, 'Banyo Mobilyaları': {vis:97, chg:19},
    'Banyo Set Modülleri': {vis:94, chg:4.6},
  };
  const SEO_VIS_OVERALL = {vis:51, chg:13};
  // Rakip görünürlüğü (SEOmonitor · TR · 1 Oca - Haz 2026): g=Google görünürlük %, gchg=değişim, aio=AI Overview %, ais=AI Search %
  const COMP_VIS = [
    {d:'vitra.com.tr', tip:'VitrA (biz)', g:51, gchg:13, aio:2.2, ais:7.5, self:true},
    {d:'koctas.com.tr', tip:'E-ticaret · yapı market', g:77, gchg:-5.3, aio:70, ais:51},
    {d:'trendyol.com', tip:'E-ticaret · pazar yeri', g:75, gchg:-12, aio:0, ais:64},
    {d:'hepsiburada.com', tip:'E-ticaret · pazar yeri', g:46, gchg:-13, aio:2.2, ais:57},
    {d:'ikea.com.tr', tip:'Direkt rakip · mobilya', g:34, gchg:-13, aio:0, ais:5.1},
    {d:'kale.com.tr', tip:'Direkt rakip · banyo markası', g:27, gchg:-5.9, aio:0, ais:0.2},
    {d:'creavit.com.tr', tip:'Direkt rakip · banyo markası', g:7.3, gchg:-15, aio:0, ais:4.1},
  ];
  // AI Overview (SEOmonitor mobil; 349 kelime kontrol edildi)
  const AIO_DATA = {
    checked:349, present:5, cite:1, rakip:3,
    items:[
      {kw:'lavabolu banyo dolapları fiyatları', status:'cite'},
      {kw:'tezgah çeşitleri', status:'none'},
      {kw:'mutfak tezgah çeşitleri', status:'rakip'},
      {kw:'porselen mutfak tezgah fiyat', status:'rakip'},
      {kw:'mutfak tezgah çeşitleri isimleri', status:'rakip'},
    ]
  };
  const AIO_STATUS = {
    cite:{txt:'VitrA kaynak gösteriliyor', color:'#10B981'},
    rakip:{txt:'Sadece rakipler anılıyor', color:'#EF4444'},
    none:{txt:'AI Overview var, marka anılmıyor', color:'#94A3B8'},
  };

  // Forward: 2026 2. yarı sezon takvimi (talep, yıl ortalamasına göre %; 2024+2025 ort.)
  const FORWARD = [
    {ay:'Haziran', tag:'Yılın en sakin ayı · Hazırlık', pct:-26, color:'#94A3B8',
      text:'Talep yılın en düşük seviyesinde (ortalamanın yaklaşık dörtte biri kadar altında). Hazırlık dönemi: sonbahar zirvesi için içerik & sayfa üretimi, AI-arama hazırlığı burada yapılabilir. IKEA yaz indirimi (1 Haz-12 Tem) sürüyor; yaz yenileme ile çeyiz/evlilik alımları erken yakalanabilir.'},
    {ay:'Temmuz - Ağustos', tag:'Yaz', pct:-1, color:'#0EA5E9',
      text:'Genel talep ortalamaya yakın ama Tezgahlar Temmuz\'da ortalamanın üzerine çıkıyor; yaz yenileme & taşınma sürüyor. Eylül-Ekim zirvesinin içerik ve kampanyaları bu dönemde yayına hazırlanabilir.'},
    {ay:'Eylül - Ekim', tag:'Sonbahar yenileme · 2. zirve', pct:8, color:'#10B981',
      text:'Yılın 2. en hareketli dönemi (Ekim, ortalamanın ~%8 üzerinde). Tüm kategoriler için ana ikinci-yarı kampanya penceresi; Tamamlayıcılar (Ekim ~%14 üzeri) ve Lavabo Dolapları (~%11 üzeri) özellikle güçlü. Stok, kampanya ve reklam buraya yoğunlaştırılabilir.'},
    {ay:'Kasım', tag:'Black Friday / Efsane Cuma (27 Kasım)', pct:2, color:'#F59E0B',
      text:'E-ticaretin en yoğun ayı (Trendyol 8-11 & 22-25 Kasım kademeli kampanya). Banyo Dolapları bu dönemde güçlü. Fiyat/indirim odaklı ürün kampanyaları ve yüksek-niyetli reklam burada konumlandırılabilir.'},
    {ay:'Aralık', tag:'Yıl sonu / yılbaşı', pct:-2, color:'#8B5CF6',
      text:'Talep ortalamaya yakın seyreder. Yıl sonu ve yeni yıl temalı kampanyalarla dönem kapatılabilir; Ocak\'taki yıl-başı zirvesine geçiş hazırlığı yapılabilir.'},
  ];

  // Kategori durum & aksiyon (sade dil; metrikler canlı, metinler analiz)
  const PRIORITY = {
    'Banyo Dolapları': {label:'KORU & BÜYÜT', color:'#8B5CF6'},
    'Banyo Mobilya Tamamlayıcıları': {label:'YÜKSEK FIRSAT', color:'#F59E0B'},
    'Lavabo Dolapları': {label:'BÜYÜT', color:'#10B981'},
    'Banyo Mobilyaları': {label:'KORU & NİŞ', color:'#EC4899'},
    'Banyo Tezgahları': {label:'SEÇİCİ FIRSAT', color:'#F59E0B'},
    'Banyo Aynaları': {label:'KORU & GELİŞTİR', color:'#0EA5E9'},
    'Banyo Set Modülleri': {label:'KORU', color:'#14B8A6'},
  };
  const CAT_INS = {
    'Banyo Dolapları': {
      durum: `Pazarın en büyük alanı (%57) ve VitrA burada güçlü lider: "banyo dolabı modelleri" 1., "çamaşır makinesi dolabı" 3. (ayda ~33 bin), "banyo dolabı fiyatları" 2., "suya dayanıklı banyo dolabı" 1. sıra. Ortalama sıramız 8; SEOmonitor görünürlüğü %60 ve son 6 ayda +25 puan yükselmiş.`,
      aksiyon: `Ana terimlerdeki üst sıralar korunabilir. Geliştirilebilecek nokta: çamaşır/kurutma makinesi dolabı alt-varyantları - "kurutma makinesi dolabı" (24.), "çamaşır kurutma makinesi dolabı" (22.) henüz 2-3. sayfada. Bu varyantlara özel içerik (ölçü, kombin, makineyi gizleme rehberi) ile ilk-10'a taşınabilir.`,
      rakip: `Koçtaş en yakın takipçi; "çamaşır makinesi dolabı"nda da güçlü, çünkü makineyi de satıp cihaz + dolap içeriğini birlikte kuruyor. VitrA mobilya & tasarım açısıyla farklılaşabilir.`,
      h2: `Ekim (sonbahar yenileme) ve Kasım (Black Friday) güçlü; varyant içerikleri Ağustos-Eylül'de hazır olabilir.`
    },
    'Banyo Mobilya Tamamlayıcıları': {
      durum: `Hacimce 2. büyük alan (~138 bin/ay, %13) ama VitrA'nın en geliştirmeye açık olduğu yer: görünürlük %23, ilk-10'da kategori hacminin yaklaşık %3'ünü tutuyoruz (ortalama sıra 13). "banyo rafı" 16., kulp/kol aramalarında ("dolap kolu", "kulp modelleri") henüz üst sıralarda değiliz.`,
      aksiyon: `En büyük büyüme alanı. "banyo rafı / rafları" (~24 bin, şu an 16.) önceliklendirilip ilk-10'a taşınabilir - net bir hızlı kazanım. Kulp/kol aramaları daha jenerik (mutfak da dahil); ürün uygunsa ayrı kategori + "kulp/raf seçim" rehberiyle hedeflenebilir.`,
      rakip: `Kulp, raf, ayak gibi aksesuarları Koçtaş/Bauhaus gibi yapı marketleri tutuyor ("dolap kulpu" Koçtaş 4.). Banyo markaları bu alanda zayıf - alan görece açık.`,
      h2: `Eylül-Ekim sonbahar yenilemesinde aksesuar talebi belirgin artıyor (Ekim, ortalamanın ~%14 üzeri) - içerik bu döneme yetiştirilebilir.`
    },
    'Lavabo Dolapları': {
      durum: `En hızlı büyüyen alan (+%53 yıllık) ve VitrA güçlü: "banyo lavabo dolapları" 2., "dolaplı lavabo" 1., "lavabo altı dolap" üst sıralarda. Ortalama sıra 5,6; görünürlük %77 (+12 puan).`,
      aksiyon: `Hem büyüyen hem güçlü olduğumuz alan - yatırım artırmaya değer. Geliştirilebilecek: ölçü-bazlı varyantlar ("60/80 cm lavabolu banyo dolabı" 11. ve altı) ve "lavabo üstü dolap" (17.). Mevcut sayfalara ölçü/varyant içeriği eklenebilir.`,
      rakip: `Banyo markaları arasında öndeyiz; asıl rekabet yapı marketleri ve pazar yerlerinin geniş ürün sayfalarıyla.`,
      h2: `Ekim'de zirve yapıyor (ortalamanın ~%11 üzeri). Sonbahar yenileme kampanyasında öne çıkarılabilir.`
    },
    'Banyo Mobilyaları': {
      durum: `Satın alma öncesi ilham aşaması ("banyo modelleri / dekorasyon / tasarım"). +%103 büyüyen, rekabeti düşük bir alan. VitrA çok güçlü: "banyo modelleri" 1., "banyo tasarımları" 2. sıra; görünürlük %97 (+19 puan), ilk-10 kategori hacminin %74'ünü kapsıyor.`,
      aksiyon: `Bu alanı elde tutmak marka bilinirliği için kritik (alıcılar satın almadan önce buradan geçiyor). Geliştirilebilecek: "küçük banyo" nişi - "küçük banyo tasarımları" 13., "küçük banyo dekorasyon" 22. "Küçük banyo çözümleri" içerik kümesiyle bu hızlı büyüyen niş yakalanabilir.`,
      rakip: `İlham aramalarında IKEA güçlü - oda kurguları, katalog ve 2 milyon takipçili Instagram'ıyla ilham içeriğinin merkezinde. VitrA, tasarım otoritesi olarak görsel + sosyal içerikle bu alanı pekiştirebilir.`,
      h2: `İlham aramaları yıl boyu canlı; sonbahar (Ekim) ve yıl-başı (Ocak) öncesi içerik tazelenebilir.`
    },
    'Banyo Tezgahları': {
      durum: `VitrA banyo-tezgahı aramalarında lider: "banyo tezgah" 1., "banyo lavabo tezgahı" 1., "mermer banyo tezgahı" 3. sıra. Ancak en yüksek hacimli "porselen tezgah" (~18 bin) ve "tezgâh" (~12 bin) aramaları çoğunlukla mutfak/genel niyetli; bu sorgularda henüz üst sıralarda değiliz, görünürlük (%15) bu yüzden düşük görünüyor.`,
      aksiyon: `Banyo-tezgah liderliği korunabilir. Büyük hacimli genel/mutfak tezgah aramaları için önce ürün uygunluğu (porselen/kompozit tezgah satıyor muyuz?) netleştirilebilir; uygunsa ayrı kategori + "tezgah seçim rehberi" ile girilebilir. Bu sorgularda AI Overview da belirmeye başladı (aşağıdaki AI bölümü).`,
      rakip: `Genel/mutfak tezgah aramalarında seramik markaları ve Koçtaş önde; bu sorguların AI Overview'larında da şu an rakipler kaynak gösteriliyor (VitrA değil).`,
      h2: `Tezgah farklı bir ritimde - Temmuz ve Ekim güçlü, Ocak'a bağlı değil; yaz aylarında da kampanya yapılabilir.`
    },
    'Banyo Aynaları': {
      durum: `VitrA bu alanda güçlü: "banyo aynası" 2., "aynalı banyo dolabı" 3., "banyo ayna modelleri" 2., "tuvalet aynası" 2. sıra. Ortalama sıra 5,0; ilk-10 hacim payı %65. Dikkat edilecek tek nokta: görünürlük son 6 ayda -5,8 puan gerilemiş.`,
      aksiyon: `Ana ayna sıralamaları korunabilir (gerileme izlenebilir). Geliştirilebilecek: dekoratif/ledli ayna alt-tipleri - "ledli ayna" 18., "tuvalet aynası modelleri" 11., "banyo ayna seti" 11. Bunlar görece kolay; dekoratif ayna içerik + ürün kümesiyle yükseltilebilir.`,
      rakip: `Dekoratif ayna aramalarında Koçtaş öne çıkıyor. Trend/stil odaklı görsel içerik (sosyal medya, Pinterest) bu alanda fark yaratır.`,
      h2: `Ekim'de toparlıyor; görünürlük gerilemesini durdurmak için sonbahar öncesi içerik tazeleme önceliklendirilebilir.`
    },
    'Banyo Set Modülleri': {
      durum: `En küçük alan (%2,4, hafif daralan -%11) ama VitrA burada açık ara önde: "banyo dolabı seti" 1., "banyo dolabı takımı" 1., "banyo mobilyaları" 1. sıra. Ortalama sıra 2,3, neredeyse tüm kelimeler ilk-10'da; görünürlük %94.`,
      aksiyon: `Mevcut güçlü konum korunabilir; yeni büyük yatırım gerekmiyor. Daralan bir alan olduğundan kaynak diğer kategorilere yönlendirilebilir.`,
      rakip: `Set/takım aramaları daralıyor; rakipler de bu alanda yeni yatırım yapmıyor.`,
      h2: `Belirgin bir 2. yarı zirvesi yok; mevcut sıralamaların korunması yeterli.`
    },
  };

  // 360° kanallar (sade dil; öneri + rakip faaliyeti, accordion'da)
  const CHANNELS = [
    { icon:'🔍', title:'Organik SEO & İçerik', accent:'#10B981',
      ozet:'Düşük rekabetli ve henüz üst sıralarda olmadığımız alanlarda içerik & sayfalarla görünürlük kazanılabilir.',
      items:[
        '"Banyo rafı" (16.) ve dekoratif aynalar (ledli ayna 18., tuvalet aynası modelleri 11.) için mevcut sayfalar güçlendirilip ilk-10 hedeflenebilir - düşük rekabet, hızlı sonuç.',
        'Çamaşır/kurutma dolabı alt-varyantları (kurutma makinesi dolabı 24., çamaşır kurutma makinesi dolabı 22.) ölçü/kombin rehberiyle 2-3. sayfadan ilk-10\'a taşınabilir.',
        'Patlayan "küçük/dar banyo" aramaları için "küçük banyo çözümleri" içerik kümesi (ölçü, depolama, ürün önerisi) kurulabilir.',
        'Tezgah alanında ürün uygunsa (porselen/kompozit) ayrı kategori + seçim rehberi sayfasıyla genel tezgah aramalarına girilebilir.'
      ],
      rakip:'Koçtaş, kategori + rehber sayfalarıyla çok geniş bir kelime havuzu tutuyor (ölçü/montaj/"nasıl seçilir" içerikleri). Bu içerik derinliği izlenip benzer rehberlerle yarışılabilir.' },
    { icon:'🤖', title:'AI Arama & Görünürlük (GEO)', accent:'#6366F1',
      ozet:'AI Overview bu kelime grubunda şu an az tetikleniyor; yaygınlaşmaya hazırlık alanı.',
      items:[
        'Bu 349 kelimenin yalnızca 5\'inde AI Overview çıkıyor (mobil). VitrA bunlardan "lavabolu banyo dolapları fiyatları"nda kaynak gösteriliyor; 3 tezgah sorgusunda ise şu an sadece rakipler anılıyor.',
        'AI Overview en çok tezgah/karşılaştırma sorgularında beliriyor - içerik "soru-cevap", net tanım ve tablo formatında yapılandırılarak AI\'ın alıntılaması kolaylaştırılabilir.',
        'Ürün & rehber sayfalarına kısa özet + SSS eklenerek, AI Overview yaygınlaştığında alıntılanmaya hazır olunabilir.',
        'Domain düzeyinde AI arama görünürlüğümüz pazar yerlerinin gerisinde (SEOmonitor); marka adının geçtiği bağımsız içerik & PR ile bu güçlendirilebilir.'
      ],
      rakip:'Tezgah AI Overview\'larında şu an seramik markaları kaynak gösteriliyor. AI Overview yaygınlaşmadan içerik hazırlığı erken avantaj sağlayabilir.' },
    { icon:'💰', title:'Ücretli Arama (Google Ads)', accent:'#8B5CF6',
      ozet:'Organikte henüz üst sıralarda olmadığımız yeni, yüksek-değerli kelimelere reklamla hızlı giriş yapılabilir.',
      items:[
        'Organikte henüz üst sıralarda olmadığımız yüksek hacimli alanlara (kulp/raf, genel tezgah) reklamla girilerek organik olgunlaşana kadar talep yakalanabilir.',
        'Tıklama değeri yüksek, niyeti güçlü kelimeler (banyo yenileme, tasarım, dekorasyon) için ilham + dönüşüm kampanyaları test edilebilir.',
        'Yükselen yeni aramalar (suya dayanıklı dolap, özel tasarım, küçük banyo) düşük rekabette ucuza yakalanıp ölçeklenebilir.',
        'Black Friday/Efsane Cuma (27 Kasım) ve sonbahar yenileme döneminde yüksek-niyetli kelimelere reklam ağırlığı kaydırılabilir.'
      ],
      rakip:'Pazar yerleri (Trendyol, Hepsiburada) Kasım\'da reklam yatırımını zirveye çıkarıyor; bu dönemde ürün-bazlı kampanyalarla görünür olmak önem kazanır.' },
    { icon:'▶️', title:'YouTube & Video', accent:'#EF4444',
      ozet:'İlham ve "nasıl yapılır" aramaları video için çok uygun.',
      items:[
        '"Banyo modelleri", "küçük banyo çözümleri", "2026 banyo trendleri" gibi ilham videoları planlanabilir (bu aramalar çok büyük ve görsel).',
        'Çamaşır/kurutma dolabı "nasıl gizlenir, ölçü & kombin" videolarıyla makineli-dolap talebine mobilya açısından girilebilir.',
        'Ürün montaj, bakım ve suya-dayanıklılık videoları hem YouTube\'da bulunur hem ürün sayfasında satışa yardımcı olur.',
        'Videolar sonbahar zirvesinden (Eylül-Ekim) 4-6 hafta önce yayınlanabilir.'
      ],
      rakip:'IKEA, oda kurgusu & ilham videolarıyla güçlü; Koçtaş "nasıl yapılır / montaj" içeriklerine yatırıyor. VitrA, tasarım otoritesi olarak trend/ilham videolarında farklılaşabilir.' },
    { icon:'📱', title:'Sosyal Medya & Görsel Keşif', accent:'#EC4899',
      ozet:'Görsel kategoriler (ayna, ilham, dekorasyon) Instagram/Pinterest için yüksek potansiyelli.',
      items:[
        'Ayna, ilham/modelleri ve dekorasyon gibi görsel ağırlıklı alanlar Instagram/Pinterest\'te öne çıkarılabilir (pano, reels, before/after).',
        'Pinterest, "banyo modelleri/fikirleri" aramalarında Google\'a paralel bir trafik kaynağı olarak değerlendirilebilir.',
        'Stilize ürünler (antrasit, ahşap, ledli ayna) trend içerikle (reels) görünür kılınabilir.',
        'Google görsel sonuçlarında zaten 1. olduğumuz aramalar (lavabo/seramik modelleri) Pinterest ile pekiştirilebilir.'
      ],
      rakip:'IKEA Türkiye 2 milyon Instagram takipçisi + katalog/oda ilhamıyla bu alanın lideri; içerik formatları (oda senaryoları, fiyat etiketli görseller) örnek alınabilir.' },
    { icon:'📅', title:'Kampanya & Sezon Planı', accent:'#F59E0B',
      ozet:'Talep baharda ve sonbaharda (Ekim) zirve yapıyor; kampanyalar bu pencerelere konumlandırılabilir.',
      items:[
        'Sonbahar yenileme (Eylül-Ekim, yılın 2. zirvesi) ana ikinci-yarı kampanya penceresi - içerik/stok Ağustos\'ta hazırlanabilir.',
        'Black Friday/Efsane Cuma (27 Kasım; Trendyol 8-11 & 22-25 Kasım) için ürün-indirim kampanyaları planlanabilir; Banyo Dolapları bu dönemde güçlü.',
        'Haziran yılın en sakin ayı - hazırlık ve içerik üretimi için ideal; yaz yenileme & çeyiz alımları erken yakalanabilir.',
        'Tezgahlar farklı ritimde (Temmuz & Ekim güçlü) - ayrı bir kampanya takvimi kurgulanabilir.'
      ],
      rakip:'Koçtaş "ücretsiz söküm/nakliye/montaj + 7 ay taksit" gibi hizmet-odaklı kampanyalar yapıyor (Nisan banyo kampanyası); IKEA yaz indirimi (1 Haz-12 Tem) sürüyor. Hizmet/montaj avantajı bir farklılaşma alanı olabilir.' },
    { icon:'💡', title:'Gözden Kaçan / Değerlendirilebilecek Fırsatlar', accent:'#0EA5E9',
      ozet:'Görece açık ve geliştirmeye en uygun alanlar.',
      items:[
        'Tamamlayıcılar (kulp/raf, ~138 bin/ay, %13) en büyük büyüme alanımız - ilk-10 kapsamamız sadece %3. "banyo rafı" 16.\'dan ilk-10\'a taşınabilir.',
        'Çamaşır/kurutma dolabı alt-varyantları: ana terim ("çamaşır makinesi dolabı") 3. sırada güçlü, ama "kurutma makinesi dolabı" (24.) gibi varyantlar 2-3. sayfadan yükseltilebilir.',
        'Genel/mutfak tezgah aramaları (yüksek hacim, düşük rekabet) çoğu banyo markasınca tutulmuyor - ürün uygunsa erken giren avantaj sağlar.',
        'Rakiplerin tümü görünürlük kaybederken (Koçtaş -%5, Trendyol -%12, IKEA -%13) VitrA +%13 kazanıyor - pazarda pay alma penceresi açık.'
      ],
      rakip:'Tüm rakipler bu kelime grubunda görünürlük kaybediyor; bu, içerik & kampanya ile pay almak için elverişli bir dönem.' },
  ];

  // ---- Fırsat Skoru ----
  const WEIGHTS = { vol:0.40, growth:0.25, ease:0.20, commercial:0.15 };
  function easeFactor(r){
    return r.comp==='Low' ? 1 : r.comp==='Medium' ? 0.6 : r.comp==='High' ? 0.25 : 0.4;
  }
  function withScores(rows){
    const maxLogVol = Math.max(...rows.map(r => Math.log10(Math.max(1, r.vol))), 1);
    const maxLogBid = Math.log10(31);
    return rows.map(r => {
      const V = Math.log10(Math.max(1, r.vol)) / maxLogVol;
      const G = clamp(((r.yoy == null ? 0 : r.yoy) + 0.5) / 2.5, 0, 1);
      const E = easeFactor(r);
      const Cm = clamp(Math.log10((r.bidHi||0) + 1) / maxLogBid, 0, 1);
      return { ...r, score: Math.round(100 * (WEIGHTS.vol*V + WEIGHTS.growth*G + WEIGHTS.ease*E + WEIGHTS.commercial*Cm)) };
    });
  }

  const visChip = (v) => h('span',{className:'pill', style:{background:'color-mix(in srgb, '+(v.chg>=0?'#10B981':'#EF4444')+' 14%, transparent)', color:v.chg>=0?'#0a8f5b':'#c23', fontWeight:700}}, (v.chg>=0?'+':'')+v.chg.toString().replace('.',',')+' puan');

  // ---- Yatay Fırsat Skoru barları ----
  function OppRankBars({ rows, n=18 }){
    const top = [...rows].sort((a,b)=>b.score-a.score).slice(0, n);
    return h('div', null,
      top.map((r,i)=>h('div',{key:i, style:{display:'grid', gridTemplateColumns:'24px minmax(0,1fr) 64px', gap:10, alignItems:'center', padding:'6px 0', borderBottom:i<top.length-1?'1px solid var(--line-soft)':'none'}},
        h('div',{style:{fontSize:12, fontWeight:700, color:'var(--ink-3)', textAlign:'right'}}, (i+1)),
        h('div',{style:{minWidth:0}},
          h('div',{style:{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:4, gap:8}},
            h('span',{style:{fontSize:12.5, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}},
              r.kw, r.pos!=null && h('span',{style:{marginLeft:6, fontSize:10, fontWeight:700, color:posColor(r.pos)}}, 'VitrA #'+r.pos)
            ),
            h('span',{style:{flexShrink:0, display:'flex', alignItems:'center', gap:8}},
              h('span',{className:'num', style:{fontSize:11, color:'var(--ink-3)'}}, fmtFull(r.vol)),
              h(YoYPill,{yoy:r.yoy, tip:YOY_TIP})
            )
          ),
          h('div',{style:{height:9, borderRadius:5, background:'var(--line)', overflow:'hidden'}},
            h('div',{style:{width:Math.max(2,r.score)+'%', height:'100%', background:COMP_COLOR[r.comp]||'#8A8A8A', borderRadius:5, transition:'width .3s'}})
          )
        ),
        h('div',{style:{textAlign:'right'}},
          h('div',{style:{fontSize:18, fontWeight:700, fontFamily:'Bricolage Grotesque', lineHeight:1}}, r.score),
          h('div',{style:{fontSize:9, color:COMP_COLOR[r.comp], fontWeight:600, marginTop:2}}, COMP_TR[r.comp])
        )
      ))
    );
  }

  // ---- Sezon heatmap ----
  function SeasonHeatmap({ rows, months, showYoY }){
    const cols = months.length;
    return h('div',{style:{overflowX:'auto'}},
      h('div',{style:{display:'grid', gridTemplateColumns:`160px repeat(${cols}, minmax(50px,1fr))`, gap:3, minWidth: 160 + cols*52}},
        h('div',{style:{display:'flex', alignItems:'flex-end', padding:'4px 6px', fontSize:10, fontWeight:700, color:'var(--ink-3)'}}, 'Kategori'),
        months.map((m,i)=>h('div',{key:'h'+i, style:{textAlign:'center', padding:'4px 2px', fontSize:9.5, fontWeight:600, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.02em'}}, m)),
        rows.map((row,ri)=>{
          const max=Math.max(...row.values), min=Math.min(...row.values), range=(max-min)||1;
          return h(React.Fragment,{key:ri},
            h('div',{title:row.label, style:{display:'flex', alignItems:'center', padding:'0 8px', fontSize:11.5, fontWeight:500, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}, row.label),
            row.values.map((v,i)=>{
              const t=(v-min)/range;
              const prev = row.prev ? row.prev[i] : null;
              const yoy = (showYoY && prev != null && prev > 0) ? (v - prev)/prev : null;
              const txt = hmText(t);
              return h('div',{key:i, title:`${row.label} · ${months[i]}: ${fmtFull(v)}${yoy!=null?' · YoY '+fmtPct(yoy,0):''}`,
                style:{position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:44, borderRadius:6, background:hmColor(t), color:txt, fontFamily:'Bricolage Grotesque', padding:'3px 1px'}},
                h('span',{style:{fontSize:11, fontWeight:700, lineHeight:1.1}}, fmtNum(v)),
                yoy!=null && h('span',{style:{fontSize:8.5, fontWeight:600, opacity:.92, lineHeight:1.1, marginTop:1}}, (yoy>0?'↑':yoy<0?'↓':'→') + fmtPct(Math.abs(yoy),0).replace('+','')),
                i===row.peakIdx && h('span',{style:{position:'absolute', top:3, right:4, width:4, height:4, borderRadius:'50%', background:txt, opacity:.8}})
              );
            })
          );
        })
      )
    );
  }

  // ---- Accordion (bağımsız açılır-kapanır) ----
  function Acc({ open, onToggle, head, children }){
    return h('div',{className:'card', style:{padding:0, overflow:'hidden'}},
      h('button',{onClick:onToggle, style:{width:'100%', textAlign:'left', background:'none', border:'none', cursor:'pointer', padding:'13px 15px', display:'block', color:'inherit', font:'inherit'}}, head),
      open && h('div',{style:{padding:'0 15px 15px'}}, children)
    );
  }

  // ---- Kategori Durum & Aksiyon kartı (accordion) ----
  function CatCard({ c, open, onToggle }){
    const pr = PRIORITY[c.k2] || {label:'-', color:'#8A8A8A'};
    const ins = CAT_INS[c.k2] || {};
    const sv = SEO_VIS[c.k2];
    const chip = (key, txt, color) => h('span',{key, style:{display:'inline-block', fontSize:10.5, padding:'2px 7px', borderRadius:5, background:'color-mix(in srgb, '+color+' 13%, transparent)', color, fontWeight:600, whiteSpace:'nowrap'}}, txt);
    const head = h('div',null,
      h('div',{style:{display:'flex', alignItems:'center', gap:9, flexWrap:'wrap', marginBottom:7}},
        h('span',{style:{width:10, height:10, borderRadius:3, background:k2color(c.k2), flexShrink:0}}),
        h('span',{style:{fontSize:15, fontWeight:600, flex:1, minWidth:120}}, c.k2),
        h('span',{style:{fontSize:10, fontWeight:800, letterSpacing:'.03em', padding:'3px 9px', borderRadius:20, background:'color-mix(in srgb, '+pr.color+' 16%, transparent)', color:pr.color}}, pr.label),
        h('span',{style:{display:'inline-flex', alignItems:'center', gap:5, flexShrink:0, fontSize:10.5, fontWeight:700, padding:'4px 10px', borderRadius:20, border:'1px solid '+(open?pr.color:'var(--line)'), color:open?pr.color:'var(--ink-2)', background:open?'color-mix(in srgb, '+pr.color+' 10%, transparent)':'var(--line-soft)'}},
          open?'Kapat':'Detay & öneri', h('span',{style:{display:'inline-block', transform:open?'rotate(180deg)':'none', transition:'.2s'}}, '▾'))
      ),
      h('div',{style:{display:'flex', flexWrap:'wrap', gap:'5px 13px', fontSize:11.5, color:'var(--ink-2)'}},
        h('span',null, h('strong',{className:'num', style:{color:'var(--ink)'}}, fmtNum(c.vol)), '/ay · %'+(c.share*100).toFixed(0)),
        sv && h('span',{title:'SEOmonitor görünürlük (Oca-Haz 2026)'}, 'Görünürlük ', h('strong',{style:{color:sv.vis>=50?'#10B981':sv.vis>=25?'#F59E0B':'#EF4444'}}, '%'+sv.vis), ' ', h('span',{style:{color:sv.chg>=0?'#0a8f5b':'#c23', fontWeight:600}}, '('+(sv.chg>=0?'+':'')+sv.chg.toString().replace('.',',')+')')),
        h('span',null,'YoY ', h('strong',{style:{color:c.wYoY>=0?'var(--green)':'var(--red)'}}, fmtPct(c.wYoY,0))),
        h('span',null,'Peak ', h('strong',{style:{color:'var(--ink)'}}, c.peak))
      )
    );
    return h(Acc, {open, onToggle, head},
      c.wins.length>0 && h('div',{style:{display:'flex', flexWrap:'wrap', gap:6, alignItems:'center', marginTop:10}},
        h('span',{style:{fontSize:10.5, color:'#10B981', fontWeight:700}}, '✓ Güçlü olduğumuz:'),
        c.wins.map((w,i)=>chip('w'+i, w.kw+' #'+w.pos, '#10B981'))
      ),
      c.gaps.length>0 && h('div',{style:{display:'flex', flexWrap:'wrap', gap:6, alignItems:'center', marginTop:8}},
        h('span',{style:{fontSize:10.5, color:'#F59E0B', fontWeight:700}}, '○ Geliştirilebilir:'),
        c.gaps.map((w,i)=>chip('g'+i, w.kw+' '+(w.pos!=null?'#'+w.pos:'(üst sırada değil)'), '#F59E0B'))
      ),
      h('div',{style:{marginTop:11, fontSize:12.5, color:'var(--ink-2)', lineHeight:1.6}}, h('strong',{style:{color:'var(--ink)'}},'Durum: '), ins.durum),
      ins.rakip && h('div',{style:{marginTop:8, fontSize:12, color:'var(--ink-2)', lineHeight:1.55, background:'var(--line-soft)', padding:'8px 11px', borderRadius:8}}, h('strong',null,'Rakip: '), ins.rakip),
      h('div',{style:{marginTop:9, fontSize:12.5, lineHeight:1.6, background:'color-mix(in srgb, '+pr.color+' 8%, transparent)', borderLeft:'3px solid '+pr.color, padding:'9px 12px', borderRadius:'0 8px 8px 0'}},
        h('span',{style:{color:pr.color, fontWeight:700}}, '→ Aksiyon: '), h('span',{style:{color:'var(--ink)'}}, ins.aksiyon)),
      ins.h2 && h('div',{style:{marginTop:8, fontSize:11.5, color:'var(--ink-3)', display:'flex', gap:7, alignItems:'flex-start'}},
        h('span',{style:{color:'#14B8A6', flexShrink:0}}, I.Calendar?I.Calendar(13):'📅'), h('span',null, h('strong',null,'2. yarı: '), ins.h2))
    );
  }

  // ---- Floating Table of Contents ----
  function TOC({ sections }){
    const [open, setOpen] = React.useState(false);
    const go = (id) => { const el=document.getElementById(id); if(el){ const y=el.getBoundingClientRect().top+window.scrollY-78; window.scrollTo({top:y, behavior:'smooth'}); } setOpen(false); };
    return h('div',{style:{position:'fixed', right:0, top:'34%', zIndex:850}},
      h('button',{onClick:()=>setOpen(o=>!o), title:'İçindekiler',
        style:{position:'absolute', right:0, top:0, background:'var(--coral)', color:'#fff', border:'none', cursor:'pointer', padding:'10px 8px', borderRadius:'10px 0 0 10px', fontSize:11, fontWeight:700, letterSpacing:'.04em', writingMode: open?'horizontal-tb':'vertical-rl', boxShadow:'-2px 4px 14px rgba(0,0,0,.18)', whiteSpace:'nowrap'}},
        open ? '× Kapat' : '☰ İÇİNDEKİLER'),
      open && h('div',{style:{position:'absolute', right:0, top:38, background:'var(--bg-card)', border:'1px solid var(--line)', borderRadius:'10px 0 0 10px', boxShadow:'-4px 8px 28px rgba(0,0,0,.20)', padding:8, minWidth:240}},
        h('div',{style:{fontSize:10, fontWeight:700, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.06em', padding:'4px 8px 8px'}}, 'İçindekiler'),
        sections.map(s=>h('button',{key:s.id, onClick:()=>go(s.id),
          style:{display:'block', width:'100%', textAlign:'left', background:'none', border:'none', cursor:'pointer', padding:'7px 10px', fontSize:12.5, color:'var(--ink)', borderRadius:6}},
          h('span',{style:{color:s.color||'var(--coral)', marginRight:7}}, '●'), s.label))
      )
    );
  }

  // ====== Ana sekme ======
  function FirsatTab(){
    const [sortKey, setSortKey] = React.useState('score');
    const [sortDir, setSortDir] = React.useState('desc');
    const [selK2, setSelK2] = React.useState([]);
    const [selK3, setSelK3] = React.useState([]);
    const [openCat, setOpenCat] = React.useState(null);
    const [openCh, setOpenCh] = React.useState(null);

    if (!BD || !BD.rows) {
      return h(EmptyState, { icon:'📊', title:'2026 verisi yüklenemedi', desc:'data/banyo2026.js bulunamadı.' });
    }
    const M = BD.meta;
    const allRows = React.useMemo(() => withScores(BD.rows), []);
    const k2List = React.useMemo(() => Object.keys(M.byK2).sort((a,b)=>M.byK2[b].vol - M.byK2[a].vol), []);

    const inFilter = (r) => (!selK2.length || selK2.includes(r.k2)) && (!selK3.length || selK3.includes(r.k3));
    const k3Options = React.useMemo(() => [...new Set(allRows.filter(r => !selK2.length || selK2.includes(r.k2)).map(r => r.k3))].sort((a,b)=>a.localeCompare(b,'tr')), [selK2]);
    const rows = React.useMemo(() => allRows.filter(inFilter), [allRows, selK2, selK3]);
    const histRows = React.useMemo(() => HIST.filter(inFilter), [selK2, selK3]);
    const hasFilter = selK2.length > 0 || selK3.length > 0;
    const distinctK2 = [...new Set(rows.map(r=>r.k2))];
    const groupBy = distinctK2.length === 1 ? 'k3' : 'k2';

    // Trend 28 ay
    const m2024 = aggregateMonthly(histRows, 'm24');
    const m2025 = aggregateMonthly(histRows, 'm25');
    const m2026 = (()=>{ const o=[0,0,0,0]; for(const r of rows) for(let i=0;i<4;i++) o[i]+=(r.mo[i]||0); return o; })();
    const trendSeries = [...m2024, ...m2025, ...m2026];
    const trendPeak = trendSeries.indexOf(Math.max(...trendSeries));

    // KPI
    const totalVol = rows.reduce((a,r)=>a+r.vol,0);
    const peakIdx2026 = m2026.indexOf(Math.max(...m2026));
    const springGrowth = (m2026[3] - m2026[0]) / (m2026[0] || 1);
    const wYoY = (()=>{ let sv=0,sw=0; for(const r of rows){ if(r.yoy!=null){sv+=r.vol*r.yoy; sw+=r.vol;} } return sw?sv/sw:0; })();
    const lowCompVol = rows.filter(r=>r.comp==='Low'||r.comp==='Medium').reduce((a,r)=>a+r.vol,0);
    const risingCnt = rows.filter(r=>(r.yoy||0)>=0.05).length;
    // VitrA görünürlük (SEOmonitor; filtrelenince kategori-ağırlıklı, yoksa genel 51)
    const visW = (()=>{ let sv=0,sc=0,sw=0; for(const k2 of distinctK2){ const v=SEO_VIS[k2]; if(v){ const vol=rows.filter(r=>r.k2===k2).reduce((a,r)=>a+r.vol,0); sv+=vol*v.vis; sc+=vol*v.chg; sw+=vol; } } return sw?{vis:sv/sw, chg:sc/sw}:SEO_VIS_OVERALL; })();
    const vitraVis = hasFilter ? visW.vis : SEO_VIS_OVERALL.vis;
    const vitraVisChg = hasFilter ? visW.chg : SEO_VIS_OVERALL.chg;

    // Kategori dağılımı
    const catAgg = {};
    for (const r of rows){ const key=r[groupBy]; (catAgg[key]=catAgg[key]||{vol:0,n:0}).vol+=r.vol; catAgg[key].n++; }
    const catRows = Object.entries(catAgg).sort((a,b)=>b[1].vol-a[1].vol)
      .map(([label,d],idx)=>({label, value:d.vol, n:d.n, color: groupBy==='k2'?k2color(label):PALETTE[idx%PALETTE.length], share: totalVol?d.vol/totalVol:0}));
    const topCat = catRows[0];

    // Rolling 12 ay heatmap
    const heatRows = catRows.map((c)=>{
      const hk = histRows.filter(r=>r[groupBy]===c.label);
      const r26 = rows.filter(r=>r[groupBy]===c.label);
      const c24 = aggregateMonthly(hk,'m24'), c25 = aggregateMonthly(hk,'m25');
      const c26 = (()=>{ const o=[0,0,0,0]; for(const r of r26) for(let i=0;i<4;i++) o[i]+=(r.mo[i]||0); return o; })();
      const last12 = [...c25.slice(4,12), ...c26];
      const prev12 = [...c24.slice(4,12), ...c25.slice(0,4)];
      return { label:c.label, values:last12, prev:prev12, peakIdx:last12.indexOf(Math.max(...last12)) };
    });

    // Tematik
    const quickWins = rows.filter(r=>(r.comp==='Low'||r.comp==='Medium')&&r.vol>=400).sort((a,b)=>b.score-a.score);
    const rising = rows.filter(r=>(r.yoy||0)>=0.5&&r.vol>=300).sort((a,b)=>(b.yoy||0)-(a.yoy||0));
    const commercial = rows.filter(r=>(r.bidHi||0)>=10&&r.vol>=300).sort((a,b)=>(b.bidHi||0)-(a.bidHi||0));
    const risk = rows.filter(r=>(r.yoy||0)<=-0.25&&r.vol>=1500).sort((a,b)=>b.vol-a.vol);

    // Kategori durum (k2)
    const perCat = distinctK2.map(k2=>{
      const rs = rows.filter(r=>r.k2===k2);
      const hk = histRows.filter(r=>r.k2===k2);
      const vol = rs.reduce((a,r)=>a+r.vol,0);
      const wy = (()=>{let sv=0,sw=0;for(const r of rs){if(r.yoy!=null){sv+=r.vol*r.yoy;sw+=r.vol;}}return sw?sv/sw:0;})();
      const m25c = aggregateMonthly(hk,'m25'); const peak = TR_MONTHS[m25c.indexOf(Math.max(...m25c))];
      const wins = rs.filter(r=>r.pos!=null&&r.pos<=3).sort((a,b)=>b.vol-a.vol).slice(0,3);
      const gaps = rs.filter(r=>r.seo && (r.pos==null||r.pos>10)).sort((a,b)=>b.vol-a.vol).slice(0,4);
      return {k2, vol, share: totalVol?vol/totalVol:0, wYoY:wy, peak, wins, gaps};
    }).sort((a,b)=>b.vol-a.vol);

    // Tablo
    const tableRows = React.useMemo(()=>{
      const dir = sortDir==='desc'?-1:1, key=sortKey;
      return [...rows].sort((a,b)=>{
        if (key==='kw') return dir*String(a.kw).localeCompare(String(b.kw),'tr');
        let av=a[key], bv=b[key];
        if (key==='comp'){ const o={Low:0,Medium:1,High:2}; av=o[a.comp]??3; bv=o[b.comp]??3; }
        if (key==='bidHi'){ av=a.bidHi||0; bv=b.bidHi||0; }
        if (key==='yoy'){ av=a.yoy??-99; bv=b.yoy??-99; }
        if (key==='pos'){ av=a.pos==null?999:a.pos; bv=b.pos==null?999:b.pos; }
        return dir*((av||0)-(bv||0));
      });
    }, [rows, sortKey, sortDir]);
    const maxScore = Math.max(...allRows.map(r=>r.score),1);
    const setSort = (k)=>{ if(sortKey===k) setSortDir(d=>d==='desc'?'asc':'desc'); else { setSortKey(k); setSortDir(k==='pos'?'asc':'desc'); } };
    const sortArrow = (k)=> sortKey===k ? (sortDir==='desc'?' ▾':' ▴') : '';
    const csvData = () => toCSV(tableRows, [
      {label:'Keyword', key:'kw'}, {label:'Kategori', key:'k2'}, {label:'Alt Kategori', key:'k3'},
      {label:'Aylik Hacim (2026 Oca-Nis ort)', key:'vol'}, {label:'YoY %', get:r=>r.yoy==null?'':Math.round(r.yoy*100)},
      {label:'Rekabet', key:'comp'}, {label:'CPC Ust (TRY)', key:'bidHi'},
      {label:'VitrA Pozisyon', get:r=>r.pos==null?(r.seo?'ust sirada degil':'izlenmiyor'):r.pos}, {label:'Niyet', key:'intent'},
      {label:'Firsat Skoru', key:'score'}
    ]);

    const oppCard = (icon, title, accent, list, note, volTotal) => h('div',{className:'card', style:{display:'flex', flexDirection:'column'}},
      h('div',{className:'section-header', style:{margin:'-2px 0 12px', padding:0, border:'none'}},
        h('div',{className:'sh-bar', style:{background:`linear-gradient(180deg, ${accent} 0%, color-mix(in srgb, ${accent} 55%, transparent) 100%)`}}),
        h('div',{className:'sh-icon', style:{background:`color-mix(in srgb, ${accent} 14%, transparent)`, color:accent}}, icon),
        h('div',{className:'sh-text'},
          h('h2',{className:'sh-title', style:{fontSize:16}}, title),
          h('div',{className:'sh-desc'}, h('strong',null, list.length), ' keyword',
            volTotal!=null ? h('span',null,' · ', h('strong',{className:'num'}, fmtNum(volTotal)), ' aylık hacim') : null)
        )
      ),
      h('div',{className:'tbl-wrap', style:{maxHeight:340}},
        h('table',{className:'tbl'},
          h('thead',null, h('tr',null,
            h('th',null,'Keyword'),
            h('th',{className:'num', title:'2026 Oca-Nis aylık ortalama arama'},'Hacim'),
            h('th',{className:'num', title:YOY_TIP},'YoY'),
            h('th',{className:'num', title:'Tıklama başına reklam maliyeti (üst aralık, ₺)'},'CPC'),
            h('th',{title:'VitrA mobil organik sırası'},'VitrA')
          )),
          h('tbody',null,
          list.length ? list.map((r,i)=>h('tr',{key:i},
            h('td',{className:'kw-cell', style:{maxWidth:150}}, r.kw),
            h('td',{className:'num', style:{whiteSpace:'nowrap'}}, fmtFull(r.vol)),
            h('td',{className:'num', style:{whiteSpace:'nowrap'}}, h(YoYPill,{yoy:r.yoy, tip:YOY_TIP})),
            h('td',{className:'num', style:{whiteSpace:'nowrap', color:'var(--ink-2)'}}, r.bidHi!=null?'₺'+r.bidHi.toFixed(1).replace('.',','):'-'),
            h('td',{style:{whiteSpace:'nowrap'}}, h(PosBadge,{pos:r.pos, chg:r.posChg, seo:r.seo}))
          )) : h('tr',null, h('td',{colSpan:5, style:{color:'var(--ink-3)', padding:12}}, 'Bu filtrede uygun keyword yok.'))
        ))
      ),
      note && h('div',{style:{marginTop:12, fontSize:12, color:'var(--ink-2)', lineHeight:1.55, background:'var(--line-soft)', padding:'10px 12px', borderRadius:8, display:'flex', gap:8, alignItems:'flex-start'}},
        h('span',{style:{color:accent, flexShrink:0, paddingTop:1}}, I.Bulb ? I.Bulb(15) : '💡'),
        h('div',null, note)
      )
    );

    // ToC bölümleri (filtrede strateji bölümleri gizli)
    const SECTIONS = [
      {id:'fb-trend', label:'Aylık Trend & Dağılım', color:'#8B5CF6'},
      {id:'fb-sezon', label:'Sezon Takvimi', color:'#14B8A6'},
      {id:'fb-firsatlar', label:'Fırsatlar', color:'#F59E0B'},
      {id:'fb-kategori', label:'Kategori Durum & Aksiyon', color:'#EF4444'},
      !hasFilter && {id:'fb-rakip', label:'Rakip Görünümü', color:'#EF4444'},
      !hasFilter && {id:'fb-aio', label:'AI Overview Görünürlüğü', color:'#6366F1'},
      !hasFilter && {id:'fb-kanal', label:'360° Kanal Önerileri', color:'#6366F1'},
      {id:'fb-skor', label:'En Yüksek Fırsat Skoru', color:'#10B981'},
      !hasFilter && {id:'fb-ozet', label:'Yönetici Özeti', color:'var(--coral)'},
      !hasFilter && {id:'fb-h2', label:'2026 2. Yarı Takvimi', color:'#F59E0B'},
      {id:'fb-tablo', label:'Tüm Keyword\'ler', color:'#6366F1'},
    ].filter(Boolean);

    return h('div', null,
      h(TOC, { sections: SECTIONS }),

      // === Açıklama ===
      h(Explainer, {
        icon: I.Target ? I.Target(22) : '🎯',
        title: 'Bu sekme ne anlatıyor?',
        sub: 'Banyo mobilyası hacimleri, VitrA görünürlüğü, fırsatlar ve 360° kanal önerileri',
        defaultOpen: false
      },
        h('p', null,
          'Bu sekme ', h('strong',null,'Banyo Mobilyaları'), ' alanını üç kaynaktan birleştirir: arama hacmi & rekabet ',
          h('strong',null,'Google Keyword Planner'), ' (2026 Ocak-Nisan), VitrA & rakip sıralamaları + AI Overview verisi ',
          h('strong',null,'SEOmonitor'), ' (mobil, 1 Ocak - 3 Haziran 2026), uzun dönem trend & sezon için ',
          h('strong',null,'2024-2025 dashboard verisi'), '. SEO yanında reklam, video, sosyal medya ve kampanya kanallarını da kapsar.'
        ),
        h('div',{className:'explainer-grid'},
          h('div',null,
            h('h4',{className:'h4-icon'}, h('span',{className:'h4i'}, I.Search?I.Search(16):'🔍'), 'Görünürlük (Visibility) nedir?'),
            h('p',null, 'SEOmonitor\'ın hesabı: bir markanın bir kelime grubunda arama sonuçlarında ne kadar "görünür" olduğu (sıra + arama hacmine göre ağırlıklı bir yüzde). %100\'e yakın = neredeyse her aramada üstlerde çıkıyorsunuz. Yanındaki "+/- puan", 1 Ocak - Haziran 2026 arası değişimdir.'),
            h('h4',{className:'h4-icon'}, h('span',{className:'h4i'}, I.Bulb?I.Bulb(16):'💡'), 'Fırsat Skoru (0-100)'),
            h('p',null, '%40 hacim + %25 büyüme + %20 düşük rekabet + %15 ticari değer. Yüksek skor = yüksek hacimli, büyüyen, kolay sıralanabilir ve ticari değeri olan kelime.')
          ),
          h('div',null,
            h('h4',{className:'h4-icon'}, h('span',{className:'h4i'}, I.Calendar?I.Calendar(16):'📅'), 'Hangi veri, hangi tarih?'),
            h('p',null, 'Hacim/rekabet/CPC: Google Keyword Planner (2026 Oca-Nis aylık ortalama). VitrA & rakip mobil sırası, AI Overview ve arama niyeti: SEOmonitor (1 Oca - 3 Haz 2026). Trend & sezon için 2024-2025 verisi kullanılır.'),
            h('h4',{className:'h4-icon'}, h('span',{className:'h4i'}, I.TrendUp?I.TrendUp(16):'📈'), 'Öneri dili'),
            h('p',null, 'Buradaki notlar kesin emir değil, değerlendirilebilecek seçenektir: "yapılabilir / planlanabilir / seçilebilir". Kendi önceliğinize göre seçip aksiyona dönüştürebilirsiniz.')
          )
        )
      ),

      // === Başlık ===
      h(SectionHeader, {
        accent:'#8B5CF6',
        icon: h('svg',{width:22,height:22,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},
          h('circle',{cx:12,cy:12,r:9}), h('circle',{cx:12,cy:12,r:4}), h('path',{d:'M12 3v3M12 18v3M3 12h3M18 12h3'})),
        title: 'Banyo Mobilyaları · Fırsat Analizi',
        desc: `${M.dateRange} · ${fmtFull(M.kwCount)} keyword · hacim + VitrA görünürlük + 360° öneriler`
      }),

      // === Filtre ===
      h('div',{className:'card', style:{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', marginBottom:14, padding:'12px 16px'}},
        h('span',{style:{display:'inline-flex', alignItems:'center', gap:7, fontWeight:600, fontSize:13}},
          h('span',{style:{color:'var(--coral)'}}, I.Target?I.Target(15):'⛯'), 'Alt Kategori Filtresi'),
        h(MultiSelect, { label:'Kat 2', options:k2List, selected:selK2, colorMap:K2_COLORS, width:230,
          onChange:(sel)=>{ setSelK2(sel); const s=sel.length?new Set(sel):null; if(s) setSelK3(prev=>prev.filter(k3=>allRows.some(r=>s.has(r.k2)&&r.k3===k3))); } }),
        h(MultiSelect, { label:'Kat 3', options:k3Options, selected:selK3, onChange:setSelK3, width:250 }),
        hasFilter && h('button',{className:'chip-btn', onClick:()=>{ setSelK2([]); setSelK3([]); }}, '× Temizle'),
        hasFilter && h('span',{className:'txt-3', style:{fontSize:11, marginLeft:'auto'}}, fmtFull(rows.length)+' keyword seçili')
      ),

      // === KPI (6) ===
      h('div',{className:'grid grid-kpi kpi-6', style:{marginBottom:14}},
        h(Kpi,{label:'Toplam Aylık Hacim', value:fmtNum(totalVol), chip:fmtNum(totalVol*12)+'/yıl', chipClass:'neu', sub:'2026 · Oca-Nis ort.', accent:true}),
        h(Kpi,{label:'Keyword', value:fmtFull(rows.length), sub: hasFilter ? `${distinctK2.length} kategori` : `${k2List.length} alt kategori`}),
        h(Kpi,{label:'Ort. YoY', value:fmtPct(wYoY,1), chip:`${risingCnt} yükselen`, chipClass:trendClass(wYoY), sub:'geçen yıl aynı aya göre'}),
        h(Kpi,{label:'Düşük/Orta Rekabet', value:fmtNum(lowCompVol), chip:'%'+(totalVol?lowCompVol/totalVol*100:0).toFixed(0), chipClass:'pos', sub:'kolay kazanım alanı'}),
        h(Kpi,{label:'VitrA Görünürlük', value:'%'+Math.round(vitraVis), chip:(vitraVisChg>=0?'+':'')+Math.round(vitraVisChg)+' puan', chipClass: vitraVisChg>=0?'pos':'neg', sub:'SEOmonitor · Oca-Haz 26'}),
        h(Kpi,{label:'2026 Peak Ay', value:['Ocak','Şubat','Mart','Nisan'][peakIdx2026], sub:fmtFull(m2026[peakIdx2026])+' arama'})
      ),

      // === insight ===
      h('div',{className:'insight-strip'},
        h('span',{className:'arrow'}, I.ArrowRight?I.ArrowRight(14):'→'),
        h('div',null,
          (hasFilter?'Seçili kapsamda talep ':'Banyo mobilyası talebi '), '2026\'da bahara doğru ',
          h('strong',null, fmtPct(springGrowth,1)), ' arttı (Ocak ', fmtNum(m2026[0]), ' - Nisan ', fmtNum(m2026[3]), '). ',
          topCat ? h('span',null,'Hacmin ', h('strong',null,'%'+(topCat.share*100).toFixed(0)), '\'ı ', h('strong',null, topCat.label), '\'nda. ') : null,
          'VitrA görünürlüğü %', h('strong',null, Math.round(vitraVis)), ' ve ', h('strong',null, (vitraVisChg>=0?'+':'')+Math.round(vitraVisChg)+' puan'), ' yönünde.'
        )
      ),

      // === Aylık Arama Hacmi (sol) + Kategori Dağılımı (sağ) ===
      h('div',{id:'fb-trend', style:{scrollMarginTop:80}},
        h('div',{className:'grid grid-main', style:{marginBottom:18, alignItems:'start'}},
          h('div',{className:'card'},
            h('div',{className:'card-title-row'}, h('h3',null,'Aylık Arama Hacmi · Son 28 Ay',
              h(InfoIcon,{title:'Aylık Hacim Trendi'}, h('strong',null,'Ne? '),'Banyo Mobilyaları alanındaki tüm kelimelerin aylık toplam arama hacmi. 2024-2025 dashboard verisi + 2026 (Oca-Nis) güncel veri birleştirildi.')
            )),
            h('div',{style:{fontSize:12.5, color:'var(--ink-2)', lineHeight:1.5, marginBottom:12, paddingBottom:11, borderBottom:'1px solid var(--line-soft)'}},
              '2024\'te ortalama ~1,1M/ay olan talep 2025\'te ', h('strong',{style:{color:'var(--red)'}},'-%24'), ' daraldı, 2026 baharında toparlanıyor. Yıl içinde en yüksek ay ', h('strong',null,'Ocak'), ', ikinci zirve ', h('strong',null,'Ekim'), ' (sonbahar yenileme); en düşük ', h('strong',null,'Haziran'), '.'
            ),
            h(LineChart, { series:[{name:'Aylık hacim', values:trendSeries, color:'#8B5CF6', peakIdx:trendPeak}], labels:TREND_LABELS, height:260, yFormat:fmtNum })
          ),
          h('div',{style:{display:'flex', flexDirection:'column', gap:18}},
            h('div',{className:'card'},
              h('div',{className:'card-title-row'}, h('h3',null, groupBy==='k3'?'Alt Kırılım (Kat 3)':'Kategori Dağılımı',
                h(InfoIcon,{title:'Kategori Dağılımı'}, h('strong',null,'Ne? '),'Aylık hacmin '+(groupBy==='k3'?'seçili kategorinin alt kırılımlarına':'alt kategorilere (Kat 2)')+' dağılımı.')
              )),
              h('div',{style:{display:'flex', justifyContent:'center', padding:'4px 0 10px'}}, h(Donut, { data:catRows, size:170 }))
            ),
            h('div',{className:'card', style:{flex:'1 1 auto'}},
              h('div',{className:'card-header'}, h('h3',null,'Kategori Bazında Hacim')),
              h(ShareBars, { rows:catRows })
            )
          )
        )
      ),

      // === Sezon Takvimi (taşındı: kategori durumun üstüne) ===
      h('div',{id:'fb-sezon', style:{scrollMarginTop:80}},
        h(SectionHeader, {
          accent:'#14B8A6',
          icon: h('svg',{width:22,height:22,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},
            h('rect',{x:3,y:4,width:18,height:17,rx:2}), h('path',{d:'M3 9h18M8 3v4M16 3v4'})),
          title: 'Kategori Sezon Takvimi · Son 12 Ay',
          desc: 'May 25 - Nis 26 · her hücredeki ↑/↓ önceki 12 aya göre artış/azalış'
        }),
        h('div',{className:'card', style:{marginBottom:18}},
          h(SeasonHeatmap, { rows:heatRows, months:ROLL_LABELS, showYoY:true }),
          h('div',{style:{marginTop:12, fontSize:12, color:'var(--ink-2)', display:'flex', gap:8, alignItems:'flex-start'}},
            h('span',{style:{color:'#14B8A6', flexShrink:0, paddingTop:1}}, I.Bulb?I.Bulb(15):'💡'),
            h('div',null, 'Hücre rengi ay-içi yoğunluğu (kırmızı=düşük, yeşil=peak), alttaki ↑/↓ ise o ayın bir önceki yılın aynı ayına göre değişimidir (YoY). İçeriğin peak\'ten 4-6 hafta önce yayında olması önerilir.')
          )
        )
      ),

      // === Fırsatlar ===
      h('div',{id:'fb-firsatlar', style:{scrollMarginTop:80}},
        h(SectionHeader, {
          accent:'#F59E0B', icon: I.Bulb ? I.Bulb(22) : '💡',
          title: 'Fırsatlar', desc: 'Dört mercek: hızlı kazanımlar, yükselen talep, ticari değer ve savunma'
        }),
        h('div',{style:{fontSize:11.5, color:'var(--ink-2)', margin:'-4px 0 12px', display:'flex', gap:6, alignItems:'flex-start', lineHeight:1.5}},
          h('span',{style:{color:'#F59E0B', flexShrink:0}}, I.Bulb?I.Bulb(14):'💡'),
          h('div',null, 'Her karoda o merceğe uyan tüm kelimeler listelenir. Kolonlar: ', h('strong',null,'Hacim'),' (2026 Oca-Nis aylık ort. arama) · ', h('strong',null,'YoY'),' (geçen yılın aynı ayına göre değişim) · ', h('strong',null,'CPC'),' (tıklama başına reklam maliyeti, üst aralık ₺) · ', h('strong',null,'VitrA'),' (mobil organik sıra).')
        ),
        h('div',{className:'grid grid-2', style:{marginBottom:18}},
          oppCard(I.Target?I.Target(18):'🎯', 'Hızlı Kazanımlar', '#10B981', quickWins,
            h('span',null,'Düşük/orta rekabet + anlamlı hacim. Organik sıralama görece kolay; VitrA "üst sırada değil" olanlar öncelikli içerik hedefi olabilir.'),
            quickWins.reduce((a,r)=>a+r.vol,0)),
          oppCard(I.TrendUp?I.TrendUp(18):'📈', 'Yükselen Talep', '#0EA5E9', rising,
            h('span',null,'Geçen yılın aynı ayına göre (YoY) ≥ %50 büyüyen kelimeler. Erken içerikle trend olgunlaşmadan sıralama kapılabilir.'),
            rising.reduce((a,r)=>a+r.vol,0)),
          oppCard('₺', 'Ticari Değer', '#8B5CF6', commercial,
            h('span',null,'Yüksek CPC = bu kelimede reklam bütçesi dönüyor (tıklama maliyeti yüksek). Organik sıralama, ödenen trafiği ücretsiz yakalama fırsatı olabilir.'),
            commercial.reduce((a,r)=>a+r.vol,0)),
          oppCard('🛡', 'Risk / Savunma', '#EF4444', risk,
            h('span',null,'Hacmi yüksek ama geçen yılın aynı ayına göre düşüyor. VitrA güçlüyse savunulabilir; değilse talep erimesi izlenebilir.'),
            risk.reduce((a,r)=>a+r.vol,0))
        )
      ),

      // === Kategori Durum & Aksiyon (accordion) ===
      h('div',{id:'fb-kategori', style:{scrollMarginTop:80}},
        h(SectionHeader, {
          accent:'#EF4444',
          icon: h('svg',{width:22,height:22,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},
            h('path',{d:'M9 11l3 3L22 4'}), h('path',{d:'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'})),
          title: 'Kategori Bazında Durum & Aksiyon',
          desc: 'Her alt kategoride pazar durumu, VitrA konumu ve önerilen aksiyon · başlığa tıklayarak detayı açabilirsiniz'
        }),
        h('div',{className:'grid grid-2', style:{marginBottom:18, alignItems:'start'}},
          perCat.map(c => h(CatCard, {key:c.k2, c, open: openCat===c.k2, onToggle:()=>setOpenCat(o=>o===c.k2?null:c.k2)}))
        )
      ),

      // === Rakip Görünümü ===
      !hasFilter && h('div',{id:'fb-rakip', style:{scrollMarginTop:80}},
        h(SectionHeader, {
          accent:'#EF4444',
          icon: h('svg',{width:22,height:22,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},
            h('circle',{cx:9,cy:7,r:3}), h('circle',{cx:17.5,cy:9,r:2.2}), h('path',{d:'M3 21v-2a5 5 0 0 1 9-3.2M15.5 14.5a4 4 0 0 1 5.5 3.5V21'})),
          title: 'Rakip Görünümü',
          desc: 'Bu kelime grubunda görünürlük ve 2026 ilk yarı değişimi (SEOmonitor · TR)'
        }),
        h('div',{className:'card flush', style:{marginBottom:18}},
          h('div',{className:'tbl-wrap'},
            h('table',{className:'tbl'},
              h('thead',null, h('tr',null,
                h('th',null,'Marka'), h('th',null,'Tür'),
                h('th',{className:'num'},'Google Görünürlük'), h('th',{className:'num'},'Oca-Haz Δ'),
                h('th',{className:'num', title:'Google AI Overview\'da görünürlük'},'AI Overview'),
                h('th',{className:'num', title:'AI arama motorlarında görünürlük'},'AI Search')
              )),
              h('tbody',null, COMP_VIS.map((c,i)=>h('tr',{key:i, style:c.self?{background:'color-mix(in srgb, var(--coral) 8%, transparent)'}:null},
                h('td',{className:'kw-cell', style:{fontWeight:c.self?700:500}}, c.d),
                h('td',{style:{fontSize:11, color:'var(--ink-2)'}}, c.tip),
                h('td',{className:'num', style:{fontWeight:600}}, '%'+c.g),
                h('td',{className:'num'}, h(YoYPill,{yoy:c.gchg/100, type:'Oca-Haz'})),
                h('td',{className:'num', style:{color: c.aio>=20?'#10B981':'var(--ink-2)'}}, '%'+c.aio),
                h('td',{className:'num', style:{color: c.ais>=20?'#10B981':'var(--ink-2)'}}, '%'+c.ais)
              )))
            )
          ),
          h('div',{style:{padding:'11px 14px', fontSize:12.5, color:'var(--ink-2)', borderTop:'1px solid var(--line)', lineHeight:1.6, display:'flex', gap:8, alignItems:'flex-start'}},
            h('span',{style:{color:'#EF4444', flexShrink:0, paddingTop:1}}, I.Bulb?I.Bulb(15):'💡'),
            h('div',null, h('strong',null,'Okuma: '), 'Klasik Google\'da VitrA bu kelime grubunda tek kazanan (+13 puan); tüm rakipler düşüşte - pay alma penceresi açık. Domain düzeyinde AI aramada ise pazar yerleri önde (Koçtaş AI Overview %70, Trendyol/Hepsiburada AI Search %57-64), VitrA bu yüzeylerde geride. VitrA\'nın geliştirmeye en açık olduğu sorgular kulp/raf (Tamamlayıcılar) ve genel/mutfak tezgah - bunları ağırlıkla Koçtaş ve yapı marketleri tutuyor.')
          )
        )
      ),

      // === AI Overview Görünürlüğü ===
      !hasFilter && h('div',{id:'fb-aio', style:{scrollMarginTop:80}},
        h(SectionHeader, {
          accent:'#6366F1',
          icon: h('svg',{width:22,height:22,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},
            h('circle',{cx:12,cy:12,r:3}), h('path',{d:'M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2'})),
          title: 'AI Overview Görünürlüğü',
          desc: 'Bu kelimelerin ne kadarında AI Overview çıkıyor ve VitrA anılıyor mu (SEOmonitor · mobil)'
        }),
        h('div',{className:'card', style:{marginBottom:18}},
          h('div',{style:{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12, marginBottom:14}},
            [['AI Overview çıkan kelime', AIO_DATA.present+' / '+AIO_DATA.checked, '≈ %'+(AIO_DATA.present/AIO_DATA.checked*100).toFixed(1)+' (mobil)', '#6366F1'],
             ['VitrA kaynak gösterilen', String(AIO_DATA.cite), '"lavabolu banyo dolapları fiyatları"', '#10B981'],
             ['Sadece rakip anılan', String(AIO_DATA.rakip), 'tezgah sorguları', '#EF4444']
            ].map((s,i)=>h('div',{key:i, style:{background:'color-mix(in srgb, '+s[3]+' 8%, transparent)', border:'1px solid color-mix(in srgb, '+s[3]+' 22%, transparent)', borderRadius:10, padding:'12px 14px'}},
              h('div',{style:{fontSize:11, color:'var(--ink-3)', fontWeight:600}}, s[0]),
              h('div',{style:{fontSize:24, fontWeight:700, fontFamily:'Bricolage Grotesque', color:s[3], lineHeight:1.1, margin:'3px 0'}}, s[1]),
              h('div',{style:{fontSize:10.5, color:'var(--ink-2)'}}, s[2])
            ))
          ),
          h('div',{style:{fontSize:11, fontWeight:700, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:6}}, 'AI Overview çıkan 5 kelime'),
          h('div',null,
            AIO_DATA.items.map((it,i)=>{ const st=AIO_STATUS[it.status]; return h('div',{key:i, style:{display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, padding:'7px 0', borderBottom:i<AIO_DATA.items.length-1?'1px solid var(--line-soft)':'none'}},
              h('span',{style:{fontSize:12.5, color:'var(--ink)'}}, it.kw),
              h('span',{className:'pill', style:{background:'color-mix(in srgb, '+st.color+' 14%, transparent)', color:st.color, fontWeight:600, flexShrink:0}}, st.txt)
            );})
          ),
          h('div',{style:{marginTop:12, fontSize:12, color:'var(--ink-2)', lineHeight:1.55, display:'flex', gap:8, alignItems:'flex-start'}},
            h('span',{style:{color:'#6366F1', flexShrink:0, paddingTop:1}}, I.Bulb?I.Bulb(15):'💡'),
            h('div',null, 'AI Overview bu kelime grubunda mobilde henüz çok az tetikleniyor (5/349 ≈ %1,4) - şu an küçük bir faktör. Tetiklendiği yerler ağırlıkla tezgah/karşılaştırma sorguları; bunlarda şu an rakipler kaynak gösteriliyor, VitrA henüz değil. AI Overview yaygınlaştığında hazır olmak için içerik AI-dostu (kısa özet, SSS, tablo) yapılandırılabilir. Not: bu tarama mobil + bu 349 kelimeyi kapsar; masaüstü veya daha geniş bir AI Overview / AI-arama citation taraması istenirse ayrıca eklenebilir.')
          )
        )
      ),

      // === 360° Kanal Önerileri (accordion) ===
      !hasFilter && h('div',{id:'fb-kanal', style:{scrollMarginTop:80}},
        h(SectionHeader, {
          accent:'#6366F1',
          icon: h('svg',{width:22,height:22,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},
            h('circle',{cx:12,cy:12,r:10}), h('path',{d:'M2 12h20'}), h('path',{d:'M12 2a15 15 0 0 1 0 20'}), h('path',{d:'M12 2a15 15 0 0 0 0 20'})),
          title: '360° Kanal Fırsatları & Öneriler',
          desc: 'SEO + AI + reklam + video + sosyal + kampanya · başlığa tıklayarak detay & rakip faaliyetini açabilirsiniz'
        }),
        h('div',{className:'grid grid-2', style:{marginBottom:18, alignItems:'start'}},
          CHANNELS.map((ch,idx) => h(Acc, {key:ch.title, open: openCh===idx, onToggle:()=>setOpenCh(o=>o===idx?null:idx),
            head: h('div',{style:{display:'flex', alignItems:'center', gap:10}},
              h('span',{style:{width:30, height:30, borderRadius:8, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'color-mix(in srgb, '+ch.accent+' 14%, transparent)', fontSize:16}}, ch.icon),
              h('div',{style:{flex:1, minWidth:0}},
                h('div',{style:{fontWeight:600, fontSize:14}}, ch.title),
                h('div',{style:{fontSize:11.5, color:'var(--ink-3)', lineHeight:1.4, marginTop:2}}, ch.ozet)
              ),
              h('span',{style:{display:'inline-flex', alignItems:'center', gap:5, flexShrink:0, fontSize:10.5, fontWeight:700, padding:'4px 10px', borderRadius:20, border:'1px solid '+(openCh===idx?ch.accent:'var(--line)'), color:openCh===idx?ch.accent:'var(--ink-2)', background:openCh===idx?'color-mix(in srgb, '+ch.accent+' 10%, transparent)':'var(--line-soft)'}},
                openCh===idx?'Kapat':'Detay & rakip', h('span',{style:{display:'inline-block', transform:openCh===idx?'rotate(180deg)':'none', transition:'.2s'}}, '▾'))
            )},
            h('ul',{style:{margin:'2px 0 0', paddingLeft:18, fontSize:12.5, lineHeight:1.55, color:'var(--ink-2)', display:'flex', flexDirection:'column', gap:7}},
              ch.items.map((t,i)=>h('li',{key:i, style:{paddingLeft:3}}, t))
            ),
            h('div',{style:{marginTop:11, fontSize:12, color:'var(--ink-2)', lineHeight:1.55, background:'color-mix(in srgb, '+ch.accent+' 8%, transparent)', padding:'9px 12px', borderRadius:8}},
              h('strong',{style:{color:ch.accent}}, 'Rakipler ne yapıyor? '), ch.rakip)
          ))
        )
      ),

      // === En Yüksek Fırsat Skoru (tablonun hemen üstü) ===
      h('div',{id:'fb-skor', style:{scrollMarginTop:80}},
        h(SectionHeader, {
          accent:'#10B981',
          icon: h('svg',{width:22,height:22,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},
            h('line',{x1:4,y1:7,x2:14,y2:7}), h('line',{x1:4,y1:12,x2:20,y2:12}), h('line',{x1:4,y1:17,x2:9,y2:17})),
          title: 'En Yüksek Fırsat Skoru',
          desc: 'İlk 18 keyword - hacim, büyüme ve rekabeti birleştiren bileşik skora göre'
        }),
        h('div',{className:'card', style:{marginBottom:18}},
          h('div',{style:{display:'flex', flexWrap:'wrap', gap:'4px 16px', margin:'0 0 12px', fontSize:11, color:'var(--ink-2)', alignItems:'center'}},
            h('span',{style:{fontWeight:600}}, 'Bar rengi = rekabet:'),
            ['Low','Medium','High'].map(c=>h('span',{key:c, style:{display:'inline-flex', alignItems:'center', gap:5}},
              h('span',{style:{width:10,height:10,borderRadius:3,background:COMP_COLOR[c]}}), COMP_TR[c])),
            h('span',{style:{color:'var(--ink-3)', marginLeft:'auto'}}, 'Hacim = 2026 Oca-Nis aylık ort. · YoY = geçen yılın aynı ayına göre · bar = fırsat skoru · VitrA #sırası')
          ),
          rows.length ? h(OppRankBars, { rows }) : h('div',{style:{color:'var(--ink-3)', padding:20, textAlign:'center'}}, 'Bu filtrede keyword yok.')
        )
      ),

      // === Yönetici Özeti · VitrA Nerede, Ne Yapabiliriz (tam) ===
      !hasFilter && h('div',{id:'fb-ozet', style:{scrollMarginTop:80, marginBottom:18}},
        h('div',{className:'card', style:{borderLeft:'4px solid var(--coral)'}},
          h('div',{style:{display:'flex', alignItems:'center', gap:9, marginBottom:12}},
            h('span',{style:{color:'var(--coral)'}}, I.Book?I.Book(20):'📋'),
            h('h3',{style:{margin:0, fontSize:16}}, 'Yönetici Özeti · VitrA Nerede, Ne Yapabiliriz')
          ),
          h('ul',{style:{margin:0, paddingLeft:18, fontSize:13, lineHeight:1.7, color:'var(--ink-2)'}},
            h('li',null, h('strong',{style:{color:'#10B981'}},'VitrA bu kelimelerde güçlü: '),'Takip edilen 332 kelimenin 231\'inde ilk-10, 130\'unda ilk-3\'teyiz; görünürlük %51 (+13 puan). Tüm rakipler düşüşte (Koçtaş -%5, Trendyol -%12, IKEA/Hepsiburada -%13) - pay alma penceresi açık.'),
            h('li',null, h('strong',{style:{color:'#8B5CF6'}},'En güçlü alanlar: '),'Set Modülleri (ort. sıra 2,3), Aynalar (5,0), Lavabo Dolapları (5,6) ve İlham ("banyo modelleri" 1.). "Çamaşır makinesi dolabı" da 3. sırada - bu alan da güçlü.'),
            h('li',null, h('strong',{style:{color:'#F59E0B'}},'En büyük geliştirme alanı: '),'Tamamlayıcılar (kulp/raf, ~138 bin/ay, ilk-10 kapsamı sadece %3). "banyo rafı" 16.\'dan ilk-10\'a taşınmak net bir hızlı kazanım.'),
            h('li',null, h('strong',{style:{color:'#F59E0B'}},'Tezgah nüansı: '),'Banyo-tezgahında 1.\'iz; ama yüksek hacimli "porselen tezgah / tezgâh" çoğunlukla mutfak-niyetli, burada üst sıralarda değiliz - ürün uygunluğu değerlendirilebilir.'),
            h('li',null, h('strong',{style:{color:'#6366F1'}},'AI Overview: '),'Bu segmentte henüz az tetikleniyor (349 kelimede 5). VitrA 1\'inde kaynak gösteriliyor; 3 tezgah sorgusunda şu an rakipler anılıyor - izlenecek alan.'),
            h('li',null, h('strong',{style:{color:'#14B8A6'}},'Sezon: '),'Haziran en sakin ay (hazırlık); 2. zirve Ekim (sonbahar yenileme), ardından 27 Kasım Black Friday. Plan bu pencerelere göre kurulabilir.'),
            h('li',null, h('strong',{style:{color:'var(--coral)'}},'Öncelik sırası: '),'(1) banyo rafı + çamaşır/kurutma dolabı varyantlarını ilk-10\'a · (2) küçük-banyo niş içeriği · (3) ayna görünürlük gerilemesini durdurmak · (4) tezgah ürün-uygunluk kararı · (5) sonbahar + Black Friday hazırlığı.')
          )
        )
      ),

      // === 2026 2. Yarı · Fırsat & Kampanya Takvimi ===
      !hasFilter && h('div',{id:'fb-h2', style:{scrollMarginTop:80}},
        h(SectionHeader, {
          accent:'#F59E0B',
          icon: h('svg',{width:22,height:22,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},
            h('path',{d:'M3 17l6-6 4 4 7-7'}), h('path',{d:'M14 7h6v6'})),
          title: '2026 2. Yarı · Fırsat & Kampanya Takvimi',
          desc: 'Haziran ve sonrası için ne zaman neye oynanabilir (sezon + perakende takvimi)'
        }),
        h('div',{className:'card', style:{marginBottom:18}},
          FORWARD.map((p,i)=>h('div',{key:i, style:{display:'grid', gridTemplateColumns:'140px 72px 1fr', gap:12, alignItems:'center', padding:'11px 0', borderBottom:i<FORWARD.length-1?'1px solid var(--line-soft)':'none'}},
            h('div',null,
              h('div',{style:{fontWeight:700, fontSize:13}}, p.ay),
              h('div',{style:{fontSize:10.5, color:p.color, fontWeight:600, marginTop:2}}, p.tag)
            ),
            h('div',{style:{textAlign:'center'}},
              h('div',{style:{fontFamily:'Bricolage Grotesque', fontWeight:700, fontSize:15, color:p.color}}, (p.pct>0?'+':'')+p.pct+'%'),
              h('div',{style:{fontSize:8.5, color:'var(--ink-3)'}}, 'ort.\'ya göre'),
              h('div',{style:{height:5, borderRadius:3, background:'var(--line)', overflow:'hidden', marginTop:3}},
                h('div',{style:{width:Math.min(100,(100+p.pct)/120*100)+'%', height:'100%', background:p.color}}))
            ),
            h('div',{style:{fontSize:12.5, color:'var(--ink-2)', lineHeight:1.55}}, p.text)
          )),
          h('div',{style:{marginTop:10, fontSize:11, color:'var(--ink-3)'}}, 'Talep seviyesi, son 2 yılın (2024-2025) aynı ay ortalamasına göredir: 0 = yıl ortalaması, "+" üstünde / "-" altında.')
        )
      ),

      // === Skor tablosu ===
      h('div',{id:'fb-tablo', style:{scrollMarginTop:80}},
        h(SectionHeader, {
          accent:'#6366F1',
          icon: h('svg',{width:22,height:22,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},
            h('line',{x1:8,y1:6,x2:21,y2:6}), h('line',{x1:8,y1:12,x2:21,y2:12}), h('line',{x1:8,y1:18,x2:21,y2:18}),
            h('line',{x1:3,y1:6,x2:3.01,y2:6}), h('line',{x1:3,y1:12,x2:3.01,y2:12}), h('line',{x1:3,y1:18,x2:3.01,y2:18})),
          title: 'Tüm Keyword\'ler · Fırsat Skoru & VitrA Sırası',
          desc: hasFilter ? `${fmtFull(rows.length)} keyword (filtreli)` : 'Sıralanabilir tam liste · Hacim = 2026 Oca-Nis aylık ortalama',
          actions: h(ChartActions, { csv: csvData(), shareKey:'banyo2026' })
        }),
        h('div',{className:'card flush'},
          h('div',{className:'tbl-wrap', style:{maxHeight:560}},
            h('table',{className:'tbl'},
              h('thead',null, h('tr',null,
                h('th',{onClick:()=>setSort('kw'), style:{cursor:'pointer'}}, 'Keyword'+sortArrow('kw')),
                h('th',null,'Kategori'),
                h('th',{className:'num', onClick:()=>setSort('vol'), style:{cursor:'pointer'}}, 'Hacim'+sortArrow('vol')),
                h('th',{className:'num', onClick:()=>setSort('yoy'), style:{cursor:'pointer'}}, 'YoY'+sortArrow('yoy')),
                h('th',{onClick:()=>setSort('comp'), style:{cursor:'pointer'}}, 'Rekabet'+sortArrow('comp')),
                h('th',{className:'num', onClick:()=>setSort('bidHi'), style:{cursor:'pointer'}}, 'CPC'+sortArrow('bidHi')),
                h('th',{onClick:()=>setSort('pos'), style:{cursor:'pointer'}}, 'VitrA'+sortArrow('pos')),
                h('th',{className:'num', onClick:()=>setSort('score'), style:{cursor:'pointer'}}, 'Skor'+sortArrow('score'))
              )),
              h('tbody',null,
                tableRows.map((r,i)=>h('tr',{key:i},
                  h('td',{className:'kw-cell'}, r.kw),
                  h('td',{style:{fontSize:11}}, h('span',{style:{display:'inline-flex', alignItems:'center', gap:6}},
                    h('span',{style:{width:8,height:8,borderRadius:2,background:k2color(r.k2),flexShrink:0}}),
                    h('span',{style:{color:'var(--ink-2)'}}, r.k2))),
                  h('td',{className:'num'}, fmtFull(r.vol)),
                  h('td',{className:'num'}, h(YoYPill,{yoy:r.yoy})),
                  h('td',null, h('span',{className:'pill', style:{background:'color-mix(in srgb, '+(COMP_COLOR[r.comp]||'#8A8A8A')+' 15%, transparent)', color:COMP_COLOR[r.comp]||'var(--ink-2)', fontWeight:600}}, COMP_TR[r.comp]||'-')),
                  h('td',{className:'num', style:{color:'var(--ink-2)'}}, r.bidHi!=null?'₺'+r.bidHi.toFixed(1).replace('.',','):'-'),
                  h('td',null, h(PosBadge,{pos:r.pos, chg:r.posChg, seo:r.seo})),
                  h('td',{className:'num'}, h('div',{style:{display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end'}},
                    h('div',{style:{width:42,height:6,borderRadius:3,background:'var(--line)',overflow:'hidden'}},
                      h('div',{style:{width:(r.score/maxScore*100)+'%', height:'100%', background:'linear-gradient(90deg,#8B5CF6,#6366F1)'}})),
                    h('strong',{style:{minWidth:22, textAlign:'right'}}, r.score)))
                ))
              )
            )
          ),
          h('div',{style:{padding:'10px 14px', fontSize:11, color:'var(--ink-3)', borderTop:'1px solid var(--line)', lineHeight:1.5}},
            h('strong',null,'Metodoloji: '),
            'Hacim/rekabet/CPC: Google Keyword Planner (2026 Oca-Nis aylık ort.). VitrA mobil sırası, niyet ve AI Overview: SEOmonitor (1 Oca - 3 Haz 2026). ',
            '"VitrA üst sırada değil" = ilk 100 dışında; "–" = SEOmonitor izlemesinde yok. VitrA sırasındaki ↑/↓ son dönem sıra değişimidir. YoY = geçen yılın aynı ayına göre değişim. CPC = tıklama başına reklam maliyeti (üst aralık). Fırsat Skoru = %40 hacim + %25 büyüme + %20 düşük rekabet + %15 CPC.'
          )
        )
      )
    );
  }

  window.TABS = window.TABS || {};
  window.TABS.FirsatTab = FirsatTab;
})();
