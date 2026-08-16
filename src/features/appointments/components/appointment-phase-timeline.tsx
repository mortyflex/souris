import type { AppointmentPhase } from "@/domain/appointments/appointment.types";

import type { AgendaServiceColor } from "../agenda-visual.types";
import { getAgendaServiceColorClass } from "../get-agenda-service-color-class";
import styles from "./appointment-phase-timeline.module.css";

type AppointmentPhaseTimelineProps = {
  phases: AppointmentPhase[];
  color: AgendaServiceColor;
  showLabels?: boolean;
};

export function AppointmentPhaseTimeline({
  phases,
  color,
  showLabels = true,
}: AppointmentPhaseTimelineProps) {
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
      aria-label="Déroulement du rendez-vous"
      className={`${styles.timeline} ${colorClassName}`}
    >
      <div className={styles.track}>
        {validPhases.map((phase) => (
          <div
            aria-label={`${phase.name}, ${phase.durationMinutes} min${
              phase.requiresStaff ? ", professionnel occupé" : ", temps de pose"
            }`}
            className={
              phase.requiresStaff
                ? styles.activeSegment
                : styles.processingSegment
            }
            data-phase-id={phase.id}
            data-requires-staff={phase.requiresStaff ? "true" : "false"}
            key={phase.id}
            role="img"
            style={{
              flexGrow: phase.durationMinutes,
            }}
          />
        ))}
      </div>

      {showLabels ? (
        <div className={styles.labels}>
          {validPhases.map((phase) => (
            <div
              className={styles.label}
              key={phase.id}
              style={{
                flexGrow: phase.durationMinutes,
              }}
            >
              <span className={styles.labelName}>{phase.name}</span>

              <span className={styles.labelDuration}>
                {phase.durationMinutes} min
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
