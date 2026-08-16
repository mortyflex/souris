import type { Appointment } from "@/domain/appointments/appointment.types";
import { buildAppointmentTimeline } from "@/domain/appointments/buildAppointmentTimeline";
import { getAppointmentSummary } from "@/domain/appointments/getAppointmentSummary";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";

import styles from "./agenda-appointment-card.module.css";

type AgendaAppointmentCardProps = {
  appointment: Appointment;
  clientName: string;
};

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function AgendaAppointmentCard({
  appointment,
  clientName,
}: AgendaAppointmentCardProps) {
  const timeline = buildAppointmentTimeline(appointment);
  const summary = getAppointmentSummary(appointment);

  const orderedItems = [...appointment.items].sort(
    (firstItem, secondItem) => firstItem.order - secondItem.order,
  );

  const appointmentEndAt =
    timeline[timeline.length - 1]?.endAt ?? appointment.startAt;

  return (
    <Card className={styles.card} data-appointment-id={appointment.id}>
      <div className={styles.header}>
        <div>
          <p className={styles.time}>
            <time dateTime={appointment.startAt.toISOString()}>
              {timeFormatter.format(appointment.startAt)}
            </time>

            <span aria-hidden="true">—</span>

            <time dateTime={appointmentEndAt.toISOString()}>
              {timeFormatter.format(appointmentEndAt)}
            </time>
          </p>

          <h3 className={styles.clientName}>{clientName}</h3>
        </div>

        <Badge variant="primary">{summary.totalDurationMinutes} min</Badge>
      </div>

      <div className={styles.services}>
        {orderedItems.map((item) => (
          <p className={styles.serviceName} key={item.id}>
            {item.serviceName}
          </p>
        ))}
      </div>

      {timeline.length > 0 ? (
        <div aria-label="Phases du rendez-vous" className={styles.phases}>
          {timeline.map((phase) => (
            <Badge
              key={phase.phaseId}
              variant={phase.requiresStaff ? "neutral" : "processing"}
            >
              {phase.label} · {phase.durationMinutes} min
            </Badge>
          ))}
        </div>
      ) : null}

      <div className={styles.footer}>
        <span>{summary.occupiedDurationMinutes} min occupées</span>

        <strong>{priceFormatter.format(summary.totalPrice)}</strong>
      </div>
    </Card>
  );
}
