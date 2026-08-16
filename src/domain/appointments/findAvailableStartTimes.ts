import type { Appointment } from "./appointment.types";
import { buildAppointmentTimeline } from "./buildAppointmentTimeline";
import { canScheduleAppointmentAt } from "./canScheduleAppointmentAt";

type FindAvailableStartTimesParams = {
  appointment: Appointment;
  existingAppointments: Appointment[];
  windowStart: Date;
  windowEnd: Date;
  stepMinutes: number;
};

export function findAvailableStartTimes({
  appointment,
  existingAppointments,
  windowStart,
  windowEnd,
  stepMinutes,
}: FindAvailableStartTimesParams): Date[] {
  if (stepMinutes <= 0) {
    return [];
  }

  if (windowStart >= windowEnd) {
    return [];
  }

  const availableStartTimes: Date[] = [];
  const stepMilliseconds = stepMinutes * 60_000;

  for (
    let timestamp = windowStart.getTime();
    timestamp < windowEnd.getTime();
    timestamp += stepMilliseconds
  ) {
    const candidateStartAt = new Date(timestamp);

    const candidate: Appointment = {
      ...appointment,
      startAt: candidateStartAt,
    };

    const timeline = buildAppointmentTimeline(candidate);

    if (timeline.length === 0) {
      continue;
    }

    const lastPhase = timeline[timeline.length - 1];

    if (!lastPhase || lastPhase.endAt > windowEnd) {
      continue;
    }

    if (
      canScheduleAppointmentAt(
        appointment,
        candidateStartAt,
        existingAppointments,
      )
    ) {
      availableStartTimes.push(candidateStartAt);
    }
  }

  return availableStartTimes;
}
