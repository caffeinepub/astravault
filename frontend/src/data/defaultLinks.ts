import {
  Building2,
  Mail,
  TrendingUp,
  Wrench,
  CreditCard,
  Globe,
  Train,
  FileText,
  Shield,
  Camera,
  Smartphone,
  Calendar,
  LucideIcon,
} from 'lucide-react';

export interface DefaultLink {
  name: string;
  url: string;
  iconName: string;
}

export interface CategoryGroup {
  category: string;
  icon: LucideIcon;
  links: DefaultLink[];
}

export const iconMap: Record<string, LucideIcon> = {
  Building2,
  Mail,
  TrendingUp,
  Wrench,
  CreditCard,
  Globe,
  Train,
  FileText,
  Shield,
  Camera,
  Smartphone,
  Calendar,
};

// Aliases for backward compatibility
export const ICON_MAP = iconMap;
export const AVAILABLE_ICONS = Object.keys(iconMap);

export const defaultLinkCategories: CategoryGroup[] = [
  {
    category: 'BANK',
    icon: Building2,
    links: [
      {
        name: 'State Bank of India',
        url: 'https://sbi.bank.in/',
        iconName: 'Building2',
      },
      {
        name: 'Punjab National Bank',
        url: 'https://www.pnbindia.in/',
        iconName: 'Building2',
      },
      {
        name: 'India Post Payments Bank',
        url: 'https://www.ippbonline.com/',
        iconName: 'Building2',
      },
    ],
  },
  {
    category: 'EMAIL',
    icon: Mail,
    links: [
      {
        name: 'Gmail',
        url: 'https://mail.google.com',
        iconName: 'Mail',
      },
      {
        name: 'Google Calendar',
        url: 'https://calendar.google.com',
        iconName: 'Calendar',
      },
    ],
  },
  {
    category: 'INVESTMENT',
    icon: TrendingUp,
    links: [
      {
        name: 'CoinDCX',
        url: 'https://coindcx.com/',
        iconName: 'TrendingUp',
      },
      {
        name: 'ET Money',
        url: 'https://www.etmoney.com/',
        iconName: 'TrendingUp',
      },
      {
        name: 'Groww',
        url: 'https://groww.in/',
        iconName: 'TrendingUp',
      },
    ],
  },
  {
    category: 'SERVICES',
    icon: Wrench,
    links: [
      {
        name: 'IRCTC',
        url: 'https://www.irctc.co.in/',
        iconName: 'Train',
      },
      {
        name: 'DigiLocker',
        url: 'https://www.digilocker.gov.in/',
        iconName: 'FileText',
      },
      {
        name: 'LIC Digital',
        url: 'https://lifeinsurance.adityabirlacapital.com/',
        iconName: 'Shield',
      },
      {
        name: 'mAadhaar',
        url: 'https://uidai.gov.in/en/',
        iconName: 'FileText',
      },
      {
        name: 'V380 Pro',
        url: 'https://play.google.com/store/apps/details?id=com.v380',
        iconName: 'Camera',
      },
      {
        name: 'Xiaomi Home',
        url: 'http://play.google.com/store/apps/details?id=com.xiaomi.smarthome&hl=en_IN',
        iconName: 'Smartphone',
      },
    ],
  },
  {
    category: 'PAYMENTS',
    icon: CreditCard,
    links: [
      {
        name: 'Google Pay',
        url: 'https://pay.google.com/',
        iconName: 'CreditCard',
      },
      {
        name: 'PhonePe',
        url: 'https://www.phonepe.com/',
        iconName: 'CreditCard',
      },
    ],
  },
];

// Alias for backward compatibility
export const DEFAULT_CATEGORIES = defaultLinkCategories;

export const ALL_CATEGORIES = defaultLinkCategories.map(c => c.category);
