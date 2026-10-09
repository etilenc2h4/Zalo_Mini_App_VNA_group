export interface QRGuideItem {
  id: string;
  code: string;
  title: string;
  subTitle: string;
  desc: string;
  address: string;
  imageUrl: string;
  audioUrl: string;
  ambientMusicUrl?: string;
  vrNodeId?: string;
  duration?: string;
}

// Danh sách các điểm đến văn hóa du lịch Đắk Song đã được tích hợp Audio Thuyết Minh Tự Động
export const DAKSONG_QR_GUIDE_LIST: QRGuideItem[] = [
  {
    id: 'thac_luu_ly',
    code: 'DS_LUULY',
    title: 'Thác Lưu Ly Đắk Song',
    subTitle: 'Di tích thắng cảnh tự nhiên đại ngàn',
    desc: 'Thác Lưu Ly nằm ẩn mình giữa cánh rừng nguyên sinh xanh mát của huyện Đắk Song. Dòng thác trắng xóa đổ từ độ cao hơn 20 mét tạo nên làn hơi nước mát lạnh quanh năm, là điểm dừng chân lý tưởng để cắm trại và hòa mình vào thiên nhiên hoang sơ.',
    address: 'Xã Nâm N’Jang, Huyện Đắk Song, Tỉnh Đắk Nông',
    imageUrl: 'https://static.dggv.edu.vn/360/1672307604677_z3997641506907_ff6e17b67121e6b6a218553db5c79124.jpg',
    audioUrl: 'https://daksong-daknong.vnasw.vn/media/trung-tam-huyen-dak-song-VI.mp3',
    ambientMusicUrl: 'https://daksong-daknong.vnasw.vn/media/daksong k o loi.mp3',
    vrNodeId: 'node_thac_luu_ly',
    duration: '02:45',
  },
  {
    id: 'dien_gio_dak_song',
    code: 'DS_DIENGIO',
    title: 'Cánh Đồng Điện Gió Đắk Song',
    subTitle: 'Biểu tượng năng lượng xanh & Check-in hoàng hôn',
    desc: 'Tổ hợp các trụ turbine điện gió khổng lồ vươn cao trên các triền đồi đất đỏ bazan Đắk Song tạo nên khung cảnh tráng lệ như trời Âu. Nơi đây là điểm ngắm hoàng hôn và săn mây cao nguyên được du khách yêu thích bậc nhất.',
    address: 'Xã Thuận Hạnh & Xã Nam Bình, Huyện Đắk Song, Đắk Nông',
    imageUrl: 'https://static.dggv.edu.vn/360/1730690452343_z5997324418175_b447115dd96ccd7f7bd7b83f95a27101.jpg',
    audioUrl: 'https://daksong-daknong.vnasw.vn/media/trung-tam-huyen-dak-song-VI.mp3',
    ambientMusicUrl: 'https://daksong-daknong.vnasw.vn/media/daksong k o loi.mp3',
    vrNodeId: 'windfarm_node_1',
    duration: '03:10',
  },
  {
    id: 'rung_thong_dak_song',
    code: 'DS_THONG',
    title: 'Rừng Thông Đắk Song',
    subTitle: 'Lá phổi xanh & Đà Lạt thu nhỏ giữa lòng Đắk Nông',
    desc: 'Trải dài dọc theo quốc lộ 14 qua địa bàn huyện Đắk Song, rừng thông hàng chục năm tuổi tỏa bóng mát rượi và hương thơm thanh khiết của nhựa thông. Khí hậu se lạnh quanh năm khiến nơi đây được mệnh danh là Đà Lạt thứ hai của Tây Nguyên.',
    address: 'Dọc Quốc lộ 14, Thị trấn Đức An, Huyện Đắk Song',
    imageUrl: 'https://static.dggv.edu.vn/360/1672307628550_z3997641691854_c1a54beb77e38d88c1da8ae3447b4f59.jpg',
    audioUrl: 'https://daksong-daknong.vnasw.vn/media/trung-tam-huyen-dak-song-VI.mp3',
    ambientMusicUrl: 'https://daksong-daknong.vnasw.vn/media/daksong k o loi.mp3',
    vrNodeId: 'node_rung_thong',
    duration: '02:15',
  },
  {
    id: 'thien_vien_dao_nguyen',
    code: 'DS_DAONGUYEN',
    title: 'Thiền Viện Trúc Lâm Đạo Nguyên',
    subTitle: 'Không gian tâm linh thanh tịnh giữa rừng già',
    desc: 'Thiền viện Trúc Lâm Đạo Nguyên tựa lưng vào dãy núi Nâm Nung linh thiêng, bao quanh bởi rừng nguyên sinh cổ thụ. Ngôi thiền viện mang đậm kiến trúc Phật giáo Trúc Lâm truyền thống, là chốn chiêm bái và tìm về an yên cho hàng ngàn Phật tử mỗi năm.',
    address: 'Khu bảo tồn thiên nhiên Nâm Nung, Huyện Đắk Song',
    imageUrl: 'https://static.dggv.edu.vn/360/1672307642266_z3997642171225_c1e602f0ddd6f798d5ee5303b98251d2.jpg',
    audioUrl: 'https://daksong-daknong.vnasw.vn/media/trung-tam-huyen-dak-song-VI.mp3',
    ambientMusicUrl: 'https://daksong-daknong.vnasw.vn/media/daksong k o loi.mp3',
    vrNodeId: 'node_dao_nguyen',
    duration: '03:40',
  },
  {
    id: 'trung_tam_dak_song',
    code: 'DS_TRUNGTAM',
    title: 'Trung Tâm Hành Chính & Văn Hóa Huyện',
    subTitle: 'Trái tim kết nối kinh tế - văn hóa Đắk Song',
    desc: 'Trung tâm hành chính huyện Đắk Song tại thị trấn Đức An là hạt nhân phát triển kinh tế, giao thương nông sản tiêu sạch, cà phê chất lượng cao và giao lưu văn hóa đa sắc tộc của vùng cao nguyên Đắk Nông.',
    address: 'Thị trấn Đức An, Huyện Đắk Song, Tỉnh Đắk Nông',
    imageUrl: 'https://static.dggv.edu.vn/360/1720520041256_1672315054577_group-5371.png',
    audioUrl: 'https://daksong-daknong.vnasw.vn/media/trung-tam-huyen-dak-song-VI.mp3',
    ambientMusicUrl: 'https://daksong-daknong.vnasw.vn/media/daksong k o loi.mp3',
    vrNodeId: 'node_trung_tam',
    duration: '02:50',
  },
];

/**
 * Phân giải nội dung chuỗi quét được từ Camera QR Code
 * Hỗ trợ URL Deep Link Zalo, URL Web, hoặc mã định danh code
 */
export const resolveQRCodeContent = (rawText: string): QRGuideItem | null => {
  if (!rawText || typeof rawText !== 'string') return null;
  const clean = rawText.trim();

  // 1. Khớp theo mã Code (DS_LUULY, DS_DIENGIO...)
  const byCode = DAKSONG_QR_GUIDE_LIST.find(
    (item) => item.code.toLowerCase() === clean.toLowerCase() || item.id.toLowerCase() === clean.toLowerCase()
  );
  if (byCode) return byCode;

  // 2. Trích xuất query params nếu là URL Zalo Mini App Deep Link (zalo.me/s/.../?destId=...)
  try {
    const urlObj = new URL(clean);
    const destId = urlObj.searchParams.get('destId') || urlObj.searchParams.get('qrId') || urlObj.searchParams.get('id');
    if (destId) {
      const found = DAKSONG_QR_GUIDE_LIST.find(
        (item) => item.id.toLowerCase() === destId.toLowerCase() || item.code.toLowerCase() === destId.toLowerCase()
      );
      if (found) return found;
    }
  } catch {
    // Không phải URL chuẩn, tiếp tục tìm kiếm mờ
  }

  // 3. Tìm kiếm theo tên xuất hiện trong chuỗi
  const lower = clean.toLowerCase();
  for (const item of DAKSONG_QR_GUIDE_LIST) {
    if (lower.includes(item.id.toLowerCase()) || lower.includes(item.code.toLowerCase())) {
      return item;
    }
  }

  return null;
};

/**
 * Tạo URL hình ảnh QR Code thật chuẩn để in ấn bảng hiệu thực địa
 */
export const getPrintableQRCodeImageUrl = (item: QRGuideItem): string => {
  const deepLinkUrl = `https://zalo.me/s/3383174999178410045/?qrId=${encodeURIComponent(item.id)}&autoAudio=true`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(deepLinkUrl)}`;
};

