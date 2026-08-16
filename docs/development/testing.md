# Souris — Testing Strategy

## 1. Purpose

This document defines the testing strategy of Souris.

It is the canonical reference for:

- unit tests;
- domain tests;
- component tests;
- integration tests;
- end-to-end tests;
- visual regression tests;
- responsive verification;
- accessibility checks;
- testing priorities;
- testing boundaries;
- testing requirements before commits.

The goal is not to maximize test count.

The goal is to protect the business-critical behavior of Souris and prevent regressions in areas that matter.

---

## 2. Testing Principles

Souris follows these principles:

1. Test business rules independently from React.
2. Test critical behavior before visual polish.
3. Test user-visible workflows at the appropriate level.
4. Avoid duplicating the same assertion across several test layers without reason.
5. Prefer deterministic tests.
6. Avoid tests coupled to implementation details.
7. Visual fidelity must be verified intentionally.
8. Mobile, tablet, and desktop must all be tested where relevant.
9. A passing build is not sufficient proof of correctness.
10. Scheduling correctness has the highest testing priority.

---

## 3. Testing Pyramid

The preferred testing balance is:

```text
Many
↓
Domain / unit tests

Moderate
↓
Component / integration tests

Few but important
↓
End-to-end tests

Targeted
↓
Visual regression tests
```

Souris should not rely primarily on end-to-end tests.

Most business rules should be validated at the domain level because those tests are:

- faster;
- easier to reason about;
- easier to debug;
- independent from UI rendering.

---

## 4. Domain Tests

Domain tests validate pure business logic.

They live beside the domain they test.

Example:

```text
src/domain/appointments/__tests__/
```

Potential files:

```text
buildTimeline.test.ts
detectConflicts.test.ts
getFreeRanges.test.ts
calculateAppointmentTotal.test.ts
```

Domain tests must not require:

```text
React
browser
Next.js
Supabase
network requests
```

---

## 5. Scheduling Tests

Scheduling is the most business-critical part of Souris.

The scheduling engine must receive extensive automated coverage before production UI depends on it.

At minimum, tests must cover:

```text
simple service
single technique
processing time
appointment end
staff occupied duration
processing duration
valid overlapping appointments
invalid overlapping occupied phases
multiple clients in processing time
future conflict after valid initial phase
service reordering
duration overrides
price overrides
appointment total
boundary-touching appointments
free-range calculation
occupied-range calculation
```

---

## 6. Scheduling Test Example

Given:

```text
Lynda

09:00 → 09:15
Application
occupied

09:15 → 09:50
Processing
available

09:50 → 10:00
Gloss
occupied
```

And:

```text
Sofia

09:15 → 09:45
Blow-dry
occupied
```

Expected result:

```text
No conflict
```

because the occupied phases do not overlap.

---

## 7. Scheduling Conflict Example

Given:

```text
Lynda

09:50 → 10:00
occupied
```

And:

```text
Sofia

09:30 → 10:00
occupied
```

Expected conflict:

```text
09:50 → 10:00
```

Tests should verify the actual conflicting interval, not only a boolean.

---

## 8. Boundary Rule Tests

Two occupied intervals touching exactly at the same boundary are valid.

Example:

```text
Appointment A
09:00 → 09:30

Appointment B
09:30 → 10:00
```

Expected:

```text
No conflict
```

Scheduling logic conceptually follows:

```text
[start, end)
```

semantics.

---

## 9. Reordering Tests

Appointment service order affects the entire generated timeline.

Tests must verify that reordering:

```text
Root color
Gloss
Treatment
Cut
```

to:

```text
Root color
Gloss
Cut
Treatment
```

recalculates all subsequent phase start and end times.

No old absolute phase position should survive the reorder.

---

## 10. Future-Phase Conflict Tests

A technique may start during a free period but still create a later conflict.

Tests must validate the complete generated appointment timeline.

Do not only test whether the first occupied phase fits.

Example:

```text
New technique

09:15 → 09:30
Application
occupied

09:30 → 10:05
Processing
available

10:05 → 10:15
Finishing phase
occupied
```

If another appointment requires the professional at:

```text
10:05 → 10:20
```

the new appointment is not conflict-free.

---

## 11. Product Domain Tests

Product and inventory tests should cover:

```text
initial stock
restock
sale decrement
loss
positive adjustment
negative adjustment
current stock
low-stock threshold
out-of-stock state
invalid movement quantity
negative stock prevention
```

Stock behavior should be tested independently from UI.

---

## 12. Stock History Tests

Given:

```text
INITIAL_STOCK +10
SALE           -1
SALE           -1
RESTOCK        +6
LOSS           -1
```

Expected current stock:

```text
13
```

Tests must verify calculations based on movement history.

---

## 13. Sales Tests

Sales tests should cover:

```text
single-item total
multiple-items total
multiple quantity
empty-sale rejection
invalid quantity
negative price rejection
draft sale
completed sale
cancelled sale
product price snapshot
anonymous sale
client-linked sale
appointment-linked sale
```

---

## 14. Client Domain Tests

Client-domain tests should cover derived values such as:

```text
visit count
last visit
next appointment
visit frequency
total spent
product purchase history
```

Cancelled appointments must not count as completed visits.

Draft or cancelled sales must not count toward completed spending.

---

## 15. Derived Data Tests

Derived values should be tested from source records.

Example:

```text
Completed appointments:
3

Cancelled appointments:
1

Expected visit count:
3
```

Do not test a manually stored derived field if the domain is designed to calculate it.

---

## 16. Component Tests

Component tests validate interactive UI behavior.

They should focus on user-observable behavior.

Examples:

```text
button opens appointment editor
processing block displays available duration
drag handle is available
stock badge displays low-stock state
form validation message appears
```

Avoid testing internal implementation details.

---

## 17. Component Test Location

Component tests should normally be colocated with the relevant feature.

Example:

```text
src/features/appointments/__tests__/AppointmentCard.test.tsx
```

Do not create one giant root-level unit-test folder.

---

## 18. What Component Tests Should Not Do

Avoid tests that assert:

```text
internal state variable values
specific hook implementation
private helper calls
exact DOM structure without user value
```

Prefer testing:

```text
what the user sees
what the user can click
what changes after interaction
```

---

## 19. Integration Tests

Integration tests validate several application pieces working together.

Examples:

```text
appointment form + scheduling domain
sale completion + inventory logic
client profile + historical records
product scanner result + sale draft
```

Integration tests are appropriate when mocking every internal boundary would make the test less meaningful.

---

## 20. Persistence Integration Tests

When Supabase is introduced, persistence behavior should be tested separately from pure domain behavior.

Potential areas include:

```text
business isolation
appointment persistence
stock movement persistence
sale transaction integrity
client photo authorization
```

Do not turn pure domain tests into database tests.

---

## 21. End-to-End Tests

End-to-end tests validate complete user workflows through the application.

They should be limited to high-value paths.

Potential scenarios include:

```text
login
create client
create simple appointment
create technique appointment
create overlapping appointment during processing time
reorder appointment services
create product
scan known product
complete product sale
verify stock decrement
```

Do not use E2E tests to exhaustively test domain edge cases.

---

## 22. E2E Tooling

The intended browser testing tool is:

```text
Playwright
```

It will later be configured for:

```text
browser interaction
responsive testing
screenshots
end-to-end workflows
visual regression
```

Do not install or configure it before the relevant project phase.

---

## 23. Visual Regression Testing

Visual fidelity is a product requirement.

Approved references live in:

```text
docs/design/references/
```

Visual regression tests should eventually cover important screens such as:

```text
login
onboarding
agenda mobile
agenda tablet
agenda desktop
clients
products mobile
products desktop
```

---

## 24. Pixel-Perfect Verification

Pixel-perfect does not mean every browser must produce mathematically identical raster output.

It means the implementation must intentionally match the approved:

```text
layout
spacing
typography
colors
radii
visual hierarchy
component proportions
responsive behavior
```

Screenshots and diffs are verification tools.

They do not replace visual judgment.

---

## 25. Stable Visual Environment

Visual snapshots must be generated in a controlled environment.

Differences in:

```text
operating system
fonts
browser version
device scale factor
rendering engine
```

can affect screenshots.

The project should define one canonical visual-regression environment.

The initial reference browser should be:

```text
Chromium
```

---

## 26. Reference Viewports

Initial visual verification should prioritize:

```text
Mobile
390 × 844

Large mobile
430 × 932

Tablet
768 × 1024

Desktop
1440 × 1000
```

These values may evolve when the responsive specification is finalized.

---

## 27. Responsive Testing

Every important UI feature must be validated at the viewport categories it affects.

A mobile-first feature is not complete if its tablet or desktop layout is broken.

Responsive verification should include:

```text
mobile
tablet
desktop
```

when applicable.

---

## 28. Agenda Responsive Testing

The agenda requires particular attention.

Testing and visual review must cover:

```text
single appointment
processing time
overlapping appointment
multiple simultaneous clients
long appointment
empty time range
mobile lane behavior
tablet behavior
desktop lane behavior
```

Desktop must not simply stretch mobile cards.

---

## 29. Motion Testing

Animations should primarily be tested for final behavior, not exact frame-by-frame output.

Verify that:

```text
interaction remains usable
layout reaches the correct final state
drag and drop changes order correctly
reduced-motion preference is respected
animation does not unnecessarily block input
```

Avoid fragile tests tied to exact animation timing.

---

## 30. Reduced Motion

Souris must respect:

```text
prefers-reduced-motion
```

Critical interaction must remain understandable without decorative animation.

Important reduced-motion states should be tested when the motion system is implemented.

---

## 31. Accessibility Testing

Accessibility is part of verification.

Important checks include:

```text
keyboard navigation
visible focus states
button labels
form labels
dialog behavior
color contrast
touch target size
non-color status indicators
```

Automated checks may assist, but they do not replace manual review.

---

## 32. Color Independence

Important business states must not rely only on color.

Example:

A processing-time block should not only appear in a different color.

It should also contain explicit information such as:

```text
Temps de pose
35 min disponibles
```

Tests should verify accessible text or semantics where appropriate.

---

## 33. Touch Targets

Interactive mobile controls should provide comfortable touch targets.

The design target is approximately:

```text
44 × 44 px minimum
```

where practical.

Visual size and interactive hit area do not necessarily need to be identical.

---

## 34. Test Data

Test data must be explicit and understandable.

Prefer names and scenarios that communicate the business case.

Example:

```text
Lynda — Root color
Sofia — Blow-dry
```

is more useful in scheduling tests than:

```text
appointment1
appointment2
```

Fixtures should make failures easy to understand.

---

## 35. Deterministic Time

Tests involving time must avoid uncontrolled dependence on the real current time.

Use explicit dates and times.

Avoid tests whose outcome changes depending on:

```text
current day
current timezone
machine locale
current clock
```

unless the test intentionally verifies those concerns.

---

## 36. Locale Independence

Business calculations must not depend on localized display strings.

Tests should operate on canonical values.

Presentation tests may verify French formatting separately.

Example:

Domain:

```text
2026-08-16
```

Presentation:

```text
16 août 2026
```

---

## 37. No Real Network in Unit Tests

Unit tests must not call real external services.

Do not depend on:

```text
Supabase production
external APIs
internet access
remote storage
```

Tests requiring persistence should use a controlled test environment when infrastructure is introduced.

---

## 38. Mocking Strategy

Mock only boundaries that need to be isolated.

Avoid mocking pure domain functions merely because they are dependencies.

Prefer using real domain logic inside feature tests when practical.

Over-mocking can make tests pass while real behavior is broken.

---

## 39. Test Naming

Test names should describe business behavior.

Prefer:

```text
allows a blow-dry during a root-color processing phase
```

over:

```text
test overlap case 2
```

Prefer:

```text
rejects a sale when requested quantity exceeds current stock
```

over:

```text
stock test
```

---

## 40. Regression Tests

Every meaningful bug fix should receive a regression test when the bug can reasonably be automated.

Typical workflow:

```text
bug discovered
↓
failing test added
↓
bug fixed
↓
test passes
```

This is especially important for scheduling and inventory defects.

---

## 41. Testing a Bug Fix

Example:

Bug:

```text
Appointment starting exactly when another occupied phase ends
is incorrectly reported as conflicting.
```

Regression test:

```text
09:00 → 09:30
09:30 → 10:00

Expected:
No conflict
```

The fix is not considered robust until the case is covered.

---

## 42. Coverage

Code coverage may be measured later.

Coverage percentage is not a project goal by itself.

A high percentage can still miss important business scenarios.

Testing priority is:

```text
critical business behavior
meaningful edge cases
user workflows
regression protection
```

not arbitrary percentage targets.

---

## 43. Critical Domain Coverage

The scheduling engine should receive particularly high behavioral coverage.

It is acceptable for simple presentational code to receive less unit coverage when visual and integration verification provide better value.

Testing effort should follow risk.

---

## 44. Build Verification

Before significant production-code commits, the project should eventually run:

```text
lint
tests
build
```

The exact commands will be established as tooling is installed.

Do not claim a production implementation is complete when the build is failing.

---

## 45. Type Safety

TypeScript errors count as failed verification.

Tests are not a substitute for type checking.

Production work must maintain a clean TypeScript state.

---

## 46. Linting

Linting is part of development verification.

Lint rules should catch real maintainability and correctness issues.

Do not disable lint rules globally merely to silence inconvenient warnings.

Exceptions should be deliberate and local.

---

## 47. Visual Review Before Commit

For UI work, the developer or agent must inspect the rendered result before committing.

A component compiling successfully does not mean it matches the design.

The workflow should eventually include:

```text
run application
open target viewport
capture screenshot
compare with reference
correct differences
repeat
```

---

## 48. Visual Source of Truth

Approved design references are stored in:

```text
docs/design/references/
```

An implementation should not drift from those references because an agent prefers another design pattern.

Intentional design changes require updating the approved reference or design documentation first.

---

## 49. Browser Testing by Agents

Coding agents may later use browser automation to inspect the running application.

Agents should be able to:

```text
open localhost
navigate
click
drag
enter form values
change viewport
capture screenshots
inspect final states
```

Browser access is especially important for pixel-perfect work.

---

## 50. Test Isolation

Tests must clean up their own state where relevant.

One test must not depend on another test having run first.

Order-dependent tests are unacceptable unless the test runner explicitly models one coherent scenario.

---

## 51. Database Test Isolation

When database tests are introduced, each test or test suite must have predictable data.

Avoid tests that depend on the developer's personal local database state.

A controlled local/test environment should be used.

---

## 52. Authentication Tests

When authentication is implemented, testing should cover at least:

```text
valid login
invalid login
unauthenticated protected route
authenticated protected route
logout
```

Business data isolation should be tested at the persistence/security level.

---

## 53. Product Scanner Tests

Scanner-specific tests should separate:

```text
barcode business behavior
camera/browser integration
```

The domain does not need a real camera.

Feature or E2E tests can verify scanner workflows.

Important cases include:

```text
known barcode
unknown barcode
repeated scan
manual fallback
```

---

## 54. Client Tests

Important client UI flows may eventually include:

```text
search client
create client during appointment
open client profile
view appointment history
view technical notes
view before/after photos
view purchased products
```

These should be tested at the level providing the best value.

---

## 55. Appointment Editor Tests

The appointment editor is a high-value integration surface.

Important behaviors include:

```text
select client
add service
remove service
reorder service
change duration
change processing time
change price
recalculate timeline
show total
show conflict
save valid appointment
```

Not every permutation needs an E2E test.

Domain edge cases belong in domain tests.

---

## 56. Drag-and-Drop Testing

Drag-and-drop behavior should be verified at several levels.

Domain:

```text
new order recalculates timeline correctly
```

Component/integration:

```text
reordering updates visible service order
```

E2E when justified:

```text
real drag gesture successfully changes order
```

Do not put scheduling calculations inside drag-and-drop tests.

---

## 57. Definition of Test Completion

A testing task is complete when:

```text
required scenarios are covered
tests are deterministic
tests pass
failures are understandable
tests protect behavior rather than implementation details
```

A test file existing is not enough.

---

## 58. Commit Discipline

Tests created as part of a feature may be committed with that feature.

Tests added independently may use:

```text
test(scope): ✅ description
```

Examples:

```text
test(scheduling): ✅ cover processing-time overlaps

test(products): ✅ cover stock movement calculations
```

---

## 59. Current Tooling State

At the current foundation stage, the project does not yet need all testing dependencies installed.

Tooling should be introduced immediately before it becomes useful.

Expected future tooling includes:

```text
Vitest
React Testing Library
Playwright
```

Additional tooling should only be added when justified.

---

## 60. Initial Implementation Order

Testing infrastructure should be introduced in this order:

```text
1. Domain test runner
2. Scheduling-engine tests
3. Product/client/sales domain tests as implemented
4. Component testing
5. Browser/E2E testing
6. Visual regression
7. Accessibility automation where useful
```

This order prioritizes Souris's highest-risk business logic first.

---

## 61. Final Testing Rule

Souris testing exists to protect user trust.

The most important failures are not cosmetic implementation details.

They are errors such as:

```text
double-booking the professional
missing a future scheduling conflict
incorrect stock after a sale
incorrect historical price
incorrect client history
broken mobile or desktop workflow
```

Testing effort must prioritize these risks.

A feature is not complete merely because it renders.

It is complete when its important behavior is verified at the appropriate level.
