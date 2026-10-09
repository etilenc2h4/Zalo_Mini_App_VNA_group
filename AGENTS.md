# 🤖 HƯỚNG DẪN & QUY TẮC PHÁT TRIỂN HỆ THỐNG (AGENTS.MD)

Tài liệu này định nghĩa ngữ cảnh, tiêu chuẩn lập trình và các quy tắc bắt buộc dành cho **AI Coding Assistants (Antigravity, Cursor, Claude, Copilot...)** cũng như **Đội ngũ lập trình viên** khi tham gia bảo trì và phát triển dự án **Zalo Mini App - Cổng Văn Hóa Du Lịch Đắk Song**.

---

## 🇻🇳 1. QUY TẮC NGÔN NGỮ & GIAO TIẾP
- **Ngôn ngữ bắt buộc**: Toàn bộ trao đổi, giải thích, báo cáo và commit log phải sử dụng **Tiếng Việt**.
- Giữ phong cách trả lời ngắn gọn, chuyên nghiệp, cấu trúc rõ ràng và luôn kiểm tra mã trước khi xác nhận hoàn thành.

---

## 🗄️ 2. QUY TẮC QUẢN LÝ CƠ SỞ DỮ LIỆU (SUPABASE MIGRATIONS)
Bất kỳ khi nào có sự thay đổi cấu trúc bảng, thêm cột, tạo index hoặc sửa đổi RLS (Row Level Security):
1. **Bắt buộc tạo file migration tăng dần**:
   - Vị trí: `supabase/migrations/`
   - Đặt tên theo số thứ tự: `001_initial_schema.sql`, `002_<ten_tinh_nang>.sql`, `003_...`
   - Chỉ chứa câu lệnh DDL thay đổi tăng dần (`ALTER TABLE`, `CREATE TABLE IF NOT EXISTS`, v.v.).
2. **Luôn cập nhật đồng thời file Schema gốc**:
   - Vị trí: `supabase/schema.sql` (Master Schema).
   - Mọi thay đổi từ file migration mới phải được phản ánh ngay vào `schema.sql` để người mới chỉ cần chạy duy nhất 1 script là có toàn bộ cấu trúc CSDL mới nhất.
3. **Quy tắc an toàn**: Luôn dùng cú pháp an toàn (`IF NOT EXISTS`, `OR REPLACE`) để tránh lỗi khi script chạy nhiều lần.

---

## 🧩 3. KIẾN TRÚC MÔ-ĐUN HÓA & QUY TẮC FILE (FILE MODULARITY)
Nhằm tránh tình trạng file phình to khó bảo trì (God Components):
- **Giới hạn độ dài file**: Tuyệt đối không để các file View/Page vượt quá **350 - 400 dòng**.
- **Quy tắc tách thành phần**:
  - **Sub-components**: Đặt trong thư mục con tương ứng tại `src/components/<feature>/` (ví dụ: `src/components/saved/`, `src/components/map/`, `src/components/home/`).
  - **Custom Hooks**: Tách toàn bộ logic nạp API hoặc tính toán phức tạp vào `src/hooks/` (ví dụ: `usePortalData.ts`).
  - **Utils / Helpers**: Tách các hàm xử lý chuỗi, đo khoảng cách, so khớp danh mục vào `src/utils/` (ví dụ: `categoryMatcher.ts`, `geo.ts`).
- **Bảo toàn nguyên tắc Single Responsibility**: Mỗi file chỉ chịu trách nhiệm duy nhất cho một phần giao diện hoặc nghiệp vụ cụ thể.

---

## 🌐 4. QUY TẮC DỊCH THUẬT & ĐA NGÔN NGỮ (TRANSLATION SYSTEM)
- **Từ điển giao diện tĩnh (Static Dictionary)**:
  - Vị trí: `src/constants/dictionary.ts`.
  - Phản hồi tức thì 0ms cho các từ khóa điều hướng, nút bấm, nhãn danh mục.
- **Dịch tập dữ liệu lớn từ API (Dataset Translation)**:
  - Vị trí: `src/services/datasetTranslate.service.ts`.
  - Đảm nhiệm dịch danh sách bài viết (`LivePortalPost`), điểm đến (`TravelLocation`, `Destination`), đặc sản, lưu trú bằng Google Translate API + LocalStorage Cache.
- **Tính tương thích ngược**: File `src/services/translate.service.ts` là facade trung tâm re-export toàn bộ hàm dịch để các component cũ không bao giờ bị gãy liên kết.

---

## ☁️ 5. QUY TẮC MÔ-ĐUN SUPABASE SERVICE
Hệ thống kết nối Supabase được thiết kế theo dạng Multi-module tại thư mục `src/services/supabase/`:
```text
src/services/supabase/
├── client.ts             # Quản lý Singleton Supabase Client & check isSupabaseConfigured()
├── types.ts              # Interface cho các thực thể DB (UserProfile, UserFavorite, UserItinerary...)
├── profile.service.ts    # Nghiệp vụ tài khoản & hồ sơ cá nhân
├── favorite.service.ts   # Nghiệp vụ lưu/bỏ lưu địa điểm yêu thích
├── itinerary.service.ts  # Nghiệp vụ lập và lưu lịch trình du lịch
└── index.ts              # Entry point tập hợp và export toàn bộ các service con
```
- Khi phát triển tính năng backend mới (ví dụ: đánh giá review, tải ảnh check-in, gửi SOS), hãy tạo file service riêng trong thư mục này và export tại `index.ts`.
- File `src/services/supabase.service.ts` ở ngoài đóng vai trò Facade: `export * from './supabase';`.

---

## 🛠️ 6. KIỂM THỬ & XÁC NHẬN BIÊN DỊCH (BUILD VERIFICATION)
- **Lệnh kiểm tra bắt buộc**: Mỗi khi hoàn tất một nhóm thay đổi code hoặc tái cấu trúc, phải chạy lệnh:
  ```bash
  npm run build
  ```
- **Tiêu chí hoàn thành**:
  - Lệnh thoát với mã **0** (Code 0).
  - Không có lỗi TypeScript (`tsc`).
  - Bundle Vite thành công và ZMP CLI đồng bộ cấu hình `index.html` trơn tru.

---

## 📌 7. THÔNG TIN HỆ THỐNG CỐT LÕI
- **Zalo Mini App ID**: `3383174999178410045`
- **Tông màu nhận diện thương hiệu**: Cam Vàng Cao Nguyên (`#ff9600`) - Chuẩn UBND Huyện Đắk Song.
- **Backend API Core**: `https://core-360.vnaapi.com` (Tenant: `DAKNONG`, Department: `DAKNONG-2-29`).
- **Nền tảng Sa bàn 3D**: `https://daksong-daknong.vnasw.vn/` (Kèm Cloudflare Worker Proxy giải quyết CORS & Leaflet).

---

## 🎧 8. QUY TẮC QR AUDIO GUIDE & TRỢ LÝ AI STREAMING
1. **QR Audio Guide Service**:
   - Vị trí: `src/services/qrGuide.service.ts` & `src/components/qr/QRAudioGuideModal.tsx`.
   - Chuẩn Deep Link ngoài đời thực: `https://zalo.me/s/3383174999178410045/?qrId={id}&autoAudio=true`.
   - Hỗ trợ quét bằng Camera Zalo SDK (`scanQRCode`) lẫn chế độ Demo 1-Chạm cho các buổi báo cáo/thuyết trình.
2. **AI Streaming & Thinking Steps**:
   - Backend phát Server-Sent Events (SSE) theo thời gian thực mỗi khi Gemini gọi Tool.
   - Frontend hiển thị sống động các bước tư duy (Analyzing -> Tool Call -> Synthesis) kèm icon xoay & tick xanh, sau đó nhận toàn vẹn JSON đã ép kiểu mạnh (Strict Schema).


