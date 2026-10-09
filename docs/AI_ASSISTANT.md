# 🤖 KIẾN TRÚC & HƯỚNG DẪN AI ASSISTANT TỔNG QUÁT - MINI APP ĐẮK SONG

Tài liệu kỹ thuật mô tả chi tiết kiến trúc, cơ chế hoạt động, Function Calling Tools, phân tách Chat/Action Mode và tích hợp Gemini API phục vụ Cổng Văn Hóa & Du Lịch Đắk Song.

---

## 1. KIẾN TRÚC TỔNG THỂ (ARCHITECTURE)

Hệ thống được thiết kế theo mô hình **AI Orchestrator** đa tầng, trong đó Gemini API đóng vai trò là "bộ não điều phối", không tự sinh dữ liệu mà luôn truy vấn qua Tool/Function Calling đến các nguồn dữ liệu thực tế:

```text
┌─────────────────────────────────────────────────────────────┐
│                   ZALO MINI APP (CLIENT)                    │
│   - Floating AI Button / AIAssistantModal                   │
│   - Nhận diện Structured Output                             │
│   - Điều hướng Action: OPEN_ITINERARY_CREATOR, VR360...     │
└──────────────────────────────┬──────────────────────────────┘
                               │ POST /api/ai/chat (JSON / Context)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 DAK SONG TRAVEL CORE BACKEND                │
│                 (Express + TypeScript)                      │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │            GEMINI API (ORCHESTRATOR)                │   │
│   │  - System Instruction (Nguyên tắc No-Hallucination) │   │
│   │  - Function Declarations (Tools)                    │   │
│   │  - JSON Schema Response                             │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │ Function Calling loop        │
│                              ▼                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                  AI TOOLS ENGINE                    │   │
│   └──────────────┬──────────────────────┬───────────────┘   │
└──────────────────┼──────────────────────┼───────────────────┘
                   │                      │
                   ▼                      ▼
        ┌─────────────────────┐┌─────────────────────┐
        │  CORE API ĐẮK SONG  ││  CSDL SUPABASE (DB) │
        │ (core-360.vnaapi)   ││ (User favorites,    │
        │ - 14 Categories     ││  Itineraries...)    │
        │ - 15 Locations      ││                     │
        │ - 42 Posts/Articles ││                     │
        │ - VR 360 Nodes      ││                     │
        └─────────────────────┘└─────────────────────┘
```

---

## 2. TÍCH HỢP GEMINI API (GEMINI INTEGRATION)
- **SDK**: `@google/generative-ai` (Official Google Generative AI Node.js SDK).
- **Model**: `gemini-2.5-flash` (Tốc độ phản hồi cực nhanh, độ trễ thấp < 800ms, hỗ trợ tốt Function Calling và JSON Output).
- **Vị trí**: Nằm hoàn toàn ở Backend `daksong-backend/src/services/gemini.service.ts`. Tuyệt đối không để lộ `GEMINI_API_KEY` ở Frontend.
- **Cơ chế gọi**:
  1. Frontend gửi `prompt` và `history` (tối đa 6 lượt hội thoại gần nhất) sang Backend.
  2. Backend khởi tạo Session Chat với System Instruction và khai báo danh sách `tools`.
  3. Khi Gemini phát hiện cần tra cứu dữ liệu, nó sinh ra `functionCalls`.
  4. Backend chạy hàm tương ứng, lấy dữ liệu thực tế từ Core API và đưa kết quả ngược lại cho Gemini qua `functionResponse`.
  5. Gemini tổng hợp câu trả lời theo cấu trúc **Structured JSON Response** trả về cho Frontend.

---

## 3. DANH SÁCH TOOL / FUNCTION CALLING (TOOL LIST)

1. `search_travel_locations`: Tra cứu các điểm du lịch, thác nước, đồi thông, đồi điện gió, quán cà phê, ẩm thực thực tế từ Core API.
2. `get_travel_location_detail`: Lấy thông tin chi tiết (địa chỉ, số điện thoại, mô tả, tọa độ GPS) của 1 địa điểm bằng ID.
3. `search_posts`: Tìm kiếm tin tức, bài viết giới thiệu văn hóa, ẩm thực, lễ hội, cẩm nang từ Core API.
4. `get_vr360_locations`: Lấy danh sách các địa điểm có gắn liên kết Sa bàn thực tế ảo VR 360° Đắk Song.
5. `get_user_favorites`: Lấy danh sách các điểm du lịch mà người dùng hiện tại đã lưu yêu thích từ Supabase.

---

## 4. INPUT / OUTPUT CỦA TỪNG TOOL

### 4.1. `search_travel_locations`
- **Input**:
  - `keyword` (string, optional): Từ khóa tìm kiếm (ví dụ: "điện gió", "thác", "ẩm thực").
  - `categoryName` (string, optional): Tên danh mục ("Thiên nhiên", "Văn hóa", "Ẩm thực").
- **Output**:
  ```json
  [
    {
      "id": "101",
      "name": "Cánh đồng Điện Gió Đắk Song",
      "categoryName": "Thiên nhiên & Cảnh quan",
      "address": "Xã Thuận Hạnh, Huyện Đắk Song",
      "phone": null,
      "imageUrl": "https://static.dggv.edu.vn/...",
      "hasVR360": true
    }
  ]
  ```

### 4.2. `get_travel_location_detail`
- **Input**: `locationId` (string, required).
- **Output**: Chi tiết địa điểm hoặc `{ "notFound": true }`.

### 4.3. `search_posts`
- **Input**: `keyword` (string, optional).
- **Output**:
  ```json
  [
    {
      "id": "205",
      "name": "Lễ hội cồng chiêng Đắk Song mùa thu",
      "categoryName": "Văn hóa truyền thống",
      "quote": "Tập tục đón khách và trình diễn cồng chiêng...",
      "imageUrl": "https://...",
      "publishDate": "2026-09-15"
    }
  ]
  ```

### 4.4. `get_vr360_locations`
- **Input**: Không cần tham số.
- **Output**: Danh sách địa điểm có trường `vrNodeId` (ví dụ `windfarm_node_1`, `waterfall_luuly_node_1`).

### 4.5. `get_user_favorites`
- **Input**: `userId` (string, required).
- **Output**: `{ "count": 2, "items": [ ... ] }`.

---

## 5. DANH SÁCH INTENT (INTENT LIST)

| Intent | Ý nghĩa | Khi nào kích hoạt |
| :--- | :--- | :--- |
| `CHAT` | Trao đổi, hỏi đáp thông thường | Chào hỏi, hỏi cảm nhận, thời tiết chung |
| `SEARCH` | Tìm kiếm địa điểm cụ thể | Người dùng hỏi rõ tên địa điểm hoặc loại hình |
| `RECOMMENDATION`| Đề xuất điểm đến theo sở thích | "Tôi thích thiên nhiên thì đi đâu?", "Gợi ý quán cà phê đẹp" |
| `CREATE_ITINERARY`| Yêu cầu tạo lịch trình chuyến đi | "Tôi có 2 ngày ở Đắk Song", "Lên kế hoạch tour cho tôi" |
| `FAVORITE` | Tương tác với mục đã lưu | "Xem các điểm tôi đã bookmark", "Danh sách đã lưu" |
| `VR360` | Hỏi trải nghiệm thực tế ảo | "Có chỗ nào xem 360 không?", "Mở sa bàn Đắk Song" |
| `OTHER` | Các yêu cầu khác ngoài phạm vi | Ngoài nghiệp vụ du lịch Đắk Song |

---

## 6. DANH SÁCH ACTION (ACTION LIST)

| Action Type | Mô tả | Frontend xử lý |
| :--- | :--- | :--- |
| `OPEN_ITINERARY_CREATOR` | Mở màn hình/tab lập lịch trình | Chuyển sang Tab `planner` với preset thời gian/sở thích |
| `OPEN_VR360` | Mở Sa bàn 3D VR 360° | Gọi `onOpenVRNode(nodeId)` mở toàn cảnh 360 |
| `OPEN_FAVORITES` | Mở danh sách mục đã lưu | Chuyển sang Tab `saved` |
| `OPEN_LOCATION` | Mở modal chi tiết địa điểm | Gọi `onSelectDestination(dest)` |
| `OPEN_POST` | Mở modal đọc bài viết | Mở `activeBlogPost` |
| `null` | Không cần action | Chỉ đọc tin nhắn thông thường |

---

## 7. CẤU TRÚC PHẢN HỒI (STRUCTURED RESPONSE SCHEMA)

Backend luôn trả về đối tượng JSON đồng nhất:

```typescript
export interface AIAssistantResponse {
  message: string;          // Nội dung hiển thị dạng văn bản tiếng Việt
  intent: 'CHAT' | 'SEARCH' | 'RECOMMENDATION' | 'CREATE_ITINERARY' | 'FAVORITE' | 'VR360' | 'OTHER';
  action_required: boolean; // Có yêu cầu hành động từ người dùng không
  action: {
    type: 'OPEN_LOCATION' | 'OPEN_POST' | 'OPEN_VR360' | 'OPEN_FAVORITES' | 'OPEN_ITINERARY_CREATOR' | null;
    payload?: Record<string, any>;
  } | null;
  data?: {
    locations?: Array<{
      id: string;
      name: string;
      categoryName?: string;
      address?: string | null;
      imageUrl?: string;
      hasVR360?: boolean;
    }>;
    posts?: Array<{
      id: string;
      name: string;
      categoryName?: string;
      imageUrl?: string;
    }>;
    source?: 'CORE_API' | 'MINI_APP_SERVICE' | 'WEB';
  };
}
```

---

## 8. NGUYÊN TẮC NGUỒN DỮ LIỆU & CHỐNG BỊA ĐẶT (NO HALLUCINATION)

1. **Phân cấp nguồn dữ liệu**:
   * `CORE_API`: Dữ liệu chính thức được kiểm duyệt từ UBND Huyện Đắk Song (`core-360.vnaapi.com`).
   * `MINI_APP_SERVICE`: Dữ liệu riêng tư của tài khoản Zalo du khách lưu trong CSDL Supabase.
   * `WEB`: Chỉ kích hoạt khi mở rộng Google Grounding, phải gắn nhãn rõ ràng.
2. **Quy tắc bất di bất dịch**:
   * Nếu Core API không có địa điểm `X`, AI **tuyệt đối không tự bịa ra địa điểm X**.
   * Không tự bịa số điện thoại, URL bài viết, tọa độ vĩ độ/kinh độ.
   * Mọi thẻ Card địa điểm hiển thị trên giao diện chat đều lấy trực tiếp từ mảng `data.locations` trả về từ Core API.

---

## 9. QUY TẮC BẢO MẬT (SECURITY)
* **API Key Isolation**: `GEMINI_API_KEY`, `ZALO_APP_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` chỉ tồn tại trong file `.env` của máy chủ Backend `daksong-backend`, hoàn toàn tách biệt khỏi mã nguồn Frontend Mini App.
* **Xác thực User**: Khi gọi các action cá nhân (`get_user_favorites`), Backend đọc `userId` từ token/session đã kiểm chứng, không cho phép client giả mạo ID của người khác.

---

## 10. QUẢN LÝ NGỮ CẢNH HỘI THOẠI (CONVERSATION CONTEXT)
* Quản lý ngữ cảnh thông qua mảng `history` gồm các cặp `user` và `model`.
* **Giới hạn Rolling Window**: Chỉ nạp **6 lượt trao đổi gần nhất** vào context của Gemini để tránh tràn token và giữ thời gian phản hồi dưới 1 giây.
* Cho phép người dùng hỏi tiếp các câu phụ thuộc ngữ cảnh (Ví dụ: *"Ở đó có đặc sản gì không?"* -> Gemini hiểu "đó" là địa điểm vừa tra cứu ở lượt trước).

---

## 11. BỘ TEST CASES TIÊU CHUẨN

1. **Test Case 1 (Hỏi đáp thông thường - CHAT)**:
   * *User*: "Đắk Song có gì đẹp?"
   * *Kỳ vọng*: AI gọi `search_travel_locations`, trả lời tổng quan thiên nhiên, đồi thông, điện gió. `action_required = false`, không mở itinerary.
2. **Test Case 2 (Tìm kiếm đề xuất - RECOMMENDATION)**:
   * *User*: "Tôi thích thiên nhiên và thác nước, có chỗ nào phù hợp?"
   * *Kỳ vọng*: AI gọi tool lọc thác Lưu Ly, đồi cảnh quan. Hiển thị thẻ Card địa điểm kèm nút "Chỉ đường" và "VR 360°".
3. **Test Case 3 (Ý định tạo lịch trình - ITINERARY INTENT)**:
   * *User*: "Tôi có 2 ngày ở Đắk Song, muốn đi cùng gia đình."
   * *Kỳ vọng*:
     - `intent = "CREATE_ITINERARY"`.
     - AI **KHÔNG tự động tạo lịch trình ngay trong Chat**.
     - AI trả lời: "Mình có thể giúp bạn tạo lịch trình 2 ngày phù hợp... Hãy bấm nút 'Tạo lịch trình cho tôi' bên dưới nhé!"
     - Hiển thị nút Action Button: `[📅 Tạo lịch trình cho tôi]`. Khi user bấm vào, Mini App tự chuyển sang tab Lên Lịch Trình.
4. **Test Case 4 (Tra cứu VR 360°)**:
   * *User*: "Có xem thực tế ảo 360 được không?"
   * *Kỳ vọng*: `intent = "VR360"`, trả về action `OPEN_VR360`, bấm nút mở ngay sa bàn toàn cảnh.
5. **Test Case 5 (Chống bịa đặt - NO HALLUCINATION)**:
   * *User*: "Khu nghỉ dưỡng DisneyLand ở Đắk Song nằm ở đâu?"
   * *Kỳ vọng*: AI trả lời không tìm thấy địa điểm này trong dữ liệu chính thức, không bịa địa chỉ.

---

## 12. CÁC PHẦN MỞ RỘNG TRONG TƯƠNG LAI
1. **Gemini Grounding with Google Search**: Kích hoạt khi du khách hỏi thông tin thời sự mới ngoài phạm vi Đắk Song (giá vé xe khách liên tỉnh, sự kiện vừa diễn ra hôm qua).
2. **Function Calling tạo lịch trình chuyên sâu**: Trong màn hình Planner, cho phép người dùng gõ câu lệnh tùy biến ("Tôi có người già, hãy giảm bớt thời gian đi bộ"), Gemini sẽ gọi `generateDynamicItinerary` điều chỉnh các chặng dừng trực tiếp.
3. **Voice Input (STT/TTS)**: Nhận diện giọng nói và đọc câu trả lời bằng âm thanh tiếng Việt.

