import type {
  Appointment,
  AppointmentCancellationActor,
} from "./appointment.types";

export type AppointmentLifecycleErrorCode =
  | "APPOINTMENT_COMPLETED"
  | "APPOINTMENT_CANCELLED"
  | "APPOINTMENT_NO_SHOW";

export type AppointmentLifecycleError = {
  code: AppointmentLifecycleErrorCode;
  message: string;
};

export type AppointmentLifecycleResult =
  | {
      ok: true;
      appointment: Appointment;
    }
  | {
      ok: false;
      error: AppointmentLifecycleError;
    };

export type CancelAppointmentInput = {
  cancelledAt: Date;
  cancelledBy: AppointmentCancellationActor;
  reason?: string;
};

export type MarkAppointmentNoShowInput = {
  recordedAt: Date;
};

function getTerminalStatusError(
  appointment: Appointment,
): AppointmentLifecycleError | null {
  if (appointment.status === "COMPLETED") {
    return {
      code: "APPOINTMENT_COMPLETED",
      message:
        "Un rendez-vous terminé ne peut plus être annulé ou marqué comme no-show.",
    };
  }

  if (appointment.status === "CANCELLED") {
    return {
      code: "APPOINTMENT_CANCELLED",
      message: "Ce rendez-vous est déjà annulé.",
    };
  }

  if (appointment.status === "NO_SHOW") {
    return {
      code: "APPOINTMENT_NO_SHOW",
      message: "Ce rendez-vous est déjà marqué comme no-show.",
    };
  }

  return null;
}

function normalizeReason(reason: string | undefined): string | undefined {
  const normalizedReason = reason?.trim();

  return normalizedReason ? normalizedReason : undefined;
}

export function cancelAppointment(
  appointment: Appointment,
  input: CancelAppointmentInput,
): AppointmentLifecycleResult {
  const terminalStatusError = getTerminalStatusError(appointment);

  if (terminalStatusError) {
    return {
      ok: false,
      error: terminalStatusError,
    };
  }

  return {
    ok: true,
    appointment: {
      ...appointment,
      status: "CANCELLED",
      cancellation: {
        cancelledAt: input.cancelledAt,
        cancelledBy: input.cancelledBy,
        reason: normalizeReason(input.reason),
      },
      noShow: undefined,
    },
  };
}

export function markAppointmentNoShow(
  appointment: Appointment,
  input: MarkAppointmentNoShowInput,
): AppointmentLifecycleResult {
  const terminalStatusError = getTerminalStatusError(appointment);

  if (terminalStatusError) {
    return {
      ok: false,
      error: terminalStatusError,
    };
  }

  return {
    ok: true,
    appointment: {
      ...appointment,
      status: "NO_SHOW",
      cancellation: undefined,
      noShow: {
        recordedAt: input.recordedAt,
      },
    },
  };
}
