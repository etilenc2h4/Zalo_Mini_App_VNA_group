import { BASE_TENANT_URL, DEPARTMENT_CODE } from './apiConfig';
import { DepartmentInfo } from '../types/tenant';
import { getCached, setCached } from './cache.service';

const CACHE_KEY = `tenant_info_${DEPARTMENT_CODE}`;
const CACHE_TTL = 60 * 60 * 1000; // 1 giờ

export const getDepartmentInfo = async (): Promise<DepartmentInfo> => {
  const cached = getCached<DepartmentInfo>(CACHE_KEY);
  if (cached) return cached;

  const res = await fetch(`${BASE_TENANT_URL}/department-public/info?departmentCode=${DEPARTMENT_CODE}&projectCode=360`);
  if (!res.ok) {
    throw new Error(`API Tenant Error: ${res.status}`);
  }

  const json = await res.json();
  const d = json?.data || {};

  const info: DepartmentInfo = {
    id: d.id || '',
    code: d.code || DEPARTMENT_CODE,
    name: d.name || 'Ủy ban nhân dân huyện Đắk Song',
    phone: d.phone,
    email: d.email,
    logo: d.logo,
    level: d.level || 2,
    isActivated: !!d.isActivated,
    provinceCode: d.provinceCode,
    provinceName: d.provinceName || 'Đắk Nông',
    districtCode: d.districtCode,
    districtName: d.districtName || 'Đắk Song',
    wardCode: d.wardCode,
    wardName: d.wardName
  };

  setCached(CACHE_KEY, info, CACHE_TTL);
  return info;
};

