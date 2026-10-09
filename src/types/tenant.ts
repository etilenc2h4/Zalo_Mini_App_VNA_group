export interface DepartmentInfo {
  id: string;
  code: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  logo?: string | null;
  level: number;
  isActivated: boolean;
  provinceCode?: string | null;
  provinceName?: string | null;
  districtCode?: string | null;
  districtName?: string | null;
  wardCode?: string | null;
  wardName?: string | null;
}

