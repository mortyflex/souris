import { describe, expect, it } from "vitest";

import type { Appointment } from "./appointment.types";
import {
  cancelAppointment,
  markAppointmentNoShow,
} from "./appointmentLifecycle";

function createAppointment(
  status: Appointment["status"] = "CONFIRMED",
): Appointment {
  return {
    id: "appointment-1",
    businessId: "business-1",
    clientId: "client-1",
    staffMemberId: "staff-1",
    startAt: new Date("2026-08-22T09:00:00.000Z"),
    status,
    items: [
      {
        id: "item-1",
        serviceId: "service-1",
        order: 0,
        serviceName: "Brushing",
        serviceType: "SERVICE",
        price: 25,
        phases: [
          {
            id: "phase-1",
            name: "Brushing",
            durationMinutes: 45,
            requiresStaff: true,
          },
        ],
      },
    ],
  };
}

describe("appointment lifecycle", () => {
  it("records a cancellation made by the client", () => {
    const appointment = createAppointment();

    const cancelledAt = new Date("2026-08-21T15:30:00.000Z");

    const result = cancelAppointment(appointment, {
      cancelledAt,
      cancelledBy: "CLIENT",
      reason: "  Empêchement personnel  ",
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.appointment.status).toBe("CANCELLED");

    expect(result.appointment.cancellation).toEqual({
      cancelledAt,
      cancelledBy: "CLIENT",
      reason: "Empêchement personnel",
    });

    expect(result.appointment.noShow).toBeUndefined();
  });

  it("records a cancellation made by the business", () => {
    const appointment = createAppointment();

    const cancelledAt = new Date("2026-08-21T10:00:00.000Z");

    const result = cancelAppointment(appointment, {
      cancelledAt,
      cancelledBy: "BUSINESS",
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.appointment.cancellation).toEqual({
      cancelledAt,
      cancelledBy: "BUSINESS",
      reason: undefined,
    });
  });

  it("normalizes an empty cancellation reason", () => {
    const result = cancelAppointment(createAppointment(), {
      cancelledAt: new Date(),
      cancelledBy: "CLIENT",
      reason: "   ",
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.appointment.cancellation?.reason).toBeUndefined();
  });

  it("records a no-show", () => {
    const recordedAt = new Date("2026-08-22T09:15:00.000Z");

    const result = markAppointmentNoShow(createAppointment(), {
      recordedAt,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.appointment.status).toBe("NO_SHOW");

    expect(result.appointment.noShow).toEqual({
      recordedAt,
    });

    expect(result.appointment.cancellation).toBeUndefined();
  });

  it("does not cancel a completed appointment", () => {
    const result = cancelAppointment(createAppointment("COMPLETED"), {
      cancelledAt: new Date(),
      cancelledBy: "CLIENT",
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "APPOINTMENT_COMPLETED",
        message:
          "Un rendez-vous terminé ne peut plus être annulé ou marqué comme no-show.",
      },
    });
  });

  it("does not mark a completed appointment as no-show", () => {
    const result = markAppointmentNoShow(createAppointment("COMPLETED"), {
      recordedAt: new Date(),
    });

    expect(result.ok).toBe(false);

    if (result.ok) {
      return;
    }

    expect(result.error.code).toBe("APPOINTMENT_COMPLETED");
  });

  it("does not cancel an already cancelled appointment", () => {
    const result = cancelAppointment(createAppointment("CANCELLED"), {
      cancelledAt: new Date(),
      cancelledBy: "BUSINESS",
    });

    expect(result.ok).toBe(false);

    if (result.ok) {
      return;
    }

    expect(result.error.code).toBe("APPOINTMENT_CANCELLED");
  });

  it("does not mark an already cancelled appointment as no-show", () => {
    const result = markAppointmentNoShow(createAppointment("CANCELLED"), {
      recordedAt: new Date(),
    });

    expect(result.ok).toBe(false);

    if (result.ok) {
      return;
    }

    expect(result.error.code).toBe("APPOINTMENT_CANCELLED");
  });

  it("does not change an already no-show appointment", () => {
    const result = markAppointmentNoShow(createAppointment("NO_SHOW"), {
      recordedAt: new Date(),
    });

    expect(result.ok).toBe(false);

    if (result.ok) {
      return;
    }

    expect(result.error.code).toBe("APPOINTMENT_NO_SHOW");
  });

  it("does not mutate the original appointment", () => {
    const appointment = createAppointment();

    const result = cancelAppointment(appointment, {
      cancelledAt: new Date(),
      cancelledBy: "CLIENT",
    });

    expect(result.ok).toBe(true);

    expect(appointment.status).toBe("CONFIRMED");

    expect(appointment.cancellation).toBeUndefined();
  });
});
