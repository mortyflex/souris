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

  it("renders appointments belonging to the visible day window", () => {
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
      hour: 10,
      minute: 0,
      durationMinutes: 45,
    });

    render(
      <AgendaDayView
        appointments={[
          {
            appointment: firstAppointment,
            clientName: "Lynda",
          },
          {
            appointment: secondAppointment,
            clientName: "Sofia",
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

  it("positions an appointment according to its start time", () => {
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
          },
        ]}
        dayEndAt={new Date(2026, 7, 16, 12, 0)}
        dayStartAt={new Date(2026, 7, 16, 8, 0)}
      />,
    );

    const appointmentElement = container.querySelector(
      '[data-agenda-appointment-id="appointment-1"]',
    );

    expect(appointmentElement).toHaveStyle({
      gridRow: "5 / span 2",
    });
  });

  it("uses the full derived appointment duration for its height", () => {
    const appointment: Appointment = {
      id: "appointment-1",
      businessId: "business-1",
      clientId: "client-1",
      staffMemberId: "staff-1",
      startAt: new Date(2026, 7, 16, 9, 0),
      status: "CONFIRMED",
      items: [
        {
          id: "color-item",
          serviceId: "color",
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
              durationMinutes: 30,
              requiresStaff: false,
            },
            {
              id: "finish",
              name: "Finition",
              durationMinutes: 15,
              requiresStaff: true,
            },
          ],
        },
      ],
    };

    const { container } = render(
      <AgendaDayView
        appointments={[
          {
            appointment,
            clientName: "Lynda",
          },
        ]}
        dayEndAt={new Date(2026, 7, 16, 12, 0)}
        dayStartAt={new Date(2026, 7, 16, 8, 0)}
      />,
    );

    const appointmentElement = container.querySelector(
      '[data-agenda-appointment-id="appointment-1"]',
    );

    expect(appointmentElement).toHaveStyle({
      gridRow: "5 / span 4",
    });
  });

  it("does not render an appointment outside the visible day window", () => {
    const appointment = createAppointment({
      id: "appointment-1",
      clientId: "client-1",
      hour: 7,
      minute: 0,
      durationMinutes: 30,
    });

    render(
      <AgendaDayView
        appointments={[
          {
            appointment,
            clientName: "Lynda",
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

  it("sorts appointments by start time", () => {
    const laterAppointment = createAppointment({
      id: "later",
      clientId: "client-2",
      hour: 10,
      minute: 0,
      durationMinutes: 30,
    });

    const earlierAppointment = createAppointment({
      id: "earlier",
      clientId: "client-1",
      hour: 9,
      minute: 0,
      durationMinutes: 30,
    });

    const { container } = render(
      <AgendaDayView
        appointments={[
          {
            appointment: laterAppointment,
            clientName: "Sofia",
          },
          {
            appointment: earlierAppointment,
            clientName: "Lynda",
          },
        ]}
        dayEndAt={new Date(2026, 7, 16, 12, 0)}
        dayStartAt={new Date(2026, 7, 16, 8, 0)}
      />,
    );

    const renderedAppointments = container.querySelectorAll(
      "[data-agenda-appointment-id]",
    );

    expect(
      renderedAppointments[0]?.getAttribute("data-agenda-appointment-id"),
    ).toBe("earlier");

    expect(
      renderedAppointments[1]?.getAttribute("data-agenda-appointment-id"),
    ).toBe("later");
  });
});
