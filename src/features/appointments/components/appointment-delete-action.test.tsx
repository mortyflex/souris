// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppointmentDeleteAction } from "./appointment-delete-action";

describe("AppointmentDeleteAction", () => {
  it("does not delete immediately", () => {
    const onDelete = vi.fn();

    render(<AppointmentDeleteAction clientName="Lynda" onDelete={onDelete} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Supprimer le rendez-vous",
      }),
    );

    expect(onDelete).not.toHaveBeenCalled();

    expect(
      screen.getByRole("dialog", {
        name: "Suppression définitive du rendez-vous",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Supprimer définitivement ?")).toBeInTheDocument();
  });

  it("explains that permanent deletion removes the appointment from history", () => {
    render(<AppointmentDeleteAction clientName="Lynda" onDelete={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Supprimer le rendez-vous",
      }),
    );

    expect(
      screen.getByText(/ne sera pas conservé dans son historique/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Pour une annulation ou une absence/i),
    ).toBeInTheDocument();
  });

  it("can return without deleting", () => {
    const onDelete = vi.fn();

    render(<AppointmentDeleteAction clientName="Lynda" onDelete={onDelete} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Supprimer le rendez-vous",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Retour",
      }),
    );

    expect(onDelete).not.toHaveBeenCalled();

    expect(
      screen.queryByRole("dialog", {
        name: "Suppression définitive du rendez-vous",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Supprimer le rendez-vous",
      }),
    ).toBeInTheDocument();
  });

  it("can close the confirmation with Escape without deleting", () => {
    const onDelete = vi.fn();

    render(<AppointmentDeleteAction clientName="Lynda" onDelete={onDelete} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Supprimer le rendez-vous",
      }),
    );

    const dialog = screen.getByRole("dialog", {
      name: "Suppression définitive du rendez-vous",
    });

    fireEvent.keyDown(dialog, {
      key: "Escape",
    });

    expect(
      screen.queryByRole("dialog", {
        name: "Suppression définitive du rendez-vous",
      }),
    ).not.toBeInTheDocument();

    expect(onDelete).not.toHaveBeenCalled();
  });

  it("deletes only after explicit confirmation", () => {
    const onDelete = vi.fn();

    render(<AppointmentDeleteAction clientName="Lynda" onDelete={onDelete} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Supprimer le rendez-vous",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Supprimer définitivement",
      }),
    );

    expect(onDelete).toHaveBeenCalledOnce();
  });
});
