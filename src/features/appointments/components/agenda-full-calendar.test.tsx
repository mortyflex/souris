// @vitest-environment jsdom

import type { ReactNode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Appointment } from "@/domain/appointments/appointment.types";

import type { AgendaDayAppointment } from "./agenda-day-view";

vi.mock("../build-agenda-calendar-events", () => ({
  buildAgendaCalendarEvents: (appointments: AgendaDayAppointment[]) =>
    appointments.map((entry) => ({
      id: `event-${entry.appointment.id}`,
      extendedProps: {
        appointmentId: entry.appointment.id,
        clientName: entry.clientName,
        serviceName: entry.appointment.items[0]?.serviceName ?? "Prestation",
        isResume: false,
        color: entry.color ?? "sand",
      },
    })),
}));

vi.mock("@fullcalendar/react", () => ({
  default: ({
    datesSet,
    eventContent,
    events,
  }: {
    datesSet?: (info: { start: Date; end: Date }) => void;
    eventContent?: (info: {
      event: {
        extendedProps: Record<string, unknown>;
      };
      isShort: boolean;
      view: {
        type: string;
      };
    }) => ReactNode;
    events?: Array<{
      id: string;
      extendedProps: Record<string, unknown>;
    }>;
  }) => (
    <div>
      <output data-testid="calendar-events-count">{events?.length ?? 0}</output>

      <button
        onClick={() =>
          datesSet?.({
            start: new Date(2026, 7, 23, 0, 0, 0, 0),
            end: new Date(2026, 7, 24, 0, 0, 0, 0),
          })
        }
        type="button"
      >
        Voir le 23 août
      </button>

      <button
        onClick={() =>
          datesSet?.({
            start: new Date(2026, 7, 17, 0, 0, 0, 0),
            end: new Date(2026, 7, 24, 0, 0, 0, 0),
          })
        }
        type="button"
      >
        Voir la semaine
      </button>

      {events?.map((event) => (
        <div key={event.id}>
          {eventContent?.({
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
  ),
}));

vi.mock("./appointment-details-panel", () => ({
  AppointmentDetailsPanel: ({
    appointment,
    clientName,
    onAppointmentChange,
    onAppointmentDelete,
    onClose,
  }: {
    appointment: Appointment;
    clientName: string;
    onAppointmentChange: (appointment: Appointment) => void;
    onAppointmentDelete: (appointmentId: string) => void;
    onClose: () => void;
  }) => (
    <aside aria-label={`Test details ${clientName}`}>
      <span>{appointment.status}</span>

      <button
        onClick={() =>
          onAppointmentChange({
            ...appointment,
            status: "CANCELLED",
            cancellation: {
              cancelledAt: new Date(2026, 7, 22, 10, 30),
              cancelledBy: "CLIENT",
            },
            noShow: undefined,
          })
        }
        type="button"
      >
        Test cancel
      </button>

      <button
        onClick={() =>
          onAppointmentChange({
            ...appointment,
            status: "NO_SHOW",
            noShow: {
              recordedAt: new Date(2026, 7, 22, 10, 30),
            },
            cancellation: undefined,
          })
        }
        type="button"
      >
        Test no-show
      </button>

      <button onClick={() => onAppointmentDelete(appointment.id)} type="button">
        Test delete
      </button>

      <button onClick={onClose} type="button">
        Test close
      </button>
    </aside>
  ),
}));

import { AgendaFullCalendar } from "./agenda-full-calendar";

function createAppointment({
  id,
  startAt,
  status = "CONFIRMED",
}: {
  id: string;
  startAt: Date;
  status?: Appointment["status"];
}): Appointment {
  return {
    id,
    businessId: "business-1",
    clientId: `client-${id}`,
    staffMemberId: "staff-1",
    startAt,
    status,
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
  };
}

function createEntry({
  id,
  clientName,
  day = 22,
  hour = 9,
  status = "CONFIRMED",
}: {
  id: string;
  clientName: string;
  day?: number;
  hour?: number;
  status?: Appointment["status"];
}): AgendaDayAppointment {
  return {
    appointment: createAppointment({
      id,
      startAt: new Date(2026, 7, day, hour, 0),
      status,
    }),
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

describe("AgendaFullCalendar", () => {
  it("hides cancelled and no-show appointments from the calendar while keeping them in the summary", () => {
    renderAgenda([
      createEntry({
        id: "active",
        clientName: "Lynda",
      }),
      createEntry({
        id: "cancelled",
        clientName: "Sarah",
        status: "CANCELLED",
      }),
      createEntry({
        id: "no-show",
        clientName: "Nora",
        status: "NO_SHOW",
      }),
    ]);

    expect(screen.getByTestId("calendar-events-count")).toHaveTextContent("1");

    expect(
      screen.getByText("1", {
        selector: '[data-tone="appointments"] strong',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("1", {
        selector: '[data-tone="cancelled"] strong',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("1", {
        selector: '[data-tone="no-show"] strong',
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("annulation")).toBeInTheDocument();

    expect(screen.getByText("no-show")).toBeInTheDocument();
  });

  it("removes an appointment from the calendar after cancellation but keeps its details open", () => {
    renderAgenda([
      createEntry({
        id: "lynda",
        clientName: "Lynda",
      }),
      createEntry({
        id: "sarah",
        clientName: "Sarah",
        hour: 11,
      }),
    ]);

    expect(screen.getByTestId("calendar-events-count")).toHaveTextContent("2");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Lynda, Brushing",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Test cancel",
      }),
    );

    expect(screen.getByTestId("calendar-events-count")).toHaveTextContent("1");

    expect(screen.getByText("annulation")).toBeInTheDocument();

    expect(
      screen.getByRole("complementary", {
        name: "Test details Lynda",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("CANCELLED")).toBeInTheDocument();
  });

  it("removes an appointment from the calendar after a no-show but keeps its details open", () => {
    renderAgenda([
      createEntry({
        id: "lynda",
        clientName: "Lynda",
      }),
      createEntry({
        id: "sarah",
        clientName: "Sarah",
        hour: 11,
      }),
    ]);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Lynda, Brushing",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Test no-show",
      }),
    );

    expect(screen.getByTestId("calendar-events-count")).toHaveTextContent("1");

    expect(screen.getByText("no-show")).toBeInTheDocument();

    expect(
      screen.getByRole("complementary", {
        name: "Test details Lynda",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("NO_SHOW")).toBeInTheDocument();
  });

  it("permanently removes an appointment without creating an cancellation or no-show metric", () => {
    renderAgenda([
      createEntry({
        id: "lynda",
        clientName: "Lynda",
      }),
      createEntry({
        id: "sarah",
        clientName: "Sarah",
        hour: 11,
      }),
    ]);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Lynda, Brushing",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Test delete",
      }),
    );

    expect(screen.getByTestId("calendar-events-count")).toHaveTextContent("1");

    expect(screen.queryByText("annulation")).not.toBeInTheDocument();

    expect(screen.queryByText("no-show")).not.toBeInTheDocument();

    expect(
      screen.queryByRole("complementary", {
        name: "Test details Lynda",
      }),
    ).not.toBeInTheDocument();
  });

  it("updates the summary when the visible day changes", () => {
    renderAgenda([
      createEntry({
        id: "day-22",
        clientName: "Lynda",
        day: 22,
      }),
      createEntry({
        id: "day-23-a",
        clientName: "Sarah",
        day: 23,
      }),
      createEntry({
        id: "day-23-b",
        clientName: "Nora",
        day: 23,
        hour: 13,
      }),
    ]);

    expect(
      screen.getByText("1", {
        selector: '[data-tone="appointments"] strong',
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Voir le 23 août",
      }),
    );

    expect(
      screen.getByText("2", {
        selector: '[data-tone="appointments"] strong',
      }),
    ).toBeInTheDocument();
  });

  it("uses the whole displayed range for the week summary", () => {
    renderAgenda([
      createEntry({
        id: "day-22",
        clientName: "Lynda",
        day: 22,
      }),
      createEntry({
        id: "day-23-a",
        clientName: "Sarah",
        day: 23,
      }),
      createEntry({
        id: "day-23-b",
        clientName: "Nora",
        day: 23,
        hour: 13,
      }),
    ]);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Voir la semaine",
      }),
    );

    expect(
      screen.getByText("3", {
        selector: '[data-tone="appointments"] strong',
      }),
    ).toBeInTheDocument();
  });
});
