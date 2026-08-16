import type { Appointment } from "@/domain/appointments/appointment.types";
import { buildAppointmentTimeline } from "@/domain/appointments/buildAppointmentTimeline";
import { getAppointmentSummary } from "@/domain/appointments/getAppointmentSummary";

import type { AgendaServiceColor } from "../agenda-visual.types";
import { getAgendaServiceColorClass } from "../get-agenda-service-color-class";
import { AppointmentPhaseTimeline } from "./appointment-phase-timeline";
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
  const orderedItems = [...appointment.items].sort(
    (firstItem, secondItem) => firstItem.order - secondItem.order,
  );

  return orderedItems.map((item) => item.serviceName).join(" · ");
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

  const isExtraCompact = density === "extra-compact";
  const isStandard = density === "standard";
  const isDetailed = density === "detailed";

  const showTimeRange = !isExtraCompact;
  const showDuration = isStandard || isDetailed;
  const showPhaseTimeline = (isStandard || isDetailed) && timeline.length > 1;

  const showPhaseLabels = isDetailed;

  const colorClassName = getAgendaServiceColorClass(color);

  return (
    <article
      aria-label={`${clientName}, ${serviceSummary}`}
      className={[styles.event, styles[density], colorClassName].join(" ")}
      data-agenda-day-event-id={appointment.id}
      data-density={density}
    >
      <div className={styles.accent} />

      <div className={styles.content}>
        <div className={styles.topRow}>
          <div className={styles.identity}>
            <h3 className={styles.clientName}>{clientName}</h3>

            <p className={styles.services}>{serviceSummary}</p>
          </div>

          {showDuration ? (
            <span className={styles.duration}>
              {summary.totalDurationMinutes} min
            </span>
          ) : null}
        </div>

        <p className={styles.time}>
          <time dateTime={appointment.startAt.toISOString()}>
            {timeFormatter.format(appointment.startAt)}
          </time>

          {showTimeRange ? (
            <>
              <span aria-hidden="true">–</span>

              <time dateTime={appointmentEndAt.toISOString()}>
                {timeFormatter.format(appointmentEndAt)}
              </time>
            </>
          ) : null}
        </p>

        {showPhaseTimeline ? (
          <AppointmentPhaseTimeline
            color={color}
            phases={timeline.map((phase) => ({
              id: phase.phaseId,
              name: phase.label,
              durationMinutes: phase.durationMinutes,
              requiresStaff: phase.requiresStaff,
            }))}
            showLabels={showPhaseLabels}
          />
        ) : null}

        {isDetailed && summary.processingDurationMinutes > 0 ? (
          <p className={styles.processingSummary}>
            {summary.processingDurationMinutes} min de pose
          </p>
        ) : null}
      </div>
    </article>
  );
}
