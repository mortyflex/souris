import type { AgendaServiceColor } from "./agenda-visual.types";
import styles from "./styles/agenda-colors.module.css";

const colorClassNames: Record<AgendaServiceColor, string> = {
  lavender: styles.serviceLavender,
  rose: styles.serviceRose,
  peach: styles.servicePeach,
  sky: styles.serviceSky,
  mint: styles.serviceMint,
  sand: styles.serviceSand,
};

export function getAgendaServiceColorClass(color: AgendaServiceColor): string {
  return colorClassNames[color];
}
