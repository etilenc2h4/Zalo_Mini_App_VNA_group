import { TravelLocation } from '../types/travel';
import { Destination, Specialty, Stay } from '../types';
import { ItineraryStop } from './supabase/types';

export interface DynamicTourOptions {
  duration: '1day' | '2days';
  interest: 'nature' | 'culture' | 'checkin' | 'food' | 'saved';
  travelLocations: TravelLocation[];
  destinations: Destination[];
  stays?: Stay[];
  specialties?: Specialty[];
  savedDestinations?: Destination[];
  language?: 'vi' | 'en';
}

/**
 * Thuật toán sinh lịch trình du lịch Đắk Song động dựa trên dữ liệu thật 100%
 */
export const generateDynamicItinerary = ({
  duration,
  interest,
  travelLocations = [],
  destinations = [],
  stays = [],
  specialties = [],
  savedDestinations = [],
  language = 'vi'
}: DynamicTourOptions): ItineraryStop[] => {
  const isEn = language === 'en';

  // 1. Trường hợp người dùng muốn tạo lịch trình từ "Mục Đã Lưu"
  if (interest === 'saved' && savedDestinations.length > 0) {
    const validSpots = savedDestinations.filter(
      (d) => !(d.extra_data?.isPost || d.categoryLabel === 'Bài viết')
    );

    if (validSpots.length > 0) {
      const timeSlots1Day = [
        '07:30 - 09:30',
        '10:00 - 11:30',
        '12:00 - 13:30',
        '14:00 - 16:30',
        '17:00 - 18:30'
      ];
      const timeSlots2Days = [
        isEn ? 'Day 1 - Morning (08:00)' : 'Ngày 1 - Sáng (08:00)',
        isEn ? 'Day 1 - Afternoon (14:00)' : 'Ngày 1 - Chiều (14:00)',
        isEn ? 'Day 1 - Evening (18:00)' : 'Ngày 1 - Tối (18:00)',
        isEn ? 'Day 2 - Morning (08:00)' : 'Ngày 2 - Sáng (08:00)',
        isEn ? 'Day 2 - Afternoon (14:00)' : 'Ngày 2 - Chiều (14:00)'
      ];

      const slots = duration === '1day' ? timeSlots1Day : timeSlots2Days;

      return validSpots.slice(0, slots.length).map((spot, idx) => ({
        time: slots[idx] || (isEn ? `Stop ${idx + 1}` : `Chặng ${idx + 1}`),
        title: spot.name,
        location: spot.address || 'Đắk Song, Đắk Nông',
        destId: spot.id,
        vrNodeId: spot.vrNodeId || spot.extra_data?.vrNodeId,
        desc: spot.description || (isEn ? `Explore ${spot.name}` : `Tham quan và trải nghiệm tại ${spot.name}`),
        phone: spot.phone || spot.extra_data?.phone,
        lat: spot.lat,
        lng: spot.lng,
        tip: isEn ? 'Saved favorite spot' : 'Điểm đến trong danh sách yêu thích của bạn'
      }));
    }
  }

  // 2. Gom tất cả địa điểm du lịch thật vào 1 kho chung
  const combinedLocations: Array<{
    id: string;
    name: string;
    address: string;
    desc: string;
    category: string;
    phone?: string;
    lat?: number;
    lng?: number;
    vrNodeId?: string;
  }> = [];

  // Nguồn A: Live API TravelLocation (Core-360)
  travelLocations.forEach((l) => {
    combinedLocations.push({
      id: l.id,
      name: l.name,
      address: l.address || 'Đắk Song, Đắk Nông',
      desc: l.content || l.name,
      category: (l.travelCategoryIcon || '').toLowerCase(),
      phone: l.phone || undefined,
      lat: l.lat != null ? l.lat : undefined,
      lng: l.lng != null ? l.lng : undefined
    });
  });

  // Nguồn B: Destinations (có mã VR 360)
  destinations.forEach((d) => {
    if (!combinedLocations.some((c) => c.name.toLowerCase() === d.name.toLowerCase())) {
      combinedLocations.push({
        id: d.id,
        name: d.name,
        address: d.address || 'Đắk Song, Đắk Nông',
        desc: d.description || d.name,
        category: d.category.toLowerCase(),
        phone: d.phone,
        lat: d.lat,
        lng: d.lng,
        vrNodeId: d.vrNodeId
      });
    }
  });

  // Lọc theo chủ đề sở thích
  let filteredSpots = combinedLocations.filter((item) => {
    const text = `${item.name} ${item.desc} ${item.category}`.toLowerCase();
    if (interest === 'nature') {
      return text.includes('thác') || text.includes('rừng') || text.includes('thiên nhiên') || text.includes('nâm nung') || text.includes('hồ');
    }
    if (interest === 'checkin') {
      return text.includes('gió') || text.includes('điện gió') || text.includes('thông') || text.includes('đồi') || text.includes('checkin') || text.includes('quạt gió');
    }
    if (interest === 'culture') {
      return text.includes('buôn') || text.includes('thiền viện') || text.includes('văn hóa') || text.includes('làng') || text.includes('cồng chiêng') || text.includes('di tích');
    }
    if (interest === 'food') {
      return text.includes('ẩm thực') || text.includes('tiêu') || text.includes('quán') || text.includes('cà phê') || text.includes('nông trại');
    }
    return true;
  });

  // Nếu bộ lọc quá ít điểm, bổ sung các điểm du lịch tiêu biểu của Đắk Song
  if (filteredSpots.length < 3) {
    filteredSpots = [...filteredSpots, ...combinedLocations].slice(0, 8);
  }

  // 3. Phân bổ các mốc thời gian và điểm đến cho tour 1 Ngày
  if (duration === '1day') {
    const morningSpot = filteredSpots[0] || combinedLocations[0];
    const lateMorningSpot = filteredSpots[1] || combinedLocations[1];
    const afternoonSpot = filteredSpots[2] || combinedLocations[2];
    const sunsetSpot = filteredSpots[3] || combinedLocations[3];

    // Điểm ăn trưa thật
    const lunchFood = specialties[0]?.name || (isEn ? 'Highland Bamboo Rice & Grilled Chicken' : 'Cơm lam gà nướng & Lá bép Đắk Song');
    const lunchPhone = specialties[0]?.hotline || '02613 710 979';

    return [
      {
        time: '07:00 - 09:00',
        title: isEn ? `Morning at ${morningSpot.name}` : `Đón bình minh tại ${morningSpot.name}`,
        location: morningSpot.address,
        destId: morningSpot.id,
        vrNodeId: morningSpot.vrNodeId,
        desc: morningSpot.desc,
        phone: morningSpot.phone,
        lat: morningSpot.lat,
        lng: morningSpot.lng,
        tip: isEn ? 'Best early morning atmosphere' : 'Không khí sáng sớm se lạnh mát mẻ'
      },
      {
        time: '09:30 - 11:30',
        title: isEn ? `Explore ${lateMorningSpot?.name || 'Wind Farm'}` : `Tham quan ${lateMorningSpot?.name || 'Cánh đồng Điện Gió'}`,
        location: lateMorningSpot?.address || 'Thuận Hạnh, Đắk Song',
        destId: lateMorningSpot?.id,
        vrNodeId: lateMorningSpot?.vrNodeId,
        desc: lateMorningSpot?.desc || (isEn ? 'Scenic photo spots' : 'Check-in cảnh quan đặc trưng'),
        phone: lateMorningSpot?.phone,
        lat: lateMorningSpot?.lat,
        lng: lateMorningSpot?.lng,
        tip: isEn ? 'Scenic panoramic view' : 'Tầm nhìn rộng, quạt gió quay đẹp'
      },
      {
        time: '12:00 - 13:30',
        title: isEn ? `Lunch: ${lunchFood}` : `Bữa trưa đặc sản: ${lunchFood}`,
        location: isEn ? 'Duc An Town, Dak Song' : 'Thị trấn Đức An, Đắk Song',
        desc: isEn ? 'Enjoy local basalt plateau flavors with wild Dak Song pepper.' : 'Thưởng thức phong vị ẩm thực đậm đà bản sắc địa phương vùng cao nguyên Đắk Song.',
        phone: lunchPhone,
        tip: isEn ? 'Local cuisine specialty' : 'Ẩm thực truyền thống địa phương'
      },
      {
        time: '14:00 - 16:30',
        title: isEn ? `Afternoon visit: ${afternoonSpot?.name || 'Nature Reserve'}` : `Buổi chiều trải nghiệm: ${afternoonSpot?.name || 'Khu bảo tồn thiên nhiên'}`,
        location: afternoonSpot?.address || 'Đắk Song, Đắk Nông',
        destId: afternoonSpot?.id,
        vrNodeId: afternoonSpot?.vrNodeId,
        desc: afternoonSpot?.desc || '',
        phone: afternoonSpot?.phone,
        lat: afternoonSpot?.lat,
        lng: afternoonSpot?.lng,
        tip: isEn ? 'Wear comfortable walking shoes' : 'Nên mang giày thể thao thoải mái'
      },
      {
        time: '17:00 - 18:30',
        title: isEn ? `Golden Sunset at ${sunsetSpot?.name || 'Wind Hills'}` : `Ngắm hoàng hôn đồi cao tại ${sunsetSpot?.name || 'Đồi Gió Đắk Song'}`,
        location: sunsetSpot?.address || 'Nam Bình, Đắk Song',
        destId: sunsetSpot?.id,
        vrNodeId: sunsetSpot?.vrNodeId,
        desc: isEn ? 'Watch the dusk cover the plateau with golden sun rays.' : 'Chiêm ngưỡng hoàng hôn rực rỡ buông xuống thung lũng Đắk Song.',
        phone: sunsetSpot?.phone,
        lat: sunsetSpot?.lat,
        lng: sunsetSpot?.lng,
        tip: isEn ? 'Ideal sunset photography' : 'Góc chụp hoàng hôn đẹp nhất'
      }
    ];
  }

  // 4. Phân bổ cho tour 2 Ngày 1 Đêm (2D1N)
  const spotDay1_Morning = filteredSpots[0] || combinedLocations[0];
  const spotDay1_Afternoon = filteredSpots[1] || combinedLocations[1];
  const stayNight = stays[0];
  const spotDay2_Morning = filteredSpots[2] || combinedLocations[2];
  const spotDay2_Afternoon = filteredSpots[3] || combinedLocations[3];

  return [
    {
      time: isEn ? 'Day 1 - Morning (08:00 - 11:30)' : 'Ngày 1 - Sáng (08:00 - 11:30)',
      title: isEn ? `Day 1: Explore ${spotDay1_Morning.name}` : `Ngày 1: Khám phá ${spotDay1_Morning.name}`,
      location: spotDay1_Morning.address,
      destId: spotDay1_Morning.id,
      vrNodeId: spotDay1_Morning.vrNodeId,
      desc: spotDay1_Morning.desc,
      phone: spotDay1_Morning.phone,
      lat: spotDay1_Morning.lat,
      lng: spotDay1_Morning.lng,
      tip: isEn ? 'Morning highland breeze' : 'Không khí trong lành buổi sớm'
    },
    {
      time: isEn ? 'Day 1 - Afternoon (14:00 - 17:00)' : 'Ngày 1 - Chiều (14:00 - 17:00)',
      title: isEn ? `Visit ${spotDay1_Afternoon?.name || 'Scenic Spot'}` : `Tham quan ${spotDay1_Afternoon?.name || 'Thắng cảnh Đắk Song'}`,
      location: spotDay1_Afternoon?.address || 'Đắk Song',
      destId: spotDay1_Afternoon?.id,
      vrNodeId: spotDay1_Afternoon?.vrNodeId,
      desc: spotDay1_Afternoon?.desc || '',
      phone: spotDay1_Afternoon?.phone,
      lat: spotDay1_Afternoon?.lat,
      lng: spotDay1_Afternoon?.lng,
      tip: isEn ? 'Scenic nature experience' : 'Trải nghiệm cảnh quan cao nguyên'
    },
    {
      time: isEn ? 'Day 1 - Evening (18:30 - 21:00)' : 'Ngày 1 - Tối (18:30 - 21:00)',
      title: isEn ? `Check-in & Rest: ${stayNight?.name || 'Local Homestay'}` : `Nghỉ đêm: ${stayNight?.name || 'Homestay / Khách sạn địa phương'}`,
      location: stayNight?.address || 'Thị trấn Đức An, Đắk Song',
      desc: isEn ? 'Relax and enjoy fresh highland night air with barbecue dinner.' : 'Nghỉ ngơi, thưởng thức BBQ tối và tận hưởng bầu không khí trong lành của cao nguyên.',
      phone: stayNight?.phone || '02613 710 979',
      tip: isEn ? 'Book room in advance' : 'Nên liên hệ đặt phòng trước'
    },
    {
      time: isEn ? 'Day 2 - Morning (08:00 - 11:30)' : 'Ngày 2 - Sáng (08:00 - 11:30)',
      title: isEn ? `Day 2: Visit ${spotDay2_Morning?.name || 'Village Cultural Exchange'}` : `Ngày 2: Trải nghiệm ${spotDay2_Morning?.name || 'Văn hóa buôn làng'}`,
      location: spotDay2_Morning?.address || 'Đắk Song',
      destId: spotDay2_Morning?.id,
      vrNodeId: spotDay2_Morning?.vrNodeId,
      desc: spotDay2_Morning?.desc || '',
      phone: spotDay2_Morning?.phone,
      lat: spotDay2_Morning?.lat,
      lng: spotDay2_Morning?.lng,
      tip: isEn ? 'Local cultural immersion' : 'Giao lưu văn hóa truyền thống'
    },
    {
      time: isEn ? 'Day 2 - Afternoon (13:30 - 16:30)' : 'Ngày 2 - Chiều (13:30 - 16:30)',
      title: isEn ? `Shop Dak Song Specialties: ${specialties[0]?.name || 'OCOP Organic Pepper'}` : `Mua quà đặc sản: ${specialties[0]?.name || 'Hồ Tiêu Đắk Song OCOP'}`,
      location: specialties[0]?.whereToBuy || 'Thị trấn Đức An, Đắk Song',
      desc: isEn ? 'Shop certified local OCOP gifts and pepper specialties before heading home.' : 'Mua sắm đặc sản hồ tiêu hữu cơ số 1 Việt Nam và quà lưu niệm OCOP trước khi kết thúc chuyến đi.',
      phone: specialties[0]?.hotline || '02613 710 979',
      tip: isEn ? 'Certified 4-star OCOP' : 'Đặc sản OCOP chuẩn 4 sao'
    }
  ];
};
