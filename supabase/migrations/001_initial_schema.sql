-- ==============================================================================
-- MIGRATION 001: KHỞI TẠO CẤU TRÚC BẢNG BAN ĐẦU
-- Ngày tạo: 2026-10-08
-- Mô tả: Tạo các bảng profiles, favorites, itineraries và chính sách RLS
-- ==============================================================================

-- 1. BẢNG HỒ SƠ NGƯỜI DÙNG ZALO (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,                       -- Zalo User ID (lấy từ Zalo SDK)
    name TEXT NOT NULL,                        -- Tên hiển thị Zalo của người dùng
    avatar TEXT,                               -- Đường dẫn ảnh đại diện Zalo
    created_at TIMESTAMPTZ DEFAULT NOW(),      -- Thời điểm lần đầu vào Mini App
    last_login_at TIMESTAMPTZ DEFAULT NOW()    -- Thời điểm đăng nhập gần nhất
);

-- Bật Row Level Security (RLS) cho profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc công khai hoặc theo user
CREATE POLICY "Cho phép đọc profiles" 
ON public.profiles FOR SELECT 
USING (true);

-- Cho phép tạo / cập nhật profile
CREATE POLICY "Cho phép upsert profiles" 
ON public.profiles FOR ALL 
USING (true) 
WITH CHECK (true);


-- 2. BẢNG ĐỊA ĐIỂM YÊU THÍCH (FAVORITES)
CREATE TABLE IF NOT EXISTS public.favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    destination_id TEXT NOT NULL,              -- Mã địa điểm du lịch (ví dụ: 'diengio', 'doithong'...)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_destination UNIQUE (user_id, destination_id)
);

-- Index để tối ưu truy vấn theo user_id
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);

-- Bật RLS cho favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép đọc favorites" 
ON public.favorites FOR SELECT 
USING (true);

CREATE POLICY "Cho phép ghi favorites" 
ON public.favorites FOR ALL 
USING (true) 
WITH CHECK (true);


-- 3. BẢNG LỊCH TRÌNH DU LỊCH CÁ NHÂN (ITINERARIES)
CREATE TABLE IF NOT EXISTS public.itineraries (
    id TEXT PRIMARY KEY,                       -- ID lịch trình (UUID hoặc custom ID)
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,                       -- Tên chuyến đi (ví dụ: 'Chuyến đi săn mây 2 ngày 1 đêm')
    start_date TEXT,                           -- Ngày khởi hành (YYYY-MM-DD)
    days JSONB DEFAULT '[]'::jsonb,            -- Chi tiết các điểm đến từng ngày
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index tối ưu truy vấn theo user_id
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON public.itineraries(user_id);

-- Bật RLS cho itineraries
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép đọc itineraries" 
ON public.itineraries FOR SELECT 
USING (true);

CREATE POLICY "Cho phép ghi itineraries" 
ON public.itineraries FOR ALL 
USING (true) 
WITH CHECK (true);

