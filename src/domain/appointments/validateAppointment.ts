import type { Appointment } from "./appointment.types";

export type AppointmentValidationErrorCode =
  | "MISSING_CLIENT"
  | "MISSING_STAFF_MEMBER"
  | "NO_ITEMS"
  | "DUPLICATE_ITEM_ID"
  | "DUPLICATE_ITEM_ORDER"
  | "INVALID_ITEM_PRICE"
  | "NO_ITEM_PHASES"
  | "DUPLICATE_PHASE_ID"
  | "INVALID_PHASE_DURATION";

export type AppointmentValidationError = {
  code: AppointmentValidationErrorCode;
  message: string;
};

export type AppointmentValidationResult =
  | {
      valid: true;
      errors: [];
    }
  | {
      valid: false;
      errors: AppointmentValidationError[];
    };

function hasDuplicates<T>(values: T[]): boolean {
  return new Set(values).size !== values.length;
}

export function validateAppointment(
  appointment: Appointment,
): AppointmentValidationResult {
  const errors: AppointmentValidationError[] = [];

  if (appointment.clientId.trim().length === 0) {
    errors.push({
      code: "MISSING_CLIENT",
      message: "An appointment must have a client.",
    });
  }

  if (appointment.staffMemberId.trim().length === 0) {
    errors.push({
      code: "MISSING_STAFF_MEMBER",
      message: "An appointment must have a staff member.",
    });
  }

  if (appointment.items.length === 0) {
    errors.push({
      code: "NO_ITEMS",
      message: "An appointment must contain at least one item.",
    });
  }

  if (hasDuplicates(appointment.items.map((item) => item.id))) {
    errors.push({
      code: "DUPLICATE_ITEM_ID",
      message: "Appointment item identifiers must be unique.",
    });
  }

  if (hasDuplicates(appointment.items.map((item) => item.order))) {
    errors.push({
      code: "DUPLICATE_ITEM_ORDER",
      message: "Appointment item order values must be unique.",
    });
  }

  if (
    appointment.items.some(
      (item) => !Number.isFinite(item.price) || item.price < 0,
    )
  ) {
    errors.push({
      code: "INVALID_ITEM_PRICE",
      message:
        "Every appointment item price must be a positive or zero finite number.",
    });
  }

  if (appointment.items.some((item) => item.phases.length === 0)) {
    errors.push({
      code: "NO_ITEM_PHASES",
      message: "Every appointment item must contain at least one phase.",
    });
  }

  const phases = appointment.items.flatMap((item) => item.phases);

  if (hasDuplicates(phases.map((phase) => phase.id))) {
    errors.push({
      code: "DUPLICATE_PHASE_ID",
      message: "Appointment phase identifiers must be unique.",
    });
  }

  if (
    phases.some(
      (phase) =>
        !Number.isFinite(phase.durationMinutes) || phase.durationMinutes <= 0,
    )
  ) {
    errors.push({
      code: "INVALID_PHASE_DURATION",
      message: "Every appointment phase must have a positive duration.",
    });
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
