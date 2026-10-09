# BÁO CÁO PHÂN TÍCH HỆ THỐNG VÀ THIẾT KẾ ZALO MINI APP DU LỊCH ĐẮK SONG

> **Mục tiêu**: Kế thừa dữ liệu, nội dung, nghiệp vụ từ hệ thống Cổng Thông Tin & Thực tế ảo Đắk Song hiện có → Xây dựng kiến trúc frontend Zalo Mini App mobile-first chuẩn mực, bổ sung các tính năng thiết thực cho du khách (Gần tôi, Lên lịch trình, Chuyến đi của tôi, QR điểm đến, Audio Guide, Bản đồ tương tác, VR360).

---

## 1. PHÂN TÍCH HỆ THỐNG HIỆN TẠI

### 1.1 Các thành phần hệ thống đang vận hành:
1. **Website Cổng Văn Hóa Du Lịch Đắk Song**: `https://dulichdaksong.vnasw.vn/`
   - Cung cấp tin tức văn hóa, sự kiện, bài viết giới thiệu ẩm thực, thắng cảnh, các danh mục tiện ích địa phương.
   - Nhận diện thương hiệu: Màu Cam Vàng `#ff9600`, logo chính thức UBND Huyện Đắk Song (`group-5371.png`).
2. **Website Sa bàn Du lịch Thực tế ảo VR360**: `https://daksong-daknong.vnasw.vn/`
   - Chạy trên nền tảng Pano2VR 7.1.5 kết hợp ảnh Flycam độ phân giải cao và ảnh 360 mặt đất.
   - Chứa **65 cảnh điểm thực tế (nodes)** được số hóa hoàn chỉnh với tọa độ GPS thực (`latitude`, `longitude`), mô tả thuyết minh và hệ thống âm thanh audio hướng dẫn.
3. **Backend API Core**: `https://core-360.vnaapi.com`
   - Department Code: `DAKNONG-2-29`
   - Tenant Code: `DAKNONG`
   - Lưu trữ bài viết, ảnh CDN (`https://static.dggv.edu.vn/...`), danh mục văn hóa.
4. **Hệ thống theo dõi/quản lý dự án**: `https://quanlyduan.vr360.com.vn/`
   - Quản lý telemetry / heartbeat project code (`wPdXbptvwEFNEWVtAwTM`).

---

### 1.2 Danh mục dữ liệu thật đã xác thực:

#### A. 65 Cảnh quan VR360 & Tọa độ GPS thật (Trích xuất từ `pano.xml`):
| Cụm điểm đến | Số cảnh | Các node chính | Tọa độ GPS | Audio thuyết minh đi kèm |
|---|---|---|---|---|
| **Toàn cảnh Trung tâm Huyện Đắk Song** | 10 | node110, node41, node42, node43, node44, node45 | 12.2155, 107.6215 | `trung-tam-huyen-dak-song-VI.mp3` |
| **Thác Lưu Ly (KBT Nâm Nung)** | 9 | node54, node55, node67, node68, node69, node70, node71, node73, node74, node75 | 12.2235, 107.6804 | `thac-luu-ly-VI.mp3` |
| **Thiền Viện Trúc Lâm Đạo Nguyên** | 29 | node56, node57, node58, node59, node76 đến node100 | 12.2069, 107.7047 | `thien-vien-truc-lam-dao-nguyen-VI.mp3` |
| **Văn hóa Dân tộc M'Nông & Buôn làng** | 8 | node60, node61, node62, node101, node102, node103, node104, node105, node107 | 12.2079, 107.5825 | `van-hoa-dan-toc-mnong-VI.mp3` |
| **Cánh đồng Điện Gió Đắk Song** | 3 | node50, node51, node109 | 12.3384, 107.5684 | Nhạc không lời đại ngàn (`daksong k o loi.mp3`) |
| **Đoạn Thông Cảnh quan Quốc lộ 14** | 6 | node46, node48, node49, node65, node66, node108 | 12.2148, 107.6212 | Nhạc không lời đại ngàn |

#### B. Dữ liệu Bài viết / Blog Văn hóa từ Live API:
- Endpoint: `POST https://core-360.vnaapi.com/post-public/find`
- Endpoint chi tiết: `GET https://core-360.vnaapi.com/post-public/{slug}`
- Các bài viết live:
  1. *Bế mạc Ngày hội Văn hóa các dân tộc huyện Đắk Song* (Sự kiện - Lễ hội)
  2. *Đắk Nông: Giữ gìn bản sắc văn hóa thông qua Ngày hội Văn hóa các dân tộc* (Sự kiện - Lễ hội)
  3. *Lá bép - đặc sản rau rừng Tây nguyên* (Ẩm thực)
  4. *Thiền Viện Trúc Lâm Đạo Nguyên* (Danh lam - Thắng cảnh)
  5. *Nhà Rông - sức sống của Tây Nguyên* (Sự kiện - Lễ hội)
  6. *Du lịch huyện Đắk Song - xứ sở tuyệt vời ẩn mình giữa chốn cao nguyên đại ngàn* (Sự kiện - Lễ hội)
  7. *Khu bảo tồn thiên nhiên Nâm Nung: điểm cắm trại lý tưởng* (Danh lam - Thắng cảnh)
  8. *Nét văn hoá truyền thống của dân tộc M’Nông* (Sự kiện - Lễ hội)
  9. *Lễ bỏ mả - tín ngưỡng độc đáo ở Tây Nguyên* (Sự kiện - Lễ hội)
  10. *Lễ mừng lúa mới của người M’nông* (Sự kiện - Lễ hội)

---

## 2. KIẾN TRÚC THÔNG TIN (INFORMATION ARCHITECTURE) MINI APP

Khắc phục hạn chế của website desktop (giao diện web truyền thống, nhiều chữ, khó tra cứu khi đang di chuyển trên đường):
Thiết kế theo chuẩn **Mobile-First**, phân bổ thành **5 Tab cốt lõi** trên thanh điều hướng dưới:

```
                  ┌────────────────────────────────────────────────┐
                  │           ZALO MINI APP ĐẮK SONG               │
                  └────────────────────────────────────────────────┘
                                           │
         ┌───────────────┬─────────────────┼────────────────┬───────────────┐
         ▼               ▼                 ▼                ▼               ▼
    [1. TRANG CHỦ]   [2. DU LỊCH 3D]    [3. BẢN ĐỒ]    [4. LỊCH TRÌNH]   [5. CỦA TÔI]
    - Hero 360       - Nhúng VR 65+ cảnh- Bản đồ số     - Tạo tour tự    - Điểm đã lưu
    - GPS Gần tôi    - Chuyển cảnh nhanh- Lọc danh mục    động theo ngày - Kế hoạch cá
    - Tiện ích nhanh - Thuyết minh audio- Bấm xem chi   - Gợi ý 1N / 2N1Đ  nhân
    - Tin tức Live   - Mở toàn màn hình   tiết / chỉ    - Bộ lọc sở thích- Quét mã QR
    - SOS Khẩn cấp                        đường GPS                       điểm đến
```

---

## 3. THIẾT KẾ CÁC TÍNH NĂNG MỚI CHO DU KHÁCH

### 3.1 Tính năng "Gần tôi" (Nearby GPS Discovery)
- **Cơ chế**: Tận dụng API Vị trí của Zalo Mini App (`getLocation` từ `zmp-sdk`).
- **Hành vi UX**: Không đòi quyền vị trí vô tội vạ khi vừa mở app. Khi người dùng bấm nút *"Tìm điểm gần tôi"*, app mới xin cấp quyền vị trí 1 lần.
- **Tính toán**: Sử dụng công thức Haversine so sánh tọa độ hiện tại của du khách với tọa độ GPS thực tế của các danh thắng (Điện gió, Thác Lưu Ly, Thiền viện, Trạm y tế...) để sắp xếp thứ tự và hiển thị khoảng cách thực tế (ví dụ: `Cách bạn 4.2 km`).

### 3.2 Lên lịch trình thông minh (Trip Planner)
- Khách chọn số ngày: **1 Ngày**, **2 Ngày 1 Đêm**, hoặc **3 Ngày**.
- Khách chọn gu du lịch: **Thiên nhiên & Trekking**, **Tâm linh & Thanh tịnh**, **Bản sắc buôn làng M'Nông**, hoặc **Check-in sống ảo**.
- Hệ thống ghép nối thông minh các điểm đến có thật trong cơ sở dữ liệu để tạo ra lộ trình tối ưu về mặt địa lý và thời gian di chuyển.

### 3.3 Chuyến đi của tôi & Lưu trữ Offline (My Saved Trips)
- Cho phép du khách nhấn nút Trái tim (Yêu thích) để ghim danh sách điểm muốn đi.
- Lưu trữ cục bộ bằng `localStorage` / ZMP Storage, không cần tạo tài khoản rườm rà.

### 3.4 Quét mã QR tại điểm du lịch (Smart QR Check-in)
- Tại biển bảng thực tế ở Thác Lưu Ly, Cánh đồng Điện Gió, Thiền Viện Đạo Nguyên... có in mã QR.
- Khi du khách dùng camera Zalo hoặc tính năng quét mã trong app, Mini App mở ngay trang chi tiết của điểm đó, tự động kích hoạt Audio thuyết minh và cảnh VR 360 tương ứng.

### 3.5 Trình phát thuyết minh du lịch (Audio Tour Player)
- Kế thừa các file âm thanh chính thức từ website VR360 (`thac-luu-ly-VI.mp3`, `thien-vien-truc-lam-dao-nguyen-VI.mp3`, `van-hoa-dan-toc-mnong-VI.mp3`, `trung-tam-huyen-dak-song-VI.mp3`).
- Điều khiển phát/dừng, hiển thị thanh tiến trình, chạy ngầm tiện lợi khi du khách vừa đi bộ ngắm cảnh vừa nghe giới thiệu.

