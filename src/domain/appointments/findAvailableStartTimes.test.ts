import { describe, expect, it } from "vitest";

import type { Appointment } from "./appointment.types";
import { findAvailableStartTimes } from "./findAvailableStartTimes";

function createSimpleAppointment({
  id,
  startAt,
  durationMinutes = 30,
}: {
  id: string;
  startAt: string;
  durationMinutes?: number;
}): Appointment {
  return {
    id,
    businessId: "business-1",
    clientId: `client-${id}`,
    staffMemberId: "staff-1",
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

describe("findAvailableStartTimes", () => {
  it("returns available start times using the requested step", () => {
    const appointment = createSimpleAppointment({
      id: "candidate",
      startAt: "2026-08-16T09:00:00.000Z",
      durationMinutes: 30,
    });

    const availableStartTimes = findAvailableStartTimes({
      appointment,
      existingAppointments: [],
      windowStart: new Date("2026-08-16T09:00:00.000Z"),
      windowEnd: new Date("2026-08-16T11:00:00.000Z"),
      stepMinutes: 30,
    });

    expect(availableStartTimes.map((date) => date.toISOString())).toEqual([
      "2026-08-16T09:00:00.000Z",
      "2026-08-16T09:30:00.000Z",
      "2026-08-16T10:00:00.000Z",
      "2026-08-16T10:30:00.000Z",
    ]);
  });

  it("removes start times that conflict with existing appointments", () => {
    const appointment = createSimpleAppointment({
      id: "candidate",
      startAt: "2026-08-16T09:00:00.000Z",
      durationMinutes: 30,
    });

    const existingAppointment = createSimpleAppointment({
      id: "existing",
      startAt: "2026-08-16T09:30:00.000Z",
      durationMinutes: 30,
    });

    const availableStartTimes = findAvailableStartTimes({
      appointment,
      existingAppointments: [existingAppointment],
      windowStart: new Date("2026-08-16T09:00:00.000Z"),
      windowEnd: new Date("2026-08-16T11:00:00.000Z"),
      stepMinutes: 30,
    });

    expect(availableStartTimes.map((date) => date.toISOString())).toEqual([
      "2026-08-16T09:00:00.000Z",
      "2026-08-16T10:00:00.000Z",
      "2026-08-16T10:30:00.000Z",
    ]);
  });

  it("does not suggest a start time when the appointment would end after the window", () => {
    const appointment = createSimpleAppointment({
      id: "candidate",
      startAt: "2026-08-16T09:00:00.000Z",
      durationMinutes: 45,
    });

    const availableStartTimes = findAvailableStartTimes({
      appointment,
      existingAppointments: [],
      windowStart: new Date("2026-08-16T09:00:00.000Z"),
      windowEnd: new Date("2026-08-16T10:00:00.000Z"),
      stepMinutes: 15,
    });

    expect(availableStartTimes.map((date) => date.toISOString())).toEqual([
      "2026-08-16T09:00:00.000Z",
      "2026-08-16T09:15:00.000Z",
    ]);
  });

  it("uses the full future timeline when validating a start time", () => {
    const techniqueAppointment: Appointment = {
      id: "candidate",
      businessId: "business-1",
      clientId: "client-candidate",
      staffMemberId: "staff-1",
      startAt: new Date("2026-08-16T09:00:00.000Z"),
      status: "SCHEDULED",
      items: [
        {
          id: "technique-item",
          serviceId: "technique",
          order: 0,
          serviceName: "Technique",
          serviceType: "TECHNIQUE",
          price: 60,
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
              durationMinutes: 30,
              requiresStaff: false,
            },
            {
              id: "finish",
              name: "Finish",
              durationMinutes: 15,
              requiresStaff: true,
            },
          ],
        },
      ],
    };

    const existingAppointment = createSimpleAppointment({
      id: "existing",
      startAt: "2026-08-16T10:15:00.000Z",
      durationMinutes: 30,
    });

    const availableStartTimes = findAvailableStartTimes({
      appointment: techniqueAppointment,
      existingAppointments: [existingAppointment],
      windowStart: new Date("2026-08-16T09:00:00.000Z"),
      windowEnd: new Date("2026-08-16T12:00:00.000Z"),
      stepMinutes: 30,
    });

    expect(availableStartTimes.map((date) => date.toISOString())).not.toContain(
      "2026-08-16T09:30:00.000Z",
    );
  });

  it("can suggest a start time inside an existing processing phase", () => {
    const existingTechnique: Appointment = {
      id: "existing-technique",
      businessId: "business-1",
      clientId: "client-existing",
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
              durationMinutes: 45,
              requiresStaff: false,
            },
          ],
        },
      ],
    };

    const candidate = createSimpleAppointment({
      id: "candidate",
      startAt: "2026-08-16T09:00:00.000Z",
      durationMinutes: 30,
    });

    const availableStartTimes = findAvailableStartTimes({
      appointment: candidate,
      existingAppointments: [existingTechnique],
      windowStart: new Date("2026-08-16T09:00:00.000Z"),
      windowEnd: new Date("2026-08-16T11:00:00.000Z"),
      stepMinutes: 15,
    });

    expect(availableStartTimes.map((date) => date.toISOString())).toContain(
      "2026-08-16T09:15:00.000Z",
    );
  });

  it("returns an empty array for an invalid step", () => {
    const appointment = createSimpleAppointment({
      id: "candidate",
      startAt: "2026-08-16T09:00:00.000Z",
    });

    expect(
      findAvailableStartTimes({
        appointment,
        existingAppointments: [],
        windowStart: new Date("2026-08-16T09:00:00.000Z"),
        windowEnd: new Date("2026-08-16T11:00:00.000Z"),
        stepMinutes: 0,
      }),
    ).toEqual([]);
  });

  it("returns an empty array for an invalid time window", () => {
    const appointment = createSimpleAppointment({
      id: "candidate",
      startAt: "2026-08-16T09:00:00.000Z",
    });

    expect(
      findAvailableStartTimes({
        appointment,
        existingAppointments: [],
        windowStart: new Date("2026-08-16T11:00:00.000Z"),
        windowEnd: new Date("2026-08-16T09:00:00.000Z"),
        stepMinutes: 15,
      }),
    ).toEqual([]);
  });

  it("returns no suggestion for an appointment without phases", () => {
    const appointment: Appointment = {
      id: "candidate",
      businessId: "business-1",
      clientId: "client-candidate",
      staffMemberId: "staff-1",
      startAt: new Date("2026-08-16T09:00:00.000Z"),
      status: "SCHEDULED",
      items: [],
    };

    expect(
      findAvailableStartTimes({
        appointment,
        existingAppointments: [],
        windowStart: new Date("2026-08-16T09:00:00.000Z"),
        windowEnd: new Date("2026-08-16T11:00:00.000Z"),
        stepMinutes: 15,
      }),
    ).toEqual([]);
  });
});
