<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Souris Project Rules

## Project Overview

Souris is a mobile-first appointment and business management application for beauty professionals.

The first production use case is a hair salon operated by a single professional, but the architecture must remain generic enough to support other beauty professions such as estheticians, nail technicians, lash and brow professionals, massage and wellness professionals.

The product must remain specific and efficient for the current salon experience while avoiding domain decisions that permanently couple the core architecture to hairdressing.

Core principle:

> Generic in the data model, specific in the user experience.

## Product Priorities

In order of importance:

1. Scheduling correctness
2. Fast daily usage
3. Clear visualization of staff availability
4. Reliable client history
5. Product and stock management
6. Responsive mobile, tablet, and desktop experience
7. Visual fidelity to the approved Souris design references
8. Smooth, purposeful motion
9. Maintainable and testable architecture

## Core Scheduling Principle

Appointments are not simple blocked time ranges.

An appointment is composed of ordered service phases.

A phase can either require the professional or leave the professional available.

This means:

- appointments may overlap;
- waiting or processing time may remain visible while another appointment is scheduled;
- conflicts must be calculated from staff-required phases, never from the total appointment duration;
- service order may be changed and the appointment timeline must be recalculated accordingly.

The detailed scheduling rules are defined in:

`docs/domain/appointments.md`

Do not implement scheduling behavior before reading that document.

## Multi-Profession Architecture

The core domain must use generic concepts such as:

- Business
- StaffMember
- Client
- Service
- ServicePhase
- Appointment
- Product
- Sale
- StockMovement

Avoid coupling core domain types to one profession.

Do not use concepts such as `Hairdresser`, `HairSalon`, or `ColorationService` in generic domain infrastructure unless they exist only inside a profession-specific presentation layer.

The detailed business architecture is defined in:

`docs/domain/business.md`

## Design Source of Truth

Approved visual references live in:

`docs/design/references/`

These references define the visual direction of Souris.

Do not reinterpret the brand from scratch.

Do not introduce arbitrary colors, typography, radii, spacing, shadows, or motion patterns that conflict with the documented design system.

Before implementing UI, read:

- `docs/design/design-system.md`
- `docs/design/responsive.md`
- `docs/design/motion.md`

## Responsive Strategy

Souris is mobile-first.

The application must also provide intentionally designed tablet and desktop experiences.

Desktop is not a stretched mobile interface.

Tablet is not merely a reduced desktop interface.

Responsive behavior is documented in:

`docs/design/responsive.md`

## Motion

Motion is part of the Souris product identity but must remain functional.

Animations must:

- reinforce spatial relationships;
- explain scheduling changes;
- improve drag and drop comprehension;
- provide immediate feedback;
- never delay common actions.

Respect reduced-motion preferences.

Motion rules are documented in:

`docs/design/motion.md`

## Development Rules

Before implementing a feature:

1. read the relevant domain documentation;
2. read the relevant design documentation;
3. identify existing reusable components;
4. avoid duplicating business logic inside React components;
5. add or update tests for business-critical logic;
6. verify mobile, tablet, and desktop behavior when UI is affected.

## Git Workflow

All project commits must use Conventional Commits with an emoji.

Examples:

`feat(scheduling): ✨ add appointment phase timeline`

`fix(agenda): 🐛 prevent overlapping occupied phases`

`test(scheduling): ✅ cover processing-time overlaps`

`chore(design): 🎨 add visual references`

Do not create vague commit messages such as:

`update`

`changes`

`fix stuff`

Full Git rules are defined in:

`docs/development/git.md`

## Testing

Business-critical scheduling logic must be tested independently from the UI.

UI behavior must be verified against the approved visual references.

The full testing strategy is defined in:

`docs/development/testing.md`

## Definition of Done

A task is not complete merely because it renders or compiles.

Before considering work complete, follow:

`docs/development/definition-of-done.md`

## Architecture

The project architecture and dependency boundaries are defined in:

`docs/architecture.md`

Do not create new top-level architectural patterns without updating that document.

## Documentation Rule

When a product or architecture decision changes:

- update the relevant documentation in the same change;
- do not allow implementation and documentation to diverge;
- prefer one canonical source of truth over duplicated rules.

## Current Project State

The project is currently in foundation setup.

Do not implement product features unless explicitly requested by the current development phase.
