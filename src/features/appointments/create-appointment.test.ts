import { describe, expect, it } from "vitest";

import type {
  AppointmentItem,
  AppointmentPhase,
} from "@/domain/appointments/appointment.types";

import { createAppointment } from "./create-appointment";

function createSequentialId(): () => string {
  let counter = 0;

  return () => {
    counter += 1;

    return `generated-${counter}`;
  };
}

function createItem({
  id,
  order = 0,
  phases,
}: {
  id: string;
  order?: number;
  phases?: AppointmentPhase[];
}): AppointmentItem {
  return {
    id,
    serviceId: `service-${id}`,
    order,
    serviceName: "Brushing",
    serviceType: "SERVICE",
    price: 40,
    phases: phases ?? [
      {
        id: `phase-${id}`,
        name: "Brushing",
        durationMinutes: 45,
        requiresStaff: true,
      },
    ],
  };
}

describe("createAppointment", () => {
  it("creates a SCHEDULED appointment with normalized item orders", () => {
    const appointment = createAppointment({
      businessId: "business-demo",
      staffMemberId: "staff-demo",
      clientId: "client-lynda",
      startAt: new Date(2026, 7, 22, 14, 0),
      items: [
        createItem({ id: "item-color", order: 4 }),
        createItem({ id: "item-gloss", order: 9 }),
      ],
      createId: createSequentialId(),
    });

    expect(appointment.id).toBe("generated-1");

    expect(appointment.status).toBe("SCHEDULED");

    expect(appointment.businessId).toBe("business-demo");

    expect(appointment.staffMemberId).toBe("staff-demo");

    expect(appointment.clientId).toBe("client-lynda");

    expect(appointment.startAt).toEqual(new Date(2026, 7, 22, 14, 0));

    expect(appointment.items.map((item) => [item.id, item.order])).toEqual([
      ["item-color", 0],
      ["item-gloss", 1],
    ]);
  });

  /*
   * Règle produit : plusieurs rendez-vous simultanés sont autorisés.
   * La création ne connaît plus les autres rendez-vous et ne peut
   * donc jamais refuser un créneau occupé.
   */
  it("never refuses a slot: no failure result exists", () => {
    const appointment = createAppointment({
      businessId: "business-demo",
      staffMemberId: "staff-demo",
      clientId: "client-sofia",
      startAt: new Date(2026, 7, 22, 9, 0),
      items: [createItem({ id: "item-cut" })],
      createId: createSequentialId(),
    });

    expect(appointment.startAt).toEqual(new Date(2026, 7, 22, 9, 0));
  });

  it("clones the provided start date", () => {
    const startAt = new Date(2026, 7, 22, 14, 0);

    const appointment = createAppointment({
      businessId: "business-demo",
      staffMemberId: "staff-demo",
      clientId: "client-lynda",
      startAt,
      items: [createItem({ id: "item-color" })],
      createId: createSequentialId(),
    });

    startAt.setHours(23);

    expect(appointment.startAt).toEqual(new Date(2026, 7, 22, 14, 0));
  });

  it("does not mutate the provided items", () => {
    const items = [createItem({ id: "item-color", order: 7 })];

    createAppointment({
      businessId: "business-demo",
      staffMemberId: "staff-demo",
      clientId: "client-lynda",
      startAt: new Date(2026, 7, 22, 14, 0),
      items,
      createId: createSequentialId(),
    });

    expect(items[0]?.order).toBe(7);
  });
});
