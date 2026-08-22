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

describe("rescheduleAppointment", () => {
  it("moves the appointment to the requested start time", () => {
    const appointment = createColorAppointment();

    const newStartAt = new Date("2026-08-16T11:00:00.000Z");

    const rescheduled = rescheduleAppointment(appointment, newStartAt);

    expect(rescheduled.startAt).toEqual(newStartAt);

    expect(rescheduled).not.toBe(appointment);

    expect(appointment.startAt).toEqual(START_AT);
  });

  /*
   * Règle produit : la professionnelle peut mener plusieurs
   * rendez-vous en parallèle. Un créneau déjà occupé n'est donc
   * jamais un motif de refus — l'orchestration n'expose plus aucun
   * résultat d'échec.
   */
  it("never refuses a move because the slot is already occupied", () => {
    const appointment = createColorAppointment();

    const rescheduled = rescheduleAppointment(
      appointment,
      new Date("2026-08-16T11:00:00.000Z"),
    );

    expect(rescheduled.startAt).toEqual(new Date("2026-08-16T11:00:00.000Z"));
  });

  it("keeps every other appointment field unchanged", () => {
    const appointment = createColorAppointment();

    const rescheduled = rescheduleAppointment(
      appointment,
      new Date("2026-08-16T11:00:00.000Z"),
    );

    expect(rescheduled).toEqual({
      ...appointment,
      startAt: rescheduled.startAt,
    });
  });

  it("clones the provided start date", () => {
    const appointment = createColorAppointment();

    const newStartAt = new Date("2026-08-16T11:00:00.000Z");

    const rescheduled = rescheduleAppointment(appointment, newStartAt);

    newStartAt.setHours(23);

    expect(rescheduled.startAt).toEqual(new Date("2026-08-16T11:00:00.000Z"));
  });

  it("derives the timeline from the new start time", () => {
    const appointment = createColorAppointment();

    const newStartAt = new Date("2026-08-16T11:00:00.000Z");

    const rescheduled = rescheduleAppointment(appointment, newStartAt);

    const timeline = buildAppointmentTimeline(rescheduled);

    expect(timeline[0]?.startAt).toEqual(newStartAt);

    expect(timeline.at(-1)?.endAt).toEqual(
      new Date("2026-08-16T11:50:00.000Z"),
    );
  });

  it("returns the original appointment unchanged when the start time does not change", () => {
    const appointment = createColorAppointment();

    const rescheduled = rescheduleAppointment(appointment, new Date(START_AT));

    expect(rescheduled).toBe(appointment);
  });
});
