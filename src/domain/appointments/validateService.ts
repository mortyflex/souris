import type { Service } from "./appointment.types";

export type ServiceValidationErrorCode =
  | "MISSING_NAME"
  | "INVALID_PRICE"
  | "NO_PHASES"
  | "INVALID_PHASE_DURATION"
  | "SERVICE_REQUIRES_STAFF"
  | "TECHNIQUE_REQUIRES_TWO_PHASES"
  | "TECHNIQUE_REQUIRES_ONE_ACTIVE_PHASE"
  | "TECHNIQUE_REQUIRES_ONE_PROCESSING_PHASE";

export type ServiceValidationError = {
  code: ServiceValidationErrorCode;
  message: string;
};

export type ServiceValidationResult =
  | {
      valid: true;
      errors: [];
    }
  | {
      valid: false;
      errors: ServiceValidationError[];
    };

export function validateService(service: Service): ServiceValidationResult {
  const errors: ServiceValidationError[] = [];

  if (service.name.trim().length === 0) {
    errors.push({
      code: "MISSING_NAME",
      message: "Service name is required.",
    });
  }

  if (!Number.isFinite(service.price) || service.price < 0) {
    errors.push({
      code: "INVALID_PRICE",
      message: "Service price must be a positive or zero finite number.",
    });
  }

  if (service.phases.length === 0) {
    errors.push({
      code: "NO_PHASES",
      message: "A service must contain at least one phase.",
    });
  }

  if (
    service.phases.some(
      (phase) =>
        !Number.isFinite(phase.durationMinutes) || phase.durationMinutes <= 0,
    )
  ) {
    errors.push({
      code: "INVALID_PHASE_DURATION",
      message: "Every service phase must have a positive duration.",
    });
  }

  if (service.type === "SERVICE") {
    if (service.phases.some((phase) => !phase.requiresStaff)) {
      errors.push({
        code: "SERVICE_REQUIRES_STAFF",
        message: "Every phase of a simple service must require staff.",
      });
    }
  }

  if (service.type === "TECHNIQUE") {
    if (service.phases.length !== 2) {
      errors.push({
        code: "TECHNIQUE_REQUIRES_TWO_PHASES",
        message: "A technique must contain exactly two phases.",
      });
    }

    const activePhaseCount = service.phases.filter(
      (phase) => phase.requiresStaff,
    ).length;

    const processingPhaseCount = service.phases.filter(
      (phase) => !phase.requiresStaff,
    ).length;

    if (activePhaseCount !== 1) {
      errors.push({
        code: "TECHNIQUE_REQUIRES_ONE_ACTIVE_PHASE",
        message: "A technique must contain exactly one staff-required phase.",
      });
    }

    if (processingPhaseCount !== 1) {
      errors.push({
        code: "TECHNIQUE_REQUIRES_ONE_PROCESSING_PHASE",
        message: "A technique must contain exactly one processing phase.",
      });
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  return {
    valid: true,
    errors: [],
  };
}
