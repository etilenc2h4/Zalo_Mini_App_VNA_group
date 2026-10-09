export interface PortalConfiguration {
  id: string;
  template: string;
  title: string;
  image: string;
  logoUrl: string;
  favicon?: string | null;
  faviconInfo?: string | null;
  footer: string;
  ipV6?: string | null;
  networkTrust?: string | null;
  menus: any[];
  socials?: any;
  mainColor?: string | null;
  fontColor?: string | null;
  fontColorHeading?: string | null;
  lat?: number | null;
  lng?: number | null;
  zoom?: number | null;
  language?: string;
  editable?: boolean;
  deletable?: boolean;
  phone?: string;
  email?: string;
  address?: string;
}

