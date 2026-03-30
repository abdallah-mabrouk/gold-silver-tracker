# 📊 متتبع أسعار الذهب والفضة - نظام تحليل ذكي

<div dir="rtl">

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Arabic](https://img.shields.io/badge/lang-العربية-red)

## 🌟 نظرة عامة

نظام متكامل لتتبع وتحليل أسعار الذهب والفضة في السوق المصري والعالمي، مع تحليلات ذكية بالـ AI، كشف الأنماط الموسمية التلقائي، وإدارة محفظة احترافية.

## 📁 هيكل المشروع الكامل

```
gold-silver-tracker/
├── 📄 index.html              # الصفحة الرئيسية
├── 📄 package.json            # المكتبات والإعدادات
├── 📄 next.config.js         # إعدادات Next.js
├── 📄 .gitignore             # الملفات المستبعدة
├── 📄 .env.local.example     # مثال للمتغيرات البيئية
├── 📁 lib/                   # المكتبات
│   ├── supabase.js          # اتصال قاعدة البيانات
│   └── utils.js             # دوال مساعدة
├── 📁 public/                # الملفات العامة
│   └── sw.js                # Service Worker
├── 📁 database/              # قاعدة البيانات
│   └── schema.sql           # هيكل الجداول
└── 📁 n8n/                   # أتمتة
    └── workflow.json        # Workflow
```

## ✨ المميزات الرئيسية

### 📈 تتبع الأسعار
- ✅ جلب تلقائي للأسعار كل ساعة
- ✅ أسعار السوق المحلي والعالمي
- ✅ تسجيل التاريخ الميلادي والهجري
- ✅ 4 رسوم بيانية (قصير/طويل المدى)
- ✅ فلاتر زمنية: أسبوع، شهر، 3 أشهر، سنة، الكل

### 🤖 التحليلات الذكية
- 📊 **المؤشرات الفنية**: RSI, MACD, Moving Averages, Bollinger Bands
- 🎯 **كشف الاتجاهات**: اتجاهات صاعدة وهابطة
- 📅 **الأنماط الموسمية**: كشف مواسم الارتفاع والانخفاض
- 🌍 **مقارنة الأسواق**: محلي vs عالمي
- 🔮 **توقعات AI**: تنبؤات قصيرة وطويلة المدى
- 📰 **تحليل الأخبار**: ربط التغيرات بالأحداث

### 💼 إدارة المحفظة
- ➕ تسجيل المشتريات والمبيعات
- 💰 حساب المصنعية تلقائياً (قابل للتخصيص)
- 📍 عرض نقطة التعادل على الرسم البياني
- 📊 حساب الأرباح/الخسائر الفورية
- 📜 سجل كامل للمعاملات
- 🎯 ROI (العائد على الاستثمار)

### 🔔 نظام التنبيهات الذكي
- ⚡ تنبيهات التغيرات السريعة (+2% خلال 4 ساعات)
- 📈 تنبيهات بدء اتجاهات جديدة
- 🎯 تنبيهات الوصول للسعر المستهدف
- 📅 تنبيهات الأنماط الموسمية
- 📱 دعم Telegram Bot و Push Notifications
- ✉️ تقارير أسبوعية عبر البريد

## 🛠️ التقنيات المستخدمة

### Frontend
- **Next.js 14** - React Framework
- **Chart.js** - الرسوم البيانية
- **Tailwind CSS** - التصميم (اختياري)
- **IBM Plex Sans Arabic** - خطوط عربية احترافية

### Backend & Database
- **Supabase** - PostgreSQL Database + API
- **n8n** - أتمتة جلب الأسعار
- **Vercel** - استضافة الموقع
- **Gold API** - مصدر الأسعار العالمية

### التنبيهات
- **Telegram Bot API** - تنبيهات فورية
- **Push Notifications API** - إشعارات المتصفح
- **Resend** (اختياري) - البريد الإلكتروني

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+ 
- npm أو yarn
- حساب Supabase (مجاني)
- حساب Vercel (مجاني)
- سيرفر n8n (أو cloud instance)

### التثبيت

1. **استنساخ المشروع:**
```bash
git clone https://github.com/YOUR_USERNAME/gold-silver-tracker.git
cd gold-silver-tracker
```

2. **تثبيت المكتبات:**
```bash
npm install
```

3. **إعداد المتغيرات البيئية:**
أنشئ ملف `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
GOLD_API_KEY=goldapi-xxxxxxxxxx-xxxxxxx
TELEGRAM_BOT_TOKEN=123456789:ABCdef...
TELEGRAM_CHAT_ID=123456789
```

4. **إعداد قاعدة البيانات:**
- افتح Supabase Dashboard
- اذهب إلى SQL Editor
- شغّل ملف `database-schema.sql`

5. **استيراد n8n Workflow:**
- افتح n8n
- استورد `n8n-workflow.json`
- أضف Credentials (Supabase, Gold API, Telegram)
- فعّل Workflow

6. **تشغيل المشروع محلياً:**
```bash
npm run dev
```
افتح [http://localhost:3000](http://localhost:3000)

7. **النشر على Vercel:**
```bash
vercel --prod
```

## 📁 هيكل المشروع

```
gold-silver-tracker/
├── pages/
│   └── index.js              # الصفحة الرئيسية
├── lib/
│   └── supabase.js           # اتصال Supabase
├── public/
│   ├── sw.js                 # Service Worker
│   └── icons/                # الأيقونات
├── database-schema.sql       # قاعدة البيانات
├── n8n-workflow.json         # أتمتة n8n
├── SETUP-GUIDE.md           # دليل الإعداد الكامل
└── README.md                # هذا الملف
```

## 🎯 الاستخدام

### إضافة صفقة
1. اذهب إلى تبويب "محفظتي"
2. املأ نموذج الصفقة الجديدة
3. اضغط "إضافة الصفقة"
4. ستظهر في السجل تلقائياً

### إنشاء تنبيه
1. اذهب إلى تبويب "التنبيهات"
2. اختر نوع التنبيه والقيمة
3. حدد طريقة الإشعار (Telegram/Push)
4. اضغط "إضافة التنبيه"

### عرض التحليلات
1. تبويب "التحليلات المتقدمة" للمؤشرات الفنية
2. تبويب "الرؤى الذكية" للتوصيات والتنبؤات
3. كل الرسوم تحدث تلقائياً

## 📊 أمثلة على الرؤى الذكية

### كشف النمط الموسمي
```
🎯 نمط موسمي: يناير - فبراير
الذهب يرتفع تاريخياً بمعدل 4.2% 
موثوقية: 80% (تكرر 8 من 10 سنوات)
```

### توصية الشراء/البيع
```
🤖 توصية: انتظر
السعر أعلى من المتوسط بـ 2.8%
متوقع تصحيح خلال أسبوعين
```

### تنبيه تغير سريع
```
⚠️ تنبيه!
ارتفع سعر الذهب +2.3% خلال 4 ساعات
السعر الحالي: 3,450 ج.م
```

## 🔧 التخصيص

### تغيير الألوان
عدّل في `styles/globals.css`:
```css
:root {
  --primary-gold: #D4AF37;
  --primary-silver: #C0C0C0;
}
```

### تغيير نسبة المصنعية الافتراضية
في `lib/config.js`:
```javascript
export const DEFAULT_FEE_PERCENTAGE = 7.0 // غيّرها حسب السوق
```

### إضافة معادن أخرى
1. عدّل `database-schema.sql` لإضافة نوع المعدن
2. أضف API endpoint في n8n
3. أضف تبويب جديد في الواجهة

## 📈 خطة التطوير المستقبلية

- [ ] تطبيق موبايل (React Native)
- [ ] تكامل WhatsApp Bot
- [ ] تحليلات ML أكثر تقدماً
- [ ] دعم معادن إضافية (بلاتين، نحاس)
- [ ] API عام للمطورين
- [ ] لوحة تحكم للإدارة
- [ ] نظام إشعارات بالبريد
- [ ] تصدير التقارير PDF/Excel

## 🤝 المساهمة

نرحب بالمساهمات! إذا كنت تريد المساهمة:

1. Fork المشروع
2. أنشئ فرع جديد (`git checkout -b feature/amazing-feature`)
3. Commit تغييراتك (`git commit -m 'Add amazing feature'`)
4. Push للفرع (`git push origin feature/amazing-feature`)
5. افتح Pull Request

## 🙏 شكر وتقدير

- [GoldAPI.io](https://goldapi.io) - API الأسعار
- [Supabase](https://supabase.com) - قاعدة البيانات
- [n8n](https://n8n.io) - أتمتة العمليات
- [Chart.js](https://chartjs.org) - الرسوم البيانية

---

<div align="center">

**صنع بـ ❤️ لمستثمري الذهب والفضة في العالم العربي**

⭐ إذا أعجبك المشروع، لا تنسى وضع نجمة!

</div>

</div>
