import type { TimelinePhase } from "@/domain/appointments/appointment.types";

import type { AgendaServiceColor } from "../agenda-visual.types";
import { getAgendaServiceColorClass } from "../get-agenda-service-color-class";
import styles from "./agenda-day-event-phases.module.css";

type AgendaDayEventPhasesProps = {
  phases: TimelinePhase[];
  color: AgendaServiceColor;
};

export function AgendaDayEventPhases({
  phases,
  color,
}: AgendaDayEventPhasesProps) {
  const validPhases = phases.filter(
    (phase) =>
      Number.isFinite(phase.durationMinutes) && phase.durationMinutes > 0,
  );

  if (validPhases.length === 0) {
    return null;
  }

  const colorClassName = getAgendaServiceColorClass(color);

  return (
    <div
      aria-label="Phases du rendez-vous"
      className={`${styles.phases} ${colorClassName}`}
    >
      {validPhases.map((phase) => (
        <div
          className={
            phase.requiresStaff ? styles.activePhase : styles.processingPhase
          }
          data-phase-id={phase.phaseId}
          data-requires-staff={phase.requiresStaff ? "true" : "false"}
          key={phase.phaseId}
          style={{
            flexGrow: phase.durationMinutes,
          }}
        >
          <div className={styles.phaseContent}>
            <span className={styles.phaseName}>{phase.label}</span>

            <span className={styles.phaseDuration}>
              {phase.durationMinutes} min
            </span>

            {!phase.requiresStaff ? (
              <span className={styles.availability}>Disponible</span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
