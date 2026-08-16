import type { TimelinePhase } from "./appointment.types";

export type TimelineRange = {
  appointmentId: string;
  appointmentItemId: string;
  phaseId: string;
  label: string;
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
};

export function getOccupiedRanges(timeline: TimelinePhase[]): TimelineRange[] {
  return timeline
    .filter((phase) => phase.requiresStaff)
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
