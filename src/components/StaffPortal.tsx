import React from 'react';
import {
  Booking,
  BookingStatus,
  Car,
  CarStatus,
  Customer,
} from '../types/crms';
import { StatusLabel } from './StatusLabel';

interface StaffPortalProps {
  bookings: Booking[];
  cars: Car[];
  customers: Customer[];
  onVerifyCustomerDoc: (customerId: string, isVerified: boolean) => void;
  onHandoverVehicle: (bookingId: string) => void;
  onOpenInspection: (bookingId: string) => void;
  onCompleteMaintenance: (carId: string) => void;
}

export const StaffPortal: React.FC<StaffPortalProps> = ({
  bookings,
  cars,
  customers,
  onVerifyCustomerDoc,
  onHandoverVehicle,
  onOpenInspection,
  onCompleteMaintenance,
}) => {
  const activeWorkflows = bookings.filter((b) =>
    [
      BookingStatus.Confirmed,
      BookingStatus.Approved,
      BookingStatus.Rented,
    ].includes(b.status)
  );

  const maintenanceQueue = cars.filter(
    (c) => c.status === CarStatus.Maintenance
  );

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Rental Staff Operations
        </h1>
        <p className="mt-1 text-sm text-slate-600 max-w-2xl">
          Verify driving licenses, execute vehicle pickup handovers, perform return inspections, and clear vehicles from maintenance.
        </p>
      </div>

      {/* Pickup & Return Workflow Queue */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Pickup Handovers & Active Rentals
            </h2>
            <p className="text-sm text-slate-500">
              Document verification is required prior to handing over keys (`Reserved → Rented`).
            </p>
          </div>
          <span className="font-mono text-xs text-slate-500 tabular-nums">
            {activeWorkflows.length} active record(s)
          </span>
        </div>

        {activeWorkflows.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No confirmed pickups or active rentals awaiting staff action.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Customer & License</th>
                  <th className="py-3 px-4">License Status</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Rental Dates</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Workflow Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {activeWorkflows.map((booking) => {
                  const customer = customers.find(
                    (c) => c.id === booking.customerId
                  );
                  const car = cars.find((c) => c.id === booking.carId);

                  return (
                    <tr key={booking.id} className="hover:bg-slate-50/75">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900 tabular-nums">
                        {booking.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">
                          {customer?.name ?? booking.customerId}
                        </div>
                        <div className="font-mono text-xs text-slate-500">
                          {customer?.licenseNo ?? '—'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusLabel
                          status={
                            customer?.docVerified ? 'Verified' : 'Unverified'
                          }
                        />
                      </td>
                      <td className="py-3.5 px-4 text-slate-900">
                        {car
                          ? `${car.brand} ${car.name} (${car.regNo})`
                          : booking.carId}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                        {booking.startDate} → {booking.endDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusLabel status={booking.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {customer && !customer.docVerified && (
                            <button
                              type="button"
                              onClick={() =>
                                onVerifyCustomerDoc(customer.id, true)
                              }
                              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md cursor-pointer whitespace-nowrap"
                            >
                              Verify License
                            </button>
                          )}
                          {[
                            BookingStatus.Confirmed,
                            BookingStatus.Approved,
                          ].includes(booking.status) && (
                            <button
                              type="button"
                              onClick={() => onHandoverVehicle(booking.id)}
                              className="px-2.5 py-1 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md cursor-pointer whitespace-nowrap"
                            >
                              Handover Car
                            </button>
                          )}
                          {booking.status === BookingStatus.Rented && (
                            <button
                              type="button"
                              onClick={() => onOpenInspection(booking.id)}
                              className="px-2.5 py-1 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md cursor-pointer whitespace-nowrap"
                            >
                              Inspect Return
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

      {/* Maintenance Queue */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Vehicle Maintenance Queue
            </h2>
            <p className="text-sm text-slate-500">
              Vehicles flagged during return inspection or scheduled servicing (`Maintenance → Available`).
            </p>
          </div>
          <span className="font-mono text-xs text-slate-500 tabular-nums">
            {maintenanceQueue.length} vehicle(s)
          </span>
        </div>

        {maintenanceQueue.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            All fleet vehicles are operational with zero pending maintenance items.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Car ID</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Reg. Number</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Inspection Note</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {maintenanceQueue.map((car) => (
                  <tr key={car.id} className="hover:bg-slate-50/75">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900 tabular-nums">
                      {car.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-900">
                      {car.brand} {car.name} ({car.model})
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      {car.regNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusLabel status={car.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {car.note || 'Routine inspection'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onCompleteMaintenance(car.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md cursor-pointer whitespace-nowrap"
                      >
                        Mark Repair Completed
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
