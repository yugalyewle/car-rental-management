import { Booking, BookingStatus } from '../types/crms';

export const STORAGE_KEY = 'crms_indore_state_v1';

export function nextId(prefix: string, items: Array<{ id: string }>): string {
  const nums = items.map((item) => parseInt(item.id.replace(/\D/g, ''), 10) || 0);
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

export function calcRentalDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000);
  return Math.max(1, diffDays);
}

/**
 * NFR9: Prevent overlapping rental bookings for the same vehicle
 */
export function hasDateOverlap(
  bookings: Booking[],
  carId: string,
  startDate: string,
  endDate: string,
  ignoreBookingId?: string
): boolean {
  const blockingStatuses = new Set<BookingStatus>([
    BookingStatus.Pending,
    BookingStatus.Confirmed,
    BookingStatus.Approved,
    BookingStatus.Rented,
  ]);

  return bookings.some((booking) => {
    if (booking.carId !== carId) return false;
    if (ignoreBookingId && booking.id === ignoreBookingId) return false;
    if (!blockingStatuses.has(booking.status)) return false;
    return startDate <= booking.endDate && endDate >= booking.startDate;
  });
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function exportBookingsCSV(bookings: Booking[]): void {
  const headers = [
    'BookingID',
    'CustomerID',
    'CarID',
    'StartDate',
    'EndDate',
    'RentalAmount',
    'ExtraCharges',
    'GrandTotal',
    'PaymentStatus',
    'BookingStatus',
  ];

  const rows = bookings.map((b) => [
    b.id,
    b.customerId,
    b.carId,
    b.startDate,
    b.endDate,
    String(b.totalAmount),
    String(b.extraCharges || 0),
    String(b.totalAmount + (b.extraCharges || 0)),
    b.paymentStatus,
    b.status,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'CRMS_Indore_Report.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
