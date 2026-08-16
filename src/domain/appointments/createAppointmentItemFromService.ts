import type { AppointmentItem, Service } from "./appointment.types";

type CreateAppointmentItemFromServiceParams = {
  id: string;
  service: Service;
  order: number;
  createPhaseId: (servicePhaseId: string, phaseIndex: number) => string;
};

export function createAppointmentItemFromService({
  id,
  service,
  order,
  createPhaseId,
}: CreateAppointmentItemFromServiceParams): AppointmentItem {
  return {
    id,
    serviceId: service.id,
    order,
    serviceName: service.name,
    serviceType: service.type,
    price: service.price,
    phases: service.phases.map((phase, phaseIndex) => ({
      id: createPhaseId(phase.id, phaseIndex),
      name: phase.name,
      durationMinutes: phase.durationMinutes,
      requiresStaff: phase.requiresStaff,
    })),
  };
}
