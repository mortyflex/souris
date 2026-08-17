import { describe, expect, it } from "vitest";

import type { Appointment } from "@/domain/appointments/appointment.types";

import { buildAgendaCalendarEvents } from "./build-agenda-calendar-events";

function createTechnicalAppointment(): Appointment {
  return {
    id: "appointment-lynda",
    businessId: "business-1",
    clientId: "client-lynda",
    staffMemberId: "staff-1",
    startAt: new Date(2026, 7, 17, 9, 15),
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

describe("buildAgendaCalendarEvents", () => {
  it("creates calendar events only for staff-required phases", () => {
    const events = buildAgendaCalendarEvents([
      {
        appointment: createTechnicalAppointment(),
        clientName: "Lynda",
        color: "rose",
      },
    ]);

    expect(events).toHaveLength(2);

    expect(events.map((event) => event.id)).toEqual([
      "appointment-lynda:application",
      "appointment-lynda:gloss",
    ]);
  });

  it("preserves exact active phase times", () => {
    const events = buildAgendaCalendarEvents([
      {
        appointment: createTechnicalAppointment(),
        clientName: "Lynda",
        color: "rose",
      },
    ]);

    expect(events[0]?.start).toEqual(new Date(2026, 7, 17, 9, 15));

    expect(events[0]?.end).toEqual(new Date(2026, 7, 17, 9, 30));

    expect(events[1]?.start).toEqual(new Date(2026, 7, 17, 9, 50));

    expect(events[1]?.end).toEqual(new Date(2026, 7, 17, 10, 5));
  });

  it("marks an active phase after processing as a resume", () => {
    const events = buildAgendaCalendarEvents([
      {
        appointment: createTechnicalAppointment(),
        clientName: "Lynda",
        color: "rose",
      },
    ]);

    expect(events[0]?.extendedProps.isResume).toBe(false);

    expect(events[1]?.extendedProps.isResume).toBe(true);

    expect(events[1]?.extendedProps.serviceName).toBe("Gloss");
  });

  it("keeps every segment linked to the original appointment", () => {
    const events = buildAgendaCalendarEvents([
      {
        appointment: createTechnicalAppointment(),
        clientName: "Lynda",
        color: "rose",
      },
    ]);

    expect(
      events.every(
        (event) => event.extendedProps.appointmentId === "appointment-lynda",
      ),
    ).toBe(true);

    expect(events.every((event) => event.groupId === "appointment-lynda")).toBe(
      true,
    );
  });

  it("preserves the visual color across appointment segments", () => {
    const events = buildAgendaCalendarEvents([
      {
        appointment: createTechnicalAppointment(),
        clientName: "Lynda",
        color: "rose",
      },
    ]);

    expect(events.every((event) => event.extendedProps.color === "rose")).toBe(
      true,
    );
  });
});
