import { describe, expect, it } from "vitest";

import type {
  ServiceCatalogEntry,
  TechniqueCatalogEntry,
} from "./serviceCatalog.types";
import { validateServiceCatalogEntry } from "./validateServiceCatalogEntry";

function createService(): ServiceCatalogEntry {
  return {
    id: "svc_001",
    code: "brushing",
    businessId: "business-1",
    categoryId: "cat_005",
    name: "Brushing",
    type: "SERVICE",
    order: 0,
    active: true,
    options: [
      {
        id: "opt_001",
        code: "variant-1",
        order: 0,
        durationMinutes: 30,
        price: {
          type: "FIXED",
          amount: 20,
        },
      },
      {
        id: "opt_002",
        code: "variant-2",
        order: 1,
        durationMinutes: 45,
        price: {
          type: "FIXED",
          amount: 25,
        },
      },
      {
        id: "opt_003",
        code: "variant-3",
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
    id: "svc_002",
    code: "couleur-racines",
    businessId: "business-1",
    categoryId: "cat_002",
    name: "Couleur Racines",
    type: "TECHNIQUE",
    order: 0,
    active: true,
    options: [
      {
        id: "opt_004",
        code: "default",
        order: 0,
        activeDurationMinutes: 45,
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
  it("accepts a service with several options", () => {
    expect(validateServiceCatalogEntry(createService())).toEqual([]);
  });

  it("accepts a technique with processing time", () => {
    expect(validateServiceCatalogEntry(createTechnique())).toEqual([]);
  });

  it("accepts a technique without processing time", () => {
    const technique = createTechnique();

    technique.options[0] = {
      ...technique.options[0],
      processingDurationMinutes: 0,
    };

    expect(validateServiceCatalogEntry(technique)).toEqual([]);
  });

  it("accepts a technique with zero active duration when processing remains", () => {
    const technique = createTechnique();

    technique.options[0] = {
      ...technique.options[0],
      activeDurationMinutes: 0,
    };

    expect(validateServiceCatalogEntry(technique)).toEqual([]);
  });

  it("accepts a custom price", () => {
    const technique = createTechnique();

    technique.options[0] = {
      ...technique.options[0],
      price: {
        type: "CUSTOM",
      },
    };

    expect(validateServiceCatalogEntry(technique)).toEqual([]);
  });

  it("rejects an empty entry code", () => {
    const service = createService();

    service.code = "";

    expect(validateServiceCatalogEntry(service)).toContainEqual({
      path: "code",
      message: "La valeur est obligatoire.",
    });
  });

  it("rejects an empty option code", () => {
    const service = createService();

    service.options[0] = {
      ...service.options[0],
      code: "",
    };

    expect(validateServiceCatalogEntry(service)).toContainEqual({
      path: "options.0.code",
      message: "La valeur est obligatoire.",
    });
  });

  it("rejects duplicated option codes", () => {
    const service = createService();

    service.options[1] = {
      ...service.options[1],
      code: service.options[0]!.code,
    };

    expect(validateServiceCatalogEntry(service)).toContainEqual({
      path: "options.1.code",
      message: "Le code de l'option doit être unique pour cette prestation.",
    });
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

  it("rejects a negative processing time", () => {
    const technique = createTechnique();

    technique.options[0] = {
      ...technique.options[0],
      processingDurationMinutes: -1,
    };

    expect(validateServiceCatalogEntry(technique)).toContainEqual({
      path: "options.0.processingDurationMinutes",
      message: "Le temps de pose d'une technique doit être positif ou nul.",
    });
  });

  it("rejects a technique with no duration at all", () => {
    const technique = createTechnique();

    technique.options[0] = {
      ...technique.options[0],
      activeDurationMinutes: 0,
      processingDurationMinutes: 0,
    };

    expect(validateServiceCatalogEntry(technique)).toContainEqual({
      path: "options.0",
      message: "Une technique doit avoir une durée totale supérieure à zéro.",
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

  it("rejects an entry without options", () => {
    const service = createService();

    service.options = [];

    expect(validateServiceCatalogEntry(service)).toContainEqual({
      path: "options",
      message: "Une prestation doit avoir au moins une option.",
    });
  });
});
