import type { Appointment } from "./appointment.types";
import { findAppointmentConflicts } from "./findAppointmentConflicts";

export function canScheduleAppointmentAt(
  appointment: Appointment,
  startAt: Date,
  existingAppointments: Appointment[],
): boolean {
  const candidate: Appointment = {
    ...appointment,
    startAt: new Date(startAt),
  };

  return findAppointmentConflicts(candidate, existingAppointments).length === 0;
}
