"use client";

import {
  type Announcements,
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
import { reorderAppointmentItemsFromDrop } from "../reorder-appointment-items-from-drop";
import { AppointmentLifecycleActions } from "./appointment-lifecycle-actions";
import pickerStyles from "./appointment-details-service-picker.module.css";
import styles from "./appointment-details-panel.module.css";
import { ServicePicker, type ServicePickerSelection } from "./service-picker";
import { AppointmentDeleteAction } from "./appointment-delete-action";
import { SortableAppointmentService } from "./sortable-appointment-service";

type AppointmentDetailsPanelProps = {
  appointment: Appointment;
  clientName: string;
  color: AgendaServiceColor;
  onAppointmentChange: (appointment: Appointment) => void;
  onAppointmentDelete: (appointmentId: string) => void;
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
  onAppointmentDelete,
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

  const startClosing = useCallback((afterAnimation: () => void) => {
    if (isClosingRef.current) {
      return;
    }

    isClosingRef.current = true;
    setIsClosing(true);

    closeTimerRef.current = window.setTimeout(
      afterAnimation,
      CLOSE_ANIMATION_MS,
    );
  }, []);

  const requestClose = useCallback(() => {
    startClosing(onClose);
  }, [onClose, startClosing]);

  const requestDelete = useCallback(() => {
    startClosing(() => {
      onAppointmentDelete(appointment.id);
    });
  }, [appointment.id, onAppointmentDelete, startClosing]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Petite distance avant activation : un toucher ou un début
        // de scroll sur le handle ne déclenche pas le drag.
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const timeline = buildAppointmentTimeline(appointment);

  const orderedItems = getOrderedItems(appointment);

  function getDraggedServiceName(itemId: unknown): string {
    return (
      orderedItems.find((item) => item.id === itemId)?.serviceName ?? ""
    );
  }

  const dragAnnouncements: Announcements = {
    onDragStart({ active }) {
      return `Prestation ${getDraggedServiceName(active.id)} soulevée.`;
    },
    onDragOver({ active, over }) {
      if (!over || active.id === over.id) {
        return undefined;
      }

      return `${getDraggedServiceName(active.id)} déplacée sur la position de ${getDraggedServiceName(over.id)}.`;
    },
    onDragEnd({ active }) {
      return `Prestation ${getDraggedServiceName(active.id)} déposée.`;
    },
    onDragCancel({ active }) {
      return `Déplacement de ${getDraggedServiceName(active.id)} annulé.`;
    },
  };

  function handleDragEnd(event: DragEndEvent) {
    const reorderedAppointment = reorderAppointmentItemsFromDrop(
      appointment,
      String(event.active.id),
      event.over ? String(event.over.id) : null,
    );

    if (reorderedAppointment === appointment) {
      return;
    }

    onAppointmentChange(reorderedAppointment);
  }

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

            <DndContext
              accessibility={{
                announcements: dragAnnouncements,
                screenReaderInstructions: {
                  draggable:
                    "Pour déplacer une prestation, appuyer sur espace ou entrée pour la soulever, utiliser les flèches du clavier pour la déplacer, puis appuyer de nouveau sur espace ou entrée pour la déposer. Appuyer sur échap pour annuler.",
                },
              }}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              sensors={sensors}
            >
              <SortableContext
                items={orderedItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
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
                      <SortableAppointmentService
                        detailsId={detailsId}
                        isExpanded={isExpanded}
                        item={item}
                        itemStartAt={itemStartAt}
                        key={item.id}
                        onToggle={() => toggleServiceDetails(item.id)}
                      >
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
                                          <span
                                            className={styles.visuallyHidden}
                                          >
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
                      </SortableAppointmentService>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>

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

          <AppointmentLifecycleActions
            appointment={appointment}
            clientName={clientName}
            onAppointmentChange={onAppointmentChange}
          />
          <AppointmentDeleteAction
            clientName={clientName}
            onDelete={requestDelete}
          />
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
