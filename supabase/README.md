# QUY TẮC QUẢN LÝ CSDL SUPABASE (MIGRATIONS)

## Cấu trúc thư mục:
```
supabase/
├── schema.sql                         # File schema gốc đầy đủ (Master Schema) cho cài đặt mới
└── migrations/                        # Các bản migration tăng dần theo thứ tự
    ├── 001_initial_schema.sql         # Khởi tạo bảng profiles, favorites, itineraries & RLS
    ├── 002_xxx.sql                    # (Dành cho các thay đổi sau này)
    └── ...
```

## Quy tắc bắt buộc khi nâng cấp CSDL:
1. **Tạo file migration mới theo thứ tự số tăng dần**: 
   - Đặt tên theo mẫu: `002_<ten_tinh_nang>.sql`, `003_<ten_tinh_nang>.sql`... trong thư mục `supabase/migrations/`.
   - File migration chỉ chứa các câu lệnh thay đổi tăng dần (`ALTER TABLE`, `CREATE TABLE`, `CREATE INDEX`...).
2. **Luôn cập nhật đồng thời file `schema.sql` gốc**:
   - Mọi thay đổi từ migration mới phải được phản ánh ngay vào `supabase/schema.sql`.
   - Mục đích: Người dùng hoặc môi trường mới chỉ cần chạy duy nhất 1 lần file `schema.sql` là có đầy đủ cấu trúc mới nhất.
3. **Quy tắc an toàn**:
   - Sử dụng `IF NOT EXISTS`, `OR REPLACE` trong các câu lệnh DDL để tránh xung đột khi chạy lại.

