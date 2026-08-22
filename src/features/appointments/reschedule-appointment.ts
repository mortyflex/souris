import type { Appointment } from "@/domain/appointments/appointment.types";

/**
 * Déplace un rendez-vous vers un nouveau `startAt`.
 *
 * Règle produit : la professionnelle peut volontairement mener
 * plusieurs rendez-vous en parallèle. Un chevauchement avec un autre
 * rendez-vous n'est donc jamais bloquant ici — le moteur de conflits
 * du domaine (`findAppointmentConflicts`, `canScheduleAppointmentAt`)
 * reste disponible pour de futurs avertissements ou réglages.
 *
 * Seul `startAt` change ; items, phases, prix, ordre, notes, statut,
 * cliente et professionnelle restent inchangés. Le rendez-vous
 * original n'est jamais muté, et le même horaire retourne l'objet
 * original sans clone inutile.
 */
export function rescheduleAppointment(
  appointment: Appointment,
  newStartAt: Date,
): Appointment {
  if (newStartAt.getTime() === appointment.startAt.getTime()) {
    return appointment;
  }

  return {
    ...appointment,
    startAt: new Date(newStartAt),
  };
}
