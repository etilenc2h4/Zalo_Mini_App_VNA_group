-- ==============================================================================
-- MIGRATION 002: NÂNG CẤP BẢNG FAVORITES LƯU TRỮ METADATA ĐỘC LẬP
-- Ngày tạo: 2026-10-08
-- Mô tả: Bổ sung các cột thông tin hiển thị (title, image, address, category_label, target_type, extra_data)
--        giúp CSDL Supabase quản lý danh sách yêu thích tự chủ, không phụ thuộc máy chủ bên thứ ba.
-- ==============================================================================

-- Bổ sung các cột metadata cho bảng favorites nếu chưa tồn tại
ALTER TABLE public.favorites 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS category_label TEXT,
ADD COLUMN IF NOT EXISTS target_type TEXT DEFAULT 'destination',
ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb;

-- Tạo index để hỗ trợ sắp xếp theo thời gian lưu mới nhất
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON public.favorites(created_at DESC);

