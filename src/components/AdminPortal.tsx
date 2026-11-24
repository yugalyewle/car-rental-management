import React, { useState } from 'react';
import { Download, Plus, Printer } from 'lucide-react';
import {
  Booking,
  BookingStatus,
  Car,
  CarStatus,
  Customer,
  PaymentRecord,
  PaymentStatus,
} from '../types/crms';
import { exportBookingsCSV, formatINR } from '../utils/crmsHelpers';
import { StatusLabel } from './StatusLabel';

interface AdminPortalProps {
  bookings: Booking[];
  cars: Car[];
  customers: Customer[];
  payments: PaymentRecord[];
  onBookingDecision: (
    bookingId: string,
    decision: BookingStatus.Approved | BookingStatus.Rejected
  ) => void;
  onShowInvoice: (bookingId: string) => void;
  onOpenCarModal: (carId?: string) => void;
  onDeleteCar: (carId: string) => void;
  onToggleCustomerVerify: (customerId: string, verified: boolean) => void;
}

type AdminSubTab = 'bookings' | 'cars' | 'customers' | 'payments' | 'reports';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  bookings,
  cars,
  customers,
  payments,
  onBookingDecision,
  onShowInvoice,
  onOpenCarModal,
  onDeleteCar,
  onToggleCustomerVerify,
}) => {
  const [subTab, setSubTab] = useState<AdminSubTab>('bookings');

  const totalBookings = bookings.length;
  const availableCars = cars.filter(
    (c) => c.status === CarStatus.Available
  ).length;
  const reservedCars = cars.filter(
    (c) => c.status === CarStatus.Reserved
  ).length;
  const rentedCars = cars.filter((c) => c.status === CarStatus.Rented).length;
  const maintenanceCars = cars.filter(
    (c) => c.status === CarStatus.Maintenance
  ).length;
  const completedRentals = bookings.filter(
    (b) => b.status === BookingStatus.Completed
  ).length;
  const totalRevenue = bookings
    .filter(
      (b) =>
        b.paymentStatus === PaymentStatus.Paid &&
        b.status !== BookingStatus.Cancelled &&
        b.status !== BookingStatus.Rejected
    )
    .reduce((sum, b) => sum + b.totalAmount + (b.extraCharges || 0), 0);

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Admin Control Console
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Manage branch fleet inventory and daily rates, review booking approvals, audit payment logs, and export operational reports.
          </p>
        </div>
      </div>

      {/* 4-Column KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            Total Bookings
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {totalBookings}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            Available / Rented Fleet
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {availableCars} / {rentedCars}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            Returned Rentals
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {completedRentals}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            Total Paid Revenue
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {formatINR(totalRevenue)}
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="inline-flex flex-wrap items-center p-1 bg-slate-100 rounded-lg border border-slate-200 no-print">
        {(
          [
            { id: 'bookings', label: 'Review Bookings' },
            { id: 'cars', label: 'Manage Fleet & Rates' },
            { id: 'customers', label: 'Customer Records' },
            { id: 'payments', label: 'Payment Ledger' },
            { id: 'reports', label: 'Reports (FR12)' },
          ] as Array<{ id: AdminSubTab; label: string }>
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id)}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === tab.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings Tab */}
      {subTab === 'bookings' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Booking Review & Approvals
            </h2>
            <p className="text-sm text-slate-500">
              Approve or reject pending and confirmed customer reservations.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {bookings.map((b) => {
                  const cust = customers.find((c) => c.id === b.customerId);
                  const car = cars.find((c) => c.id === b.carId);
                  const canReview = [
                    BookingStatus.Pending,
                    BookingStatus.Confirmed,
                  ].includes(b.status);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/75">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900 tabular-nums">
                        {b.id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-900">
                        {cust?.name ?? b.customerId}
                      </td>
                      <td className="py-3.5 px-4 text-slate-900">
                        {car ? `${car.brand} ${car.name}` : b.carId}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                        {b.startDate} → {b.endDate}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        {formatINR(b.totalAmount + (b.extraCharges || 0))}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusLabel status={b.paymentStatus} />
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusLabel status={b.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {canReview ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  onBookingDecision(
                                    b.id,
                                    BookingStatus.Approved
                                  )
                                }
                                className="px-2.5 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onBookingDecision(
                                    b.id,
                                    BookingStatus.Rejected
                                  )
                                }
                                className="px-2.5 py-1 text-xs font-medium text-red-700 bg-white border border-slate-200 hover:bg-red-50 rounded-md cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onShowInvoice(b.id)}
                              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md cursor-pointer"
                            >
                              View Invoice
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cars CRUD Tab (FR3) */}
      {subTab === 'cars' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Fleet Inventory & Daily Rates (FR3)
              </h2>
              <p className="text-sm text-slate-500">
                Add new vehicles, update daily rental rates, or modify fleet availability.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenCarModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add Vehicle
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Reg No</th>
                  <th className="py-3 px-4">Specs</th>
                  <th className="py-3 px-4 text-right">Daily Rate</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {cars.map((car) => (
                  <tr key={car.id} className="hover:bg-slate-50/75">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900 tabular-nums">
                      {car.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">
                        {car.brand} {car.name}
                      </div>
                      <div className="text-xs text-slate-500">{car.model}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{car.type}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                      {car.regNo}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 tabular-nums">
                      {car.seats} Seats · {car.fuel}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {formatINR(car.dailyRate)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusLabel status={car.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenCarModal(car.id)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCar(car.id)}
                          className="px-2.5 py-1 text-xs font-medium text-red-700 bg-white border border-slate-200 hover:bg-red-50 rounded-md cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {subTab === 'customers' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Registered Customer Records
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Driving License</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/75">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900 tabular-nums">
                      {c.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {c.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{c.email}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 tabular-nums">
                      {c.phone}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                      {c.licenseNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusLabel
                        status={c.docVerified ? 'Verified' : 'Unverified'}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          onToggleCustomerVerify(c.id, !c.docVerified)
                        }
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md cursor-pointer"
                      >
                        {c.docVerified ? 'Revoke' : 'Verify'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {subTab === 'payments' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Payment Transactions
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Payment ID</th>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/75">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900 tabular-nums">
                      {p.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 tabular-nums">
                      {p.bookingId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{p.method}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {formatINR(p.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusLabel status={p.status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 tabular-nums">
                      {p.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab (FR12) */}
      {subTab === 'reports' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">
                CRMS Summary Reports (FR12)
              </h2>
              <p className="text-sm text-slate-500">
                Fleet utilization, booking status breakdown, and verified revenue metrics.
              </p>
            </div>
            <div className="flex items-center gap-2 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <Printer className="w-4 h-4" aria-hidden="true" />
                Print Report
              </button>
              <button
                type="button"
                onClick={() => exportBookingsCSV(bookings)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">
                Operational Breakdown
              </h3>
              <dl className="divide-y divide-slate-100 text-sm">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-600">Total Fleet Size</dt>
                  <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                    {cars.length} vehicles
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-600">Available Cars</dt>
                  <dd className="font-mono font-semibold text-emerald-700 tabular-nums">
                    {availableCars}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-600">Reserved Cars</dt>
                  <dd className="font-mono font-semibold text-amber-700 tabular-nums">
                    {reservedCars}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-600">Currently Rented Cars</dt>
                  <dd className="font-mono font-semibold text-blue-700 tabular-nums">
                    {rentedCars}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-600">In Maintenance</dt>
                  <dd className="font-mono font-semibold text-red-700 tabular-nums">
                    {maintenanceCars}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">
                Financial & Customer Metrics
              </h3>
              <dl className="divide-y divide-slate-100 text-sm">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-600">Total Bookings</dt>
                  <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                    {totalBookings}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-600">Completed / Returned Rentals</dt>
                  <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                    {completedRentals}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-600">Registered Customers</dt>
                  <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                    {customers.length}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-600">
                    Total Paid Revenue (incl. extra charges)
                  </dt>
                  <dd className="font-mono font-bold text-slate-900 tabular-nums">
                    {formatINR(totalRevenue)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
