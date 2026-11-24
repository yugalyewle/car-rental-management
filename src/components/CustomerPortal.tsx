import React, { useMemo, useState } from 'react';
import { Car as CarIcon, Search, SlidersHorizontal } from 'lucide-react';
import {
  Booking,
  BookingStatus,
  Car,
  CarStatus,
  CarType,
  PaymentStatus,
  SessionUser,
  UserRole,
} from '../types/crms';
import { formatINR, hasDateOverlap } from '../utils/crmsHelpers';
import { StatusLabel } from './StatusLabel';

interface CustomerPortalProps {
  cars: Car[];
  bookings: Booking[];
  session: SessionUser | null;
  onOpenBooking: (carId: string, startDate: string, endDate: string) => void;
  onOpenPayment: (bookingId: string) => void;
  onShowInvoice: (bookingId: string) => void;
  onCancelBooking: (bookingId: string) => void;
  onOpenAuth: () => void;
}

type CustomerSubTab = 'browse' | 'history';

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  cars,
  bookings,
  session,
  onOpenBooking,
  onOpenPayment,
  onShowInvoice,
  onCancelBooking,
  onOpenAuth,
}) => {
  const [subTab, setSubTab] = useState<CustomerSubTab>('browse');
  const [filterType, setFilterType] = useState<string>('');
  const [filterBrand, setFilterBrand] = useState<string>('');
  const [filterMaxPrice, setFilterMaxPrice] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterStart, setFilterStart] = useState<string>('');
  const [filterEnd, setFilterEnd] = useState<string>('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const resetFilters = () => {
    setFilterType('');
    setFilterBrand('');
    setFilterMaxPrice('');
    setFilterStatus('');
    setFilterStart('');
    setFilterEnd('');
  };

  const filteredCars = useMemo(() => {
    const maxPrice = parseFloat(filterMaxPrice);
    const query = filterBrand.trim().toLowerCase();

    return cars.filter((car) => {
      if (filterType && car.type !== filterType) return false;
      if (
        query &&
        !(
          car.brand.toLowerCase().includes(query) ||
          car.name.toLowerCase().includes(query) ||
          car.model.toLowerCase().includes(query)
        )
      ) {
        return false;
      }
      if (!Number.isNaN(maxPrice) && car.dailyRate > maxPrice) return false;
      if (filterStatus && car.status !== filterStatus) return false;
      if (
        filterStart &&
        filterEnd &&
        filterStart <= filterEnd &&
        hasDateOverlap(bookings, car.id, filterStart, filterEnd)
      ) {
        return false;
      }
      return true;
    });
  }, [
    cars,
    bookings,
    filterType,
    filterBrand,
    filterMaxPrice,
    filterStatus,
    filterStart,
    filterEnd,
  ]);

  const myBookings = useMemo(() => {
    if (!session || session.role !== UserRole.Customer) return [];
    return bookings.filter((b) => b.customerId === session.userId);
  }, [bookings, session]);

  return (
    <section className="space-y-8">
      {/* Page Title & Sub-navigation */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Indore Branch Fleet
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Browse verified vehicles, filter by rental dates with conflict checks, and manage your reservations and invoices.
          </p>
        </div>

        <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setSubTab('browse')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'browse'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Search & Book Fleet
          </button>
          <button
            type="button"
            onClick={() => setSubTab('history')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
              subTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Bookings ({myBookings.length})
          </button>
        </div>
      </div>

      {subTab === 'browse' ? (
        <div className="space-y-8">
          {/* FR4: Search & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <SlidersHorizontal
                  className="w-4 h-4 text-slate-500"
                  aria-hidden="true"
                />
                <span>Filter Vehicles & Check Availability</span>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-medium text-blue-700 hover:text-blue-800 cursor-pointer whitespace-nowrap"
              >
                Reset All Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label
                  htmlFor="filter-type"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Vehicle Type
                </label>
                <select
                  id="filter-type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
                >
                  <option value="">All Types</option>
                  <option value={CarType.Sedan}>Sedan</option>
                  <option value={CarType.SUV}>SUV</option>
                  <option value={CarType.Hatchback}>Hatchback</option>
                  <option value={CarType.Luxury}>Luxury</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="filter-brand"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Brand or Model
                </label>
                <div className="relative">
                  <Search
                    className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="filter-brand"
                    type="text"
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    placeholder="Maruti, Hyundai, Tata"
                    className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="filter-price"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Max Rate (₹/day)
                </label>
                <input
                  id="filter-price"
                  type="number"
                  min={0}
                  value={filterMaxPrice}
                  onChange={(e) => setFilterMaxPrice(e.target.value)}
                  placeholder="e.g. 3000"
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 tabular-nums focus:outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label
                  htmlFor="filter-status"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Status
                </label>
                <select
                  id="filter-status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700"
                >
                  <option value="">All Statuses</option>
                  <option value={CarStatus.Available}>Available Only</option>
                  <option value={CarStatus.Reserved}>Reserved</option>
                  <option value={CarStatus.Rented}>Rented</option>
                  <option value={CarStatus.Maintenance}>Maintenance</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="filter-start"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Pickup Date
                </label>
                <input
                  id="filter-start"
                  type="date"
                  value={filterStart}
                  onChange={(e) => setFilterStart(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label
                  htmlFor="filter-end"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Return Date
                </label>
                <input
                  id="filter-end"
                  type="date"
                  value={filterEnd}
                  onChange={(e) => setFilterEnd(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:border-blue-700"
                />
              </div>
            </div>
          </div>

          {/* 3-Column Vehicle Grid */}
          {filteredCars.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <p className="text-base font-medium text-slate-900">
                No vehicles match your current filters
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try clearing your date range or raising the maximum daily rate.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map((car) => {
                const isAvailable = car.status === CarStatus.Available;
                const imgFailed = failedImages[car.id] || !car.imageUrl;

                return (
                  <article
                    key={car.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                      {imgFailed ? (
                        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center p-6 text-slate-200">
                          <CarIcon
                            className="w-10 h-10 text-slate-400 mb-2"
                            aria-hidden="true"
                          />
                          <span className="font-display text-sm font-semibold text-white">
                            {car.brand} {car.name}
                          </span>
                          <span className="text-xs text-slate-400">
                            {car.model} · {car.type}
                          </span>
                        </div>
                      ) : (
                        <img
                          src={car.imageUrl}
                          alt={`${car.brand} ${car.name} ${car.model}`}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedImages((prev) => ({
                              ...prev,
                              [car.id]: true,
                            }))
                          }
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                        <span>{car.brand}</span>
                        <span aria-hidden="true">·</span>
                        <span>{car.type}</span>
                        <span aria-hidden="true">·</span>
                        <span>{car.seats} Seats</span>
                        <span aria-hidden="true">·</span>
                        <span>{car.fuel}</span>
                      </div>

                      <div className="mt-1.5 flex items-start justify-between gap-3">
                        <h2 className="font-display text-lg font-semibold text-slate-900 leading-snug">
                          {car.name} {car.model}
                        </h2>
                        <StatusLabel status={car.status} />
                      </div>

                      <div className="mt-2 font-mono text-xs text-slate-500 tabular-nums">
                        {car.regNo} · {car.id}
                      </div>

                      {car.note && (
                        <p className="mt-2.5 text-xs text-slate-600">
                          {car.note}
                        </p>
                      )}

                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                        <div>
                          <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                            {formatINR(car.dailyRate)}
                          </span>
                          <span className="text-xs text-slate-500"> / day</span>
                        </div>

                        <button
                          type="button"
                          disabled={!isAvailable}
                          onClick={() =>
                            onOpenBooking(car.id, filterStart, filterEnd)
                          }
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                            isAvailable
                              ? 'bg-blue-700 text-white hover:bg-blue-800 cursor-pointer'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {isAvailable ? 'View & Book' : car.status}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Booking & Payment History
              </h2>
              <p className="text-sm text-slate-500">
                Download printable invoices, complete pending payments, or cancel before pickup.
              </p>
            </div>
          </div>

          {!session || session.role !== UserRole.Customer ? (
            <div className="p-12 text-center">
              <p className="text-base font-medium text-slate-900">
                Customer login required
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Sign in with a customer account to view your reservations and invoices.
              </p>
              <button
                type="button"
                onClick={onOpenAuth}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
              >
                Sign In as Customer
              </button>
            </div>
          ) : myBookings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-base font-medium text-slate-900">
                No bookings created yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Search available Indore Branch vehicles to create your first reservation.
              </p>
              <button
                type="button"
                onClick={() => setSubTab('browse')}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
              >
                Browse Fleet
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Rental Period</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {myBookings.map((booking) => {
                    const car = cars.find((c) => c.id === booking.carId);
                    const canPay =
                      booking.paymentStatus !== PaymentStatus.Paid &&
                      booking.status !== BookingStatus.Cancelled &&
                      booking.status !== BookingStatus.Rejected;
                    const canCancel = [
                      BookingStatus.Pending,
                      BookingStatus.Confirmed,
                      BookingStatus.Approved,
                    ].includes(booking.status);

                    return (
                      <tr key={booking.id} className="hover:bg-slate-50/75">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-900 tabular-nums">
                          {booking.id}
                        </td>
                        <td className="py-3.5 px-4 text-slate-900">
                          {car
                            ? `${car.brand} ${car.name} (${car.regNo})`
                            : booking.carId}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                          {booking.startDate} → {booking.endDate}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                          {formatINR(
                            booking.totalAmount + (booking.extraCharges || 0)
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusLabel status={booking.paymentStatus} />
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusLabel status={booking.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onShowInvoice(booking.id)}
                              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md cursor-pointer"
                            >
                              Invoice
                            </button>
                            {canPay && (
                              <button
                                type="button"
                                onClick={() => onOpenPayment(booking.id)}
                                className="px-2.5 py-1 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md cursor-pointer"
                              >
                                Pay Now
                              </button>
                            )}
                            {canCancel && (
                              <button
                                type="button"
                                onClick={() => onCancelBooking(booking.id)}
                                className="px-2.5 py-1 text-xs font-medium text-red-700 bg-white border border-slate-200 hover:bg-red-50 rounded-md cursor-pointer"
                              >
                                Cancel
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
          )}
        </div>
      )}
    </section>
  );
};
