// @vitest-environment jsdom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AgendaDayAppointment } from "./agenda-day-view";
import {
  CreateAppointmentPanel,
  type CreateAppointmentClient,
} from "./create-appointment-panel";

const demoClients: CreateAppointmentClient[] = [
  {
    id: "client-lynda",
    fullName: "Lynda Haddad",
    phone: "06 12 34 56 78",
    color: "rose",
  },
  {
    id: "client-sofia",
    fullName: "Sofia Benali",
    color: "lavender",
  },
];

function createSequentialId(): () => string {
  let counter = 0;

  return () => {
    counter += 1;

    return `generated-${counter}`;
  };
}

function renderPanel({
  onClose = vi.fn(),
  onCreate = vi.fn(),
}: {
  onClose?: () => void;
  onCreate?: (entry: AgendaDayAppointment) => void;
} = {}) {
  render(
    <CreateAppointmentPanel
      businessId="business-demo"
      clients={demoClients}
      createId={createSequentialId()}
      onClose={onClose}
      onCreate={onCreate}
      staffMemberId="staff-demo"
      startAt={new Date(2026, 7, 22, 14, 0)}
    />,
  );

  return {
    onClose,
    onCreate,
  };
}

function selectClient(fullName: string) {
  fireEvent.click(
    screen.getByRole("button", {
      name: new RegExp(fullName),
    }),
  );
}

function addService(serviceName: string) {
  fireEvent.click(
    screen.getByRole("button", {
      name: "Ajouter une prestation",
    }),
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: `Sélectionner ${serviceName}`,
    }),
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: "Ajouter cette prestation",
    }),
  );
}

function getSubmitButton() {
  return screen.getByRole("button", {
    name: "Créer le rendez-vous",
  });
}

afterEach(() => {
  vi.useRealTimers();
});

describe("CreateAppointmentPanel", () => {
  it("shows the selected slot in the header schedule", () => {
    renderPanel();

    expect(
      screen.getByRole("dialog", {
        name: "Nouveau rendez-vous",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Samedi 22 août")).toBeInTheDocument();

    expect(screen.getByText("14:00")).toBeInTheDocument();
  });

  it("keeps the submit button disabled until a client and a service are chosen", () => {
    renderPanel();

    expect(getSubmitButton()).toBeDisabled();

    selectClient("Lynda Haddad");

    expect(getSubmitButton()).toBeDisabled();

    addService("Couleur Racines");

    expect(getSubmitButton()).toBeEnabled();
  });

  it("filters clients from the search input and allows changing the selection", () => {
    renderPanel();

    fireEvent.change(screen.getByRole("searchbox"), {
      target: {
        value: "sof",
      },
    });

    expect(
      screen.queryByRole("button", {
        name: /Lynda Haddad/,
      }),
    ).not.toBeInTheDocument();

    selectClient("Sofia Benali");

    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();

    expect(screen.getByText("Sofia Benali")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Changer",
      }),
    );

    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("shows duration, end time and total from the domain summary", () => {
    renderPanel();

    selectClient("Lynda Haddad");

    // Couleur Racines : 45 min actives + 20 min de pose, 30 €.
    addService("Couleur Racines");

    expect(screen.getByText("Durée totale")).toBeInTheDocument();

    expect(screen.getByText("65 min")).toBeInTheDocument();

    expect(screen.getByText("Fin prévue")).toBeInTheDocument();

    expect(screen.getByText("15:05")).toBeInTheDocument();

    // L'espace fine insécable d'Intl est normalisée en espace simple
    // par Testing Library.
    expect(screen.getByText("30,00 €")).toBeInTheDocument();
  });

  it("creates a SCHEDULED appointment with the selected client and ordered services", () => {
    vi.useFakeTimers();

    const onCreate = vi.fn();

    renderPanel({
      onCreate,
    });

    selectClient("Lynda Haddad");

    addService("Couleur Racines");

    addService("Coupe Brushing");

    fireEvent.click(getSubmitButton());

    act(() => {
      vi.advanceTimersByTime(220);
    });

    expect(onCreate).toHaveBeenCalledTimes(1);

    const entry = onCreate.mock.calls[0]?.[0] as AgendaDayAppointment;

    expect(entry.clientName).toBe("Lynda Haddad");

    expect(entry.color).toBe("rose");

    expect(entry.appointment.status).toBe("SCHEDULED");

    expect(entry.appointment.businessId).toBe("business-demo");

    expect(entry.appointment.staffMemberId).toBe("staff-demo");

    expect(entry.appointment.clientId).toBe("client-lynda");

    expect(entry.appointment.startAt).toEqual(new Date(2026, 7, 22, 14, 0));

    expect(
      entry.appointment.items.map((item) => [item.serviceName, item.order]),
    ).toEqual([
      ["Couleur Racines", 0],
      ["Coupe Brushing", 1],
    ]);
  });

  it("renormalizes item orders after removing a selected service", () => {
    vi.useFakeTimers();

    const onCreate = vi.fn();

    renderPanel({
      onCreate,
    });

    selectClient("Lynda Haddad");

    addService("Couleur Racines");

    addService("Coupe Brushing");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Retirer Couleur Racines",
      }),
    );

    fireEvent.click(getSubmitButton());

    act(() => {
      vi.advanceTimersByTime(220);
    });

    const entry = onCreate.mock.calls[0]?.[0] as AgendaDayAppointment;

    expect(
      entry.appointment.items.map((item) => [item.serviceName, item.order]),
    ).toEqual([["Coupe Brushing", 0]]);
  });

  /*
   * Règle produit : plusieurs rendez-vous simultanés sont autorisés.
   * La soumission ne peut plus être refusée pour cause de créneau
   * occupé et aucun message de conflit n'existe dans le panneau.
   */
  it("creates the appointment without any conflict message, even on a busy slot", () => {
    vi.useFakeTimers();

    const onCreate = vi.fn();

    renderPanel({
      onCreate,
    });

    selectClient("Lynda Haddad");

    addService("Couleur Racines");

    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    fireEvent.click(getSubmitButton());

    act(() => {
      vi.advanceTimersByTime(220);
    });

    expect(onCreate).toHaveBeenCalledTimes(1);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("closes without creating anything", () => {
    vi.useFakeTimers();

    const onClose = vi.fn();

    const onCreate = vi.fn();

    renderPanel({
      onClose,
      onCreate,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Fermer la création de rendez-vous",
      }),
    );

    act(() => {
      vi.advanceTimersByTime(220);
    });

    expect(onClose).toHaveBeenCalledTimes(1);

    expect(onCreate).not.toHaveBeenCalled();
  });

  it("closes on Escape", () => {
    vi.useFakeTimers();

    const onClose = vi.fn();

    renderPanel({
      onClose,
    });

    fireEvent.keyDown(window, {
      key: "Escape",
    });

    act(() => {
      vi.advanceTimersByTime(220);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
