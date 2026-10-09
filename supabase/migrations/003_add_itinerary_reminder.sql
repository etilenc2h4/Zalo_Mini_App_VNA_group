-- ==============================================================================
-- Migration 003: Thêm cột nhắc nhở lịch trình chuyến đi (Trip Reminder)
-- Tương thích: Supabase PostgreSQL
-- ==============================================================================

-- Bổ sung cột reminder_enabled vào bảng itineraries
ALTER TABLE public.itineraries 
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT true;

-- Comment mô tả cột
COMMENT ON COLUMN public.itineraries.reminder_enabled IS 'Trạng thái bật/tắt nhận thông báo nhắc nhở khi gần đến ngày khởi hành chuyến đi';

