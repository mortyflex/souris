// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Appointment } from "@/domain/appointments/appointment.types";

import { AgendaDayView } from "./agenda-day-view";

function createSimpleAppointment({
  id,
  clientId,
  hour,
  minute,
  durationMinutes,
  serviceName = "Coupe",
}: {
  id: string;
  clientId: string;
  hour: number;
  minute: number;
  durationMinutes: number;
  serviceName?: string;
}): Appointment {
  return {
    id,
    businessId: "business-1",
    clientId,
    staffMemberId: "staff-1",
    startAt: new Date(2026, 7, 17, hour, minute),
    status: "CONFIRMED",
    items: [
      {
        id: `item-${id}`,
        serviceId: `service-${id}`,
        order: 0,
        serviceName,
        serviceType: "SERVICE",
        price: 40,
        phases: [
          {
            id: `phase-${id}`,
            name: serviceName,
            durationMinutes,
            requiresStaff: true,
          },
        ],
      },
    ],
  };
}

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

describe("AgendaDayView", () => {
  it("renders the day timeline", () => {
    render(
      <AgendaDayView
        appointments={[]}
        dayEndAt={new Date(2026, 7, 17, 12, 0)}
        dayStartAt={new Date(2026, 7, 17, 8, 0)}
      />,
    );

    expect(
      screen.getByRole("region", {
        name: "Agenda de la journée",
      }),
    ).toBeInTheDocument();
  });

  it("renders a simple appointment as one active phase", () => {
    render(
      <AgendaDayView
        appointments={[
          {
            appointment: createSimpleAppointment({
              id: "appointment-sofia",
              clientId: "client-sofia",
              hour: 9,
              minute: 30,
              durationMinutes: 20,
              serviceName: "Coupe",
            }),
            clientName: "Sofia",
            color: "lavender",
          },
        ]}
        dayEndAt={new Date(2026, 7, 17, 12, 0)}
        dayStartAt={new Date(2026, 7, 17, 8, 0)}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Sofia",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Coupe")).toBeInTheDocument();

    expect(screen.getByText("09:30")).toBeInTheDocument();

    expect(screen.getByText("20 min")).toBeInTheDocument();
  });

  it("renders every technical appointment phase independently", () => {
    const { container } = render(
      <AgendaDayView
        appointments={[
          {
            appointment: createTechnicalAppointment(),
            clientName: "Lynda",
            color: "rose",
          },
        ]}
        dayEndAt={new Date(2026, 7, 17, 12, 0)}
        dayStartAt={new Date(2026, 7, 17, 8, 0)}
      />,
    );

    expect(
      container.querySelector('[data-agenda-phase-id="application"]'),
    ).toBeInTheDocument();

    expect(
      container.querySelector('[data-agenda-phase-id="processing"]'),
    ).toBeInTheDocument();

    expect(
      container.querySelector('[data-agenda-phase-id="gloss"]'),
    ).toBeInTheDocument();
  });

  it("positions technical phases at their exact minute offsets", () => {
    const { container } = render(
      <AgendaDayView
        appointments={[
          {
            appointment: createTechnicalAppointment(),
            clientName: "Lynda",
            color: "rose",
          },
        ]}
        dayEndAt={new Date(2026, 7, 17, 12, 0)}
        dayStartAt={new Date(2026, 7, 17, 8, 0)}
      />,
    );

    expect(
      container.querySelector('[data-agenda-phase-id="application"]'),
    ).toHaveStyle({
      top: "150px",
      height: "30px",
    });

    expect(
      container.querySelector('[data-agenda-phase-id="processing"]'),
    ).toHaveStyle({
      top: "180px",
      height: "40px",
    });

    expect(
      container.querySelector('[data-agenda-phase-id="gloss"]'),
    ).toHaveStyle({
      top: "220px",
      height: "30px",
    });
  });

  it("marks a phase after processing as a resume", () => {
    render(
      <AgendaDayView
        appointments={[
          {
            appointment: createTechnicalAppointment(),
            clientName: "Lynda",
            color: "rose",
          },
        ]}
        dayEndAt={new Date(2026, 7, 17, 12, 0)}
        dayStartAt={new Date(2026, 7, 17, 8, 0)}
      />,
    );

    expect(screen.getByText("Reprise · Gloss")).toBeInTheDocument();

    expect(screen.getByText("Reprise 09:50")).toBeInTheDocument();
  });

  it("allows an active appointment during another appointment processing phase", () => {
    const technicalAppointment = createTechnicalAppointment();

    const sofiaAppointment = createSimpleAppointment({
      id: "appointment-sofia",
      clientId: "client-sofia",
      hour: 9,
      minute: 30,
      durationMinutes: 20,
      serviceName: "Coupe",
    });

    const { container } = render(
      <AgendaDayView
        appointments={[
          {
            appointment: technicalAppointment,
            clientName: "Lynda",
            color: "rose",
          },
          {
            appointment: sofiaAppointment,
            clientName: "Sofia",
            color: "lavender",
          },
        ]}
        dayEndAt={new Date(2026, 7, 17, 12, 0)}
        dayStartAt={new Date(2026, 7, 17, 8, 0)}
      />,
    );

    expect(
      container.querySelector(
        '[data-agenda-phase-id="phase-appointment-sofia"]',
      ),
    ).toHaveAttribute("data-column-index", "0");

    expect(
      container.querySelector(
        '[data-agenda-phase-id="phase-appointment-sofia"]',
      ),
    ).toHaveAttribute("data-column-count", "1");
  });

  it("creates separate columns only when active phases overlap", () => {
    const firstAppointment = createSimpleAppointment({
      id: "appointment-1",
      clientId: "client-1",
      hour: 9,
      minute: 30,
      durationMinutes: 30,
    });

    const secondAppointment = createSimpleAppointment({
      id: "appointment-2",
      clientId: "client-2",
      hour: 9,
      minute: 45,
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
        dayEndAt={new Date(2026, 7, 17, 12, 0)}
        dayStartAt={new Date(2026, 7, 17, 8, 0)}
      />,
    );

    expect(
      container.querySelector('[data-agenda-phase-id="phase-appointment-1"]'),
    ).toHaveAttribute("data-column-count", "2");

    expect(
      container.querySelector('[data-agenda-phase-id="phase-appointment-2"]'),
    ).toHaveAttribute("data-column-index", "1");
  });
});
