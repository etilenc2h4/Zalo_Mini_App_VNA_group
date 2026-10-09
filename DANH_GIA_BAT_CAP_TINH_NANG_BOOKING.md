# 📑 BÁO CÁO PHÂN TÍCH & ĐÁNH GIÁ TÍNH KHẢ THI

## VẤN ĐỀ BẤT CẬP KHI TÍCH HỢP TÍNH NĂNG ĐẶT PHÒNG (BOOKING ENGINE) TRÊN CỔNG VĂN HÓA DU LỊCH ĐẮK SONG

**Đơn vị thực hiện:** Đội ngũ Phát triển Hệ thống Zalo Mini App  
**Báo cáo phục vụ:** Hội đồng Đánh giá & Ban Quản lý Dự án Chuyển đổi số Du lịch Đắk Song  
**Thời gian lập:** Tháng 10/2026

---

## 🎯 TỔNG QUAN VẤN ĐỀ

Trong quá trình khảo sát và phát triển Cổng Văn Hóa & Du Lịch Đắk Song trên nền tảng Zalo Mini App, tính năng **Đặt phòng trực tuyến (Hotel/Homestay Booking)** thường được xem xét như một tiện ích mở rộng.

Tuy nhiên, qua nghiên cứu chuyên sâu về mặt **kỹ thuật phần mềm**, **năng lực vận hành thực tế tại địa phương** và **hành lang pháp lý**, đội ngũ phát triển khuyến nghị **KHÔNG NÊN** tích hợp mô-đun đặt phòng giao dịch tự động trực tiếp vào Cổng du lịch ở giai đoạn này. Dưới đây là 5 nhóm bất cập cốt lõi:

---

## ⚖️ 1. BẤT CẬP VỀ PHÁP LÝ & ĐỊNH VỊ THỂ CHẾ (LEGAL & GOVERNANCE RISKS)

1. **Rào cản về Giấy phép Sàn Thương mại Điện tử (TMĐT)**:
   - Cổng du lịch thuộc cơ quan nhà nước (UBND Huyện) được định vị là **Cổng Dịch vụ công & Xúc tiến thông tin văn hóa du lịch**.
   - Nếu tích hợp tính năng đặt phòng có giao dịch/thu tiền/giữ cọc, ứng dụng sẽ trở thành một **Sàn giao dịch TMĐT** theo _Nghị định 52/2013/NĐ-CP_ và _Nghị định 85/2021/NĐ-CP_, đòi hỏi quy trình đăng ký, thẩm định phức tạp với Bộ Công Thương và cấp phép trung gian tài chính.

2. **Rủi ro Trách nhiệm Liên đới khi Xảy ra Tranh chấp**:
   - Khi du khách thanh toán hoặc đặt phòng qua Cổng chính thức nhưng gặp sự cố (_chủ phòng không giao phòng, phòng thực tế khác ảnh chụp, dịch vụ kém chất lượng, tranh chấp tiền cọc_), **uy tín của chính quyền địa phương sẽ bị ảnh hưởng trực tiếp**.
   - Cơ quan quản lý sẽ phải đứng ra phân xử tranh chấp dân sự - kinh tế giữa du khách và hộ kinh doanh cá thể.

---

## 🏚️ 2. BẤT CẬP VỀ THỰC TRẠNG VẬN HÀNH TẠI ĐẮK SONG (LOCAL READINESS)

1. **Đặc thù Cơ sở Lưu trú tại Địa phương**:
   - Khác với các thành phố lớn sở hữu chuỗi khách sạn 3-5 sao có phần mềm quản lý phòng tự động (PMS), hơn 90% cơ sở lưu trú tại Đắk Song là **nhà nghỉ gia đình, homestay nông trại sinh thái tự phát**.
   - Việc quản lý sổ sách phòng ốc hiện tại chủ yếu bằng sổ tay, tin nhắn Zalo cá nhân hoặc gọi điện thoại trực tiếp.

2. **Nguy cơ Trùng Phòng (Overbooking / Double-Booking) Cực Kỳ Cao**:
   - Các chủ homestay không thể thường xuyên túc trực trên ứng dụng 24/7 để cập nhật kho phòng trống (_Inventory_).
   - Họ vẫn nhận khách vãng lai, khách quen gọi qua điện thoại hoặc khách từ Facebook.
   - **Hậu quả**: Khách đặt trên Mini App báo còn phòng, nhưng khi chạy xe đến nơi thì chủ nhà báo "vừa cho người khác thuê mất rồi". Sự việc này sẽ gây thất vọng rất lớn cho du khách.

---

## 💻 3. BẤT CẬP VỀ ĐỘ PHỨC TẠP KỸ THUẬT (TECHNICAL COMPLEXITY)

Một hệ thống Booking Engine tự động đúng chuẩn ERP/OTA đòi hỏi các cấu phần phần mềm khổng lồ vượt xa quy mô của một Mini App thông tin:

1. **Quản lý Tồn kho & Lịch trống theo Ngày (Availability Calendar)**:
   - Phải xây dựng cổng quản trị (Admin Dashboard) riêng biệt cho từng chủ homestay đăng nhập, cấu hình số lượng từng loại phòng theo từng ngày.
2. **Cơ chế Khóa phòng Tránh Xung đột (Room Hold Lock & Race Condition)**:
   - Phải xử lý thuật toán khóa phòng tạm thời (Hold 10-15 phút) khi có 2 người cùng bấm đặt 1 phòng cuối cùng trong cùng một giây.
3. **Chính sách Giá động (Dynamic Pricing)**:
   - Thuật toán tính giá ngày thường, giá cuối tuần (Thứ 6, Thứ 7), giá mùa lễ hội hoa cà phê/Tết, chính sách phụ thu thêm người lớn/trẻ em, chính sách hủy phòng hoàn tiền.
4. **Đồng bộ Đa kênh (Channel Manager)**:
   - Các homestay lớn có bán phòng trên Booking.com, Agoda hay Traveloka bắt buộc phải có kết nối API iCal để đồng bộ số phòng trống, nếu không việc lệch dữ liệu là điều chắc chắn xảy ra.

---

## 💸 4. GÁNH NẶNG CHI PHÍ & NHÂN SỰ VẬN HÀNH (OPERATIONAL OVERHEAD)

1. **Bộ máy Chăm sóc Khách hàng & Đối soát (CS & Reconciliation)**:
   - Cần đội ngũ nhân sự túc trực 24/7 để tiếp nhận khiếu nại, gọi điện xác nhận phòng, đối soát doanh thu và chuyển tiền cho các chủ homestay.
2. **Chi phí Bảo trì & Rủi ro Tắc nghẽn Hệ thống**:
   - Chi phí hạ tầng máy chủ cho một hệ thống giao dịch lớn hơn gấp 5 - 10 lần so với một Cổng thông tin tối ưu bằng caching tĩnh.

---

## 🌟 5. ĐỀ XUẤT HƯỚNG ĐI TỐI ƯU CHO ĐẮK SONG (STRATEGIC RECOMMENDATION)

Thay vì "ôm đồm" việc thu tiền và vận hành kho phòng phức tạp, Cổng Du Lịch Đắk Song nên triển khai theo mô hình:  
👉 **CẦU NỐI KẾT NỐI TRỰC TIẾP (DIRECT CONCIERGE & LOCAL OUTREACH)**:

| Tiêu chí               | ❌ Tự động Booking (Mô hình OTA)                  | Cầu Nối Trực Tiếp (Khuyên dùng)                                                           |
| :--------------------- | :------------------------------------------------ | :---------------------------------------------------------------------------------------- |
| **Bản chất**           | Cổng đứng ra thu tiền & cam kết phòng.            | Cổng giới thiệu thông tin chuẩn xác & kết nối 1-chạm.                                     |
| **Trải nghiệm khách**  | Phức tạp, dễ bị hủy phòng do chủ không cập nhật.  | Nhanh chóng, gọi điện thoại/nhắn Zalo trao đổi trực tiếp với chủ nhà.                     |
| **Rủi ro cho Huyện**   | Rất cao (trách nhiệm tiền bạc, thuế, tranh chấp). | **Bằng 0** (chỉ đóng vai trò kênh quảng bá công).                                         |
| **Tính tương thích**   | Chủ homestay vùng cao khó tiếp cận phần mềm.      | **100% phù hợp** với tập quán gọi điện/nhắn Zalo của người dân địa phương.                |
| **Tính năng tích hợp** | Nút "Đặt phòng" giả lập dễ gây hiểu lầm.          | Nút **"Gọi Hotline Homestay"**, **"Chỉ đường Google Maps"**, **"Nhắn tin Zalo Chủ nhà"**. |
