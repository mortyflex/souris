"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

import styles from "./appointment-delete-action.module.css";

type AppointmentDeleteActionProps = {
  clientName: string;
  onDelete: () => void;
};

export function AppointmentDeleteAction({
  clientName,
  onDelete,
}: AppointmentDeleteActionProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const confirmation =
    isConfirming && typeof document !== "undefined"
      ? createPortal(
          <div
            className={styles.modalOverlay}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setIsConfirming(false);
              }
            }}
            onKeyDownCapture={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                setIsConfirming(false);
              }
            }}
            role="presentation"
          >
            <section
              aria-label="Suppression définitive du rendez-vous"
              aria-modal="true"
              className={styles.confirmation}
              role="dialog"
            >
              <div className={styles.heading}>
                <span aria-hidden="true" className={styles.icon}>
                  !
                </span>

                <div>
                  <strong>Supprimer définitivement ?</strong>

                  <p>
                    Le rendez-vous de {clientName} sera supprimé et ne sera pas
                    conservé dans son historique.
                  </p>
                </div>
              </div>

              <p className={styles.warning}>
                Pour une annulation ou une absence de la cliente, utilise plutôt
                les actions dédiées afin de conserver l’information dans son
                historique.
              </p>

              <div className={styles.actions}>
                <button
                  autoFocus
                  className={styles.backButton}
                  onClick={() => setIsConfirming(false)}
                  type="button"
                >
                  Retour
                </button>

                <button
                  className={styles.deleteButton}
                  onClick={onDelete}
                  type="button"
                >
                  Supprimer définitivement
                </button>
              </div>
            </section>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className={styles.triggerZone}>
        <button
          className={styles.triggerButton}
          onClick={() => setIsConfirming(true)}
          type="button"
        >
          Supprimer le rendez-vous
        </button>
      </div>

      {confirmation}
    </>
  );
}
