import { describe, expect, it } from "vitest";

import type { Appointment } from "./appointment.types";
import { canScheduleAppointmentAt } from "./canScheduleAppointmentAt";

function createSimpleAppointment({
  id,
  startAt,
  durationMinutes = 30,
  staffMemberId = "staff-1",
}: {
  id: string;
  startAt: string;
  durationMinutes?: number;
  staffMemberId?: string;
}): Appointment {
  return {
    id,
    businessId: "business-1",
    clientId: `client-${id}`,
    staffMemberId,
    startAt: new Date(startAt),
    status: "SCHEDULED",
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

describe("canScheduleAppointmentAt", () => {
  it("returns true when the requested time is available", () => {
    const appointment = createSimpleAppointment({
      id: "candidate",
      startAt: "2026-08-16T08:00:00.000Z",
    });

    const existingAppointment = createSimpleAppointment({
      id: "existing",
      startAt: "2026-08-16T10:00:00.000Z",
    });

    expect(
      canScheduleAppointmentAt(
        appointment,
        new Date("2026-08-16T09:00:00.000Z"),
        [existingAppointment],
      ),
    ).toBe(true);
  });

  it("returns false when the requested time conflicts", () => {
    const appointment = createSimpleAppointment({
      id: "candidate",
      startAt: "2026-08-16T08:00:00.000Z",
      durationMinutes: 30,
    });

    const existingAppointment = createSimpleAppointment({
      id: "existing",
      startAt: "2026-08-16T09:15:00.000Z",
      durationMinutes: 30,
    });

    expect(
      canScheduleAppointmentAt(
        appointment,
        new Date("2026-08-16T09:00:00.000Z"),
        [existingAppointment],
      ),
    ).toBe(false);
  });

  it("allows an appointment to end exactly when another occupied phase starts", () => {
    const appointment = createSimpleAppointment({
      id: "candidate",
      startAt: "2026-08-16T08:00:00.000Z",
      durationMinutes: 30,
    });

    const existingAppointment = createSimpleAppointment({
      id: "existing",
      startAt: "2026-08-16T09:30:00.000Z",
      durationMinutes: 30,
    });

    expect(
      canScheduleAppointmentAt(
        appointment,
        new Date("2026-08-16T09:00:00.000Z"),
        [existingAppointment],
      ),
    ).toBe(true);
  });

  it("allows a service during another appointment processing phase", () => {
    const techniqueAppointment: Appointment = {
      id: "technique",
      businessId: "business-1",
      clientId: "client-technique",
      staffMemberId: "staff-1",
      startAt: new Date("2026-08-16T09:00:00.000Z"),
      status: "SCHEDULED",
      items: [
        {
          id: "root-color-item",
          serviceId: "root-color",
          order: 0,
          serviceName: "Root color",
          serviceType: "TECHNIQUE",
          price: 55,
          phases: [
            {
              id: "application",
              name: "Application",
              durationMinutes: 15,
              requiresStaff: true,
            },
            {
              id: "processing",
              name: "Processing",
              durationMinutes: 35,
              requiresStaff: false,
            },
            {
              id: "finish",
              name: "Finish",
              durationMinutes: 10,
              requiresStaff: true,
            },
          ],
        },
      ],
    };

    const candidate = createSimpleAppointment({
      id: "candidate",
      startAt: "2026-08-16T08:00:00.000Z",
      durationMinutes: 30,
    });

    expect(
      canScheduleAppointmentAt(
        candidate,
        new Date("2026-08-16T09:15:00.000Z"),
        [techniqueAppointment],
      ),
    ).toBe(true);
  });

  it("rejects a service that extends into the next occupied phase", () => {
    const techniqueAppointment: Appointment = {
      id: "technique",
      businessId: "business-1",
      clientId: "client-technique",
      staffMemberId: "staff-1",
      startAt: new Date("2026-08-16T09:00:00.000Z"),
      status: "SCHEDULED",
      items: [
        {
          id: "root-color-item",
          serviceId: "root-color",
          order: 0,
          serviceName: "Root color",
          serviceType: "TECHNIQUE",
          price: 55,
          phases: [
            {
              id: "application",
              name: "Application",
              durationMinutes: 15,
              requiresStaff: true,
            },
            {
              id: "processing",
              name: "Processing",
              durationMinutes: 35,
              requiresStaff: false,
            },
            {
              id: "finish",
              name: "Finish",
              durationMinutes: 10,
              requiresStaff: true,
            },
          ],
        },
      ],
    };

    const candidate = createSimpleAppointment({
      id: "candidate",
      startAt: "2026-08-16T08:00:00.000Z",
      durationMinutes: 40,
    });

    expect(
      canScheduleAppointmentAt(
        candidate,
        new Date("2026-08-16T09:15:00.000Z"),
        [techniqueAppointment],
      ),
    ).toBe(false);
  });

  it("does not mutate the appointment original start time", () => {
    const appointment = createSimpleAppointment({
      id: "candidate",
      startAt: "2026-08-16T08:00:00.000Z",
    });

    const originalStartAt = appointment.startAt.toISOString();

    canScheduleAppointmentAt(
      appointment,
      new Date("2026-08-16T09:00:00.000Z"),
      [],
    );

    expect(appointment.startAt.toISOString()).toBe(originalStartAt);
  });
});
