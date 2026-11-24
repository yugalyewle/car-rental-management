/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import {
  Booking,
  BookingStatus,
  Car,
  CarStatus,
  CRMSState,
  PaymentMethod,
  PaymentStatus,
  PortalTab,
  UserRole,
} from './types/crms';
import { DEFAULT_CRMS_STATE } from './data/seedData';
import {
  calcRentalDays,
  hasDateOverlap,
  nextId,
  STORAGE_KEY,
} from './utils/crmsHelpers';
import { TopBar } from './components/TopBar';
import { WorkspaceSessionBar } from './components/WorkspaceSessionBar';
import { CustomerPortal } from './components/CustomerPortal';
import { StaffPortal } from './components/StaffPortal';
import { AdminPortal } from './components/AdminPortal';
import { SystemModelView } from './components/SystemModelView';
import {
  AuthModal,
  BookingModal,
  CarFormModal,
  InspectionModal,
  InvoiceModal,
  PaymentModal,
} from './components/Modals';

interface ToastItem {
  id: number;
  message: string;
  tone: 'info' | 'success' | 'error';
}

function loadInitialState(): CRMSState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as CRMSState;
    }
  } catch {
    // Fallback to default state if storage is unavailable
  }
  return structuredClone(DEFAULT_CRMS_STATE);
}

export default function App() {
  const [state, setState] = useState<CRMSState>(loadInitialState);
  const [activePortal, setActivePortal] = useState<PortalTab>(
    PortalTab.Customer
  );
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [bookingContext, setBookingContext] = useState<{
    carId: string;
    startDate: string;
    endDate: string;
  } | null>(null);
  const [paymentBookingId, setPaymentBookingId] = useState<string | null>(null);
  const [invoiceBookingId, setInvoiceBookingId] = useState<string | null>(null);
  const [inspectionBookingId, setInspectionBookingId] = useState<string | null>(
    null
  );
  const [carModalState, setCarModalState] = useState<{
    open: boolean;
    carId?: string;
  }>({ open: false });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const notify = (
    message: string,
    tone: 'info' | 'success' | 'error' = 'info'
  ) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  /* ================= AUTH HANDLERS ================= */
  const handleQuickLogin = (role: UserRole) => {
    if (role === UserRole.Customer) {
      const c = state.customers[0];
      setState((prev) => ({
        ...prev,
        session: {
          role: UserRole.Customer,
          userId: c.id,
          name: c.name,
          email: c.email,
        },
      }));
      setActivePortal(PortalTab.Customer);
      notify(`Signed in as ${c.name} (Customer).`, 'success');
    } else if (role === UserRole.Staff) {
      const s = state.staff[0];
      setState((prev) => ({
        ...prev,
        session: {
          role: UserRole.Staff,
          userId: s.id,
          name: s.name,
          email: s.email,
        },
      }));
      setActivePortal(PortalTab.Staff);
      notify(`Signed in as ${s.name} (Staff).`, 'success');
    } else {
      const a = state.admins[0];
      setState((prev) => ({
        ...prev,
        session: {
          role: UserRole.Admin,
          userId: a.id,
          name: a.name,
          email: a.email,
        },
      }));
      setActivePortal(PortalTab.Admin);
      notify(`Signed in as ${a.name} (Admin).`, 'success');
    }
  };

  const handleLogin = (role: UserRole, email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const pool =
      role === UserRole.Customer
        ? state.customers
        : role === UserRole.Staff
          ? state.staff
          : state.admins;

    const user = pool.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );
    if (!user) {
      notify('Invalid email or password for the selected role.', 'error');
      return;
    }

    setState((prev) => ({
      ...prev,
      session: {
        role,
        userId: user.id,
        name: user.name,
        email: user.email,
      },
    }));
    setAuthModalOpen(false);
    setActivePortal(
      role === UserRole.Customer
        ? PortalTab.Customer
        : role === UserRole.Staff
          ? PortalTab.Staff
          : PortalTab.Admin
    );
    notify(`Welcome back, ${user.name}.`, 'success');
  };

  const handleRegister = (payload: {
    name: string;
    email: string;
    phone: string;
    licenseNo: string;
    password: string;
  }) => {
    const exists = state.customers.some(
      (c) => c.email.toLowerCase() === payload.email.trim().toLowerCase()
    );
    if (exists) {
      notify('An account with this email already exists.', 'error');
      return;
    }

    const newCustomerId = nextId('C', state.customers);
    const newCustomer = {
      id: newCustomerId,
      name: payload.name.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      licenseNo: payload.licenseNo.trim().toUpperCase(),
      password: payload.password,
      docVerified: false,
    };

    setState((prev) => ({
      ...prev,
      customers: [...prev.customers, newCustomer],
      session: {
        role: UserRole.Customer,
        userId: newCustomer.id,
        name: newCustomer.name,
        email: newCustomer.email,
      },
    }));
    setAuthModalOpen(false);
    setActivePortal(PortalTab.Customer);
    notify(`Account ${newCustomer.id} created and signed in.`, 'success');
  };

  const handleLogout = () => {
    setState((prev) => ({ ...prev, session: null }));
    notify('Signed out of CRMS session.');
  };

  const handleResetDemo = () => {
    const fresh = structuredClone(DEFAULT_CRMS_STATE);
    setState(fresh);
    setActivePortal(PortalTab.Customer);
    notify('Demo data restored to initial Indore Branch dataset.', 'success');
  };

  /* ================= BOOKING & PAYMENT HANDLERS ================= */
  const handleOpenBooking = (
    carId: string,
    startDate: string,
    endDate: string
  ) => {
    if (!state.session || state.session.role !== UserRole.Customer) {
      notify('Sign in as a Customer to book a vehicle.', 'error');
      setAuthModalOpen(true);
      return;
    }
    setBookingContext({ carId, startDate, endDate });
  };

  const handleConfirmBooking = (
    carId: string,
    startDate: string,
    endDate: string
  ) => {
    if (!state.session || state.session.role !== UserRole.Customer) {
      notify('Customer login required.', 'error');
      return;
    }
    const car = state.cars.find((c) => c.id === carId);
    if (!car || car.status !== CarStatus.Available) {
      notify('Selected vehicle is no longer available.', 'error');
      return;
    }
    if (startDate > endDate) {
      notify('Return date cannot precede pickup date.', 'error');
      return;
    }
    if (hasDateOverlap(state.bookings, carId, startDate, endDate)) {
      notify('Overlapping reservation detected for this vehicle (NFR9).', 'error');
      return;
    }

    const days = calcRentalDays(startDate, endDate);
    const bookingId = nextId('R', state.bookings);
    const newBooking: Booking = {
      id: bookingId,
      customerId: state.session.userId,
      carId,
      startDate,
      endDate,
      totalAmount: days * car.dailyRate,
      extraCharges: 0,
      paymentStatus: PaymentStatus.Pending,
      status: BookingStatus.Pending,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setState((prev) => ({
      ...prev,
      bookings: [newBooking, ...prev.bookings],
    }));
    setBookingContext(null);
    setPaymentBookingId(bookingId);
  };

  const handleProcessPayment = (
    bookingId: string,
    method: PaymentMethod,
    isSuccess: boolean
  ) => {
    const targetBooking = state.bookings.find((b) => b.id === bookingId);
    if (!targetBooking) return;

    const paymentId = nextId('P', state.payments);
    const newPayment = {
      id: paymentId,
      bookingId,
      method,
      amount: targetBooking.totalAmount,
      status: isSuccess ? PaymentStatus.Paid : PaymentStatus.Failed,
      timestamp: new Date().toLocaleString(),
    };

    setState((prev) => ({
      ...prev,
      payments: [newPayment, ...prev.payments],
      bookings: prev.bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              paymentStatus: isSuccess
                ? PaymentStatus.Paid
                : PaymentStatus.Failed,
              status: isSuccess ? BookingStatus.Confirmed : b.status,
            }
          : b
      ),
      cars: isSuccess
        ? prev.cars.map((c) =>
            c.id === targetBooking.carId
              ? {
                  ...c,
                  status: CarStatus.Reserved,
                  note: `Reserved for booking ${bookingId}`,
                }
              : c
          )
        : prev.cars,
    }));

    if (isSuccess) {
      setPaymentBookingId(null);
      setInvoiceBookingId(bookingId);
      notify(
        `Payment ${paymentId} succeeded. Booking ${bookingId} confirmed.`,
        'success'
      );
    } else {
      notify('Payment failed. Please retry or select another method.', 'error');
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    const target = state.bookings.find((b) => b.id === bookingId);
    if (
      !target ||
      [
        BookingStatus.Rented,
        BookingStatus.Completed,
        BookingStatus.Cancelled,
      ].includes(target.status)
    ) {
      return;
    }

    setState((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: BookingStatus.Cancelled } : b
      ),
      cars: prev.cars.map((c) =>
        c.id === target.carId && c.status === CarStatus.Reserved
          ? { ...c, status: CarStatus.Available, note: '' }
          : c
      ),
    }));
    notify(`Booking ${bookingId} cancelled.`);
  };

  /* ================= STAFF WORKFLOW HANDLERS ================= */
  const handleVerifyCustomerDoc = (customerId: string, verified: boolean) => {
    setState((prev) => ({
      ...prev,
      customers: prev.customers.map((c) =>
        c.id === customerId ? { ...c, docVerified: verified } : c
      ),
    }));
    notify(
      `Customer ${customerId} license ${verified ? 'verified' : 'marked unverified'}.`,
      verified ? 'success' : 'info'
    );
  };

  const handleHandoverVehicle = (bookingId: string) => {
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    const customer = state.customers.find((c) => c.id === booking.customerId);
    if (!customer?.docVerified) {
      notify(
        'Verify customer driving license before vehicle handover.',
        'error'
      );
      return;
    }

    setState((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: BookingStatus.Rented } : b
      ),
      cars: prev.cars.map((c) =>
        c.id === booking.carId
          ? { ...c, status: CarStatus.Rented, note: `Rented (${bookingId})` }
          : c
      ),
    }));
    notify(`Vehicle handed over for booking ${bookingId}.`, 'success');
  };

  const handleSubmitInspection = (
    bookingId: string,
    hasDamage: boolean,
    extraCharges: number,
    note: string
  ) => {
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setState((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              extraCharges,
              status: BookingStatus.Completed,
              inspectionNote: note,
            }
          : b
      ),
      cars: prev.cars.map((c) =>
        c.id === booking.carId
          ? {
              ...c,
              status: hasDamage ? CarStatus.Maintenance : CarStatus.Available,
              note: hasDamage
                ? note || `Damage reported on return (${bookingId})`
                : '',
            }
          : c
      ),
    }));
    setInspectionBookingId(null);
    notify(
      `Rental ${bookingId} closed. Vehicle marked ${hasDamage ? 'Maintenance' : 'Available'}.`,
      hasDamage ? 'info' : 'success'
    );
  };

  const handleCompleteMaintenance = (carId: string) => {
    setState((prev) => ({
      ...prev,
      cars: prev.cars.map((c) =>
        c.id === carId ? { ...c, status: CarStatus.Available, note: '' } : c
      ),
    }));
    notify(`Vehicle ${carId} repair completed and marked Available.`, 'success');
  };

  /* ================= ADMIN HANDLERS ================= */
  const handleAdminBookingDecision = (
    bookingId: string,
    decision: BookingStatus.Approved | BookingStatus.Rejected
  ) => {
    const target = state.bookings.find((b) => b.id === bookingId);
    if (!target) return;

    setState((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: decision } : b
      ),
      cars: prev.cars.map((c) => {
        if (c.id !== target.carId) return c;
        if (decision === BookingStatus.Approved) {
          return {
            ...c,
            status: CarStatus.Reserved,
            note: `Approved booking ${bookingId}`,
          };
        }
        if (c.status === CarStatus.Reserved) {
          return { ...c, status: CarStatus.Available, note: '' };
        }
        return c;
      }),
    }));
    notify(
      `Booking ${bookingId} ${decision.toLowerCase()}.`,
      decision === BookingStatus.Approved ? 'success' : 'error'
    );
  };

  const handleSaveCar = (
    payload: Omit<Car, 'id' | 'note' | 'imageUrl'>,
    existingId?: string
  ) => {
    if (existingId) {
      setState((prev) => ({
        ...prev,
        cars: prev.cars.map((c) =>
          c.id === existingId ? { ...c, ...payload } : c
        ),
      }));
      notify(`Vehicle ${existingId} updated.`, 'success');
    } else {
      const newCar: Car = {
        id: nextId('CAR', state.cars),
        ...payload,
        note: '',
      };
      setState((prev) => ({
        ...prev,
        cars: [...prev.cars, newCar],
      }));
      notify(`Vehicle ${newCar.id} added to fleet.`, 'success');
    }
    setCarModalState({ open: false });
  };

  const handleDeleteCar = (carId: string) => {
    setState((prev) => ({
      ...prev,
      cars: prev.cars.filter((c) => c.id !== carId),
    }));
    notify(`Vehicle ${carId} removed from fleet.`);
  };

  /* ================= ACTIVE MODAL ENTITIES ================= */
  const bookingCar = bookingContext
    ? state.cars.find((c) => c.id === bookingContext.carId) ?? null
    : null;
  const paymentBooking = paymentBookingId
    ? state.bookings.find((b) => b.id === paymentBookingId) ?? null
    : null;
  const paymentCar = paymentBooking
    ? state.cars.find((c) => c.id === paymentBooking.carId) ?? null
    : null;
  const invoiceBooking = invoiceBookingId
    ? state.bookings.find((b) => b.id === invoiceBookingId) ?? null
    : null;
  const invoiceCustomer = invoiceBooking
    ? state.customers.find((c) => c.id === invoiceBooking.customerId) ?? null
    : null;
  const invoiceCar = invoiceBooking
    ? state.cars.find((c) => c.id === invoiceBooking.carId) ?? null
    : null;
  const editingCar = carModalState.carId
    ? state.cars.find((c) => c.id === carModalState.carId) ?? null
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar
        activePortal={activePortal}
        onSelectPortal={setActivePortal}
        session={state.session}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <WorkspaceSessionBar
        session={state.session}
        onQuickLogin={handleQuickLogin}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onResetDemo={handleResetDemo}
      />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-8">
        {activePortal === PortalTab.Customer && (
          <CustomerPortal
            cars={state.cars}
            bookings={state.bookings}
            session={state.session}
            onOpenBooking={handleOpenBooking}
            onOpenPayment={(bookingId) => setPaymentBookingId(bookingId)}
            onShowInvoice={(bookingId) => setInvoiceBookingId(bookingId)}
            onCancelBooking={handleCancelBooking}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activePortal === PortalTab.Staff && (
          <StaffPortal
            bookings={state.bookings}
            cars={state.cars}
            customers={state.customers}
            onVerifyCustomerDoc={handleVerifyCustomerDoc}
            onHandoverVehicle={handleHandoverVehicle}
            onOpenInspection={(bookingId) => setInspectionBookingId(bookingId)}
            onCompleteMaintenance={handleCompleteMaintenance}
          />
        )}

        {activePortal === PortalTab.Admin && (
          <AdminPortal
            bookings={state.bookings}
            cars={state.cars}
            customers={state.customers}
            payments={state.payments}
            onBookingDecision={handleAdminBookingDecision}
            onShowInvoice={(bookingId) => setInvoiceBookingId(bookingId)}
            onOpenCarModal={(carId) => setCarModalState({ open: true, carId })}
            onDeleteCar={handleDeleteCar}
            onToggleCustomerVerify={handleVerifyCustomerDoc}
          />
        )}

        {activePortal === PortalTab.Architecture && (
          <SystemModelView cars={state.cars} />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white no-print">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>
            CRMS Fleet · Indore Branch · CS3CO40 Software Engineering Project
          </span>
          <span>SRS Experiments 2–9 Implementation</span>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <BookingModal
        car={bookingCar}
        bookings={state.bookings}
        initialStart={bookingContext?.startDate ?? ''}
        initialEnd={bookingContext?.endDate ?? ''}
        onClose={() => setBookingContext(null)}
        onConfirmBooking={handleConfirmBooking}
      />

      <PaymentModal
        booking={paymentBooking}
        car={paymentCar}
        onClose={() => setPaymentBookingId(null)}
        onProcessPayment={handleProcessPayment}
      />

      <InvoiceModal
        booking={invoiceBooking}
        customer={invoiceCustomer}
        car={invoiceCar}
        onClose={() => setInvoiceBookingId(null)}
      />

      <InspectionModal
        bookingId={inspectionBookingId}
        onClose={() => setInspectionBookingId(null)}
        onSubmitInspection={handleSubmitInspection}
      />

      <CarFormModal
        open={carModalState.open}
        editingCar={editingCar}
        onClose={() => setCarModalState({ open: false })}
        onSaveCar={handleSaveCar}
      />

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm no-print"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-lg text-sm font-medium shadow-lg border ${
                toast.tone === 'error'
                  ? 'bg-red-950 text-white border-red-800'
                  : toast.tone === 'success'
                    ? 'bg-emerald-950 text-white border-emerald-800'
                    : 'bg-slate-900 text-white border-slate-700'
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
