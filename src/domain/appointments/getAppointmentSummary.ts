import type { Appointment } from "./appointment.types";
import { buildAppointmentTimeline } from "./buildAppointmentTimeline";

export type AppointmentSummary = {
  totalPrice: number;
  totalDurationMinutes: number;
  occupiedDurationMinutes: number;
  processingDurationMinutes: number;
  itemCount: number;
  phaseCount: number;
};

export function getAppointmentSummary(
  appointment: Appointment,
): AppointmentSummary {
  const timeline = buildAppointmentTimeline(appointment);

  const totalPrice = appointment.items.reduce(
    (total, item) => total + item.price,
    0,
  );

  const occupiedDurationMinutes = timeline
    .filter((phase) => phase.requiresStaff)
    .reduce((total, phase) => total + phase.durationMinutes, 0);

  const processingDurationMinutes = timeline
    .filter((phase) => !phase.requiresStaff)
    .reduce((total, phase) => total + phase.durationMinutes, 0);

  return {
    totalPrice,
    totalDurationMinutes: occupiedDurationMinutes + processingDurationMinutes,
    occupiedDurationMinutes,
    processingDurationMinutes,
    itemCount: appointment.items.length,
    phaseCount: timeline.length,
  };
}
