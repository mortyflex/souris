# Souris — Design System

## 1. Purpose

This document defines the visual design system of Souris.

It is the canonical reference for:

- brand direction;
- color system;
- typography;
- spacing;
- radii;
- shadows;
- surfaces;
- buttons;
- inputs;
- cards;
- badges;
- iconography;
- visual states;
- design-token usage;
- responsive visual consistency.

The goal is to create a visual language that feels:

```text
premium
editorial
warm
playful
modern
calm
professional
```

Souris must not look like a generic administrative SaaS dashboard.

It should feel intentionally designed for beauty professionals while remaining practical for daily work.

---

## 2. Design Principle

The design system follows one primary rule:

> **Expressive brand, quiet interface.**

Souris may use:

```text
distinctive typography
soft colors
playful shapes
fluid motion
editorial compositions
```

but the interface must remain easy to scan and operate quickly.

Beauty and usability must reinforce each other.

---

## 3. Product Personality

The desired personality is:

```text
friendly
confident
premium
approachable
soft
expressive
not childish
not clinical
not corporate
```

Avoid interfaces that feel:

```text
cold
overly technical
dense
financial
enterprise-oriented
generic
```

---

## 4. Visual Direction

The approved direction combines:

```text
soft editorial layouts
rounded geometry
generous whitespace
large expressive typography
strong hierarchy
subtle visual playfulness
controlled use of color
fluid transitions
```

The application should feel closer to a modern lifestyle or wellness product than to traditional salon-management software.

---

## 5. Visual References

Approved visual references live in:

```text
docs/design/references/
```

These references are the visual source of truth for implementation.

When a visual reference exists, implementation must be compared against it.

Do not reinterpret the visual direction from scratch because another layout or component style is easier to implement.

---

## 6. Inspiration

The visual direction is influenced by references such as:

```text
Pomegranate
Columbia 100
editorial wellness products
modern beauty brands
premium lifestyle applications
```

These references inform:

```text
composition
rhythm
typography
motion
visual confidence
```

They are inspiration, not templates to copy literally.

Souris must preserve its own identity.

---

## 7. Brand Meaning

The name:

```text
souris
```

has a deliberate double meaning in French:

```text
souris
=
mouse

souris
=
smile
```

The visual identity may therefore combine:

```text
mouse ears
a smile curve
rounded geometry
playful typographic details
```

This dual meaning should remain recognizable without becoming literal or childish.

---

## 8. Wordmark

The Souris wordmark should remain lowercase:

```text
souris
```

The lowercase treatment supports the intended personality:

```text
friendly
soft
contemporary
approachable
```

The wordmark and symbol should feel as though they belong to the same drawing system.

They should not look like two unrelated assets placed together.

---

## 9. Logo Symbol

The Souris symbol may combine:

```text
abstract mouse ears
rounded face geometry
smile curve
```

The symbol should remain recognizable at small sizes.

Avoid excessive detail.

The symbol must work in contexts such as:

```text
app icon
navigation
login
onboarding
favicon
loading states
social preview
```

---

## 10. Logo Accent

A pink dot on the `i` may be used as a distinctive brand detail.

This accent should remain consistent when the full wordmark is used.

Do not introduce unrelated decorative treatments for the same letter across screens.

---

## 11. Logo Assets

Final production assets should eventually include:

```text
logo-primary.svg
logo-wordmark.svg
logo-symbol.svg
logo-lockup-stacked.svg
```

Application-icon variants should be derived from the same visual system.

Do not create unrelated alternative logos for different screens.

---

## 12. Logo Clear Space

The logo must retain enough surrounding space to remain visually distinct.

Do not place the wordmark directly against:

```text
screen edges
card borders
buttons
other text
illustrations
```

Exact minimum spacing may be formalized when final SVG assets exist.

Until then, preserve generous visual breathing room.

---

## 13. Logo Misuse

Avoid:

```text
stretching the logo
changing its proportions
adding arbitrary shadows
adding outlines
rotating it
changing individual logo colors arbitrarily
placing it over low-contrast backgrounds
```

The logo should feel stable across the product.

---

## 14. Color Philosophy

Color in Souris has three primary roles:

```text
brand identity
visual hierarchy
state communication
```

Color should not be used merely to decorate every surface.

Most of the application should remain visually calm so important colored elements retain meaning.

---

## 15. Core Palette

The approved palette direction includes:

```text
Lavender / purple
Pink
Peach / warm cream
Light lavender-gray
Deep navy-purple
```

Approximate initial reference values are:

```text
Purple
#6450A3

Pink
#EF9BB0

Peach
#FBE6CD

Light lavender gray
#E0DDE2

Deep navy purple
#242048
```

These values are provisional until final implementation is verified against approved visual references.

Do not treat approximate reference values as permanently fixed production tokens before that verification.

---

## 16. Semantic Colors

Implementation should consume semantic tokens rather than scattered raw values.

Expected concepts include:

```text
background
background-subtle

surface
surface-muted
surface-elevated

text-primary
text-secondary
text-muted
text-inverse

border
border-strong

brand-primary
brand-secondary

accent-pink
accent-peach

success
warning
danger
info

processing
occupied
available
```

Exact CSS token names will be finalized during implementation.

---

## 17. Raw Colors

Avoid repeated values such as:

```css
color: #6450a3;
```

inside unrelated components.

Prefer semantic tokens:

```css
color: var(--color-brand-primary);
```

or their configured Tailwind equivalent.

Raw palette values must have one canonical source.

---

## 18. Background

The global interface background should feel soft rather than stark.

Avoid using pure white as the only application background.

Possible directions include:

```text
warm off-white
very light peach
very light lavender
```

Individual cards and elevated surfaces may still use white or near-white when useful.

---

## 19. Primary Text

Primary text should generally use deep navy-purple rather than pure black.

Initial direction:

```text
#242048
```

This provides strong contrast while remaining consistent with the softer Souris identity.

---

## 20. Secondary Text

Secondary information should remain readable without competing with primary content.

Use a muted derivative of the primary text color.

Do not make secondary text so pale that it becomes difficult to read on mobile.

---

## 21. Purple

Purple is the primary structural brand color.

It may be used for:

```text
primary actions
selected navigation
important controls
active states
brand identity
focus emphasis
```

It should provide visual anchoring across the application.

---

## 22. Pink

Pink is a secondary brand accent.

It may be used for:

```text
small highlights
logo accents
selected decorative elements
specific statuses
onboarding details
```

Avoid using pink everywhere.

Its value comes from contrast and restraint.

---

## 23. Peach

Peach provides warmth.

It may support:

```text
background sections
editorial panels
empty states
onboarding
secondary cards
```

It should not compromise text contrast.

---

## 24. Processing-Time Color

Processing time is a core Souris scheduling concept.

It must receive a consistent visual identity.

A processing phase should visually communicate:

```text
client is still present
professional is available
```

The processing state should differ clearly from occupied time.

However, color must not be the only indicator.

The UI should also contain explicit text such as:

```text
Temps de pose
35 min disponibles
```

---

## 25. Occupied State

Staff-required appointment phases should feel visually stronger than processing phases.

The occupied state may use:

```text
stronger surface contrast
more prominent border
clear typography
brand color emphasis
```

The exact implementation will be defined in agenda components.

---

## 26. Available State

Availability should feel inviting and actionable rather than empty.

An available period may eventually support actions such as:

```text
add appointment
show compatible services
display available duration
```

Avoid representing meaningful free time as visually meaningless blank space.

---

## 27. Status Colors

Business statuses may require semantic colors.

Examples:

```text
success
warning
danger
info
```

Use status colors consistently.

Do not assign arbitrary colors separately in each feature.

---

## 28. Color Accessibility

Text and essential controls must maintain sufficient contrast.

Do not use low-contrast pastel-on-pastel combinations for important information.

Decorative elements may use softer contrast when they do not carry essential meaning.

---

## 29. Typography Philosophy

Typography is a major part of the Souris identity.

The interface should feel editorial without harming operational speed.

The hierarchy should distinguish clearly between:

```text
display
page title
section title
card title
body
label
caption
metadata
```

---

## 30. Typography Roles

Expected roles include:

```text
display
heading-xl
heading-lg
heading-md
heading-sm

body-lg
body
body-sm

label
caption
overline
```

Exact CSS values will be introduced as design tokens during implementation.

---

## 31. Display Typography

Large display typography may be expressive.

It is appropriate for:

```text
login
onboarding
empty states
marketing-like moments
major dashboard greetings
```

It should not dominate dense operational screens such as the agenda.

---

## 32. Operational Typography

Agenda, client, inventory, and sales screens require highly readable typography.

Prioritize:

```text
clarity
fast scanning
numeric readability
time readability
hierarchy
```

over decorative expression.

---

## 33. Font Selection

The final font family must be selected before typography tokens are frozen.

The selected font should support:

```text
French
accents
numbers
multiple weights
mobile readability
editorial headlines
UI labels
```

Do not add several font families without a clear design purpose.

---

## 34. Font Loading

When custom fonts are introduced, use the appropriate Next.js font-loading mechanism.

Avoid layout shifts and uncontrolled external font dependencies.

The final font strategy should support consistent visual-regression testing.

---

## 35. Font Weight

Use a limited set of meaningful weights.

Potential initial range:

```text
400
500
600
700
```

Do not use many nearly identical weights without a visual reason.

---

## 36. Line Height

Line height must support readability.

Large display headings may use tighter line height.

Body text requires more breathing room.

Avoid applying one global line height to every text role.

---

## 37. Letter Spacing

Letter spacing should generally remain subtle.

Large headings may use slight tightening when appropriate.

Labels and overlines may use controlled tracking.

Do not add aggressive letter spacing to ordinary body text.

---

## 38. Spacing Philosophy

Spacing is one of the main sources of visual quality.

Souris should feel:

```text
airy
organized
calm
intentional
```

without wasting space.

Use a consistent spacing scale.

Do not scatter arbitrary values throughout components.

---

## 39. Base Spacing Scale

A practical initial scale may follow:

```text
4
8
12
16
20
24
32
40
48
64
```

pixels or equivalent rem values.

The final token implementation may use names such as:

```text
space-1
space-2
space-3
...
```

Use intermediate values only when the design genuinely requires them.

---

## 40. Mobile Spacing

Mobile spacing must preserve comfortable interaction without creating excessive scrolling.

Typical outer page padding should remain consistent.

Avoid components touching the viewport edges unless intentionally full-bleed.

---

## 41. Desktop Spacing

Desktop may use more generous composition spacing.

However, increased viewport width should not automatically result in huge gaps.

Desktop layouts should use additional space structurally:

```text
columns
side panels
wider agenda
contextual information
```

rather than only increasing margins.

---

## 42. Radius Philosophy

Rounded shapes are an important part of the Souris identity.

Radii should feel soft and contemporary.

Avoid combining many unrelated radius values.

---

## 43. Radius Scale

Expected radius roles may include:

```text
small
medium
large
xl
pill
```

Possible initial direction:

```text
small
8 px

medium
12 px

large
16 px

xl
24 px

pill
999 px
```

Final values should be adjusted against visual references.

---

## 44. Large Cards

Large cards may use more generous radii than compact controls.

Examples:

```text
dashboard feature card
client summary card
onboarding panel
appointment editor section
```

Do not use extreme rounding when it reduces available content space.

---

## 45. Pill Shapes

Pill shapes are appropriate for:

```text
status badges
filters
compact selectors
small actions
```

They should not become the default shape for every control.

---

## 46. Shadows

Souris should avoid heavy material-style shadows.

Preferred elevation is subtle.

Use:

```text
surface contrast
border
very soft shadow
```

before strong drop shadows.

---

## 47. Elevation

Potential elevation levels include:

```text
flat
raised
overlay
```

Examples:

```text
flat
standard card

raised
floating action or elevated panel

overlay
dialog, drawer, popover
```

Do not create many arbitrary shadow levels.

---

## 48. Borders

Borders should generally be subtle.

They may use light lavender-gray or another tokenized neutral.

Stronger borders should communicate:

```text
focus
selection
error
important separation
```

Avoid dark borders around every card.

---

## 49. Surface Hierarchy

The interface may use several surface levels:

```text
page background
standard surface
muted surface
highlight surface
floating surface
```

This creates depth without depending entirely on shadows.

---

## 50. Cards

Cards are a major visual primitive.

Generic cards belong in:

```text
src/shared/ui/
```

Business-aware cards belong inside their feature.

Examples:

```text
AppointmentCard
ClientCard
ProductCard
```

should not be placed in generic shared UI.

---

## 51. Card Hierarchy

A card should communicate hierarchy through:

```text
spacing
typography
surface
border
status accent
```

Avoid placing a border, shadow, colored header, and background treatment on every card simultaneously.

Use visual emphasis selectively.

---

## 52. Interactive Cards

Clickable cards must clearly communicate interactivity.

Use appropriate:

```text
hover state
pressed state
focus state
cursor
motion
```

where relevant.

On mobile, the interaction must remain obvious without hover.

---

## 53. Buttons

Button hierarchy should remain clear.

Expected variants may include:

```text
primary
secondary
ghost
danger
icon
```

Do not create many one-off button styles inside features.

---

## 54. Primary Button

Primary buttons represent the most important action in the current context.

Examples:

```text
Enregistrer
Créer le rendez-vous
Ajouter le produit
Valider la vente
```

Use brand-primary styling.

Avoid presenting several visually identical primary buttons in the same local context.

---

## 55. Secondary Button

Secondary buttons support alternative actions.

Examples:

```text
Modifier
Annuler
Ajouter une note
```

They should remain clearly interactive without competing with the primary action.

---

## 56. Ghost Button

Ghost buttons are appropriate for low-emphasis actions.

Examples:

```text
Fermer
Voir plus
Modifier
```

Use them carefully on touch devices so hit areas remain large enough.

---

## 57. Danger Button

Destructive actions require explicit styling.

Examples:

```text
Supprimer
Annuler définitivement
Archiver
```

Do not use danger styling for ordinary cancellation of a dialog.

---

## 58. Icon Buttons

Icon-only buttons require accessible names.

Examples:

```text
close
more options
previous day
next day
scan
```

The visible icon is not sufficient accessibility information.

---

## 59. Button Height

Primary mobile controls should provide comfortable touch targets.

Aim for an interactive target around:

```text
44 px minimum
```

where practical.

Large primary buttons may exceed this.

---

## 60. Inputs

Inputs should feel clear, soft, and premium.

Avoid overly thin controls or low-contrast borders.

Expected states include:

```text
default
hover
focus
filled
disabled
error
```

---

## 61. Input Labels

Forms must use explicit labels.

Placeholder text must not replace the label when the field requires persistent context.

Labels should remain easy to scan in appointment and client forms.

---

## 62. Input Focus

Focus states should use a clear brand-aligned treatment.

Possible direction:

```text
brand border
soft focus ring
```

Do not remove focus indication.

---

## 63. Input Errors

Error states should communicate:

```text
which field is invalid
what the problem is
how to correct it
```

Do not communicate errors using red border alone.

---

## 64. Selectors

Selection controls may include:

```text
dropdown
segmented control
chips
bottom sheet
combobox
```

Choose the interaction based on the number of options and device context.

Do not force desktop dropdown interaction onto every mobile selection flow.

---

## 65. Bottom Sheets

Bottom sheets are appropriate for mobile contextual actions such as:

```text
service selection
client selection
filters
quick actions
```

They should not become the default solution for every interaction.

Desktop may use a different composition for the same task.

---

## 66. Dialogs

Dialogs are suitable for focused decisions requiring interruption.

Use them for:

```text
destructive confirmation
important conflict confirmation
small focused forms
```

Avoid nesting dialogs.

---

## 67. Appointment Conflict Presentation

Scheduling conflicts are business-critical.

The UI must clearly explain:

```text
which appointment conflicts
which time conflicts
why it conflicts
```

Avoid generic messages such as:

```text
Une erreur est survenue.
```

when the domain provides specific conflict information.

---

## 68. Appointment Cards

Appointment cards are feature-specific components.

They should communicate at a glance:

```text
client
time
services
duration
status
processing phases
```

The agenda must preserve the difference between:

```text
occupied time
processing time
```

---

## 69. Processing Blocks

Processing-time blocks should feel intentionally integrated into appointment cards.

They may use:

```text
lighter surface
distinct background
dashed or soft separation
explicit availability label
```

The exact visual treatment should follow approved agenda references.

---

## 70. Overlapping Appointments

When several clients overlap because of processing time, the layout must remain understandable.

The visual system must avoid making valid overlap look like an error.

Actual conflict states should receive distinct treatment.

---

## 71. Client Cards

Client cards may expose information such as:

```text
name
phone
last visit
next appointment
```

Do not overload list cards with the complete client history.

Detailed information belongs on the client profile.

---

## 72. Product Cards

Product cards should prioritize rapid identification.

Useful information includes:

```text
photo
brand
name
price
stock
low-stock state
```

Barcode values do not need to dominate the normal visual hierarchy.

---

## 73. Sale Interface

The retail-sales interface should feel fast.

Scanned products should be easy to verify through:

```text
photo
name
quantity
price
```

The current total should remain easy to find.

---

## 74. Badges

Badges represent compact states or metadata.

Possible uses include:

```text
Confirmé
En cours
Stock faible
Temps de pose
```

Badge styling must remain semantically consistent.

---

## 75. Badge Density

Avoid excessive badges.

If every piece of metadata becomes a badge, hierarchy disappears.

Use normal text when a status treatment provides no real benefit.

---

## 76. Icons

Icons should use one coherent icon language.

Preferred characteristics:

```text
clean
rounded or softly geometric
consistent stroke
modern
simple
```

Avoid mixing several unrelated icon libraries or visual styles.

---

## 77. Icon Size

Use a small controlled size scale.

Possible roles:

```text
small
16 px

standard
20 px

large
24 px
```

Larger decorative icons may exist in onboarding or empty states.

---

## 78. Icon Meaning

Use familiar icons for familiar actions.

Avoid unusual icons when text would be clearer.

For critical or ambiguous actions, combine icon and label.

---

## 79. Navigation

Navigation should remain clear and stable.

The visual treatment may differ by device:

```text
mobile
bottom navigation

tablet
adapted navigation

desktop
side navigation or another intentional desktop structure
```

Exact responsive behavior is defined in:

```text
docs/design/responsive.md
```

---

## 80. Mobile Bottom Navigation

Primary mobile navigation should remain reachable with one hand.

Potential main destinations include:

```text
Agenda
Clients
Produits / Revente
```

The final information architecture will determine exact labels and destinations.

Avoid overcrowding the bottom navigation.

---

## 81. Active Navigation

The active section must remain obvious through more than a subtle color change when possible.

Possible treatments include:

```text
filled icon
background shape
stronger label
brand color
```

Use a consistent pattern.

---

## 82. Page Titles

Page titles should be visually confident but not excessively large on operational screens.

Examples:

```text
Agenda
Clients
Produits
Revente
```

Supplementary actions may align with the title depending on viewport.

---

## 83. Section Titles

Section titles should create clear grouping.

Avoid using the same size and weight for page titles, card titles, and section titles.

Hierarchy must be intentional.

---

## 84. Empty States

Empty states may be more expressive than normal operational content.

They may use:

```text
brand illustration
warm copy
large typography
soft accent background
clear action
```

Examples:

```text
Aucun rendez-vous aujourd’hui

Aucun client pour le moment

Aucun produit en stock
```

---

## 85. Loading States

Loading states should preserve layout when practical.

Possible patterns include:

```text
skeletons
subtle progress
structured placeholders
```

Avoid excessive spinners in every card.

---

## 86. Error States

Errors should be specific and calm.

Examples:

```text
Impossible d’enregistrer le rendez-vous.

Le produit n’a pas pu être ajouté.

La photo n’a pas pu être envoyée.
```

When recovery is possible, provide a clear action.

---

## 87. Success Feedback

Successful actions should feel immediate without becoming intrusive.

Possible patterns:

```text
small confirmation animation
toast
inline state update
subtle haptic response
```

Do not show blocking success dialogs for ordinary operations.

---

## 88. Motion

Motion is part of the Souris identity.

It should feel:

```text
fluid
soft
responsive
purposeful
```

Motion must reinforce:

```text
continuity
hierarchy
cause and effect
```

Detailed rules are defined in:

```text
docs/design/motion.md
```

---

## 89. Drag and Drop

Service reordering should feel physical but controlled.

Visual feedback may include:

```text
slight elevation
scale
position animation
drop transition
```

The final order must remain clear after the interaction ends.

---

## 90. Reduced Motion

Decorative animation must respect:

```text
prefers-reduced-motion
```

The application must remain fully understandable without large movement.

---

## 91. Responsive Design

The design system must work intentionally across:

```text
mobile
tablet
desktop
```

Mobile-first does not mean reusing the exact mobile composition everywhere.

Responsive behavior is defined in:

```text
docs/design/responsive.md
```

---

## 92. Mobile Priority

The first interaction design target is mobile.

This reflects real use in a salon environment where the professional may interact quickly between services.

Prioritize:

```text
one-handed use
fast scanning
large actions
clear hierarchy
minimal friction
```

---

## 93. Desktop Quality

Desktop must still feel intentionally designed.

Use additional space for:

```text
context
parallel panels
larger agenda
persistent navigation
richer information density
```

Do not simply increase the maximum width of mobile cards.

---

## 94. Tablet Quality

Tablet needs its own intentional adaptation.

It may combine characteristics of mobile and desktop depending on the screen.

Do not assume tablet behavior from one breakpoint alone.

---

## 95. Content Width

Editorial screens may use constrained content widths.

Operational screens such as the agenda may use substantially more horizontal space.

Do not enforce one universal maximum width across every page.

---

## 96. Touch and Pointer

Components should work with both:

```text
touch
mouse / trackpad
```

Hover may enhance desktop interactions but must never be required to discover critical actions.

---

## 97. Safe Areas

PWA and mobile layouts should account for safe areas where relevant.

Examples include:

```text
bottom navigation
full-height onboarding
fixed actions
```

Implementation must avoid controls colliding with device UI.

---

## 98. Design Tokens

The production design system should eventually centralize tokens for:

```text
colors
spacing
typography
radii
shadows
motion
z-index
```

The initial implementation may use CSS custom properties integrated with Tailwind.

Do not duplicate token values across unrelated files.

---

## 99. Token Naming

Token names should express intent.

Prefer:

```text
--color-brand-primary
--color-text-primary
--color-surface-muted
--radius-card
```

over names tied only to raw values:

```text
--purple-6450
--gray-224
```

Raw palette tokens may exist underneath semantic tokens when useful.

---

## 100. Tailwind Usage

Tailwind is part of the current project scaffold.

It may consume Souris design tokens.

Avoid filling components with arbitrary values such as:

```text
rounded-[17px]
text-[#242048]
mt-[13px]
```

when a reusable design token exists.

Arbitrary values remain acceptable when required to match an approved reference and no reusable token is appropriate.

---

## 101. Component Variants

Reusable UI components should expose intentional variants rather than unrestricted styling APIs.

Example:

```text
Button

primary
secondary
ghost
danger
```

Avoid creating prop systems that allow every component instance to become visually unrelated.

---

## 102. Feature-Specific Styling

Feature-specific UI may define unique compositions.

Examples:

```text
agenda timeline
processing-time block
product scanner
client history
```

These features should still consume the shared visual tokens.

The design system provides consistency without forcing every feature into identical card layouts.

---

## 103. Illustration

Illustrations may be used selectively for:

```text
onboarding
empty states
brand moments
```

They should follow the same:

```text
palette
soft geometry
playful tone
```

as the Souris identity.

Do not mix unrelated illustration styles.

---

## 104. Photography

Client and product photography must remain visually distinct from decorative illustration.

Client photos are professional records.

Product photos are inventory and sales assets.

Do not apply decorative filters that alter the informational value of these images.

---

## 105. Image Radius

Product and client image containers may use rounded corners consistent with the card system.

Before/after client photos should preserve enough image area to remain useful professionally.

---

## 106. Before / After Presentation

Before/after imagery should clearly identify:

```text
Avant
Après
```

Do not rely only on ordering or color.

The layout should make visual comparison easy.

---

## 107. Numeric Information

Important numbers should be easy to scan.

Examples:

```text
time
price
stock
duration
client spending
```

Use consistent formatting and suitable font features.

---

## 108. Time Formatting

Time presentation should be concise.

Initial French usage may display:

```text
09:00
09:15
14:30
```

The scheduling domain must not depend on these formatted strings.

Formatting belongs to presentation.

---

## 109. Duration Formatting

Durations may be displayed naturally.

Examples:

```text
15 min
45 min
1 h 20
```

Use one canonical formatting helper when implementation begins.

---

## 110. Price Formatting

Initial business usage is in euros.

Example:

```text
45 €
140 €
29,90 €
```

The exact formatting policy should remain consistent across:

```text
appointments
products
sales
client metrics
```

Business logic must not use formatted strings.

---

## 111. French Interface

The first production experience is French.

Copy should feel natural to French-speaking beauty professionals.

Avoid literal technical translations or unnecessarily formal SaaS vocabulary.

Examples should favor clear terms such as:

```text
Rendez-vous
Temps de pose
Clients
Produits
Stock
Revente
```

---

## 112. Tone of Voice

Product copy should be:

```text
short
clear
warm
competent
human
```

Avoid:

```text
corporate jargon
technical database vocabulary
excessive enthusiasm
long instructional paragraphs inside operational screens
```

---

## 113. Microcopy

Microcopy should help the user make decisions quickly.

Good:

```text
35 min disponibles
```

Less useful:

```text
Cette période correspond à une phase pendant laquelle vous pouvez éventuellement ajouter un autre rendez-vous.
```

Use concise explanations in the primary interface.

More detailed help may exist when necessary.

---

## 114. Accessibility

Visual polish must not reduce accessibility.

The system must preserve:

```text
contrast
focus states
semantic controls
readable text
touch targets
reduced motion
non-color status communication
```

Accessibility is a design requirement, not a final cleanup phase.

---

## 115. Touch Target Size

Interactive mobile targets should generally approach:

```text
44 × 44 px
```

minimum.

Visual icons may be smaller while the surrounding interactive area remains large enough.

---

## 116. Focus Styles

Keyboard focus must remain visible.

Focus treatments should fit the brand while clearly communicating current position.

Do not globally remove outlines without a replacement.

---

## 117. Scrollbars

Do not aggressively customize scrollbars unless a real visual requirement exists.

Native scrolling behavior should remain predictable.

---

## 118. Z-Index

Avoid arbitrary z-index escalation.

When implementation requires layers, define a controlled hierarchy for concepts such as:

```text
base
sticky
dropdown
overlay
modal
toast
```

Do not solve layering bugs by continually adding larger numbers.

---

## 119. Pixel-Perfect Verification

UI work is not complete simply because it resembles the reference approximately.

When an approved reference exists:

```text
render
capture
compare
adjust
repeat
```

Check:

```text
spacing
size
alignment
typography
radius
color
hierarchy
responsive composition
```

---

## 120. Design Review

Before accepting a new reusable component into the design system, verify:

```text
Does it appear more than once?

Is its visual behavior consistent?

Does it belong to shared UI rather than one feature?

Can its variants remain small and understandable?
```

Do not prematurely turn every feature component into a reusable primitive.

---

## 121. No Generic SaaS Drift

Avoid visual patterns that would make Souris indistinguishable from generic back-office software.

Examples to avoid when unnecessary:

```text
dense gray tables everywhere
tiny controls
large collections of bordered panels
blue enterprise palette
dashboard widget overload
generic sidebar-template appearance
```

Operational efficiency can coexist with strong visual identity.

---

## 122. No Excessive Decoration

The opposite extreme must also be avoided.

Souris is a working tool.

Do not sacrifice usability through:

```text
excessive gradients
large decorative shapes over content
too many animations
low-contrast pastels
oversized typography on operational screens
```

The product must remain efficient during a busy workday.

---

## 123. Current Design Assumptions

For the first production version:

```text
French interface
mobile-first
hair-salon-specific presentation
premium editorial visual direction
lavender / purple primary identity
pink secondary accent
warm peach support
deep navy-purple text
rounded geometry
fluid motion
```

These assumptions define the first Souris visual experience.

---

## 124. Implementation Sequence

The design system should be implemented progressively.

Expected order:

```text
1. Confirm final core palette
2. Confirm typography
3. Define CSS tokens
4. Define global styles
5. Build core UI primitives
6. Verify primitives visually
7. Build feature-specific components
8. Verify mobile references
9. Adapt tablet
10. Adapt desktop
11. Add visual regression checks
```

Do not build a huge component library before real screens need those components.

---

## 125. Design Documentation Evolution

This document describes stable design rules.

When implementation reveals a legitimate design-system decision that should become canonical:

```text
update this document
+
update implementation
```

in the same logical project step when appropriate.

Do not document every one-off visual detail.

---

## 126. Final Rule

Souris should feel beautiful because the system is coherent, not because every element is decorated.

The visual hierarchy should make the application feel:

```text
simple
warm
premium
fast
recognizable
```

The design system must support the real daily work of beauty professionals while giving Souris a distinct identity.

Every screen should feel unmistakably part of the same product.
