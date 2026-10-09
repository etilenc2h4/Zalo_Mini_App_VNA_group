# KIẾN TRÚC HỆ THỐNG ZALO MINI APP ĐẮK SONG

Tài liệu thiết kế kiến trúc kỹ thuật phân tầng cho Zalo Mini App Cổng Văn Hóa & Du Lịch Đắk Song.

---

## 1. NGUYÊN TẮC THIẾT KẾ CỐT LÕI

1. **Chuẩn Zalo Mini App Webview**:
   - Khởi tạo ứng dụng mount vào thẻ `<div id="app"></div>` (chuẩn webview của Zalo).
   - Tích hợp `ErrorBoundary` ở tầng root nhằm ngăn chặn hoàn toàn lỗi sập ứng dụng hoặc trắng màn hình.
   - Xử lý vùng an toàn viền màn hình (`env(safe-area-inset-bottom)`) cho các dòng điện thoại có tai thỏ hoặc thanh phím điều hướng ảo.
2. **Kế thừa 100% Backend CMS Đắk Song**:
   - Sử dụng chung toàn bộ nguồn API sản xuất từ `core-360.vnaapi.com` và `core-tenant.vnaapi.com`.
   - CMS huyện đăng bài viết hoặc thêm điểm du lịch mới sẽ tự động cập nhật ngay lập tức trên Mini App.
3. **Phân tầng rõ ràng (Layered Architecture)**:
   - Presentation Layer -> Services/Adapters -> External APIs.
   - Toàn bộ lời gọi mạng đều được chuẩn hóa qua `Service Layer` và định kiểu tĩnh bằng TypeScript.

---

## 2. SƠ ĐỒ PHÂN TẦNG KIẾN TRÚC

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   ZALO MINI APP MOBILE CLIENT                          │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    UI PRESENTATION LAYER                         │  │
│  │  • Slim Header Glassmorphism (Logo UBND Huyện, Đổi ngôn ngữ, Lưu)│  │
│  │  • Trang chủ (Banner 360, GPS Gần tôi, Tin tức huyện mới nhất)   │  │
│  │  • Khám phá (Ưu tiên bài viết văn hóa, Danh mục ẩm thực & lưu trú)│ │
│  │  • Bản đồ số Leaflet + ArcGIS Esri (Ghim điểm GPS, Lọc danh mục) │  │
│  │  • Tab Cá nhân (Menu dạng hàng phẳng: Lịch trình, Yêu thích, SOS)│  │
│  │  • Sa bàn thực tế ảo VR 360° (65+ điểm số hóa 3D toàn huyện)     │  │
│  │  • Bottom Navigation chuẩn 4 Tab cốt lõi                         │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
│                                    │                                   │
│  ┌─────────────────────────────────▼────────────────────────────────┐  │
│  │                     ADAPTERS & UTILITIES                         │  │
│  │  • Zalo SDK Adapter:                                             │  │
│  │    - openOutApp / openWebview (Mở Google Maps chỉ đường ngoài)   │  │
│  │    - getUserLocation (GPS tọa độ thực tế của người dùng)         │  │
│  │    - scanQRCode (Quét mã QR tại điểm di tích thực địa)           │  │
│  │    - openShareSheet / openPhone (Chia sẻ Zalo, Gọi hotline)      │  │
│  │  • Geo Utility (Công thức Haversine đo Km, Sắp xếp khoảng cách)  │  │
│  │  • Category Meta (Chuẩn hóa Icon & Màu sắc từng loại hình)       │  │
│  │  • Local Storage Manager (Lưu điểm offline, đồng bộ yêu thích)   │  │
│  │  • ErrorBoundary (Bắt lỗi runtime, tránh trắng màn hình)         │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
│                                    │                                   │
│  ┌─────────────────────────────────▼────────────────────────────────┐  │
│  │                     API SERVICE LAYER                            │  │
│  │  • travel.service (Danh mục du lịch & 15 điểm đến thật kèm GPS)  │  │
│  │  • post.service (42 bài viết tin tức & văn hóa huyện Đắk Song)   │  │
│  │  • banner.service (Banner Flycam toàn cảnh xoay 360 độ)          │  │
│  │  • category.service (Cây danh mục khám phá văn hóa)              │  │
│  │  • portalApi (Cấu hình logo, chân trang UBND Huyện Đắk Song)     │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │ HTTPS
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL PRODUCTION SERVICES                    │
│  • core-360.vnaapi.com (Backend Cổng Du Lịch Đắk Song)                 │
│  • core-tenant.vnaapi.com (Cơ quan chủ quản UBND Huyện)                │
│  • static.dggv.edu.vn (CDN Đa phương tiện)                             │
│  • server.arcgisonline.com (ArcGIS Esri World Street Map Tiles)        │
│  • maps.google.com (Google Maps Universal Link Chỉ đường)              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. CƠ CHẾ ĐÓNG GÓI VÀ NẠP TÀI NGUYÊN ZMP

- **Thư mục Build**: Đóng gói ra thư mục `www/` (thay vì `dist/` thông thường).
- **Cấu hình ZMP**: File [`app-config.json`](./app-config.json) chứa danh mục tài nguyên bắt buộc:
  - `listCSS`: Tệp stylesheet nén của dự án.
  - `listSyncJS`: Tệp `inline.js` và bundle JavaScript khởi tạo.
  - `listAsyncJS`: Các chunk tải động khi người dùng chuyển trang.
- **Tự động hóa**: Script `build` tự động chạy lệnh `zmp sync-config www/index.html` để cập nhật bảng tài nguyên này, đảm bảo `zmp deploy` luôn thành công và không bao giờ gặp lỗi `No asset defined`.
