/**
 * Tiện ích chuẩn hóa và so khớp danh mục thông minh giữa phím tắt và dữ liệu thực tế
 */

export const normalizeCategoryKey = (key: string): string => {
  if (!key || key === 'all') return 'all';
  const k = key.toLowerCase();
  if (k === 'am-thuc' || k === 'food' || k === 'anuong' || k === 'nhahang' || k === 'nha-hang') return 'food';
  if (k === 'specialties' || k === 'dac-san' || k === 'dacsan') return 'specialties';
  if (k === 'culture' || k === 'le-hoi' || k === 'su-kien') return 'culture';
  if (k === 'nature' || k === 'explore' || k === 'thang-canh') return 'nature';
  if (k === 'history' || k === 'di-tich') return 'history';
  if (k === 'stays' || k === 'luu-tru' || k === 'khach-san') return 'stays';
  if (k === 'checkin' || k === 'giai-tri') return 'checkin';
  if (k === 'admin' || k === 'hanh-chinh') return 'admin';
  if (k === 'services' || k === 'dich-vu' || k === 'tien-ich') return 'services';
  return k;
};

export const isMatchCategory = (itemCategory: string = '', itemContent: string = '', targetKey: string = ''): boolean => {
  if (!targetKey || targetKey === 'all') return true;
  const cat = itemCategory.toLowerCase();
  const content = itemContent.toLowerCase();
  const t = targetKey.toLowerCase();

  // 1. Sự kiện - Lễ hội
  if (t === 'culture' || t.includes('le-hoi') || t.includes('lễ hội') || t.includes('sự kiện')) {
    return (
      cat.includes('lễ hội') ||
      cat.includes('sự kiện') ||
      cat.includes('văn hóa') ||
      cat.includes('le-hoi') ||
      cat.includes('sukien') ||
      cat.includes('giatrisukienhoinghi') ||
      content.includes('lễ hội') ||
      content.includes('sự kiện')
    );
  }

  // 2. Thắng cảnh
  if (t === 'nature' || t === 'explore' || t.includes('thang-canh') || t.includes('thắng cảnh') || t.includes('khám phá')) {
    return (
      cat.includes('thắng cảnh') ||
      cat.includes('danh lam') ||
      cat.includes('thiên nhiên') ||
      cat.includes('thác') ||
      cat.includes('thangcanh') ||
      cat.includes('thang_canh') ||
      cat.includes('diadiemdulich') ||
      content.includes('thắng cảnh') ||
      content.includes('danh lam') ||
      content.includes('thác') ||
      content.includes('điện gió') ||
      content.includes('đồi')
    );
  }

  // 3. Di tích lịch sử
  if (t === 'history' || t.includes('di-tich') || t.includes('di tích')) {
    return (
      cat.includes('di tích') ||
      cat.includes('lịch sử') ||
      cat.includes('ditich') ||
      cat.includes('chùa') ||
      cat.includes('chua') ||
      cat.includes('nhà thờ') ||
      cat.includes('nhatho') ||
      content.includes('di tích') ||
      content.includes('lịch sử') ||
      content.includes('thiền viện')
    );
  }

  // 4. Ẩm thực - Quán ăn
  if (t === 'food' || t.includes('am-thuc') || t.includes('nha-hang') || t.includes('ẩm thực') || t.includes('quán ăn') || t.includes('an-uong')) {
    return (
      cat.includes('ẩm thực') ||
      cat.includes('nhà hàng') ||
      cat.includes('món ngon') ||
      cat.includes('quán') ||
      cat.includes('ăn uống') ||
      cat.includes('anuong') ||
      cat.includes('nhahang') ||
      cat.includes('amthuc') ||
      content.includes('ẩm thực') ||
      content.includes('nhà hàng') ||
      content.includes('quán') ||
      content.includes('phở') ||
      content.includes('bún') ||
      content.includes('cà phê') ||
      content.includes('cơm') ||
      content.includes('nướng')
    );
  }

  // 5. Đặc sản địa phương
  if (t === 'specialties' || t.includes('dac-san') || t.includes('đặc sản')) {
    return (
      cat.includes('đặc sản') ||
      cat.includes('dacsan') ||
      cat.includes('nông sản') ||
      cat.includes('cây giống') ||
      cat.includes('caygiong') ||
      cat.includes('làng nghề') ||
      content.includes('đặc sản') ||
      content.includes('hồ tiêu') ||
      content.includes('tiêu') ||
      content.includes('cà phê') ||
      content.includes('robusta') ||
      content.includes('sầu riêng') ||
      content.includes('bơ') ||
      content.includes('mắc ca') ||
      content.includes('rượu cần')
    );
  }

  // 6. Cơ sở lưu trú
  if (t === 'stays' || t.includes('luu-tru') || t.includes('lưu trú') || t.includes('khách sạn')) {
    return (
      cat.includes('lưu trú') ||
      cat.includes('khách sạn') ||
      cat.includes('homestay') ||
      cat.includes('nhà nghỉ') ||
      cat.includes('luutru') ||
      cat.includes('nhanghikhachsan') ||
      cat.includes('khachsan') ||
      cat.includes('nhanghi') ||
      content.includes('khách sạn') ||
      content.includes('nhà nghỉ') ||
      content.includes('homestay') ||
      content.includes('resort')
    );
  }

  // 7. Địa điểm giải trí
  if (t === 'checkin' || t.includes('giai-tri') || t.includes('giải trí')) {
    return (
      cat.includes('giải trí') ||
      cat.includes('vui chơi') ||
      cat.includes('checkin') ||
      cat.includes('trải nghiệm') ||
      cat.includes('giaitri') ||
      cat.includes('giatrisukienhoinghi') ||
      content.includes('giải trí') ||
      content.includes('glamping') ||
      content.includes('check-in')
    );
  }

  // 8. Hành chính
  if (t === 'admin' || t.includes('hanh-chinh') || t.includes('hành chính')) {
    return (
      cat.includes('hành chính') ||
      cat.includes('cơ quan') ||
      cat.includes('ubnd') ||
      cat.includes('coquanhanhchinh') ||
      cat.includes('y tế') ||
      cat.includes('yte') ||
      cat.includes('bệnh viện') ||
      cat.includes('trường học') ||
      cat.includes('truonghoc') ||
      content.includes('hành chính') ||
      content.includes('ubnd') ||
      content.includes('y tế') ||
      content.includes('bệnh viện')
    );
  }

  // 9. Dịch vụ & Tiện ích
  if (t === 'services' || t.includes('dich-vu') || t.includes('tiện ích') || t.includes('dịch vụ')) {
    return (
      cat.includes('dịch vụ') ||
      cat.includes('tiện ích') ||
      cat.includes('hỗ trợ') ||
      cat.includes('dichvu') ||
      cat.includes('tienich') ||
      cat.includes('mua sắm') ||
      cat.includes('chợ') ||
      cat.includes('cho') ||
      cat.includes('cửa hàng') ||
      cat.includes('cuahangbuonban') ||
      cat.includes('phương tiện') ||
      content.includes('dịch vụ') ||
      content.includes('tiện ích') ||
      content.includes('cửa hàng')
    );
  }

  return cat.includes(t) || t.includes(cat);
};

