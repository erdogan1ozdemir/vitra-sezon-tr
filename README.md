# VitrA Dashboard — Sezonsallık & Keyword Intelligence

Türkiye banyo & seramik pazarında Google arama verisini analiz eden interaktif dashboard.
2.400+ keyword, 8 Kat1 / 64 Kat2 / 185 Kat3 kategori, 2024 ↔ 2025 karşılaştırması.

---

## Deploy

Proje hem **Vercel** (statik) hem **Railway** (Node/Express) ile çalışır. İkisi de
GitHub repo'sundan `Import` sonrası ek yapılandırma gerektirmez.

### Vercel (statik — önerilen)

1. https://vercel.com → **Add New... → Project**
2. GitHub repo'sunu seç → **Import**
3. Framework Preset otomatik olarak "Other" görünür — `vercel.json` tüm override'ı yapar.
4. **Deploy**. Build yok, saniyeler içinde `*.vercel.app` URL'si hazır.

Vercel config ayrıntısı: `vercel.json` içindeki `framework: null` + `buildCommand: null`,
projeyi tamamen statik olarak sunar (React + Babel tarayıcıda JSX'i derler).

### Railway (Node/Express)

1. https://railway.app → **New Project → Deploy from GitHub repo**
2. Nixpacks Node.js buildpack otomatik algılar (`package.json` + `npm start`).
3. Healthcheck: `GET /health` → `{ ok: true }` (100 sn timeout, `railway.json`'da tanımlı).
4. Deploy tamamlanınca `*.up.railway.app` URL'si verir.

Custom domain: Railway → Settings → Domains → + Custom Domain.

---

## Lokal çalıştırma

```bash
npm install
npm start
# http://localhost:3000
```

Node ≥18 gerekir. `PORT` env değişkeniyle port değiştirilebilir (default 3000).

---

## Proje yapısı

```
index.html             — SPA entry (Vercel otomatik bulur)
app.jsx                — React app kökü, layout + tab yönetimi
components.jsx         — chart bileşenleri (Line, Donut, Heatmap, Stream, Bump, Polar, vb.)
tabs.jsx               — tab içerikleri (Özet, Kategoriler, Keyword, Trendler, Fiyat)
utils.js               — veri toplama & formatlama yardımcıları
styles.css             — tüm stiller (CSS vars, light/dark tema, coral/nötr palet)
data/
  dashboard.js         — işlenmiş veri (2.420 keyword + kategori agregatları)
  workbook.json        — ara ürün, raw workbook dump
  source.xlsx          — kaynak Excel
server.js              — Express static server (Railway için)
vercel.json            — Vercel static override
railway.json           — Railway buildpack + healthcheck
```

---

## Veri akışı

Kaynak: `data/source.xlsx` → `data/workbook.json` → `data/dashboard.js` (build time).
YoY, QoQ, peak ay, çeyrek dağılımı, seasonality score gibi türetilmiş metrikler
`utils.js` ve `tabs.jsx` içinde hesaplanır.

Runtime'da veri `window.DATA` global'i üzerinden erişilir.

---

## Çevre değişkenleri

- `PORT` — Railway otomatik atar. Vercel'de gereksiz (statik).

---

© Inbound SEO — VitrA Türkiye Banyo Pazarı Analizi
