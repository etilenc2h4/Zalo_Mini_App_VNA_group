-- ==============================================================================
-- MIGRATION 004: THIẾT LẬP MÚI GIỜ VIỆT NAM (ASIA/HO_CHI_MINH - GMT+7) CHO CSDL
-- Đảm bảo toàn bộ mốc thời gian, cron job và query tuân thủ chuẩn giờ địa phương Đắk Song
-- ==============================================================================

-- 1. Thiết lập múi giờ mặc định cho database và user sang Asia/Ho_Chi_Minh (GMT+7)
DO $$
BEGIN
    EXECUTE 'ALTER DATABASE postgres SET timezone TO ''Asia/Ho_Chi_Minh''';
EXCEPTION
    WHEN OTHERS THEN
        -- Bỏ qua nếu môi trường không cho phép alter database trực tiếp
        RAISE NOTICE 'Không thể thay đổi timezone database cấp độ hệ thống, bỏ qua.';
END $$;

-- 2. Cập nhật Default Values của các cột thời gian sang múi giờ Asia/Ho_Chi_Minh

-- Bảng profiles
ALTER TABLE public.profiles 
    ALTER COLUMN created_at SET DEFAULT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh'),
    ALTER COLUMN last_login_at SET DEFAULT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh');

-- Bảng favorites
ALTER TABLE public.favorites 
    ALTER COLUMN created_at SET DEFAULT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh');

-- Bảng itineraries
ALTER TABLE public.itineraries 
    ALTER COLUMN created_at SET DEFAULT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh'),
    ALTER COLUMN updated_at SET DEFAULT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh');

-- 3. Tạo Trigger tự động cập nhật updated_at theo giờ Việt Nam khi sửa lịch trình
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

-- 4. Chú thích tài liệu cho cột start_date
COMMENT ON COLUMN public.itineraries.start_date IS 'Ngày khởi hành du lịch theo định dạng chuẩn YYYY-MM-DD (Giờ Việt Nam GMT+7)';
COMMENT ON COLUMN public.itineraries.reminder_enabled IS 'Cờ bật/tắt nhắc nhở trước ngày khởi hành (true: bật, false: tắt)';

