export interface PortalBanner {
  id: string;
  type: string;
  name: string;
  title?: string | null;
  subTitle?: string | null;
  url: string;
  fullImageUrl: string;
  pannellumUrl?: string;
  link?: string | null;
  showButton?: boolean;
  isActivated?: boolean;
  createdDate?: string;
}

