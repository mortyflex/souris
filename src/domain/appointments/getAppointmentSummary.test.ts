import { describe, expect, it } from "vitest";

import type { Appointment } from "./appointment.types";
import { getAppointmentSummary } from "./getAppointmentSummary";

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
        id: "color-item",
        serviceId: "color",
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
        id: "cut-item",
        serviceId: "cut",
        order: 1,
        serviceName: "Cut",
        serviceType: "SERVICE",
        price: 30,
        phases: [
          {
            id: "cut",
            name: "Cut",
            durationMinutes: 20,
            requiresStaff: true,
          },
        ],
      },
      {
        id: "blow-dry-item",
        serviceId: "blow-dry",
        order: 2,
        serviceName: "Blow-dry",
        serviceType: "SERVICE",
        price: 25,
        phases: [
          {
            id: "blow-dry",
            name: "Blow-dry",
            durationMinutes: 25,
            requiresStaff: true,
          },
        ],
      },
    ],
  };
}

describe("getAppointmentSummary", () => {
  it("calculates the total appointment price", () => {
    const summary = getAppointmentSummary(createAppointment());

    expect(summary.totalPrice).toBe(110);
  });

  it("calculates the full elapsed duration", () => {
    const summary = getAppointmentSummary(createAppointment());

    expect(summary.totalDurationMinutes).toBe(95);
  });

  it("separates occupied time from processing time", () => {
    const summary = getAppointmentSummary(createAppointment());

    expect(summary.occupiedDurationMinutes).toBe(60);
    expect(summary.processingDurationMinutes).toBe(35);
  });

  it("returns the number of services and phases", () => {
    const summary = getAppointmentSummary(createAppointment());

    expect(summary.itemCount).toBe(3);
    expect(summary.phaseCount).toBe(4);
  });

  it("uses appointment snapshot prices rather than service catalog prices", () => {
    const appointment = createAppointment();

    appointment.items[0] = {
      ...appointment.items[0],
      price: 65,
    };

    const summary = getAppointmentSummary(appointment);

    expect(summary.totalPrice).toBe(120);
  });

  it("uses appointment phase overrides when calculating durations", () => {
    const appointment = createAppointment();

    const colorItem = appointment.items[0];

    if (!colorItem) {
      throw new Error("Expected color appointment item");
    }

    appointment.items[0] = {
      ...colorItem,
      phases: colorItem.phases.map((phase) =>
        phase.id === "processing"
          ? {
              ...phase,
              durationMinutes: 45,
            }
          : phase,
      ),
    };

    const summary = getAppointmentSummary(appointment);

    expect(summary.totalDurationMinutes).toBe(105);
    expect(summary.occupiedDurationMinutes).toBe(60);
    expect(summary.processingDurationMinutes).toBe(45);
  });

  it("returns zero values for an empty appointment", () => {
    const appointment: Appointment = {
      id: "appointment-1",
      businessId: "business-1",
      clientId: "client-1",
      staffMemberId: "staff-1",
      startAt: new Date("2026-08-16T09:00:00.000Z"),
      status: "SCHEDULED",
      items: [],
    };

    expect(getAppointmentSummary(appointment)).toEqual({
      totalPrice: 0,
      totalDurationMinutes: 0,
      occupiedDurationMinutes: 0,
      processingDurationMinutes: 0,
      itemCount: 0,
      phaseCount: 0,
    });
  });
});
