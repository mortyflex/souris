# Souris

Souris is a mobile-first PWA for beauty professionals to manage:

- appointments;
- clients;
- services;
- technical notes;
- before/after photos;
- products;
- inventory;
- retail sales.

The first production use case is a single hair professional, while the underlying architecture remains compatible with other beauty professions.

> **Generic in the data model, specific in the user experience.**

---

## Product Vision

Souris is designed to feel less like traditional salon-management software and more like a modern premium product.

The application combines:

```text
powerful scheduling
simple daily workflows
strong visual identity
mobile-first interaction
professional client memory
inventory and retail management
```

The agenda is the heart of the product.

---

## Core Scheduling Difference

Souris does not model an appointment as one indivisible blocked time range.

A client may remain in the salon while the professional becomes temporarily available.

Example:

```text
09:00 → 09:15
Root color application
Professional occupied

09:15 → 09:50
Processing time
Professional available

09:50 → 10:00
Next active phase
Professional occupied
```

Another compatible appointment may therefore be scheduled during the processing period.

Scheduling conflicts are based on overlapping staff-required phases, not simply overlapping appointment start and end times.

Detailed rules are documented in:

```text
docs/domain/appointments.md
```

---

## Product Principles

Souris follows several core principles.

### Mobile first, not mobile only

The primary experience is designed for mobile use in a real salon environment.

Tablet and desktop must also receive intentional layouts.

Desktop must not simply stretch the mobile interface.

### Generic domain, specific UX

Core concepts remain generic:

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

The presentation may still use highly specific terminology for the current profession.

For a hair salon, for example:

```text
Technique
Temps de pose
Formule couleur
```

### Historical integrity

Historical appointments and sales preserve snapshots.

Changing a current catalog price or duration must not rewrite historical records.

### Auditable inventory

Stock is based on stock movements such as:

```text
INITIAL_STOCK
RESTOCK
SALE
ADJUSTMENT
LOSS
```

Inventory should not be treated as an unexplained mutable counter.

### Direct architecture

Prefer clear, well-named implementations over unnecessary abstraction.

Do not introduce infrastructure for hypothetical future requirements before they are needed.

---

## Current Stack

The project is currently based on:

```text
Next.js 16
React 19
TypeScript
Tailwind CSS 4
Bun
```

Additional libraries and infrastructure will be introduced only when the relevant development phase requires them.

Potential future tools include:

```text
Supabase
Motion
dnd-kit
Vitest
React Testing Library
Playwright
```

Their presence in the roadmap does not mean they should be installed prematurely.

---

## Package Manager

Souris uses Bun.

Install dependencies with:

```bash
bun install
```

Start the development server with:

```bash
bun dev
```

The application is then normally available at:

```text
http://localhost:3000
```

---

## Project Architecture

Souris uses a feature-first architecture with a framework-independent domain layer.

Target structure:

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
├── config/
└── styles/
```

This is a target architecture.

Do not create empty folders merely to reproduce the tree.

Directories should appear when real implementation requires them.

Detailed rules are defined in:

```text
docs/architecture.md
```

---

## Dependency Direction

The primary dependency direction is:

```text
app
 ↓
features
 ↓
domain
```

The domain layer must remain independent from:

```text
React
Next.js
Supabase
browser APIs
UI state
```

Core business logic should remain testable as plain TypeScript.

---

## Documentation

Project documentation lives in:

```text
docs/
```

The documentation is part of the project specification.

---

## Architecture

```text
docs/architecture.md
```

Defines:

- source structure;
- module ownership;
- dependency boundaries;
- persistence boundaries;
- shared UI rules;
- testing placement;
- architectural evolution.

---

## Business Domain

```text
docs/domain/business.md
```

Defines:

- businesses;
- business ownership;
- beauty professions;
- staff members;
- multi-profession architecture;
- future multi-staff compatibility;
- future resource compatibility.

---

## Appointments Domain

```text
docs/domain/appointments.md
```

Defines:

- services;
- techniques;
- service phases;
- appointment items;
- appointment phases;
- processing time;
- staff occupation;
- overlapping appointments;
- conflict detection;
- timeline calculation;
- price and duration overrides;
- historical appointment snapshots.

This document describes the most business-critical part of Souris.

---

## Clients Domain

```text
docs/domain/clients.md
```

Defines:

- client records;
- appointment history;
- technical notes;
- formulas and protocols;
- before/after photos;
- purchased products;
- visit count;
- spending;
- visit frequency;
- derived client metrics.

---

## Products Domain

```text
docs/domain/products.md
```

Defines:

- products;
- configurable categories;
- barcodes;
- product images;
- stock;
- stock movements;
- low-stock behavior;
- inventory history.

---

## Sales Domain

```text
docs/domain/sales.md
```

Defines:

- retail sales;
- sale items;
- product snapshots;
- client relationships;
- appointment relationships;
- sale totals;
- inventory consequences;
- sale lifecycle.

---

## Design System

```text
docs/design/design-system.md
```

Defines the visual language of Souris:

- brand direction;
- palette;
- typography principles;
- spacing;
- radii;
- surfaces;
- cards;
- buttons;
- inputs;
- icons;
- UI hierarchy.

The design direction is intended to feel:

```text
premium
editorial
warm
playful
modern
professional
```

---

## Responsive Design

```text
docs/design/responsive.md
```

Defines intentional behavior for:

```text
mobile
tablet
desktop
```

The core rule is:

> **Adapt the composition, not only the dimensions.**

---

## Motion

```text
docs/design/motion.md
```

Defines:

- animation principles;
- timing;
- easing;
- navigation transitions;
- agenda motion;
- drag and drop;
- scanner feedback;
- reduced-motion behavior.

The core motion rule is:

> **Motion should explain what changed.**

---

## Visual References

Approved reference material lives in:

```text
docs/design/references/
```

The reference workflow is documented in:

```text
docs/design/references/README.md
```

Visual implementation should follow:

```text
reference
↓
understand
↓
implement
↓
compare
↓
correct
```

Visual references are development specifications and must not be imported into the production application.

---

## Git Workflow

```text
docs/development/git.md
```

Souris uses Conventional Commits with a meaningful emoji.

Format:

```text
<type>(<scope>): <emoji> <description>
```

Example:

```text
feat(scheduling): ✨ add appointment timeline engine
```

Development is performed incrementally.

A project step normally follows:

```text
work
↓
verify
↓
test
↓
review diff
↓
commit
↓
push
↓
clean working tree
```

---

## Testing Strategy

```text
docs/development/testing.md
```

Testing prioritizes risk.

The expected balance is:

```text
Many
Domain / unit tests

Moderate
Component / integration tests

Few but important
End-to-end tests

Targeted
Visual regression tests
```

Scheduling receives particularly extensive domain coverage.

---

## Definition of Done

```text
docs/development/definition-of-done.md
```

A task is not complete merely because the code exists.

Relevant work must also be:

```text
correct
verified
tested appropriately
visually reviewed when relevant
responsive when relevant
documented when relevant
committed
pushed
clean
```

---

## Agent Instructions

Project-specific instructions for coding agents live in:

```text
AGENTS.md
```

`CLAUDE.md` references the same rules.

Agents must read and respect the relevant project documentation before making architectural or domain decisions.

---

## Design Direction

The current Souris visual direction uses:

```text
lavender / purple
pink
warm peach
light lavender-gray
deep navy-purple
rounded geometry
editorial composition
fluid motion
```

Approximate palette values are documented in:

```text
docs/design/design-system.md
```

Final production design tokens must be verified against approved visual references before being frozen.

---

## Brand

The name:

```text
souris
```

references both:

```text
mouse
```

and the French imperative:

```text
smile
```

The logo direction combines this dual meaning through a unified mouse/smile visual language.

The wordmark is intended to remain lowercase.

Final production logo assets will be introduced separately from brand-reference material.

---

## First Production Context

The initial application is optimized for:

```text
one business
one active professional
hair salon
France
French interface
EUR
```

These assumptions simplify the first user experience.

They must not become unnecessary permanent limitations of the core domain.

---

## Initial Client Capabilities

The intended client experience includes:

```text
phone
birthday
notes
appointment history
technical formulas
before/after photos
products purchased
total spending
visit frequency
```

Most metrics should be derived from canonical historical records.

---

## Initial Product Capabilities

The intended product workflow includes:

```text
scan barcode
create unknown product
add photo
enter brand
choose category
set price
enter initial stock
restock
record stock adjustments
sell product
decrement stock after completed sale
```

Product categories remain configurable rather than globally hair-specific.

---

## Initial Appointment Capabilities

The intended appointment experience includes:

```text
select client
add one or more services
reorder services
change appointment-specific price
change appointment-specific duration
change processing duration
preview generated timeline
detect scheduling conflicts
save appointment
```

Catalog defaults must remain unchanged when values are overridden for one appointment.

---

## Scheduling Example

A typical valid Souris scheduling scenario:

```text
Lynda

09:00 → 09:15
Root color application
occupied

09:15 → 09:50
Processing
available

09:50 → 10:00
Next active phase
occupied
```

During:

```text
09:15 → 09:45
```

Sofia may receive a 30-minute service.

This is valid even though both clients are present simultaneously.

The professional is only double-booked when staff-required phases overlap.

---

## Development Philosophy

Souris should evolve from real requirements.

Do not build:

```text
multi-location
complex permissions
rooms
equipment
subscriptions
supplier management
recurring appointments
payment infrastructure
```

until a concrete requirement exists.

The architecture should avoid blocking those capabilities without implementing them prematurely.

---

## Source of Truth

When making a project decision, consult sources in this order:

```text
domain documentation
architecture documentation
design documentation
approved visual references
existing implementation
```

If implementation and documentation legitimately need to diverge, update both intentionally.

Do not allow accidental drift.

---

## Current Development Phase

The repository is currently in the foundation phase.

The focus is on establishing:

```text
architecture
domain rules
development rules
testing strategy
design system
responsive behavior
motion
visual references
```

Production business features should be introduced incrementally after these foundations are verified.

---

## Contribution Rule

Before beginning meaningful implementation:

1. read `AGENTS.md`;
2. read the relevant domain document;
3. read `docs/architecture.md`;
4. inspect the existing implementation;
5. follow the current project phase.

Do not implement from assumptions when the project already documents the decision.

---

## Final Principle

Souris should remain easy to understand as it grows.

The product can be visually expressive and technically capable without becoming structurally complicated.

Prefer:

```text
clear domain rules
small coherent modules
intentional UI
strong tests
explicit documentation
incremental development
```

over clever architecture or premature abstraction.

The objective is to build a product that feels simple to use because the complexity underneath it is modeled correctly.
