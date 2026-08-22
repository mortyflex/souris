// @vitest-environment jsdom

import type { ReactNode } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AgendaCalendarEvent } from "../build-agenda-calendar-events";
import type { AgendaDayAppointment } from "./agenda-day-view";
import type { CreateAppointmentClient } from "./create-appointment-panel";

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
  dateClick?: (info: { date: Date }) => void;
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
  events?: AgendaCalendarEvent[];
};

type CapturedCreatePanelProps = {
  businessId: string;
  clients: CreateAppointmentClient[];
  staffMemberId: string;
  startAt: Date;
  onClose: () => void;
  onCreate: (entry: AgendaDayAppointment) => void;
};

const capturedCalendarProps = vi.hoisted(() => ({
  current: null as CapturedCalendarProps | null,
}));

const capturedCreatePanelProps = vi.hoisted(() => ({
  current: null as CapturedCreatePanelProps | null,
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
  AppointmentDetailsPanel: ({ clientName }: { clientName: string }) => (
    <aside aria-label={`Test details ${clientName}`} />
  ),
}));

vi.mock("./create-appointment-panel", () => ({
  CreateAppointmentPanel: (props: CapturedCreatePanelProps) => {
    capturedCreatePanelProps.current = props;

    return (
      <aside aria-label="Test création">
        <div data-testid="create-start">{formatTime(props.startAt)}</div>

        <button
          onClick={() =>
            props.onCreate({
              appointment: {
                id: "appointment-new",
                businessId: props.businessId,
                clientId: "client-zoe",
                staffMemberId: props.staffMemberId,
                startAt: props.startAt,
                status: "SCHEDULED",
                items: [
                  {
                    id: "item-new",
                    serviceId: "svc-brushing",
                    order: 0,
                    serviceName: "Brushing",
                    serviceType: "SERVICE",
                    price: 40,
                    phases: [
                      {
                        id: "phase-new",
                        name: "Brushing",
                        durationMinutes: 45,
                        requiresStaff: true,
                      },
                    ],
                  },
                ],
              },
              clientName: "Zoé",
              color: "mint",
            })
          }
          type="button"
        >
          Test create
        </button>

        <button onClick={props.onClose} type="button">
          Test close create
        </button>
      </aside>
    );
  },
}));

import { AgendaFullCalendar } from "./agenda-full-calendar";

function createEntry({
  id,
  clientName,
  hour,
}: {
  id: string;
  clientName: string;
  hour: number;
}): AgendaDayAppointment {
  return {
    appointment: {
      id,
      businessId: "business-demo",
      clientId: `client-${id}`,
      staffMemberId: "staff-demo",
      startAt: new Date(2026, 7, 22, hour, 0),
      status: "CONFIRMED",
      items: [
        {
          id: `item-${id}`,
          serviceId: "svc-brushing",
          order: 0,
          serviceName: "Brushing",
          serviceType: "SERVICE",
          price: 25,
          phases: [
            {
              id: `phase-${id}`,
              name: "Brushing",
              durationMinutes: 45,
              requiresStaff: true,
            },
          ],
        },
      ],
    },
    clientName,
    color: "rose",
  };
}

const demoClients: CreateAppointmentClient[] = [
  {
    id: "client-zoe",
    fullName: "Zoé Martin",
    color: "mint",
  },
];

function renderAgenda(appointments: AgendaDayAppointment[]) {
  return render(
    <AgendaFullCalendar
      appointments={appointments}
      clients={demoClients}
      currentDate={new Date(2026, 7, 22, 12, 0)}
      dayEndAt={new Date(2026, 7, 22, 19, 0)}
      dayStartAt={new Date(2026, 7, 22, 8, 0)}
    />,
  );
}

function clickFreeSlot(date: Date) {
  const dateClick = capturedCalendarProps.current?.dateClick;

  if (!dateClick) {
    throw new Error("dateClick n'est pas câblé sur FullCalendar");
  }

  act(() => {
    dateClick({
      date,
    });
  });
}

describe("AgendaFullCalendar création", () => {
  it("opens the creation panel on a free slot with the clicked time and current context", () => {
    renderAgenda([
      createEntry({
        id: "appointment-a",
        clientName: "Lynda",
        hour: 9,
      }),
    ]);

    clickFreeSlot(new Date(2026, 7, 22, 14, 0));

    expect(
      screen.getByRole("complementary", {
        name: "Test création",
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("create-start")).toHaveTextContent("14:00");

    expect(capturedCreatePanelProps.current?.businessId).toBe("business-demo");

    expect(capturedCreatePanelProps.current?.staffMemberId).toBe("staff-demo");

    expect(capturedCreatePanelProps.current?.clients).toEqual(demoClients);
  });

  it("adds the created appointment to the calendar and closes the panel", () => {
    renderAgenda([
      createEntry({
        id: "appointment-a",
        clientName: "Lynda",
        hour: 9,
      }),
    ]);

    clickFreeSlot(new Date(2026, 7, 22, 14, 0));

    fireEvent.click(
      screen.getByRole("button", {
        name: "Test create",
      }),
    );

    expect(
      screen.queryByRole("complementary", {
        name: "Test création",
      }),
    ).not.toBeInTheDocument();

    expect(screen.getByTestId("calendar-event-starts")).toHaveTextContent(
      "appointment-new@14:00",
    );

    expect(
      screen.getByText("2", {
        selector: '[data-tone="appointments"] strong',
      }),
    ).toBeInTheDocument();
  });

  it("lets the created appointment open its details drawer", () => {
    renderAgenda([]);

    clickFreeSlot(new Date(2026, 7, 22, 14, 0));

    fireEvent.click(
      screen.getByRole("button", {
        name: "Test create",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Zoé, Brushing",
      }),
    );

    expect(
      screen.getByRole("complementary", {
        name: "Test details Zoé",
      }),
    ).toBeInTheDocument();
  });

  it("lets the created appointment be rescheduled like any other", () => {
    renderAgenda([]);

    clickFreeSlot(new Date(2026, 7, 22, 14, 0));

    fireEvent.click(
      screen.getByRole("button", {
        name: "Test create",
      }),
    );

    const props = capturedCalendarProps.current;

    const event = props?.events?.find(
      (candidate) => candidate.extendedProps.appointmentId === "appointment-new",
    );

    if (!props?.eventDrop || !event) {
      throw new Error("Événement créé introuvable dans FullCalendar");
    }

    const revert = vi.fn();

    act(() => {
      props.eventDrop?.({
        event: {
          start: new Date(2026, 7, 22, 16, 0),
          extendedProps: event.extendedProps,
        },
        oldEvent: {
          start: event.start,
        },
        revert,
      });
    });

    expect(revert).not.toHaveBeenCalled();

    expect(screen.getByTestId("calendar-event-starts")).toHaveTextContent(
      "appointment-new@16:00",
    );
  });

  it("adds nothing when the creation panel is closed without creating", () => {
    renderAgenda([
      createEntry({
        id: "appointment-a",
        clientName: "Lynda",
        hour: 9,
      }),
    ]);

    clickFreeSlot(new Date(2026, 7, 22, 14, 0));

    fireEvent.click(
      screen.getByRole("button", {
        name: "Test close create",
      }),
    );

    expect(
      screen.queryByRole("complementary", {
        name: "Test création",
      }),
    ).not.toBeInTheDocument();

    expect(screen.getByTestId("calendar-event-starts")).not.toHaveTextContent(
      "appointment-new",
    );

    expect(
      screen.getByText("1", {
        selector: '[data-tone="appointments"] strong',
      }),
    ).toBeInTheDocument();
  });
});
