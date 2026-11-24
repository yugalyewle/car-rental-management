import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Car, CarStatus } from '../types/crms';
import { StatusLabel } from './StatusLabel';

interface SystemModelViewProps {
  cars: Car[];
}

const STATE_NODES: Array<{
  status: CarStatus;
  trigger: string;
  nextHint: string;
}> = [
  {
    status: CarStatus.Available,
    trigger: 'Initial state / Clean return / Repair completed',
    nextHint: 'Transitions to Reserved upon confirmed booking payment',
  },
  {
    status: CarStatus.Reserved,
    trigger: 'Payment success / Admin approval',
    nextHint: 'Transitions to Rented when Staff verifies license & hands over keys',
  },
  {
    status: CarStatus.Rented,
    trigger: 'Staff pickup handover',
    nextHint: 'Transitions to Return Inspection when customer returns vehicle',
  },
  {
    status: CarStatus.Maintenance,
    trigger: 'Damage found during Return Inspection',
    nextHint: 'Transitions back to Available when Staff marks repair completed',
  },
];

const EXPERIMENT_TRACEABILITY = [
  {
    exp: 'Experiment 2 (SRS)',
    artifact: 'FR1–FR12 & NFR9 (Data Integrity)',
    implementation:
      'Registration/Login, multi-criteria vehicle search, printable invoices, payment simulation, cancellation, FR12 reports, and overlapping rental-date prevention.',
  },
  {
    exp: 'Experiment 3 (DFD)',
    artifact: 'Level 0 & Level 1 Data Flow',
    implementation:
      'Bidirectional workflows linking Customer, Admin, Staff, and Payment Gateway across Vehicles, Reservations, Customers, and Payments stores.',
  },
  {
    exp: 'Experiment 4 (Use Case)',
    artifact: 'Customer, Admin, Staff & Payment Actors',
    implementation:
      'Dedicated role portals and simulated Payment Gateway branching into Paid confirmation or Failed retry flows.',
  },
  {
    exp: 'Experiment 5 (Class & Object)',
    artifact: 'User, Customer, Admin, Car, Reservation, Payment',
    implementation:
      'Pre-seeded Indore Branch instance: Aniket (C001), Maruti Suzuki Swift (CAR01 @ ₹1,500/day), Booking R001, and Payment P001.',
  },
  {
    exp: 'Experiment 6 (Behavioral)',
    artifact: 'Swimlane & Vehicle State Chart',
    implementation:
      'Enforced Staff license verification → Handover (Rented) → Return Inspection (Available or Maintenance) → Repair Completed.',
  },
  {
    exp: 'Experiments 7–9 (Architecture)',
    artifact: 'Sequence, Component & Deployment Models',
    implementation:
      'Modular TypeScript React components, persistent browser state store, printable confirmation views, and CSV report export.',
  },
];

export const SystemModelView: React.FC<SystemModelViewProps> = ({ cars }) => {
  const [selectedState, setSelectedState] = useState<CarStatus | null>(null);

  const inspectedCars = selectedState
    ? cars.filter((c) => c.status === selectedState)
    : cars;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          SRS & UML System Model
        </h1>
        <p className="mt-1 text-sm text-slate-600 max-w-2xl">
          Live traceability mapping CS3CO40 Software Engineering Experiments 2 through 9 directly to the active application state.
        </p>
      </div>

      {/* Live Vehicle State Machine (Experiment 6) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Live Vehicle Lifecycle State Machine (Experiment 6)
            </h2>
            <p className="text-sm text-slate-500">
              Select any state node below to filter the live fleet currently occupying that state.
            </p>
          </div>
          {selectedState && (
            <button
              type="button"
              onClick={() => setSelectedState(null)}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 cursor-pointer"
            >
              Show All States
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATE_NODES.map((node, idx) => {
            const count = cars.filter((c) => c.status === node.status).length;
            const isSelected = selectedState === node.status;

            return (
              <button
                key={node.status}
                type="button"
                onClick={() =>
                  setSelectedState(isSelected ? null : node.status)
                }
                className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-blue-700 bg-blue-50/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <StatusLabel status={node.status} />
                  <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                    {count}
                  </span>
                </div>
                <p className="mt-2.5 text-xs font-medium text-slate-800">
                  {node.trigger}
                </p>
                <p className="mt-1 text-xs text-slate-500 flex items-start gap-1">
                  {idx < STATE_NODES.length - 1 && (
                    <ArrowRight
                      className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400"
                      aria-hidden="true"
                    />
                  )}
                  <span>{node.nextHint}</span>
                </p>
              </button>
            );
          })}
        </div>

        <div className="border-t border-slate-200 pt-5">
          <div className="text-xs font-semibold text-slate-600 mb-3">
            {selectedState
              ? `Vehicles currently in ${selectedState} state (${inspectedCars.length})`
              : `All Fleet Vehicles (${inspectedCars.length})`}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-2.5 px-4">Car ID</th>
                  <th className="py-2.5 px-4">Vehicle</th>
                  <th className="py-2.5 px-4">Registration</th>
                  <th className="py-2.5 px-4">Current State</th>
                  <th className="py-2.5 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {inspectedCars.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 px-4 text-center text-slate-500"
                    >
                      No vehicles currently in {selectedState} state.
                    </td>
                  </tr>
                ) : (
                  inspectedCars.map((car) => (
                    <tr key={car.id}>
                      <td className="py-2.5 px-4 font-mono text-slate-900 tabular-nums">
                        {car.id}
                      </td>
                      <td className="py-2.5 px-4 text-slate-900">
                        {car.brand} {car.name} ({car.model})
                      </td>
                      <td className="py-2.5 px-4 font-mono text-xs text-slate-600">
                        {car.regNo}
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusLabel status={car.status} />
                      </td>
                      <td className="py-2.5 px-4 text-xs text-slate-500">
                        {car.note || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SRS & UML Traceability Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Experiments 2–9 Traceability Matrix
          </h2>
          <p className="text-sm text-slate-500">
            Mapping software engineering specification artifacts to working modules.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Experiment</th>
                <th className="py-3 px-4">Model / Diagram</th>
                <th className="py-3 px-4">Implemented System Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {EXPERIMENT_TRACEABILITY.map((row) => (
                <tr key={row.exp} className="hover:bg-slate-50/75">
                  <td className="py-3.5 px-4 font-medium text-slate-900 whitespace-nowrap">
                    {row.exp}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                    {row.artifact}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {row.implementation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
