// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Appointment } from "@/domain/appointments/appointment.types";

import { AppointmentDetailsPanel } from "./appointment-details-panel";

function createAppointment(): Appointment {
  return {
    id: "appointment-lynda",
    businessId: "business-1",
    clientId: "client-lynda",
    staffMemberId: "staff-1",
    startAt: new Date(2026, 7, 17, 9, 15),
    status: "CONFIRMED",
    notes: "Prévoir le gloss habituel.",
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

function renderPanel({
  onAppointmentChange = vi.fn(),
  onClose = vi.fn(),
}: {
  onAppointmentChange?: (appointment: Appointment) => void;
  onClose?: () => void;
} = {}) {
  return render(
    <AppointmentDetailsPanel
      appointment={createAppointment()}
      clientName="Lynda"
      color="rose"
      onAppointmentChange={onAppointmentChange}
      onClose={onClose}
    />,
  );
}

describe("AppointmentDetailsPanel", () => {
  it("shows the complete appointment", () => {
    renderPanel();

    expect(
      screen.getByRole("dialog", {
        name: "Rendez-vous de Lynda",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Lynda")).toBeInTheDocument();

    expect(screen.getByText("Couleur")).toBeInTheDocument();

    expect(screen.getAllByText("Gloss")).toHaveLength(2);

    expect(screen.getByText("Application")).toBeInTheDocument();

    expect(screen.getByText("Pose")).toBeInTheDocument();
  });

  it("shows total duration and price in the footer", () => {
    renderPanel();

    expect(screen.getByText("Durée totale")).toBeInTheDocument();

    expect(screen.getByText("50 min")).toBeInTheDocument();

    expect(screen.getByText("Total")).toBeInTheDocument();

    expect(screen.getByText("80,00 €")).toBeInTheDocument();
  });

  it("allows the price input to be temporarily empty", () => {
    const onAppointmentChange = vi.fn();

    renderPanel({
      onAppointmentChange,
    });

    const input = screen.getByRole("spinbutton", {
      name: "Prix de Couleur",
    });

    fireEvent.change(input, {
      target: {
        value: "",
      },
    });

    expect(input).toHaveValue(null);

    expect(onAppointmentChange).not.toHaveBeenCalled();

    fireEvent.change(input, {
      target: {
        value: "60",
      },
    });

    expect(input).toHaveValue(60);

    expect(onAppointmentChange).toHaveBeenCalledOnce();

    const updatedAppointment = onAppointmentChange.mock
      .calls[0]?.[0] as Appointment;

    expect(updatedAppointment.items[0]?.price).toBe(60);
  });

  it("allows the processing duration input to be temporarily empty", () => {
    const onAppointmentChange = vi.fn();

    renderPanel({
      onAppointmentChange,
    });

    const input = screen.getByRole("spinbutton", {
      name: "Temps de pose de Pose",
    });

    fireEvent.change(input, {
      target: {
        value: "",
      },
    });

    expect(input).toHaveValue(null);

    expect(onAppointmentChange).not.toHaveBeenCalled();

    fireEvent.change(input, {
      target: {
        value: "35",
      },
    });

    expect(input).toHaveValue(35);

    expect(onAppointmentChange).toHaveBeenCalledOnce();

    const updatedAppointment = onAppointmentChange.mock
      .calls[0]?.[0] as Appointment;

    expect(updatedAppointment.items[0]?.phases[1]?.durationMinutes).toBe(35);
  });

  it("restores the previous value when leaving an empty input", () => {
    renderPanel();

    const input = screen.getByRole("spinbutton", {
      name: "Prix de Couleur",
    });

    fireEvent.change(input, {
      target: {
        value: "",
      },
    });

    expect(input).toHaveValue(null);

    fireEvent.blur(input);

    expect(input).toHaveValue(55);
  });

  it("updates a service price", () => {
    const onAppointmentChange = vi.fn();

    renderPanel({
      onAppointmentChange,
    });

    fireEvent.change(
      screen.getByRole("spinbutton", {
        name: "Prix de Couleur",
      }),
      {
        target: {
          value: "60",
        },
      },
    );

    expect(onAppointmentChange).toHaveBeenCalledOnce();

    const updatedAppointment = onAppointmentChange.mock
      .calls[0]?.[0] as Appointment;

    expect(updatedAppointment.items[0]?.price).toBe(60);
  });

  it("updates a processing duration", () => {
    const onAppointmentChange = vi.fn();

    renderPanel({
      onAppointmentChange,
    });

    fireEvent.change(
      screen.getByRole("spinbutton", {
        name: "Temps de pose de Pose",
      }),
      {
        target: {
          value: "30",
        },
      },
    );

    expect(onAppointmentChange).toHaveBeenCalledOnce();

    const updatedAppointment = onAppointmentChange.mock
      .calls[0]?.[0] as Appointment;

    expect(updatedAppointment.items[0]?.phases[1]?.durationMinutes).toBe(30);
  });

  it("shows active and processing durations", () => {
    renderPanel();

    expect(
      screen.getAllByText("15 min · Avec la professionnelle"),
    ).toHaveLength(2);

    expect(
      screen.getByText("30 min", {
        selector: "strong",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("20 min", {
        selector: "strong",
      }),
    ).toBeInTheDocument();
  });

  it("shows appointment notes", () => {
    renderPanel();

    expect(screen.getByText("Prévoir le gloss habituel.")).toBeInTheDocument();
  });

  it("closes from the close button", () => {
    const onClose = vi.fn();

    renderPanel({
      onClose,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Fermer le rendez-vous",
      }),
    );

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes with Escape", () => {
    const onClose = vi.fn();

    renderPanel({
      onClose,
    });

    fireEvent.keyDown(window, {
      key: "Escape",
    });

    expect(onClose).toHaveBeenCalledOnce();
  });
});
