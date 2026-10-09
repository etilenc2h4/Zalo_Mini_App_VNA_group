# ZALO MINI APP - CỔNG VĂN HÓA DU LỊCH ĐẮK SONG

Dự án Frontend Zalo Mini App chính thức dành cho **Cổng Văn Hóa & Du Lịch Huyện Đắk Song (Đắk Nông)**, kết nối 100% dữ liệu thời gian thực từ hệ thống máy chủ Cổng Du Lịch [dulichdaksong.vnasw.vn](https://dulichdaksong.vnasw.vn/) và nền tảng số hóa 3D [daksong-daknong.vnasw.vn](https://daksong-daknong.vnasw.vn/).

- **Mini App ID chính thức**: `3383174999178410045`
- **ID Ứng dụng Du Lịch Đắk Song Demo**: `1428377454526174402`
- **Công nghệ nền tảng**: TypeScript, React 18, Tailwind CSS, Vite 6, ZMP SDK, Leaflet ArcGIS
- **Màu sắc nhận diện**: Cam Vàng Cao Nguyên (`#ff9600`) - Chuẩn nhận diện UBND Huyện Đắk Song

---

## 1. NGUYÊN TẮC CỐT LÕI

- **Chuẩn Mobile-First cho Zalo**: Giao diện thiết kế độc lập, thanh mảnh, tối ưu thao tác một tay trên smartphone.
- **Dữ liệu thật 100% từ Máy chủ Sản xuất**: Kết nối trực tiếp hệ thống API `core-360.vnaapi.com` và `core-tenant.vnaapi.com`. Mọi bài viết, địa điểm, banner và danh mục tạo mới trên CMS huyện đều tự động cập nhật ngay trên Mini App.
- **Trải nghiệm Mobile nâng cao**:
  - **GPS Gần tôi**: Tự động đo khoảng cách thực tế đến từng điểm đến, nhà hàng, lưu trú.
  - **Bản đồ số Native Leaflet**: Sử dụng nền bản đồ đường sá ArcGIS Esri chi tiết, sắc nét, hoàn toàn miễn phí không watermark.
  - **Chỉ đường một chạm**: Tích hợp ZMP Native API chuyển tiếp mượt mà sang ứng dụng Google Maps trên điện thoại.
  - **Thực tế ảo VR 360°**: Nhúng sa bàn toàn cảnh 65+ danh lam thắng cảnh số hóa 3D.
  - **Quét mã QR tại điểm đến**: Nhận diện tức thì biển bảng di tích thực địa.
  - **Menu Cá nhân hiện đại**: Thiết kế dạng hàng phẳng (List Rows) tinh gọn, sang trọng, hỗ trợ lưu điểm yêu thích và danh bạ cứu hộ SOS 24/7.

---

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
Zalo_Mini_App_VNA_group/
├── cloudflare-worker/     # Worker proxy cho sa bàn VR 360°
├── src/                   # 100% Mã nguồn TypeScript & React
│   ├── components/        # Header Slim, ErrorBoundary, BottomNav, Modals...
│   ├── data/              # Mock data lịch trình & điểm đến offline
│   ├── hooks/             # Custom hooks (draggable scroll, geolocation...)
│   ├── pages/             # Trang chủ, Khám phá, Bản đồ, Cá nhân, VR 360
│   ├── services/          # Real API client (travel, post, banner, zalo SDK...)
│   ├── types/             # Định nghĩa kiểu dữ liệu TypeScript
│   └── utils/             # Tiện ích đo khoảng cách Geo, phân loại danh mục
├── www/                   # Thư mục xuất bản chuẩn Zalo Mini App
├── app-config.json        # Cấu hình thanh điều hướng & tài nguyên ZMP
├── zmp-cli.json           # Định danh App ID cho công cụ zmp-cli
├── package.json           # Quản lý thư viện phụ thuộc & scripts
├── vite.config.ts         # Cấu hình Vite & zmp-vite-plugin
└── tsconfig.json          # Cấu hình TypeScript
```

---

## 3. CÁC TÀI LIỆU CHI TIẾT

- [`SETUP.md`](./SETUP.md): Hướng dẫn cài đặt, chạy máy chủ dev và quy trình build & deploy lên Zalo.
- [`ARCHITECTURE.md`](./ARCHITECTURE.md): Kiến trúc kỹ thuật phân tầng và giải pháp tích hợp ZMP SDK.
- [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md): Đặc tả chi tiết các endpoint API máy chủ Đắk Song.
- [`AGENTS.md`](./AGENTS.md): Tiêu chuẩn kỹ thuật, quy tắc CSDL migration và quy ước phát triển cho AI & Dev.

---

## 4. HƯỚNG DẪN LỆNH NHANH

```bash
# 1. Cài đặt thư viện
npm install

# 2. Khởi động môi trường Dev trên trình duyệt
npm run dev

# 3. Đóng gói & đồng bộ tài nguyên tự động
npm run build

# 4. Upload lên Zalo Mini App Platform (nhận mã QR test)
zmp deploy
```
