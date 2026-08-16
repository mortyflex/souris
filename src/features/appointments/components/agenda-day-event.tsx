import type { Appointment } from "@/domain/appointments/appointment.types";
import { buildAppointmentTimeline } from "@/domain/appointments/buildAppointmentTimeline";
import { getAppointmentSummary } from "@/domain/appointments/getAppointmentSummary";

import type { AgendaServiceColor } from "../agenda-visual.types";
import { getAgendaServiceColorClass } from "../get-agenda-service-color-class";
import { AgendaDayEventPhases } from "./agenda-day-event-phases";
import styles from "./agenda-day-event.module.css";

type AgendaDayEventDensity =
  | "extra-compact"
  | "compact"
  | "standard"
  | "detailed";

type AgendaDayEventProps = {
  appointment: Appointment;
  clientName: string;
  color: AgendaServiceColor;
  density?: AgendaDayEventDensity;
};

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

function getServiceSummary(appointment: Appointment): string {
  return [...appointment.items]
    .sort((firstItem, secondItem) => firstItem.order - secondItem.order)
    .map((item) => item.serviceName)
    .join(" · ");
}

export function AgendaDayEvent({
  appointment,
  clientName,
  color,
  density = "standard",
}: AgendaDayEventProps) {
  const timeline = buildAppointmentTimeline(appointment);

  const summary = getAppointmentSummary(appointment);

  const appointmentEndAt =
    timeline[timeline.length - 1]?.endAt ?? appointment.startAt;

  const serviceSummary = getServiceSummary(appointment);

  const colorClassName = getAgendaServiceColorClass(color);

  const showPhases = density === "standard" || density === "detailed";

  return (
    <article
      aria-label={`${clientName}, ${serviceSummary}`}
      className={[styles.event, styles[density], colorClassName].join(" ")}
      data-agenda-day-event-id={appointment.id}
      data-density={density}
    >
      <header className={styles.header}>
        <div className={styles.identity}>
          <h3 className={styles.clientName}>{clientName}</h3>

          <p className={styles.services}>{serviceSummary}</p>
        </div>

        <p className={styles.time}>
          <time dateTime={appointment.startAt.toISOString()}>
            {timeFormatter.format(appointment.startAt)}
          </time>

          {density !== "extra-compact" ? (
            <>
              <span aria-hidden="true">–</span>

              <time dateTime={appointmentEndAt.toISOString()}>
                {timeFormatter.format(appointmentEndAt)}
              </time>
            </>
          ) : null}
        </p>
      </header>

      {showPhases ? (
        <div className={styles.phaseArea}>
          <AgendaDayEventPhases color={color} phases={timeline} />
        </div>
      ) : null}

      {density === "detailed" ? (
        <footer className={styles.footer}>
          <span>{summary.totalDurationMinutes} min</span>

          {summary.processingDurationMinutes > 0 ? (
            <span>{summary.processingDurationMinutes} min de pose</span>
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}
