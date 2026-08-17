import type { TimelinePhase } from "@/domain/appointments/appointment.types";

import type { AgendaServiceColor } from "../agenda-visual.types";
import { getAgendaServiceColorClass } from "../get-agenda-service-color-class";
import styles from "./agenda-day-phase.module.css";

type AgendaDayPhaseProps = {
  phase: TimelinePhase;
  clientName: string;
  serviceName: string;
  color: AgendaServiceColor;
  isFirstPhase: boolean;
  isLastPhase: boolean;
  isResume: boolean;
};

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

function getActivityLabel({
  serviceName,
  phaseName,
  isResume,
}: {
  serviceName: string;
  phaseName: string;
  isResume: boolean;
}): string {
  if (isResume) {
    return `Reprise · ${serviceName}`;
  }

  if (
    serviceName.trim().toLocaleLowerCase("fr-FR") ===
    phaseName.trim().toLocaleLowerCase("fr-FR")
  ) {
    return serviceName;
  }

  return `${serviceName} · ${phaseName}`;
}

export function AgendaDayPhase({
  phase,
  clientName,
  serviceName,
  color,
  isFirstPhase,
  isLastPhase,
  isResume,
}: AgendaDayPhaseProps) {
  const colorClassName = getAgendaServiceColorClass(color);

  const startTime = timeFormatter.format(phase.startAt);

  const endTime = timeFormatter.format(phase.endAt);

  if (!phase.requiresStaff) {
    return (
      <div
        aria-label={`${clientName}, ${phase.label}, ${phase.durationMinutes} min, professionnel disponible, reprise à ${endTime}`}
        className={`${styles.processingPhase} ${colorClassName}`}
        data-phase-id={phase.phaseId}
        data-phase-kind="processing"
      >
        <span className={styles.processingIdentity}>{clientName}</span>

        <span aria-hidden="true" className={styles.processingSeparator}>
          ·
        </span>

        <span className={styles.processingName}>{phase.label}</span>

        <span className={styles.processingDuration}>
          {phase.durationMinutes} min
        </span>

        <span className={styles.processingResume}>Reprise {endTime}</span>
      </div>
    );
  }

  const activityLabel = getActivityLabel({
    serviceName,
    phaseName: phase.label,
    isResume,
  });

  return (
    <article
      aria-label={`${clientName}, ${activityLabel}, ${startTime}, ${phase.durationMinutes} min`}
      className={`${styles.activePhase} ${colorClassName}`}
      data-first-phase={isFirstPhase ? "true" : "false"}
      data-last-phase={isLastPhase ? "true" : "false"}
      data-phase-id={phase.phaseId}
      data-phase-kind="active"
      data-resume={isResume ? "true" : "false"}
    >
      <div className={styles.activeHeader}>
        <h3 className={styles.clientName}>{clientName}</h3>

        <time
          className={styles.startTime}
          dateTime={phase.startAt.toISOString()}
        >
          {startTime}
        </time>
      </div>

      <p className={styles.activity}>{activityLabel}</p>

      <p className={styles.duration}>{phase.durationMinutes} min</p>
    </article>
  );
}
