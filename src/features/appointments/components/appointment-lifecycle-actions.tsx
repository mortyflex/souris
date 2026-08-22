"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

import type {
  Appointment,
  AppointmentCancellationActor,
} from "@/domain/appointments/appointment.types";
import {
  cancelAppointment,
  markAppointmentNoShow,
} from "@/domain/appointments/appointmentLifecycle";

import styles from "./appointment-lifecycle-actions.module.css";

type AppointmentLifecycleActionsProps = {
  appointment: Appointment;
  clientName: string;
  onAppointmentChange: (appointment: Appointment) => void;
  getNow?: () => Date;
};

type PendingAction = "CANCEL" | "NO_SHOW" | null;

function createNow(): Date {
  return new Date();
}

function getCancellationLabel(
  actor: AppointmentCancellationActor | undefined,
): string {
  if (actor === "CLIENT") {
    return "Annulé par la cliente";
  }

  if (actor === "BUSINESS") {
    return "Annulé par le salon";
  }

  return "Rendez-vous annulé";
}

export function AppointmentLifecycleActions({
  appointment,
  clientName,
  onAppointmentChange,
  getNow = createNow,
}: AppointmentLifecycleActionsProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const [cancellationActor, setCancellationActor] =
    useState<AppointmentCancellationActor>("CLIENT");

  const [cancellationReason, setCancellationReason] = useState("");

  const [error, setError] = useState<string | null>(null);

  function closeModal() {
    setPendingAction(null);
    setCancellationReason("");
    setCancellationActor("CLIENT");
    setError(null);
  }

  function handleCancellation() {
    const result = cancelAppointment(appointment, {
      cancelledAt: getNow(),
      cancelledBy: cancellationActor,
      reason: cancellationReason,
    });

    if (!result.ok) {
      setError(result.error.message);

      return;
    }

    closeModal();

    onAppointmentChange(result.appointment);
  }

  function handleNoShow() {
    const result = markAppointmentNoShow(appointment, {
      recordedAt: getNow(),
    });

    if (!result.ok) {
      setError(result.error.message);

      return;
    }

    closeModal();

    onAppointmentChange(result.appointment);
  }

  const modal =
    pendingAction && typeof document !== "undefined"
      ? createPortal(
          <div
            className={styles.modalOverlay}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeModal();
              }
            }}
            onKeyDownCapture={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                closeModal();
              }
            }}
            role="presentation"
          >
            {pendingAction === "CANCEL" ? (
              <section
                aria-label="Annulation du rendez-vous"
                aria-modal="true"
                className={styles.modal}
                data-tone="cancel"
                role="dialog"
              >
                <div className={styles.modalHeading}>
                  <span aria-hidden="true" className={styles.modalIcon}>
                    ×
                  </span>

                  <div>
                    <strong>Annuler le rendez-vous ?</strong>

                    <p>
                      L’annulation sera conservée dans l’historique de{" "}
                      {clientName}.
                    </p>
                  </div>
                </div>

                <fieldset className={styles.actorFieldset}>
                  <legend>Qui annule ?</legend>

                  <div className={styles.actorChoices}>
                    <button
                      aria-pressed={cancellationActor === "CLIENT"}
                      data-selected={cancellationActor === "CLIENT"}
                      onClick={() => setCancellationActor("CLIENT")}
                      type="button"
                    >
                      La cliente
                    </button>

                    <button
                      aria-pressed={cancellationActor === "BUSINESS"}
                      data-selected={cancellationActor === "BUSINESS"}
                      onClick={() => setCancellationActor("BUSINESS")}
                      type="button"
                    >
                      Le salon
                    </button>
                  </div>
                </fieldset>

                <label className={styles.reasonField}>
                  <span>
                    Motif <em>facultatif</em>
                  </span>

                  <textarea
                    aria-label="Motif d’annulation"
                    onChange={(event) =>
                      setCancellationReason(event.currentTarget.value)
                    }
                    placeholder="Ex. empêchement, problème au salon…"
                    rows={3}
                    value={cancellationReason}
                  />
                </label>

                {error ? (
                  <p className={styles.error} role="alert">
                    {error}
                  </p>
                ) : null}

                <div className={styles.modalActions}>
                  <button
                    autoFocus
                    className={styles.backButton}
                    onClick={closeModal}
                    type="button"
                  >
                    Retour
                  </button>

                  <button
                    className={styles.confirmCancelButton}
                    onClick={handleCancellation}
                    type="button"
                  >
                    Confirmer l’annulation
                  </button>
                </div>
              </section>
            ) : (
              <section
                aria-label="Confirmation du no-show"
                aria-modal="true"
                className={styles.modal}
                data-tone="no-show"
                role="dialog"
              >
                <div className={styles.modalHeading}>
                  <span aria-hidden="true" className={styles.modalIcon}>
                    !
                  </span>

                  <div>
                    <strong>Marquer comme no-show ?</strong>

                    <p>
                      Le rendez-vous restera dans l’historique de {clientName}.
                    </p>
                  </div>
                </div>

                <div className={styles.noShowNotice}>
                  <p>
                    Utilise cette action uniquement si la cliente ne s’est pas
                    présentée au rendez-vous.
                  </p>
                </div>

                {error ? (
                  <p className={styles.error} role="alert">
                    {error}
                  </p>
                ) : null}

                <div className={styles.modalActions}>
                  <button
                    autoFocus
                    className={styles.backButton}
                    onClick={closeModal}
                    type="button"
                  >
                    Retour
                  </button>

                  <button
                    className={styles.confirmNoShowButton}
                    onClick={handleNoShow}
                    type="button"
                  >
                    Confirmer le no-show
                  </button>
                </div>
              </section>
            )}
          </div>,
          document.body,
        )
      : null;

  if (appointment.status === "CANCELLED") {
    return (
      <section className={styles.outcome} data-tone="cancelled">
        <div className={styles.outcomeIcon} aria-hidden="true">
          ×
        </div>

        <div className={styles.outcomeText}>
          <span>Statut du rendez-vous</span>

          <strong>
            {getCancellationLabel(appointment.cancellation?.cancelledBy)}
          </strong>

          {appointment.cancellation?.reason ? (
            <p>{appointment.cancellation.reason}</p>
          ) : null}
        </div>
      </section>
    );
  }

  if (appointment.status === "NO_SHOW") {
    return (
      <section className={styles.outcome} data-tone="no-show">
        <div className={styles.outcomeIcon} aria-hidden="true">
          !
        </div>

        <div className={styles.outcomeText}>
          <span>Statut du rendez-vous</span>

          <strong>No-show</strong>

          <p>{clientName} ne s’est pas présentée au rendez-vous.</p>
        </div>
      </section>
    );
  }

  if (appointment.status === "COMPLETED") {
    return (
      <section className={styles.outcome} data-tone="completed">
        <div className={styles.outcomeIcon} aria-hidden="true">
          ✓
        </div>

        <div className={styles.outcomeText}>
          <span>Statut du rendez-vous</span>

          <strong>Rendez-vous terminé</strong>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className={styles.container}>
        <div className={styles.heading}>
          <div>
            <span>Gestion</span>

            <h3>Rendez-vous</h3>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={() => {
              setError(null);
              setPendingAction("CANCEL");
            }}
            type="button"
          >
            Annuler le rendez-vous
          </button>

          <button
            className={styles.noShowButton}
            onClick={() => {
              setError(null);
              setPendingAction("NO_SHOW");
            }}
            type="button"
          >
            Marquer comme no-show
          </button>
        </div>
      </section>

      {modal}
    </>
  );
}
