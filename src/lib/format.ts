import type { EventStatus } from '@/db/types';

export function formatPrice(price: number): string {
  if (price <= 0) return 'Free';
  return `${price.toLocaleString('en-US').replace(/,/g, ' ')} UZS`;
}

export const STATUS_LABELS: Record<EventStatus, string> = {
  upcoming: 'Upcoming',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
