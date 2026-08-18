export type CatalogPrice =
  | {
      type: "FIXED";
      amount: number;
    }
  | {
      type: "CUSTOM";
    };

export type ServiceCategory = {
  id: string;
  code: string;
  businessId: string;
  name: string;
  order: number;
  active: boolean;
};

export type ServiceCatalogOption = {
  id: string;
  code: string;
  order: number;
  label?: string;
  durationMinutes: number;
  price: CatalogPrice;
};

export type TechniqueCatalogOption = {
  id: string;
  code: string;
  order: number;
  label?: string;
  activeDurationMinutes: number;
  processingDurationMinutes: number;
  price: CatalogPrice;
};

type CatalogEntryBase = {
  id: string;
  code: string;
  businessId: string;
  categoryId: string;
  name: string;
  order: number;
  active: boolean;
};

export type ServiceCatalogEntry = CatalogEntryBase & {
  type: "SERVICE";
  options: ServiceCatalogOption[];
};

export type TechniqueCatalogEntry = CatalogEntryBase & {
  type: "TECHNIQUE";
  options: TechniqueCatalogOption[];
};

export type CatalogEntry = ServiceCatalogEntry | TechniqueCatalogEntry;
