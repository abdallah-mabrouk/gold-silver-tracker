# 🏗️ معمارية النظام القابل للتوسع

## نظرة عامة

تم تصميم النظام بشكل معياري (Modular) يسمح بإضافة أنواع جديدة من الأصول (الأسهم، العملات، السلع) دون الحاجة لإعادة كتابة الكود الأساسي.

---

## 📊 البنية الحالية vs المستقبلية

### الحالي: متخصص في المعادن الثمينة
```
Frontend (React/HTML)
    ↓
API Layer (Supabase)
    ↓
Database (PostgreSQL)
    ↓
n8n Automation (Gold/Silver APIs)
```

### المستقبل: منصة استثمارية متعددة الأصول
```
Frontend (Unified Dashboard)
    ↓
Asset Manager (Abstract Layer)
    ↓
    ├── Metals Module (Gold, Silver, Platinum)
    ├── Stocks Module (EGX Stocks)
    ├── Crypto Module (Bitcoin, Ethereum)
    └── Forex Module (USD/EGP, EUR/EGP)
    ↓
Data Aggregation Layer
    ↓
Database (Multi-Asset Schema)
```

---

## 🎯 استراتيجية التوسع

### الخيار 1: موقع موحد (Unified Platform) ⭐ مُفضل
**المميزات:**
- تجربة مستخدم موحدة
- إدارة محفظة شاملة عبر جميع الأصول
- تحليلات متقدمة (مثل: الارتباط بين الذهب والأسهم)
- كود مشترك = صيانة أسهل
- قاعدة بيانات واحدة

**العيوب:**
- تعقيد أكبر في البداية
- حجم المشروع أكبر

**مثال على الواجهة:**
```
📊 Dashboard الرئيسي
├── 💰 محفظتي (إجمالي عبر جميع الأصول)
├── 📈 الأسواق
│   ├── معادن ثمينة (ذهب، فضة)
│   ├── أسهم مصرية (EGX)
│   ├── عملات رقمية
│   └── عملات أجنبية
├── 📊 التحليلات
├── 🔔 التنبيهات
└── ⚙️ الإعدادات
```

### الخيار 2: مواقع منفصلة (Separate Sites)
**المميزات:**
- بساطة في التطوير والصيانة
- تخصيص كامل لكل نوع أصل
- إطلاق تدريجي أسهل

**العيوب:**
- تكرار الكود
- صعوبة في التحليلات المتقاطعة
- تجربة مستخدم متفرقة

**الهيكل:**
```
metals-tracker.com    → الذهب والفضة
stocks-tracker.com    → الأسهم المصرية
crypto-tracker.com    → العملات الرقمية
```

---

## 🗄️ تصميم قاعدة البيانات القابلة للتوسع

### الجداول الأساسية الموحدة

```sql
-- جدول أنواع الأصول (Asset Types)
CREATE TABLE asset_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,  -- 'GOLD', 'SILVER', 'STOCK', 'CRYPTO'
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,     -- 'metal', 'equity', 'crypto', 'forex'
    unit VARCHAR(20) DEFAULT 'gram',   -- 'gram', 'share', 'coin', 'unit'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الأصول المحددة (Specific Assets)
CREATE TABLE assets (
    id BIGSERIAL PRIMARY KEY,
    asset_type_id INT REFERENCES asset_types(id),
    symbol VARCHAR(20) UNIQUE NOT NULL,     -- 'XAU', 'COMI', 'BTC'
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    market VARCHAR(50),                     -- 'EGX', 'NASDAQ', 'Binance'
    metadata JSONB,                         -- بيانات إضافية خاصة بكل نوع
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الأسعار الموحد (Unified Prices)
CREATE TABLE asset_prices (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT REFERENCES assets(id),
    price_local DECIMAL(15,4) NOT NULL,
    price_global DECIMAL(15,4),
    currency VARCHAR(3) DEFAULT 'EGP',
    source VARCHAR(50) NOT NULL,
    date_gregorian TIMESTAMP WITH TIME ZONE NOT NULL,
    date_hijri VARCHAR(20),
    metadata JSONB,                         -- حجم التداول، سعر الفتح/الإغلاق، إلخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهرس للأداء
CREATE INDEX idx_asset_prices_lookup ON asset_prices(asset_id, date_gregorian DESC);

-- جدول المعاملات الموحد (Unified Transactions)
CREATE TABLE user_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    asset_id BIGINT REFERENCES assets(id),
    type VARCHAR(10) NOT NULL,              -- 'buy', 'sell'
    quantity DECIMAL(15,6) NOT NULL,        -- يمكن أن يكون جرامات أو أسهم
    price_per_unit DECIMAL(15,4) NOT NULL,
    fees JSONB,                             -- {manufacturing: 7%, commission: 0.5%, tax: 0%}
    total_cost DECIMAL(15,2) NOT NULL,
    breakeven_price DECIMAL(15,4),
    transaction_date DATE NOT NULL,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المحفظة (Portfolio Summary)
CREATE TABLE user_portfolios (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    asset_id BIGINT REFERENCES assets(id),
    total_quantity DECIMAL(15,6) NOT NULL,
    avg_purchase_price DECIMAL(15,4),
    total_invested DECIMAL(15,2),
    current_value DECIMAL(15,2),
    profit_loss DECIMAL(15,2),
    profit_loss_percent DECIMAL(7,2),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, asset_id)
);
```

### أمثلة على البيانات:

```sql
-- إضافة أنواع الأصول
INSERT INTO asset_types (code, name_ar, name_en, category, unit) VALUES
    ('GOLD', 'ذهب', 'Gold', 'metal', 'gram'),
    ('SILVER', 'فضة', 'Silver', 'metal', 'gram'),
    ('STOCK', 'سهم', 'Stock', 'equity', 'share'),
    ('CRYPTO', 'عملة رقمية', 'Cryptocurrency', 'crypto', 'coin');

-- إضافة أصول محددة
INSERT INTO assets (asset_type_id, symbol, name_ar, name_en, market, metadata) VALUES
    (1, 'XAU', 'ذهب عيار 24', 'Gold 24K', 'Global', '{"karat": 24}'),
    (2, 'XAG', 'فضة', 'Silver', 'Global', NULL),
    (3, 'COMI', 'التجاري الدولي', 'CIB', 'EGX', '{"sector": "Banking", "isin": "EGS65631C018"}'),
    (3, 'ETEL', 'المصرية للاتصالات', 'Telecom Egypt', 'EGX', '{"sector": "Telecom", "isin": "EGS69051C015"}'),
    (4, 'BTC', 'بيتكوين', 'Bitcoin', 'Crypto', '{"max_supply": 21000000}');
```

---

## 🔌 طبقة تجميع البيانات (Data Aggregation Layer)

### مثال: إضافة الأسهم المصرية

```javascript
// lib/adapters/egx-adapter.js
export class EGXAdapter {
  constructor(apiKey) {
    this.baseUrl = 'https://api.egx.com.eg';
    this.apiKey = apiKey;
  }

  async fetchPrice(symbol) {
    const response = await fetch(`${this.baseUrl}/stocks/${symbol}`, {
      headers: { 'X-API-Key': this.apiKey }
    });
    
    const data = await response.json();
    
    // تحويل إلى الشكل الموحد
    return {
      asset_id: await this.getAssetId(symbol),
      price_local: data.lastPrice,
      currency: 'EGP',
      source: 'EGX',
      metadata: {
        volume: data.volume,
        open: data.openPrice,
        high: data.highPrice,
        low: data.lowPrice,
        close: data.lastPrice,
        change: data.change,
        changePercent: data.changePercent
      }
    };
  }

  async getAssetId(symbol) {
    // جلب asset_id من قاعدة البيانات
    const { data } = await supabase
      .from('assets')
      .select('id')
      .eq('symbol', symbol)
      .single();
    
    return data.id;
  }
}
```

### استخدام Adapter Pattern:

```javascript
// lib/price-fetcher.js
import { GoldAPIAdapter } from './adapters/gold-adapter';
import { EGXAdapter } from './adapters/egx-adapter';
import { CryptoAdapter } from './adapters/crypto-adapter';

export class PriceFetcher {
  constructor() {
    this.adapters = {
      metal: new GoldAPIAdapter(process.env.GOLD_API_KEY),
      stock: new EGXAdapter(process.env.EGX_API_KEY),
      crypto: new CryptoAdapter(process.env.CRYPTO_API_KEY)
    };
  }

  async fetchPrice(assetType, symbol) {
    const adapter = this.adapters[assetType];
    if (!adapter) {
      throw new Error(`No adapter for asset type: ${assetType}`);
    }
    
    return adapter.fetchPrice(symbol);
  }

  async fetchAllPrices() {
    // جلب جميع الأصول النشطة
    const { data: assets } = await supabase
      .from('assets')
      .select('*, asset_types(*)')
      .eq('is_active', true);
    
    // جلب أسعار جميع الأصول بالتوازي
    const prices = await Promise.all(
      assets.map(asset => 
        this.fetchPrice(asset.asset_types.category, asset.symbol)
      )
    );
    
    return prices;
  }
}
```

---

## 📱 الواجهة الأمامية الموحدة

### Component Structure:

```
src/
├── components/
│   ├── common/
│   │   ├── PriceChart.jsx        # رسم بياني موحد
│   │   ├── AssetCard.jsx         # كارت عرض الأصل
│   │   ├── TransactionForm.jsx   # نموذج المعاملة
│   │   └── PortfolioSummary.jsx  # ملخص المحفظة
│   │
│   ├── metals/
│   │   ├── GoldDashboard.jsx
│   │   └── MetalAnalysis.jsx
│   │
│   ├── stocks/
│   │   ├── StocksDashboard.jsx
│   │   ├── StockScreener.jsx
│   │   └── MarketDepth.jsx
│   │
│   └── crypto/
│       ├── CryptoDashboard.jsx
│       └── CryptoExchange.jsx
│
├── lib/
│   ├── adapters/              # محولات البيانات
│   ├── hooks/
│   │   ├── useAssetPrice.js  # Hook موحد لجلب الأسعار
│   │   ├── usePortfolio.js   # Hook لإدارة المحفظة
│   │   └── useAnalytics.js   # Hook للتحليلات
│   │
│   └── utils/
│       ├── calculations.js   # حسابات موحدة
│       └── formatters.js     # تنسيقات موحدة
│
└── pages/
    ├── index.jsx             # Dashboard الرئيسي
    ├── metals.jsx            # صفحة المعادن
    ├── stocks.jsx            # صفحة الأسهم
    ├── crypto.jsx            # صفحة العملات الرقمية
    └── portfolio.jsx         # المحفظة الشاملة
```

### مثال: Hook موحد

```javascript
// lib/hooks/useAssetPrice.js
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useAssetPrice(assetSymbol, timeframe = '7d') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPrices() {
      try {
        setLoading(true);
        
        const { data: asset } = await supabase
          .from('assets')
          .select('id')
          .eq('symbol', assetSymbol)
          .single();

        const daysMap = { '7d': 7, '1m': 30, '3m': 90, '1y': 365 };
        const days = daysMap[timeframe];
        
        const { data: prices } = await supabase
          .from('asset_prices')
          .select('*')
          .eq('asset_id', asset.id)
          .gte('date_gregorian', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
          .order('date_gregorian', { ascending: true });

        setData(prices);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, [assetSymbol, timeframe]);

  return { data, loading, error };
}
```

---

## 🔄 n8n Workflow الموحد

```json
{
  "name": "Universal Asset Price Fetcher",
  "nodes": [
    {
      "name": "Schedule",
      "type": "n8n-nodes-base.scheduleTrigger"
    },
    {
      "name": "Get Active Assets",
      "type": "n8n-nodes-base.supabase",
      "notes": "جلب جميع الأصول النشطة من قاعدة البيانات"
    },
    {
      "name": "Split by Asset Type",
      "type": "n8n-nodes-base.switch",
      "notes": "توجيه كل نوع أصل للـ API المناسب"
    },
    {
      "name": "Fetch Metal Prices",
      "type": "n8n-nodes-base.httpRequest"
    },
    {
      "name": "Fetch Stock Prices",
      "type": "n8n-nodes-base.httpRequest"
    },
    {
      "name": "Fetch Crypto Prices",
      "type": "n8n-nodes-base.httpRequest"
    },
    {
      "name": "Merge Results",
      "type": "n8n-nodes-base.merge"
    },
    {
      "name": "Save to Database",
      "type": "n8n-nodes-base.supabase"
    }
  ]
}
```

---

## 🎯 خطة التنفيذ المرحلية

### المرحلة 1: البنية التحتية (أسبوع 1-2)
- [x] قاعدة البيانات الحالية للذهب والفضة
- [ ] تعديل قاعدة البيانات للبنية الموحدة
- [ ] إنشاء Adapter Pattern الأساسي
- [ ] اختبار مع الذهب والفضة

### المرحلة 2: إضافة الأسهم المصرية (أسبوع 3-4)
- [ ] الحصول على EGX API Access
- [ ] إنشاء EGX Adapter
- [ ] إضافة أسهم EGX 30 الأكثر نشاطاً
- [ ] تصميم واجهة الأسهم
- [ ] اختبار التكامل

### المرحلة 3: التحسينات (أسبوع 5-6)
- [ ] تحليلات متقدمة متقاطعة
- [ ] لوحة المحفظة الموحدة
- [ ] تحسين الأداء
- [ ] اختبارات شاملة

### المرحلة 4: الإطلاق (أسبوع 7)
- [ ] نشر على Production
- [ ] مراقبة الأداء
- [ ] جمع التعليقات
- [ ] تحسينات بناءً على الاستخدام

---

## 🔐 الاعتبارات الأمنية

1. **API Keys Management:**
   - استخدام Environment Variables
   - تشفير المفاتيح في قاعدة البيانات
   - Rotation دورية للمفاتيح

2. **Rate Limiting:**
   - حد أقصى لطلبات API (مثلاً: 100 طلب/ساعة لكل مستخدم)
   - Caching ذكي لتقليل الطلبات

3. **Data Validation:**
   - التحقق من صحة البيانات قبل الحفظ
   - معالجة الأخطاء بشكل آمن

---

## 📊 مقارنة الأداء

| الميزة | موقع منفصل | منصة موحدة |
|--------|------------|------------|
| سرعة التطوير | ⚡⚡⚡ | ⚡⚡ |
| قابلية الصيانة | ⚡ | ⚡⚡⚡ |
| تجربة المستخدم | ⚡⚡ | ⚡⚡⚡ |
| التكلفة | متوسطة | منخفضة (طويل المدى) |
| قابلية التوسع | ⚡ | ⚡⚡⚡ |

---

## 🎁 التوصية النهائية

**نوصي ببناء منصة موحدة** للأسباب التالية:

1. **تجربة مستخدم أفضل**: المستثمر يريد رؤية كل استثماراته في مكان واحد
2. **تحليلات متقدمة**: إمكانية تحليل الارتباط بين الذهب والأسهم والعملات
3. **كود مشترك**: تقليل التكرار = صيانة أسهل
4. **قابلية التوسع**: إضافة أصول جديدة سهلة جداً
5. **تكلفة أقل**: قاعدة بيانات واحدة، استضافة واحدة

لكن يمكن البدء بالذهب/الفضة، ثم إضافة الأسهم تدريجياً باستخدام نفس البنية.
