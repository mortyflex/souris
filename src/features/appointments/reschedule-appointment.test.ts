import { describe, expect, it } from "vitest";

import type { Appointment } from "@/domain/appointments/appointment.types";
import { buildAppointmentTimeline } from "@/domain/appointments/buildAppointmentTimeline";

import { rescheduleAppointment } from "./reschedule-appointment";

const START_AT = new Date("2026-08-16T09:00:00.000Z");

function createColorAppointment(): Appointment {
  return {
    id: "appointment-color",
    businessId: "business-1",
    clientId: "client-lynda",
    staffMemberId: "staff-1",
    startAt: new Date(START_AT),
    status: "CONFIRMED",
    items: [
      {
        id: "item-color",
        serviceId: "service-color",
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
        id: "item-gloss",
        serviceId: "service-gloss",
        order: 1,
        serviceName: "Gloss",
        serviceType: "SERVICE",
        price: 25,
        phases: [
          {
            id: "gloss",
            name: "Gloss",
            durationMinutes: 15,
            requiresStaff: true,
          },
        ],
      },
    ],
  };
}

/**
 * Crée un rendez-vous simple dont la professionnelle est occupée
 * pendant `activeDurationMinutes` à partir de `startAt`, suivi d'un
 * temps de pose de `processingDurationMinutes`.
 */
function createOccupyingAppointment({
  id,
  startAt,
  activeDurationMinutes,
  processingDurationMinutes = 0,
  staffMemberId = "staff-1",
  status = "SCHEDULED",
}: {
  id: string;
  startAt: string;
  activeDurationMinutes: number;
  processingDurationMinutes?: number;
  staffMemberId?: string;
  status?: Appointment["status"];
}): Appointment {
  const phases = [
    {
      id: `${id}-active`,
      name: "Prestation",
      durationMinutes: activeDurationMinutes,
      requiresStaff: true,
    },
  ];

  if (processingDurationMinutes > 0) {
    phases.push({
      id: `${id}-processing`,
      name: "Pose",
      durationMinutes: processingDurationMinutes,
      requiresStaff: false,
    });
  }

  return {
    id,
    businessId: "business-1",
    clientId: `client-${id}`,
    staffMemberId,
    startAt: new Date(startAt),
    status,
    items: [
      {
        id: `item-${id}`,
        serviceId: `service-${id}`,
        order: 0,
        serviceName: "Prestation",
        serviceType: "SERVICE",
        price: 30,
        phases,
      },
    ],
  };
}

describe("rescheduleAppointment", () => {
  it("moves the appointment to a free start time", () => {
    const appointment = createColorAppointment();

    const newStartAt = new Date("2026-08-16T11:00:00.000Z");

    const result = rescheduleAppointment(appointment, newStartAt, []);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.appointment.startAt).toEqual(newStartAt);

    expect(result.appointment).not.toBe(appointment);

    expect(appointment.startAt).toEqual(START_AT);
  });

  it("keeps every other appointment field unchanged", () => {
    const appointment = createColorAppointment();

    const result = rescheduleAppointment(
      appointment,
      new Date("2026-08-16T11:00:00.000Z"),
      [],
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.appointment).toEqual({
      ...appointment,
      startAt: result.appointment.startAt,
    });
  });

  it("derives the timeline from the new start time", () => {
    const appointment = createColorAppointment();

    const newStartAt = new Date("2026-08-16T11:00:00.000Z");

    const result = rescheduleAppointment(appointment, newStartAt, []);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    const timeline = buildAppointmentTimeline(result.appointment);

    expect(timeline[0]?.startAt).toEqual(newStartAt);

    expect(timeline.at(-1)?.endAt).toEqual(
      new Date("2026-08-16T11:50:00.000Z"),
    );
  });

  it("rejects a move that overlaps an occupied phase of another appointment", () => {
    const appointment = createColorAppointment();

    const occupying = createOccupyingAppointment({
      id: "other",
      startAt: "2026-08-16T10:55:00.000Z",
      activeDurationMinutes: 30,
    });

    const result = rescheduleAppointment(
      appointment,
      new Date("2026-08-16T11:00:00.000Z"),
      [occupying],
    );

    expect(result).toEqual({
      ok: false,
      reason: "CONFLICT",
    });
  });

  it("accepts a move happening only during another appointment processing phase", () => {
    const appointment = createColorAppointment();

    // Professionnelle occupée 10:30–10:45, puis en pose 10:45–11:45.
    const occupying = createOccupyingAppointment({
      id: "other",
      startAt: "2026-08-16T10:30:00.000Z",
      activeDurationMinutes: 15,
      processingDurationMinutes: 60,
    });

    // Candidat : phases actives 11:00–11:15 et 11:35–11:50,
    // uniquement pendant / après la pose de l'autre rendez-vous.
    const result = rescheduleAppointment(
      appointment,
      new Date("2026-08-16T11:00:00.000Z"),
      [occupying],
    );

    expect(result.ok).toBe(true);
  });

  it("does not conflict with its own previous position", () => {
    const appointment = createColorAppointment();

    // 09:10 chevauche l'ancienne phase active 09:00–09:15 du même
    // rendez-vous : seule sa propre ancienne position peut bloquer.
    const result = rescheduleAppointment(
      appointment,
      new Date("2026-08-16T09:10:00.000Z"),
      [appointment],
    );

    expect(result.ok).toBe(true);
  });

  it("accepts a move starting exactly when another occupied phase ends", () => {
    const appointment = createColorAppointment();

    const occupying = createOccupyingAppointment({
      id: "other",
      startAt: "2026-08-16T10:30:00.000Z",
      activeDurationMinutes: 30,
    });

    const result = rescheduleAppointment(
      appointment,
      new Date("2026-08-16T11:00:00.000Z"),
      [occupying],
    );

    expect(result.ok).toBe(true);
  });

  it("returns the original appointment unchanged when the start time does not change", () => {
    const appointment = createColorAppointment();

    const result = rescheduleAppointment(
      appointment,
      new Date(START_AT),
      [],
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.appointment).toBe(appointment);
  });

  it("is not blocked by cancelled or no-show appointments", () => {
    const appointment = createColorAppointment();

    const cancelled = createOccupyingAppointment({
      id: "cancelled",
      startAt: "2026-08-16T10:55:00.000Z",
      activeDurationMinutes: 30,
      status: "CANCELLED",
    });

    const noShow = createOccupyingAppointment({
      id: "no-show",
      startAt: "2026-08-16T10:55:00.000Z",
      activeDurationMinutes: 30,
      status: "NO_SHOW",
    });

    const result = rescheduleAppointment(
      appointment,
      new Date("2026-08-16T11:00:00.000Z"),
      [cancelled, noShow],
    );

    expect(result.ok).toBe(true);
  });

  it("ignores appointments of another staff member", () => {
    const appointment = createColorAppointment();

    const occupying = createOccupyingAppointment({
      id: "other-staff",
      startAt: "2026-08-16T10:55:00.000Z",
      activeDurationMinutes: 30,
      staffMemberId: "staff-2",
    });

    const result = rescheduleAppointment(
      appointment,
      new Date("2026-08-16T11:00:00.000Z"),
      [occupying],
    );

    expect(result.ok).toBe(true);
  });
});
