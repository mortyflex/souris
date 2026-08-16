import { describe, expect, it } from "vitest";

import type { Appointment, Service } from "./appointment.types";
import { addServiceToAppointment } from "./addServiceToAppointment";
import { buildAppointmentTimeline } from "./buildAppointmentTimeline";

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
        id: "cut-item",
        serviceId: "cut",
        order: 0,
        serviceName: "Cut",
        serviceType: "SERVICE",
        price: 30,
        phases: [
          {
            id: "cut-phase",
            name: "Cut",
            durationMinutes: 30,
            requiresStaff: true,
          },
        ],
      },
    ],
  };
}

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

describe("addServiceToAppointment", () => {
  it("adds a service snapshot to the appointment", () => {
    const appointment = createAppointment();
    const service = createService();

    const updatedAppointment = addServiceToAppointment({
      appointment,
      service,
      appointmentItemId: "root-color-item",
      createPhaseId: (servicePhaseId) => `appointment-${servicePhaseId}`,
    });

    expect(updatedAppointment.items).toHaveLength(2);

    expect(updatedAppointment.items[1]).toEqual({
      id: "root-color-item",
      serviceId: "root-color",
      order: 1,
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

  it("places the new service after existing appointment items", () => {
    const updatedAppointment = addServiceToAppointment({
      appointment: createAppointment(),
      service: createService(),
      appointmentItemId: "root-color-item",
      createPhaseId: (_, phaseIndex) => `root-color-phase-${phaseIndex}`,
    });

    expect(
      updatedAppointment.items.map((item) => ({
        id: item.id,
        order: item.order,
      })),
    ).toEqual([
      {
        id: "cut-item",
        order: 0,
      },
      {
        id: "root-color-item",
        order: 1,
      },
    ]);
  });

  it("does not mutate the original appointment", () => {
    const appointment = createAppointment();

    const updatedAppointment = addServiceToAppointment({
      appointment,
      service: createService(),
      appointmentItemId: "root-color-item",
      createPhaseId: (_, phaseIndex) => `root-color-phase-${phaseIndex}`,
    });

    expect(updatedAppointment).not.toBe(appointment);
    expect(updatedAppointment.items).not.toBe(appointment.items);

    expect(appointment.items).toHaveLength(1);
    expect(updatedAppointment.items).toHaveLength(2);
  });

  it("does not mutate the source service", () => {
    const service = createService();
    const originalService = structuredClone(service);

    addServiceToAppointment({
      appointment: createAppointment(),
      service,
      appointmentItemId: "root-color-item",
      createPhaseId: (_, phaseIndex) => `root-color-phase-${phaseIndex}`,
    });

    expect(service).toEqual(originalService);
  });

  it("keeps the appointment snapshot independent from future catalog changes", () => {
    const service = createService();

    const updatedAppointment = addServiceToAppointment({
      appointment: createAppointment(),
      service,
      appointmentItemId: "root-color-item",
      createPhaseId: (_, phaseIndex) => `root-color-phase-${phaseIndex}`,
    });

    service.name = "Root color premium";
    service.price = 70;

    const applicationPhase = service.phases[0];

    if (!applicationPhase) {
      throw new Error("Expected application phase");
    }

    applicationPhase.durationMinutes = 25;

    const addedItem = updatedAppointment.items[1];

    expect(addedItem?.serviceName).toBe("Root color");
    expect(addedItem?.price).toBe(55);
    expect(addedItem?.phases[0]?.durationMinutes).toBe(15);
  });

  it("automatically extends the derived appointment timeline", () => {
    const updatedAppointment = addServiceToAppointment({
      appointment: createAppointment(),
      service: createService(),
      appointmentItemId: "root-color-item",
      createPhaseId: (_, phaseIndex) => `root-color-phase-${phaseIndex}`,
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
        phaseId: "cut-phase",
        startAt: "2026-08-16T09:00:00.000Z",
        endAt: "2026-08-16T09:30:00.000Z",
      },
      {
        phaseId: "root-color-phase-0",
        startAt: "2026-08-16T09:30:00.000Z",
        endAt: "2026-08-16T09:45:00.000Z",
      },
      {
        phaseId: "root-color-phase-1",
        startAt: "2026-08-16T09:45:00.000Z",
        endAt: "2026-08-16T10:20:00.000Z",
      },
    ]);
  });

  it("uses order zero when adding the first service to an empty appointment", () => {
    const emptyAppointment: Appointment = {
      ...createAppointment(),
      items: [],
    };

    const updatedAppointment = addServiceToAppointment({
      appointment: emptyAppointment,
      service: createService(),
      appointmentItemId: "root-color-item",
      createPhaseId: (_, phaseIndex) => `root-color-phase-${phaseIndex}`,
    });

    expect(updatedAppointment.items[0]?.order).toBe(0);
  });
});
