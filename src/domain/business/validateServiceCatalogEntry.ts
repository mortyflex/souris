import type { CatalogEntry, CatalogPrice } from "./serviceCatalog.types";

export type ServiceCatalogValidationError = {
  path: string;
  message: string;
};

function validateRequiredString(
  value: string,
  path: string,
): ServiceCatalogValidationError[] {
  if (value.trim().length > 0) {
    return [];
  }

  return [
    {
      path,
      message: "La valeur est obligatoire.",
    },
  ];
}

function validateOrder(
  value: number,
  path: string,
): ServiceCatalogValidationError[] {
  if (Number.isInteger(value) && value >= 0) {
    return [];
  }

  return [
    {
      path,
      message: "L'ordre doit être un entier positif ou nul.",
    },
  ];
}

function validatePrice(
  price: CatalogPrice,
  path: string,
): ServiceCatalogValidationError[] {
  if (price.type === "CUSTOM") {
    return [];
  }

  if (Number.isFinite(price.amount) && price.amount >= 0) {
    return [];
  }

  return [
    {
      path: `${path}.amount`,
      message: "Le prix doit être un nombre positif ou nul.",
    },
  ];
}

function validateUniqueOptionIds(
  entry: CatalogEntry,
): ServiceCatalogValidationError[] {
  const seenIds = new Set<string>();

  const errors: ServiceCatalogValidationError[] = [];

  entry.options.forEach((option, index) => {
    if (seenIds.has(option.id)) {
      errors.push({
        path: `options.${index}.id`,
        message: "L'identifiant de l'option doit être unique.",
      });

      return;
    }

    seenIds.add(option.id);
  });

  return errors;
}

export function validateServiceCatalogEntry(
  entry: CatalogEntry,
): ServiceCatalogValidationError[] {
  const errors: ServiceCatalogValidationError[] = [
    ...validateRequiredString(entry.id, "id"),
    ...validateRequiredString(entry.businessId, "businessId"),
    ...validateRequiredString(entry.categoryId, "categoryId"),
    ...validateRequiredString(entry.name, "name"),
    ...validateOrder(entry.order, "order"),
  ];

  if (entry.options.length === 0) {
    errors.push({
      path: "options",
      message: "Une prestation doit avoir au moins une option.",
    });

    return errors;
  }

  errors.push(...validateUniqueOptionIds(entry));

  /*
   * On sépare explicitement SERVICE et
   * TECHNIQUE avant de parcourir les options.
   *
   * Cela permet à TypeScript de conserver
   * correctement le lien entre entry.type
   * et le type de entry.options.
   */
  if (entry.type === "SERVICE") {
    entry.options.forEach((option, index) => {
      errors.push(
        ...validateRequiredString(option.id, `options.${index}.id`),
        ...validateOrder(option.order, `options.${index}.order`),
        ...validatePrice(option.price, `options.${index}.price`),
      );

      if (
        !Number.isFinite(option.durationMinutes) ||
        option.durationMinutes <= 0
      ) {
        errors.push({
          path: `options.${index}.durationMinutes`,
          message: "La durée d'un service doit être supérieure à zéro.",
        });
      }
    });

    return errors;
  }

  entry.options.forEach((option, index) => {
    errors.push(
      ...validateRequiredString(option.id, `options.${index}.id`),
      ...validateOrder(option.order, `options.${index}.order`),
      ...validatePrice(option.price, `options.${index}.price`),
    );

    if (
      !Number.isFinite(option.activeDurationMinutes) ||
      option.activeDurationMinutes < 0
    ) {
      errors.push({
        path: `options.${index}.activeDurationMinutes`,
        message: "La durée active d'une technique doit être positive ou nulle.",
      });
    }

    if (
      !Number.isFinite(option.processingDurationMinutes) ||
      option.processingDurationMinutes <= 0
    ) {
      errors.push({
        path: `options.${index}.processingDurationMinutes`,
        message: "Le temps de pose d'une technique doit être supérieur à zéro.",
      });
    }
  });

  return errors;
}
