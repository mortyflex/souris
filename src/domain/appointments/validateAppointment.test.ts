import { describe, expect, it } from "vitest";

import type { Appointment } from "./appointment.types";
import { validateAppointment } from "./validateAppointment";

function createAppointment(): Appointment {
  return {
    id: "appointment-1",
    businessId: "business-1",
    clientId: "client-1",
    staffMemberId: "staff-1",
    startAt: new Date("2026-08-16T09:00:00.000Z"),
    status: "SCHEDULED",
    items: [
      {
        id: "color-item",
        serviceId: "root-color",
        order: 0,
        serviceName: "Root color",
        serviceType: "TECHNIQUE",
        price: 55,
        phases: [
          {
            id: "application",
            name: "Application",
            durationMinutes: 15,
            requiresStaff: true,
          },
          {
            id: "processing",
            name: "Processing",
            durationMinutes: 35,
            requiresStaff: false,
          },
        ],
      },
    ],
  };
}

describe("validateAppointment", () => {
  it("accepts a valid appointment", () => {
    expect(validateAppointment(createAppointment())).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("rejects an appointment without a client", () => {
    const appointment = {
      ...createAppointment(),
      clientId: "   ",
    };

    const result = validateAppointment(appointment);

    expect(result.errors.map((error) => error.code)).toContain(
      "MISSING_CLIENT",
    );
  });

  it("rejects an appointment without a staff member", () => {
    const appointment = {
      ...createAppointment(),
      staffMemberId: "",
    };

    const result = validateAppointment(appointment);

    expect(result.errors.map((error) => error.code)).toContain(
      "MISSING_STAFF_MEMBER",
    );
  });

  it("rejects an appointment without items", () => {
    const appointment = {
      ...createAppointment(),
      items: [],
    };

    const result = validateAppointment(appointment);

    expect(result.errors.map((error) => error.code)).toContain("NO_ITEMS");
  });

  it("rejects duplicate appointment item identifiers", () => {
    const appointment = createAppointment();

    appointment.items = [
      appointment.items[0]!,
      {
        ...appointment.items[0]!,
        order: 1,
      },
    ];

    const result = validateAppointment(appointment);

    expect(result.errors.map((error) => error.code)).toContain(
      "DUPLICATE_ITEM_ID",
    );
  });

  it("rejects duplicate appointment item order values", () => {
    const appointment = createAppointment();

    appointment.items = [
      appointment.items[0]!,
      {
        ...appointment.items[0]!,
        id: "second-item",
      },
    ];

    const result = validateAppointment(appointment);

    expect(result.errors.map((error) => error.code)).toContain(
      "DUPLICATE_ITEM_ORDER",
    );
  });

  it("rejects a negative appointment item price", () => {
    const appointment = createAppointment();

    appointment.items[0] = {
      ...appointment.items[0]!,
      price: -10,
    };

    const result = validateAppointment(appointment);

    expect(result.errors.map((error) => error.code)).toContain(
      "INVALID_ITEM_PRICE",
    );
  });

  it("accepts a zero appointment item price", () => {
    const appointment = createAppointment();

    appointment.items[0] = {
      ...appointment.items[0]!,
      price: 0,
    };

    expect(validateAppointment(appointment).valid).toBe(true);
  });

  it("rejects an appointment item without phases", () => {
    const appointment = createAppointment();

    appointment.items[0] = {
      ...appointment.items[0]!,
      phases: [],
    };

    const result = validateAppointment(appointment);

    expect(result.errors.map((error) => error.code)).toContain(
      "NO_ITEM_PHASES",
    );
  });

  it("rejects duplicate phase identifiers", () => {
    const appointment = createAppointment();

    const firstPhase = appointment.items[0]?.phases[0];

    if (!firstPhase) {
      throw new Error("Expected appointment phase");
    }

    appointment.items[0] = {
      ...appointment.items[0]!,
      phases: [
        firstPhase,
        {
          ...appointment.items[0]!.phases[1]!,
          id: firstPhase.id,
        },
      ],
    };

    const result = validateAppointment(appointment);

    expect(result.errors.map((error) => error.code)).toContain(
      "DUPLICATE_PHASE_ID",
    );
  });

  it("rejects a zero phase duration", () => {
    const appointment = createAppointment();

    appointment.items[0] = {
      ...appointment.items[0]!,
      phases: [
        {
          ...appointment.items[0]!.phases[0]!,
          durationMinutes: 0,
        },
        appointment.items[0]!.phases[1]!,
      ],
    };

    const result = validateAppointment(appointment);

    expect(result.errors.map((error) => error.code)).toContain(
      "INVALID_PHASE_DURATION",
    );
  });

  it("rejects a non-finite phase duration", () => {
    const appointment = createAppointment();

    appointment.items[0] = {
      ...appointment.items[0]!,
      phases: [
        {
          ...appointment.items[0]!.phases[0]!,
          durationMinutes: Number.NaN,
        },
        appointment.items[0]!.phases[1]!,
      ],
    };

    const result = validateAppointment(appointment);

    expect(result.errors.map((error) => error.code)).toContain(
      "INVALID_PHASE_DURATION",
    );
  });

  it("can report several validation errors at once", () => {
    const appointment = createAppointment();

    appointment.clientId = "";
    appointment.staffMemberId = "";
    appointment.items = [];

    const result = validateAppointment(appointment);

    expect(result.valid).toBe(false);

    expect(result.errors.map((error) => error.code)).toEqual(
      expect.arrayContaining([
        "MISSING_CLIENT",
        "MISSING_STAFF_MEMBER",
        "NO_ITEMS",
      ]),
    );
  });
});
