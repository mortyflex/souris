import type { Appointment, AppointmentItem } from "./appointment.types";

function normalizeItemOrder(items: AppointmentItem[]): AppointmentItem[] {
  return items.map((item, index) => ({
    ...item,
    order: index,
  }));
}

export function reorderAppointmentItems(
  appointment: Appointment,
  itemId: string,
  targetIndex: number,
): Appointment {
  const orderedItems = [...appointment.items].sort((a, b) => a.order - b.order);

  const currentIndex = orderedItems.findIndex((item) => item.id === itemId);

  if (currentIndex === -1) {
    return appointment;
  }

  if (
    targetIndex < 0 ||
    targetIndex >= orderedItems.length ||
    targetIndex === currentIndex
  ) {
    return appointment;
  }

  const reorderedItems = [...orderedItems];
  const [movedItem] = reorderedItems.splice(currentIndex, 1);

  if (!movedItem) {
    return appointment;
  }

  reorderedItems.splice(targetIndex, 0, movedItem);

  return {
    ...appointment,
    items: normalizeItemOrder(reorderedItems),
  };
}
