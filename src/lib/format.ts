import type { EventStatus } from '@/db/types';

export function formatPrice(price: number): string {
  if (price <= 0) return 'Bepul';
  return `${price.toLocaleString('en-US').replace(/,/g, ' ')} soʻm`;
}

export const STATUS_LABELS: Record<EventStatus, string> = {
  upcoming: 'Kutilmoqda',
  ongoing: 'Davom etmoqda',
  completed: 'Yakunlangan',
  cancelled: 'Bekor qilingan',
};
