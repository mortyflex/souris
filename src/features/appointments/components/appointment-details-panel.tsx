"use client";

import {
  type ChangeEvent,
  type FocusEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { serviceCatalog, serviceCategories } from "@/config/service-catalog";
import type {
  Appointment,
  AppointmentItem,
} from "@/domain/appointments/appointment.types";
import { buildAppointmentTimeline } from "@/domain/appointments/buildAppointmentTimeline";

import type { AgendaServiceColor } from "../agenda-visual.types";
import { createAppointmentItemFromCatalogSelection } from "../create-appointment-item-from-catalog-selection";
import { getAgendaServiceColorClass } from "../get-agenda-service-color-class";
import pickerStyles from "./appointment-details-service-picker.module.css";
import styles from "./appointment-details-panel.module.css";
import { ServicePicker, type ServicePickerSelection } from "./service-picker";

type AppointmentDetailsPanelProps = {
  appointment: Appointment;
  clientName: string;
  color: AgendaServiceColor;
  onAppointmentChange: (appointment: Appointment) => void;
  onClose: () => void;
  createId?: () => string;
};

type EditableNumberInputProps = {
  ariaLabel: string;
  min: number;
  step: number;
  value: number;
  onValidChange: (value: number) => void;
};

const CLOSE_ANIMATION_MS = 220;

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

function createBrowserId(): string {
  return globalThis.crypto.randomUUID();
}

function getOrderedItems(appointment: Appointment): AppointmentItem[] {
  return [...appointment.items].sort(
    (firstItem, secondItem) => firstItem.order - secondItem.order,
  );
}

function getNextItemOrder(items: AppointmentItem[]): number {
  return (
    items.reduce(
      (highestOrder, item) => Math.max(highestOrder, item.order),
      -1,
    ) + 1
  );
}

function formatServiceTime(date: Date): string {
  const hours = date.getHours();

  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}h${minutes}`;
}

function getItemStartAt(
  timeline: ReturnType<typeof buildAppointmentTimeline>,
  appointmentItemId: string,
  fallback: Date,
): Date {
  return (
    timeline.find((phase) => phase.appointmentItemId === appointmentItemId)
      ?.startAt ?? fallback
  );
}

function ChevronIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function EditableNumberInput({
  ariaLabel,
  min,
  step,
  value,
  onValidChange,
}: EditableNumberInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.currentTarget.value;

    if (nextValue === "") {
      return;
    }

    const numericValue = Number(nextValue);

    if (!Number.isFinite(numericValue) || numericValue < min) {
      return;
    }

    onValidChange(numericValue);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
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
  createId = createBrowserId,
}: AppointmentDetailsPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeTimerRef = useRef<number | null>(null);

  const isClosingRef = useRef(false);

  const [isClosing, setIsClosing] = useState(false);

  const [isServicePickerOpen, setIsServicePickerOpen] = useState(false);

  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(
    () => new Set(),
  );

  const requestClose = useCallback(() => {
    if (isClosingRef.current) {
      return;
    }

    isClosingRef.current = true;
    setIsClosing(true);

    closeTimerRef.current = window.setTimeout(onClose, CLOSE_ANIMATION_MS);
  }, [onClose]);

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

  function toggleServiceDetails(appointmentItemId: string) {
    setExpandedItemIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(appointmentItemId)) {
        nextIds.delete(appointmentItemId);
      } else {
        nextIds.add(appointmentItemId);
      }

      return nextIds;
    });
  }

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

  function removeService(appointmentItemId: string) {
    if (appointment.items.length <= 1) {
      return;
    }

    const nextItems = orderedItems
      .filter((item) => item.id !== appointmentItemId)
      .map((item, index) => ({
        ...item,
        order: index,
      }));

    setExpandedItemIds((currentIds) => {
      const nextIds = new Set(currentIds);

      nextIds.delete(appointmentItemId);

      return nextIds;
    });

    onAppointmentChange({
      ...appointment,
      items: nextItems,
    });
  }

  function handleServiceSelection(selection: ServicePickerSelection) {
    const result = createAppointmentItemFromCatalogSelection({
      entry: selection.entry,
      optionId: selection.optionId,
      customPrice: selection.customPrice,
      order: getNextItemOrder(appointment.items),
      createId,
    });

    if (!result.ok) {
      setCatalogError(result.error.message);

      return;
    }

    setCatalogError(null);

    onAppointmentChange({
      ...appointment,
      items: [...appointment.items, result.item],
    });

    setIsServicePickerOpen(false);
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        requestClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [requestClose]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

  return (
    <div
      className={`${styles.overlay} ${
        isClosing ? pickerStyles.closingOverlay : ""
      }`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          requestClose();
        }
      }}
      role="presentation"
    >
      <section
        aria-label={`Rendez-vous de ${clientName}`}
        aria-modal="true"
        className={`${styles.panel} ${colorClassName} ${
          isClosing ? pickerStyles.closingPanel : ""
        }`}
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
            onClick={requestClose}
            ref={closeButtonRef}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className={styles.content}>
          <div className={`${styles.schedule} ${pickerStyles.scheduleCard}`}>
            <p className={styles.date}>
              {capitalize(dateFormatter.format(appointment.startAt))}
            </p>

            <p className={styles.timeRange}>
              {timeFormatter.format(appointment.startAt)}
              {" – "}
              {timeFormatter.format(endAt)}
            </p>
          </div>

          <section className={`${styles.section} ${pickerStyles.softSection}`}>
            <div className={styles.sectionHeading}>
              <h3>Prestations</h3>

              <span>{orderedItems.length}</span>
            </div>

            <div className={styles.services}>
              {orderedItems.map((item) => {
                const isExpanded = expandedItemIds.has(item.id);

                const itemStartAt = getItemStartAt(
                  timeline,
                  item.id,
                  appointment.startAt,
                );

                const detailsId = `appointment-service-details-${item.id}`;

                return (
                  <article
                    className={`${styles.service} ${pickerStyles.serviceCard}`}
                    data-expanded={isExpanded ? "true" : "false"}
                    key={item.id}
                  >
                    <div className={pickerStyles.serviceSummary}>
                      <button
                        aria-controls={detailsId}
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? "Masquer" : "Afficher"} les détails de ${item.serviceName}`}
                        className={pickerStyles.serviceToggle}
                        onClick={() => toggleServiceDetails(item.id)}
                        type="button"
                      >
                        <time
                          className={pickerStyles.serviceTime}
                          dateTime={itemStartAt.toISOString()}
                        >
                          {formatServiceTime(itemStartAt)}
                        </time>

                        <span className={pickerStyles.serviceName}>
                          {item.serviceName}
                        </span>

                        <span
                          aria-hidden="true"
                          className={pickerStyles.unfoldIndicator}
                        >
                          <ChevronIcon />
                        </span>
                      </button>
                    </div>

                    {isExpanded ? (
                      <div
                        className={pickerStyles.serviceDetails}
                        id={detailsId}
                      >
                        <div
                          className={`${styles.phases} ${pickerStyles.servicePhases}`}
                        >
                          {item.phases.map((phase) => (
                            <div
                              className={styles.phase}
                              data-processing={
                                phase.requiresStaff ? "false" : "true"
                              }
                              key={phase.id}
                            >
                              <span
                                aria-hidden="true"
                                className={styles.phaseDot}
                              />

                              <div className={styles.phaseText}>
                                <strong>{phase.name}</strong>

                                {phase.requiresStaff ? (
                                  <span>{phase.durationMinutes} min</span>
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

                        <div className={pickerStyles.servicePriceFooter}>
                          <div className={pickerStyles.servicePriceLabel}>
                            <span>Tarif</span>

                            <strong>{item.serviceName}</strong>
                          </div>

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

                        <div className={pickerStyles.deleteServiceZone}>
                          <button
                            className={pickerStyles.deleteServiceButton}
                            disabled={orderedItems.length <= 1}
                            onClick={() => removeService(item.id)}
                            title={
                              orderedItems.length <= 1
                                ? "Un rendez-vous doit conserver au moins une prestation."
                                : undefined
                            }
                            type="button"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>

            {!isServicePickerOpen ? (
              <button
                aria-expanded="false"
                className={pickerStyles.addServiceButton}
                onClick={() => {
                  setCatalogError(null);

                  setIsServicePickerOpen(true);
                }}
                type="button"
              >
                <span aria-hidden="true" className={pickerStyles.plus}>
                  +
                </span>
                Ajouter une prestation
              </button>
            ) : (
              <div className={pickerStyles.pickerContainer}>
                <div className={pickerStyles.pickerHeader}>
                  <div className={pickerStyles.pickerHeading}>
                    <p className={pickerStyles.pickerEyebrow}>Catalogue</p>

                    <h4 className={pickerStyles.pickerTitle}>
                      Ajouter une prestation
                    </h4>
                  </div>

                  <button
                    aria-label="Fermer le sélecteur de prestations"
                    className={pickerStyles.closePickerButton}
                    onClick={() => {
                      setCatalogError(null);

                      setIsServicePickerOpen(false);
                    }}
                    type="button"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>

                {catalogError ? (
                  <p className={pickerStyles.error} role="alert">
                    {catalogError}
                  </p>
                ) : null}

                <ServicePicker
                  categories={serviceCategories}
                  entries={serviceCatalog}
                  onSelect={handleServiceSelection}
                />
              </div>
            )}
          </section>

          <section className={`${styles.section} ${pickerStyles.softSection}`}>
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
            <section
              className={`${styles.section} ${pickerStyles.softSection}`}
            >
              <div className={styles.sectionHeading}>
                <h3>Notes</h3>
              </div>

              <p className={styles.notes}>{appointment.notes}</p>
            </section>
          ) : null}
        </div>

        <footer className={`${styles.footer} ${pickerStyles.footerPastel}`}>
          <div className={pickerStyles.footerMetric}>
            <span>Durée totale</span>

            <strong>{totalDurationMinutes} min</strong>
          </div>

          <div className={pickerStyles.footerMetric}>
            <span>Total</span>

            <strong>{priceFormatter.format(totalPrice)}</strong>
          </div>
        </footer>
      </section>
    </div>
  );
}
