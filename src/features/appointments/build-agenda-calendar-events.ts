import type {
  Appointment,
  AppointmentItem,
  TimelinePhase,
} from "@/domain/appointments/appointment.types";
import { buildAppointmentTimeline } from "@/domain/appointments/buildAppointmentTimeline";

import type { AgendaServiceColor } from "./agenda-visual.types";
import type { AgendaDayAppointment } from "./components/agenda-day-view";

export type AgendaCalendarEventExtendedProps = {
  appointmentId: string;
  clientName: string;
  serviceName: string;
  color: AgendaServiceColor;
  isResume: boolean;
};

export type AgendaCalendarEvent = {
  id: string;
  groupId: string;
  title: string;
  start: Date;
  end: Date;
  extendedProps: AgendaCalendarEventExtendedProps;
};

function getOrderedItems(appointment: Appointment): AppointmentItem[] {
  return [...appointment.items].sort(
    (firstItem, secondItem) => firstItem.order - secondItem.order,
  );
}

function getServiceNameForPhase(
  appointment: Appointment,
  phase: TimelinePhase,
): string {
  const item = appointment.items.find(
    (appointmentItem) => appointmentItem.id === phase.appointmentItemId,
  );

  return item?.serviceName ?? phase.label;
}

export function buildAgendaCalendarEvents(
  appointments: AgendaDayAppointment[],
): AgendaCalendarEvent[] {
  return appointments.flatMap(({ appointment, clientName, color = "sand" }) => {
    const timeline = buildAppointmentTimeline(appointment);

    const orderedItems = getOrderedItems(appointment);

    return timeline.flatMap((phase, phaseIndex) => {
      if (!phase.requiresStaff) {
        return [];
      }

      const previousPhase = timeline[phaseIndex - 1];

      const itemIndex = orderedItems.findIndex(
        (item) => item.id === phase.appointmentItemId,
      );

      const isResume =
        phaseIndex > 0 &&
        (previousPhase?.requiresStaff === false || itemIndex > 0);

      const serviceName = getServiceNameForPhase(appointment, phase);

      return [
        {
          id: `${appointment.id}:${phase.phaseId}`,
          groupId: appointment.id,
          title: clientName,
          start: phase.startAt,
          end: phase.endAt,
          extendedProps: {
            appointmentId: appointment.id,
            clientName,
            serviceName,
            color,
            isResume,
          },
        },
      ];
    });
  });
}
