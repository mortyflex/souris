"use client";

import { type ChangeEvent, useMemo, useState } from "react";

import type {
  CatalogEntry,
  CatalogPrice,
  ServiceCategory,
} from "@/domain/business/serviceCatalog.types";

import styles from "./service-picker.module.css";

export type ServicePickerSelection = {
  entry: CatalogEntry;
  optionId: string;
  customPrice?: number;
};

type ServicePickerProps = {
  categories: ServiceCategory[];
  entries: CatalogEntry[];
  onSelect: (selection: ServicePickerSelection) => void;
};

type CurrentSelection = {
  entryId: string;
  optionId: string;
  customPrice: string;
};

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-FR")
    .trim();
}

function formatPrice(price: CatalogPrice): string {
  if (price.type === "CUSTOM") {
    return "Prix personnalisé";
  }

  return priceFormatter.format(price.amount);
}

function getOptionLabel(entry: CatalogEntry, optionId: string): string {
  if (entry.type === "SERVICE") {
    const option = entry.options.find((candidate) => candidate.id === optionId);

    if (!option) {
      return "";
    }

    return `${option.durationMinutes} min — ${formatPrice(option.price)}`;
  }

  const option = entry.options.find((candidate) => candidate.id === optionId);

  if (!option) {
    return "";
  }

  const durationParts: string[] = [];

  if (option.activeDurationMinutes > 0) {
    durationParts.push(`${option.activeDurationMinutes} min`);
  }

  if (option.processingDurationMinutes > 0) {
    durationParts.push(`${option.processingDurationMinutes} min de pose`);
  }

  return `${durationParts.join(" + ")} — ${formatPrice(option.price)}`;
}

function getEntrySummary(entry: CatalogEntry): string {
  if (entry.options.length > 1) {
    return `${entry.options.length} options`;
  }

  const option = entry.options[0];

  if (!option) {
    return "";
  }

  return getOptionLabel(entry, option.id);
}

function getCategoryName(
  categories: ServiceCategory[],
  categoryId: string,
): string {
  return categories.find((category) => category.id === categoryId)?.name ?? "";
}

export function ServicePicker({
  categories,
  entries,
  onSelect,
}: ServicePickerProps) {
  const [query, setQuery] = useState("");

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const [currentSelection, setCurrentSelection] =
    useState<CurrentSelection | null>(null);

  const visibleCategories = useMemo(
    () =>
      [...categories]
        .filter((category) => category.active)
        .sort(
          (firstCategory, secondCategory) =>
            firstCategory.order - secondCategory.order,
        ),
    [categories],
  );

  const visibleEntries = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    return [...entries]
      .filter((entry) => {
        if (!entry.active) {
          return false;
        }

        if (selectedCategoryId && entry.categoryId !== selectedCategoryId) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const categoryName = getCategoryName(categories, entry.categoryId);

        const searchableValue = normalizeSearch(
          `${entry.name} ${categoryName}`,
        );

        return searchableValue.includes(normalizedQuery);
      })
      .sort((firstEntry, secondEntry) => firstEntry.order - secondEntry.order);
  }, [categories, entries, query, selectedCategoryId]);

  function selectEntry(entry: CatalogEntry) {
    const firstOption = [...entry.options].sort(
      (firstOption, secondOption) => firstOption.order - secondOption.order,
    )[0];

    if (!firstOption) {
      return;
    }

    setCurrentSelection({
      entryId: entry.id,
      optionId: firstOption.id,
      customPrice: "",
    });
  }

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.currentTarget.value);
    setCurrentSelection(null);
  }

  function handleOptionChange(event: ChangeEvent<HTMLSelectElement>) {
    if (!currentSelection) {
      return;
    }

    setCurrentSelection({
      ...currentSelection,
      optionId: event.currentTarget.value,
      customPrice: "",
    });
  }

  function handleCustomPriceChange(event: ChangeEvent<HTMLInputElement>) {
    if (!currentSelection) {
      return;
    }

    setCurrentSelection({
      ...currentSelection,
      customPrice: event.currentTarget.value,
    });
  }

  function submitSelection(entry: CatalogEntry) {
    if (!currentSelection) {
      return;
    }

    const option = entry.options.find(
      (candidate) => candidate.id === currentSelection.optionId,
    );

    if (!option) {
      return;
    }

    if (option.price.type === "CUSTOM") {
      const customPrice = Number(currentSelection.customPrice);

      if (
        currentSelection.customPrice === "" ||
        !Number.isFinite(customPrice) ||
        customPrice < 0
      ) {
        return;
      }

      onSelect({
        entry,
        optionId: option.id,
        customPrice,
      });

      return;
    }

    onSelect({
      entry,
      optionId: option.id,
    });
  }

  return (
    <div className={styles.picker}>
      <div className={styles.search}>
        <span aria-hidden="true" className={styles.searchIcon}>
          ⌕
        </span>

        <input
          aria-label="Rechercher une prestation"
          onChange={handleQueryChange}
          placeholder="Rechercher une prestation"
          type="search"
          value={query}
        />
      </div>

      <div aria-label="Catégories de prestations" className={styles.categories}>
        <button
          aria-pressed={selectedCategoryId === null}
          className={styles.categoryButton}
          data-selected={selectedCategoryId === null}
          onClick={() => {
            setSelectedCategoryId(null);

            setCurrentSelection(null);
          }}
          type="button"
        >
          Tout
        </button>

        {visibleCategories.map((category) => (
          <button
            aria-pressed={selectedCategoryId === category.id}
            className={styles.categoryButton}
            data-selected={selectedCategoryId === category.id}
            key={category.id}
            onClick={() => {
              setSelectedCategoryId(category.id);

              setCurrentSelection(null);
            }}
            type="button"
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className={styles.resultsHeader}>
        <span>
          {visibleEntries.length}{" "}
          {visibleEntries.length > 1 ? "prestations" : "prestation"}
        </span>
      </div>

      {visibleEntries.length === 0 ? (
        <div className={styles.emptyState}>
          <strong>Aucune prestation</strong>

          <span>Essaie une autre recherche ou une autre catégorie.</span>
        </div>
      ) : (
        <div className={styles.entries}>
          {visibleEntries.map((entry) => {
            const isSelected = currentSelection?.entryId === entry.id;

            const selectedOption = isSelected
              ? entry.options.find(
                  (option) => option.id === currentSelection.optionId,
                )
              : undefined;

            const needsCustomPrice = selectedOption?.price.type === "CUSTOM";

            const validCustomPrice =
              !needsCustomPrice ||
              (currentSelection !== null &&
                currentSelection.customPrice !== "" &&
                Number.isFinite(Number(currentSelection.customPrice)) &&
                Number(currentSelection.customPrice) >= 0);

            return (
              <article
                className={styles.entry}
                data-selected={isSelected}
                key={entry.id}
              >
                <button
                  aria-expanded={isSelected}
                  aria-label={`Sélectionner ${entry.name}`}
                  className={styles.entryTrigger}
                  onClick={() => selectEntry(entry)}
                  type="button"
                >
                  <span className={styles.entryText}>
                    <strong>{entry.name}</strong>

                    <span>{getEntrySummary(entry)}</span>
                  </span>

                  <span aria-hidden="true" className={styles.chevron}>
                    ›
                  </span>
                </button>

                {isSelected && currentSelection ? (
                  <div className={styles.selection}>
                    {entry.options.length > 1 ? (
                      <label className={styles.field}>
                        <span>Durée et tarif</span>

                        <select
                          aria-label={`Option pour ${entry.name}`}
                          onChange={handleOptionChange}
                          value={currentSelection.optionId}
                        >
                          {[...entry.options]
                            .sort(
                              (firstOption, secondOption) =>
                                firstOption.order - secondOption.order,
                            )
                            .map((option) => (
                              <option key={option.id} value={option.id}>
                                {getOptionLabel(entry, option.id)}
                              </option>
                            ))}
                        </select>
                      </label>
                    ) : (
                      <div className={styles.optionSummary}>
                        <span>Durée et tarif</span>

                        <strong>
                          {getOptionLabel(entry, currentSelection.optionId)}
                        </strong>
                      </div>
                    )}

                    {needsCustomPrice ? (
                      <label className={styles.field}>
                        <span>Prix</span>

                        <div className={styles.priceInput}>
                          <input
                            aria-label={`Prix de ${entry.name}`}
                            inputMode="decimal"
                            min="0"
                            onChange={handleCustomPriceChange}
                            placeholder="0"
                            step="0.5"
                            type="number"
                            value={currentSelection.customPrice}
                          />

                          <span>€</span>
                        </div>
                      </label>
                    ) : null}

                    <button
                      className={styles.addButton}
                      disabled={!validCustomPrice}
                      onClick={() => submitSelection(entry)}
                      type="button"
                    >
                      Ajouter la prestation
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
