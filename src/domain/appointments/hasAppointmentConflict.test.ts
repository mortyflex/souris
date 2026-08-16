import { describe, expect, it } from "vitest";

import type { Appointment } from "./appointment.types";
import { hasAppointmentConflict } from "./hasAppointmentConflict";

function createSimpleAppointment({
  id,
  staffMemberId = "staff-1",
  startAt,
  durationMinutes,
}: {
  id: string;
  staffMemberId?: string;
  startAt: string;
  durationMinutes: number;
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

describe("hasAppointmentConflict", () => {
  it("detects an overlap between occupied phases", () => {
    const firstAppointment = createSimpleAppointment({
      id: "1",
      startAt: "2026-08-16T09:00:00.000Z",
      durationMinutes: 30,
    });

    const secondAppointment = createSimpleAppointment({
      id: "2",
      startAt: "2026-08-16T09:15:00.000Z",
      durationMinutes: 30,
    });

    expect(hasAppointmentConflict(firstAppointment, secondAppointment)).toBe(
      true,
    );
  });

  it("does not consider adjacent occupied phases a conflict", () => {
    const firstAppointment = createSimpleAppointment({
      id: "1",
      startAt: "2026-08-16T09:00:00.000Z",
      durationMinutes: 30,
    });

    const secondAppointment = createSimpleAppointment({
      id: "2",
      startAt: "2026-08-16T09:30:00.000Z",
      durationMinutes: 30,
    });

    expect(hasAppointmentConflict(firstAppointment, secondAppointment)).toBe(
      false,
    );
  });

  it("allows another appointment during a processing phase", () => {
    const techniqueAppointment: Appointment = {
      id: "technique-appointment",
      businessId: "business-1",
      clientId: "client-1",
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

    const secondAppointment = createSimpleAppointment({
      id: "2",
      startAt: "2026-08-16T09:15:00.000Z",
      durationMinutes: 30,
    });

    expect(
      hasAppointmentConflict(techniqueAppointment, secondAppointment),
    ).toBe(false);
  });

  it("detects when another appointment extends into the next occupied phase", () => {
    const techniqueAppointment: Appointment = {
      id: "technique-appointment",
      businessId: "business-1",
      clientId: "client-1",
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

    const secondAppointment = createSimpleAppointment({
      id: "2",
      startAt: "2026-08-16T09:15:00.000Z",
      durationMinutes: 40,
    });

    expect(
      hasAppointmentConflict(techniqueAppointment, secondAppointment),
    ).toBe(true);
  });

  it("does not detect a conflict for different staff members", () => {
    const firstAppointment = createSimpleAppointment({
      id: "1",
      staffMemberId: "staff-1",
      startAt: "2026-08-16T09:00:00.000Z",
      durationMinutes: 30,
    });

    const secondAppointment = createSimpleAppointment({
      id: "2",
      staffMemberId: "staff-2",
      startAt: "2026-08-16T09:00:00.000Z",
      durationMinutes: 30,
    });

    expect(hasAppointmentConflict(firstAppointment, secondAppointment)).toBe(
      false,
    );
  });

  it("does not detect a conflict when appointments are separated", () => {
    const firstAppointment = createSimpleAppointment({
      id: "1",
      startAt: "2026-08-16T09:00:00.000Z",
      durationMinutes: 30,
    });

    const secondAppointment = createSimpleAppointment({
      id: "2",
      startAt: "2026-08-16T10:00:00.000Z",
      durationMinutes: 30,
    });

    expect(hasAppointmentConflict(firstAppointment, secondAppointment)).toBe(
      false,
    );
  });
});
