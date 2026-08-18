import { describe, expect, it } from "vitest";

import type {
  ServiceCatalogEntry,
  TechniqueCatalogEntry,
} from "./serviceCatalog.types";
import { validateServiceCatalogEntry } from "./validateServiceCatalogEntry";

function createService(): ServiceCatalogEntry {
  return {
    id: "brushing",
    businessId: "business-1",
    categoryId: "brushing",
    name: "Brushing",
    type: "SERVICE",
    order: 0,
    active: true,
    options: [
      {
        id: "brushing-30",
        order: 0,
        durationMinutes: 30,
        price: {
          type: "FIXED",
          amount: 20,
        },
      },
      {
        id: "brushing-45",
        order: 1,
        durationMinutes: 45,
        price: {
          type: "FIXED",
          amount: 25,
        },
      },
      {
        id: "brushing-60",
        order: 2,
        durationMinutes: 60,
        price: {
          type: "FIXED",
          amount: 35,
        },
      },
    ],
  };
}

function createTechnique(): TechniqueCatalogEntry {
  return {
    id: "couleur-racines",
    businessId: "business-1",
    categoryId: "coloration",
    name: "Couleur Racines",
    type: "TECHNIQUE",
    order: 0,
    active: true,
    options: [
      {
        id: "couleur-racines-default",
        order: 0,
        activeDurationMinutes: 25,
        processingDurationMinutes: 20,
        price: {
          type: "FIXED",
          amount: 30,
        },
      },
    ],
  };
}

describe("validateServiceCatalogEntry", () => {
  it("accepts a service with several duration and price options", () => {
    expect(validateServiceCatalogEntry(createService())).toEqual([]);
  });

  it("accepts a technique with processing time", () => {
    expect(validateServiceCatalogEntry(createTechnique())).toEqual([]);
  });

  it("accepts a custom catalog price", () => {
    const technique = createTechnique();

    technique.options[0] = {
      ...technique.options[0],
      price: {
        type: "CUSTOM",
      },
    };

    expect(validateServiceCatalogEntry(technique)).toEqual([]);
  });

  it("rejects a service duration equal to zero", () => {
    const service = createService();

    service.options[0] = {
      ...service.options[0],
      durationMinutes: 0,
    };

    expect(validateServiceCatalogEntry(service)).toContainEqual({
      path: "options.0.durationMinutes",
      message: "La durée d'un service doit être supérieure à zéro.",
    });
  });

  it("rejects a technique without processing time", () => {
    const technique = createTechnique();

    technique.options[0] = {
      ...technique.options[0],
      processingDurationMinutes: 0,
    };

    expect(validateServiceCatalogEntry(technique)).toContainEqual({
      path: "options.0.processingDurationMinutes",
      message: "Le temps de pose d'une technique doit être supérieur à zéro.",
    });
  });

  it("accepts a technique with zero active duration during migration", () => {
    const technique = createTechnique();

    technique.options[0] = {
      ...technique.options[0],
      activeDurationMinutes: 0,
    };

    expect(validateServiceCatalogEntry(technique)).toEqual([]);
  });

  it("rejects a negative fixed price", () => {
    const service = createService();

    service.options[0] = {
      ...service.options[0],
      price: {
        type: "FIXED",
        amount: -1,
      },
    };

    expect(validateServiceCatalogEntry(service)).toContainEqual({
      path: "options.0.price.amount",
      message: "Le prix doit être un nombre positif ou nul.",
    });
  });

  it("rejects duplicated option identifiers", () => {
    const service = createService();

    service.options[1] = {
      ...service.options[1],
      id: service.options[0]!.id,
    };

    expect(validateServiceCatalogEntry(service)).toContainEqual({
      path: "options.1.id",
      message: "L'identifiant de l'option doit être unique.",
    });
  });

  it("rejects a catalog entry without options", () => {
    const service = createService();

    service.options = [];

    expect(validateServiceCatalogEntry(service)).toContainEqual({
      path: "options",
      message: "Une prestation doit avoir au moins une option.",
    });
  });
});
