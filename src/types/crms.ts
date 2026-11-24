export enum UserRole {
  Customer = 'customer',
  Staff = 'staff',
  Admin = 'admin',
}

export enum PortalTab {
  Customer = 'customer',
  Staff = 'staff',
  Admin = 'admin',
  Architecture = 'architecture',
}

export enum CarType {
  Sedan = 'Sedan',
  SUV = 'SUV',
  Hatchback = 'Hatchback',
  Luxury = 'Luxury',
}

export enum FuelType {
  Petrol = 'Petrol',
  Diesel = 'Diesel',
  EV = 'EV',
  CNG = 'CNG',
}

export enum CarStatus {
  Available = 'Available',
  Reserved = 'Reserved',
  Rented = 'Rented',
  Maintenance = 'Maintenance',
}

export enum BookingStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Approved = 'Approved',
  Rented = 'Rented',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Rejected = 'Rejected',
}

export enum PaymentStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Failed = 'Failed',
}

export enum PaymentMethod {
  UPI = 'UPI',
  Card = 'Credit/Debit Card',
  NetBanking = 'Net Banking',
}

export interface SessionUser {
  role: UserRole;
  userId: string;
  name: string;
  email: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNo: string;
  password: string;
  docVerified: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface Car {
  id: string;
  name: string;
  model: string;
  brand: string;
  type: CarType;
  regNo: string;
  dailyRate: number;
  seats: number;
  fuel: FuelType;
  status: CarStatus;
  note: string;
  imageUrl?: string;
}

export interface Booking {
  id: string;
  customerId: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  extraCharges: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  createdAt: string;
  inspectionNote?: string;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  timestamp: string;
}

export interface CRMSState {
  session: SessionUser | null;
  customers: Customer[];
  staff: StaffMember[];
  admins: AdminUser[];
  cars: Car[];
  bookings: Booking[];
  payments: PaymentRecord[];
}
