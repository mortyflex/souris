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
  isResume,
}: {
  serviceName: string;
  isResume: boolean;
}): string {
  if (isResume) {
    return `Reprise · ${serviceName}`;
  }

  return serviceName;
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

  if (!phase.requiresStaff) {
    const resumeTime = timeFormatter.format(phase.endAt);

    return (
      <div
        aria-label={`${clientName}, pose, reprise à ${resumeTime}`}
        className={`${styles.processingPhase} ${colorClassName}`}
        data-phase-id={phase.phaseId}
        data-phase-kind="processing"
      >
        <span className={styles.processingLabel}>
          {clientName} · {phase.label}
        </span>

        <span className={styles.processingResume}>Reprise {resumeTime}</span>
      </div>
    );
  }

  const activityLabel = getActivityLabel({
    serviceName,
    isResume,
  });

  return (
    <article
      aria-label={`${clientName}, ${activityLabel}`}
      className={`${styles.activePhase} ${colorClassName}`}
      data-first-phase={isFirstPhase ? "true" : "false"}
      data-last-phase={isLastPhase ? "true" : "false"}
      data-phase-id={phase.phaseId}
      data-phase-kind="active"
      data-resume={isResume ? "true" : "false"}
    >
      <h3 className={styles.clientName}>{clientName}</h3>

      <p className={styles.activity}>{activityLabel}</p>
    </article>
  );
}
