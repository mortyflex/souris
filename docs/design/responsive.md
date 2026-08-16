# Souris — Responsive Design

## 1. Purpose

This document defines the responsive design rules of Souris.

It is the canonical reference for:

- mobile-first behavior;
- tablet layouts;
- desktop layouts;
- responsive navigation;
- content density;
- agenda adaptation;
- card behavior;
- drawers and panels;
- viewport-specific interaction;
- safe areas;
- responsive verification.

Souris is mobile-first, but it is not mobile-only.

The application must provide intentional experiences for:

```text
mobile
tablet
desktop
```

The desktop interface must not simply be a stretched mobile layout.

The tablet interface must not simply be a smaller desktop layout.

---

## 2. Core Principle

The responsive strategy follows one rule:

> **Adapt the composition, not only the dimensions.**

Responsive design in Souris is not limited to:

```text
smaller text
larger width
more padding
```

Different viewport categories may require changes in:

```text
navigation
layout
information density
panel placement
interaction patterns
agenda lanes
content hierarchy
```

---

## 3. Mobile First

Mobile is the first design target.

This reflects the expected real-world use of Souris by beauty professionals.

Typical mobile situations include:

```text
checking the next appointment
adding a client quickly
creating an appointment between services
checking a formula
scanning a product
recording a sale
checking stock
```

The mobile experience must prioritize speed and reachability.

---

## 4. Mobile Is Not a Reduced Desktop

Do not design desktop first and compress it into a narrow viewport.

Mobile screens should have their own intentional composition.

Potential mobile patterns include:

```text
bottom navigation
bottom sheets
full-screen editors
single-column flow
sticky primary actions
compact agenda
```

These patterns may differ from tablet and desktop.

---

## 5. Desktop Is Not a Stretched Mobile

Do not take a mobile card with:

```text
width: 100%
```

and simply allow it to become extremely wide.

Desktop should use additional space to improve the workflow.

Potential desktop adaptations include:

```text
persistent side navigation
multi-column composition
side panels
wider agenda
simultaneous context
less modal navigation
```

---

## 6. Tablet Is Intentional

Tablet is an important intermediate environment.

Beauty professionals may use tablets at a desk or reception area.

Tablet should receive deliberate design decisions rather than being treated as a breakpoint accident.

Potential tablet patterns include:

```text
wider agenda
two-column layouts
persistent secondary panels
adapted navigation
larger touch targets
```

---

## 7. Responsive Categories

The initial conceptual categories are:

```text
Mobile
< 768 px

Tablet
768 px → 1023 px

Desktop
≥ 1024 px
```

These values are implementation starting points.

They may be adjusted if real layouts require better transition points.

Do not force a layout to change at a breakpoint simply because a framework default exists.

Use content-driven responsive decisions.

---

## 8. Reference Viewports

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

Additional widths should be checked around important layout transitions.

---

## 9. Small Mobile

Souris must remain usable on narrower mobile screens.

Important checks include:

```text
320–360 px width
```

where practical.

Do not assume every phone is approximately 430 pixels wide.

Avoid layouts that require exact reference-device dimensions.

---

## 10. Fluid Width

Within each responsive category, layouts should remain fluid.

Avoid hard-coding full-screen compositions to one exact screenshot width.

Reference screenshots define visual intent.

Implementation must still behave correctly between reference sizes.

---

## 11. Content Width

Souris does not use one universal content maximum width.

Different screens have different spatial needs.

Examples:

```text
login
constrained editorial composition

client profile
moderately constrained content

agenda
wide operational workspace

products
responsive card/list workspace
```

Choose width according to the workflow.

---

## 12. Mobile Page Padding

Mobile pages should use consistent horizontal padding.

A practical initial direction is approximately:

```text
16–20 px
```

depending on the visual reference.

Do not allow unrelated screens to invent arbitrary page padding independently.

---

## 13. Tablet Page Padding

Tablet may increase outer spacing while preserving useful content width.

A practical starting direction is:

```text
24–32 px
```

depending on the screen.

Operational views may use more of the available width.

---

## 14. Desktop Page Padding

Desktop may use:

```text
32–48 px
```

or a layout-controlled equivalent.

Do not create excessive empty margins if the additional space can improve operational context.

---

## 15. Safe Areas

Mobile and installed PWA layouts must account for device safe areas where relevant.

Particular attention is required for:

```text
bottom navigation
fixed bottom actions
full-height onboarding
drawers
bottom sheets
```

Use environment safe-area values where necessary.

---

## 16. Viewport Height

Avoid assuming:

```text
100vh
```

always represents the actually visible mobile area.

Browser chrome and installed PWA environments can affect available height.

Prefer modern viewport units where appropriate, such as:

```text
dvh
svh
```

when they solve a real layout issue.

---

## 17. Navigation Strategy

Navigation may intentionally differ by viewport.

The navigation architecture should optimize reachability and available space.

Conceptual direction:

```text
Mobile
bottom navigation

Tablet
bottom navigation or compact side navigation depending on layout

Desktop
persistent side navigation
```

The exact implementation should follow approved visual references.

---

## 18. Mobile Navigation

Primary mobile navigation should remain easily reachable with one hand.

Potential primary destinations include:

```text
Agenda
Clients
Produits
```

Revente may exist as part of the product area or as a distinct destination depending on final information architecture.

Avoid overcrowding the bottom navigation.

---

## 19. Mobile Navigation Height

Bottom navigation must reserve enough space for:

```text
icon
label
touch target
safe area
```

Content must not disappear underneath it.

Scrollable pages require appropriate bottom padding.

---

## 20. Desktop Navigation

Desktop should use available width more effectively.

A persistent side navigation may expose:

```text
logo
primary navigation
secondary actions
profile or business settings
```

It should remain visually calm and not dominate the application.

---

## 21. Tablet Navigation

Tablet navigation should be selected according to usable content width.

Possible approaches include:

```text
compact sidebar
bottom navigation
collapsible rail
```

Do not force one tablet navigation model before screens are tested.

---

## 22. Primary Actions

The location of primary actions may change by viewport.

Example:

```text
Mobile
sticky bottom button

Desktop
button in page header
```

This is acceptable when the action remains easy to discover.

Responsive design should optimize interaction rather than force identical placement.

---

## 23. Mobile Sticky Actions

Sticky actions may be useful for:

```text
create appointment
save appointment
create client
complete sale
```

They must not cover content or conflict with bottom navigation.

Account for safe areas when appropriate.

---

## 24. Desktop Actions

Desktop actions may live in:

```text
page header
side panel
toolbar
context panel
```

Avoid duplicating the same primary action unnecessarily in several places.

---

## 25. Agenda Priority

The agenda is the most important responsive workspace in Souris.

Its layout must remain useful across all viewport sizes.

The responsive agenda must preserve:

```text
time
client identity
appointment phases
processing time
staff availability
overlap
conflicts
```

No responsive transformation may hide the core scheduling model.

---

## 26. Agenda Time Axis

The time axis must remain easy to scan.

On mobile, it may consume less horizontal space.

On desktop, it may be more visually explicit.

Time labels must remain aligned with appointment positions.

---

## 27. Mobile Agenda

The mobile agenda should prioritize:

```text
current day
fast vertical scanning
appointment readability
processing-time visibility
easy creation
```

A vertical day view is the default direction.

Appointment cards may use most of the available horizontal space.

---

## 28. Mobile Agenda Density

Do not make appointment cards so tall that only one item is visible at a time without need.

Do not make them so compressed that:

```text
client
time
service
processing status
```

become difficult to read.

Density must balance context and scanning speed.

---

## 29. Mobile Overlapping Appointments

Valid overlapping appointments must remain understandable on narrow screens.

Possible strategies include:

```text
side-by-side lanes when enough width exists
slightly offset cards
compact parallel columns
controlled horizontal allocation
```

Do not simply place one appointment completely on top of another.

---

## 30. Mobile Lane Width

When multiple agenda lanes are required, preserve enough width for meaningful content.

At very narrow widths, the presentation may reduce secondary information before reducing core readability.

Never hide:

```text
client identity
critical time information
processing state
conflict state
```

just to preserve decorative content.

---

## 31. Processing Time on Mobile

Processing time must remain visually explicit.

A mobile appointment may display something like:

```text
Temps de pose
35 min disponibles
```

The available portion must not disappear because the viewport is narrow.

---

## 32. Adding an Appointment From Free Time

Available agenda regions may eventually support contextual creation.

Example:

```text
35 min disponibles

+ Ajouter
```

Mobile interaction may use:

```text
tap
bottom sheet
full-screen appointment editor
```

depending on the final flow.

---

## 33. Tablet Agenda

Tablet provides enough width for richer appointment display.

Potential improvements include:

```text
wider appointment cards
clearer parallel lanes
persistent date navigation
secondary detail panel
```

The agenda should feel more spacious without becoming desktop-dependent.

---

## 34. Desktop Agenda

Desktop should provide the richest agenda workspace.

It may use:

```text
larger time grid
multiple appointment lanes
persistent controls
side detail panel
day navigation
quick actions
```

The goal is to use horizontal space to improve scheduling clarity.

---

## 35. Desktop Agenda Width

The agenda should not be constrained to a narrow centered column.

It is an operational workspace and should use a substantial portion of desktop width.

Additional width should improve:

```text
lane separation
service visibility
processing visibility
appointment comparison
```

---

## 36. Agenda Detail Panel

Desktop may allow an appointment to open in a side panel while the agenda remains visible.

This can reduce unnecessary context switching.

Example:

```text
Agenda
│
├── timeline
│
└── appointment detail panel
```

Mobile may instead use a full-screen editor or bottom sheet.

---

## 37. Agenda Day Navigation

Day navigation must adapt to available space.

Mobile may use:

```text
previous
today
next
compact date
```

Desktop may display:

```text
larger date context
calendar control
additional navigation
```

Do not overload mobile headers with desktop-level controls.

---

## 38. Agenda Horizontal Scrolling

Avoid horizontal scrolling as the default day-agenda interaction on mobile.

If horizontal scrolling becomes necessary for a specific multi-resource future mode, it must be intentional.

The initial single-staff agenda should primarily scroll vertically.

---

## 39. Appointment Editor

The appointment editor may change composition across devices.

Mobile direction:

```text
full-screen flow
single column
sticky save action
```

Desktop direction:

```text
panel
dialog
or multi-column editor
```

The underlying appointment draft remains the same.

---

## 40. Appointment Editor on Mobile

Mobile editing should prioritize sequential decision-making.

A possible order:

```text
client
services
service order
durations
timeline preview
price
notes
save
```

Avoid showing too many secondary controls simultaneously.

---

## 41. Appointment Editor on Desktop

Desktop may show several parts at once.

Example:

```text
left
service editor

right
live timeline preview
```

This allows the professional to understand scheduling consequences immediately.

---

## 42. Drag and Drop

Drag-and-drop service reordering must support both touch and pointer interaction.

Mobile:

```text
clear drag handle
comfortable touch target
vertical reordering
```

Desktop:

```text
pointer drag
keyboard support where practical
```

Do not rely on tiny handles.

---

## 43. Client List

The client list should adapt its density.

Mobile may prioritize:

```text
name
phone
last visit
```

Desktop may expose additional information such as:

```text
next appointment
visit count
total spent
```

when useful.

Do not overload mobile cards to match desktop information density.

---

## 44. Client Profile

Mobile client profiles should use a clear vertical hierarchy.

Potential sections:

```text
identity
next appointment
client metrics
history
technical notes
photos
products purchased
notes
```

---

## 45. Client Profile on Desktop

Desktop may use:

```text
main history column
+
secondary client summary column
```

For example:

```text
Left
appointment history
technical notes
photos

Right
identity
metrics
next appointment
notes
```

Do not simply make each mobile section full-width across the entire desktop screen.

---

## 46. Client Metrics

Metrics such as:

```text
visits
total spent
visit frequency
```

may appear as stacked cards on small mobile.

On larger widths, they may share a row.

The number of columns should follow available card width, not an arbitrary fixed grid.

---

## 47. Before / After Photos

Mobile may stack before/after photos vertically or use a compact two-column composition when readable.

Tablet and desktop should normally allow side-by-side comparison.

Labels:

```text
Avant
Après
```

must remain explicit.

---

## 48. Technical Notes

Technical notes should remain readable on all widths.

Do not compress formulas or protocols into narrow multi-column cards that make technical text difficult to scan.

Desktop may place note history beside appointment history when useful.

---

## 49. Product List

Products may use different representations by viewport.

Mobile:

```text
compact cards
or list cards
```

Desktop:

```text
larger grid
or richer inventory list
```

The representation should prioritize:

```text
product identification
stock
price
```

---

## 50. Product Grid

A product grid should use responsive columns based on minimum usable card width.

Avoid defining:

```text
mobile = 1
tablet = 2
desktop = 4
```

without checking actual card proportions.

Use a content-driven grid.

---

## 51. Product Images

Product images must not dominate narrow screens.

Image size should support identification while preserving room for:

```text
brand
name
stock
price
```

Desktop may use larger imagery when space allows.

---

## 52. Product Scanner

Barcode scanning is primarily a mobile-friendly workflow.

The mobile scanner may use a camera-oriented full-screen experience.

Desktop should provide an appropriate fallback such as:

```text
manual barcode entry
connected camera when available
product search
```

Do not assume every desktop has a convenient camera.

---

## 53. Sale Draft

Mobile sale flow should prioritize fast scanning and total visibility.

A possible layout:

```text
scanner / add product
sale lines
total
complete action
```

---

## 54. Sale Draft on Desktop

Desktop may display:

```text
product selection
+
current sale
```

side by side.

The transaction total and completion action should remain prominent.

---

## 55. Forms

Forms should normally be single-column on mobile.

Desktop may use multiple columns only when fields are logically related.

Good desktop pairing:

```text
first name | last name
```

Potentially poor pairing:

```text
long technical note | birthday
```

Layout must follow semantic relationships.

---

## 56. Form Width

Do not stretch text inputs across an enormous desktop screen.

Use reasonable field widths based on expected content.

For example:

```text
phone
date
price
duration
```

do not need the same width as:

```text
notes
technical formula
```

---

## 57. Bottom Sheets

Bottom sheets are a preferred mobile pattern for contextual selection.

Potential uses include:

```text
select client
select service
filters
quick actions
```

On desktop, the same interaction may become:

```text
popover
dropdown
side panel
dialog
```

depending on complexity.

---

## 58. Dialogs

Dialogs should fit within the current viewport.

On mobile, complex dialogs should often become full-screen or bottom-sheet experiences.

Avoid tiny desktop-style centered modals on narrow phones.

---

## 59. Side Panels

Side panels are useful on larger viewports when context should remain visible.

Potential uses include:

```text
appointment editor
client quick view
product detail
filters
```

They should not be forced into mobile layouts.

---

## 60. Tables

Avoid making dense tables the default representation for Souris.

If a desktop feature benefits from tabular presentation, ensure:

```text
important columns remain visible
mobile has an intentional alternative
horizontal scrolling is controlled
```

Do not shrink desktop tables until text becomes unreadable on mobile.

---

## 61. Filters

Mobile filters may open in:

```text
bottom sheet
drawer
```

Desktop filters may remain visible or use compact popovers.

Do not permanently consume large amounts of mobile screen space with secondary filters.

---

## 62. Search

Search inputs may adapt placement by viewport.

Mobile may use:

```text
full-width search
```

Desktop may integrate search into:

```text
header
toolbar
side panel
```

Search behavior must remain consistent even when placement changes.

---

## 63. Empty States

Empty states should adapt to viewport height and width.

Mobile empty states must not push the primary action below the fold without reason.

Desktop empty states should not become enormous simply because more space exists.

---

## 64. Onboarding

Onboarding may be more visually expressive than operational screens.

Mobile may use:

```text
full-screen steps
large illustration
single primary action
```

Desktop may use:

```text
split-screen editorial layout
illustration panel
form/content panel
```

Both should feel like the same product.

---

## 65. Login

Login should not simply place a mobile form in the center of a huge desktop screen without design intent.

Mobile may emphasize:

```text
logo
welcome copy
form
```

Desktop may use a split or editorial composition with brand visual content.

---

## 66. Header Behavior

Operational headers should remain compact on mobile.

Do not let page headers consume excessive vertical space.

Desktop may include:

```text
page title
date context
primary action
secondary controls
```

in one horizontal composition.

---

## 67. Typography

Typography may scale responsively, but not every text role needs dramatic changes.

Large display typography may respond significantly.

Operational text should remain relatively stable.

Example:

```text
body text
mobile and desktop
similar readable size

display heading
larger desktop scale allowed
```

---

## 68. Page Titles

Mobile page titles should remain strong without using excessive vertical space.

Desktop titles may become slightly larger and share a row with actions.

Avoid massive marketing-style typography on dense agenda screens.

---

## 69. Cards

Card composition may change by viewport.

Responsive behavior may include:

```text
stacking
changing internal columns
showing additional metadata
moving actions
```

Do not merely change card width.

---

## 70. Card Actions

Mobile card actions may be hidden behind:

```text
context menu
swipe action
detail screen
```

when appropriate.

Desktop may expose more actions directly on hover or in a visible toolbar.

Critical actions must not depend exclusively on hover.

---

## 71. Touch Targets

Mobile and tablet interactive areas should generally target at least approximately:

```text
44 × 44 px
```

where practical.

Desktop controls may appear visually more compact while remaining easy to interact with.

---

## 72. Hover

Hover is an enhancement, not a requirement.

Anything essential must remain discoverable without hover.

This applies particularly to:

```text
delete actions
appointment actions
product controls
navigation
```

---

## 73. Pointer Precision

Desktop can support more compact interaction because mouse and trackpad input is more precise.

However, do not reduce controls to unnecessarily tiny targets.

The product should remain comfortable.

---

## 74. Keyboard

Desktop interfaces should support keyboard interaction where appropriate.

Important examples include:

```text
forms
dialogs
navigation
drag-and-drop alternatives
```

Responsive adaptation must not damage semantic keyboard behavior.

---

## 75. Orientation

The first design priority is portrait mobile.

Landscape mobile should remain usable but does not require a separate bespoke interface unless a real need appears.

Tablet orientation may have greater impact.

A tablet in landscape may move closer to desktop composition when enough width exists.

---

## 76. Breakpoints Are Not Device Detection

Responsive behavior must depend primarily on available layout space.

Do not attempt to detect:

```text
iPhone
iPad
Mac
Android
```

to choose the basic layout.

Use CSS responsive behavior and capability detection where appropriate.

---

## 77. Client-Side Breakpoint Logic

Prefer CSS for purely visual responsive adaptation.

Do not read `window.innerWidth` in React simply to hide or reposition presentational elements when CSS can do the job.

JavaScript viewport logic is appropriate only when behavior genuinely differs and cannot be expressed robustly through CSS.

---

## 78. Conditional Rendering

Some responsive layouts may legitimately require different component composition.

Example:

```text
desktop appointment side panel
mobile full-screen appointment editor
```

Prefer sharing business logic and smaller components while adapting presentation containers.

Do not duplicate entire features unnecessarily.

---

## 79. Server Rendering

Responsive implementation must remain compatible with Next.js rendering.

Avoid hydration mismatches caused by rendering completely different markup solely from an uninitialized browser width.

Prefer CSS or stable responsive architecture.

---

## 80. Images

Responsive images should use appropriate sizing.

Avoid downloading desktop-sized image assets unnecessarily on mobile when optimization can prevent it.

Client and product photos should maintain correct aspect ratios.

---

## 81. Truncation

Use text truncation carefully.

Never hide important information such as:

```text
client identity
critical service name
conflict explanation
```

without providing a way to access it.

Secondary metadata may truncate when needed.

---

## 82. Long Names

Layouts must tolerate long:

```text
client names
service names
product names
brand names
```

without breaking.

Test realistic long French names rather than only short fixture data.

---

## 83. Dynamic Content

Responsive designs must tolerate variable data length.

Do not position elements based on assumptions such as:

```text
service names always fit on one line
price always has three characters
client has exactly two services
```

---

## 84. Localization

The initial interface is French.

French labels may be longer than English equivalents.

Responsive layouts must accommodate real French copy.

Do not design against English placeholder text and assume French will fit.

---

## 85. Scroll Strategy

Vertical scrolling is the primary mobile content model.

Avoid nested vertical scroll regions unless necessary.

Nested scrolling can make touch interaction difficult.

---

## 86. Desktop Scrolling

Desktop may use persistent layouts where:

```text
navigation
header
side panel
```

remain stable while the main workspace scrolls.

Keep scroll ownership understandable.

---

## 87. Sticky Elements

Sticky UI may be useful for:

```text
agenda date header
save actions
sales total
navigation
```

Use sticky positioning intentionally.

Avoid stacking multiple sticky bars until content space becomes too small.

---

## 88. Modals and Keyboard

On mobile, opening the software keyboard must not make important form actions unreachable.

Form flows should be tested with focused inputs.

Fixed bottom actions may require adaptation when the keyboard is visible.

---

## 89. PWA Standalone Mode

Installed Souris may run without browser chrome.

Layouts must remain valid in standalone mode.

Verify especially:

```text
top safe area
bottom safe area
full-height screens
navigation
fixed elements
```

---

## 90. Loading States

Responsive loading states should roughly preserve the final layout.

Do not show desktop-shaped skeletons on mobile.

Loading placeholders should match the composition of the current viewport.

---

## 91. Error States

Responsive error states must preserve access to recovery actions.

Buttons must not move offscreen or become clipped on narrow devices.

---

## 92. Toasts

Toast notifications should adapt to viewport.

Mobile:

```text
near bottom or top with safe-area awareness
comfortable horizontal margins
```

Desktop:

```text
compact corner placement may be appropriate
```

Toasts must not cover primary navigation or fixed actions.

---

## 93. Z-Index Across Responsive Layouts

Changing navigation or panel styles across breakpoints may affect layering.

Maintain a controlled layer hierarchy.

Do not solve each viewport-specific overlap with arbitrary increasing z-index values.

---

## 94. Responsive Design Tokens

Where useful, layout tokens may define:

```text
page padding
navigation width
content gap
panel width
```

Avoid scattering similar breakpoint values through unrelated files.

Do not over-tokenize values that are genuinely unique to one feature.

---

## 95. Tailwind

Tailwind responsive utilities may implement viewport changes.

Use breakpoint utilities intentionally.

Avoid extremely long class lists containing repeated arbitrary breakpoint overrides when a component structure would be clearer.

---

## 96. Container Queries

Container queries may be used when component adaptation depends on its own available width rather than the global viewport.

They are particularly relevant for reusable cards placed in different layout contexts.

Do not introduce them automatically when ordinary responsive CSS is sufficient.

---

## 97. Visual Verification

Every significant screen should eventually be inspected at:

```text
390 × 844
430 × 932
768 × 1024
1440 × 1000
```

where relevant.

Also inspect widths immediately before and after layout transitions.

---

## 98. Visual Regression

Visual regression tests should use stable reference viewports.

They are especially valuable for:

```text
agenda
navigation
login
onboarding
clients
products
```

The testing strategy is documented in:

```text
docs/development/testing.md
```

---

## 99. Responsive Acceptance

A responsive UI is not complete because:

```text
nothing crashes
```

It must also avoid:

```text
unintended horizontal scroll
overlapping content
clipped actions
unreadable cards
excessive whitespace
stretched mobile composition
broken navigation
```

---

## 100. Agenda Acceptance

Agenda responsive implementation must specifically verify:

```text
empty day
single appointment
simple service
technique with processing
two valid overlapping appointments
multiple processing clients
actual conflict presentation
long service names
long client names
```

across relevant viewport sizes.

---

## 101. Client Acceptance

Client responsive implementation should verify:

```text
client list
client search
client profile
metrics
appointment history
technical notes
before/after photos
product purchase history
```

at mobile, tablet, and desktop sizes where applicable.

---

## 102. Product Acceptance

Product responsive implementation should verify:

```text
inventory list/grid
product card
product detail
scanner
product form
low stock
long product names
```

---

## 103. Sales Acceptance

Sales responsive implementation should verify:

```text
empty draft
single product
multiple products
large quantity
client association
total
complete action
```

The total and validation action must remain visible and understandable.

---

## 104. No Fixed Device Assumptions

Do not add styling such as:

```text
if screen is exactly 390 px
```

except for controlled reference/testing needs.

Production behavior should use robust responsive ranges.

---

## 105. Progressive Enhancement

Advanced desktop interactions should enhance the experience without making mobile functionality incomplete.

Examples:

```text
hover previews
persistent side panels
keyboard shortcuts
```

Mobile must retain access to the same core business capabilities.

---

## 106. Feature Parity

Responsive layouts may expose information differently.

Core capabilities should remain available across devices unless a feature is genuinely hardware-specific.

Examples:

```text
create appointment
view client
edit service
record sale
adjust stock
```

must not disappear on desktop or mobile because of layout choices.

---

## 107. Hardware-Specific Features

Some features may be naturally better on certain devices.

Example:

```text
camera barcode scanning
```

is especially appropriate on mobile.

Desktop must still provide a usable alternative:

```text
manual search
barcode input
```

Feature parity means equivalent capability, not necessarily identical interaction.

---

## 108. Responsive Simplicity

Do not create entirely separate mobile and desktop applications inside the same codebase.

Share:

```text
domain logic
feature logic
data access
design tokens
reusable components
```

Adapt composition where necessary.

---

## 109. Current Responsive Assumptions

The first production experience assumes:

```text
portrait mobile as primary usage
tablet as meaningful secondary usage
desktop as complete intentional experience
single active staff member
vertical day agenda
bottom navigation on mobile
richer agenda workspace on desktop
```

These assumptions may evolve with real usage.

---

## 110. Future Multi-Staff Impact

Future multi-staff scheduling may require more horizontal space.

Potential future desktop structures include:

```text
one column per staff member
staff filters
combined agenda
```

Mobile may require:

```text
staff selector
one staff agenda at a time
horizontal resource switching
```

Do not implement this now.

Current responsive architecture should avoid unnecessarily blocking it.

---

## 111. Future Resource Scheduling

Future rooms or equipment may similarly require richer agenda layouts.

Do not pre-build those layouts.

Preserve the distinction between:

```text
business logic
timeline data
presentation layout
```

so responsive agenda composition can evolve later.

---

## 112. Design Source of Truth

Approved visual references live in:

```text
docs/design/references/
```

Responsive implementation must respect these references.

If implementation reveals that a reference cannot behave correctly between sizes, adjust the responsive rule intentionally rather than introducing arbitrary hacks.

---

## 113. Documentation Evolution

When a stable responsive rule changes:

```text
update this document
+
update implementation
```

when appropriate.

Do not document every small breakpoint adjustment.

This document describes stable responsive principles and important product behavior.

---

## 114. Final Rule

Souris must feel designed for the device currently being used.

On mobile, it should feel:

```text
fast
reachable
focused
```

On tablet, it should feel:

```text
spacious
touch-friendly
efficient
```

On desktop, it should feel:

```text
rich
organized
productive
```

The same product identity and business model must remain recognizable across all three.

Responsive design in Souris means using available space intelligently, not simply making the same interface larger or smaller.
