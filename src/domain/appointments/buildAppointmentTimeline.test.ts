import { describe, expect, it } from "vitest";

import type { Appointment } from "./appointment.types";
import { buildAppointmentTimeline } from "./buildAppointmentTimeline";

describe("buildAppointmentTimeline", () => {
  it("builds a chronological timeline from appointment phases", () => {
    const appointment: Appointment = {
      id: "appointment-1",
      businessId: "business-1",
      clientId: "client-1",
      staffMemberId: "staff-1",
      startAt: new Date("2026-08-16T09:00:00.000Z"),
      status: "SCHEDULED",
      items: [
        {
          id: "item-1",
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
          ],
        },
        {
          id: "item-2",
          serviceId: "gloss",
          order: 1,
          serviceName: "Gloss",
          serviceType: "TECHNIQUE",
          price: 25,
          phases: [
            {
              id: "gloss-active",
              name: "Gloss",
              durationMinutes: 10,
              requiresStaff: true,
            },
            {
              id: "gloss-processing",
              name: "Processing",
              durationMinutes: 10,
              requiresStaff: false,
            },
          ],
        },
      ],
    };

    const timeline = buildAppointmentTimeline(appointment);

    expect(timeline).toHaveLength(4);

    expect(timeline[0]).toMatchObject({
      appointmentId: "appointment-1",
      appointmentItemId: "item-1",
      phaseId: "application",
      label: "Application",
      durationMinutes: 15,
      requiresStaff: true,
    });

    expect(timeline[0]?.startAt.toISOString()).toBe("2026-08-16T09:00:00.000Z");
    expect(timeline[0]?.endAt.toISOString()).toBe("2026-08-16T09:15:00.000Z");

    expect(timeline[1]?.startAt.toISOString()).toBe("2026-08-16T09:15:00.000Z");
    expect(timeline[1]?.endAt.toISOString()).toBe("2026-08-16T09:50:00.000Z");

    expect(timeline[2]?.startAt.toISOString()).toBe("2026-08-16T09:50:00.000Z");
    expect(timeline[2]?.endAt.toISOString()).toBe("2026-08-16T10:00:00.000Z");

    expect(timeline[3]?.startAt.toISOString()).toBe("2026-08-16T10:00:00.000Z");
    expect(timeline[3]?.endAt.toISOString()).toBe("2026-08-16T10:10:00.000Z");
  });

  it("uses appointment item order rather than array position", () => {
    const appointment: Appointment = {
      id: "appointment-1",
      businessId: "business-1",
      clientId: "client-1",
      staffMemberId: "staff-1",
      startAt: new Date("2026-08-16T09:00:00.000Z"),
      status: "SCHEDULED",
      items: [
        {
          id: "item-second",
          serviceId: "service-second",
          order: 1,
          serviceName: "Second",
          serviceType: "SERVICE",
          price: 20,
          phases: [
            {
              id: "phase-second",
              name: "Second",
              durationMinutes: 20,
              requiresStaff: true,
            },
          ],
        },
        {
          id: "item-first",
          serviceId: "service-first",
          order: 0,
          serviceName: "First",
          serviceType: "SERVICE",
          price: 10,
          phases: [
            {
              id: "phase-first",
              name: "First",
              durationMinutes: 10,
              requiresStaff: true,
            },
          ],
        },
      ],
    };

    const timeline = buildAppointmentTimeline(appointment);

    expect(timeline[0]?.appointmentItemId).toBe("item-first");
    expect(timeline[0]?.startAt.toISOString()).toBe("2026-08-16T09:00:00.000Z");
    expect(timeline[0]?.endAt.toISOString()).toBe("2026-08-16T09:10:00.000Z");

    expect(timeline[1]?.appointmentItemId).toBe("item-second");
    expect(timeline[1]?.startAt.toISOString()).toBe("2026-08-16T09:10:00.000Z");
    expect(timeline[1]?.endAt.toISOString()).toBe("2026-08-16T09:30:00.000Z");
  });

  it("returns an empty timeline when the appointment has no items", () => {
    const appointment: Appointment = {
      id: "appointment-1",
      businessId: "business-1",
      clientId: "client-1",
      staffMemberId: "staff-1",
      startAt: new Date("2026-08-16T09:00:00.000Z"),
      status: "SCHEDULED",
      items: [],
    };

    expect(buildAppointmentTimeline(appointment)).toEqual([]);
  });

  it("does not mutate the original appointment item order", () => {
    const appointment: Appointment = {
      id: "appointment-1",
      businessId: "business-1",
      clientId: "client-1",
      staffMemberId: "staff-1",
      startAt: new Date("2026-08-16T09:00:00.000Z"),
      status: "SCHEDULED",
      items: [
        {
          id: "item-2",
          serviceId: "service-2",
          order: 1,
          serviceName: "Second",
          serviceType: "SERVICE",
          price: 20,
          phases: [
            {
              id: "phase-2",
              name: "Second",
              durationMinutes: 20,
              requiresStaff: true,
            },
          ],
        },
        {
          id: "item-1",
          serviceId: "service-1",
          order: 0,
          serviceName: "First",
          serviceType: "SERVICE",
          price: 10,
          phases: [
            {
              id: "phase-1",
              name: "First",
              durationMinutes: 10,
              requiresStaff: true,
            },
          ],
        },
      ],
    };

    const originalOrder = appointment.items.map((item) => item.id);

    buildAppointmentTimeline(appointment);

    expect(appointment.items.map((item) => item.id)).toEqual(originalOrder);
  });
});
