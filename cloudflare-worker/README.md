# 🌐 Hướng Dẫn Triển Khai Cloudflare Worker Proxy VR 360° Đắk Song

Worker này giải quyết triệt để 2 vấn đề trên máy chủ gốc Đắk Song:
1. **Vá lỗi thiếu file `leaflet.js` (404)**: Tự động trả về thư viện Leaflet chuẩn quốc tế từ CDN `unpkg.com` để không bao giờ bị lỗi `ReferenceError: L is not defined`.
2. **Mở toàn bộ quyền CORS**: Thêm header `Access-Control-Allow-Origin: *` cho tất cả ảnh, âm thanh và dữ liệu sa bàn.

---

## Cách 1: Triển khai nhanh trực tiếp trên giao diện Web (Không cần cài đặt, mất ~1 phút)

1. Đăng nhập vào trang quản trị Cloudflare: [https://dash.cloudflare.com/](https://dash.cloudflare.com/) (Tạo tài khoản miễn phí nếu chưa có).
2. Vào menu bên trái chọn **Compute (Workers & Pages)** &rarr; bấm **Create Application** &rarr; chọn tab **Workers** &rarr; bấm **Create Worker**.
3. Đặt tên Worker (ví dụ: `daksong-vr360-proxy`) &rarr; bấm **Deploy**.
4. Sau khi Deploy xong, bấm nút **Edit code**:
   - Xóa toàn bộ mã mặc định trong khung soạn thảo.
   - Mở file `cloudflare-worker/worker.js` trong thư mục này, sao chép toàn bộ nội dung và dán vào.
   - Bấm nút **Deploy** (ở góc trên bên phải).
5. Sao chép đường link Worker vừa tạo (dạng: `https://daksong-vr360-proxy.<tên-bạn>.workers.dev`).
6. Dán link này vào file `.env` của dự án Zalo Mini App:
   ```env
   VITE_VR360_PROXY_URL=https://daksong-vr360-proxy.<tên-bạn>.workers.dev/
   ```

---

## Cách 2: Triển khai bằng dòng lệnh CLI (Dành cho Developer)

Trong thư mục `cloudflare-worker`:
```bash
# 1. Cài đặt wrangler nếu chưa có
npm install -g wrangler

# 2. Đăng nhập Cloudflare
npx wrangler login

# 3. Triển khai
npx wrangler deploy
```

Sau khi deploy thành công, sao chép URL trả về và dán vào `.env` là hoàn tất!

