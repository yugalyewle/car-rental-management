import React, { useEffect, useState } from 'react';
import { Printer, X } from 'lucide-react';
import {
  Booking,
  Car,
  CarStatus,
  CarType,
  Customer,
  FuelType,
  PaymentMethod,
  UserRole,
} from '../types/crms';
import { calcRentalDays, formatINR, hasDateOverlap } from '../utils/crmsHelpers';
import { StatusLabel } from './StatusLabel';

/* ================= AUTH MODAL ================= */
interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (role: UserRole, email: string, password: string) => void;
  onRegister: (payload: {
    name: string;
    email: string;
    phone: string;
    licenseNo: string;
    password: string;
  }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  open,
  onClose,
  onLogin,
  onRegister,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>(UserRole.Customer);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regPassword, setRegPassword] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h2
            id="auth-modal-title"
            className="font-display text-lg font-semibold text-slate-900"
          >
            {mode === 'login' ? 'Sign In to CRMS' : 'Customer Registration'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 inline-flex w-full p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register Customer
          </button>
        </div>

        {mode === 'login' ? (
          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              onLogin(role, email, password);
            }}
          >
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
              >
                <option value={UserRole.Customer}>Customer</option>
                <option value={UserRole.Staff}>Rental Staff</option>
                <option value={UserRole.Admin}>Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aniket@crms.in"
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
              Demo credentials: Customer{' '}
              <span className="font-mono text-slate-700">aniket@crms.in / 1234</span>,
              Staff{' '}
              <span className="font-mono text-slate-700">staff@crms.in / staff123</span>,
              Admin{' '}
              <span className="font-mono text-slate-700">admin@crms.in / admin123</span>.
            </p>
          </form>
        ) : (
          <form
            className="mt-5 space-y-3.5"
            onSubmit={(e) => {
              e.preventDefault();
              onRegister({
                name: regName,
                email: regEmail,
                phone: regPhone,
                licenseNo: regLicense,
                password: regPassword,
              });
              setRegName('');
              setRegEmail('');
              setRegPhone('');
              setRegLicense('');
              setRegPassword('');
            }}
          >
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phone (10 digits)
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Driving License
                </label>
                <input
                  type="text"
                  required
                  value={regLicense}
                  onChange={(e) => setRegLicense(e.target.value)}
                  placeholder="MP09XXXX1234"
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={4}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
            >
              Create Account & Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

/* ================= BOOKING MODAL ================= */
interface BookingModalProps {
  car: Car | null;
  bookings: Booking[];
  initialStart: string;
  initialEnd: string;
  onClose: () => void;
  onConfirmBooking: (carId: string, startDate: string, endDate: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  car,
  bookings,
  initialStart,
  initialEnd,
  onClose,
  onConfirmBooking,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const twoDays = new Date(Date.now() + 2 * 86400000)
    .toISOString()
    .split('T')[0];

  const [startDate, setStartDate] = useState(initialStart || today);
  const [endDate, setEndDate] = useState(initialEnd || twoDays);

  useEffect(() => {
    setStartDate(initialStart || today);
    setEndDate(initialEnd || twoDays);
  }, [car, initialStart, initialEnd, today, twoDays]);

  if (!car) return null;

  const invalidRange = startDate > endDate;
  const overlapDetected =
    !invalidRange && hasDateOverlap(bookings, car.id, startDate, endDate);
  const days = calcRentalDays(startDate, endDate);
  const totalCost = days * car.dailyRate;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h2
            id="booking-modal-title"
            className="font-display text-lg font-semibold text-slate-900"
          >
            Reserve {car.brand} {car.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 py-3 px-4 bg-slate-50 rounded-lg grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
          <div>
            <span className="text-slate-500">Model:</span>{' '}
            <strong className="text-slate-900">{car.model}</strong>
          </div>
          <div>
            <span className="text-slate-500">Category:</span>{' '}
            <strong className="text-slate-900">{car.type}</strong>
          </div>
          <div>
            <span className="text-slate-500">Reg No:</span>{' '}
            <strong className="font-mono text-slate-900">{car.regNo}</strong>
          </div>
          <div>
            <span className="text-slate-500">Specs:</span>{' '}
            <strong className="text-slate-900">
              {car.seats} Seats · {car.fuel}
            </strong>
          </div>
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (invalidRange || overlapDetected) return;
            onConfirmBooking(car.id, startDate, endDate);
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Pickup Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:border-blue-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Return Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:border-blue-700"
              />
            </div>
          </div>

          <div className="py-3.5 px-4 bg-slate-50 rounded-lg text-sm">
            {invalidRange ? (
              <p className="text-red-700 font-medium">
                Return date cannot be earlier than pickup date.
              </p>
            ) : overlapDetected ? (
              <p className="text-red-700 font-medium">
                NFR9 Conflict: This vehicle already has an overlapping reservation in the selected date range.
              </p>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-slate-600 tabular-nums">
                  {days} day(s) × {formatINR(car.dailyRate)}
                </span>
                <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                  Total: {formatINR(totalCost)}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={invalidRange || overlapDetected}
            className={`w-full py-2.5 text-sm font-medium rounded-lg transition-colors ${
              invalidRange || overlapDetected
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-blue-700 text-white hover:bg-blue-800 cursor-pointer'
            }`}
          >
            Confirm Booking & Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

/* ================= PAYMENT MODAL ================= */
interface PaymentModalProps {
  booking: Booking | null;
  car: Car | null;
  onClose: () => void;
  onProcessPayment: (
    bookingId: string,
    method: PaymentMethod,
    isSuccess: boolean
  ) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  booking,
  car,
  onClose,
  onProcessPayment,
}) => {
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.UPI);

  if (!booking || !car) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h2
            id="payment-modal-title"
            className="font-display text-lg font-semibold text-slate-900"
          >
            CRMS Payment Gateway
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 py-3.5 px-4 bg-slate-50 rounded-lg space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Booking ID</span>
            <span className="font-mono font-medium text-slate-900 tabular-nums">
              {booking.id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Vehicle</span>
            <span className="text-slate-900">
              {car.brand} {car.name} ({car.regNo})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Period</span>
            <span className="font-mono text-xs text-slate-700 tabular-nums">
              {booking.startDate} → {booking.endDate}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
            <span className="font-medium text-slate-900">Amount Payable</span>
            <span className="font-mono text-lg font-bold text-blue-700 tabular-nums">
              {formatINR(booking.totalAmount)}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Payment Method
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
          >
            <option value={PaymentMethod.UPI}>UPI</option>
            <option value={PaymentMethod.Card}>Credit / Debit Card</option>
            <option value={PaymentMethod.NetBanking}>Net Banking</option>
          </select>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onProcessPayment(booking.id, method, true)}
            className="py-2.5 px-3 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
          >
            Simulate Success
          </button>
          <button
            type="button"
            onClick={() => onProcessPayment(booking.id, method, false)}
            className="py-2.5 px-3 text-sm font-medium text-red-700 bg-white border border-slate-200 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            Simulate Failure
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= INVOICE MODAL (FR7) ================= */
interface InvoiceModalProps {
  booking: Booking | null;
  customer: Customer | null;
  car: Car | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  booking,
  customer,
  car,
  onClose,
}) => {
  if (!booking || !customer || !car) return null;

  const grandTotal = booking.totalAmount + (booking.extraCharges || 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2
              id="invoice-modal-title"
              className="font-display text-lg font-semibold text-slate-900"
            >
              Booking Confirmation & Invoice
            </h2>
            <p className="text-xs text-slate-500">CRMS Indore Branch</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer no-print"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500">Booking Reference</span>
              <div className="font-mono text-base font-bold text-slate-900 tabular-nums">
                {booking.id}
              </div>
            </div>
            <StatusLabel status={booking.status} />
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-slate-500">Customer</div>
              <div className="font-medium text-slate-900">{customer.name}</div>
              <div className="font-mono text-xs text-slate-600 tabular-nums">
                {customer.phone}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Driving License</div>
              <div className="font-mono text-slate-900">
                {customer.licenseNo}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-slate-500">Vehicle</div>
              <div className="font-medium text-slate-900">
                {car.brand} {car.name} ({car.model})
              </div>
              <div className="font-mono text-xs text-slate-600">
                {car.regNo}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Rental Period</div>
              <div className="font-mono text-xs text-slate-900 tabular-nums">
                {booking.startDate} → {booking.endDate}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Base Rental Charges</span>
              <span className="font-mono tabular-nums">
                {formatINR(booking.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Extra / Damage Charges</span>
              <span className="font-mono tabular-nums">
                {formatINR(booking.extraCharges || 0)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-semibold text-slate-900">
              <span>Grand Total ({booking.paymentStatus})</span>
              <span className="font-mono text-lg tabular-nums">
                {formatINR(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            Print Invoice
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= STAFF INSPECTION MODAL ================= */
interface InspectionModalProps {
  bookingId: string | null;
  onClose: () => void;
  onSubmitInspection: (
    bookingId: string,
    hasDamage: boolean,
    extraCharges: number,
    note: string
  ) => void;
}

export const InspectionModal: React.FC<InspectionModalProps> = ({
  bookingId,
  onClose,
  onSubmitInspection,
}) => {
  const [hasDamage, setHasDamage] = useState(false);
  const [extraCharges, setExtraCharges] = useState('0');
  const [note, setNote] = useState('');

  useEffect(() => {
    setHasDamage(false);
    setExtraCharges('0');
    setNote('');
  }, [bookingId]);

  if (!bookingId) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspection-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h2
            id="inspection-modal-title"
            className="font-display text-lg font-semibold text-slate-900"
          >
            Return Vehicle Inspection ({bookingId})
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const parsedCharges = hasDamage
              ? Math.max(0, parseFloat(extraCharges) || 0)
              : 0;
            onSubmitInspection(bookingId, hasDamage, parsedCharges, note);
          }}
        >
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Inspection Outcome
            </label>
            <select
              value={hasDamage ? 'yes' : 'no'}
              onChange={(e) => setHasDamage(e.target.value === 'yes')}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
            >
              <option value="no">
                Clean & Undamaged — Return to Available
              </option>
              <option value="yes">
                Damage / Fault Found — Send to Maintenance
              </option>
            </select>
          </div>

          {hasDamage && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Extra Damage / Cleaning Charges (₹)
              </label>
              <input
                type="number"
                min={0}
                value={extraCharges}
                onChange={(e) => setExtraCharges(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-none focus:border-blue-700"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Inspection Notes
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Odometer reading, fuel level, exterior condition..."
              className="w-full p-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
          >
            Complete Inspection & Close Rental
          </button>
        </form>
      </div>
    </div>
  );
};

/* ================= ADMIN CAR FORM MODAL ================= */
interface CarFormModalProps {
  open: boolean;
  editingCar: Car | null;
  onClose: () => void;
  onSaveCar: (
    payload: Omit<Car, 'id' | 'note' | 'imageUrl'>,
    existingId?: string
  ) => void;
}

export const CarFormModal: React.FC<CarFormModalProps> = ({
  open,
  editingCar,
  onClose,
  onSaveCar,
}) => {
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [brand, setBrand] = useState('');
  const [type, setType] = useState<CarType>(CarType.Sedan);
  const [regNo, setRegNo] = useState('');
  const [dailyRate, setDailyRate] = useState('1500');
  const [seats, setSeats] = useState('5');
  const [fuel, setFuel] = useState<FuelType>(FuelType.Petrol);
  const [status, setStatus] = useState<CarStatus>(CarStatus.Available);

  useEffect(() => {
    if (editingCar) {
      setName(editingCar.name);
      setModel(editingCar.model);
      setBrand(editingCar.brand);
      setType(editingCar.type);
      setRegNo(editingCar.regNo);
      setDailyRate(String(editingCar.dailyRate));
      setSeats(String(editingCar.seats));
      setFuel(editingCar.fuel);
      setStatus(editingCar.status);
    } else {
      setName('');
      setModel('');
      setBrand('');
      setType(CarType.Sedan);
      setRegNo('');
      setDailyRate('1500');
      setSeats('5');
      setFuel(FuelType.Petrol);
      setStatus(CarStatus.Available);
    }
  }, [editingCar, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="car-form-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h2
            id="car-form-title"
            className="font-display text-lg font-semibold text-slate-900"
          >
            {editingCar ? `Edit Vehicle (${editingCar.id})` : 'Add New Vehicle'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSaveCar(
              {
                name: name.trim(),
                model: model.trim(),
                brand: brand.trim(),
                type,
                regNo: regNo.trim().toUpperCase(),
                dailyRate: Math.max(300, parseFloat(dailyRate) || 1500),
                seats: Math.max(2, parseInt(seats, 10) || 5),
                fuel,
                status,
              },
              editingCar?.id
            );
          }}
        >
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Maruti Suzuki"
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Car Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Swift"
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Model / Trim
              </label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="2025 VXi"
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Registration No
              </label>
              <input
                type="text"
                required
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                placeholder="MP09CA1234"
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CarType)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
              >
                <option value={CarType.Sedan}>Sedan</option>
                <option value={CarType.SUV}>SUV</option>
                <option value={CarType.Hatchback}>Hatchback</option>
                <option value={CarType.Luxury}>Luxury</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Fuel Type
              </label>
              <select
                value={fuel}
                onChange={(e) => setFuel(e.target.value as FuelType)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
              >
                <option value={FuelType.Petrol}>Petrol</option>
                <option value={FuelType.Diesel}>Diesel</option>
                <option value={FuelType.EV}>Electric (EV)</option>
                <option value={FuelType.CNG}>CNG</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Daily Rate (₹)
              </label>
              <input
                type="number"
                required
                min={300}
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-none focus:border-blue-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Seating Capacity
              </label>
              <input
                type="number"
                required
                min={2}
                max={12}
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-none focus:border-blue-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Availability Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CarStatus)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
            >
              <option value={CarStatus.Available}>Available</option>
              <option value={CarStatus.Reserved}>Reserved</option>
              <option value={CarStatus.Rented}>Rented</option>
              <option value={CarStatus.Maintenance}>Maintenance</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
          >
            {editingCar ? 'Save Changes' : 'Add Vehicle to Fleet'}
          </button>
        </form>
      </div>
    </div>
  );
};
