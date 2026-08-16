# Souris — Definition of Done

## 1. Purpose

This document defines when a development task, feature, fix, documentation change, or project phase can be considered complete in Souris.

It is the canonical reference for:

- implementation completeness;
- testing expectations;
- visual verification;
- responsive verification;
- accessibility checks;
- documentation requirements;
- Git completion;
- cleanup requirements;
- agent completion criteria.

The purpose of this document is to prevent incomplete work from being treated as finished.

A task is not done merely because:

```text
the code exists
the page renders
the build starts
the happy path works once
```

A task is done when the relevant implementation, verification, documentation, and repository requirements are satisfied.

---

## 2. Core Principle

The Souris definition of done is contextual.

Not every task requires:

```text
unit tests
E2E tests
visual screenshots
database tests
responsive verification
```

A documentation-only change does not need browser testing.

A pure scheduling-domain change does not need pixel-perfect verification.

A new agenda screen does.

The rule is:

> Apply every completion requirement relevant to the change being made.

Do not perform irrelevant ceremony.

Do not skip relevant verification.

---

## 3. General Completion Checklist

Before considering any meaningful Souris task complete, verify:

```text
requirements understood
implementation matches the requested scope
no unrelated work added
relevant tests pass
TypeScript remains valid
lint remains valid
build remains valid when applicable
UI manually verified when applicable
responsive behavior verified when applicable
accessibility considered when applicable
documentation updated when rules changed
temporary code removed
Git diff reviewed
commit created
commit pushed
working tree clean
```

---

## 4. Scope Completion

A task must solve the requested problem completely.

Do not mark a task done when:

```text
only part of the workflow exists
the UI exists without business behavior
the business function exists but is not integrated
the feature works only with hard-coded demo values
a critical TODO remains
```

If the requested phase intentionally covers only part of a future feature, the phase is complete when that explicitly defined part is complete.

Do not expand the phase beyond its stated scope.

---

## 5. No Unrequested Scope Expansion

Souris is developed incrementally.

Do not introduce unrelated functionality simply because it may be useful later.

Examples:

If implementing:

```text
appointment timeline calculation
```

do not also implement:

```text
staff permissions
notifications
payments
recurring appointments
```

unless they are part of the current phase.

Future-proofing should come from clean boundaries, not premature implementation.

---

## 6. Architecture Compliance

New code must respect:

```text
docs/architecture.md
```

Before creating a new folder, abstraction, service, helper, global type, or dependency, verify that it belongs in the documented architecture.

Do not create generic dumping grounds such as:

```text
src/utils
src/helpers
src/services
src/common
src/misc
src/hooks
src/types
src/components
```

unless the architecture is intentionally changed first.

---

## 7. Domain Compliance

Business logic must respect the relevant domain documentation.

Current domain references include:

```text
docs/domain/business.md
docs/domain/appointments.md
docs/domain/clients.md
docs/domain/products.md
docs/domain/sales.md
```

If implementation reveals that a domain rule needs to change, update the relevant documentation as part of the same logical change.

Do not silently implement behavior that contradicts the documented model.

---

## 8. Scheduling Definition of Done

Scheduling work is complete only when the relevant business scenarios are explicitly verified.

For core scheduling changes, consider:

```text
simple service
technique
processing time
staff occupation
appointment end
overlap
conflict
future conflict
boundary-touching phases
service reordering
duration overrides
price overrides
```

The scheduling engine must remain independent from React, Next.js, and persistence.

A scheduling feature is not done if the UI computes its own alternative scheduling logic.

---

## 9. Scheduling Conflict Requirement

Any implementation affecting availability or overlap must preserve the Souris core rule:

```text
client presence ≠ staff occupation
```

Conflict detection must operate on staff-required phases.

A feature that incorrectly blocks the entire appointment duration is not complete.

---

## 10. Product and Inventory Definition of Done

Inventory work must preserve auditable stock history.

A product-stock implementation is not complete if it only performs:

```ts
product.stock -= 1;
```

without the corresponding stock-movement behavior defined by the product domain.

Relevant scenarios should include:

```text
initial stock
restock
sale
loss
adjustment
current stock
low stock
out of stock
```

depending on the current task.

---

## 11. Sales Definition of Done

Sales work must preserve:

```text
historical product snapshots
sale totals
inventory consequences
```

A completed sale must not rely on current product catalog values for historical display.

When persistence is introduced, sale completion and inventory changes must have appropriate consistency guarantees.

---

## 12. Client Definition of Done

Client work must preserve client history from canonical records.

Avoid introducing duplicate sources of truth for:

```text
appointments
products purchased
total spent
visit count
last visit
next appointment
visit frequency
```

Derived information should remain derived unless a controlled projection is explicitly introduced.

---

## 13. Historical Integrity

Any feature dealing with historical business records must verify that later catalog changes do not rewrite history.

Relevant examples include:

```text
service name
service price
service duration
phase duration
product name
product sale price
sale quantity
```

Historical snapshots must remain stable.

---

## 14. TypeScript

Production TypeScript must compile without errors.

Do not consider a task done with unresolved TypeScript errors.

Avoid suppressions such as:

```ts
// @ts-ignore
```

unless there is a documented and justified reason.

Prefer fixing the underlying typing issue.

---

## 15. Type Safety

Avoid weakening types merely to make implementation easier.

Examples to avoid without justification:

```ts
any
unknown cast immediately to another type
as never
as any
```

Prefer domain-specific types where they provide real value.

Do not create excessive type abstraction for trivial values.

---

## 16. Lint

Relevant lint checks must pass.

Do not globally disable lint rules simply because a new implementation violates them.

A lint exception should be:

```text
necessary
local
documented when non-obvious
```

---

## 17. Tests

Relevant automated tests must pass before a task is considered done.

Testing expectations are defined in:

```text
docs/development/testing.md
```

Tests should be added when a change introduces or modifies testable business behavior.

---

## 18. Regression Tests

A meaningful bug fix should include a regression test when practical.

The preferred sequence is:

```text
reproduce bug
add failing test
fix behavior
verify test passes
```

This is particularly important for:

```text
scheduling
stock
sales totals
historical data
client metrics
```

---

## 19. Build

For production-code changes, the production build should pass when the current project phase has a usable build workflow.

A successful development server alone is not sufficient.

Build errors must be resolved before completion.

---

## 20. No Runtime Errors

A UI task is not done if normal interaction produces:

```text
console errors
uncaught exceptions
React warnings
hydration errors
broken network requests caused by implementation
```

Relevant browser console output should be checked during UI verification.

---

## 21. No Accidental Warnings

Do not leave avoidable warnings in:

```text
terminal
browser console
test output
build output
```

Warnings that are genuinely expected should be understood and documented where necessary.

Do not normalize noisy project output.

---

## 22. UI Definition of Done

A UI implementation is complete only after it has been rendered and visually inspected.

Code review alone is not enough.

For relevant screens, verify:

```text
layout
spacing
typography
colors
radii
alignment
content hierarchy
states
interaction
overflow
scrolling
```

---

## 23. Design Source of Truth

Approved design references live in:

```text
docs/design/references/
```

UI work must follow those references and the documented design system.

Do not replace the approved direction with generic SaaS styling or personal preference.

---

## 24. Pixel-Perfect Requirement

Where a visual reference exists, compare implementation against it.

A task is not done when major differences remain in:

```text
spacing
scale
typography
card geometry
alignment
visual hierarchy
responsive composition
```

Minor rendering differences caused by browser rasterization are acceptable.

Unintentional design drift is not.

---

## 25. Responsive Definition of Done

Souris is mobile-first, not mobile-only.

A relevant UI feature must be verified on:

```text
mobile
tablet
desktop
```

according to the responsive specification.

A desktop view created only by stretching the mobile layout is not considered complete when the design requires a distinct desktop composition.

---

## 26. Mobile Verification

Mobile verification should consider:

```text
small viewport width
touch targets
bottom navigation
drawers or sheets
keyboard appearance
scrolling
sticky elements
safe areas when relevant
```

The interface must remain practical for real salon use.

---

## 27. Tablet Verification

Tablet must receive intentional verification.

Check:

```text
layout density
navigation
agenda width
card proportions
available space usage
orientation-sensitive issues when relevant
```

Do not assume tablet works because mobile and desktop work.

---

## 28. Desktop Verification

Desktop verification should confirm that the interface makes meaningful use of additional space.

Relevant checks may include:

```text
multi-column layout
agenda width
side navigation
panels
content density
card sizing
mouse interaction
```

Desktop must not feel like an oversized phone.

---

## 29. Overflow

No important screen should introduce unintended:

```text
horizontal scrolling
clipped controls
unreachable content
overlapping text
```

unless horizontal scrolling is an intentional interaction documented by the design.

---

## 30. Empty States

When a feature can legitimately contain no data, its empty state must be considered.

Examples:

```text
no appointments
no clients
no products
no sales
no technical notes
no photos
```

Do not leave the user facing an unexplained blank area.

The exact empty-state design should follow the product phase.

---

## 31. Loading States

When data loading is introduced, important screens need intentional loading behavior.

Avoid uncontrolled layout shifts.

Loading UI should preserve the expected visual structure where practical.

Do not add fake loading behavior before asynchronous data exists.

---

## 32. Error States

User-visible operations that may fail should provide understandable feedback.

Examples:

```text
appointment cannot be saved
stock operation fails
product lookup fails
image upload fails
authentication fails
```

Do not expose raw technical error messages as the primary user experience.

---

## 33. Form Validation

Forms must prevent invalid domain data from being committed.

Validation should happen at appropriate layers.

The UI may provide immediate feedback.

The domain remains responsible for business invariants.

Do not rely solely on disabled buttons for data integrity.

---

## 34. Accessibility

Relevant UI work must consider accessibility before completion.

At minimum, verify where applicable:

```text
semantic controls
form labels
keyboard access
focus visibility
dialog focus behavior
accessible names
color contrast
touch target size
reduced motion
```

---

## 35. Keyboard Navigation

Interactive desktop interfaces must remain usable with the keyboard where appropriate.

Do not create clickable non-semantic containers when a native:

```text
button
link
input
```

is the correct element.

---

## 36. Focus State

Interactive controls must have a visible focus state.

Do not remove browser focus indication without replacing it with an accessible alternative.

---

## 37. Color Is Not Enough

Important information must not rely only on color.

For example, a processing-time area should include meaningful text such as:

```text
Temps de pose
35 min disponibles
```

rather than being identifiable only by a pink or lavender background.

---

## 38. Motion

Motion should reinforce understanding.

Relevant interaction may use animation for:

```text
drag and drop
card expansion
screen transition
timeline movement
confirmation
onboarding
```

Motion must not make the interface slower or harder to use.

---

## 39. Reduced Motion

When meaningful motion exists, ensure the experience remains usable with:

```text
prefers-reduced-motion
```

Decorative animation may be reduced or removed.

Critical information must never depend on animation alone.

---

## 40. Performance

Do not optimize prematurely.

However, obvious performance problems must not be accepted as done.

Examples:

```text
unnecessary full-screen rerenders
expensive calculation on every render
very large client bundle caused by accidental imports
unoptimized repeated network operations
```

Pure domain calculations may be optimized when real profiling indicates a need.

---

## 41. Dependency Discipline

A task that adds a dependency must justify that dependency.

Before completion, verify:

```text
the package is required
existing dependencies do not already solve the problem
the package is actively maintained enough for the use case
the dependency belongs to the current phase
```

Do not add libraries speculatively.

---

## 42. Security

Security-relevant work is not done until basic threat boundaries are considered.

Examples include:

```text
authentication
business isolation
client photos
private client notes
database authorization
file uploads
environment variables
```

Secrets must never be committed.

---

## 43. Business Data Isolation

When persistence is introduced, business-owned records must be protected.

Relevant data includes:

```text
clients
appointments
services
products
stock movements
sales
photos
technical notes
```

A UI filter is not an authorization mechanism.

---

## 44. Private Media

Client photos must not accidentally become unrestricted public assets.

Media access strategy must match the privacy requirements defined in the client domain.

A feature is not done if private client media is exposed through unintended permanent public access.

---

## 45. Data Integrity

Operations affecting several related business records must preserve consistency.

Examples:

```text
sale + stock movement
appointment + phase snapshots
client + imported history
photo metadata + storage object
```

Partial failure behavior must be considered when persistence is introduced.

---

## 46. Persistence Independence

Pure domain logic must remain independent from persistence technology.

A task is not architecturally complete if domain functions directly depend on:

```text
Supabase client
SQL query builder
Next.js request
React hook
browser API
```

unless the code does not belong in the domain in the first place.

---

## 47. Temporary Data

During early UI phases, fixtures or mock data may be appropriate.

Mock data must:

```text
be clearly identifiable
live in an appropriate fixture location
not leak into production-domain logic
not be mistaken for real persistence
```

Remove obsolete fixtures when real data replaces them.

---

## 48. Temporary Code

Before completion, remove accidental development artifacts such as:

```text
console.log
debug buttons
unused imports
temporary CSS
commented experiments
dead code
placeholder TODOs that should have been resolved
```

Do not keep commented-out implementation as backup.

Git already preserves history.

---

## 49. TODOs

A TODO is acceptable only when it represents intentional future scope.

It must not hide work required for the current task.

Bad:

```text
TODO: make appointment conflict detection actually work
```

inside a phase whose purpose is to implement conflict detection.

Acceptable:

```text
TODO: support room resources when multi-resource scheduling is introduced
```

if rooms are explicitly outside current scope.

---

## 50. Documentation

Documentation must be updated when a change affects:

```text
architecture
domain rules
testing strategy
responsive behavior
design system
motion rules
development workflow
```

Do not update documentation for every trivial implementation detail.

Documentation exists for stable project decisions.

---

## 51. Documentation Accuracy

Documentation and code must agree.

If they conflict, the task is not complete.

When a legitimate implementation decision changes a documented rule:

```text
update code
+
update documentation
```

in the same logical development step.

---

## 52. Comments

Code comments should explain:

```text
why
constraints
non-obvious domain decisions
```

not restate obvious code.

Avoid:

```ts
// increment quantity
quantity += 1;
```

Prefer comments only where future readers would otherwise misunderstand intent.

---

## 53. Naming

Before completion, review important names.

Names should communicate domain intent.

Prefer:

```text
buildAppointmentTimeline
detectConflicts
getOccupiedRanges
calculateCurrentStock
```

Avoid:

```text
process
handler
helper
thing
data
manager
```

unless context makes the meaning genuinely clear.

---

## 54. File Placement

Before completing a task, verify new files are in the correct architectural location.

Ask:

```text
Is this domain logic?
Is this feature logic?
Is this reusable UI?
Is this technical shared code?
Is this app composition?
```

Do not leave incorrectly placed files simply because the feature works.

---

## 55. No Premature Abstraction

A task should not introduce generic abstractions without demonstrated value.

Avoid creating:

```text
BaseRepository
GenericServiceManager
UniversalEntityFactory
AbstractFeatureHandler
```

before repeated use cases justify them.

Souris favors direct, readable code.

---

## 56. No Hidden Business Logic in UI

React components must not become the canonical location for business rules.

Examples that belong outside UI components include:

```text
conflict detection
stock calculation
sale totals
visit frequency
appointment timeline calculation
```

A UI task is not architecturally complete if it introduces duplicate business logic.

---

## 57. Agent Verification

An agent must not claim completion solely because it edited the requested files.

Before reporting completion, the agent must perform the checks it is capable of performing.

Examples:

```text
inspect diff
run tests
run lint
run build
inspect browser
compare screenshot
```

depending on the task.

---

## 58. Agent Reporting

At the end of an implementation step, an agent should clearly state:

```text
what changed
what was verified
whether tests passed
whether build passed
any remaining limitation
exact commit message to use
```

Do not hide failures behind a generic success statement.

---

## 59. Git Review

Before commit:

```bash
git status
```

must be inspected.

Relevant diffs should be reviewed.

For the current task, stage only the files belonging to that task.

---

## 60. Commit

Each completed Souris project step receives a Conventional Commit with the project emoji convention.

Example:

```text
feat(scheduling): ✨ add appointment timeline engine
```

Git conventions are defined in:

```text
docs/development/git.md
```

---

## 61. Push

A Souris phase is not considered fully complete until the commit is pushed to the remote repository.

Expected:

```bash
git push
```

---

## 62. Clean Repository

After the push:

```bash
git status
```

should normally report:

```text
nothing to commit, working tree clean
```

The next phase should start from this clean state.

---

## 63. Documentation-Only Task

For a documentation-only phase, completion generally requires:

```text
document complete
document internally consistent
references to existing project paths correct
git diff reviewed
commit created
commit pushed
working tree clean
```

Application tests are not required unless code was also modified.

---

## 64. Pure Domain Task

For a pure domain implementation, completion generally requires:

```text
business rule implemented
relevant edge cases implemented
unit tests added
tests pass
TypeScript passes
lint passes
build passes when applicable
no framework dependency introduced
documentation remains accurate
commit pushed
```

---

## 65. UI Component Task

For a UI component, completion generally requires:

```text
component implemented
interactive states work
component uses design tokens
relevant component tests pass
browser inspected
reference compared when available
responsive behavior checked
accessibility checked
console clean
commit pushed
```

---

## 66. Full Feature Task

For a complete feature, completion may require:

```text
domain behavior
feature integration
persistence
UI
validation
loading state
error state
responsive layouts
tests
visual verification
documentation
commit
push
```

Only requirements relevant to that feature should be included.

---

## 67. Bug Fix Task

A bug fix is complete when:

```text
root cause understood
bug reproduced
behavior corrected
regression test added when practical
related scenarios still pass
no unrelated behavior changed
commit pushed
```

Do not patch only the visible symptom if the underlying domain rule remains wrong.

---

## 68. Refactor Task

A refactor is complete when:

```text
behavior intentionally unchanged
tests still pass
architecture is clearer
unnecessary old code removed
no duplicate path remains accidentally
```

A refactor must not quietly introduce new business behavior.

---

## 69. Design Task

A design-system or visual-reference task is complete when:

```text
visual decision is explicit
reference files are saved
tokens or documentation updated when relevant
desktop/mobile intent is clear
files are committed
files are pushed
```

Implementation may occur in a later phase.

---

## 70. Database Task

When database work begins, completion must eventually include:

```text
schema change
migration
constraints
indexes where justified
authorization policies
generated types when used
integration verification
documentation when architecture changes
```

Manual production-only database changes are not sufficient.

Schema evolution must remain reproducible.

---

## 71. Migration Task

A data migration is complete when:

```text
source understood
mapping defined
migration repeatability considered
duplicate behavior considered
result validated
failure behavior understood
historical data preserved
```

For important imports, counts or representative records should be verified.

---

## 72. PWA Task

A PWA-related feature is complete only when relevant behavior is verified in an appropriate environment.

Potential checks include:

```text
manifest
icons
installation
standalone mode
service worker
update behavior
offline behavior when implemented
```

Do not claim offline support merely because the application is installable.

---

## 73. Authentication Task

Authentication work is complete only when relevant flows work:

```text
login
invalid login
protected route
authenticated route
logout
session behavior
```

Authorization of business data is a separate requirement and must not be assumed from authentication alone.

---

## 74. Definition of Done Does Not Mean Perfect Forever

A feature can be done for its current scope while still having future improvements.

For example:

```text
V1 product inventory
```

may be complete without:

```text
supplier management
purchase orders
multi-location stock
```

because those features are explicitly outside scope.

Done means the current requirement is complete, verified, and clean.

It does not mean every imaginable future feature exists.

---

## 75. Final Rule

A Souris task is done when a future developer can safely continue from it.

That means the project should be:

```text
correct
understandable
tested appropriately
visually verified when relevant
documented when relevant
committed
pushed
clean
```

The next phase must begin from a stable state, not from unfinished work disguised as progress.
