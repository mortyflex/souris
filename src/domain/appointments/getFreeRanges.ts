import type { TimelinePhase } from "./appointment.types";
import type { TimelineRange } from "./getOccupiedRanges";

export function getFreeRanges(timeline: TimelinePhase[]): TimelineRange[] {
  return timeline
    .filter((phase) => !phase.requiresStaff)
    .map((phase) => ({
      appointmentId: phase.appointmentId,
      appointmentItemId: phase.appointmentItemId,
      phaseId: phase.phaseId,
      label: phase.label,
      startAt: new Date(phase.startAt),
      endAt: new Date(phase.endAt),
      durationMinutes: phase.durationMinutes,
    }));
}
