// @vitest-environment jsdom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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

function createIdFactory(ids: string[]): () => string {
  let index = 0;

  return () => {
    const id = ids[index];

    if (!id) {
      throw new Error("No test ID available.");
    }

    index += 1;

    return id;
  };
}

function renderPanel({
  appointment = createAppointment(),
  onAppointmentChange = vi.fn(),
  onClose = vi.fn(),
  createId = createIdFactory(["generated-item", "generated-phase"]),
}: {
  appointment?: Appointment;
  onAppointmentChange?: (appointment: Appointment) => void;
  onClose?: () => void;
  createId?: () => string;
} = {}) {
  return render(
    <AppointmentDetailsPanel
      appointment={appointment}
      clientName="Lynda"
      color="rose"
      createId={createId}
      onAppointmentChange={onAppointmentChange}
      onClose={onClose}
    />,
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("AppointmentDetailsPanel", () => {
  it("shows the appointment with folded service cards", () => {
    renderPanel();

    expect(
      screen.getByRole("dialog", {
        name: "Rendez-vous de Lynda",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Afficher les détails de Couleur",
      }),
    ).toHaveAttribute("aria-expanded", "false");

    expect(
      screen.getByRole("button", {
        name: "Afficher les détails de Gloss",
      }),
    ).toHaveAttribute("aria-expanded", "false");

    expect(screen.queryByText("Application")).not.toBeInTheDocument();

    expect(screen.queryByText("Pose")).not.toBeInTheDocument();
  });

  it("shows the calculated start time of every service", () => {
    renderPanel();

    expect(screen.getByText("9h15")).toBeInTheDocument();

    expect(screen.getByText("9h50")).toBeInTheDocument();
  });

  it("unfolds and folds a service", () => {
    renderPanel();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Afficher les détails de Couleur",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Masquer les détails de Couleur",
      }),
    ).toHaveAttribute("aria-expanded", "true");

    expect(screen.getByText("Application")).toBeInTheDocument();

    expect(screen.getByText("Pose")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Masquer les détails de Couleur",
      }),
    );

    expect(screen.queryByText("Application")).not.toBeInTheDocument();
  });

  it("does not show the professional wording anymore", () => {
    renderPanel();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Afficher les détails de Couleur",
      }),
    );

    expect(
      screen.queryByText(/Avec la professionnelle/i),
    ).not.toBeInTheDocument();

    expect(screen.getByText("15 min")).toBeInTheDocument();
  });

  it("shows total duration and price in the footer", () => {
    renderPanel();

    expect(screen.getByText("Durée totale")).toBeInTheDocument();

    expect(screen.getByText("50 min")).toBeInTheDocument();

    expect(screen.getByText("Total")).toBeInTheDocument();

    expect(screen.getByText("80,00 €")).toBeInTheDocument();
  });

  it("shows the price editor only when a service is unfolded", () => {
    renderPanel();

    expect(
      screen.queryByRole("spinbutton", {
        name: "Prix de Couleur",
      }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Afficher les détails de Couleur",
      }),
    );

    expect(
      screen.getByRole("spinbutton", {
        name: "Prix de Couleur",
      }),
    ).toHaveValue(55);
  });

  it("allows the price input to be temporarily empty", () => {
    const onAppointmentChange = vi.fn();

    renderPanel({
      onAppointmentChange,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Afficher les détails de Couleur",
      }),
    );

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

    expect(onAppointmentChange).toHaveBeenCalledOnce();

    const updatedAppointment = onAppointmentChange.mock
      .calls[0]?.[0] as Appointment;

    expect(updatedAppointment.items[0]?.price).toBe(60);
  });

  it("restores the previous price when leaving an empty input", () => {
    renderPanel();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Afficher les détails de Couleur",
      }),
    );

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

  it("updates a processing duration from an unfolded technique", () => {
    const onAppointmentChange = vi.fn();

    renderPanel({
      onAppointmentChange,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Afficher les détails de Couleur",
      }),
    );

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

  it("shows delete only inside an unfolded service", () => {
    renderPanel();

    expect(
      screen.queryByRole("button", {
        name: "Supprimer",
      }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Afficher les détails de Couleur",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Supprimer",
      }),
    ).toBeInTheDocument();
  });

  it("removes a service and normalizes the remaining order", () => {
    const onAppointmentChange = vi.fn();

    renderPanel({
      onAppointmentChange,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Afficher les détails de Couleur",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Supprimer",
      }),
    );

    expect(onAppointmentChange).toHaveBeenCalledOnce();

    const updatedAppointment = onAppointmentChange.mock
      .calls[0]?.[0] as Appointment;

    expect(updatedAppointment.items).toHaveLength(1);

    expect(updatedAppointment.items[0]?.serviceName).toBe("Gloss");

    expect(updatedAppointment.items[0]?.order).toBe(0);
  });

  it("prevents removing the final service", () => {
    const appointment = createAppointment();

    appointment.items = [appointment.items[0]!];

    renderPanel({
      appointment,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Afficher les détails de Couleur",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Supprimer",
      }),
    ).toBeDisabled();
  });

  it("shows appointment notes", () => {
    renderPanel();

    expect(screen.getByText("Prévoir le gloss habituel.")).toBeInTheDocument();
  });

  it("opens and closes the service picker", () => {
    renderPanel();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ajouter une prestation",
      }),
    );

    expect(
      screen.getByRole("searchbox", {
        name: "Rechercher une prestation",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Fermer le sélecteur de prestations",
      }),
    );

    expect(
      screen.queryByRole("searchbox", {
        name: "Rechercher une prestation",
      }),
    ).not.toBeInTheDocument();
  });

  it("adds the selected catalog service to the appointment", () => {
    const onAppointmentChange = vi.fn();

    renderPanel({
      onAppointmentChange,
      createId: createIdFactory(["item-brushing", "phase-brushing"]),
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ajouter une prestation",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sélectionner Brushing",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Choisir une option pour Brushing",
      }),
    );

    fireEvent.click(
      screen.getByRole("option", {
        name: /45 min — 25,00\s€/,
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ajouter cette prestation",
      }),
    );

    expect(onAppointmentChange).toHaveBeenCalledOnce();

    const updatedAppointment = onAppointmentChange.mock
      .calls[0]?.[0] as Appointment;

    expect(updatedAppointment.items).toHaveLength(3);

    expect(updatedAppointment.items[2]).toEqual({
      id: "item-brushing",
      serviceId: "svc_009",
      serviceOptionId: "opt_014",
      order: 2,
      serviceName: "Brushing",
      serviceType: "SERVICE",
      price: 25,
      phases: [
        {
          id: "phase-brushing",
          name: "Brushing",
          durationMinutes: 45,
          requiresStaff: true,
        },
      ],
    });

    expect(
      screen.queryByRole("searchbox", {
        name: "Rechercher une prestation",
      }),
    ).not.toBeInTheDocument();
  });

  it("does not close immediately so the exit animation can run", () => {
    vi.useFakeTimers();

    const onClose = vi.fn();

    renderPanel({
      onClose,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Fermer le rendez-vous",
      }),
    );

    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(219);
    });

    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes with Escape after the exit animation", () => {
    vi.useFakeTimers();

    const onClose = vi.fn();

    renderPanel({
      onClose,
    });

    fireEvent.keyDown(window, {
      key: "Escape",
    });

    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(220);
    });

    expect(onClose).toHaveBeenCalledOnce();
  });
});
