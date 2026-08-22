// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DragEndEvent } from "@dnd-kit/core";

import type { Appointment } from "@/domain/appointments/appointment.types";

import { AppointmentDetailsPanel } from "./appointment-details-panel";

/*
 * dnd-kit est mocké uniquement pour piloter onDragEnd directement :
 * les tests vérifient notre wiring applicatif
 * (drop → reorderAppointmentItemsFromDrop → onAppointmentChange)
 * et non les internals de dnd-kit.
 */
const dndKitMock = vi.hoisted(() => ({
  capturedOnDragEnd: undefined as
    | ((event: DragEndEvent) => void)
    | undefined,
}));

vi.mock("@dnd-kit/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/core")>();

  return {
    ...actual,
    DndContext: ({
      children,
      onDragEnd,
    }: {
      children: ReactNode;
      onDragEnd: (event: DragEndEvent) => void;
    }) => {
      dndKitMock.capturedOnDragEnd = onDragEnd;

      return children;
    },
  };
});

vi.mock("@dnd-kit/sortable", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/sortable")>();

  return {
    ...actual,
    SortableContext: ({ children }: { children: ReactNode }) => children,
    useSortable: () => ({
      attributes: {},
      isDragging: false,
      listeners: {},
      setNodeRef: () => undefined,
      transform: null,
      transition: undefined,
    }),
  };
});

function createAppointment(): Appointment {
  return {
    id: "appointment-lynda",
    businessId: "business-1",
    clientId: "client-lynda",
    staffMemberId: "staff-1",
    startAt: new Date(2026, 7, 17, 9, 15),
    status: "CONFIRMED",
    notes: "Prévoir le gloss habituel.",
    items: [
      {
        id: "item-color",
        serviceId: "service-color",
        order: 0,
        serviceName: "Couleur",
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
            name: "Pose",
            durationMinutes: 20,
            requiresStaff: false,
          },
        ],
      },
      {
        id: "item-gloss",
        serviceId: "service-gloss",
        order: 1,
        serviceName: "Gloss",
        serviceType: "SERVICE",
        price: 25,
        phases: [
          {
            id: "gloss",
            name: "Gloss",
            durationMinutes: 15,
            requiresStaff: true,
          },
        ],
      },
    ],
  };
}

function renderPanel({
  appointment = createAppointment(),
  onAppointmentChange = vi.fn(),
}: {
  appointment?: Appointment;
  onAppointmentChange?: (appointment: Appointment) => void;
} = {}) {
  return render(
    <AppointmentDetailsPanel
      appointment={appointment}
      clientName="Lynda"
      color="rose"
      onAppointmentChange={onAppointmentChange}
      onAppointmentDelete={vi.fn()}
      onClose={vi.fn()}
    />,
  );
}

function simulateDragEnd(activeItemId: string, overItemId: string | null) {
  const onDragEnd = dndKitMock.capturedOnDragEnd;

  expect(onDragEnd).toBeDefined();

  // Seuls active.id et over.id sont lus par notre handler.
  const event = {
    active: { id: activeItemId as string | number },
    over: overItemId === null ? null : { id: overItemId as string | number },
  } as DragEndEvent;

  onDragEnd?.(event);
}

beforeEach(() => {
  dndKitMock.capturedOnDragEnd = undefined;
});

describe("AppointmentDetailsPanel — service drag and drop", () => {
  it("reorders services when a drag ends on another service", () => {
    const onAppointmentChange = vi.fn();

    renderPanel({
      onAppointmentChange,
    });

    simulateDragEnd("item-gloss", "item-color");

    expect(onAppointmentChange).toHaveBeenCalledOnce();

    const updatedAppointment = onAppointmentChange.mock
      .calls[0]?.[0] as Appointment;

    expect(updatedAppointment.items.map((item) => item.serviceName)).toEqual([
      "Gloss",
      "Couleur",
    ]);

    expect(updatedAppointment.items.map((item) => item.order)).toEqual([0, 1]);
  });

  it("does not notify when a service is dropped on itself", () => {
    const onAppointmentChange = vi.fn();

    renderPanel({
      onAppointmentChange,
    });

    simulateDragEnd("item-gloss", "item-gloss");

    expect(onAppointmentChange).not.toHaveBeenCalled();
  });

  it("does not notify when the drag ends without a drop target", () => {
    const onAppointmentChange = vi.fn();

    renderPanel({
      onAppointmentChange,
    });

    simulateDragEnd("item-gloss", null);

    expect(onAppointmentChange).not.toHaveBeenCalled();
  });

  it("keeps the drag handles available while dragging is mocked away", () => {
    renderPanel();

    expect(
      screen.getByRole("button", {
        name: "Déplacer Couleur",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Afficher les détails de Couleur",
      }),
    );

    expect(screen.getByText("Application")).toBeInTheDocument();
  });
});
