import { describe, expect, it } from "vitest";

import type {
  ServiceCatalogEntry,
  TechniqueCatalogEntry,
} from "@/domain/business/serviceCatalog.types";

import { createAppointmentItemFromCatalogSelection } from "./create-appointment-item-from-catalog-selection";

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

function createBrushing(): ServiceCatalogEntry {
  return {
    id: "svc_009",
    code: "brushing",
    businessId: "business-1",
    categoryId: "cat_005",
    name: "Brushing",
    type: "SERVICE",
    order: 0,
    active: true,
    options: [
      {
        id: "opt_013",
        code: "variant-1",
        order: 0,
        durationMinutes: 30,
        price: {
          type: "FIXED",
          amount: 20,
        },
      },
      {
        id: "opt_014",
        code: "variant-2",
        order: 1,
        durationMinutes: 45,
        price: {
          type: "FIXED",
          amount: 25,
        },
      },
    ],
  };
}

function createRoots(): TechniqueCatalogEntry {
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

function createGloss(): TechniqueCatalogEntry {
  return {
    id: "svc_003",
    code: "gloss",
    businessId: "business-1",
    categoryId: "cat_002",
    name: "Gloss",
    type: "TECHNIQUE",
    order: 0,
    active: true,
    options: [
      {
        id: "opt_005",
        code: "default",
        order: 0,
        activeDurationMinutes: 10,
        processingDurationMinutes: 10,
        price: {
          type: "CUSTOM",
        },
      },
    ],
  };
}

describe("createAppointmentItemFromCatalogSelection", () => {
  it("creates a service snapshot from the selected option", () => {
    const result = createAppointmentItemFromCatalogSelection({
      entry: createBrushing(),
      optionId: "opt_014",
      order: 2,
      createId: createIdFactory(["item_001", "phase_001"]),
    });

    expect(result).toEqual({
      ok: true,
      item: {
        id: "item_001",
        serviceId: "svc_009",
        serviceOptionId: "opt_014",
        order: 2,
        serviceName: "Brushing",
        serviceType: "SERVICE",
        price: 25,
        phases: [
          {
            id: "phase_001",
            name: "Brushing",
            durationMinutes: 45,
            requiresStaff: true,
          },
        ],
      },
    });
  });

  it("creates active and processing phases for a technique", () => {
    const result = createAppointmentItemFromCatalogSelection({
      entry: createRoots(),
      optionId: "opt_004",
      order: 0,
      createId: createIdFactory(["item_001", "phase_001", "phase_002"]),
    });

    expect(result).toEqual({
      ok: true,
      item: {
        id: "item_001",
        serviceId: "svc_002",
        serviceOptionId: "opt_004",
        order: 0,
        serviceName: "Couleur Racines",
        serviceType: "TECHNIQUE",
        price: 30,
        phases: [
          {
            id: "phase_001",
            name: "Application",
            durationMinutes: 45,
            requiresStaff: true,
          },
          {
            id: "phase_002",
            name: "Pose",
            durationMinutes: 20,
            requiresStaff: false,
          },
        ],
      },
    });
  });

  it("uses the custom price selected for a custom-price technique", () => {
    const result = createAppointmentItemFromCatalogSelection({
      entry: createGloss(),
      optionId: "opt_005",
      order: 1,
      customPrice: 35,
      createId: createIdFactory(["item_001", "phase_001", "phase_002"]),
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error("Expected a valid appointment item.");
    }

    expect(result.item.price).toBe(35);

    expect(result.item.serviceOptionId).toBe("opt_005");
  });

  it("requires a price for a custom-price option", () => {
    const result = createAppointmentItemFromCatalogSelection({
      entry: createGloss(),
      optionId: "opt_005",
      order: 0,
      createId: createIdFactory(["unused"]),
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "CUSTOM_PRICE_REQUIRED",
        message: "Un prix doit être renseigné pour cette prestation.",
      },
    });
  });

  it("rejects an invalid custom price", () => {
    const result = createAppointmentItemFromCatalogSelection({
      entry: createGloss(),
      optionId: "opt_005",
      order: 0,
      customPrice: -10,
      createId: createIdFactory(["unused"]),
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "INVALID_CUSTOM_PRICE",
        message: "Le prix personnalisé doit être positif ou nul.",
      },
    });
  });

  it("rejects an unknown option", () => {
    const result = createAppointmentItemFromCatalogSelection({
      entry: createBrushing(),
      optionId: "option-inconnue",
      order: 0,
      createId: createIdFactory(["unused"]),
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "OPTION_NOT_FOUND",
        message: "L'option sélectionnée n'existe pas.",
      },
    });
  });

  it("rejects an inactive service", () => {
    const entry = {
      ...createBrushing(),
      active: false,
    };

    const result = createAppointmentItemFromCatalogSelection({
      entry,
      optionId: "opt_013",
      order: 0,
      createId: createIdFactory(["unused"]),
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "INACTIVE_SERVICE",
        message: "Cette prestation n'est plus active.",
      },
    });
  });

  it("creates an active-only technique when there is no processing time", () => {
    const entry: TechniqueCatalogEntry = {
      ...createRoots(),
      id: "svc_active_only",
      code: "active-only",
      options: [
        {
          id: "opt_active_only",
          code: "default",
          order: 0,
          activeDurationMinutes: 50,
          processingDurationMinutes: 0,
          price: {
            type: "FIXED",
            amount: 40,
          },
        },
      ],
    };

    const result = createAppointmentItemFromCatalogSelection({
      entry,
      optionId: "opt_active_only",
      order: 0,
      createId: createIdFactory(["item_001", "phase_001"]),
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error("Expected a valid appointment item.");
    }

    expect(result.item.phases).toEqual([
      {
        id: "phase_001",
        name: "Couleur Racines",
        durationMinutes: 50,
        requiresStaff: true,
      },
    ]);
  });

  it("creates a processing-only technique when active duration is zero", () => {
    const entry: TechniqueCatalogEntry = {
      ...createRoots(),
      id: "svc_processing_only",
      code: "processing-only",
      options: [
        {
          id: "opt_processing_only",
          code: "default",
          order: 0,
          activeDurationMinutes: 0,
          processingDurationMinutes: 20,
          price: {
            type: "FIXED",
            amount: 15,
          },
        },
      ],
    };

    const result = createAppointmentItemFromCatalogSelection({
      entry,
      optionId: "opt_processing_only",
      order: 0,
      createId: createIdFactory(["item_001", "phase_001"]),
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error("Expected a valid appointment item.");
    }

    expect(result.item.phases).toEqual([
      {
        id: "phase_001",
        name: "Pose",
        durationMinutes: 20,
        requiresStaff: false,
      },
    ]);
  });
});
