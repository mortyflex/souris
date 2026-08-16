// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Appointment } from "@/domain/appointments/appointment.types";

import { AgendaAppointmentCard } from "./agenda-appointment-card";

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
        id: "root-color-item",
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
    ],
  };
}

describe("AgendaAppointmentCard", () => {
  it("displays the client and appointment service", () => {
    render(
      <AgendaAppointmentCard
        appointment={createAppointment()}
        clientName="Lynda"
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Lynda",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Couleur racines")).toBeInTheDocument();
  });

  it("displays the start and derived end times", () => {
    render(
      <AgendaAppointmentCard
        appointment={createAppointment()}
        clientName="Lynda"
      />,
    );

    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("09:50")).toBeInTheDocument();
  });

  it("displays occupied and processing phases", () => {
    render(
      <AgendaAppointmentCard
        appointment={createAppointment()}
        clientName="Lynda"
      />,
    );

    expect(screen.getByText("Application · 15 min")).toBeInTheDocument();

    expect(screen.getByText("Pose · 35 min")).toBeInTheDocument();
  });

  it("displays the derived appointment duration", () => {
    render(
      <AgendaAppointmentCard
        appointment={createAppointment()}
        clientName="Lynda"
      />,
    );

    expect(screen.getByText("50 min")).toBeInTheDocument();

    expect(screen.getByText("15 min occupées")).toBeInTheDocument();
  });

  it("displays the appointment snapshot price", () => {
    render(
      <AgendaAppointmentCard
        appointment={createAppointment()}
        clientName="Lynda"
      />,
    );

    expect(screen.getByText(/55/)).toBeInTheDocument();
  });

  it("exposes the appointment identifier on the card", () => {
    const { container } = render(
      <AgendaAppointmentCard
        appointment={createAppointment()}
        clientName="Lynda"
      />,
    );

    expect(
      container.querySelector('[data-appointment-id="appointment-1"]'),
    ).toBeInTheDocument();
  });
});
