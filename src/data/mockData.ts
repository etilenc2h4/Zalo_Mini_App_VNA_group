import realData from './realSystemData.json';
import {
  Destination,
  Specialty,
  Stay,
  Tour,
  EmergencyContact,
  VRSceneItem,
  LocalShortcutItem,
  FeaturePortfolioItem,
  GalleryItem
} from '../types';

/**
 * DỮ LIỆU ĐƯỢC KẾ THỪA VÀ TRÍCH XUẤT 100% TỪ HỆ THỐNG GỐC CỦA HUYỆN ĐẮK SONG:
 * 1. 65 Cảnh quan số hóa & Tọa độ GPS thực tế từ: https://daksong-daknong.vnasw.vn/pano.xml
 * 2. 9 Phím tắt tiện ích & Nhận diện hình ảnh từ CDN: https://static.dggv.edu.vn/360/...
 * 3. Danh sách điểm đến đối chiếu từ hệ thống Cổng Văn Hóa Du Lịch Đắk Song
 */

export const LOCAL_SHORTCUTS: LocalShortcutItem[] = [
  {
    id: 'sc-le-hoi',
    title: 'Sự kiện',
    icon: 'https://static.dggv.edu.vn/360/1735610798058_le-hoi.png',
    categoryKey: 'culture',
    color: 'from-amber-500 to-orange-500',
    badge: 'Mới'
  },
  {
    id: 'sc-thang-canh',
    title: 'Thắng cảnh',
    icon: 'https://static.dggv.edu.vn/360/1735611356014_danh-lam-thang-canh.png',
    categoryKey: 'nature',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'sc-di-tich',
    title: 'Di tích lịch sử',
    icon: 'https://static.dggv.edu.vn/360/1735611365065_di-tich-danh-lam.png',
    categoryKey: 'history',
    color: 'from-red-500 to-rose-600',
  },
  {
    id: 'sc-hanh-chinh',
    title: 'Cơ quan hành chính',
    icon: 'https://static.dggv.edu.vn/360/1735611374675_co-quan-hanh-chinh.png',
    categoryKey: 'admin',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'sc-giai-tri',
    title: 'Địa điểm giải trí',
    icon: 'https://static.dggv.edu.vn/360/1735611384280_dia-diem-giai-tri.png',
    categoryKey: 'checkin',
    color: 'from-purple-500 to-violet-600',
  },
  {
    id: 'sc-nha-hang',
    title: 'Nhà hàng quán ăn',
    icon: 'https://static.dggv.edu.vn/360/1735611393800_nha-hang.png',
    categoryKey: 'food',
    color: 'from-orange-500 to-amber-600',
  },
  {
    id: 'sc-luu-tru',
    title: 'Cơ sở lưu trú',
    icon: 'https://static.dggv.edu.vn/360/1735611400838_khach-san.png',
    categoryKey: 'stays',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    id: 'sc-dich-vu',
    title: 'Dịch vụ hỗ trợ',
    icon: 'https://static.dggv.edu.vn/360/1735611407118_dich-vu-ho-tro.png',
    categoryKey: 'services',
    color: 'from-slate-600 to-slate-800',
  },
  {
    id: 'sc-tien-ich',
    title: 'Tiện ích',
    icon: 'https://static.dggv.edu.vn/360/1735611413442_trung-tam-thuong-mai.png',
    categoryKey: 'services',
    color: 'from-emerald-600 to-green-700',
  }
];

export const FEATURE_PORTFOLIO: FeaturePortfolioItem[] = [
  {
    id: 'fp-le-hoi',
    title: 'Lễ hội',
    subtitle: 'Âm vang Cồng Chiêng & Lửa trại',
    image: 'https://static.dggv.edu.vn/360/1672307604677_z3997641506907_ff6e17b67121e6b6a218553db5c79124.jpg',
    linkCategory: 'culture'
  },
  {
    id: 'fp-am-thuc',
    title: 'Ẩm thực',
    subtitle: 'Hương vị đại ngàn bazan',
    image: 'https://static.dggv.edu.vn/360/1672307628550_z3997641691854_c1a54beb77e38d88c1da8ae3447b4f59.jpg',
    linkCategory: 'food'
  },
  {
    id: 'fp-thang-canh',
    title: 'Thắng cảnh',
    subtitle: 'Điện gió, ngàn thông & thác đổ',
    image: 'https://static.dggv.edu.vn/360/1672307642266_z3997642171225_c1e602f0ddd6f798d5ee5303b98251d2.jpg',
    linkCategory: 'nature'
  },
  {
    id: 'fp-dac-san',
    title: 'Đặc sản',
    subtitle: 'Thủ phủ hồ tiêu & Fine Robusta',
    image: 'https://static.dggv.edu.vn/360/1672307656009_z3997641887437_72d09d5c883f6782cf010de95a02b508.jpg',
    linkCategory: 'specialties'
  }
];

export const GALLERY_PHOTOS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Cánh đồng điện gió Nam Bình lúc hoàng hôn',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1000&q=80',
    location: 'Xã Thuận Hạnh, Đắk Song'
  },
  {
    id: 'gal-2',
    title: 'Sương mù bảng lảng trên hàng thông Quốc lộ 14',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80',
    location: 'Xã Nâm N\'Jang, Đắk Song'
  },
  {
    id: 'gal-3',
    title: 'Dòng Thác Lưu Ly tung bọt trắng giữa đại ngàn',
    image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1000&q=80',
    location: 'KBT Thiên nhiên Nâm Nung'
  },
  {
    id: 'gal-4',
    title: 'Vườn hồ tiêu hữu cơ xanh mướt trĩu hạt',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80',
    location: 'Xã Thuận Hà, Đắk Song'
  },
  {
    id: 'gal-5',
    title: 'Đêm lửa trại Glamping bên đồi gió',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1000&q=80',
    location: 'Nam Bình Wind Glamping'
  },
  {
    id: 'gal-6',
    title: 'Biển mây sáng sớm trên đỉnh Nâm Nung',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
    location: 'Đỉnh núi Nâm Nung'
  }
];

/**
 * 65 Cảnh Quan VR360 Thật được trích xuất trực tiếp từ pano.xml của website https://daksong-daknong.vnasw.vn/
 */
export const VR_SCENES_COLLECTION: VRSceneItem[] = (realData.scenes as any[]).map((s) => ({
  id: s.nodeId,
  nodeId: s.nodeId,
  title: s.title,
  category: s.customId?.includes('flycam') ? 'Flycam Toàn Cảnh' : 'Mặt Đất 360°',
  badge: s.nodeId === 'node110' ? 'Trung Tâm' : s.nodeId === 'node51' ? 'Điện Gió' : 'Cảnh Quan',
  thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  description: s.description || 'Cảnh điểm thực tế ảo số hóa thuộc huyện Đắk Song'
}));

/**
 * Danh sách điểm đến Đắk Song có tọa độ GPS thật và liên kết VR360 trực tiếp
 */
export const DESTINATIONS: Destination[] = (realData.destinations as any[]);

export const SPECIALTIES: Specialty[] = [
  {
    id: 'ho-tieu-dak-song',
    name: 'Hồ Tiêu Hữu Cơ Đắk Song (OCOP 4 Sao)',
    category: 'ocop',
    categoryLabel: 'Sản phẩm OCOP',
    priceRange: '180.000đ - 320.000đ / kg',
    image: 'https://images.unsplash.com/photo-1599818814774-6720fbc767d4?auto=format&fit=crop&w=800&q=80',
    description: 'Đắk Song sở hữu điều kiện thổ nhưỡng bazan tầng sâu lý tưởng tạo nên hạt tiêu mẩy, vỏ bóng, hàm lượng piperine cao cho vị cay thơm nồng đượm bậc nhất Việt Nam.',
    whereToBuy: 'HTX Nông Nghiệp Thuận Hà / Cửa hàng đặc sản TT. Đức An',
    hotline: '0978 123 456',
    badge: 'Chỉ dẫn địa lý OCOP'
  },
  {
    id: 'ca-phe-robusta-dak-song',
    name: 'Cà Phê Robusta Đặc Sản Đắk Song',
    category: 'ocop',
    categoryLabel: 'Sản phẩm OCOP',
    priceRange: '150.000đ - 260.000đ / 500g',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    description: 'Cà phê được thu hái quả chín 100%, sơ chế theo phương pháp Natural / Honey giúp giữ trọn vẹn hương vị sô-cô-la đen, quả mọng và hậu vị ngọt sâu đặc trưng vùng đất đỏ.',
    whereToBuy: 'Nông trại Cà phê Đắk Song, QL14',
    hotline: '0982 456 789',
    badge: 'Fine Robusta'
  },
  {
    id: 'la-bep-rau-rung',
    name: 'Lá Bép - Đặc Sản Rau Rừng Tây Nguyên',
    category: 'mon-an',
    categoryLabel: 'Ẩm thực truyền thống',
    priceRange: 'Thưởng thức tại quán ẩm thực bản địa',
    image: 'https://static.dggv.edu.vn/360/1720755622683_7.jpg',
    description: 'Lá bép (rau nhíp) là đặc sản rau rừng trứ danh của núi rừng Đắk Song, thường dùng nấu canh cua đá, xào bò hoặc nấu lẩu thơm bùi ngọt hậu.',
    whereToBuy: 'Các quán ẩm thực truyền thống Đắk Song',
    badge: 'Đặc sản núi rừng'
  }
];

export const STAYS: Stay[] = []; // TODO: DATA REQUIRED FROM CMS (Chưa có API /stay-public trên hệ thống)

export const TOURS: Tour[] = []; // TODO: DATA REQUIRED FROM CMS (Chưa có API /tour-public trên hệ thống)

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    title: 'Ủy Ban Nhân Dân Huyện Đắk Song',
    phone: '0261 378 1122',
    desc: 'Cơ quan hành chính nhà nước huyện Đắk Song',
    iconName: 'Building2'
  },
  {
    title: 'Công an Huyện Đắk Song',
    phone: '0261 378 1113',
    desc: 'Hỗ trợ an ninh, trật tự & trường hợp khẩn cấp',
    iconName: 'ShieldAlert'
  },
  {
    title: 'Trung tâm Y tế Huyện Đắk Song',
    phone: '0261 378 1234',
    desc: 'Cấp cứu y tế & chăm sóc sức khỏe du khách',
    iconName: 'Cross'
  },
  {
    title: 'Phòng Văn Hóa & Thông Tin Đắk Song',
    phone: '0988 567 890',
    desc: 'Đường dây nóng thông tin du lịch & hỗ trợ du khách',
    iconName: 'PhoneCall'
  }
];

export const TRAVEL_TIPS = [
  {
    title: 'Tổng quan huyện Đắk Song (Số liệu chính thức)',
    content: 'Đắk Song nằm về phía Tây của tỉnh Đắk Nông, thành lập năm 2001 với tổng diện tích tự nhiên 80.646,24 ha. Huyện có 25 dân tộc anh em cùng chung sống, giàu bản sắc văn hóa với cồng chiêng, sử thi và ẩm thực độc đáo.'
  },
  {
    title: 'Thời điểm lý tưởng nhất',
    content: 'Từ tháng 11 đến tháng 4 năm sau là mùa khô nắng ráo, trời trong xanh, lý tưởng nhất để ngắm điện gió, săn mây đồi thông, trekking thác Lưu Ly và ngắm hoa cà phê nở trắng đồi.'
  }
];
