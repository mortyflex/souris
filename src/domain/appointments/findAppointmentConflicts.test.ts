import { describe, expect, it } from "vitest";

import type { Appointment, AppointmentStatus } from "./appointment.types";
import { findAppointmentConflicts } from "./findAppointmentConflicts";

function createAppointment({
  id,
  startAt,
  durationMinutes = 30,
  staffMemberId = "staff-1",
  status = "SCHEDULED",
}: {
  id: string;
  startAt: string;
  durationMinutes?: number;
  staffMemberId?: string;
  status?: AppointmentStatus;
}): Appointment {
  return {
    id,
    businessId: "business-1",
    clientId: `client-${id}`,
    staffMemberId,
    startAt: new Date(startAt),
    status,
    items: [
      {
        id: `item-${id}`,
        serviceId: `service-${id}`,
        order: 0,
        serviceName: "Service",
        serviceType: "SERVICE",
        price: 30,
        phases: [
          {
            id: `phase-${id}`,
            name: "Service",
            durationMinutes,
            requiresStaff: true,
          },
        ],
      },
    ],
  };
}

describe("findAppointmentConflicts", () => {
  it("returns appointments that conflict with the candidate", () => {
    const candidate = createAppointment({
      id: "candidate",
      startAt: "2026-08-16T09:15:00.000Z",
    });

    const existingAppointments = [
      createAppointment({
        id: "appointment-1",
        startAt: "2026-08-16T09:00:00.000Z",
      }),
      createAppointment({
        id: "appointment-2",
        startAt: "2026-08-16T10:00:00.000Z",
      }),
    ];

    const conflicts = findAppointmentConflicts(candidate, existingAppointments);

    expect(conflicts.map((appointment) => appointment.id)).toEqual([
      "appointment-1",
    ]);
  });

  it("returns all conflicting appointments", () => {
    const candidate = createAppointment({
      id: "candidate",
      startAt: "2026-08-16T09:20:00.000Z",
      durationMinutes: 40,
    });

    const existingAppointments = [
      createAppointment({
        id: "appointment-1",
        startAt: "2026-08-16T09:00:00.000Z",
        durationMinutes: 30,
      }),
      createAppointment({
        id: "appointment-2",
        startAt: "2026-08-16T09:45:00.000Z",
        durationMinutes: 30,
      }),
    ];

    const conflicts = findAppointmentConflicts(candidate, existingAppointments);

    expect(conflicts.map((appointment) => appointment.id)).toEqual([
      "appointment-1",
      "appointment-2",
    ]);
  });

  it("ignores the candidate itself when editing an appointment", () => {
    const candidate = createAppointment({
      id: "appointment-1",
      startAt: "2026-08-16T09:00:00.000Z",
    });

    const existingAppointments = [
      createAppointment({
        id: "appointment-1",
        startAt: "2026-08-16T09:00:00.000Z",
      }),
    ];

    expect(findAppointmentConflicts(candidate, existingAppointments)).toEqual(
      [],
    );
  });

  it("ignores cancelled appointments", () => {
    const candidate = createAppointment({
      id: "candidate",
      startAt: "2026-08-16T09:00:00.000Z",
    });

    const cancelledAppointment = createAppointment({
      id: "cancelled",
      startAt: "2026-08-16T09:00:00.000Z",
      status: "CANCELLED",
    });

    expect(findAppointmentConflicts(candidate, [cancelledAppointment])).toEqual(
      [],
    );
  });

  it("ignores no-show appointments", () => {
    const candidate = createAppointment({
      id: "candidate",
      startAt: "2026-08-16T09:00:00.000Z",
    });

    const noShowAppointment = createAppointment({
      id: "no-show",
      startAt: "2026-08-16T09:00:00.000Z",
      status: "NO_SHOW",
    });

    expect(findAppointmentConflicts(candidate, [noShowAppointment])).toEqual(
      [],
    );
  });

  it("does not return appointments assigned to another staff member", () => {
    const candidate = createAppointment({
      id: "candidate",
      staffMemberId: "staff-1",
      startAt: "2026-08-16T09:00:00.000Z",
    });

    const otherStaffAppointment = createAppointment({
      id: "appointment-2",
      staffMemberId: "staff-2",
      startAt: "2026-08-16T09:00:00.000Z",
    });

    expect(
      findAppointmentConflicts(candidate, [otherStaffAppointment]),
    ).toEqual([]);
  });

  it("returns an empty array when there are no existing appointments", () => {
    const candidate = createAppointment({
      id: "candidate",
      startAt: "2026-08-16T09:00:00.000Z",
    });

    expect(findAppointmentConflicts(candidate, [])).toEqual([]);
  });
});
