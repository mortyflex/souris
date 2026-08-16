import type { Appointment, TimelinePhase } from "./appointment.types";

export function buildAppointmentTimeline(
  appointment: Appointment,
): TimelinePhase[] {
  const orderedItems = [...appointment.items].sort((a, b) => a.order - b.order);

  let cursor = new Date(appointment.startAt);

  return orderedItems.flatMap((item) =>
    item.phases.map((phase) => {
      const startAt = new Date(cursor);
      const endAt = new Date(
        startAt.getTime() + phase.durationMinutes * 60_000,
      );

      cursor = endAt;

      return {
        appointmentId: appointment.id,
        appointmentItemId: item.id,
        phaseId: phase.id,
        label: phase.name,
        startAt,
        endAt,
        durationMinutes: phase.durationMinutes,
        requiresStaff: phase.requiresStaff,
      };
    }),
  );
}
