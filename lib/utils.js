// lib/utils.js
// دوال مساعدة عامة للمشروع

/**
 * تحويل التاريخ الميلادي إلى هجري
 * @param {Date} gregorianDate - التاريخ الميلادي
 * @returns {string} التاريخ الهجري بصيغة "yyyy-mm-dd"
 */
export function gregorianToHijri(gregorianDate) {
  // استخدام مكتبة hijri-converter
  // في حالة عدم التثبيت، نستخدم تقريب بسيط
  const hijriYear = gregorianDate.getFullYear() - 579
  const hijriMonth = gregorianDate.getMonth() + 1
  const hijriDay = gregorianDate.getDate()
  
  return `${hijriYear}-${String(hijriMonth).padStart(2, '0')}-${String(hijriDay).padStart(2, '0')}`
}

/**
 * حساب سعر التعادل (السعر الأدنى للبيع)
 * @param {number} purchasePrice - سعر الشراء
 * @param {number} feePercentage - نسبة المصنعية
 * @returns {number} سعر التعادل
 */
export function calculateBreakeven(purchasePrice, feePercentage) {
  return purchasePrice * (1 + feePercentage / 100)
}

/**
 * حساب الربح/الخسارة
 * @param {number} currentPrice - السعر الحالي
 * @param {number} purchasePrice - سعر الشراء
 * @param {number} weight - الوزن
 * @returns {Object} {profit, profitPercent}
 */
export function calculateProfit(currentPrice, purchasePrice, weight) {
  const profit = (currentPrice - purchasePrice) * weight
  const profitPercent = ((currentPrice - purchasePrice) / purchasePrice) * 100
  
  return {
    profit: Math.round(profit * 100) / 100,
    profitPercent: Math.round(profitPercent * 100) / 100
  }
}

/**
 * تنسيق الأرقام بالعربية
 * @param {number} number - الرقم
 * @param {number} decimals - عدد الخانات العشرية
 * @returns {string} الرقم منسق
 */
export function formatNumber(number, decimals = 2) {
  return number.toLocaleString('ar-EG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * تنسيق السعر بالعملة
 * @param {number} price - السعر
 * @param {string} currency - العملة (EGP, USD)
 * @returns {string} السعر منسق
 */
export function formatPrice(price, currency = 'EGP') {
  const symbols = {
    EGP: 'ج.م',
    USD: '$',
    EUR: '€'
  }
  
  return `${formatNumber(price)} ${symbols[currency] || currency}`
}

/**
 * تنسيق التاريخ بالعربية
 * @param {Date|string} date - التاريخ
 * @param {boolean} includeTime - تضمين الوقت
 * @returns {string} التاريخ منسق
 */
export function formatDate(date, includeTime = false) {
  const d = typeof date === 'string' ? new Date(date) : date
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return d.toLocaleDateString('ar-EG', options)
}

/**
 * حساب النسبة المئوية للتغير
 * @param {number} oldValue - القيمة القديمة
 * @param {number} newValue - القيمة الجديدة
 * @returns {number} النسبة المئوية
 */
export function calculateChangePercent(oldValue, newValue) {
  if (oldValue === 0) return 0
  return ((newValue - oldValue) / oldValue) * 100
}

/**
 * توليد بيانات وهمية للاختبار (fallback)
 * @param {number} days - عدد الأيام
 * @param {number} basePrice - السعر الأساسي
 * @param {number} volatility - التقلب
 * @returns {Array} مصفوفة البيانات
 */
export function generateMockData(days, basePrice, volatility = 0.02) {
  const data = []
  let price = basePrice
  const now = new Date()
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(15, 0, 0, 0) // 3 PM each day
    
    const change = (Math.random() - 0.48) * volatility * price
    price += change
    
    data.push({
      date: date,
      price: Math.round(price * 100) / 100,
      date_gregorian: date.toISOString(),
      price_egp: Math.round(price * 100) / 100
    })
  }
  
  return data
}

/**
 * التحقق من صحة البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني
 * @returns {boolean} صحيح أو خاطئ
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * التحقق من صحة رقم الهاتف المصري
 * @param {string} phone - رقم الهاتف
 * @returns {boolean} صحيح أو خاطئ
 */
export function isValidEgyptianPhone(phone) {
  const re = /^(\+20|0)?1[0125]\d{8}$/
  return re.test(phone)
}

/**
 * تقصير النص
 * @param {string} text - النص
 * @param {number} maxLength - الطول الأقصى
 * @returns {string} النص المقصر
 */
export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * حساب المتوسط المتحرك
 * @param {Array} data - البيانات
 * @param {number} period - الفترة
 * @returns {Array} المتوسط المتحرك
 */
export function calculateMovingAverage(data, period) {
  const result = []
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null)
      continue
    }
    
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j]
    }
    
    result.push(sum / period)
  }
  
  return result
}

/**
 * حساب RSI (Relative Strength Index)
 * @param {Array} prices - الأسعار
 * @param {number} period - الفترة (14 افتراضياً)
 * @returns {number} قيمة RSI
 */
export function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return null
  
  let gains = 0
  let losses = 0
  
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1]
    if (change > 0) {
      gains += change
    } else {
      losses += Math.abs(change)
    }
  }
  
  const avgGain = gains / period
  const avgLoss = losses / period
  
  if (avgLoss === 0) return 100
  
  const rs = avgGain / avgLoss
  const rsi = 100 - (100 / (1 + rs))
  
  return Math.round(rsi * 100) / 100
}

/**
 * اكتشاف الاتجاه
 * @param {Array} prices - الأسعار
 * @returns {string} 'bullish', 'bearish', 'neutral'
 */
export function detectTrend(prices) {
  if (prices.length < 10) return 'neutral'
  
  const ma10 = calculateMovingAverage(prices, 10)
  const ma20 = calculateMovingAverage(prices, 20)
  
  const latestMA10 = ma10[ma10.length - 1]
  const latestMA20 = ma20[ma20.length - 1]
  
  if (!latestMA10 || !latestMA20) return 'neutral'
  
  if (latestMA10 > latestMA20 * 1.01) return 'bullish'
  if (latestMA10 < latestMA20 * 0.99) return 'bearish'
  
  return 'neutral'
}

/**
 * تحويل العيار إلى نقاء
 * @param {string|number} karat - العيار (24, 22, 21, 18)
 * @returns {number} النقاء (0-1)
 */
export function karatToPurity(karat) {
  const purityMap = {
    24: 0.9999,
    22: 0.9167,
    21: 0.875,
    18: 0.75
  }
  
  return purityMap[karat] || 1
}

/**
 * تأخير التنفيذ (للـ debouncing)
 * @param {Function} func - الدالة
 * @param {number} wait - وقت الانتظار بالميلي ثانية
 * @returns {Function} الدالة المُؤجلة
 */
export function debounce(func, wait) {
  let timeout
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * نسخ النص إلى الحافظة
 * @param {string} text - النص
 * @returns {Promise<boolean>} نجح أو فشل
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

// تصدير جميع الدوال
export default {
  gregorianToHijri,
  calculateBreakeven,
  calculateProfit,
  formatNumber,
  formatPrice,
  formatDate,
  calculateChangePercent,
  generateMockData,
  isValidEmail,
  isValidEgyptianPhone,
  truncateText,
  calculateMovingAverage,
  calculateRSI,
  detectTrend,
  karatToPurity,
  debounce,
  copyToClipboard
}
