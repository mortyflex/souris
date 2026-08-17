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

    expect(screen.getByText("08:00")).toBeInTheDocument();

    expect(screen.getByText("09:00")).toBeInTheDocument();
  });

  it("renders a simple appointment as one active phase", () => {
    const { container } = render(
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

    expect(
      container.querySelector(
        '[data-agenda-phase-id="phase-appointment-sofia"]',
      ),
    ).toHaveStyle({
      top: "270px",
      height: "60px",
    });
  });

  it("renders only staff-required phases from a technical appointment", () => {
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
      container.querySelector('[data-agenda-phase-id="gloss"]'),
    ).toBeInTheDocument();

    expect(
      container.querySelector('[data-agenda-phase-id="processing"]'),
    ).not.toBeInTheDocument();
  });

  it("positions visible technical phases at their exact minute offsets", () => {
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
      top: "225px",
      height: "45px",
    });

    expect(
      container.querySelector('[data-agenda-phase-id="gloss"]'),
    ).toHaveStyle({
      top: "330px",
      height: "45px",
    });

    expect(
      container.querySelector('[data-agenda-phase-id="processing"]'),
    ).not.toBeInTheDocument();
  });

  it("marks the active phase after processing as a resume", () => {
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

    expect(screen.getByText("Reprise · Gloss")).toBeInTheDocument();

    expect(
      container.querySelector(
        '[data-agenda-phase-id="gloss"] [data-resume="true"]',
      ),
    ).toBeInTheDocument();
  });

  it("allows an active appointment to use the full column during processing time", () => {
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

    const sofiaPhase = container.querySelector(
      '[data-agenda-phase-id="phase-appointment-sofia"]',
    );

    expect(sofiaPhase).toHaveAttribute("data-column-index", "0");

    expect(sofiaPhase).toHaveAttribute("data-column-count", "1");
  });

  it("places overlapping active phases in separate columns", () => {
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

    const firstPhase = container.querySelector(
      '[data-agenda-phase-id="phase-appointment-1"]',
    );

    const secondPhase = container.querySelector(
      '[data-agenda-phase-id="phase-appointment-2"]',
    );

    expect(firstPhase).toHaveAttribute("data-column-count", "2");

    expect(firstPhase).toHaveAttribute("data-column-index", "0");

    expect(secondPhase).toHaveAttribute("data-column-count", "2");

    expect(secondPhase).toHaveAttribute("data-column-index", "1");
  });
});
