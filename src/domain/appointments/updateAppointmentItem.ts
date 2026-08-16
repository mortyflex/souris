import type { Appointment, AppointmentPhase } from "./appointment.types";

type AppointmentPhaseOverride = {
  phaseId: string;
  durationMinutes?: number;
  name?: string;
  requiresStaff?: boolean;
};

type UpdateAppointmentItemParams = {
  appointment: Appointment;
  itemId: string;
  serviceName?: string;
  price?: number;
  phaseOverrides?: AppointmentPhaseOverride[];
};

function applyPhaseOverrides(
  phases: AppointmentPhase[],
  overrides: AppointmentPhaseOverride[],
): AppointmentPhase[] {
  return phases.map((phase) => {
    const override = overrides.find(
      (candidate) => candidate.phaseId === phase.id,
    );

    if (!override) {
      return phase;
    }

    return {
      ...phase,
      ...(override.name !== undefined ? { name: override.name } : {}),
      ...(override.durationMinutes !== undefined
        ? { durationMinutes: override.durationMinutes }
        : {}),
      ...(override.requiresStaff !== undefined
        ? { requiresStaff: override.requiresStaff }
        : {}),
    };
  });
}

export function updateAppointmentItem({
  appointment,
  itemId,
  serviceName,
  price,
  phaseOverrides = [],
}: UpdateAppointmentItemParams): Appointment {
  const itemExists = appointment.items.some((item) => item.id === itemId);

  if (!itemExists) {
    return appointment;
  }

  return {
    ...appointment,
    items: appointment.items.map((item) => {
      if (item.id !== itemId) {
        return item;
      }

      return {
        ...item,
        ...(serviceName !== undefined ? { serviceName } : {}),
        ...(price !== undefined ? { price } : {}),
        phases: applyPhaseOverrides(item.phases, phaseOverrides),
      };
    }),
  };
}
