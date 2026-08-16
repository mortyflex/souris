import type { Appointment } from "./appointment.types";
import { buildAppointmentTimeline } from "./buildAppointmentTimeline";
import { getOccupiedRanges } from "./getOccupiedRanges";

function rangesOverlap(
  firstStart: Date,
  firstEnd: Date,
  secondStart: Date,
  secondEnd: Date,
): boolean {
  return firstStart < secondEnd && secondStart < firstEnd;
}

export function hasAppointmentConflict(
  firstAppointment: Appointment,
  secondAppointment: Appointment,
): boolean {
  if (firstAppointment.staffMemberId !== secondAppointment.staffMemberId) {
    return false;
  }

  const firstOccupiedRanges = getOccupiedRanges(
    buildAppointmentTimeline(firstAppointment),
  );

  const secondOccupiedRanges = getOccupiedRanges(
    buildAppointmentTimeline(secondAppointment),
  );

  return firstOccupiedRanges.some((firstRange) =>
    secondOccupiedRanges.some((secondRange) =>
      rangesOverlap(
        firstRange.startAt,
        firstRange.endAt,
        secondRange.startAt,
        secondRange.endAt,
      ),
    ),
  );
}
