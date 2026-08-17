import type { CSSProperties } from "react";

import type {
  Appointment,
  TimelinePhase,
} from "@/domain/appointments/appointment.types";
import { buildAppointmentTimeline } from "@/domain/appointments/buildAppointmentTimeline";

import type { AgendaServiceColor } from "../agenda-visual.types";
import { AgendaDayEvent } from "./agenda-day-event";
import styles from "./agenda-day-view.module.css";

const STEP_MINUTES = 15;
const MILLISECONDS_PER_MINUTE = 60_000;

type AgendaDayEventDensity =
  | "extra-compact"
  | "compact"
  | "standard"
  | "detailed";

export type AgendaDayAppointment = {
  appointment: Appointment;
  clientName: string;
  color?: AgendaServiceColor;
};

type PositionedAppointment = AgendaDayAppointment & {
  timeline: TimelinePhase[];
  endAt: Date;
  visibleStartAt: Date;
  visibleEndAt: Date;
  columnIndex: number;
  columnCount: number;
};

function getMinutesBetween(startAt: Date, endAt: Date): number {
  return (endAt.getTime() - startAt.getTime()) / MILLISECONDS_PER_MINUTE;
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getDensity(durationMinutes: number): AgendaDayEventDensity {
  if (durationMinutes <= 30) {
    return "extra-compact";
  }

  if (durationMinutes <= 45) {
    return "compact";
  }

  if (durationMinutes <= 75) {
    return "standard";
  }

  return "detailed";
}

function rangesOverlap(
  firstStartAt: Date,
  firstEndAt: Date,
  secondStartAt: Date,
  secondEndAt: Date,
): boolean {
  return firstStartAt < secondEndAt && secondStartAt < firstEndAt;
}

function appointmentsRequireStaffAtSameTime(
  first: PositionedAppointment,
  second: PositionedAppointment,
): boolean {
  const firstOccupiedPhases = first.timeline.filter(
    (phase) => phase.requiresStaff,
  );

  const secondOccupiedPhases = second.timeline.filter(
    (phase) => phase.requiresStaff,
  );

  return firstOccupiedPhases.some((firstPhase) =>
    secondOccupiedPhases.some((secondPhase) =>
      rangesOverlap(
        firstPhase.startAt,
        firstPhase.endAt,
        secondPhase.startAt,
        secondPhase.endAt,
      ),
    ),
  );
}

function appointmentsExistAtSameTime(
  first: PositionedAppointment,
  second: PositionedAppointment,
): boolean {
  return rangesOverlap(
    first.visibleStartAt,
    first.visibleEndAt,
    second.visibleStartAt,
    second.visibleEndAt,
  );
}

function positionAppointments(
  appointments: PositionedAppointment[],
): PositionedAppointment[] {
  const positionedAppointments = appointments.map((appointment) => ({
    ...appointment,
    columnIndex: 0,
    columnCount: 1,
  }));

  for (let index = 0; index < positionedAppointments.length; index += 1) {
    const appointment = positionedAppointments[index];

    if (!appointment) {
      continue;
    }

    const previousConflictingAppointments = positionedAppointments
      .slice(0, index)
      .filter((previousAppointment) =>
        appointmentsRequireStaffAtSameTime(appointment, previousAppointment),
      );

    const usedColumns = new Set(
      previousConflictingAppointments.map(
        (previousAppointment) => previousAppointment.columnIndex,
      ),
    );

    let columnIndex = 0;

    while (usedColumns.has(columnIndex)) {
      columnIndex += 1;
    }

    appointment.columnIndex = columnIndex;
  }

  for (const appointment of positionedAppointments) {
    const relatedAppointments = positionedAppointments.filter(
      (otherAppointment) =>
        otherAppointment.appointment.id !== appointment.appointment.id &&
        appointmentsExistAtSameTime(appointment, otherAppointment) &&
        appointmentsRequireStaffAtSameTime(appointment, otherAppointment),
    );

    appointment.columnCount = Math.max(
      1,
      appointment.columnIndex + 1,
      ...relatedAppointments.map(
        (relatedAppointment) => relatedAppointment.columnIndex + 1,
      ),
    );
  }

  return positionedAppointments;
}

export function AgendaDayView({
  dayStartAt,
  dayEndAt,
  appointments,
}: AgendaDayViewProps) {
  const dayDurationMinutes = getMinutesBetween(dayStartAt, dayEndAt);

  const slotCount = Math.max(0, Math.ceil(dayDurationMinutes / STEP_MINUTES));

  const timeSlots = Array.from(
    { length: slotCount },
    (_, index) =>
      new Date(
        dayStartAt.getTime() + index * STEP_MINUTES * MILLISECONDS_PER_MINUTE,
      ),
  );

  const visibleAppointments = appointments
    .map((agendaAppointment) => {
      const timeline = buildAppointmentTimeline(agendaAppointment.appointment);

      const endAt =
        timeline[timeline.length - 1]?.endAt ??
        agendaAppointment.appointment.startAt;

      if (
        agendaAppointment.appointment.startAt >= dayEndAt ||
        endAt <= dayStartAt ||
        endAt <= agendaAppointment.appointment.startAt
      ) {
        return null;
      }

      return {
        ...agendaAppointment,
        timeline,
        endAt,
        visibleStartAt:
          agendaAppointment.appointment.startAt < dayStartAt
            ? dayStartAt
            : agendaAppointment.appointment.startAt,
        visibleEndAt: endAt > dayEndAt ? dayEndAt : endAt,
        columnIndex: 0,
        columnCount: 1,
      };
    })
    .filter(
      (appointment): appointment is PositionedAppointment =>
        appointment !== null,
    )
    .sort(
      (first, second) =>
        first.visibleStartAt.getTime() - second.visibleStartAt.getTime() ||
        second.visibleEndAt.getTime() - first.visibleEndAt.getTime(),
    );

  const positionedAppointments = positionAppointments(visibleAppointments);

  return (
    <section aria-label="Agenda de la journée" className={styles.day}>
      <div
        aria-hidden="true"
        className={styles.timeline}
        style={
          {
            "--agenda-slot-count": slotCount,
          } as CSSProperties
        }
      >
        {timeSlots.map((startAt) => {
          const isHour = startAt.getMinutes() === 0;

          return (
            <div
              className={styles.timeSlot}
              data-hour={isHour ? "true" : "false"}
              key={startAt.toISOString()}
            >
              {isHour ? (
                <span className={styles.timeLabel}>{formatTime(startAt)}</span>
              ) : null}

              <span className={styles.slotLine} />
            </div>
          );
        })}
      </div>

      <div
        className={styles.appointments}
        style={
          {
            "--agenda-slot-count": slotCount,
          } as CSSProperties
        }
      >
        {positionedAppointments.map(
          ({
            appointment,
            clientName,
            color = "sand",
            endAt,
            visibleStartAt,
            visibleEndAt,
            columnIndex,
            columnCount,
          }) => {
            const startOffsetMinutes = getMinutesBetween(
              dayStartAt,
              visibleStartAt,
            );

            const visibleDurationMinutes = getMinutesBetween(
              visibleStartAt,
              visibleEndAt,
            );

            const totalDurationMinutes = getMinutesBetween(
              appointment.startAt,
              endAt,
            );

            const startRow = Math.floor(startOffsetMinutes / STEP_MINUTES) + 1;

            const rowSpan = Math.max(
              1,
              Math.ceil(visibleDurationMinutes / STEP_MINUTES),
            );

            const density = getDensity(totalDurationMinutes);

            return (
              <div
                className={styles.appointment}
                data-agenda-appointment-id={appointment.id}
                data-column-count={columnCount}
                data-column-index={columnIndex}
                key={appointment.id}
                style={
                  {
                    "--agenda-column-count": columnCount,
                    "--agenda-column-index": columnIndex,
                    gridRow: `${startRow} / span ${rowSpan}`,
                  } as CSSProperties
                }
              >
                <AgendaDayEvent
                  appointment={appointment}
                  clientName={clientName}
                  color={color}
                  density={density}
                />
              </div>
            );
          },
        )}
      </div>
    </section>
  );
}

type AgendaDayViewProps = {
  dayStartAt: Date;
  dayEndAt: Date;
  appointments: AgendaDayAppointment[];
};
