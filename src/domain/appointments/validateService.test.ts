import { describe, expect, it } from "vitest";

import type { Service } from "./appointment.types";
import { validateService } from "./validateService";

function createSimpleService(): Service {
  return {
    id: "cut",
    businessId: "business-1",
    name: "Cut",
    type: "SERVICE",
    price: 30,
    active: true,
    phases: [
      {
        id: "cut-phase",
        name: "Cut",
        durationMinutes: 30,
        requiresStaff: true,
      },
    ],
  };
}

function createTechnique(): Service {
  return {
    id: "root-color",
    businessId: "business-1",
    name: "Root color",
    type: "TECHNIQUE",
    price: 55,
    active: true,
    phases: [
      {
        id: "application",
        name: "Application",
        durationMinutes: 15,
        requiresStaff: true,
      },
      {
        id: "processing",
        name: "Processing",
        durationMinutes: 35,
        requiresStaff: false,
      },
    ],
  };
}

describe("validateService", () => {
  it("accepts a valid simple service", () => {
    const result = validateService(createSimpleService());

    expect(result).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("accepts a valid technique", () => {
    const result = validateService(createTechnique());

    expect(result).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("rejects a service without a name", () => {
    const service = {
      ...createSimpleService(),
      name: "   ",
    };

    const result = validateService(service);

    expect(result.valid).toBe(false);

    expect(result.errors).toContainEqual({
      code: "MISSING_NAME",
      message: "Service name is required.",
    });
  });

  it("rejects a negative price", () => {
    const service = {
      ...createSimpleService(),
      price: -10,
    };

    const result = validateService(service);

    expect(result.errors.map((error) => error.code)).toContain("INVALID_PRICE");
  });

  it("accepts a zero price", () => {
    const service = {
      ...createSimpleService(),
      price: 0,
    };

    expect(validateService(service).valid).toBe(true);
  });

  it("rejects a service without phases", () => {
    const service = {
      ...createSimpleService(),
      phases: [],
    };

    const result = validateService(service);

    expect(result.errors.map((error) => error.code)).toContain("NO_PHASES");
  });

  it("rejects zero or negative phase durations", () => {
    const service = {
      ...createSimpleService(),
      phases: [
        {
          id: "invalid-phase",
          name: "Invalid",
          durationMinutes: 0,
          requiresStaff: true,
        },
      ],
    };

    const result = validateService(service);

    expect(result.errors.map((error) => error.code)).toContain(
      "INVALID_PHASE_DURATION",
    );
  });

  it("rejects a simple service containing a processing phase", () => {
    const service: Service = {
      ...createSimpleService(),
      phases: [
        {
          id: "active",
          name: "Active",
          durationMinutes: 20,
          requiresStaff: true,
        },
        {
          id: "processing",
          name: "Processing",
          durationMinutes: 10,
          requiresStaff: false,
        },
      ],
    };

    const result = validateService(service);

    expect(result.errors.map((error) => error.code)).toContain(
      "SERVICE_REQUIRES_STAFF",
    );
  });

  it("rejects a technique with more than two phases", () => {
    const service: Service = {
      ...createTechnique(),
      phases: [
        ...createTechnique().phases,
        {
          id: "third-phase",
          name: "Third phase",
          durationMinutes: 10,
          requiresStaff: true,
        },
      ],
    };

    const result = validateService(service);

    expect(result.errors.map((error) => error.code)).toContain(
      "TECHNIQUE_REQUIRES_TWO_PHASES",
    );
  });

  it("rejects a technique without exactly one active phase", () => {
    const service: Service = {
      ...createTechnique(),
      phases: [
        {
          id: "application",
          name: "Application",
          durationMinutes: 15,
          requiresStaff: false,
        },
        {
          id: "processing",
          name: "Processing",
          durationMinutes: 35,
          requiresStaff: false,
        },
      ],
    };

    const result = validateService(service);

    expect(result.errors.map((error) => error.code)).toContain(
      "TECHNIQUE_REQUIRES_ONE_ACTIVE_PHASE",
    );
  });

  it("rejects a technique without exactly one processing phase", () => {
    const service: Service = {
      ...createTechnique(),
      phases: [
        {
          id: "application",
          name: "Application",
          durationMinutes: 15,
          requiresStaff: true,
        },
        {
          id: "processing",
          name: "Processing",
          durationMinutes: 35,
          requiresStaff: true,
        },
      ],
    };

    const result = validateService(service);

    expect(result.errors.map((error) => error.code)).toContain(
      "TECHNIQUE_REQUIRES_ONE_PROCESSING_PHASE",
    );
  });

  it("can report several validation errors at once", () => {
    const service: Service = {
      ...createTechnique(),
      name: "",
      price: -5,
      phases: [],
    };

    const result = validateService(service);

    expect(result.valid).toBe(false);

    expect(result.errors.map((error) => error.code)).toEqual(
      expect.arrayContaining([
        "MISSING_NAME",
        "INVALID_PRICE",
        "NO_PHASES",
        "TECHNIQUE_REQUIRES_TWO_PHASES",
        "TECHNIQUE_REQUIRES_ONE_ACTIVE_PHASE",
        "TECHNIQUE_REQUIRES_ONE_PROCESSING_PHASE",
      ]),
    );
  });
});
