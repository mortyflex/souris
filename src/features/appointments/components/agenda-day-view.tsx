import type { CSSProperties } from "react";

import type { Appointment } from "@/domain/appointments/appointment.types";
import { buildAppointmentTimeline } from "@/domain/appointments/buildAppointmentTimeline";

import { AgendaAppointmentCard } from "./agenda-appointment-card";
import styles from "./agenda-day-view.module.css";

const STEP_MINUTES = 15;
const MILLISECONDS_PER_MINUTE = 60_000;

export type AgendaDayAppointment = {
  appointment: Appointment;
  clientName: string;
};

type AgendaDayViewProps = {
  dayStartAt: Date;
  dayEndAt: Date;
  appointments: AgendaDayAppointment[];
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
    .filter(({ appointment }) => {
      const endAt = getAppointmentEndAt(appointment);

      return (
        appointment.startAt < dayEndAt &&
        endAt > dayStartAt &&
        endAt > appointment.startAt
      );
    })
    .sort(
      (first, second) =>
        first.appointment.startAt.getTime() -
        second.appointment.startAt.getTime(),
    );

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
        {visibleAppointments.map(({ appointment, clientName }) => {
          const appointmentEndAt = getAppointmentEndAt(appointment);

          const visibleStartAt =
            appointment.startAt < dayStartAt ? dayStartAt : appointment.startAt;

          const visibleEndAt =
            appointmentEndAt > dayEndAt ? dayEndAt : appointmentEndAt;

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

          return (
            <div
              className={styles.appointment}
              data-agenda-appointment-id={appointment.id}
              key={appointment.id}
              style={{
                gridRow: `${startRow} / span ${rowSpan}`,
              }}
            >
              <AgendaAppointmentCard
                appointment={appointment}
                clientName={clientName}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
