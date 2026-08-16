import { describe, expect, it } from "vitest";

import type { Appointment } from "./appointment.types";
import { buildAppointmentTimeline } from "./buildAppointmentTimeline";
import { reorderAppointmentItems } from "./reorderAppointmentItems";

function createAppointment(): Appointment {
  return {
    id: "appointment-1",
    businessId: "business-1",
    clientId: "client-1",
    staffMemberId: "staff-1",
    startAt: new Date("2026-08-16T09:00:00.000Z"),
    status: "SCHEDULED",
    items: [
      {
        id: "color",
        serviceId: "color-service",
        order: 0,
        serviceName: "Color",
        serviceType: "TECHNIQUE",
        price: 55,
        phases: [
          {
            id: "color-application",
            name: "Color application",
            durationMinutes: 15,
            requiresStaff: true,
          },
          {
            id: "color-processing",
            name: "Color processing",
            durationMinutes: 30,
            requiresStaff: false,
          },
        ],
      },
      {
        id: "cut",
        serviceId: "cut-service",
        order: 1,
        serviceName: "Cut",
        serviceType: "SERVICE",
        price: 30,
        phases: [
          {
            id: "cut-phase",
            name: "Cut",
            durationMinutes: 20,
            requiresStaff: true,
          },
        ],
      },
      {
        id: "blow-dry",
        serviceId: "blow-dry-service",
        order: 2,
        serviceName: "Blow-dry",
        serviceType: "SERVICE",
        price: 25,
        phases: [
          {
            id: "blow-dry-phase",
            name: "Blow-dry",
            durationMinutes: 25,
            requiresStaff: true,
          },
        ],
      },
    ],
  };
}

describe("reorderAppointmentItems", () => {
  it("moves an appointment item to a new position", () => {
    const appointment = createAppointment();

    const reordered = reorderAppointmentItems(appointment, "cut", 0);

    expect(reordered.items.map((item) => item.id)).toEqual([
      "cut",
      "color",
      "blow-dry",
    ]);
  });

  it("normalizes item order after reordering", () => {
    const appointment = createAppointment();

    const reordered = reorderAppointmentItems(appointment, "blow-dry", 0);

    expect(
      reordered.items.map((item) => ({
        id: item.id,
        order: item.order,
      })),
    ).toEqual([
      {
        id: "blow-dry",
        order: 0,
      },
      {
        id: "color",
        order: 1,
      },
      {
        id: "cut",
        order: 2,
      },
    ]);
  });

  it("does not mutate the original appointment", () => {
    const appointment = createAppointment();

    const originalItemIds = appointment.items.map((item) => item.id);

    const originalOrders = appointment.items.map((item) => item.order);

    const reordered = reorderAppointmentItems(appointment, "cut", 0);

    expect(reordered).not.toBe(appointment);

    expect(appointment.items.map((item) => item.id)).toEqual(originalItemIds);

    expect(appointment.items.map((item) => item.order)).toEqual(originalOrders);
  });

  it("changes the derived timeline according to the new item order", () => {
    const appointment = createAppointment();

    const reordered = reorderAppointmentItems(appointment, "cut", 0);

    const timeline = buildAppointmentTimeline(reordered);

    expect(
      timeline.map((phase) => ({
        phaseId: phase.phaseId,
        startAt: phase.startAt.toISOString(),
        endAt: phase.endAt.toISOString(),
      })),
    ).toEqual([
      {
        phaseId: "cut-phase",
        startAt: "2026-08-16T09:00:00.000Z",
        endAt: "2026-08-16T09:20:00.000Z",
      },
      {
        phaseId: "color-application",
        startAt: "2026-08-16T09:20:00.000Z",
        endAt: "2026-08-16T09:35:00.000Z",
      },
      {
        phaseId: "color-processing",
        startAt: "2026-08-16T09:35:00.000Z",
        endAt: "2026-08-16T10:05:00.000Z",
      },
      {
        phaseId: "blow-dry-phase",
        startAt: "2026-08-16T10:05:00.000Z",
        endAt: "2026-08-16T10:30:00.000Z",
      },
    ]);
  });

  it("returns the original appointment when the item does not exist", () => {
    const appointment = createAppointment();

    const result = reorderAppointmentItems(appointment, "unknown-item", 0);

    expect(result).toBe(appointment);
  });

  it("returns the original appointment for an invalid target index", () => {
    const appointment = createAppointment();

    expect(reorderAppointmentItems(appointment, "color", -1)).toBe(appointment);

    expect(
      reorderAppointmentItems(appointment, "color", appointment.items.length),
    ).toBe(appointment);
  });

  it("returns the original appointment when the item is already at the target position", () => {
    const appointment = createAppointment();

    expect(reorderAppointmentItems(appointment, "cut", 1)).toBe(appointment);
  });
});
