"use client";

import {
  type ChangeEvent,
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
import { getAppointmentSummary } from "@/domain/appointments/getAppointmentSummary";

import type { AgendaServiceColor } from "../agenda-visual.types";
import { createAppointment } from "../create-appointment";
import { createAppointmentItemFromCatalogSelection } from "../create-appointment-item-from-catalog-selection";
import type { AgendaDayAppointment } from "./agenda-day-view";
import panelStyles from "./appointment-details-panel.module.css";
import pickerStyles from "./appointment-details-service-picker.module.css";
import styles from "./create-appointment-panel.module.css";
import { ServicePicker, type ServicePickerSelection } from "./service-picker";

export type CreateAppointmentClient = {
  id: string;
  fullName: string;
  phone?: string;
  color?: AgendaServiceColor;
};

type CreateAppointmentPanelProps = {
  businessId: string;
  clients: CreateAppointmentClient[];
  staffMemberId: string;
  startAt: Date;
  onClose: () => void;
  onCreate: (entry: AgendaDayAppointment) => void;
  createId?: () => string;
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

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-FR")
    .trim();
}

function getItemDurationMinutes(item: AppointmentItem): number {
  return item.phases.reduce(
    (total, phase) => total + phase.durationMinutes,
    0,
  );
}

export function CreateAppointmentPanel({
  businessId,
  clients,
  staffMemberId,
  startAt,
  onClose,
  onCreate,
  createId = createBrowserId,
}: CreateAppointmentPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeTimerRef = useRef<number | null>(null);

  const isClosingRef = useRef(false);

  const [isClosing, setIsClosing] = useState(false);

  const [clientQuery, setClientQuery] = useState("");

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const [items, setItems] = useState<AppointmentItem[]>([]);

  const [isServicePickerOpen, setIsServicePickerOpen] = useState(false);

  const [catalogError, setCatalogError] = useState<string | null>(null);

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

  const selectedClient = selectedClientId
    ? clients.find((client) => client.id === selectedClientId)
    : undefined;

  const normalizedQuery = normalizeSearch(clientQuery);

  const visibleClients = clients.filter((client) => {
    if (!normalizedQuery) {
      return true;
    }

    return normalizeSearch(
      `${client.fullName} ${client.phone ?? ""}`,
    ).includes(normalizedQuery);
  });

  /*
   * Brouillon uniquement destiné aux fonctions métier de résumé :
   * l'Appointment définitif est construit par createAppointment.
   */
  const draftAppointment: Appointment | null =
    items.length > 0
      ? {
          id: "draft-appointment",
          businessId,
          staffMemberId,
          clientId: selectedClientId ?? "draft-client",
          startAt,
          status: "SCHEDULED",
          items,
        }
      : null;

  const summary = draftAppointment
    ? getAppointmentSummary(draftAppointment)
    : null;

  const endAt = draftAppointment
    ? (buildAppointmentTimeline(draftAppointment).at(-1)?.endAt ?? startAt)
    : null;

  function handleClientQueryChange(event: ChangeEvent<HTMLInputElement>) {
    setClientQuery(event.currentTarget.value);
  }

  function selectClient(clientId: string) {
    setSelectedClientId(clientId);
  }

  function clearSelectedClient() {
    setSelectedClientId(null);

    setClientQuery("");
  }

  function handleServiceSelection(selection: ServicePickerSelection) {
    const result = createAppointmentItemFromCatalogSelection({
      entry: selection.entry,
      optionId: selection.optionId,
      customPrice: selection.customPrice,
      order: items.length,
      createId,
    });

    if (!result.ok) {
      setCatalogError(result.error.message);

      return;
    }

    setCatalogError(null);

    setItems((currentItems) => [...currentItems, result.item]);

    setIsServicePickerOpen(false);
  }

  function removeItem(itemId: string) {
    setItems((currentItems) =>
      currentItems
        .filter((item) => item.id !== itemId)
        .map((item, index) => ({
          ...item,
          order: index,
        })),
    );
  }

  function handleSubmit() {
    if (!selectedClient || items.length === 0) {
      return;
    }

    /*
     * Les chevauchements sont autorisés : plusieurs rendez-vous
     * peuvent volontairement partager le même créneau.
     */
    const appointment = createAppointment({
      businessId,
      staffMemberId,
      clientId: selectedClient.id,
      startAt,
      items,
      createId,
    });

    const entry: AgendaDayAppointment = {
      appointment,
      clientName: selectedClient.fullName,
      color: selectedClient.color ?? "sand",
    };

    startClosing(() => {
      onCreate(entry);
    });
  }

  const canSubmit = selectedClient !== undefined && items.length > 0;

  return (
    <div
      className={`${panelStyles.overlay} ${
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
        aria-label="Nouveau rendez-vous"
        aria-modal="true"
        className={`${panelStyles.panel} ${
          isClosing ? pickerStyles.closingPanel : ""
        }`}
        role="dialog"
      >
        <header className={panelStyles.header}>
          <div className={panelStyles.heading}>
            <div>
              <p className={panelStyles.eyebrow}>Agenda</p>

              <h2 className={panelStyles.clientName}>Nouveau rendez-vous</h2>
            </div>
          </div>

          <button
            aria-label="Fermer la création de rendez-vous"
            className={panelStyles.closeButton}
            onClick={requestClose}
            ref={closeButtonRef}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className={panelStyles.content}>
          <div className={`${panelStyles.schedule} ${pickerStyles.scheduleCard}`}>
            <p className={panelStyles.date}>
              {capitalize(dateFormatter.format(startAt))}
            </p>

            <p className={panelStyles.timeRange}>
              {timeFormatter.format(startAt)}
              {endAt ? ` – ${timeFormatter.format(endAt)}` : ""}
            </p>
          </div>

          <section className={`${panelStyles.section} ${pickerStyles.softSection}`}>
            <div className={panelStyles.sectionHeading}>
              <h3>Cliente</h3>
            </div>

            {selectedClient ? (
              <div className={styles.selectedClient}>
                <div className={styles.selectedClientText}>
                  <strong>{selectedClient.fullName}</strong>

                  {selectedClient.phone ? (
                    <span>{selectedClient.phone}</span>
                  ) : null}
                </div>

                <button
                  className={styles.changeClientButton}
                  onClick={clearSelectedClient}
                  type="button"
                >
                  Changer
                </button>
              </div>
            ) : (
              <div className={styles.clientPicker}>
                <input
                  aria-label="Rechercher une cliente"
                  className={styles.clientSearch}
                  onChange={handleClientQueryChange}
                  placeholder="Rechercher une cliente"
                  type="search"
                  value={clientQuery}
                />

                {visibleClients.length === 0 ? (
                  <p className={styles.emptyClients}>
                    Aucune cliente ne correspond à cette recherche.
                  </p>
                ) : (
                  <ul className={styles.clientList}>
                    {visibleClients.map((client) => (
                      <li key={client.id}>
                        <button
                          className={styles.clientOption}
                          onClick={() => selectClient(client.id)}
                          type="button"
                        >
                          <strong>{client.fullName}</strong>

                          {client.phone ? <span>{client.phone}</span> : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>

          <section className={`${panelStyles.section} ${pickerStyles.softSection}`}>
            <div className={panelStyles.sectionHeading}>
              <h3>Prestations</h3>

              <span>{items.length}</span>
            </div>

            {items.length > 0 ? (
              <ul className={styles.selectedServices}>
                {items.map((item) => (
                  <li className={styles.selectedService} key={item.id}>
                    <div className={styles.selectedServiceText}>
                      <strong>{item.serviceName}</strong>

                      <span>
                        {getItemDurationMinutes(item)} min ·{" "}
                        {priceFormatter.format(item.price)}
                      </span>
                    </div>

                    <button
                      aria-label={`Retirer ${item.serviceName}`}
                      className={styles.removeServiceButton}
                      onClick={() => removeItem(item.id)}
                      type="button"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyServices}>
                Ajoute au moins une prestation pour créer le rendez-vous.
              </p>
            )}

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

          {summary && endAt ? (
            <section
              className={`${panelStyles.section} ${pickerStyles.softSection}`}
            >
              <div className={panelStyles.sectionHeading}>
                <h3>Récapitulatif</h3>
              </div>

              <dl className={styles.summary}>
                <div className={styles.summaryRow}>
                  <dt>Début</dt>

                  <dd>{timeFormatter.format(startAt)}</dd>
                </div>

                <div className={styles.summaryRow}>
                  <dt>Durée totale</dt>

                  <dd>{summary.totalDurationMinutes} min</dd>
                </div>

                <div className={styles.summaryRow}>
                  <dt>Fin prévue</dt>

                  <dd>{timeFormatter.format(endAt)}</dd>
                </div>

                <div className={styles.summaryRow}>
                  <dt>Total</dt>

                  <dd>{priceFormatter.format(summary.totalPrice)}</dd>
                </div>
              </dl>
            </section>
          ) : null}
        </div>

        <footer className={styles.footer}>
          <button
            className={styles.submitButton}
            disabled={!canSubmit}
            onClick={handleSubmit}
            type="button"
          >
            Créer le rendez-vous
          </button>
        </footer>
      </section>
    </div>
  );
}
