import type { Appointment, Service } from "./appointment.types";
import { createAppointmentItemFromService } from "./createAppointmentItemFromService";

type AddServiceToAppointmentParams = {
  appointment: Appointment;
  service: Service;
  appointmentItemId: string;
  createPhaseId: (servicePhaseId: string, phaseIndex: number) => string;
};

export function addServiceToAppointment({
  appointment,
  service,
  appointmentItemId,
  createPhaseId,
}: AddServiceToAppointmentParams): Appointment {
  const nextOrder = appointment.items.length;

  const item = createAppointmentItemFromService({
    id: appointmentItemId,
    service,
    order: nextOrder,
    createPhaseId,
  });

  return {
    ...appointment,
    items: [...appointment.items, item],
  };
}
