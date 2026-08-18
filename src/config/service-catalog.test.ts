import { describe, expect, it } from "vitest";

import { validateServiceCatalogEntry } from "@/domain/business/validateServiceCatalogEntry";

import { serviceCatalog, serviceCategories } from "./service-catalog";

describe("serviceCatalog", () => {
  it("contains only valid catalog entries", () => {
    for (const entry of serviceCatalog) {
      expect(validateServiceCatalogEntry(entry)).toEqual([]);
    }
  });

  it("uses unique category ids", () => {
    const ids = serviceCategories.map((category) => category.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses unique category codes", () => {
    const codes = serviceCategories.map((category) => category.code);

    expect(new Set(codes).size).toBe(codes.length);
  });

  it("uses unique service ids", () => {
    const ids = serviceCatalog.map((entry) => entry.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses unique service codes", () => {
    const codes = serviceCatalog.map((entry) => entry.code);

    expect(new Set(codes).size).toBe(codes.length);
  });

  it("uses globally unique option ids", () => {
    const ids = serviceCatalog.flatMap((entry) =>
      entry.options.map((option) => option.id),
    );

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("contains valid category references", () => {
    const categoryIds = new Set(
      serviceCategories.map((category) => category.id),
    );

    for (const entry of serviceCatalog) {
      expect(categoryIds.has(entry.categoryId)).toBe(true);
    }
  });

  it("merges brushing variants into one service", () => {
    const brushing = serviceCatalog.find((entry) => entry.code === "brushing");

    expect(brushing).toBeDefined();

    if (!brushing || brushing.type !== "SERVICE") {
      throw new Error("Brushing service missing.");
    }

    expect(
      brushing.options.map((option) => ({
        code: option.code,
        durationMinutes: option.durationMinutes,
        price: option.price,
      })),
    ).toEqual([
      {
        code: "variant-1",
        durationMinutes: 30,
        price: {
          type: "FIXED",
          amount: 20,
        },
      },
      {
        code: "variant-2",
        durationMinutes: 45,
        price: {
          type: "FIXED",
          amount: 25,
        },
      },
      {
        code: "variant-3",
        durationMinutes: 60,
        price: {
          type: "FIXED",
          amount: 35,
        },
      },
    ]);
  });

  it("never gives a service a processing duration", () => {
    const services = serviceCatalog.filter((entry) => entry.type === "SERVICE");

    for (const service of services) {
      for (const option of service.options) {
        expect("processingDurationMinutes" in option).toBe(false);
      }
    }
  });

  it("preserves technique processing times", () => {
    const roots = serviceCatalog.find(
      (entry) => entry.code === "couleur-racines",
    );

    expect(roots).toBeDefined();

    if (!roots || roots.type !== "TECHNIQUE") {
      throw new Error("Couleur Racines technique missing.");
    }

    expect(roots.options[0]?.activeDurationMinutes).toBe(45);

    expect(roots.options[0]?.processingDurationMinutes).toBe(20);
  });

  it("preserves a custom price for Gloss", () => {
    const gloss = serviceCatalog.find((entry) => entry.code === "gloss");

    expect(gloss).toBeDefined();

    if (!gloss || gloss.type !== "TECHNIQUE") {
      throw new Error("Gloss technique missing.");
    }

    expect(gloss.options[0]?.price).toEqual({
      type: "CUSTOM",
    });
  });

  it("does not encode duration in option identity", () => {
    const brushing = serviceCatalog.find((entry) => entry.code === "brushing");

    if (!brushing || brushing.type !== "SERVICE") {
      throw new Error("Brushing service missing.");
    }

    for (const option of brushing.options) {
      expect(option.id).not.toContain(String(option.durationMinutes));

      expect(option.code).not.toContain(String(option.durationMinutes));
    }
  });
});
