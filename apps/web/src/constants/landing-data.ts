import { 
  QrCode, BarChart3, Users, UtensilsCrossed, 
  Zap, Globe, ShoppingCart, GitBranch, Smartphone,
  ShieldCheck, Clock, Layers
} from 'lucide-react';

export const METADATA = {
  title: 'Tableo | Premium Digital Menu & Order Management for Restaurants',
  description: 'Transform your restaurant with Tableo. Rapid QR menus, live order tracking, and multi-branch analytics. Built for modern dining in Ghana.',
  keywords: 'digital menu, QR ordering, restaurant management, Ghana tech, SaaS restaurant, order tracking, Tableo',
};

export const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
];

export const FEATURES = [
  { 
    icon: QrCode, 
    id: 'qr-menus',
    title: 'Precision QR Technology', 
    desc: 'Generate unique, beautiful QR codes for every branch. High-res printing support included.' 
  },
  { 
    icon: Smartphone, 
    id: 'mobile-first',
    title: 'Mobile-First Experience', 
    desc: 'No apps. Just scan. Our menus load in milliseconds on any mobile browser.' 
  },
  { 
    icon: ShoppingCart, 
    id: 'live-orders',
    title: 'Real-time Order Stream', 
    desc: 'Instant notifications the moment a customer orders. Synchronized across all staff devices.' 
  },
  { 
    icon: BarChart3, 
    id: 'analytics',
    title: 'Unified Analytics', 
    desc: 'Deep insights into your revenue, top items, and busy hours across all locations.' 
  },
  { 
    icon: Layers, 
    id: 'multi-branch',
    title: 'Multi-Branch Control', 
    desc: 'Manage 10+ locations from a single login. Shared menus with local price overrides.' 
  },
  { 
    icon: ShieldCheck, 
    id: 'secure-payments',
    title: 'Secure Payments', 
    desc: 'Integrated with Paystack for seamless, secure mobile money and card transactions.' 
  },
];

export const STEPS = [
  { 
    n: '01', 
    icon: Globe, 
    title: 'Onboard in Minutes', 
    desc: 'Set up your restaurant profile and brand identity in less than 120 seconds.' 
  },
  { 
    n: '02', 
    icon: UtensilsCrossed, 
    title: 'Digitalize Your Menu', 
    desc: 'Upload items, set categories, and add stunning visuals of your craft.' 
  },
  { 
    n: '03', 
    icon: QrCode, 
    title: 'Deploy QR Points', 
    desc: 'Download and place your branded QR codes at tables or service points.' 
  },
  { 
    n: '04', 
    icon: ShoppingCart, 
    title: 'Automate Orders', 
    desc: 'Watch your kitchen efficiency skyrocket as orders flow in automatically.' 
  },
];

export const PLANS = [
  {
    name: 'Starter', 
    price: '80', 
    desc: 'Perfect for small, emerging restaurants.',
    highlight: false, 
    cta: 'Select Starter',
    features: ['1 Branch', 'Digital QR Menu', 'Unlimited Scans', 'Basic Analytics'],
  },
  {
    name: 'Pro', 
    price: '200', 
    desc: 'For thriving multi-location businesses.',
    highlight: true, 
    cta: 'Start with Pro',
    features: ['Up to 3 Branches', 'Online Ordering', 'Live Order Stream', 'Advanced Reports', 'Priority Support'],
  },
  {
    name: 'Business', 
    price: '450', 
    desc: 'For larger franchises and chains.',
    highlight: false, 
    cta: 'Contact Sales',
    features: ['Unlimited Branches', 'Full Team Access', 'Custom Domain', 'Paystack Integration', 'API Access'],
  },
];

export const FOOTER_LINKS = [
  { 
    title: 'Platform', 
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How it Works', href: '#how-it-works' },
      { label: 'Pricing', href: '#pricing' },
    ]
  },
  { 
    title: 'Company', 
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
    ]
  },
  { 
    title: 'Legal', 
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ]
  },
];

export const RESTAURANTS = [
  'KFC Ghana', 'Gorilla Food', 'Chez Nous', 'FoodHub', 'Urban Grill', 
  'Spice Island', 'Mama\'s Kitchen', 'Accra Bites', 'Fork & Knife', 
  'The Porch', 'Kpakpakpa', 'Kofi\'s Corner', 'Sobolo Bar', 'Chow House'
];
