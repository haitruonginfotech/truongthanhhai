// WordPress menu observed on 2026-09-16. Enable anchors as sections are built.
export const mainNavigation = [
  { label: 'Trang chủ', href: '/', enabled: true },
  { label: 'Dịch vụ', href: '/#services', enabled: true },
  { label: 'Sự cố thường gặp', href: '/#issues', enabled: true },
  { label: 'Quy trình', href: '/#process', enabled: true },
  { label: 'Bảng giá', href: '/#pricing', enabled: true },
  { label: 'Câu hỏi thường gặp', href: '/#faqs', enabled: true },
  { label: 'Liên hệ', href: '/#contact', enabled: true },
] as const;

export const footerServices = [
  'WordPress Maintenance', 'OpenCart Maintenance', 'Shopify Maintenance',
  'Gỡ malware & bảo mật', 'Tối ưu tốc độ',
];
export const footerExplore = [
  'Sự cố thường gặp', 'Quy trình', 'Bảng giá', 'Khách hàng', 'Kiểm tra website miễn phí',
];
// The source website uses "#". Do not invent profile URLs.
export const socialLinks: { label: string; icon: 'facebook' | 'linkedin'; href: string | null }[] = [
  { label: 'Facebook', icon: 'facebook', href: null },
  { label: 'LinkedIn', icon: 'linkedin', href: null },
];
