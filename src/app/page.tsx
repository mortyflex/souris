import { AgendaDayView } from "@/features/appointments/components/agenda-day-view";
import {
  agendaDemoAppointments,
  agendaDemoDayEndAt,
  agendaDemoDayStartAt,
} from "@/features/appointments/demo/agenda-day-demo-data";

import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>Agenda</p>

            <h1 className={styles.title}>Bonjour 👋</h1>

            <p className={styles.description}>
              Une journée avec prestations, temps de pose et reprises.
            </p>
          </div>

          <div className={styles.date}>Lundi 17 août</div>
        </header>

        <div className={styles.agenda}>
          <AgendaDayView
            appointments={agendaDemoAppointments}
            dayEndAt={agendaDemoDayEndAt}
            dayStartAt={agendaDemoDayStartAt}
          />
        </div>
      </div>
    </main>
  );
}
