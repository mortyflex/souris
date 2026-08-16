import { describe, expect, it } from "vitest";

import type { Appointment } from "./appointment.types";
import { buildAppointmentTimeline } from "./buildAppointmentTimeline";
import { removeAppointmentItem } from "./removeAppointmentItem";

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
        id: "cut",
        serviceId: "cut-service",
        order: 0,
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
        id: "color",
        serviceId: "color-service",
        order: 1,
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
            durationMinutes: 35,
            requiresStaff: false,
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

describe("removeAppointmentItem", () => {
  it("removes an appointment item", () => {
    const appointment = createAppointment();

    const updatedAppointment = removeAppointmentItem(appointment, "color");

    expect(updatedAppointment.items.map((item) => item.id)).toEqual([
      "cut",
      "blow-dry",
    ]);
  });

  it("normalizes item order after removal", () => {
    const appointment = createAppointment();

    const updatedAppointment = removeAppointmentItem(appointment, "color");

    expect(
      updatedAppointment.items.map((item) => ({
        id: item.id,
        order: item.order,
      })),
    ).toEqual([
      {
        id: "cut",
        order: 0,
      },
      {
        id: "blow-dry",
        order: 1,
      },
    ]);
  });

  it("does not mutate the original appointment", () => {
    const appointment = createAppointment();

    const originalItems = appointment.items.map((item) => ({
      id: item.id,
      order: item.order,
    }));

    const updatedAppointment = removeAppointmentItem(appointment, "color");

    expect(updatedAppointment).not.toBe(appointment);

    expect(
      appointment.items.map((item) => ({
        id: item.id,
        order: item.order,
      })),
    ).toEqual(originalItems);

    expect(appointment.items).toHaveLength(3);
    expect(updatedAppointment.items).toHaveLength(2);
  });

  it("recalculates the derived timeline without the removed service", () => {
    const appointment = createAppointment();

    const updatedAppointment = removeAppointmentItem(appointment, "color");

    const timeline = buildAppointmentTimeline(updatedAppointment);

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
        phaseId: "blow-dry-phase",
        startAt: "2026-08-16T09:20:00.000Z",
        endAt: "2026-08-16T09:45:00.000Z",
      },
    ]);
  });

  it("allows the last remaining item to be removed", () => {
    const appointment: Appointment = {
      ...createAppointment(),
      items: [createAppointment().items[0]!],
    };

    const updatedAppointment = removeAppointmentItem(appointment, "cut");

    expect(updatedAppointment.items).toEqual([]);
    expect(buildAppointmentTimeline(updatedAppointment)).toEqual([]);
  });

  it("returns the original appointment when the item does not exist", () => {
    const appointment = createAppointment();

    const result = removeAppointmentItem(appointment, "unknown-item");

    expect(result).toBe(appointment);
  });

  it("uses the item order rather than the current array position", () => {
    const appointment = createAppointment();

    appointment.items = [
      appointment.items[2]!,
      appointment.items[0]!,
      appointment.items[1]!,
    ];

    const updatedAppointment = removeAppointmentItem(appointment, "color");

    expect(
      updatedAppointment.items.map((item) => ({
        id: item.id,
        order: item.order,
      })),
    ).toEqual([
      {
        id: "cut",
        order: 0,
      },
      {
        id: "blow-dry",
        order: 1,
      },
    ]);
  });
});
