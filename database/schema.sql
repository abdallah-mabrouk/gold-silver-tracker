-- متتبع أسعار الذهب والفضة - Supabase Schema
-- قم بتشغيل هذا في SQL Editor في Supabase

-- جدول الأسعار
CREATE TABLE prices (
    id BIGSERIAL PRIMARY KEY,
    metal VARCHAR(10) NOT NULL, -- 'gold' or 'silver'
    price_egp DECIMAL(10,2) NOT NULL, -- السعر بالجنيه المصري
    price_usd DECIMAL(10,2), -- السعر العالمي بالدولار
    source VARCHAR(50) NOT NULL, -- 'local' or 'global'
    date_gregorian TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_hijri VARCHAR(20), -- التاريخ الهجري
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهرس للبحث السريع
CREATE INDEX idx_prices_metal_date ON prices(metal, date_gregorian DESC);
CREATE INDEX idx_prices_source ON prices(source);

-- جدول المعاملات (المشتريات والمبيعات)
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    type VARCHAR(10) NOT NULL, -- 'buy' or 'sell'
    metal VARCHAR(10) NOT NULL, -- 'gold' or 'silver'
    karat VARCHAR(5), -- العيار: '24', '22', '21', '18' (للذهب فقط)
    weight DECIMAL(10,3) NOT NULL, -- الوزن بالجرام
    price_per_gram DECIMAL(10,2) NOT NULL, -- سعر الجرام
    fee_percentage DECIMAL(5,2) DEFAULT 7.0, -- نسبة المصنعية
    total_cost DECIMAL(12,2) NOT NULL, -- الإجمالي شامل المصنعية
    breakeven_price DECIMAL(10,2), -- سعر التعادل (السعر الأدنى للبيع)
    notes TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(user_id, transaction_date DESC);

-- جدول التنبيهات
CREATE TABLE alerts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    alert_type VARCHAR(30) NOT NULL, -- 'price_target', 'price_change', 'trend', 'seasonal'
    metal VARCHAR(10) NOT NULL,
    target_value DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    notification_method VARCHAR(20) DEFAULT 'both', -- 'telegram', 'push', 'both'
    last_triggered TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alerts_user_active ON alerts(user_id, is_active);

-- جدول تاريخ التنبيهات
CREATE TABLE alert_history (
    id BIGSERIAL PRIMARY KEY,
    alert_id BIGINT REFERENCES alerts(id),
    user_id UUID REFERENCES auth.users(id),
    message TEXT NOT NULL,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الأنماط الموسمية المكتشفة
CREATE TABLE seasonal_patterns (
    id BIGSERIAL PRIMARY KEY,
    metal VARCHAR(10) NOT NULL,
    pattern_name VARCHAR(100) NOT NULL,
    calendar_type VARCHAR(10) NOT NULL, -- 'gregorian' or 'hijri'
    month_start INT, -- 1-12
    month_end INT,
    avg_change_percent DECIMAL(5,2),
    confidence_score DECIMAL(5,2), -- 0-100
    occurrences INT, -- عدد مرات التكرار
    description TEXT,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول تتبع فقدان البيانات
CREATE TABLE data_fetch_log (
    id BIGSERIAL PRIMARY KEY,
    fetch_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'retrying'
    source VARCHAR(50) NOT NULL, -- 'goldapi', 'sarrafak', etc
    error_message TEXT,
    retry_count INT DEFAULT 0,
    next_retry_time TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- جدول التحليلات والرؤى
CREATE TABLE ai_insights (
    id BIGSERIAL PRIMARY KEY,
    insight_type VARCHAR(50) NOT NULL, -- 'recommendation', 'trend', 'correlation', 'news'
    metal VARCHAR(10),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    confidence_score DECIMAL(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- جدول إعدادات المستخدم
CREATE TABLE user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    default_fee_percentage DECIMAL(5,2) DEFAULT 7.0,
    preferred_currency VARCHAR(3) DEFAULT 'EGP',
    auto_update_enabled BOOLEAN DEFAULT TRUE,
    telegram_bot_token VARCHAR(200),
    telegram_chat_id VARCHAR(50),
    push_notifications_enabled BOOLEAN DEFAULT TRUE,
    show_hijri_dates BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- دالة لحساب نقطة التعادل
CREATE OR REPLACE FUNCTION calculate_breakeven(user_uuid UUID, metal_type VARCHAR)
RETURNS DECIMAL AS $$
DECLARE
    total_weight DECIMAL;
    total_cost DECIMAL;
    avg_fee DECIMAL;
    breakeven DECIMAL;
BEGIN
    SELECT 
        SUM(weight),
        SUM(total_cost),
        AVG(fee_percentage)
    INTO total_weight, total_cost, avg_fee
    FROM transactions
    WHERE user_id = user_uuid 
        AND metal = metal_type 
        AND type = 'buy';
    
    IF total_weight > 0 THEN
        breakeven := total_cost / total_weight;
    ELSE
        breakeven := 0;
    END IF;
    
    RETURN breakeven;
END;
$$ LANGUAGE plpgsql;

-- دالة لحساب الربح/الخسارة الحالية
CREATE OR REPLACE FUNCTION calculate_portfolio_value(user_uuid UUID)
RETURNS TABLE (
    metal VARCHAR,
    total_weight DECIMAL,
    total_investment DECIMAL,
    current_value DECIMAL,
    profit_loss DECIMAL,
    profit_loss_percent DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH user_holdings AS (
        SELECT 
            t.metal,
            SUM(CASE WHEN t.type = 'buy' THEN t.weight ELSE -t.weight END) as net_weight,
            SUM(CASE WHEN t.type = 'buy' THEN t.total_cost ELSE -t.total_cost END) as investment
        FROM transactions t
        WHERE t.user_id = user_uuid
        GROUP BY t.metal
    ),
    current_prices AS (
        SELECT DISTINCT ON (metal)
            metal,
            price_egp
        FROM prices
        WHERE source = 'local'
        ORDER BY metal, date_gregorian DESC
    )
    SELECT 
        h.metal,
        h.net_weight,
        h.investment,
        h.net_weight * p.price_egp as current_val,
        (h.net_weight * p.price_egp) - h.investment as pl,
        CASE 
            WHEN h.investment > 0 THEN ((h.net_weight * p.price_egp - h.investment) / h.investment * 100)
            ELSE 0
        END as pl_percent
    FROM user_holdings h
    JOIN current_prices p ON h.metal = p.metal
    WHERE h.net_weight > 0;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) - للأمان
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- نفس السياسات للتنبيهات والإعدادات
CREATE POLICY "Users can manage own alerts" ON alerts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

-- الأسعار والرؤى متاحة للقراءة للجميع
CREATE POLICY "Anyone can view prices" ON prices
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view insights" ON ai_insights
    FOR SELECT USING (is_active = true);

-- دالة لاكتشاف الأنماط الموسمية تلقائياً
CREATE OR REPLACE FUNCTION detect_seasonal_patterns()
RETURNS TABLE (
    metal VARCHAR,
    calendar_type VARCHAR,
    month INT,
    avg_change DECIMAL,
    occurrence_count INT,
    confidence DECIMAL
) AS $$
BEGIN
    -- سيتم تنفيذ الكشف التلقائي عندما تتوفر بيانات كافية (سنة على الأقل)
    -- التحليل يشمل التقويم الميلادي والهجري
    RETURN QUERY
    WITH monthly_changes AS (
        SELECT 
            p.metal,
            EXTRACT(MONTH FROM p.date_gregorian) as month_num,
            AVG((p.price_egp - LAG(p.price_egp) OVER (PARTITION BY p.metal ORDER BY p.date_gregorian)) / 
                LAG(p.price_egp) OVER (PARTITION BY p.metal ORDER BY p.date_gregorian) * 100) as price_change
        FROM prices p
        WHERE p.source = 'local'
        GROUP BY p.metal, EXTRACT(MONTH FROM p.date_gregorian)
        HAVING COUNT(*) >= 10  -- على الأقل 10 نقاط بيانات في الشهر
    )
    SELECT 
        mc.metal::VARCHAR,
        'gregorian'::VARCHAR,
        mc.month_num::INT,
        ROUND(mc.price_change::numeric, 2)::DECIMAL,
        COUNT(*)::INT,
        CASE 
            WHEN COUNT(*) >= 9 THEN 90::DECIMAL
            WHEN COUNT(*) >= 7 THEN 75::DECIMAL
            WHEN COUNT(*) >= 5 THEN 60::DECIMAL
            ELSE 40::DECIMAL
        END as confidence
    FROM monthly_changes mc
    WHERE ABS(mc.price_change) > 1.5  -- تغير ملحوظ فقط
    GROUP BY mc.metal, mc.month_num, mc.price_change
    ORDER BY confidence DESC, ABS(mc.price_change) DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE prices IS 'سجل الأسعار التاريخية للذهب والفضة';
COMMENT ON TABLE transactions IS 'معاملات المستخدمين (شراء/بيع)';
COMMENT ON TABLE alerts IS 'تنبيهات المستخدمين';
COMMENT ON TABLE seasonal_patterns IS 'الأنماط الموسمية المكتشفة';
COMMENT ON TABLE ai_insights IS 'الرؤى والتحليلات الذكية';
