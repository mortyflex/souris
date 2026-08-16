import { describe, expect, it } from "vitest";

import type { Appointment, Service } from "./appointment.types";
import { buildAppointmentTimeline } from "./buildAppointmentTimeline";
import { createAppointmentItemFromService } from "./createAppointmentItemFromService";
import { getAppointmentSummary } from "./getAppointmentSummary";
import { updateAppointmentItem } from "./updateAppointmentItem";

function createService(): Service {
  return {
    id: "root-color",
    businessId: "business-1",
    name: "Root color",
    type: "TECHNIQUE",
    price: 55,
    active: true,
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
  };
}

function createAppointment(service: Service = createService()): Appointment {
  const item = createAppointmentItemFromService({
    id: "root-color-item",
    service,
    order: 0,
    createPhaseId: (servicePhaseId) => `appointment-${servicePhaseId}`,
  });

  return {
    id: "appointment-1",
    businessId: "business-1",
    clientId: "client-1",
    staffMemberId: "staff-1",
    startAt: new Date("2026-08-16T09:00:00.000Z"),
    status: "SCHEDULED",
    items: [item],
  };
}

describe("updateAppointmentItem", () => {
  it("overrides the appointment item price", () => {
    const appointment = createAppointment();

    const updatedAppointment = updateAppointmentItem({
      appointment,
      itemId: "root-color-item",
      price: 65,
    });

    expect(updatedAppointment.items[0]?.price).toBe(65);
  });

  it("overrides the appointment item snapshot name", () => {
    const appointment = createAppointment();

    const updatedAppointment = updateAppointmentItem({
      appointment,
      itemId: "root-color-item",
      serviceName: "Root color premium",
    });

    expect(updatedAppointment.items[0]?.serviceName).toBe("Root color premium");
  });

  it("overrides a phase duration", () => {
    const appointment = createAppointment();

    const processingPhaseId = appointment.items[0]?.phases[1]?.id;

    if (!processingPhaseId) {
      throw new Error("Expected processing phase");
    }

    const updatedAppointment = updateAppointmentItem({
      appointment,
      itemId: "root-color-item",
      phaseOverrides: [
        {
          phaseId: processingPhaseId,
          durationMinutes: 45,
        },
      ],
    });

    expect(updatedAppointment.items[0]?.phases[1]?.durationMinutes).toBe(45);
  });

  it("can override several values in one operation", () => {
    const appointment = createAppointment();

    const applicationPhaseId = appointment.items[0]?.phases[0]?.id;

    const processingPhaseId = appointment.items[0]?.phases[1]?.id;

    if (!applicationPhaseId || !processingPhaseId) {
      throw new Error("Expected appointment phases");
    }

    const updatedAppointment = updateAppointmentItem({
      appointment,
      itemId: "root-color-item",
      serviceName: "Custom root color",
      price: 70,
      phaseOverrides: [
        {
          phaseId: applicationPhaseId,
          durationMinutes: 20,
        },
        {
          phaseId: processingPhaseId,
          durationMinutes: 45,
        },
      ],
    });

    const item = updatedAppointment.items[0];

    expect(item?.serviceName).toBe("Custom root color");
    expect(item?.price).toBe(70);
    expect(item?.phases[0]?.durationMinutes).toBe(20);
    expect(item?.phases[1]?.durationMinutes).toBe(45);
  });

  it("recalculates the derived timeline after a duration override", () => {
    const appointment = createAppointment();

    const processingPhaseId = appointment.items[0]?.phases[1]?.id;

    if (!processingPhaseId) {
      throw new Error("Expected processing phase");
    }

    const updatedAppointment = updateAppointmentItem({
      appointment,
      itemId: "root-color-item",
      phaseOverrides: [
        {
          phaseId: processingPhaseId,
          durationMinutes: 45,
        },
      ],
    });

    const timeline = buildAppointmentTimeline(updatedAppointment);

    expect(
      timeline.map((phase) => ({
        phaseId: phase.phaseId,
        startAt: phase.startAt.toISOString(),
        endAt: phase.endAt.toISOString(),
      })),
    ).toEqual([
      {
        phaseId: "appointment-application",
        startAt: "2026-08-16T09:00:00.000Z",
        endAt: "2026-08-16T09:15:00.000Z",
      },
      {
        phaseId: "appointment-processing",
        startAt: "2026-08-16T09:15:00.000Z",
        endAt: "2026-08-16T10:00:00.000Z",
      },
    ]);
  });

  it("updates the derived appointment summary", () => {
    const appointment = createAppointment();

    const processingPhaseId = appointment.items[0]?.phases[1]?.id;

    if (!processingPhaseId) {
      throw new Error("Expected processing phase");
    }

    const updatedAppointment = updateAppointmentItem({
      appointment,
      itemId: "root-color-item",
      price: 65,
      phaseOverrides: [
        {
          phaseId: processingPhaseId,
          durationMinutes: 45,
        },
      ],
    });

    expect(getAppointmentSummary(updatedAppointment)).toEqual({
      totalPrice: 65,
      totalDurationMinutes: 60,
      occupiedDurationMinutes: 15,
      processingDurationMinutes: 45,
      itemCount: 1,
      phaseCount: 2,
    });
  });

  it("does not modify the source catalog service", () => {
    const service = createService();
    const originalService = structuredClone(service);

    const appointment = createAppointment(service);

    const processingPhaseId = appointment.items[0]?.phases[1]?.id;

    if (!processingPhaseId) {
      throw new Error("Expected processing phase");
    }

    updateAppointmentItem({
      appointment,
      itemId: "root-color-item",
      price: 70,
      phaseOverrides: [
        {
          phaseId: processingPhaseId,
          durationMinutes: 50,
        },
      ],
    });

    expect(service).toEqual(originalService);
  });

  it("does not mutate the original appointment", () => {
    const appointment = createAppointment();

    const originalAppointment = structuredClone(appointment);

    const processingPhaseId = appointment.items[0]?.phases[1]?.id;

    if (!processingPhaseId) {
      throw new Error("Expected processing phase");
    }

    const updatedAppointment = updateAppointmentItem({
      appointment,
      itemId: "root-color-item",
      price: 70,
      phaseOverrides: [
        {
          phaseId: processingPhaseId,
          durationMinutes: 45,
        },
      ],
    });

    expect(updatedAppointment).not.toBe(appointment);
    expect(appointment).toEqual(originalAppointment);
  });

  it("leaves unknown phases unchanged", () => {
    const appointment = createAppointment();

    const updatedAppointment = updateAppointmentItem({
      appointment,
      itemId: "root-color-item",
      phaseOverrides: [
        {
          phaseId: "unknown-phase",
          durationMinutes: 90,
        },
      ],
    });

    expect(
      updatedAppointment.items[0]?.phases.map((phase) => phase.durationMinutes),
    ).toEqual([15, 35]);
  });

  it("returns the original appointment when the item does not exist", () => {
    const appointment = createAppointment();

    const result = updateAppointmentItem({
      appointment,
      itemId: "unknown-item",
      price: 70,
    });

    expect(result).toBe(appointment);
  });
});
