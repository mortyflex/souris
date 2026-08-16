import { describe, expect, it } from "vitest";

import type { Service } from "./appointment.types";
import { createAppointmentItemFromService } from "./createAppointmentItemFromService";

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

describe("createAppointmentItemFromService", () => {
  it("creates an appointment item from a service", () => {
    const service = createService();

    const item = createAppointmentItemFromService({
      id: "appointment-item-1",
      service,
      order: 0,
      createPhaseId: (servicePhaseId) => `appointment-${servicePhaseId}`,
    });

    expect(item).toEqual({
      id: "appointment-item-1",
      serviceId: "root-color",
      order: 0,
      serviceName: "Root color",
      serviceType: "TECHNIQUE",
      price: 55,
      phases: [
        {
          id: "appointment-application",
          name: "Application",
          durationMinutes: 15,
          requiresStaff: true,
        },
        {
          id: "appointment-processing",
          name: "Processing",
          durationMinutes: 35,
          requiresStaff: false,
        },
      ],
    });
  });

  it("copies service values instead of sharing phase objects", () => {
    const service = createService();

    const item = createAppointmentItemFromService({
      id: "appointment-item-1",
      service,
      order: 0,
      createPhaseId: (_, phaseIndex) => `appointment-phase-${phaseIndex}`,
    });

    expect(item.phases[0]).not.toBe(service.phases[0]);
    expect(item.phases[1]).not.toBe(service.phases[1]);
  });

  it("preserves the appointment snapshot after the catalog service changes", () => {
    const service = createService();

    const item = createAppointmentItemFromService({
      id: "appointment-item-1",
      service,
      order: 0,
      createPhaseId: (_, phaseIndex) => `appointment-phase-${phaseIndex}`,
    });

    service.name = "New root color";
    service.price = 70;

    const applicationPhase = service.phases[0];

    if (!applicationPhase) {
      throw new Error("Expected application phase");
    }

    applicationPhase.durationMinutes = 25;

    expect(item.serviceName).toBe("Root color");
    expect(item.price).toBe(55);
    expect(item.phases[0]?.durationMinutes).toBe(15);
  });

  it("uses the requested appointment item order", () => {
    const item = createAppointmentItemFromService({
      id: "appointment-item-1",
      service: createService(),
      order: 3,
      createPhaseId: (_, phaseIndex) => `appointment-phase-${phaseIndex}`,
    });

    expect(item.order).toBe(3);
  });

  it("creates independent identifiers for appointment phases", () => {
    const service = createService();

    const item = createAppointmentItemFromService({
      id: "appointment-item-1",
      service,
      order: 0,
      createPhaseId: (servicePhaseId, phaseIndex) =>
        `snapshot-${servicePhaseId}-${phaseIndex}`,
    });

    expect(item.phases.map((phase) => phase.id)).toEqual([
      "snapshot-application-0",
      "snapshot-processing-1",
    ]);

    expect(item.phases[0]?.id).not.toBe(service.phases[0]?.id);
  });

  it("does not mutate the source service", () => {
    const service = createService();

    const originalService = structuredClone(service);

    createAppointmentItemFromService({
      id: "appointment-item-1",
      service,
      order: 0,
      createPhaseId: (_, phaseIndex) => `appointment-phase-${phaseIndex}`,
    });

    expect(service).toEqual(originalService);
  });
});
