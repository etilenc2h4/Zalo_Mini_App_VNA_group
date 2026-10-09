-- ==============================================================================
-- MIGRATION 002: NÂNG CẤP CHÍNH SÁCH BẢO MẬT RLS CHO FAVORITES & ITINERARIES
-- Ngày tạo: 2026-10-08
-- Mô tả: Siết chặt chính sách RLS, bắt buộc phải có user_id hợp lệ, ngăn chặn ghi dữ liệu rác
-- ==============================================================================

-- 1. CẬP NHẬT CHÍNH SÁCH CHO BẢNG FAVORITES
DROP POLICY IF EXISTS "Cho phép đọc favorites" ON public.favorites;
DROP POLICY IF EXISTS "Cho phép ghi favorites" ON public.favorites;

CREATE POLICY "Cho phép đọc favorites theo user_id" 
ON public.favorites FOR SELECT 
USING (user_id IS NOT NULL);

CREATE POLICY "Cho phép thêm favorites khi có user_id" 
ON public.favorites FOR INSERT 
WITH CHECK (user_id IS NOT NULL AND length(user_id) > 0);

CREATE POLICY "Cho phép xóa favorites theo user_id" 
ON public.favorites FOR DELETE 
USING (user_id IS NOT NULL AND length(user_id) > 0);


-- 2. CẬP NHẬT CHÍNH SÁCH CHO BẢNG ITINERARIES
DROP POLICY IF EXISTS "Cho phép đọc itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Cho phép ghi itineraries" ON public.itineraries;

CREATE POLICY "Cho phép đọc itineraries theo user_id" 
ON public.itineraries FOR SELECT 
USING (user_id IS NOT NULL);

CREATE POLICY "Cho phép thêm và sửa itineraries khi có user_id" 
ON public.itineraries FOR ALL 
USING (user_id IS NOT NULL AND length(user_id) > 0)
WITH CHECK (user_id IS NOT NULL AND length(user_id) > 0);

