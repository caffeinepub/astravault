import {
  Building2,
  Mail,
  TrendingUp,
  Train,
  Shield,
  FolderOpen,
  Heart,
  Camera,
  Home,
  CreditCard,
  Smartphone,
  Landmark,
  Bitcoin,
  BarChart3,
  Sprout,
  QrCode,
  Calendar,
  type LucideIcon,
} from 'lucide-react';

export interface DefaultLink {
  name: string;
  url: string;
  category: string;
  iconName: string;
}

export interface CategoryGroup {
  category: string;
  icon: LucideIcon;
  links: DefaultLink[];
}

export const ICON_MAP: Record<string, LucideIcon> = {
  Building2,
  Mail,
  TrendingUp,
  Train,
  Shield,
  FolderOpen,
  Heart,
  Camera,
  Home,
  CreditCard,
  Smartphone,
  Landmark,
  Bitcoin,
  BarChart3,
  Sprout,
  QrCode,
  Calendar,
};

export const DEFAULT_CATEGORIES: CategoryGroup[] = [
  {
    category: 'BANK',
    icon: Landmark,
    links: [
      { name: 'State Bank of India', url: 'https://sbi.bank.in/', category: 'BANK', iconName: 'Landmark' },
      { name: 'Punjab National Bank', url: 'https://www.pnbindia.in', category: 'BANK', iconName: 'Building2' },
      { name: 'India Post Payments Bank', url: 'https://www.ippbonline.com', category: 'BANK', iconName: 'Building2' },
    ],
  },
  {
    category: 'EMAIL',
    icon: Mail,
    links: [
      { name: 'Gmail', url: 'https://mail.google.com', category: 'EMAIL', iconName: 'Mail' },
      { name: 'Google Calendar', url: 'https://calendar.google.com', category: 'EMAIL', iconName: 'Calendar' },
    ],
  },
  {
    category: 'INVESTMENT',
    icon: TrendingUp,
    links: [
      { name: 'CoinDCX', url: 'https://coindcx.com', category: 'INVESTMENT', iconName: 'Bitcoin' },
      { name: 'ET Money', url: 'https://www.etmoney.com', category: 'INVESTMENT', iconName: 'BarChart3' },
      { name: 'Groww', url: 'https://groww.in', category: 'INVESTMENT', iconName: 'Sprout' },
    ],
  },
  {
    category: 'SERVICES',
    icon: Shield,
    links: [
      { name: 'IRCTC', url: 'https://www.irctc.co.in', category: 'SERVICES', iconName: 'Train' },
      { name: 'mAadhaar', url: 'https://uidai.gov.in/en/', category: 'SERVICES', iconName: 'Smartphone' },
      { name: 'DigiLocker', url: 'https://www.digilocker.gov.in', category: 'SERVICES', iconName: 'FolderOpen' },
      { name: 'LIC Digital', url: 'https://licindia.in', category: 'SERVICES', iconName: 'Heart' },
      { name: 'V380 Pro', url: 'https://www.v380.cn', category: 'SERVICES', iconName: 'Camera' },
      { name: 'Xiaomi Home', url: 'http://play.google.com/store/apps/details?id=com.xiaomi.smarthome&hl=en_IN', category: 'SERVICES', iconName: 'Home' },
    ],
  },
  {
    category: 'PAYMENTS',
    icon: CreditCard,
    links: [
      { name: 'Google Pay', url: 'https://pay.google.com', category: 'PAYMENTS', iconName: 'QrCode' },
      { name: 'PhonePe', url: 'https://www.phonepe.com', category: 'PAYMENTS', iconName: 'CreditCard' },
    ],
  },
];

export const ALL_CATEGORIES = DEFAULT_CATEGORIES.map(c => c.category);

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
