import type {
  Appointment,
  AppointmentItem,
} from "@/domain/appointments/appointment.types";

export type CreateAppointmentInput = {
  businessId: string;
  staffMemberId: string;
  clientId: string;
  startAt: Date;
  items: AppointmentItem[];
  createId: () => string;
};

/**
 * Construit un nouveau rendez-vous prêt à entrer dans l'agenda.
 *
 * Règle produit : la professionnelle peut volontairement mener
 * plusieurs rendez-vous en parallèle. Un créneau déjà occupé n'est
 * donc jamais bloquant — le moteur de conflits du domaine
 * (`findAppointmentConflicts`, `canScheduleAppointmentAt`) reste
 * disponible pour de futurs avertissements ou réglages.
 *
 * L'ordre des prestations reçues devient l'ordre métier (0, 1, 2…),
 * le statut initial est `SCHEDULED` et les entrées ne sont jamais
 * mutées.
 */
export function createAppointment({
  businessId,
  staffMemberId,
  clientId,
  startAt,
  items,
  createId,
}: CreateAppointmentInput): Appointment {
  return {
    id: createId(),
    businessId,
    staffMemberId,
    clientId,
    startAt: new Date(startAt),
    status: "SCHEDULED",
    items: items.map((item, index) => ({
      ...item,
      order: index,
    })),
  };
}
