// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Appointment } from "@/domain/appointments/appointment.types";

import { AgendaDayEvent } from "./agenda-day-event";

function createAppointment(): Appointment {
  return {
    id: "appointment-1",
    businessId: "business-1",
    clientId: "client-1",
    staffMemberId: "staff-1",
    startAt: new Date(2026, 7, 16, 9, 0),
    status: "CONFIRMED",
    items: [
      {
        id: "color-item",
        serviceId: "root-color",
        order: 0,
        serviceName: "Couleur racines",
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
            durationMinutes: 35,
            requiresStaff: false,
          },
        ],
      },
      {
        id: "blow-dry-item",
        serviceId: "blow-dry",
        order: 1,
        serviceName: "Brushing",
        serviceType: "SERVICE",
        price: 25,
        phases: [
          {
            id: "blow-dry",
            name: "Brushing",
            durationMinutes: 20,
            requiresStaff: true,
          },
        ],
      },
    ],
  };
}

describe("AgendaDayEvent", () => {
  it("displays the client name and service summary", () => {
    render(
      <AgendaDayEvent
        appointment={createAppointment()}
        clientName="Lynda"
        color="rose"
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Lynda",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Couleur racines · Brushing")).toBeInTheDocument();
  });

  it("displays the full time range in standard density", () => {
    render(
      <AgendaDayEvent
        appointment={createAppointment()}
        clientName="Lynda"
        color="rose"
      />,
    );

    expect(screen.getByText("09:00")).toBeInTheDocument();

    expect(screen.getByText("10:10")).toBeInTheDocument();
  });

  it("renders vertical appointment phases in standard density", () => {
    const { container } = render(
      <AgendaDayEvent
        appointment={createAppointment()}
        clientName="Lynda"
        color="rose"
      />,
    );

    expect(
      container.querySelector(
        '[data-phase-id="application"][data-requires-staff="true"]',
      ),
    ).toBeInTheDocument();

    expect(
      container.querySelector(
        '[data-phase-id="processing"][data-requires-staff="false"]',
      ),
    ).toBeInTheDocument();

    expect(
      container.querySelector(
        '[data-phase-id="blow-dry"][data-requires-staff="true"]',
      ),
    ).toBeInTheDocument();
  });

  it("displays phase names in standard density", () => {
    render(
      <AgendaDayEvent
        appointment={createAppointment()}
        clientName="Lynda"
        color="rose"
      />,
    );

    expect(screen.getByText("Application")).toBeInTheDocument();

    expect(screen.getByText("Pose")).toBeInTheDocument();

    expect(
      screen.getByText("Brushing", {
        selector: "span",
      }),
    ).toBeInTheDocument();
  });

  it("shows when the professional is available during processing", () => {
    render(
      <AgendaDayEvent
        appointment={createAppointment()}
        clientName="Lynda"
        color="rose"
      />,
    );

    expect(screen.getByText("Disponible")).toBeInTheDocument();
  });

  it("uses phase duration as vertical proportion", () => {
    const { container } = render(
      <AgendaDayEvent
        appointment={createAppointment()}
        clientName="Lynda"
        color="rose"
      />,
    );

    expect(
      container.querySelector('[data-phase-id="application"]'),
    ).toHaveStyle({
      flexGrow: "15",
    });

    expect(container.querySelector('[data-phase-id="processing"]')).toHaveStyle(
      {
        flexGrow: "35",
      },
    );

    expect(container.querySelector('[data-phase-id="blow-dry"]')).toHaveStyle({
      flexGrow: "20",
    });
  });

  it("displays appointment summary information in detailed density", () => {
    render(
      <AgendaDayEvent
        appointment={createAppointment()}
        clientName="Lynda"
        color="rose"
        density="detailed"
      />,
    );

    expect(screen.getByText("70 min")).toBeInTheDocument();

    expect(screen.getByText("35 min de pose")).toBeInTheDocument();
  });

  it("does not display summary footer in standard density", () => {
    render(
      <AgendaDayEvent
        appointment={createAppointment()}
        clientName="Lynda"
        color="rose"
      />,
    );

    expect(screen.queryByText("70 min")).not.toBeInTheDocument();

    expect(screen.queryByText("35 min de pose")).not.toBeInTheDocument();
  });

  it("uses a reduced presentation in compact density", () => {
    render(
      <AgendaDayEvent
        appointment={createAppointment()}
        clientName="Lynda"
        color="rose"
        density="compact"
      />,
    );

    expect(screen.getByText("09:00")).toBeInTheDocument();

    expect(screen.getByText("10:10")).toBeInTheDocument();

    expect(screen.queryByText("Pose")).not.toBeInTheDocument();

    expect(screen.queryByText("Disponible")).not.toBeInTheDocument();

    expect(screen.queryByText("70 min")).not.toBeInTheDocument();
  });

  it("shows only the start time in extra compact density", () => {
    render(
      <AgendaDayEvent
        appointment={createAppointment()}
        clientName="Lynda"
        color="rose"
        density="extra-compact"
      />,
    );

    expect(screen.getByText("09:00")).toBeInTheDocument();

    expect(screen.queryByText("10:10")).not.toBeInTheDocument();

    expect(screen.queryByText("Pose")).not.toBeInTheDocument();

    expect(screen.queryByText("70 min")).not.toBeInTheDocument();
  });

  it("exposes the event identifier and density", () => {
    const { container } = render(
      <AgendaDayEvent
        appointment={createAppointment()}
        clientName="Lynda"
        color="rose"
        density="detailed"
      />,
    );

    const event = container.querySelector(
      '[data-agenda-day-event-id="appointment-1"]',
    );

    expect(event).toBeInTheDocument();

    expect(event).toHaveAttribute("data-density", "detailed");
  });
});
