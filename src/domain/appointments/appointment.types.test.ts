import { describe, expect, it } from "vitest";

import type {
  Appointment,
  AppointmentItem,
  Service,
  ServicePhase,
} from "./appointment.types";

describe("appointment domain types", () => {
  it("represents a technique with an occupied phase and a processing phase", () => {
    const phases: ServicePhase[] = [
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
    ];

    const service: Service = {
      id: "root-color",
      businessId: "business-1",
      name: "Root color",
      type: "TECHNIQUE",
      price: 55,
      phases,
      active: true,
    };

    expect(service.phases).toHaveLength(2);
    expect(service.phases[0]?.requiresStaff).toBe(true);
    expect(service.phases[1]?.requiresStaff).toBe(false);
  });

  it("allows an appointment item to preserve service snapshot values", () => {
    const item: AppointmentItem = {
      id: "item-1",
      serviceId: "root-color",
      order: 0,
      serviceName: "Root color",
      serviceType: "TECHNIQUE",
      price: 60,
      phases: [
        {
          id: "phase-1",
          name: "Application",
          durationMinutes: 20,
          requiresStaff: true,
        },
        {
          id: "phase-2",
          name: "Processing",
          durationMinutes: 40,
          requiresStaff: false,
        },
      ],
    };

    expect(item.price).toBe(60);
    expect(item.phases[0]?.durationMinutes).toBe(20);
    expect(item.phases[1]?.durationMinutes).toBe(40);
  });

  it("represents an appointment independently from its derived end time", () => {
    const appointment: Appointment = {
      id: "appointment-1",
      businessId: "business-1",
      clientId: "client-1",
      staffMemberId: "staff-1",
      startAt: new Date("2026-08-16T09:00:00.000Z"),
      status: "SCHEDULED",
      items: [],
    };

    expect(appointment.startAt).toBeInstanceOf(Date);
    expect(appointment.status).toBe("SCHEDULED");
    expect("endAt" in appointment).toBe(false);
  });
});
