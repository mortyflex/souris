// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, type Mock, vi } from "vitest";

import type { Appointment } from "@/domain/appointments/appointment.types";

import { AppointmentLifecycleActions } from "./appointment-lifecycle-actions";

type AppointmentChangeMock = Mock<(appointment: Appointment) => void>;

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
        serviceId: "svc-1",
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

function renderActions({
  appointment = createAppointment(),
  onAppointmentChange = vi.fn<(appointment: Appointment) => void>(),
  now = new Date("2026-08-22T10:30:00.000Z"),
}: {
  appointment?: Appointment;
  onAppointmentChange?: AppointmentChangeMock;
  now?: Date;
} = {}) {
  render(
    <AppointmentLifecycleActions
      appointment={appointment}
      clientName="Lynda"
      getNow={() => now}
      onAppointmentChange={onAppointmentChange}
    />,
  );

  return {
    onAppointmentChange,
  };
}

describe("AppointmentLifecycleActions", () => {
  it("shows cancellation and no-show actions for an active appointment", () => {
    renderActions();

    expect(
      screen.getByRole("button", {
        name: "Annuler le rendez-vous",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Marquer comme no-show",
      }),
    ).toBeInTheDocument();
  });

  it("opens cancellation in a modal without changing the appointment", () => {
    const { onAppointmentChange } = renderActions();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Annuler le rendez-vous",
      }),
    );

    expect(
      screen.getByRole("dialog", {
        name: "Annulation du rendez-vous",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Annuler le rendez-vous ?")).toBeInTheDocument();

    expect(onAppointmentChange).not.toHaveBeenCalled();
  });

  it("records a cancellation made by the client", () => {
    const now = new Date("2026-08-22T10:30:00.000Z");

    const { onAppointmentChange } = renderActions({
      now,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Annuler le rendez-vous",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "La cliente",
      }),
    ).toHaveAttribute("aria-pressed", "true");

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Motif d’annulation",
      }),
      {
        target: {
          value: "Empêchement personnel",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirmer l’annulation",
      }),
    );

    expect(onAppointmentChange).toHaveBeenCalledOnce();

    const updatedAppointment = onAppointmentChange.mock.calls[0]?.[0];

    expect(updatedAppointment?.status).toBe("CANCELLED");

    expect(updatedAppointment?.cancellation).toEqual({
      cancelledAt: now,
      cancelledBy: "CLIENT",
      reason: "Empêchement personnel",
    });

    expect(
      screen.queryByRole("dialog", {
        name: "Annulation du rendez-vous",
      }),
    ).not.toBeInTheDocument();
  });

  it("records a cancellation made by the business", () => {
    const { onAppointmentChange } = renderActions();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Annuler le rendez-vous",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Le salon",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Le salon",
      }),
    ).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirmer l’annulation",
      }),
    );

    const updatedAppointment = onAppointmentChange.mock.calls[0]?.[0];

    expect(updatedAppointment?.cancellation?.cancelledBy).toBe("BUSINESS");
  });

  it("requires modal confirmation before recording a no-show", () => {
    const { onAppointmentChange } = renderActions();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Marquer comme no-show",
      }),
    );

    expect(onAppointmentChange).not.toHaveBeenCalled();

    expect(
      screen.getByRole("dialog", {
        name: "Confirmation du no-show",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Marquer comme no-show ?")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirmer le no-show",
      }),
    );

    expect(onAppointmentChange).toHaveBeenCalledOnce();

    const updatedAppointment = onAppointmentChange.mock.calls[0]?.[0];

    expect(updatedAppointment?.status).toBe("NO_SHOW");

    expect(updatedAppointment?.noShow).toEqual({
      recordedAt: new Date("2026-08-22T10:30:00.000Z"),
    });
  });

  it("can return from a pending cancellation", () => {
    const { onAppointmentChange } = renderActions();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Annuler le rendez-vous",
      }),
    );

    expect(screen.getByText("Qui annule ?")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Retour",
      }),
    );

    expect(
      screen.queryByRole("dialog", {
        name: "Annulation du rendez-vous",
      }),
    ).not.toBeInTheDocument();

    expect(onAppointmentChange).not.toHaveBeenCalled();

    expect(
      screen.getByRole("button", {
        name: "Annuler le rendez-vous",
      }),
    ).toBeInTheDocument();
  });

  it("closes a pending no-show modal with Escape", () => {
    const { onAppointmentChange } = renderActions();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Marquer comme no-show",
      }),
    );

    const dialog = screen.getByRole("dialog", {
      name: "Confirmation du no-show",
    });

    fireEvent.keyDown(dialog, {
      key: "Escape",
    });

    expect(
      screen.queryByRole("dialog", {
        name: "Confirmation du no-show",
      }),
    ).not.toBeInTheDocument();

    expect(onAppointmentChange).not.toHaveBeenCalled();
  });

  it("shows who cancelled a cancelled appointment", () => {
    const appointment = createAppointment("CANCELLED");

    appointment.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: "CLIENT",
      reason: "Empêchement",
    };

    renderActions({
      appointment,
    });

    expect(screen.getByText("Annulé par la cliente")).toBeInTheDocument();

    expect(screen.getByText("Empêchement")).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Marquer comme no-show",
      }),
    ).not.toBeInTheDocument();
  });

  it("shows a no-show outcome", () => {
    const appointment = createAppointment("NO_SHOW");

    appointment.noShow = {
      recordedAt: new Date(),
    };

    renderActions({
      appointment,
    });

    expect(screen.getByText("No-show")).toBeInTheDocument();

    expect(
      screen.getByText(/Lynda ne s’est pas présentée/),
    ).toBeInTheDocument();
  });

  it("shows a completed appointment without lifecycle actions", () => {
    renderActions({
      appointment: createAppointment("COMPLETED"),
    });

    expect(screen.getByText("Rendez-vous terminé")).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Annuler le rendez-vous",
      }),
    ).not.toBeInTheDocument();
  });
});
