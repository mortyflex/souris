// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { serviceCatalog, serviceCategories } from "@/config/service-catalog";

import { ServicePicker } from "./service-picker";

function renderPicker() {
  const onSelect = vi.fn();

  render(
    <ServicePicker
      categories={serviceCategories}
      entries={serviceCatalog}
      onSelect={onSelect}
    />,
  );

  return {
    onSelect,
  };
}

describe("ServicePicker", () => {
  it("shows active services from the catalog", () => {
    renderPicker();

    expect(
      screen.getByRole("button", {
        name: "Sélectionner Brushing",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Sélectionner Couleur Racines",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Sélectionner Gloss",
      }),
    ).toBeInTheDocument();
  });

  it("filters services from search", () => {
    renderPicker();

    fireEvent.change(
      screen.getByRole("searchbox", {
        name: "Rechercher une prestation",
      }),
      {
        target: {
          value: "gloss",
        },
      },
    );

    expect(
      screen.getByRole("button", {
        name: "Sélectionner Gloss",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Sélectionner Chignon",
      }),
    ).not.toBeInTheDocument();
  });

  it("filters services by category", () => {
    renderPicker();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Coloration",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Sélectionner Couleur Racines",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Sélectionner Gloss",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Sélectionner Brushing",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Brushing",
      }),
    ).toBeInTheDocument();
  });

  it("shows brushing options in the custom dropdown", () => {
    renderPicker();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sélectionner Brushing",
      }),
    );

    const optionTrigger = screen.getByRole("button", {
      name: "Choisir une option pour Brushing",
    });

    expect(optionTrigger).toHaveAttribute("aria-expanded", "false");

    expect(optionTrigger).toHaveTextContent(/30 min — 20,00\s€/);

    fireEvent.click(optionTrigger);

    expect(optionTrigger).toHaveAttribute("aria-expanded", "true");

    expect(
      screen.getByRole("listbox", {
        name: "Options pour Brushing",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: /30 min — 20,00\s€/,
      }),
    ).toHaveAttribute("aria-selected", "true");

    expect(
      screen.getByRole("option", {
        name: /45 min — 25,00\s€/,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: /60 min — 35,00\s€/,
      }),
    ).toBeInTheDocument();
  });

  it("returns the selected brushing option", () => {
    const { onSelect } = renderPicker();

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

    expect(
      screen.getByRole("button", {
        name: "Choisir une option pour Brushing",
      }),
    ).toHaveTextContent(/45 min — 25,00\s€/);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ajouter cette prestation",
      }),
    );

    expect(onSelect).toHaveBeenCalledOnce();

    expect(onSelect.mock.calls[0]?.[0]).toMatchObject({
      optionId: "opt_014",
      entry: {
        code: "brushing",
        name: "Brushing",
        type: "SERVICE",
      },
    });
  });

  it("shows processing time for a technique", () => {
    renderPicker();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sélectionner Couleur Racines",
      }),
    );

    expect(screen.getAllByText(/45 min \+ 20 min de pose/)).toHaveLength(2);
  });

  it("requires a custom price for Gloss", () => {
    const { onSelect } = renderPicker();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sélectionner Gloss",
      }),
    );

    const addButton = screen.getByRole("button", {
      name: "Ajouter cette prestation",
    });

    expect(addButton).toBeDisabled();

    fireEvent.change(
      screen.getByRole("spinbutton", {
        name: "Prix de Gloss",
      }),
      {
        target: {
          value: "35",
        },
      },
    );

    expect(addButton).toBeEnabled();

    fireEvent.click(addButton);

    expect(onSelect).toHaveBeenCalledOnce();

    expect(onSelect.mock.calls[0]?.[0]).toMatchObject({
      optionId: "opt_005",
      customPrice: 35,
      entry: {
        code: "gloss",
      },
    });
  });

  it("closes the option dropdown with Escape without closing the picker", () => {
    renderPicker();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sélectionner Brushing",
      }),
    );

    const optionTrigger = screen.getByRole("button", {
      name: "Choisir une option pour Brushing",
    });

    fireEvent.click(optionTrigger);

    expect(
      screen.getByRole("listbox", {
        name: "Options pour Brushing",
      }),
    ).toBeInTheDocument();

    fireEvent.keyDown(
      screen.getByRole("listbox", {
        name: "Options pour Brushing",
      }),
      {
        key: "Escape",
      },
    );

    expect(
      screen.queryByRole("listbox", {
        name: "Options pour Brushing",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("searchbox", {
        name: "Rechercher une prestation",
      }),
    ).toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", () => {
    renderPicker();

    fireEvent.change(
      screen.getByRole("searchbox", {
        name: "Rechercher une prestation",
      }),
      {
        target: {
          value: "prestation inexistante",
        },
      },
    );

    expect(screen.getByText("Aucune prestation")).toBeInTheDocument();
  });
});
