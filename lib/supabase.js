// lib/supabase.js
// ملف الاتصال بقاعدة بيانات Supabase

import { createClient } from '@supabase/supabase-js'

// جلب المتغيرات البيئية
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// التحقق من وجود المتغيرات
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file')
}

// إنشاء العميل
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// دوال مساعدة لجلب البيانات

/**
 * جلب أسعار معدن معين لفترة زمنية محددة
 * @param {string} metal - 'gold' أو 'silver'
 * @param {number} days - عدد الأيام
 * @param {string} source - 'local' أو 'global'
 * @returns {Promise<Array>} مصفوفة الأسعار
 */
export async function fetchPrices(metal, days = 7, source = 'local') {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('prices')
    .select('*')
    .eq('metal', metal)
    .eq('source', source)
    .gte('date_gregorian', startDate.toISOString())
    .order('date_gregorian', { ascending: true })

  if (error) {
    console.error('Error fetching prices:', error)
    return null
  }

  return data
}

/**
 * جلب آخر سعر لمعدن معين
 * @param {string} metal - 'gold' أو 'silver'
 * @param {string} source - 'local' أو 'global'
 * @returns {Promise<Object>} آخر سعر
 */
export async function fetchLatestPrice(metal, source = 'local') {
  const { data, error } = await supabase
    .from('prices')
    .select('*')
    .eq('metal', metal)
    .eq('source', source)
    .order('date_gregorian', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching latest price:', error)
    return null
  }

  return data
}

/**
 * جلب معاملات المستخدم
 * @param {string} userId - معرف المستخدم
 * @param {string} metal - (اختياري) تصفية حسب المعدن
 * @returns {Promise<Array>} مصفوفة المعاملات
 */
export async function fetchUserTransactions(userId, metal = null) {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })

  if (metal) {
    query = query.eq('metal', metal)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching transactions:', error)
    return null
  }

  return data
}

/**
 * إضافة معاملة جديدة
 * @param {Object} transaction - بيانات المعاملة
 * @returns {Promise<Object>} المعاملة المُضافة
 */
export async function addTransaction(transaction) {
  // حساب سعر التعادل
  const breakeven = transaction.price_per_gram * (1 + transaction.fee_percentage / 100)
  
  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      ...transaction,
      breakeven_price: breakeven,
      total_cost: transaction.weight * breakeven
    }])
    .select()
    .single()

  if (error) {
    console.error('Error adding transaction:', error)
    return null
  }

  return data
}

/**
 * حساب محفظة المستخدم
 * @param {string} userId - معرف المستخدم
 * @returns {Promise<Object>} ملخص المحفظة
 */
export async function calculatePortfolio(userId) {
  const { data, error } = await supabase
    .rpc('calculate_portfolio_value', { user_uuid: userId })

  if (error) {
    console.error('Error calculating portfolio:', error)
    return null
  }

  return data
}

/**
 * جلب الأنماط الموسمية المكتشفة
 * @returns {Promise<Array>} مصفوفة الأنماط
 */
export async function fetchSeasonalPatterns() {
  const { data, error } = await supabase
    .from('seasonal_patterns')
    .select('*')
    .order('confidence_score', { ascending: false })

  if (error) {
    console.error('Error fetching seasonal patterns:', error)
    return null
  }

  return data
}

/**
 * جلب الرؤى الذكية النشطة
 * @returns {Promise<Array>} مصفوفة الرؤى
 */
export async function fetchActiveInsights() {
  const { data, error } = await supabase
    .from('ai_insights')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching insights:', error)
    return null
  }

  return data
}

/**
 * جلب سجل فقدان البيانات
 * @param {number} limit - عدد السجلات
 * @returns {Promise<Array>} سجل الأخطاء
 */
export async function fetchDataFetchLog(limit = 10) {
  const { data, error } = await supabase
    .from('data_fetch_log')
    .select('*')
    .order('fetch_time', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching data log:', error)
    return null
  }

  return data
}

// تصدير الدوال
export default {
  supabase,
  fetchPrices,
  fetchLatestPrice,
  fetchUserTransactions,
  addTransaction,
  calculatePortfolio,
  fetchSeasonalPatterns,
  fetchActiveInsights,
  fetchDataFetchLog
}
