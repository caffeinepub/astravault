import {
  Landmark,
  Mail,
  TrendingUp,
  Globe,
  CreditCard,
  Shield,
  Home,
  Calendar,
  Train,
  FileText,
  Smartphone,
  DollarSign,
  BarChart2,
  Camera,
  LucideIcon,
} from 'lucide-react';

export interface DefaultLink {
  id: string;
  name: string;
  url: string;
  category: string;
  iconName: string;
  target?: string;
}

export interface LinkCategory {
  id: string;
  label: string;
  links: DefaultLink[];
}

export const iconMap: Record<string, LucideIcon> = {
  Landmark,
  Mail,
  TrendingUp,
  Globe,
  CreditCard,
  Shield,
  Home,
  Calendar,
  Train,
  FileText,
  Smartphone,
  DollarSign,
  BarChart2,
  Camera,
};

export const AVAILABLE_ICONS = Object.keys(iconMap);

export const defaultLinkCategories: LinkCategory[] = [
  {
    id: 'BANK',
    label: 'Banking',
    links: [
      {
        id: 'sbi',
        name: 'State Bank of India',
        url: 'https://sbi.bank.in/',
        category: 'BANK',
        iconName: 'Landmark',
        target: '_blank',
      },
      {
        id: 'pnb',
        name: 'Punjab National Bank',
        url: 'https://pnbindia.in',
        category: 'BANK',
        iconName: 'Landmark',
        target: '_blank',
      },
      {
        id: 'ippb',
        name: 'India Post Payments Bank',
        url: 'https://ippbonline.com',
        category: 'BANK',
        iconName: 'Landmark',
        target: '_blank',
      },
    ],
  },
  {
    id: 'EMAIL',
    label: 'Email & Calendar',
    links: [
      {
        id: 'gmail',
        name: 'Gmail',
        url: 'https://mail.google.com',
        category: 'EMAIL',
        iconName: 'Mail',
        target: '_blank',
      },
      {
        id: 'gcalendar',
        name: 'Google Calendar',
        url: 'https://calendar.google.com',
        category: 'EMAIL',
        iconName: 'Calendar',
        target: '_blank',
      },
    ],
  },
  {
    id: 'INVESTMENT',
    label: 'Investment',
    links: [
      {
        id: 'coindcx',
        name: 'CoinDCX',
        url: 'https://coindcx.com',
        category: 'INVESTMENT',
        iconName: 'TrendingUp',
        target: '_blank',
      },
      {
        id: 'etmoney',
        name: 'ET Money',
        url: 'https://etmoney.com',
        category: 'INVESTMENT',
        iconName: 'DollarSign',
        target: '_blank',
      },
      {
        id: 'groww',
        name: 'Groww',
        url: 'https://groww.in',
        category: 'INVESTMENT',
        iconName: 'BarChart2',
        target: '_blank',
      },
    ],
  },
  {
    id: 'SERVICES',
    label: 'Services',
    links: [
      {
        id: 'irctc',
        name: 'IRCTC',
        url: 'https://irctc.co.in',
        category: 'SERVICES',
        iconName: 'Train',
        target: '_blank',
      },
      {
        id: 'digilocker',
        name: 'DigiLocker',
        url: 'https://digilocker.gov.in',
        category: 'SERVICES',
        iconName: 'FileText',
        target: '_blank',
      },
      {
        id: 'lic',
        name: 'LIC Digital',
        url: 'https://licindia.in',
        category: 'SERVICES',
        iconName: 'Shield',
        target: '_blank',
      },
      {
        id: 'maadhaar',
        name: 'mAadhaar',
        url: 'https://uidai.gov.in/en/',
        category: 'SERVICES',
        iconName: 'FileText',
        target: '_blank',
      },
      {
        id: 'xiaomihome',
        name: 'Xiaomi Home',
        url: 'http://play.google.com/store/apps/details?id=com.xiaomi.smarthome&hl=en_IN',
        category: 'SERVICES',
        iconName: 'Home',
        target: '_blank',
      },
      {
        id: 'v380pro',
        name: 'V380 Pro',
        url: 'https://v380.cn',
        category: 'SERVICES',
        iconName: 'Camera',
        target: '_blank',
      },
    ],
  },
  {
    id: 'PAYMENTS',
    label: 'Payments',
    links: [
      {
        id: 'googlepay',
        name: 'Google Pay',
        url: 'https://pay.google.com',
        category: 'PAYMENTS',
        iconName: 'CreditCard',
        target: '_blank',
      },
      {
        id: 'phonepe',
        name: 'PhonePe',
        url: 'https://phonepe.com',
        category: 'PAYMENTS',
        iconName: 'Smartphone',
        target: '_blank',
      },
    ],
  },
];

// Backward-compatible aliases
export const ICON_MAP = iconMap;
export const ALL_CATEGORIES = defaultLinkCategories.map((c) => c.id);
export const DEFAULT_CATEGORIES = ALL_CATEGORIES;
