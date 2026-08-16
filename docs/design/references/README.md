# Souris — Visual References

## 1. Purpose

This directory contains the approved visual references for Souris.

It is the canonical visual source of truth for implementation.

These references define the intended direction for:

- layout;
- spacing;
- proportions;
- typography hierarchy;
- color usage;
- card geometry;
- navigation;
- responsive composition;
- brand expression;
- overall visual tone.

The goal is to prevent the implementation from drifting into a generic interpretation of the product.

When a reference exists for a screen, implementation must be compared against it.

---

## 2. Source of Truth

The design hierarchy is:

```text
Approved visual references
↓
Design documentation
↓
Design tokens
↓
Shared UI primitives
↓
Feature components
↓
Final screens
```

Visual references take precedence when they explicitly show a design decision.

Documentation explains the stable rules behind those references.

Implementation must not reinterpret the visual direction from scratch.

---

## 3. Current Reference Set

The initial reference set is expected to include:

```text
agenda-mobile.png
agenda-desktop.png

login-onboarding.png

clients.png

products-mobile.png
products-desktop.png

brand.png
```

Only files that actually exist in this directory should be treated as available implementation references.

Do not assume an asset exists merely because it appears in this list.

---

## 4. Agenda Mobile

Expected file:

```text
agenda-mobile.png
```

This reference defines the primary mobile agenda direction.

It should guide:

- day hierarchy;
- time-axis treatment;
- appointment cards;
- overlapping appointments;
- processing-time visualization;
- available periods;
- mobile spacing;
- mobile navigation;
- card proportions;
- typography hierarchy.

The agenda is one of the most important Souris screens.

Implementation should preserve the distinction between:

```text
client presence
staff occupation
processing time
```

as defined in:

```text
docs/domain/appointments.md
```

---

## 5. Agenda Desktop

Expected file:

```text
agenda-desktop.png
```

This reference defines the intentional desktop agenda direction.

Desktop must not be implemented as a stretched version of:

```text
agenda-mobile.png
```

The desktop reference should guide:

- navigation structure;
- timeline width;
- use of horizontal space;
- appointment lanes;
- contextual panels;
- information density;
- page hierarchy;
- desktop card proportions.

---

## 6. Agenda Consistency

Mobile and desktop agenda references represent the same product.

They may use different compositions while preserving the same:

```text
brand
color semantics
typography hierarchy
appointment states
processing-time meaning
business rules
```

Responsive implementation must preserve functional equivalence without forcing identical layouts.

---

## 7. Login and Onboarding

Expected file:

```text
login-onboarding.png
```

This reference defines the initial authentication and onboarding direction.

It should guide:

- logo treatment;
- editorial typography;
- brand color usage;
- onboarding composition;
- illustration style;
- form hierarchy;
- primary actions;
- page transitions;
- overall first impression.

Login and onboarding may be more expressive than operational screens.

They must still feel like the same Souris product.

---

## 8. Clients

Expected file:

```text
clients.png
```

This reference defines the intended direction for client-related screens.

It may guide:

- client list;
- client cards;
- search;
- client profile;
- client metrics;
- appointment history;
- technical information;
- before/after imagery;
- content hierarchy.

The client experience should feel like a professional memory of the customer relationship rather than a simple contact database.

---

## 9. Products Mobile

Expected file:

```text
products-mobile.png
```

This reference defines the mobile product and inventory direction.

It should guide:

- product cards;
- product imagery;
- stock display;
- price hierarchy;
- low-stock state;
- search;
- scanning entry points;
- mobile spacing;
- retail workflow.

The interface must remain practical for rapid use inside the salon.

---

## 10. Products Desktop

Expected file:

```text
products-desktop.png
```

This reference defines the desktop product and inventory direction.

It should guide:

- grid or list density;
- product-card proportions;
- inventory hierarchy;
- navigation;
- use of horizontal space;
- desktop retail workflow.

As with the agenda, desktop must not simply enlarge the mobile design.

---

## 11. Brand Reference

Expected file:

```text
brand.png
```

This file represents a visual brand-direction board.

It may define:

- palette;
- logo direction;
- wordmark style;
- mouse/smile concept;
- typography mood;
- rounded geometry;
- visual personality.

It is not automatically a production-ready logo asset.

Do not use:

```text
brand.png
```

as a substitute for final SVG logo assets.

---

## 12. Final Logo Assets

The final logo system should eventually be exported separately.

Expected production assets include:

```text
logo-primary.svg
logo-wordmark.svg
logo-symbol.svg
logo-lockup-stacked.svg
```

Additional app-icon assets may be introduced later.

These files should preserve the same visual identity represented by the approved brand direction.

---

## 13. Reference File Naming

Reference filenames should remain:

```text
lowercase
descriptive
hyphen-separated
```

Examples:

```text
agenda-mobile.png
agenda-desktop.png
products-mobile.png
```

Avoid names such as:

```text
Screenshot 2026-08-16 at 15.32.12.png
final-final-v2.png
design3.png
```

The repository should make the purpose of every reference obvious.

---

## 14. Reference Assets Are Versioned

Approved visual references belong in Git.

When a reference changes intentionally, the change must be committed.

This allows the project history to answer:

```text
What design was approved at this point?

When did the design direction change?

Which implementation was built against which reference?
```

---

## 15. Updating a Reference

Do not silently replace a visual reference while implementing a feature.

If a reference needs to change:

1. make the design decision intentionally;
2. update the relevant reference;
3. update design documentation when a stable rule changes;
4. commit the design change;
5. then update implementation.

This prevents implementation convenience from becoming accidental design direction.

---

## 16. Reference vs Inspiration

There is an important distinction between:

```text
reference
```

and:

```text
inspiration
```

Approved files in this directory are implementation references.

External websites or visual examples such as:

```text
Pomegranate
Columbia 100
```

are broader inspiration.

Implementation should not copy external products literally.

Souris must retain its own identity.

---

## 17. Pixel-Perfect Interpretation

Pixel-perfect implementation means matching the intentional properties shown by the reference.

These include:

```text
layout
spacing
typography hierarchy
alignment
radii
card geometry
color relationships
visual density
responsive composition
```

It does not mean creating brittle CSS that only works at one exact screenshot size.

---

## 18. Responsive References

A screenshot represents one viewport state.

Implementation must preserve the design intent between reference viewport sizes.

For example:

```text
390 px
```

and:

```text
430 px
```

may both use the mobile composition while allowing fluid spacing and sizing.

Do not hard-code layouts to one screenshot width.

---

## 19. Reference Viewports

The initial target viewports are documented in:

```text
docs/design/responsive.md
```

Primary verification sizes are:

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

A reference screenshot should ideally document or imply its intended viewport.

---

## 20. Missing Tablet References

The initial reference set may not include a dedicated tablet screenshot for every screen.

When no tablet reference exists:

```text
mobile reference
+
desktop reference
+
responsive rules
```

must be used together to derive an intentional tablet composition.

Do not simply allow browser interpolation to decide the design accidentally.

---

## 21. Design Tokens

Visual references inform the production design tokens.

Examples include:

```text
colors
spacing
radii
typography
shadows
```

Once a value becomes a stable reusable token, components should consume that token rather than repeatedly sampling the screenshot.

---

## 22. Color Verification

Reference colors should be verified before final production tokens are frozen.

Approximate values documented in:

```text
docs/design/design-system.md
```

represent the current direction.

The final implementation should compare them with approved visual material.

Do not continually introduce slightly different shades by visual guesswork.

---

## 23. Typography Verification

Typography should be verified for:

```text
font family
font weight
font size
line height
letter spacing
line wrapping
```

A layout can feel significantly different from its reference even when spacing is correct if typography is wrong.

---

## 24. Spacing Verification

Compare:

```text
outer page padding
section spacing
card padding
element gaps
navigation spacing
```

Do not focus only on large layout geometry.

Small repeated spacing differences can cause significant visual drift.

---

## 25. Radius Verification

The rounded Souris identity depends on consistent geometry.

Compare:

```text
card radius
button radius
input radius
badge radius
panel radius
```

Avoid approximating every radius independently.

---

## 26. Card Verification

When comparing a card against a reference, verify:

```text
width
height
padding
surface
border
radius
shadow
text hierarchy
internal alignment
status treatment
```

Do not judge similarity only from color.

---

## 27. Agenda Verification

Agenda comparison requires both visual and business verification.

Check:

```text
phase position
appointment duration
processing duration
overlap
lane placement
client label
time alignment
available region
```

A visually similar agenda with incorrect scheduling geometry is not acceptable.

---

## 28. Processing-Time Verification

Processing time is a defining Souris interaction.

The implementation must preserve the visual distinction shown by references while also communicating explicit meaning.

Processing time should never rely only on color.

The UI should expose information such as:

```text
Temps de pose
35 min disponibles
```

when appropriate.

---

## 29. Desktop Verification

Desktop reference review must include:

```text
use of available width
navigation proportions
content density
panel placement
card width
alignment
overall balance
```

Avoid judging desktop only by whether all mobile content is present.

---

## 30. Mobile Verification

Mobile reference review must include:

```text
touch-target comfort
one-handed reachability
navigation
vertical rhythm
content visibility
card density
scroll behavior
```

Visual fidelity must not reduce practical mobile usability.

---

## 31. Content Differences

Reference screenshots may contain illustrative data.

Implementation test data does not need to reproduce every name or value exactly unless the content itself is important to the visual comparison.

However, use realistic content lengths.

Do not compare a layout using:

```text
Ana
```

when the actual reference contains a much longer French client or service name.

---

## 32. Stable Fixtures

When visual regression testing is introduced, stable fixtures should reproduce representative reference states.

Examples:

```text
Lynda — root color
Sofia — blow-dry
processing period
valid overlapping appointments
```

Stable data prevents unnecessary screenshot differences.

---

## 33. Browser Verification

UI implementation should eventually be inspected through a real browser.

The recommended visual workflow is:

```text
implement
↓
run application
↓
open target viewport
↓
capture screenshot
↓
compare with reference
↓
adjust
↓
repeat
```

Code inspection alone is insufficient for pixel-sensitive UI work.

---

## 34. Automated Visual Regression

Playwright may later capture screenshots at canonical viewport sizes.

Visual regression should protect stable UI after the initial reference matching is complete.

The testing strategy is documented in:

```text
docs/development/testing.md
```

---

## 35. Screenshot Stability

Visual test screenshots should use a stable environment.

Where possible, control:

```text
browser
viewport
fonts
animations
fixture data
```

Animations may need to be completed or disabled before capture.

---

## 36. Motion References

Static screenshots cannot fully describe animation.

Motion behavior is defined by:

```text
docs/design/motion.md
```

Animations should support the visual compositions represented by these references without changing their final states.

---

## 37. Reference Ownership

Reference files represent approved product decisions.

They should not be modified by an implementation agent merely to make a visual test pass.

If implementation and reference disagree, first determine whether:

```text
implementation is wrong
or
design decision intentionally changed
```

Do not automatically change the reference.

---

## 38. New Screen References

When a major new screen requires a distinct visual direction, a reference may be created before implementation.

Examples could include:

```text
appointment-editor-mobile.png
appointment-editor-desktop.png
client-profile-mobile.png
scanner-mobile.png
```

Do not create reference screenshots for every tiny component.

Use them where they meaningfully guide product design.

---

## 39. Reference Granularity

Prefer references that show meaningful screen context.

A button rarely needs its own image reference.

A complete agenda screen often does.

Reusable primitive specifications belong primarily in:

```text
docs/design/design-system.md
```

---

## 40. Reference Removal

Do not delete an approved reference merely because its implementation has been completed.

References remain useful for:

```text
future regression review
redesign comparison
agent context
historical decisions
```

Remove obsolete references only when they are explicitly superseded.

---

## 41. Superseded References

If a major redesign replaces an old reference, prefer a clear Git change rather than accumulating confusing variants such as:

```text
agenda-new.png
agenda-new2.png
agenda-final.png
agenda-final-real.png
```

The active canonical filename should remain stable where practical.

Git history already preserves previous versions.

---

## 42. No Production Dependency

Visual reference files are development assets.

Production application code must not depend on them.

Do not import files from:

```text
docs/design/references/
```

into the running application.

Production assets belong in the appropriate application asset location.

---

## 43. Brand Board vs Production Assets

A brand board exists to communicate direction.

Production assets exist to render the application.

Keep these responsibilities separate.

Example:

```text
docs/design/references/brand.png
```

is a reference.

A future:

```text
logo-symbol.svg
```

is an application asset.

---

## 44. Documentation Relationship

Reference files work together with:

```text
docs/design/design-system.md
docs/design/responsive.md
docs/design/motion.md
```

The reference answers:

```text
What should it look like?
```

The documentation answers:

```text
Why does it look this way?

How should the system behave in other contexts?
```

---

## 45. Architecture Relationship

Feature-specific reference interpretation belongs in the relevant feature.

Do not pollute the pure domain layer with:

```text
pixel coordinates
card colors
lane widths
image dimensions
responsive breakpoints
```

Architecture rules remain defined in:

```text
docs/architecture.md
```

---

## 46. Source Asset Quality

Reference files should retain enough resolution to support meaningful comparison.

Avoid repeatedly compressing or resizing reference assets until important details disappear.

At the same time, repository assets should remain reasonably sized.

---

## 47. Reference Metadata

If viewport or other context cannot be inferred from a filename, document it in this README or a future reference manifest.

Do not rely on personal memory to know how a screenshot was intended to be used.

---

## 48. Initial Reference Audit

Before production UI implementation begins, verify that the current reference directory actually contains the expected approved files.

Check:

```bash
find docs/design/references -maxdepth 1 -type f | sort
```

Missing assets should be identified explicitly.

Do not silently substitute new designs for missing references.

---

## 49. Current Expected Files

The initial design direction currently expects reference material corresponding to:

```text
Agenda — mobile

Agenda — desktop

Login / onboarding

Clients

Products — mobile

Products — desktop

Brand direction
```

The exact physical filenames should follow the naming convention defined above.

---

## 50. Future Reference Audit

Before implementing a reference-driven screen:

1. confirm the relevant file exists;
2. inspect it;
3. identify the intended viewport;
4. identify reusable design tokens;
5. identify screen-specific decisions;
6. implement;
7. compare visually.

Do not code from memory when a canonical reference exists.

---

## 51. No Guessing

If an important visual decision is not represented in:

```text
reference
design-system documentation
responsive documentation
motion documentation
```

do not invent a large new visual direction casually.

Use the existing Souris system and make the smallest coherent decision required.

Document stable new decisions when they become part of the product language.

---

## 52. Final Rule

The visual references are not decoration stored beside the project.

They are part of the Souris product specification.

Their role is to keep implementation aligned with the intended:

```text
identity
quality
layout
hierarchy
responsive behavior
```

The correct workflow is:

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

not:

```text
reference
↓
implement approximately
↓
forget the reference
```

Souris should remain visually coherent as the application grows, even when different screens are implemented at different times.
