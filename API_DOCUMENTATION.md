# TÀI LIỆU API HỆ THỐNG CỔNG DU LỊCH ĐẮK SONG
*(Tài liệu đặc tả các dịch vụ API thời gian thực từ hệ thống máy chủ `core-360.vnaapi.com` và `core-tenant.vnaapi.com`)*

---

## 1. TỔNG QUAN HỆ THỐNG API

Hệ thống backend của Cổng Văn Hóa Du Lịch Đắk Song bao gồm hai hệ thống dịch vụ chính:
- **`core-360.vnaapi.com`**: Quản lý toàn bộ nội dung cổng du lịch, bao gồm cấu hình, banner 360, danh mục, bài viết, đa phương tiện hình ảnh, và danh mục/địa điểm du lịch (Travel Location) kèm tọa độ GPS.
- **`core-tenant.vnaapi.com`**: Quản lý thông tin tổ chức/cơ quan hành chính (UBND Huyện Đắk Song).

Hầu hết các request cần kèm theo các header định danh đơn vị:
- `X-Department-Code: DAKNONG-2-29`
- `X-Tenant-Code: DAKNONG`
- `Content-Type: application/json`

---

## 2. DANH SÁCH CHI TIẾT CÁC API

### 2.1. Cấu hình Cổng (Configuration)
- **Endpoint**: `GET https://core-360.vnaapi.com/configuration/DAKNONG-2-29`
- **Mục đích**: Lấy thông tin cấu hình giao diện, logo huyện, menu, thông tin liên hệ chân trang (footer).
- **Màn hình sử dụng**: Toàn ứng dụng (Header, Footer, Menu).
- **Response Format**:
  ```json
  {
    "status": 200,
    "data": {
      "id": "2f1518eb-8c35-44ea-a28a-2c58aa867415",
      "template": "TEMPLATE2",
      "title": "Cổng Văn Hóa Du Lịch - Đắk Song",
      "image": "360/1720520041256_1672315054577_group-5371.png",
      "footer": "Cổng Du lịch huyện Đắk Song\nĐia chỉ: Tổ dân phố 3 - Thị trấn Đức An - Huyện Đắk Song - Tỉnh Đắk Nông\nĐiện thoại: 02613 710 979 - Fax: 02613 710 166 \nEmail: daksong@daknong.gov.vn",
      "menus": [ ... ]
    }
  }
  ```

---

### 2.2. Thông tin Cơ quan Đơn vị (Tenant Info)
- **Endpoint**: `GET https://core-tenant.vnaapi.com/department-public/info?departmentCode=DAKNONG-2-29&projectCode=360`
- **Mục đích**: Lấy thông tin pháp nhân UBND Huyện Đắk Song (mã tỉnh, huyện, xã, email, điện thoại điều hành).
- **Màn hình sử dụng**: Trang Thông tin / Hotline trợ giúp.
- **Response Format**:
  ```json
  {
    "status": 200,
    "data": {
      "id": "...",
      "code": "DAKNONG-2-29",
      "name": "Ủy ban nhân dân huyện Đắk Song",
      "phone": "02613 710 979",
      "email": "daksong@daknong.gov.vn",
      "provinceName": "Đắk Nông",
      "districtName": "Đắk Song"
    }
  }
  ```

---

### 2.3. Danh mục Cổng (Category All)
- **Endpoint**: `GET https://core-360.vnaapi.com/category/all/DAKNONG-2-29`
- **Mục đích**: Lấy cây danh mục bài viết phân cấp theo 3 khối: "Khám phá", "Điểm tham quan", "Dịch vụ" và các danh mục con (Lễ hội, Thắng cảnh, Làng nghề, Ẩm thực...).
- **Màn hình sử dụng**: Tab Khám phá, Bộ lọc bài viết Trang chủ.
- **Response Format**: Mảng 3 danh mục gốc, mỗi danh mục chứa mảng `children`.

---

### 2.4. Chi tiết Danh mục (Category Public Detail)
- **Endpoint**: `GET https://core-360.vnaapi.com/category-public/{categoryId}`
- **Mục đích**: Lấy thông tin danh mục đơn lẻ theo UUID.
- **Response Format**: Object danh mục kèm danh sách con `children`.

---

### 2.5. Banner 360 Panorama (Banner All)
- **Endpoint**: `GET https://core-360.vnaapi.com/banner/all/DAKNONG-2-29`
- **Mục đích**: Lấy danh sách banner ảnh 360 độ Panorama chất lượng cao từ Flycam.
- **Màn hình sử dụng**: Banner Trang chủ (Hero Banner).
- **Trường hình ảnh**: `url` có dạng `360/1730690452343_z5997324418175_...jpg`. Ghép với domain CDN: `https://static.dggv.edu.vn/${url}`.
- **Trình nhúng Pannellum**: `https://cdn.pannellum.org/2.5/pannellum.htm?panorama=${cdnUrl}&autoLoad=true&autoRotate=-2`.

---

### 2.6. Tìm kiếm, Phân trang và Lọc bài viết (Post Public Find)
- **Endpoint**: `POST https://core-360.vnaapi.com/post-public/find`
- **Headers**:
  - `Content-Type: application/json`
  - `X-Department-Code: DAKNONG-2-29`
- **Request Body**:
  ```json
  {
    "pageNumber": 0,
    "pageSize": 10,
    "categorySlugOrId": "su-kien-le-hoi-d20aba97-024a-4957-b9b7-b3cbc89fcd78"
  }
  ```
- **Response Format**:
  ```json
  {
    "status": 200,
    "data": {
      "items": [
        {
          "id": "af786285-a5a0-4914-a2ee-d9dd0cbe4d25",
          "name": "Bế mạc Ngày hội văn hoá các dân tộc huyện Đắk Song",
          "slug": "be-mac-ngay-hoi-van-hoa-cac-dan-toc-huyen-dak-songaf786285-a5a0-4914-a2ee-d9dd0cbe4d25",
          "categoryName": "Sự kiện - Lễ hội ",
          "quote": "Tối 25/11/2022...",
          "image": "360/1672314589993_z3986961448839_...jpg",
          "view": 5420,
          "rating": 5
        }
      ],
      "total": 10
    }
  }
  ```

---

### 2.7. Chi tiết Bài viết (Post Public Detail)
- **Endpoint**: `GET https://core-360.vnaapi.com/post-public/{slug-uuid}`
- **Headers**: `X-Department-Code: DAKNONG-2-29`
- **Mục đích**: Lấy toàn bộ nội dung bài viết dạng HTML phong phú (bao gồm hình ảnh, đề mục, chữ ký tác giả).
- **Màn hình sử dụng**: Modal Chi tiết Bài viết / Trang Blog.

---

### 2.8. Ghi nhận Lượt xem Bài viết (Post Public View)
- **Endpoint**: `POST https://core-360.vnaapi.com/post-public/view/{slug-uuid}`
- **Headers**: `X-Department-Code: DAKNONG-2-29`
- **Mục đích**: Tăng lượt xem (view count) khi người dùng mở đọc chi tiết bài viết.
- **Response Format**: `204 No Content` / `{"status": 204, "success": true}`.

---

### 2.9. Bài viết Xem nhiều nhất (Post Most Viewed)
- **Endpoint**: `GET https://core-360.vnaapi.com/post-public/most-viewed`
- **Headers**: `X-Department-Code: DAKNONG-2-29`
- **Mục đích**: Lấy danh sách 5 bài viết có lượt xem cao nhất của huyện Đắk Song.
- **Màn hình sử dụng**: Mục "Tin tiêu điểm / Nổi bật" trên Trang chủ.

---

### 2.10. Thư viện Đa phương tiện Ảnh (Media Image All)
- **Endpoint**: `GET https://core-360.vnaapi.com/media/all/IMAGE/DAKNONG-2-29`
- **Mục đích**: Lấy các album ảnh tiêu biểu của huyện Đắk Song.
- **Màn hình sử dụng**: Thư viện ảnh (Photo Gallery).

---

### 2.11. Danh mục & Địa điểm Du lịch (Travel Category & Location All)
*(API CỐT LÕI CỦA MINI APP)*
- **Endpoint**: `GET https://core-360.vnaapi.com/travel-category/all/DAKNONG-2-29`
- **Headers**: `X-Department-Code: DAKNONG-2-29`, `X-Tenant-Code: DAKNONG`
- **Mục đích**: Trả về 14 nhóm danh mục địa điểm và danh sách toàn bộ các địa điểm du lịch, ẩm thực, lưu trú thật kèm tọa độ GPS chính xác.
- **Cấu trúc dữ liệu địa điểm trong `travelLocations`**:
  ```json
  {
    "id": "c5e658bd-da7c-420d-9f5e-bdf8a61bcf42",
    "name": "Thác Lưu Ly",
    "address": "Đường Tỉnh Lộ 686 Nâm N'Jang Đắk Nông",
    "phone": null,
    "image": "360/1679365135640_daknong-thac-luu-ly.jpg",
    "content": "Không chỉ có thác Liêng Nung, Dray Nu, Dray Sáp...",
    "lat": 12.22541127316886,
    "lng": 107.68479586875392,
    "link": "https://goo.gl/maps/ki4kgsm85QMp2UY28",
    "travelCategoryId": "eb3561ff-db73-470c-b2fb-49a91036e431",
    "travelCategoryIcon": "DITICH",
    "isActivated": true
  }
  ```
- **Màn hình sử dụng**: Trang Địa điểm, Tính năng "Gần tôi", Bản đồ số, Lịch trình du lịch.

---

### 2.12. Ghi nhận Lượt xem Địa điểm (Travel Location View)
- **Endpoint**: `PUT https://core-360.vnaapi.com/travel-location/{uuid}/view`
- **Headers**: `Content-Type: application/json`, `X-Department-Code: DAKNONG-2-29`
- **Request Body**: Toàn bộ object của địa điểm du lịch.
- **Response Format**: `204 No Content` / `{"status": 204, "success": true}`.

