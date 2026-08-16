import type { Appointment, AppointmentItem } from "./appointment.types";

function normalizeItemOrder(items: AppointmentItem[]): AppointmentItem[] {
  return items.map((item, index) => ({
    ...item,
    order: index,
  }));
}

export function removeAppointmentItem(
  appointment: Appointment,
  itemId: string,
): Appointment {
  const itemExists = appointment.items.some((item) => item.id === itemId);

  if (!itemExists) {
    return appointment;
  }

  const remainingItems = appointment.items
    .filter((item) => item.id !== itemId)
    .sort((a, b) => a.order - b.order);

  return {
    ...appointment,
    items: normalizeItemOrder(remainingItems),
  };
}
