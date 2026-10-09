-- ==============================================================================
-- SCHEMA SUPABASE CHO ZALO MINI APP DU LỊCH ĐẮK SONG
-- Múi giờ chuẩn: Asia/Ho_Chi_Minh (GMT+7)
-- Chạy đoạn SQL này trong SQL Editor của Supabase Dashboard (https://supabase.com)
-- ==============================================================================

-- 1. BẢNG HỒ SƠ NGƯỜI DÙNG ZALO (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,                                                   -- Zalo User ID (lấy từ Zalo SDK)
    name TEXT NOT NULL,                                                    -- Tên hiển thị Zalo của người dùng
    avatar TEXT,                                                           -- Đường dẫn ảnh đại diện Zalo
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh'),-- Thời điểm lần đầu vào Mini App (GMT+7)
    last_login_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh') -- Thời điểm đăng nhập gần nhất (GMT+7)
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
    destination_id TEXT NOT NULL,                                          -- Mã định danh mục đã lưu
    title TEXT,                                                            -- Tên địa điểm / mục yêu thích
    image TEXT,                                                            -- URL hình ảnh đại diện
    address TEXT,                                                          -- Địa chỉ hoặc vị trí
    category_label TEXT,                                                   -- Danh mục (Thiên nhiên, Văn hóa, Ẩm thực...)
    target_type TEXT DEFAULT 'destination',                                -- Loại mục ('destination', 'travel_location', 'post', 'stay', 'specialty')
    extra_data JSONB DEFAULT '{}'::jsonb,                                  -- Thông tin mở rộng (lat, lng, vrNodeId, phone...)
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh'),
    CONSTRAINT unique_user_destination UNIQUE (user_id, destination_id)
);

-- Index để tối ưu truy vấn theo user_id và thời gian
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON public.favorites(created_at DESC);

-- Bật RLS cho favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép đọc favorites theo user_id" 
ON public.favorites FOR SELECT 
USING (user_id IS NOT NULL);

CREATE POLICY "Cho phép thêm favorites khi có user_id" 
ON public.favorites FOR INSERT 
WITH CHECK (user_id IS NOT NULL AND length(user_id) > 0);

CREATE POLICY "Cho phép xóa favorites theo user_id" 
ON public.favorites FOR DELETE 
USING (user_id IS NOT NULL AND length(user_id) > 0);


-- 3. BẢNG LỊCH TRÌNH DU LỊCH CÁ NHÂN (ITINERARIES)
CREATE TABLE IF NOT EXISTS public.itineraries (
    id TEXT PRIMARY KEY,                                                   -- ID lịch trình (UUID hoặc custom ID)
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,                                                   -- Tên chuyến đi (ví dụ: 'Chuyến đi săn mây 2 ngày 1 đêm')
    start_date TEXT,                                                       -- Ngày khởi hành theo định dạng YYYY-MM-DD (Giờ VN GMT+7)
    days JSONB DEFAULT '[]'::jsonb,                                        -- Chi tiết các điểm đến từng ngày
    reminder_enabled BOOLEAN DEFAULT true,                                 -- Nhắc nhở thông báo trước ngày khởi hành
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh'),
    updated_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')
);

-- Index tối ưu truy vấn theo user_id
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON public.itineraries(user_id);

-- Bật RLS cho itineraries
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép đọc itineraries theo user_id" 
ON public.itineraries FOR SELECT 
USING (user_id IS NOT NULL);

CREATE POLICY "Cho phép thêm và sửa itineraries khi có user_id" 
ON public.itineraries FOR ALL 
USING (user_id IS NOT NULL AND length(user_id) > 0)
WITH CHECK (user_id IS NOT NULL AND length(user_id) > 0);

-- Trigger tự động cập nhật updated_at theo giờ Việt Nam
CREATE OR REPLACE FUNCTION public.handle_itinerary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = (now() AT TIME ZONE 'Asia/Ho_Chi_Minh');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_itineraries_updated_at ON public.itineraries;
CREATE TRIGGER trigger_itineraries_updated_at
BEFORE UPDATE ON public.itineraries
FOR EACH ROW
EXECUTE FUNCTION public.handle_itinerary_updated_at();
