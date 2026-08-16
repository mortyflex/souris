import type { Appointment } from "./appointment.types";
import { hasAppointmentConflict } from "./hasAppointmentConflict";

export function findAppointmentConflicts(
  candidate: Appointment,
  existingAppointments: Appointment[],
): Appointment[] {
  return existingAppointments.filter((appointment) => {
    if (appointment.id === candidate.id) {
      return false;
    }

    if (
      appointment.status === "CANCELLED" ||
      appointment.status === "NO_SHOW"
    ) {
      return false;
    }

    return hasAppointmentConflict(candidate, appointment);
  });
}
