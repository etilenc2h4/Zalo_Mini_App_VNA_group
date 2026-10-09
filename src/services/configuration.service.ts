import { BASE_CORE_URL, DEPARTMENT_CODE, formatImageUrl } from './apiConfig';
import { PortalConfiguration } from '../types/configuration';
import { getCached, setCached } from './cache.service';

const CACHE_KEY = `config_${DEPARTMENT_CODE}`;
const CACHE_TTL = 30 * 60 * 1000; // 30 phút

export const getConfiguration = async (): Promise<PortalConfiguration> => {
  const cached = getCached<PortalConfiguration>(CACHE_KEY);
  if (cached) return cached;

  const res = await fetch(`${BASE_CORE_URL}/configuration/${DEPARTMENT_CODE}`);
  if (!res.ok) {
    throw new Error(`API Configuration Error: ${res.status}`);
  }

  const json = await res.json();
  const d = json?.data;

  const config: PortalConfiguration = {
    id: d?.id || '',
    template: d?.template || 'TEMPLATE2',
    title: d?.title || 'Cổng Văn Hóa Du Lịch - Đắk Song',
    image: d?.image || '',
    logoUrl: formatImageUrl(d?.image),
    favicon: d?.favicon,
    faviconInfo: d?.faviconInfo,
    footer: d?.footer || '',
    ipV6: d?.ipV6,
    networkTrust: d?.networkTrust,
    menus: d?.menus || [],
    socials: d?.socials,
    mainColor: d?.mainColor,
    fontColor: d?.fontColor,
    fontColorHeading: d?.fontColorHeading,
    lat: d?.lat,
    lng: d?.lng,
    zoom: d?.zoom,
    language: d?.language || 'VN',
    editable: d?.editable,
    deletable: d?.deletable,
    phone: '02613 710 979',
    email: 'daksong@daknong.gov.vn',
    address: 'Tổ dân phố 3 - Thị trấn Đức An - Huyện Đắk Song - Tỉnh Đắk Nông'
  };

  setCached(CACHE_KEY, config, CACHE_TTL);
  return config;
};

