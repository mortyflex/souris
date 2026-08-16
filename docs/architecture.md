# Souris — Architecture

## 1. Purpose

This document defines the source-code architecture of **Souris**.

It is the canonical reference for:

- project organization;
- architectural boundaries;
- dependency direction;
- domain placement;
- feature placement;
- shared UI placement;
- framework-specific code;
- data-access boundaries;
- testing colocation;
- naming conventions;
- future architectural evolution.

Do not introduce a new top-level architectural pattern without updating this document.

Souris follows one guiding principle:

> **Generic in the data model, specific in the user experience.**

---

## 2. Product Context

Souris is a mobile-first appointment and business-management application for beauty professionals.

The first production use case is a hair salon operated by a single professional.

The architecture must nevertheless remain capable of supporting other beauty professions later, including:

- estheticians;
- nail technicians;
- lash and brow professionals;
- massage and wellness professionals;
- other appointment-based beauty businesses.

The first version must remain optimized for the actual salon workflow.

Multi-profession support must come from generic foundations, not from implementing every possible profession upfront.

Do not over-engineer features that are not currently required.

---

## 3. Architectural Goals

The architecture must remain:

- simple enough for one developer to understand;
- easy for coding agents to navigate;
- highly testable;
- modular without becoming enterprise-heavy;
- independent from React for core business logic;
- independent from Supabase for core business logic;
- resistant to generic utility-folder sprawl;
- adaptable to tablet and desktop;
- adaptable to future multi-staff usage;
- adaptable to other beauty professions.

Prefer direct, well-named implementations over unnecessary abstractions.

Do not introduce interfaces, repositories, factories, providers, adapters, or additional layers unless they solve a demonstrated problem.

---

## 4. Architectural Style

Souris uses a **feature-first architecture with an explicit framework-independent domain layer**.

The main source structure is:

```text
src/
├── app/
├── domain/
├── features/
├── shared/
├── providers/
├── config/
└── styles/
```

The primary dependency direction is:

```text
app
 ↓
features
 ↓
domain
```

`shared` may be consumed by `app` and `features`.

The domain never depends on presentation, persistence, or framework code.

---

## 5. Target Source Structure

The intended structure is:

```text
src/
├── app/
│
├── domain/
│   ├── appointments/
│   ├── business/
│   ├── clients/
│   ├── products/
│   └── sales/
│
├── features/
│   ├── appointments/
│   ├── auth/
│   ├── clients/
│   ├── products/
│   └── sales/
│
├── shared/
│   ├── icons/
│   ├── lib/
│   └── ui/
│
├── providers/
│
├── config/
│
└── styles/
```

This is a **target architecture**, not an instruction to create every folder immediately.

Create directories only when the current development phase requires them.

Do not create speculative empty subtrees.

---

# 6. `src/app`

## Responsibility

`src/app` owns the Next.js application shell and routing.

It may contain:

- `page.tsx`;
- `layout.tsx`;
- `loading.tsx`;
- `error.tsx`;
- `not-found.tsx`;
- route groups;
- metadata;
- route-level composition.

Pages should remain thin.

A page should primarily compose features.

Example:

```tsx
import { AgendaScreen } from "@/features/appointments";

export default function AgendaPage() {
  return <AgendaScreen />;
}
```

Do not place business algorithms inside route files.

In particular, `src/app` must not implement:

- appointment conflict detection;
- appointment timeline calculation;
- stock calculation;
- client visit statistics;
- product inventory rules;
- sale totals.

---

## Route Groups

Route groups may be introduced when they solve a real layout or organizational requirement.

A possible future structure is:

```text
src/app/
├── (auth)/
├── (app)/
└── onboarding/
```

Do not create route groups merely to anticipate future pages.

---

## Server and Client Components

Use Server Components by default when appropriate.

Add `"use client"` only when the component needs client-side capabilities such as:

- interactive local state;
- event handlers;
- effects;
- drag and drop;
- Motion animations;
- browser APIs;
- camera access;
- barcode scanning.

Keep client boundaries as focused as practical.

Do not turn a large component tree into Client Components only for convenience.

---

# 7. `src/domain`

## Responsibility

`src/domain` contains the framework-independent business model and business rules.

This is the most important architectural boundary in Souris.

Domain code must:

- be plain TypeScript;
- not import React;
- not import Next.js;
- not import Supabase;
- not access the DOM;
- not depend on browser APIs;
- not know how information is displayed;
- remain independently testable.

The domain answers business questions.

Examples:

- Can two appointment phases overlap?
- When does an appointment end?
- Which appointment phases occupy the professional?
- Which periods remain available?
- What is the total appointment price?
- What is the current product stock?
- Is a product below its stock threshold?
- What is a client's visit frequency?

---

# 8. `domain/appointments`

This module owns appointment and scheduling rules.

It is one of the most important modules in Souris.

Expected responsibilities include:

- appointment types;
- service types;
- service phases;
- appointment items;
- appointment phases;
- timeline calculation;
- occupied ranges;
- free ranges;
- overlap rules;
- conflict detection;
- available-slot calculation;
- service reordering;
- duration overrides;
- price overrides;
- appointment totals.

Possible future files include:

```text
appointment.types.ts
buildTimeline.ts
getOccupiedRanges.ts
getFreeRanges.ts
detectConflicts.ts
findAvailableSlots.ts
calculateAppointmentTotal.ts
```

Only create files when they are actually required.

The scheduling engine belongs here.

It must not live inside React components.

Detailed scheduling behavior is documented in:

```text
docs/domain/appointments.md
```

---

# 9. Core Scheduling Architecture

A Souris appointment is **not** represented as one indivisible blocked range.

An appointment is composed of ordered services.

Each service contains one or more phases.

Each phase defines whether it requires the professional.

Conceptually:

```ts
type ServicePhase = {
  id: string;
  name: string;
  durationMinutes: number;
  requiresStaff: boolean;
};
```

Example:

```text
09:00 → 09:15
Root color application
requiresStaff = true

09:15 → 09:50
Processing time
requiresStaff = false

09:50 → 10:00
Gloss / rinse
requiresStaff = true

10:00 → 10:10
Gloss processing time
requiresStaff = false
```

The client may remain present while the professional becomes available.

Therefore:

- appointments may overlap;
- client presence does not necessarily mean professional occupation;
- waiting or processing periods remain visible in the agenda;
- another appointment may use a free period;
- conflict detection operates on occupied phases;
- conflict detection must never use only the total appointment span.

This rule is central to Souris.

It must be implemented in the domain once and reused everywhere.

React components must never reimplement their own conflict logic.

---

# 10. `domain/business`

This module owns generic business concepts.

Expected concepts include:

- `Business`;
- `BusinessType`;
- `StaffMember`;
- business configuration;
- future resources.

The core architecture must not assume that every Souris business is a hair salon.

Prefer generic concepts such as:

```text
Business
StaffMember
Client
Service
ServicePhase
Appointment
Product
Sale
```

Avoid generic-domain concepts such as:

```text
Hairdresser
HairSalon
ColorationService
```

Hair-specific terminology may exist in profession-specific data or presentation labels.

---

# 11. Multi-Profession Architecture

The initial architecture should be capable of supporting business types such as:

```text
HAIR_SALON
BEAUTY_INSTITUTE
NAIL_SALON
LASH_BROW
MASSAGE
OTHER
```

This does **not** mean implementing all of them now.

The rule is:

> Make another profession possible without building features that are not currently needed.

For example, the scheduling engine should understand:

```text
requiresStaff = true
```

and:

```text
requiresStaff = false
```

It should not need to understand what a hair coloration is.

That same mechanism may later support:

- hair color processing;
- face-mask processing;
- eyelash tint processing;
- nail drying;
- equipment-based treatments.

---

# 12. Future Resource Scheduling

Some professions may eventually require scheduling resources other than staff.

Examples:

- treatment room;
- cabin;
- massage table;
- pressotherapy equipment;
- specialized machine.

A future phase may therefore need to reserve:

```text
StaffMember
Room
Equipment
```

independently.

The current V1 does not require this functionality.

Do not implement resource scheduling now.

The architecture should simply avoid assumptions that make it impossible later.

---

# 13. `domain/clients`

This module owns client-related business concepts.

Expected concepts include:

- client identity;
- phone number;
- birthday;
- notes;
- appointment history;
- technical notes;
- before/after photos;
- purchased products;
- visit count;
- total spending;
- visit frequency.

Profession-specific client information must be modeled carefully.

For example, the generic domain should not assume every technical note is a hair-color formula.

A generic technical-note concept may later represent:

```text
COLOR_FORMULA
SKIN_PROTOCOL
NAIL_FORMULA
OTHER
```

The UI may display profession-specific wording.

---

## Derived Client Data

Values such as:

- total spent;
- number of visits;
- average visit frequency;
- last visit date;

should preferably be derived from source records.

Avoid storing derived values as independent sources of truth unless performance requirements later justify a controlled projection.

---

# 14. `domain/products`

This module owns products and inventory rules.

Expected concepts include:

- `Product`;
- `ProductCategory`;
- barcode;
- sale price;
- purchase price where relevant;
- low-stock threshold;
- stock movements;
- current stock calculation.

Do not permanently encode hair-specific product categories into the global domain.

For example, a hair salon might configure:

```text
Shampoo
Treatment
Styling
```

while an esthetician might configure:

```text
Face
Body
Makeup
```

Categories should remain business-configurable where practical.

---

# 15. Stock Architecture

Stock changes must be auditable.

Do not model inventory only as:

```text
product.stock -= 1
```

The domain should support stock movements.

Expected movement concepts include:

```text
INITIAL_STOCK
RESTOCK
SALE
ADJUSTMENT
LOSS
```

A sale generates a stock decrease.

A restock generates an increase.

An adjustment records a manual correction.

Historical movements must remain available.

Current stock may initially be calculated from stock movements.

A controlled stored projection may be introduced later if performance requirements justify it.

---

# 16. Barcode Scanning

Barcode scanning is a presentation/application concern.

The domain stores and validates barcode identity.

Camera access and scanner behavior belong to the relevant product feature.

The domain must never depend on:

- camera APIs;
- browser scanner APIs;
- React scanner libraries.

---

# 17. `domain/sales`

This module owns sales concepts.

Expected concepts include:

- `Sale`;
- `SaleItem`;
- totals;
- client relationships;
- appointment relationships;
- product relationships.

Sales may optionally be associated with:

- a client;
- an appointment.

A product sale must remain historically correct even if its catalog price changes later.

---

# 18. Historical Data Integrity

Historical records must preserve the values that were true when the event occurred.

This applies especially to appointments and sales.

An appointment should preserve snapshots of relevant values such as:

- service name;
- service price;
- duration;
- phase durations.

A sale should preserve values such as:

- product name;
- unit price;
- quantity.

Example:

If a cut-and-blow-dry changes from:

```text
45 €
45 minutes
```

to:

```text
50 €
50 minutes
```

an appointment created before the catalog change must remain:

```text
45 €
45 minutes
```

Historical data must never silently mutate when catalog configuration changes.

---

# 19. Appointment Overrides

Catalog values are defaults.

A specific appointment may override values such as:

- price;
- service duration;
- active phase duration;
- processing duration.

These overrides apply to that appointment only.

Changing an appointment must not modify the service catalog unless the user explicitly performs a separate catalog-editing action.

---

# 20. `src/features`

## Responsibility

A feature represents user-facing business functionality.

Initial features include:

```text
appointments
auth
clients
products
sales
```

Features connect:

```text
UI
+
domain logic
+
application state
+
data access
```

Features may use React and Next.js.

---

## Feature Structure

A feature may contain folders such as:

```text
features/appointments/
├── components/
├── hooks/
├── actions/
├── queries/
├── fixtures/
└── index.ts
```

Do not automatically create all of these.

Only create a folder when real code requires it.

---

# 21. Feature Components

Business-aware components belong to their feature.

Examples:

```text
features/appointments/components/AppointmentCard.tsx
features/appointments/components/ProcessingTimeBlock.tsx

features/clients/components/ClientCard.tsx

features/products/components/ProductCard.tsx
features/products/components/ProductScanner.tsx
```

These components understand Souris business concepts.

They therefore do not belong in `shared/ui`.

---

# 22. Feature Hooks

Hooks belong to the feature they support.

Example:

```text
features/appointments/hooks/useAppointmentDraft.ts
```

Do not create a global:

```text
src/hooks/
```

directory.

---

# 23. Feature Queries and Actions

Data-access orchestration should remain close to the feature owning the use case.

Potential examples:

```text
features/clients/queries/getClients.ts
features/products/actions/createProduct.ts
features/appointments/actions/createAppointment.ts
```

Do not create a generic global `services/` folder.

If a file cannot clearly be assigned to a domain or feature, reconsider its responsibility before creating another abstraction.

---

# 24. Feature Public API

A feature may expose a small public API through an `index.ts`.

Example:

```ts
export { AgendaScreen } from "./components/AgendaScreen";
```

Do not automatically create barrel files everywhere.

Use them when they improve module boundaries and discoverability.

---

# 25. `src/shared`

`shared` contains reusable technical and presentation code that has no ownership by a specific business feature.

It must remain small and intentional.

Initial structure:

```text
shared/
├── icons/
├── lib/
└── ui/
```

---

# 26. `shared/ui`

Contains generic visual primitives.

Examples:

```text
Button
Input
Badge
Avatar
Card
Dialog
Drawer
BottomSheet
Tabs
```

A `shared/ui` component must not know about:

- appointments;
- clients;
- products;
- salons;
- beauty professions.

A generic `Card` belongs here.

An `AppointmentCard` does not.

---

# 27. `shared/icons`

Contains custom Souris icon components or icon abstractions when required.

Do not copy an entire third-party icon library into this folder.

Brand assets and official logo files must remain clearly separated from generic icons.

---

# 28. `shared/lib`

Contains genuinely cross-cutting technical helpers.

Potential examples include:

- class-name composition;
- generic date formatting;
- currency formatting;
- technical formatting helpers.

This directory must **not** become another name for `utils`.

Before adding code here, verify that it is:

1. genuinely shared;
2. not business logic;
3. not owned by one feature.

---

# 29. Forbidden Generic Root Folders

Do not create root-level folders named:

```text
utils/
helpers/
services/
common/
misc/
hooks/
types/
components/
```

These folders tend to become dumping grounds.

Code must be located according to ownership and responsibility.

---

# 30. Types

Do not create a global:

```text
src/types/
```

directory by default.

Types should live beside the concept that owns them.

Examples:

```text
domain/appointments/appointment.types.ts
domain/products/product.types.ts
```

Feature-only types should remain inside the feature.

Component-only types may remain beside the component.

---

# 31. Validation

Validation schemas should remain close to the data or workflow they validate.

Business invariants belong to the domain.

Form-specific validation belongs to the relevant feature.

Do not create a global `schemas` directory unless a demonstrated cross-feature need appears.

---

# 32. `src/providers`

This folder contains application-level React providers.

Potential future examples include:

```text
AuthProvider
QueryProvider
MotionProvider
```

Only introduce providers when application-wide React state or framework integration requires them.

Avoid unnecessary provider nesting.

---

# 33. `src/config`

Contains static application configuration.

Potential responsibilities include:

- routes;
- navigation;
- environment configuration;
- feature flags;
- static application constants.

Business logic must not live here.

---

# 34. `src/styles`

Contains global style infrastructure.

Initial responsibility:

```text
globals.css
```

Potential later responsibility:

```text
tokens.css
```

Design values such as:

- colors;
- typography;
- spacing;
- radii;
- shadows;
- motion values;

must have a canonical source.

Do not scatter arbitrary values through unrelated components.

---

# 35. Persistence Boundary

Souris will use persistence, but persistence is not the business domain.

Domain algorithms must receive ordinary TypeScript values.

They must not receive:

- Supabase query builders;
- database clients;
- framework request objects;
- persistence-specific APIs.

Generated database types must not automatically become domain entities.

Transform persistence data at the application boundary where necessary.

---

# 36. Supabase Boundary

Supabase may later provide:

- authentication;
- PostgreSQL;
- storage;
- realtime functionality where useful.

The core domain must remain independent from Supabase.

A future migration away from Supabase must not require rewriting:

- appointment timeline calculation;
- conflict detection;
- stock calculations;
- appointment totals;
- client-derived calculations.

---

# 37. Testing Architecture

Tests should normally be colocated with the code they validate.

Examples:

```text
domain/appointments/__tests__/buildTimeline.test.ts

features/appointments/__tests__/AppointmentCard.test.tsx
```

Do not create one giant root unit-test folder.

Application-wide end-to-end tests may later live in a dedicated root directory because they validate complete workflows.

The detailed testing strategy is defined in:

```text
docs/development/testing.md
```

---

# 38. Fixtures

Feature-specific development and visual fixtures belong to the feature.

Example:

```text
features/appointments/fixtures/appointments.ts
```

Domain-specific test fixtures may live close to domain tests.

Do not create a global fixture registry unless the same fixture genuinely serves several independent modules.

---

# 39. Imports

Use the configured alias:

```text
@/*
```

for imports crossing meaningful module boundaries.

Prefer local relative imports for tightly colocated files.

Avoid deeply nested imports such as:

```text
../../../../
```

Do not introduce additional aliases without a clear architectural benefit.

---

# 40. Naming

Use names that express business intent.

Prefer:

```text
buildAppointmentTimeline
getOccupiedRanges
findAvailableSlots
calculateCurrentStock
AppointmentCard
ProcessingTimeBlock
```

Avoid vague names such as:

```text
handleData
processItems
helper
commonUtils
manager
service
```

Names should explain what the code means in Souris.

---

# 41. Mobile-First Architecture

Souris is mobile-first, not mobile-only.

The application must provide intentional layouts for:

- mobile;
- tablet;
- desktop.

Desktop is not a stretched mobile interface.

Tablet is not simply a reduced desktop interface.

Responsive behavior is defined in:

```text
docs/design/responsive.md
```

---

# 42. Design-System Boundary

Generic visual primitives belong in:

```text
shared/ui
```

Business-specific visual components belong in their features.

Examples:

```text
shared/ui/Button.tsx
shared/ui/Badge.tsx
```

versus:

```text
features/appointments/components/AppointmentCard.tsx
features/products/components/ProductCard.tsx
```

If a component contains business semantics, it should normally remain in its feature.

---

# 43. Motion Boundary

Motion belongs to the presentation layer.

The domain calculates:

- state;
- timelines;
- availability;
- ordering;
- conflicts.

The UI decides how these changes are animated.

Animations may communicate:

- drag and drop;
- reordering;
- appointment movement;
- processing-time availability;
- card expansion;
- navigation continuity;
- confirmation.

Motion rules are defined in:

```text
docs/design/motion.md
```

---

# 44. Pixel-Perfect Requirement

Approved visual references live in:

```text
docs/design/references/
```

They are the visual source of truth.

UI implementations must be compared against the references at defined viewport sizes.

Do not reinterpret the design direction from scratch.

Do not introduce arbitrary values when a documented design token exists.

---

# 45. Error Handling

Business-critical failures must be represented explicitly.

Examples include:

- occupied-phase conflict;
- invalid appointment duration;
- invalid price;
- invalid stock movement;
- unavailable slot;
- missing required appointment information.

Do not silently ignore business failures.

The domain determines whether something is valid.

The feature layer determines how the error is presented to the user.

---

# 46. Architecture Decision Rule

When deciding where a new file belongs, ask these questions in order.

### 1. Is this pure business logic?

Place it in:

```text
domain/
```

### 2. Is this specific to one user-facing capability?

Place it in the relevant:

```text
features/
```

### 3. Is this generic reusable UI?

Place it in:

```text
shared/ui/
```

### 4. Is this genuinely cross-cutting technical code?

Consider:

```text
shared/lib/
```

### 5. Is this application-wide React integration?

Place it in:

```text
providers/
```

### 6. Is this static application configuration?

Place it in:

```text
config/
```

### 7. Is this global styling infrastructure?

Place it in:

```text
styles/
```

If none applies clearly, do not create a generic bucket.

Reconsider the responsibility first.

---

# 47. Future Evolution

The architecture may evolve when real product requirements emerge.

Potential future requirements include:

- multiple staff members;
- multiple business locations;
- multiple workspaces;
- rooms;
- equipment;
- permissions;
- advanced offline behavior;
- external integrations;
- payments;
- appointment reminders;
- analytics;
- reporting.

Do not implement these abstractions before they are actually needed.

When architecture changes:

1. update this document;
2. update the implementation;
3. keep both changes in the same logical commit.

Documentation and implementation must not diverge.

---

# 48. Current Priorities

Before implementing production features, Souris must establish:

1. project architecture;
2. agent instructions;
3. design references;
4. appointment-domain rules;
5. testing conventions;
6. design tokens;
7. responsive rules;
8. motion rules;
9. visual-verification workflow.

The first business-critical implementation should be the framework-independent scheduling engine.

Persistence and production UI must not define the scheduling architecture.

---

# 49. Final Rule

Souris must remain easy to understand.

When choosing between:

- a clever abstraction;
- a direct and well-named implementation;

prefer the direct implementation unless the abstraction solves a demonstrated recurring problem.

Architecture exists to make Souris easier to build, test, understand, and evolve.
