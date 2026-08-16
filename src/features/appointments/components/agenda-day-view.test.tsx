// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Appointment } from "@/domain/appointments/appointment.types";

import { AgendaDayView } from "./agenda-day-view";

function createAppointment({
  id,
  clientId,
  hour,
  minute,
  durationMinutes,
}: {
  id: string;
  clientId: string;
  hour: number;
  minute: number;
  durationMinutes: number;
}): Appointment {
  return {
    id,
    businessId: "business-1",
    clientId,
    staffMemberId: "staff-1",
    startAt: new Date(2026, 7, 16, hour, minute),
    status: "CONFIRMED",
    items: [
      {
        id: `item-${id}`,
        serviceId: `service-${id}`,
        order: 0,
        serviceName: "Prestation",
        serviceType: "SERVICE",
        price: 40,
        phases: [
          {
            id: `phase-${id}`,
            name: "Prestation",
            durationMinutes,
            requiresStaff: true,
          },
        ],
      },
    ],
  };
}

describe("AgendaDayView", () => {
  it("renders the day timeline", () => {
    render(
      <AgendaDayView
        appointments={[]}
        dayEndAt={new Date(2026, 7, 16, 10, 0)}
        dayStartAt={new Date(2026, 7, 16, 8, 0)}
      />,
    );

    expect(
      screen.getByRole("region", {
        name: "Agenda de la journée",
      }),
    ).toBeInTheDocument();
  });

  it("renders appointments in the visible window", () => {
    render(
      <AgendaDayView
        appointments={[
          {
            appointment: createAppointment({
              id: "appointment-1",
              clientId: "client-1",
              hour: 9,
              minute: 0,
              durationMinutes: 30,
            }),
            clientName: "Lynda",
            color: "rose",
          },
          {
            appointment: createAppointment({
              id: "appointment-2",
              clientId: "client-2",
              hour: 10,
              minute: 0,
              durationMinutes: 45,
            }),
            clientName: "Sofia",
            color: "lavender",
          },
        ]}
        dayEndAt={new Date(2026, 7, 16, 12, 0)}
        dayStartAt={new Date(2026, 7, 16, 8, 0)}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Lynda",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Sofia",
      }),
    ).toBeInTheDocument();
  });

  it("positions an appointment according to its start time and duration", () => {
    const appointment = createAppointment({
      id: "appointment-1",
      clientId: "client-1",
      hour: 9,
      minute: 0,
      durationMinutes: 30,
    });

    const { container } = render(
      <AgendaDayView
        appointments={[
          {
            appointment,
            clientName: "Lynda",
            color: "rose",
          },
        ]}
        dayEndAt={new Date(2026, 7, 16, 12, 0)}
        dayStartAt={new Date(2026, 7, 16, 8, 0)}
      />,
    );

    expect(
      container.querySelector('[data-agenda-appointment-id="appointment-1"]'),
    ).toHaveStyle({
      gridRow: "5 / span 2",
    });
  });

  it("places overlapping appointments in separate columns", () => {
    const firstAppointment = createAppointment({
      id: "appointment-1",
      clientId: "client-1",
      hour: 9,
      minute: 0,
      durationMinutes: 60,
    });

    const secondAppointment = createAppointment({
      id: "appointment-2",
      clientId: "client-2",
      hour: 9,
      minute: 15,
      durationMinutes: 30,
    });

    const { container } = render(
      <AgendaDayView
        appointments={[
          {
            appointment: firstAppointment,
            clientName: "Lynda",
            color: "rose",
          },
          {
            appointment: secondAppointment,
            clientName: "Sofia",
            color: "lavender",
          },
        ]}
        dayEndAt={new Date(2026, 7, 16, 12, 0)}
        dayStartAt={new Date(2026, 7, 16, 8, 0)}
      />,
    );

    const firstElement = container.querySelector(
      '[data-agenda-appointment-id="appointment-1"]',
    );

    const secondElement = container.querySelector(
      '[data-agenda-appointment-id="appointment-2"]',
    );

    expect(firstElement).toHaveAttribute("data-column-count", "2");

    expect(firstElement).toHaveAttribute("data-column-index", "0");

    expect(secondElement).toHaveAttribute("data-column-count", "2");

    expect(secondElement).toHaveAttribute("data-column-index", "1");
  });

  it("reuses a column when appointments do not overlap", () => {
    const firstAppointment = createAppointment({
      id: "appointment-1",
      clientId: "client-1",
      hour: 9,
      minute: 0,
      durationMinutes: 30,
    });

    const secondAppointment = createAppointment({
      id: "appointment-2",
      clientId: "client-2",
      hour: 9,
      minute: 30,
      durationMinutes: 30,
    });

    const { container } = render(
      <AgendaDayView
        appointments={[
          {
            appointment: firstAppointment,
            clientName: "Lynda",
            color: "rose",
          },
          {
            appointment: secondAppointment,
            clientName: "Sofia",
            color: "lavender",
          },
        ]}
        dayEndAt={new Date(2026, 7, 16, 12, 0)}
        dayStartAt={new Date(2026, 7, 16, 8, 0)}
      />,
    );

    expect(
      container.querySelector('[data-agenda-appointment-id="appointment-1"]'),
    ).toHaveAttribute("data-column-count", "1");

    expect(
      container.querySelector('[data-agenda-appointment-id="appointment-2"]'),
    ).toHaveAttribute("data-column-count", "1");
  });

  it("uses extra compact density for a thirty-minute appointment", () => {
    render(
      <AgendaDayView
        appointments={[
          {
            appointment: createAppointment({
              id: "appointment-1",
              clientId: "client-1",
              hour: 9,
              minute: 0,
              durationMinutes: 30,
            }),
            clientName: "Lynda",
            color: "rose",
          },
        ]}
        dayEndAt={new Date(2026, 7, 16, 12, 0)}
        dayStartAt={new Date(2026, 7, 16, 8, 0)}
      />,
    );

    expect(
      document.querySelector('[data-agenda-day-event-id="appointment-1"]'),
    ).toHaveAttribute("data-density", "extra-compact");
  });

  it("uses detailed density for long appointments", () => {
    render(
      <AgendaDayView
        appointments={[
          {
            appointment: createAppointment({
              id: "appointment-1",
              clientId: "client-1",
              hour: 9,
              minute: 0,
              durationMinutes: 90,
            }),
            clientName: "Lynda",
            color: "rose",
          },
        ]}
        dayEndAt={new Date(2026, 7, 16, 12, 0)}
        dayStartAt={new Date(2026, 7, 16, 8, 0)}
      />,
    );

    expect(
      document.querySelector('[data-agenda-day-event-id="appointment-1"]'),
    ).toHaveAttribute("data-density", "detailed");
  });

  it("does not render appointments outside the visible window", () => {
    render(
      <AgendaDayView
        appointments={[
          {
            appointment: createAppointment({
              id: "appointment-1",
              clientId: "client-1",
              hour: 7,
              minute: 0,
              durationMinutes: 30,
            }),
            clientName: "Lynda",
            color: "rose",
          },
        ]}
        dayEndAt={new Date(2026, 7, 16, 12, 0)}
        dayStartAt={new Date(2026, 7, 16, 8, 0)}
      />,
    );

    expect(
      screen.queryByRole("heading", {
        name: "Lynda",
      }),
    ).not.toBeInTheDocument();
  });
});
