import { AgendaFullCalendar } from "@/features/appointments/components/agenda-full-calendar";
import {
  agendaDemoAppointments,
  agendaDemoDayEndAt,
  agendaDemoDayStartAt,
} from "@/features/appointments/demo/agenda-day-demo-data";
import { agendaDemoClients } from "@/features/appointments/demo/agenda-demo-clients";

import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <AgendaFullCalendar
          appointments={agendaDemoAppointments}
          clients={agendaDemoClients}
          currentDate={agendaDemoDayStartAt}
          dayEndAt={agendaDemoDayEndAt}
          dayStartAt={agendaDemoDayStartAt}
        />
      </div>
    </main>
  );
}
