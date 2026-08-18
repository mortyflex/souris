"use client";

import { useEffect, useRef } from "react";

import type {
  Appointment,
  AppointmentItem,
} from "@/domain/appointments/appointment.types";
import { buildAppointmentTimeline } from "@/domain/appointments/buildAppointmentTimeline";

import type { AgendaServiceColor } from "../agenda-visual.types";
import { getAgendaServiceColorClass } from "../get-agenda-service-color-class";
import styles from "./appointment-details-panel.module.css";

type AppointmentDetailsPanelProps = {
  appointment: Appointment;
  clientName: string;
  color: AgendaServiceColor;
  onAppointmentChange: (appointment: Appointment) => void;
  onClose: () => void;
};

type EditableNumberInputProps = {
  ariaLabel: string;
  min: number;
  step: number;
  value: number;
  onValidChange: (value: number) => void;
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

function capitalize(value: string): string {
  return value.charAt(0).toLocaleUpperCase("fr-FR") + value.slice(1);
}

function getOrderedItems(appointment: Appointment): AppointmentItem[] {
  return [...appointment.items].sort(
    (firstItem, secondItem) => firstItem.order - secondItem.order,
  );
}

function EditableNumberInput({
  ariaLabel,
  min,
  step,
  value,
  onValidChange,
}: EditableNumberInputProps) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = event.currentTarget.value;

    /*
     * Pendant l'édition, un champ vide
     * est autorisé.
     *
     * On ne touche simplement pas encore
     * à la valeur métier du rendez-vous.
     */
    if (nextValue === "") {
      return;
    }

    const numericValue = Number(nextValue);

    if (!Number.isFinite(numericValue) || numericValue < min) {
      return;
    }

    onValidChange(numericValue);
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    /*
     * Si l'utilisateur quitte le champ
     * sans saisir de nouvelle valeur,
     * on restaure la dernière valeur
     * métier valide.
     */
    if (event.currentTarget.value === "") {
      event.currentTarget.value = String(value);
    }
  }

  return (
    <input
      aria-label={ariaLabel}
      defaultValue={value}
      inputMode={step < 1 ? "decimal" : "numeric"}
      min={min}
      onBlur={handleBlur}
      onChange={handleChange}
      step={step}
      type="number"
    />
  );
}

export function AppointmentDetailsPanel({
  appointment,
  clientName,
  color,
  onAppointmentChange,
  onClose,
}: AppointmentDetailsPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const timeline = buildAppointmentTimeline(appointment);

  const orderedItems = getOrderedItems(appointment);

  const endAt = timeline.at(-1)?.endAt ?? appointment.startAt;

  const totalDurationMinutes = timeline.reduce(
    (total, phase) => total + phase.durationMinutes,
    0,
  );

  const activeDurationMinutes = timeline
    .filter((phase) => phase.requiresStaff)
    .reduce((total, phase) => total + phase.durationMinutes, 0);

  const processingDurationMinutes = timeline
    .filter((phase) => !phase.requiresStaff)
    .reduce((total, phase) => total + phase.durationMinutes, 0);

  const totalPrice = orderedItems.reduce(
    (total, item) => total + item.price,
    0,
  );

  const colorClassName = getAgendaServiceColorClass(color);

  function updateServicePrice(appointmentItemId: string, price: number) {
    onAppointmentChange({
      ...appointment,
      items: appointment.items.map((item) =>
        item.id === appointmentItemId
          ? {
              ...item,
              price,
            }
          : item,
      ),
    });
  }

  function updateProcessingDuration(
    appointmentItemId: string,
    phaseId: string,
    durationMinutes: number,
  ) {
    onAppointmentChange({
      ...appointment,
      items: appointment.items.map((item) =>
        item.id === appointmentItemId
          ? {
              ...item,
              phases: item.phases.map((phase) =>
                phase.id === phaseId
                  ? {
                      ...phase,
                      durationMinutes: Math.round(durationMinutes),
                    }
                  : phase,
              ),
            }
          : item,
      ),
    });
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <section
        aria-label={`Rendez-vous de ${clientName}`}
        aria-modal="true"
        className={`${styles.panel} ${colorClassName}`}
        role="dialog"
      >
        <header className={styles.header}>
          <div className={styles.heading}>
            <span aria-hidden="true" className={styles.colorMarker} />

            <div>
              <p className={styles.eyebrow}>Rendez-vous</p>

              <h2 className={styles.clientName}>{clientName}</h2>
            </div>
          </div>

          <button
            aria-label="Fermer le rendez-vous"
            className={styles.closeButton}
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className={styles.content}>
          <div className={styles.schedule}>
            <p className={styles.date}>
              {capitalize(dateFormatter.format(appointment.startAt))}
            </p>

            <p className={styles.timeRange}>
              {timeFormatter.format(appointment.startAt)}
              {" – "}
              {timeFormatter.format(endAt)}
            </p>
          </div>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <h3>Prestations</h3>

              <span>{orderedItems.length}</span>
            </div>

            <div className={styles.services}>
              {orderedItems.map((item) => (
                <article className={styles.service} key={item.id}>
                  <div className={styles.serviceHeader}>
                    <strong>{item.serviceName}</strong>

                    <label className={styles.priceEditor}>
                      <span className={styles.visuallyHidden}>
                        Prix de {item.serviceName}
                      </span>

                      <EditableNumberInput
                        ariaLabel={`Prix de ${item.serviceName}`}
                        min={0}
                        onValidChange={(price) =>
                          updateServicePrice(item.id, price)
                        }
                        step={0.5}
                        value={item.price}
                      />

                      <span aria-hidden="true">€</span>
                    </label>
                  </div>

                  <div className={styles.phases}>
                    {item.phases.map((phase) => (
                      <div
                        className={styles.phase}
                        data-processing={phase.requiresStaff ? "false" : "true"}
                        key={phase.id}
                      >
                        <span aria-hidden="true" className={styles.phaseDot} />

                        <div className={styles.phaseText}>
                          <strong>{phase.name}</strong>

                          {phase.requiresStaff ? (
                            <span>
                              {phase.durationMinutes} min · Avec la
                              professionnelle
                            </span>
                          ) : (
                            <div className={styles.processingEditor}>
                              <span>Temps de pose</span>

                              <label>
                                <span className={styles.visuallyHidden}>
                                  Temps de pose de {phase.name}
                                </span>

                                <EditableNumberInput
                                  ariaLabel={`Temps de pose de ${phase.name}`}
                                  min={1}
                                  onValidChange={(durationMinutes) =>
                                    updateProcessingDuration(
                                      item.id,
                                      phase.id,
                                      durationMinutes,
                                    )
                                  }
                                  step={1}
                                  value={phase.durationMinutes}
                                />

                                <span>min</span>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <h3>Temps</h3>
            </div>

            <div className={styles.timeBreakdown}>
              <div>
                <span>Temps actif</span>

                <strong>{activeDurationMinutes} min</strong>
              </div>

              <div>
                <span>Temps de pose</span>

                <strong>{processingDurationMinutes} min</strong>
              </div>
            </div>
          </section>

          {appointment.notes ? (
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <h3>Notes</h3>
              </div>

              <p className={styles.notes}>{appointment.notes}</p>
            </section>
          ) : null}
        </div>

        <footer className={styles.footer}>
          <div>
            <span>Durée totale</span>

            <strong>{totalDurationMinutes} min</strong>
          </div>

          <div>
            <span>Total</span>

            <strong>{priceFormatter.format(totalPrice)}</strong>
          </div>
        </footer>
      </section>
    </div>
  );
}
