import type { CSSProperties } from "react";

import type {
  Appointment,
  AppointmentItem,
  TimelinePhase,
} from "@/domain/appointments/appointment.types";
import { buildAppointmentTimeline } from "@/domain/appointments/buildAppointmentTimeline";

import type { AgendaServiceColor } from "../agenda-visual.types";
import { AgendaDayPhase } from "./agenda-day-phase";
import styles from "./agenda-day-view.module.css";

const STEP_MINUTES = 15;
const PIXELS_PER_MINUTE = 3;
const MILLISECONDS_PER_MINUTE = 60_000;

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

type AgendaPhaseEntry = {
  appointment: Appointment;
  clientName: string;
  color: AgendaServiceColor;
  phase: TimelinePhase;
  serviceName: string;
  isFirstPhase: boolean;
  isLastPhase: boolean;
  isResume: boolean;
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

function rangesOverlap(
  firstStartAt: Date,
  firstEndAt: Date,
  secondStartAt: Date,
  secondEndAt: Date,
): boolean {
  return firstStartAt < secondEndAt && secondStartAt < firstEndAt;
}

function getOrderedItems(appointment: Appointment): AppointmentItem[] {
  return [...appointment.items].sort(
    (firstItem, secondItem) => firstItem.order - secondItem.order,
  );
}

function getServiceNameForPhase(
  appointment: Appointment,
  phase: TimelinePhase,
): string {
  const item = appointment.items.find(
    (appointmentItem) => appointmentItem.id === phase.appointmentItemId,
  );

  return item?.serviceName ?? phase.label;
}

function buildPhaseEntries(
  agendaAppointment: AgendaDayAppointment,
): AgendaPhaseEntry[] {
  const { appointment, clientName, color = "sand" } = agendaAppointment;

  const timeline = buildAppointmentTimeline(appointment);

  const orderedItems = getOrderedItems(appointment);

  return timeline.map((phase, index) => {
    const itemIndex = orderedItems.findIndex(
      (item) => item.id === phase.appointmentItemId,
    );

    const previousPhase = timeline[index - 1];

    const isResume =
      phase.requiresStaff &&
      index > 0 &&
      (previousPhase?.requiresStaff === false || itemIndex > 0);

    return {
      appointment,
      clientName,
      color,
      phase,
      serviceName: getServiceNameForPhase(appointment, phase),
      isFirstPhase: index === 0,
      isLastPhase: index === timeline.length - 1,
      isResume,
      columnIndex: 0,
      columnCount: 1,
    };
  });
}

function positionActivePhases(entries: AgendaPhaseEntry[]): AgendaPhaseEntry[] {
  const positionedEntries = entries.map((entry) => ({
    ...entry,
    columnIndex: 0,
    columnCount: 1,
  }));

  const activeEntries = positionedEntries
    .filter((entry) => entry.phase.requiresStaff)
    .sort(
      (first, second) =>
        first.phase.startAt.getTime() - second.phase.startAt.getTime() ||
        second.phase.endAt.getTime() - first.phase.endAt.getTime(),
    );

  for (let index = 0; index < activeEntries.length; index += 1) {
    const entry = activeEntries[index];

    if (!entry) {
      continue;
    }

    const previousOverlaps = activeEntries
      .slice(0, index)
      .filter((previousEntry) =>
        rangesOverlap(
          entry.phase.startAt,
          entry.phase.endAt,
          previousEntry.phase.startAt,
          previousEntry.phase.endAt,
        ),
      );

    const usedColumns = new Set(
      previousOverlaps.map((previousEntry) => previousEntry.columnIndex),
    );

    let columnIndex = 0;

    while (usedColumns.has(columnIndex)) {
      columnIndex += 1;
    }

    entry.columnIndex = columnIndex;
  }

  for (const entry of activeEntries) {
    const overlappingEntries = activeEntries.filter(
      (otherEntry) =>
        otherEntry.phase.phaseId !== entry.phase.phaseId &&
        rangesOverlap(
          entry.phase.startAt,
          entry.phase.endAt,
          otherEntry.phase.startAt,
          otherEntry.phase.endAt,
        ),
    );

    entry.columnCount = Math.max(
      1,
      entry.columnIndex + 1,
      ...overlappingEntries.map(
        (overlappingEntry) => overlappingEntry.columnIndex + 1,
      ),
    );
  }

  return positionedEntries;
}

export function AgendaDayView({
  dayStartAt,
  dayEndAt,
  appointments,
}: AgendaDayViewProps) {
  const dayDurationMinutes = getMinutesBetween(dayStartAt, dayEndAt);

  const dayHeight = dayDurationMinutes * PIXELS_PER_MINUTE;

  const slotCount = Math.max(0, Math.ceil(dayDurationMinutes / STEP_MINUTES));

  const timeSlots = Array.from(
    { length: slotCount },
    (_, index) =>
      new Date(
        dayStartAt.getTime() + index * STEP_MINUTES * MILLISECONDS_PER_MINUTE,
      ),
  );

  const phaseEntries = appointments
    .flatMap(buildPhaseEntries)
    .filter(
      (entry) =>
        entry.phase.startAt < dayEndAt && entry.phase.endAt > dayStartAt,
    );

  const positionedEntries = positionActivePhases(phaseEntries).filter(
    (entry) => entry.phase.requiresStaff,
  );

  return (
    <section
      aria-label="Agenda de la journée"
      className={styles.day}
      style={
        {
          "--agenda-day-height": `${dayHeight}px`,
          "--agenda-pixels-per-minute": `${PIXELS_PER_MINUTE}px`,
        } as CSSProperties
      }
    >
      <div aria-hidden="true" className={styles.timeline}>
        {timeSlots.map((startAt) => {
          const isHour = startAt.getMinutes() === 0;

          const top =
            getMinutesBetween(dayStartAt, startAt) * PIXELS_PER_MINUTE;

          return (
            <div
              className={styles.timeSlot}
              data-hour={isHour ? "true" : "false"}
              key={startAt.toISOString()}
              style={{
                top: `${top}px`,
              }}
            >
              {isHour ? (
                <span className={styles.timeLabel}>{formatTime(startAt)}</span>
              ) : null}

              <span className={styles.slotLine} />
            </div>
          );
        })}
      </div>

      <div className={styles.phases}>
        {positionedEntries.map(
          ({
            appointment,
            clientName,
            color,
            phase,
            serviceName,
            isFirstPhase,
            isLastPhase,
            isResume,
            columnIndex,
            columnCount,
          }) => {
            const visibleStartAt =
              phase.startAt < dayStartAt ? dayStartAt : phase.startAt;

            const visibleEndAt =
              phase.endAt > dayEndAt ? dayEndAt : phase.endAt;

            const startOffsetMinutes = getMinutesBetween(
              dayStartAt,
              visibleStartAt,
            );

            const visibleDurationMinutes = getMinutesBetween(
              visibleStartAt,
              visibleEndAt,
            );

            const top = startOffsetMinutes * PIXELS_PER_MINUTE;

            const height = visibleDurationMinutes * PIXELS_PER_MINUTE;

            return (
              <div
                className={
                  phase.requiresStaff
                    ? styles.activePhasePosition
                    : styles.processingPhasePosition
                }
                data-agenda-appointment-id={appointment.id}
                data-agenda-phase-id={phase.phaseId}
                data-column-count={columnCount}
                data-column-index={columnIndex}
                key={`${appointment.id}-${phase.phaseId}`}
                style={
                  {
                    "--agenda-column-count": columnCount,
                    "--agenda-column-index": columnIndex,
                    height: `${height}px`,
                    top: `${top}px`,
                  } as CSSProperties
                }
              >
                <AgendaDayPhase
                  clientName={clientName}
                  color={color}
                  isFirstPhase={isFirstPhase}
                  isLastPhase={isLastPhase}
                  isResume={isResume}
                  phase={phase}
                  serviceName={serviceName}
                />
              </div>
            );
          },
        )}
      </div>
    </section>
  );
}
