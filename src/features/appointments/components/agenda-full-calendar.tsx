"use client";

import { useCallback, useState } from "react";

import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import themePlugin from "@fullcalendar/react/themes/monarch";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/monarch/theme.css";
import "@fullcalendar/react/themes/monarch/palettes/purple.css";

import type { Appointment } from "@/domain/appointments/appointment.types";

import {
  buildAgendaCalendarEvents,
  type AgendaCalendarEventExtendedProps,
} from "../build-agenda-calendar-events";
import { getAgendaServiceColorClass } from "../get-agenda-service-color-class";
import type { AgendaDayAppointment } from "./agenda-day-view";
import { AppointmentDetailsPanel } from "./appointment-details-panel";
import styles from "./agenda-full-calendar.module.css";

type AgendaFullCalendarProps = {
  appointments: AgendaDayAppointment[];
  currentDate: Date;
  dayStartAt: Date;
  dayEndAt: Date;
};

type VisibleRange = {
  start: Date;
  end: Date;
};

const weekdayFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
});

function formatTimeBoundary(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");

  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}:00`;
}

function capitalize(value: string): string {
  return value.charAt(0).toLocaleUpperCase("fr-FR") + value.slice(1);
}

function getMondayBasedDayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function isAlternateDay(date: Date): boolean {
  return getMondayBasedDayIndex(date) % 2 === 1;
}

function isAlternateTimeSlot(date: Date): boolean {
  const minutesFromMidnight = date.getHours() * 60 + date.getMinutes();

  const slotIndex = Math.floor(minutesFromMidnight / 15);

  return slotIndex % 2 === 1;
}

function isFullHour(date: Date): boolean {
  return date.getMinutes() === 0;
}

function getFirstName(clientName: string): string {
  return clientName.trim().split(/\s+/)[0] ?? clientName;
}

function getButtonClassName({
  isIconOnly,
  isSelected,
  name,
}: {
  isIconOnly: boolean;
  isSelected: boolean;
  name: string;
}): string {
  return [
    styles.toolbarButton,
    isIconOnly ? styles.toolbarIconButton : "",
    isSelected ? styles.toolbarButtonSelected : "",
    name === "today" ? styles.todayButton : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function getInitialVisibleRange(date: Date): VisibleRange {
  const start = new Date(date);

  start.setHours(0, 0, 0, 0);

  const end = new Date(start);

  end.setDate(end.getDate() + 1);

  return {
    start,
    end,
  };
}

function isAppointmentInRange(
  appointment: Appointment,
  range: VisibleRange,
): boolean {
  return appointment.startAt >= range.start && appointment.startAt < range.end;
}

export function AgendaFullCalendar({
  appointments,
  currentDate,
  dayStartAt,
  dayEndAt,
}: AgendaFullCalendarProps) {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);

  const [appointmentOverrides, setAppointmentOverrides] = useState<
    Record<string, Appointment>
  >({});

  const [deletedAppointmentIds, setDeletedAppointmentIds] = useState<
    Set<string>
  >(() => new Set());

  const [visibleRange, setVisibleRange] = useState<VisibleRange>(() =>
    getInitialVisibleRange(currentDate),
  );

  const resolvedAppointments = appointments
    .filter((entry) => !deletedAppointmentIds.has(entry.appointment.id))
    .map((entry) => {
      const override = appointmentOverrides[entry.appointment.id];

      if (!override) {
        return entry;
      }

      return {
        ...entry,
        appointment: override,
      };
    });

  const agendaAppointments = resolvedAppointments.filter(
    ({ appointment }) =>
      appointment.status !== "CANCELLED" && appointment.status !== "NO_SHOW",
  );

  const visibleAppointments = resolvedAppointments.filter(({ appointment }) =>
    isAppointmentInRange(appointment, visibleRange),
  );

  const visibleAgendaAppointments = visibleAppointments.filter(
    ({ appointment }) =>
      appointment.status !== "CANCELLED" && appointment.status !== "NO_SHOW",
  );

  const cancelledAppointmentsCount = visibleAppointments.filter(
    ({ appointment }) => appointment.status === "CANCELLED",
  ).length;

  const noShowAppointmentsCount = visibleAppointments.filter(
    ({ appointment }) => appointment.status === "NO_SHOW",
  ).length;

  const events = buildAgendaCalendarEvents(agendaAppointments);

  const selectedAppointment = selectedAppointmentId
    ? resolvedAppointments.find(
        ({ appointment }) => appointment.id === selectedAppointmentId,
      )
    : undefined;

  const openAppointment = useCallback((appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
  }, []);

  const closeAppointment = useCallback(() => {
    setSelectedAppointmentId(null);
  }, []);

  const updateAppointment = useCallback((updatedAppointment: Appointment) => {
    setAppointmentOverrides((currentOverrides) => ({
      ...currentOverrides,
      [updatedAppointment.id]: updatedAppointment,
    }));
  }, []);

  const deleteAppointment = useCallback((appointmentId: string) => {
    setDeletedAppointmentIds((currentIds) => {
      const nextIds = new Set(currentIds);

      nextIds.add(appointmentId);

      return nextIds;
    });

    setAppointmentOverrides((currentOverrides) => {
      if (!currentOverrides[appointmentId]) {
        return currentOverrides;
      }

      const nextOverrides = {
        ...currentOverrides,
      };

      delete nextOverrides[appointmentId];

      return nextOverrides;
    });

    setSelectedAppointmentId((currentId) =>
      currentId === appointmentId ? null : currentId,
    );
  }, []);

  const handleDatesSet = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      setVisibleRange((currentRange) => {
        const currentStart = currentRange.start.getTime();
        const currentEnd = currentRange.end.getTime();

        const nextStart = start.getTime();
        const nextEnd = end.getTime();

        if (currentStart === nextStart && currentEnd === nextEnd) {
          return currentRange;
        }

        return {
          start: new Date(start),
          end: new Date(end),
        };
      });
    },
    [],
  );

  return (
    <>
      <section aria-label="Agenda" className={styles.shell}>
        <header className={styles.appHeader}>
          <div className={styles.appHeading}>
            <p className={styles.appEyebrow}>Souris</p>

            <h1 className={styles.appTitle}>Agenda</h1>

            <div
              aria-label="Résumé de la période affichée"
              className={styles.appSummary}
            >
              <span className={styles.summaryMetric} data-tone="appointments">
                <strong>{visibleAgendaAppointments.length}</strong>

                <span>rdv</span>
              </span>

              {cancelledAppointmentsCount > 0 ? (
                <span className={styles.summaryMetric} data-tone="cancelled">
                  <strong>{cancelledAppointmentsCount}</strong>

                  <span>
                    {cancelledAppointmentsCount > 1
                      ? "annulations"
                      : "annulation"}
                  </span>
                </span>
              ) : null}

              {noShowAppointmentsCount > 0 ? (
                <span className={styles.summaryMetric} data-tone="no-show">
                  <strong>{noShowAppointmentsCount}</strong>

                  <span>no-show</span>
                </span>
              ) : null}
            </div>
          </div>
        </header>

        <div className={styles.calendar}>
          <FullCalendar
            allDaySlot={false}
            borderless
            buttonClass={(info) =>
              getButtonClassName({
                isIconOnly: info.isIconOnly,
                isSelected: info.isSelected,
                name: info.name,
              })
            }
            buttonGroupClass={styles.toolbarButtonGroup}
            buttons={{
              today: {
                text: "Aujourd’hui",
              },
              timeGridDay: {
                text: "Jour",
              },
              timeGridWeek: {
                text: "Semaine",
              },
            }}
            columnEventClass={styles.eventFrame}
            columnEventInnerClass={styles.eventInner}
            datesSet={handleDatesSet}
            dayHeaderClass={(info) =>
              [
                styles.dayHeader,
                isAlternateDay(info.date) ? styles.alternateDayHeader : "",
              ]
                .filter(Boolean)
                .join(" ")
            }
            dayHeaderContent={(info) => {
              const weekday = capitalize(
                weekdayFormatter.format(info.date).replace(".", ""),
              );

              return (
                <div
                  className={styles.dayHeaderContent}
                  data-today={info.isToday ? "true" : "false"}
                >
                  <span className={styles.dayHeaderWeekday}>{weekday}</span>

                  <strong className={styles.dayHeaderNumber}>
                    {info.date.getDate()}
                  </strong>
                </div>
              );
            }}
            dayHeaderInnerClass={styles.dayHeaderInner}
            dayLaneClass={(info) =>
              [
                styles.dayLane,
                isAlternateDay(info.date) ? styles.alternateDayLane : "",
              ]
                .filter(Boolean)
                .join(" ")
            }
            eventContent={(info) => {
              const extendedProps = info.event
                .extendedProps as AgendaCalendarEventExtendedProps;

              const colorClassName = getAgendaServiceColorClass(
                extendedProps.color,
              );

              const activity = extendedProps.isResume
                ? `Reprise · ${extendedProps.serviceName}`
                : extendedProps.serviceName;

              const calendarView =
                info.view.type === "timeGridWeek" ? "week" : "day";

              const firstName = getFirstName(extendedProps.clientName);

              return (
                <div
                  aria-label={`${extendedProps.clientName}, ${activity}`}
                  className={`${styles.eventCard} ${colorClassName}`}
                  data-agenda-appointment-id={extendedProps.appointmentId}
                  data-agenda-resume={extendedProps.isResume ? "true" : "false"}
                  data-calendar-view={calendarView}
                  data-short={info.isShort ? "true" : "false"}
                  onClick={() => openAppointment(extendedProps.appointmentId)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();

                      openAppointment(extendedProps.appointmentId);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <strong className={styles.clientName}>
                    <span className={styles.fullClientName}>
                      {extendedProps.clientName}
                    </span>

                    <span className={styles.shortClientName}>{firstName}</span>
                  </strong>

                  <span className={styles.serviceName}>{activity}</span>
                </div>
              );
            }}
            eventMinHeight={30}
            events={events}
            expandRows={false}
            firstDay={1}
            headerToolbar={{
              start: "prev,next",
              center: "title",
              end: "today timeGridDay,timeGridWeek",
            }}
            headerToolbarClass={styles.headerToolbar}
            height="auto"
            initialDate={currentDate}
            initialView="timeGridDay"
            locale={{
              code: "fr",
            }}
            nowIndicator={false}
            plugins={[themePlugin, timeGridPlugin]}
            scrollTime={formatTimeBoundary(dayStartAt)}
            slotDuration="00:15:00"
            slotEventOverlap={false}
            slotHeaderClass={(info) =>
              [
                styles.slotHeader,
                isAlternateTimeSlot(info.date)
                  ? styles.slotHeaderAlternate
                  : "",
              ]
                .filter(Boolean)
                .join(" ")
            }
            slotHeaderContent={(info) => (
              <span
                className={[
                  styles.slotTime,
                  isFullHour(info.date) ? styles.slotTimeFullHour : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {info.text}
              </span>
            )}
            slotHeaderFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            slotHeaderInterval="00:15:00"
            slotLaneClass={(info) =>
              [
                styles.slotLane,
                isFullHour(info.date) ? styles.slotLaneFullHour : "",
                isAlternateTimeSlot(info.date) ? styles.slotLaneAlternate : "",
              ]
                .filter(Boolean)
                .join(" ")
            }
            slotMaxTime={formatTimeBoundary(dayEndAt)}
            slotMinHeight={44}
            slotMinTime={formatTimeBoundary(dayStartAt)}
            toolbarClass={styles.toolbar}
            toolbarSectionClass={styles.toolbarSection}
            toolbarTitleClass={styles.toolbarTitle}
            viewClass={(info) =>
              info.view.type === "timeGridWeek"
                ? styles.weekView
                : styles.dayView
            }
            views={{
              timeGridDay: {
                dayHeaders: false,
                titleFormat: {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                },
              },
              timeGridWeek: {
                dayHeaders: true,
                titleFormat: {
                  day: "numeric",
                  month: "long",
                },
              },
            }}
          />
        </div>
      </section>

      {selectedAppointment ? (
        <AppointmentDetailsPanel
          appointment={selectedAppointment.appointment}
          clientName={selectedAppointment.clientName}
          color={selectedAppointment.color ?? "sand"}
          onAppointmentChange={updateAppointment}
          onAppointmentDelete={deleteAppointment}
          onClose={closeAppointment}
        />
      ) : null}
    </>
  );
}
