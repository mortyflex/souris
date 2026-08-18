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

  it("shows the brushing duration and price variants", () => {
    renderPicker();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sélectionner Brushing",
      }),
    );

    const select = screen.getByRole("combobox", {
      name: "Option pour Brushing",
    });

    expect(select).toHaveValue("opt_013");

    expect(
      screen.getByRole("option", {
        name: /30 min — 20,00\s€/,
      }),
    ).toBeInTheDocument();

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

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Option pour Brushing",
      }),
      {
        target: {
          value: "opt_014",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ajouter la prestation",
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
      name: "Ajouter la prestation",
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
