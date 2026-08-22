import type { Appointment } from "@/domain/appointments/appointment.types";
import { canScheduleAppointmentAt } from "@/domain/appointments/canScheduleAppointmentAt";

export type RescheduleAppointmentResult =
  | {
      ok: true;
      appointment: Appointment;
    }
  | {
      ok: false;
      reason: "CONFLICT";
    };

/**
 * Tente de déplacer un rendez-vous vers un nouveau `startAt`.
 *
 * Délègue la validation au domaine (`canScheduleAppointmentAt`) :
 * les conflits sont calculés depuis les phases qui nécessitent la
 * professionnelle, le rendez-vous courant est exclu par son `id`,
 * les rendez-vous annulés / no-show sont ignorés et les intervalles
 * adjacents sont autorisés.
 *
 * Seul `startAt` change ; items, phases, prix, ordre, notes, statut,
 * cliente et professionnelle restent inchangés. Le rendez-vous
 * original n'est jamais muté.
 */
export function rescheduleAppointment(
  appointment: Appointment,
  newStartAt: Date,
  existingAppointments: Appointment[],
): RescheduleAppointmentResult {
  if (newStartAt.getTime() === appointment.startAt.getTime()) {
    return {
      ok: true,
      appointment,
    };
  }

  if (!canScheduleAppointmentAt(appointment, newStartAt, existingAppointments)) {
    return {
      ok: false,
      reason: "CONFLICT",
    };
  }

  return {
    ok: true,
    appointment: {
      ...appointment,
      startAt: new Date(newStartAt),
    },
  };
}
