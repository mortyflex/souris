import type { Appointment } from "@/domain/appointments/appointment.types";
import { reorderAppointmentItems } from "@/domain/appointments/reorderAppointmentItems";

export function reorderAppointmentItemsFromDrop(
  appointment: Appointment,
  activeItemId: string,
  overItemId: string | null,
): Appointment {
  if (!overItemId || activeItemId === overItemId) {
    return appointment;
  }

  const orderedItems = [...appointment.items].sort(
    (firstItem, secondItem) => firstItem.order - secondItem.order,
  );

  const targetIndex = orderedItems.findIndex((item) => item.id === overItemId);

  if (targetIndex === -1) {
    return appointment;
  }

  return reorderAppointmentItems(appointment, activeItemId, targetIndex);
}
