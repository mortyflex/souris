// @vitest-environment jsdom

import type { ReactNode } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
  Appointment,
  AppointmentPhase,
} from "@/domain/appointments/appointment.types";

import type { AgendaCalendarEvent } from "../build-agenda-calendar-events";
import type { AgendaDayAppointment } from "./agenda-day-view";

type MockEventDropInfo = {
  event: {
    start: Date | null;
    extendedProps: AgendaCalendarEvent["extendedProps"];
  };
  oldEvent: {
    start: Date | null;
  };
  revert: () => void;
};

type CapturedCalendarProps = {
  eventContent?: (info: {
    event: {
      extendedProps: AgendaCalendarEvent["extendedProps"];
    };
    isShort: boolean;
    view: {
      type: string;
    };
  }) => ReactNode;
  eventDrop?: (info: MockEventDropInfo) => void;
  eventLongPressDelay?: number;
  eventStartEditable?: boolean;
  events?: AgendaCalendarEvent[];
  slotEventOverlap?: boolean;
};

const capturedCalendarProps = vi.hoisted(() => ({
  current: null as CapturedCalendarProps | null,
}));

function formatTime(date: Date): string {
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
}

vi.mock("@fullcalendar/react", () => ({
  default: (props: CapturedCalendarProps) => {
    capturedCalendarProps.current = props;

    return (
      <div>
        <div data-testid="calendar-event-starts">
          {(props.events ?? [])
            .map(
              (event) =>
                `${event.extendedProps.appointmentId}@${formatTime(event.start)}`,
            )
            .join(" ")}
        </div>

        {(props.events ?? []).map((event) => (
          <div key={event.id}>
            {props.eventContent?.({
              event: {
                extendedProps: event.extendedProps,
              },
              isShort: false,
              view: {
                type: "timeGridDay",
              },
            })}
          </div>
        ))}
      </div>
    );
  },
}));

vi.mock("./appointment-details-panel", () => ({
  AppointmentDetailsPanel: ({
    appointment,
    clientName,
  }: {
    appointment: Appointment;
    clientName: string;
  }) => (
    <aside aria-label={`Test details ${clientName}`}>
      <div data-testid="panel-start">
        {formatTime(appointment.startAt)}
      </div>
    </aside>
  ),
}));

import { AgendaFullCalendar } from "./agenda-full-calendar";

function createPhases({
  id,
  durationMinutes = 45,
}: {
  id: string;
  durationMinutes?: number;
}): AppointmentPhase[] {
  return [
    {
      id: `phase-${id}`,
      name: "Brushing",
      durationMinutes,
      requiresStaff: true,
    },
  ];
}

function createEntry({
  id,
  clientName,
  hour,
  minute = 0,
  phases,
}: {
  id: string;
  clientName: string;
  hour: number;
  minute?: number;
  phases?: AppointmentPhase[];
}): AgendaDayAppointment {
  return {
    appointment: {
      id,
      businessId: "business-1",
      clientId: `client-${id}`,
      staffMemberId: "staff-1",
      startAt: new Date(2026, 7, 22, hour, minute),
      status: "CONFIRMED",
      items: [
        {
          id: `item-${id}`,
          serviceId: "svc-brushing",
          order: 0,
          serviceName: "Brushing",
          serviceType: "SERVICE",
          price: 25,
          phases: phases ?? createPhases({ id }),
        },
      ],
    },
    clientName,
    color: "rose",
  };
}

function renderAgenda(appointments: AgendaDayAppointment[]) {
  return render(
    <AgendaFullCalendar
      appointments={appointments}
      currentDate={new Date(2026, 7, 22, 12, 0)}
      dayStartAt={new Date(2026, 7, 22, 8, 0)}
      dayEndAt={new Date(2026, 7, 22, 19, 0)}
    />,
  );
}

function dropFirstPhase({
  appointmentId,
  newStart,
}: {
  appointmentId: string;
  newStart: Date | null;
}): ReturnType<typeof vi.fn> {
  const props = capturedCalendarProps.current;

  const event = props?.events?.find(
    (candidate) => candidate.extendedProps.appointmentId === appointmentId,
  );

  if (!props?.eventDrop || !event) {
    throw new Error(`Aucun événement déplaçable pour ${appointmentId}`);
  }

  const revert = vi.fn();

  act(() => {
    props.eventDrop?.({
      event: {
        start: newStart,
        extendedProps: event.extendedProps,
      },
      oldEvent: {
        start: event.start,
      },
      revert,
    });
  });

  return revert;
}

describe("AgendaFullCalendar reschedule", () => {
  it("moves an appointment to a free slot and reflects the new start time", () => {
    renderAgenda([
      createEntry({
        id: "appointment-a",
        clientName: "Lynda",
        hour: 9,
      }),
    ]);

    const revert = dropFirstPhase({
      appointmentId: "appointment-a",
      newStart: new Date(2026, 7, 22, 11, 0),
    });

    expect(revert).not.toHaveBeenCalled();

    expect(screen.getByTestId("calendar-event-starts")).toHaveTextContent(
      "appointment-a@11:00",
    );
  });

  /*
   * Règle produit : la professionnelle peut mener plusieurs
   * rendez-vous en parallèle. Déposer un rendez-vous sur un créneau
   * occupé est accepté, sans revert ni message d'erreur.
   */
  it("accepts a move onto a slot already occupied by another appointment", () => {
    renderAgenda([
      createEntry({
        id: "appointment-a",
        clientName: "Lynda",
        hour: 9,
      }),
      createEntry({
        id: "appointment-b",
        clientName: "Sarah",
        hour: 10,
      }),
    ]);

    const revert = dropFirstPhase({
      appointmentId: "appointment-a",
      newStart: new Date(2026, 7, 22, 10, 0),
    });

    expect(revert).not.toHaveBeenCalled();

    expect(screen.getByTestId("calendar-event-starts")).toHaveTextContent(
      "appointment-a@10:00",
    );

    expect(screen.getByTestId("calendar-event-starts")).toHaveTextContent(
      "appointment-b@10:00",
    );
  });

  it("never shows a conflict message when appointments overlap", () => {
    renderAgenda([
      createEntry({
        id: "appointment-a",
        clientName: "Lynda",
        hour: 9,
      }),
      createEntry({
        id: "appointment-b",
        clientName: "Sarah",
        hour: 10,
      }),
    ]);

    dropFirstPhase({
      appointmentId: "appointment-a",
      newStart: new Date(2026, 7, 22, 10, 0),
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    expect(
      screen.queryByText(/Impossible de déplacer ce rendez-vous/),
    ).not.toBeInTheDocument();
  });

  it("configures FullCalendar to lay out simultaneous events side by side", () => {
    renderAgenda([
      createEntry({
        id: "appointment-a",
        clientName: "Lynda",
        hour: 9,
      }),
    ]);

    // slotEventOverlap: false → FullCalendar v7 partitionne la
    // largeur entre événements simultanés au lieu de les superposer.
    expect(capturedCalendarProps.current?.slotEventOverlap).toBe(false);
  });

  it("accepts a move into another appointment's processing time", () => {
    renderAgenda([
      createEntry({
        id: "appointment-a",
        clientName: "Lynda",
        hour: 8,
        phases: [
          {
            id: "phase-a",
            name: "Brushing",
            durationMinutes: 30,
            requiresStaff: true,
          },
        ],
      }),
      createEntry({
        id: "appointment-b",
        clientName: "Sarah",
        hour: 10,
        phases: [
          {
            id: "phase-b-application",
            name: "Application",
            durationMinutes: 30,
            requiresStaff: true,
          },
          {
            id: "phase-b-pose",
            name: "Temps de pose",
            durationMinutes: 30,
            requiresStaff: false,
          },
          {
            id: "phase-b-rincage",
            name: "Rinçage",
            durationMinutes: 15,
            requiresStaff: true,
          },
        ],
      }),
    ]);

    const revert = dropFirstPhase({
      appointmentId: "appointment-a",
      newStart: new Date(2026, 7, 22, 10, 30),
    });

    expect(revert).not.toHaveBeenCalled();

    expect(screen.getByTestId("calendar-event-starts")).toHaveTextContent(
      "appointment-a@10:30",
    );
  });

  it("keeps the click on an event opening the details panel with the rescheduled time", () => {
    renderAgenda([
      createEntry({
        id: "appointment-a",
        clientName: "Lynda",
        hour: 9,
      }),
    ]);

    dropFirstPhase({
      appointmentId: "appointment-a",
      newStart: new Date(2026, 7, 22, 11, 0),
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Lynda, Brushing",
      }),
    );

    expect(
      screen.getByRole("complementary", {
        name: "Test details Lynda",
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("panel-start")).toHaveTextContent("11:00");
  });

  it("validates the next moves against already rescheduled appointments", () => {
    renderAgenda([
      createEntry({
        id: "appointment-a",
        clientName: "Lynda",
        hour: 9,
      }),
      createEntry({
        id: "appointment-b",
        clientName: "Sarah",
        hour: 15,
      }),
    ]);

    dropFirstPhase({
      appointmentId: "appointment-a",
      newStart: new Date(2026, 7, 22, 11, 0),
    });

    // Le créneau de 9:00 est libéré par le déplacement effectif de A :
    // la validation doit utiliser l'état courant, pas les données initiales.
    const revertB = dropFirstPhase({
      appointmentId: "appointment-b",
      newStart: new Date(2026, 7, 22, 9, 0),
    });

    expect(revertB).not.toHaveBeenCalled();

    expect(screen.getByTestId("calendar-event-starts")).toHaveTextContent(
      "appointment-b@9:00",
    );

    // Et A se replanifie depuis son horaire effectif (11:00), pas 9:00.
    const revertA = dropFirstPhase({
      appointmentId: "appointment-a",
      newStart: new Date(2026, 7, 22, 14, 0),
    });

    expect(revertA).not.toHaveBeenCalled();

    expect(screen.getByTestId("calendar-event-starts")).toHaveTextContent(
      "appointment-a@14:00",
    );
  });

  it("configures FullCalendar for touch long-press dragging", () => {
    renderAgenda([
      createEntry({
        id: "appointment-a",
        clientName: "Lynda",
        hour: 9,
      }),
    ]);

    expect(capturedCalendarProps.current?.eventLongPressDelay).toBe(500);
  });

  it("keeps events configured as draggable", () => {
    renderAgenda([
      createEntry({
        id: "appointment-a",
        clientName: "Lynda",
        hour: 9,
      }),
    ]);

    expect(capturedCalendarProps.current?.eventStartEditable).toBe(true);
  });

  it("renders a drag affordance on every event card", () => {
    const { container } = renderAgenda([
      createEntry({
        id: "appointment-a",
        clientName: "Lynda",
        hour: 9,
      }),
      createEntry({
        id: "appointment-b",
        clientName: "Sarah",
        hour: 11,
      }),
    ]);

    const affordances = container.querySelectorAll("[data-drag-affordance]");

    expect(affordances).toHaveLength(2);

    affordances.forEach((affordance) => {
      expect(affordance).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("keeps a plain click opening the details panel without any drag", () => {
    renderAgenda([
      createEntry({
        id: "appointment-a",
        clientName: "Lynda",
        hour: 9,
      }),
    ]);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Lynda, Brushing",
      }),
    );

    expect(
      screen.getByRole("complementary", {
        name: "Test details Lynda",
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("panel-start")).toHaveTextContent("9:00");
  });

  it("reverts safely when the dropped event has no valid start", () => {
    renderAgenda([
      createEntry({
        id: "appointment-a",
        clientName: "Lynda",
        hour: 9,
      }),
    ]);

    const revert = dropFirstPhase({
      appointmentId: "appointment-a",
      newStart: null,
    });

    expect(revert).toHaveBeenCalledTimes(1);

    expect(screen.getByTestId("calendar-event-starts")).toHaveTextContent(
      "appointment-a@9:00",
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
