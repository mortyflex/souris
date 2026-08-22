"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

import type { AppointmentItem } from "@/domain/appointments/appointment.types";

import panelStyles from "./appointment-details-panel.module.css";
import pickerStyles from "./appointment-details-service-picker.module.css";
import styles from "./sortable-appointment-service.module.css";

type SortableAppointmentServiceProps = {
  detailsId: string;
  isExpanded: boolean;
  item: AppointmentItem;
  itemStartAt: Date;
  onToggle: () => void;
  children?: ReactNode;
};

function formatServiceTime(date: Date): string {
  const hours = date.getHours();

  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}h${minutes}`;
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

function GripIcon() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 16 16">
      <circle cx="5.5" cy="3.5" r="1.4" />
      <circle cx="10.5" cy="3.5" r="1.4" />
      <circle cx="5.5" cy="8" r="1.4" />
      <circle cx="10.5" cy="8" r="1.4" />
      <circle cx="5.5" cy="12.5" r="1.4" />
      <circle cx="10.5" cy="12.5" r="1.4" />
    </svg>
  );
}

export function SortableAppointmentService({
  detailsId,
  isExpanded,
  item,
  itemStartAt,
  onToggle,
  children,
}: SortableAppointmentServiceProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  return (
    <article
      className={`${panelStyles.service} ${pickerStyles.serviceCard} ${styles.sortableService}`}
      data-dragging={isDragging ? "true" : "false"}
      data-expanded={isExpanded ? "true" : "false"}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className={pickerStyles.serviceSummary}>
        <button
          aria-controls={detailsId}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? "Masquer" : "Afficher"} les détails de ${item.serviceName}`}
          className={pickerStyles.serviceToggle}
          onClick={onToggle}
          type="button"
        >
          <time
            className={pickerStyles.serviceTime}
            dateTime={itemStartAt.toISOString()}
          >
            {formatServiceTime(itemStartAt)}
          </time>

          <span className={pickerStyles.serviceName}>{item.serviceName}</span>

          <span aria-hidden="true" className={pickerStyles.unfoldIndicator}>
            <ChevronIcon />
          </span>
        </button>

        <button
          aria-label={`Déplacer ${item.serviceName}`}
          className={styles.dragHandle}
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripIcon />
        </button>
      </div>

      {children}
    </article>
  );
}
