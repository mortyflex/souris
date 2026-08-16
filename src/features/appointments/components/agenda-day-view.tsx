import type { CSSProperties } from "react";

import type { Appointment } from "@/domain/appointments/appointment.types";
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

type AgendaDayViewProps = {
  dayStartAt: Date;
  dayEndAt: Date;
  appointments: AgendaDayAppointment[];
};

type PositionedAppointment = AgendaDayAppointment & {
  endAt: Date;
  visibleStartAt: Date;
  visibleEndAt: Date;
  columnIndex: number;
  columnCount: number;
};

function getMinutesBetween(startAt: Date, endAt: Date): number {
  return (endAt.getTime() - startAt.getTime()) / MILLISECONDS_PER_MINUTE;
}

function getAppointmentEndAt(appointment: Appointment): Date {
  const timeline = buildAppointmentTimeline(appointment);

  return timeline[timeline.length - 1]?.endAt ?? appointment.startAt;
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

function appointmentsOverlap(
  first: PositionedAppointment,
  second: PositionedAppointment,
): boolean {
  return (
    first.visibleStartAt < second.visibleEndAt &&
    second.visibleStartAt < first.visibleEndAt
  );
}

function positionOverlappingAppointments(
  appointments: PositionedAppointment[],
): PositionedAppointment[] {
  if (appointments.length === 0) {
    return [];
  }

  const positionedAppointments = appointments.map((appointment) => ({
    ...appointment,
    columnIndex: 0,
    columnCount: 1,
  }));

  const groups: PositionedAppointment[][] = [];
  let currentGroup: PositionedAppointment[] = [];
  let currentGroupEndAt: Date | null = null;

  for (const appointment of positionedAppointments) {
    if (
      currentGroup.length === 0 ||
      !currentGroupEndAt ||
      appointment.visibleStartAt < currentGroupEndAt
    ) {
      currentGroup.push(appointment);

      if (!currentGroupEndAt || appointment.visibleEndAt > currentGroupEndAt) {
        currentGroupEndAt = appointment.visibleEndAt;
      }

      continue;
    }

    groups.push(currentGroup);
    currentGroup = [appointment];
    currentGroupEndAt = appointment.visibleEndAt;
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  for (const group of groups) {
    const columns: PositionedAppointment[][] = [];

    for (const appointment of group) {
      let availableColumnIndex = columns.findIndex((column) =>
        column.every(
          (existingAppointment) =>
            !appointmentsOverlap(appointment, existingAppointment),
        ),
      );

      if (availableColumnIndex === -1) {
        availableColumnIndex = columns.length;
        columns.push([]);
      }

      columns[availableColumnIndex]?.push(appointment);

      appointment.columnIndex = availableColumnIndex;
    }

    const columnCount = Math.max(1, columns.length);

    for (const appointment of group) {
      appointment.columnCount = columnCount;
    }
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
      const { appointment } = agendaAppointment;

      const endAt = getAppointmentEndAt(appointment);

      if (
        appointment.startAt >= dayEndAt ||
        endAt <= dayStartAt ||
        endAt <= appointment.startAt
      ) {
        return null;
      }

      return {
        ...agendaAppointment,
        endAt,
        visibleStartAt:
          appointment.startAt < dayStartAt ? dayStartAt : appointment.startAt,
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

  const positionedAppointments =
    positionOverlappingAppointments(visibleAppointments);

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

            const startRow = Math.floor(startOffsetMinutes / STEP_MINUTES) + 1;

            const rowSpan = Math.max(
              1,
              Math.ceil(visibleDurationMinutes / STEP_MINUTES),
            );

            const density = getDensity(
              getMinutesBetween(
                appointment.startAt,
                getAppointmentEndAt(appointment),
              ),
            );

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
