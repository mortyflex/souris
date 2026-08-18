import type {
  AppointmentItem,
  AppointmentPhase,
} from "@/domain/appointments/appointment.types";
import type {
  CatalogEntry,
  CatalogPrice,
} from "@/domain/business/serviceCatalog.types";
import { validateServiceCatalogEntry } from "@/domain/business/validateServiceCatalogEntry";

export type CatalogSelectionErrorCode =
  | "INACTIVE_SERVICE"
  | "OPTION_NOT_FOUND"
  | "CUSTOM_PRICE_REQUIRED"
  | "INVALID_CUSTOM_PRICE"
  | "INVALID_CATALOG_ENTRY";

export type CatalogSelectionError = {
  code: CatalogSelectionErrorCode;
  message: string;
};

export type CatalogSelectionResult =
  | {
      ok: true;
      item: AppointmentItem;
    }
  | {
      ok: false;
      error: CatalogSelectionError;
    };

export type CreateAppointmentItemFromCatalogSelectionInput = {
  entry: CatalogEntry;
  optionId: string;
  order: number;
  customPrice?: number;
  createId: () => string;
};

function optionNotFound(): CatalogSelectionResult {
  return {
    ok: false,
    error: {
      code: "OPTION_NOT_FOUND",
      message: "L'option sélectionnée n'existe pas.",
    },
  };
}

function resolvePrice(
  price: CatalogPrice,
  customPrice?: number,
):
  | {
      ok: true;
      price: number;
    }
  | {
      ok: false;
      error: CatalogSelectionError;
    } {
  if (price.type === "FIXED") {
    return {
      ok: true,
      price: price.amount,
    };
  }

  if (customPrice === undefined) {
    return {
      ok: false,
      error: {
        code: "CUSTOM_PRICE_REQUIRED",
        message: "Un prix doit être renseigné pour cette prestation.",
      },
    };
  }

  if (!Number.isFinite(customPrice) || customPrice < 0) {
    return {
      ok: false,
      error: {
        code: "INVALID_CUSTOM_PRICE",
        message: "Le prix personnalisé doit être positif ou nul.",
      },
    };
  }

  return {
    ok: true,
    price: customPrice,
  };
}

export function createAppointmentItemFromCatalogSelection({
  entry,
  optionId,
  order,
  customPrice,
  createId,
}: CreateAppointmentItemFromCatalogSelectionInput): CatalogSelectionResult {
  if (!entry.active) {
    return {
      ok: false,
      error: {
        code: "INACTIVE_SERVICE",
        message: "Cette prestation n'est plus active.",
      },
    };
  }

  const validationErrors = validateServiceCatalogEntry(entry);

  if (validationErrors.length > 0) {
    return {
      ok: false,
      error: {
        code: "INVALID_CATALOG_ENTRY",
        message: "La prestation du catalogue est invalide.",
      },
    };
  }

  /*
   * On sépare SERVICE et TECHNIQUE
   * avant de rechercher l'option.
   *
   * TypeScript peut ainsi préserver
   * correctement le type de chaque option.
   */
  if (entry.type === "SERVICE") {
    const option = entry.options.find((candidate) => candidate.id === optionId);

    if (!option) {
      return optionNotFound();
    }

    const priceResult = resolvePrice(option.price, customPrice);

    if (!priceResult.ok) {
      return priceResult;
    }

    const itemId = createId();

    const phases: AppointmentPhase[] = [
      {
        id: createId(),
        name: entry.name,
        durationMinutes: option.durationMinutes,
        requiresStaff: true,
      },
    ];

    return {
      ok: true,
      item: {
        id: itemId,
        serviceId: entry.id,
        serviceOptionId: option.id,
        order,
        serviceName: entry.name,
        serviceType: entry.type,
        price: priceResult.price,
        phases,
      },
    };
  }

  const option = entry.options.find((candidate) => candidate.id === optionId);

  if (!option) {
    return optionNotFound();
  }

  const priceResult = resolvePrice(option.price, customPrice);

  if (!priceResult.ok) {
    return priceResult;
  }

  const itemId = createId();

  const phases: AppointmentPhase[] = [];

  if (option.activeDurationMinutes > 0) {
    phases.push({
      id: createId(),
      name: option.processingDurationMinutes > 0 ? "Application" : entry.name,
      durationMinutes: option.activeDurationMinutes,
      requiresStaff: true,
    });
  }

  if (option.processingDurationMinutes > 0) {
    phases.push({
      id: createId(),
      name: "Pose",
      durationMinutes: option.processingDurationMinutes,
      requiresStaff: false,
    });
  }

  return {
    ok: true,
    item: {
      id: itemId,
      serviceId: entry.id,
      serviceOptionId: option.id,
      order,
      serviceName: entry.name,
      serviceType: entry.type,
      price: priceResult.price,
      phases,
    },
  };
}
