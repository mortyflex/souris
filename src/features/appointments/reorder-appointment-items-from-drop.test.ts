import { describe, expect, it } from "vitest";

import type { Appointment } from "@/domain/appointments/appointment.types";

import { reorderAppointmentItemsFromDrop } from "./reorder-appointment-items-from-drop";

function createAppointment(): Appointment {
  return {
    id: "appointment-1",
    businessId: "business-1",
    clientId: "client-1",
    staffMemberId: "staff-1",
    startAt: new Date("2026-08-22T09:00:00.000Z"),
    status: "CONFIRMED",
    items: [
      {
        id: "color",
        serviceId: "color-service",
        order: 0,
        serviceName: "Couleur",
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
            name: "Pose",
            durationMinutes: 20,
            requiresStaff: false,
          },
        ],
      },
      {
        id: "gloss",
        serviceId: "gloss-service",
        order: 1,
        serviceName: "Gloss",
        serviceType: "SERVICE",
        price: 25,
        phases: [
          {
            id: "gloss-phase",
            name: "Gloss",
            durationMinutes: 15,
            requiresStaff: true,
          },
        ],
      },
      {
        id: "brushing",
        serviceId: "brushing-service",
        order: 2,
        serviceName: "Brushing",
        serviceType: "SERVICE",
        price: 30,
        phases: [
          {
            id: "brushing-phase",
            name: "Brushing",
            durationMinutes: 30,
            requiresStaff: true,
          },
        ],
      },
    ],
  };
}

describe("reorderAppointmentItemsFromDrop", () => {
  it("moves the dragged item to the position of the item under it", () => {
    const appointment = createAppointment();

    const reordered = reorderAppointmentItemsFromDrop(
      appointment,
      "brushing",
      "color",
    );

    expect(reordered.items.map((item) => item.id)).toEqual([
      "brushing",
      "color",
      "gloss",
    ]);

    expect(reordered.items.map((item) => item.order)).toEqual([0, 1, 2]);
  });

  it("moves an item downward", () => {
    const appointment = createAppointment();

    const reordered = reorderAppointmentItemsFromDrop(
      appointment,
      "color",
      "brushing",
    );

    expect(reordered.items.map((item) => item.id)).toEqual([
      "gloss",
      "brushing",
      "color",
    ]);
  });

  it("uses the normalized business order rather than the raw array position", () => {
    const appointment = createAppointment();

    appointment.items = [
      appointment.items[2]!,
      appointment.items[0]!,
      appointment.items[1]!,
    ];

    const reordered = reorderAppointmentItemsFromDrop(
      appointment,
      "brushing",
      "color",
    );

    expect(reordered.items.map((item) => item.id)).toEqual([
      "brushing",
      "color",
      "gloss",
    ]);

    expect(reordered.items.map((item) => item.order)).toEqual([0, 1, 2]);
  });

  it("returns the original appointment when there is no drop target", () => {
    const appointment = createAppointment();

    expect(reorderAppointmentItemsFromDrop(appointment, "color", null)).toBe(
      appointment,
    );
  });

  it("returns the original appointment when dropping on itself", () => {
    const appointment = createAppointment();

    expect(reorderAppointmentItemsFromDrop(appointment, "color", "color")).toBe(
      appointment,
    );
  });

  it("returns the original appointment when the target item does not exist", () => {
    const appointment = createAppointment();

    expect(
      reorderAppointmentItemsFromDrop(appointment, "color", "unknown-item"),
    ).toBe(appointment);
  });

  it("returns the original appointment when the dragged item does not exist", () => {
    const appointment = createAppointment();

    expect(
      reorderAppointmentItemsFromDrop(appointment, "unknown-item", "color"),
    ).toBe(appointment);
  });

  it("does not mutate the original appointment", () => {
    const appointment = createAppointment();

    const originalIds = appointment.items.map((item) => item.id);

    const reordered = reorderAppointmentItemsFromDrop(
      appointment,
      "gloss",
      "color",
    );

    expect(reordered).not.toBe(appointment);

    expect(appointment.items.map((item) => item.id)).toEqual(originalIds);
  });
});
