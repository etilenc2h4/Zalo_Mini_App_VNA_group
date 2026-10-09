# HƯỚNG DẪN CÀI ĐẶT & TRIỂN KHAI ZALO MINI APP ĐẮK SONG

Tài liệu hướng dẫn phát triển (Development), đóng gói (Build) và triển khai (Deploy) dự án Zalo Mini App Cổng Văn Hóa & Du Lịch Đắk Song.

- **Mini App ID chính thức**: `3383174999178410045`
- **ID Ứng dụng Demo**: `1428377454526174402`
- **Thư mục xuất bản**: `www/`

---

## 1. YÊU CẦU MÔI TRƯỜNG

- **Node.js**: Phiên bản 18.x trở lên (đã kiểm thử và tương thích hoàn hảo với Node 20.x, 22.x, 24.x).
- **ZMP CLI**: Công cụ dòng lệnh chính thức của Zalo Mini App:
  ```bash
  npm install -g zmp-cli
  ```

---

## 2. CÀI ĐẶT DỰ ÁN

Tại thư mục gốc dự án:

```bash
npm install
```

---

## 3. PHÁT TRIỂN & KIỂM THỬ (DEVELOPMENT)

### Cách 1: Chạy máy chủ Dev trên trình duyệt máy tính (Khuyên dùng khi lập trình)
```bash
npm run dev
```
- Mở trình duyệt tại: `http://localhost:3000/`
- Nhấn **F12** (hoặc `Ctrl + Shift + I`) và bấm biểu tượng **Mobile Device Toolbar** (chọn iPhone hoặc Pixel).
- Mọi chỉnh sửa mã nguồn được áp dụng tức thì qua Hot Module Replacement (HMR).

### Cách 2: Khung giả lập Zalo Mobile
```bash
npm start
# hoặc
zmp start
```
- Tự động mở trình duyệt với khung mô phỏng Zalo Mini App kích thước chuẩn.

---

## 4. QUY TRÌNH ĐÓNG GÓI (BUILD)

```bash
npm run build
```

Lệnh trên đã được cấu hình tự động thực hiện 3 bước:
1. **Kiểm tra TypeScript**: `tsc` đảm bảo không có lỗi cú pháp hoặc kiểu dữ liệu.
2. **Biên dịch Vite**: `vite build` xuất file bundle tối ưu vào thư mục `www/` thông qua `zmp-vite-plugin`.
3. **Đồng bộ cấu hình ZMP**: `zmp sync-config www/index.html` tự động cập nhật danh sách `listSyncJS`, `listAsyncJS`, `listCSS` vào [`app-config.json`](./app-config.json).

---

## 5. TRIỂN KHAI LÊN ZALO MINI APP (DEPLOY)

Để xuất bản phiên bản thử nghiệm hoặc cập nhật lên Zalo:

```bash
zmp deploy
```

**Các câu hỏi khi Deploy:**
- `? This is not a ZMP Project, do you want to continue?`: Nhấn **Enter** *(chọn Deploy your existing project)*.
- `? Where is your dist folder?`: Nhập `www` *(hoặc nhấn Enter nếu đã gợi ý)*.
- `? What version status are you deploying?`: Chọn **Development** hoặc **Testing**.
- `? Description`: Nhập mô tả phiên bản (ví dụ: `v1.1 cap nhat ban do & menu`).

Sau khi upload thành công, terminal sẽ in ra **Mã QR Code**. Bạn chỉ cần dùng ứng dụng Zalo trên điện thoại quét mã này để trải nghiệm trực tiếp!

---

## 6. DANH SÁCH MÁY CHỦ API THỰC TẾ

Ứng dụng kết nối trực tiếp đến các endpoint:
- **Cổng dữ liệu Đắk Song**: `https://core-360.vnaapi.com` (`X-Department-Code: DAKNONG-2-29`)
- **UBND Huyện Đắk Song**: `https://core-tenant.vnaapi.com` (`projectCode: 360`)
- **CDN Đa phương tiện**: `https://static.dggv.edu.vn`
- **Nền bản đồ số**: `https://server.arcgisonline.com` (ArcGIS Esri)
