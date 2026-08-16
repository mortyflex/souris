# Souris — Motion

## 1. Purpose

This document defines the motion system of Souris.

It is the canonical reference for:

- animation principles;
- transition behavior;
- timing;
- easing;
- page transitions;
- component transitions;
- drag and drop;
- appointment movement;
- processing-time feedback;
- loading feedback;
- success feedback;
- reduced-motion behavior;
- motion accessibility;
- responsive motion behavior.

Motion is part of the Souris identity.

It should make the product feel:

```text
fluid
responsive
premium
soft
alive
```

without making daily work slower.

---

## 2. Core Principle

The Souris motion system follows one rule:

> **Motion should explain what changed.**

Animation should help the user understand:

```text
where something came from
where something moved
what action just happened
what state changed
what requires attention
```

Motion must not exist only to make the interface look animated.

---

## 3. Product Personality

Motion should reinforce the Souris personality:

```text
soft
confident
playful
controlled
premium
natural
```

Avoid motion that feels:

```text
mechanical
aggressive
bouncy without reason
slow
cartoonish
overly dramatic
```

---

## 4. Motion Is Functional

Animation is appropriate when it communicates:

```text
continuity
hierarchy
cause and effect
state change
spatial relationship
confirmation
```

Examples include:

```text
appointment card moves after rescheduling
service item moves after drag and drop
drawer appears from the edge it belongs to
new scanned product enters the current sale
processing-time area becomes available
```

---

## 5. Motion Is Not Decoration First

Do not animate every element simply because animation is available.

Avoid:

```text
every card fading in independently
constant floating elements
unnecessary background movement
continuous bouncing buttons
decorative motion during operational workflows
```

The user may interact with Souris throughout a busy working day.

Motion must remain comfortable.

---

## 6. Operational Speed

Operational screens should feel immediate.

Examples include:

```text
Agenda
Clients
Produits
Revente
Appointment editor
```

Animations on these screens should generally be short.

The interface must never feel as though it is waiting for an animation to finish.

---

## 7. Expressive Moments

Some parts of Souris may use more expressive motion.

Examples include:

```text
login
onboarding
empty states
brand introduction
successful first setup
```

These moments may use:

```text
larger movement
slightly longer timing
brand illustration animation
staggered content
```

while remaining restrained.

---

## 8. Motion Categories

Souris motion can be divided into:

```text
micro interaction
component transition
layout transition
navigation transition
feedback animation
brand motion
```

Each category may use different timing and movement intensity.

---

## 9. Micro Interactions

Micro interactions are small responses to direct user actions.

Examples:

```text
button press
toggle
checkbox
selection chip
icon button
drag handle
scan confirmation
```

They should feel almost immediate.

---

## 10. Component Transitions

Component transitions include:

```text
card expansion
accordion
bottom sheet
popover
dialog
drawer
dropdown
```

These transitions should explain how the component enters or leaves the current context.

---

## 11. Layout Transitions

Layout transitions occur when elements change position.

Examples:

```text
service reordering
appointment repositioning
new sale item insertion
card removal
agenda lane adjustment
```

These are particularly valuable because they help the user track objects through change.

---

## 12. Navigation Transitions

Navigation transitions may communicate movement between:

```text
screen
detail
editor
previous context
```

They should remain subtle on operational screens.

Do not turn normal navigation into cinematic page transitions.

---

## 13. Feedback Animation

Feedback motion communicates an outcome.

Examples:

```text
appointment saved
product scanned
sale completed
stock adjusted
client created
```

Feedback should be:

```text
clear
brief
non-blocking
```

---

## 14. Brand Motion

Brand motion is reserved for moments where the Souris identity is important.

Potential examples:

```text
logo reveal
mouse/smile symbol animation
onboarding illustration
empty-state illustration
```

Brand motion should use the same visual language as the logo and design system.

---

## 15. Timing Philosophy

Motion should generally be faster than the user consciously notices.

The goal is:

```text
responsive
not abrupt
```

Most operational animations should live approximately within:

```text
100–300 ms
```

depending on distance and complexity.

---

## 16. Timing Tokens

The production design system should eventually define motion tokens.

Conceptual values:

```text
instant
100 ms

fast
150 ms

normal
200 ms

medium
250 ms

slow
350 ms

expressive
450–600 ms
```

Exact values may be adjusted during implementation and visual verification.

---

## 17. Instant Motion

Use approximately:

```text
100 ms
```

for very small direct responses.

Examples:

```text
pressed state
icon state
small color transition
focus emphasis
```

---

## 18. Fast Motion

Use approximately:

```text
150 ms
```

for:

```text
button hover
small popover
selection state
badge change
small opacity transition
```

---

## 19. Normal Motion

Use approximately:

```text
200 ms
```

for common UI transitions.

Examples:

```text
card state
small panel
input feedback
navigation indicator
```

---

## 20. Medium Motion

Use approximately:

```text
250 ms
```

for:

```text
drawer
bottom sheet
dialog
layout movement
```

where the user benefits from perceiving spatial movement.

---

## 21. Slow Motion

Use approximately:

```text
350 ms
```

only for larger spatial changes.

Examples:

```text
full-screen onboarding transition
large panel transition
major layout reconfiguration
```

Operational actions should rarely exceed this.

---

## 22. Expressive Motion

Animations around:

```text
450–600 ms
```

should be reserved for:

```text
onboarding
brand reveals
non-operational empty states
```

Do not use expressive timing for frequent business actions.

---

## 23. Easing

Use easing that feels natural and soft.

Preferred behavior:

```text
fast initial response
gentle settling
```

Avoid strong elastic or spring effects on ordinary controls.

---

## 24. Standard Easing

The standard easing should feel similar to a modern ease-out curve.

Conceptually:

```text
enter
ease-out

exit
slightly faster ease-in

layout movement
smooth ease-in-out or controlled spring
```

Exact curves should be centralized as motion tokens.

---

## 25. Springs

A spring may be useful for direct manipulation.

Examples:

```text
drag and drop
card repositioning
small interactive transformations
```

The spring should feel controlled.

Avoid exaggerated:

```text
bounce
overshoot
wobble
```

---

## 26. Motion Distance

Motion distance should correspond to the spatial relationship being communicated.

Small state changes should use small movement.

Examples:

```text
button press
1–2 px

card hover
2–4 px

drawer
from its actual screen edge
```

Avoid large movement for tiny state changes.

---

## 27. Opacity

Opacity can support transitions.

It should normally be combined with minimal movement when spatial context matters.

Avoid relying on long fade transitions for operational UI.

---

## 28. Scale

Scale should be subtle.

Possible direct-interaction ranges:

```text
pressed
0.97–0.99

hover / selected
1.00–1.02
```

Do not enlarge interface cards dramatically on hover.

---

## 29. Button Press

Buttons may provide a small tactile press response.

Example behavior:

```text
pointer down
slight scale reduction

release
return immediately
```

This should feel responsive rather than animated.

---

## 30. Button Hover

Desktop hover may use subtle changes in:

```text
background
border
shadow
position
```

Avoid large hover movement.

Hover is an enhancement and must not be required for understanding the action.

---

## 31. Button Loading

When an action takes time, the button may transition into a loading state.

The transition should preserve button width where practical to prevent layout jumping.

Example:

```text
Enregistrer
↓
spinner + Enregistrement…
↓
success / normal state
```

Do not animate the entire page because one button is loading.

---

## 32. Success Feedback

Success feedback should normally be brief and non-blocking.

Examples:

```text
check icon
subtle card confirmation
toast
small scale / fade response
```

Avoid success modals for routine actions.

---

## 33. Error Feedback

Error animation should draw attention without feeling punitive.

Possible treatments include:

```text
small field emphasis
border transition
error message appearance
```

Avoid aggressive shaking animations.

If shake is ever used, it must be extremely subtle and not the only error signal.

---

## 34. Form Validation

Validation messages should appear near the field they describe.

Motion may use:

```text
opacity
small vertical reveal
```

Avoid large layout jumps.

Reserve enough space where practical for predictable forms.

---

## 35. Dialog Motion

Dialogs should appear as overlays connected to the current context.

Possible behavior:

```text
backdrop fades in
dialog opacity increases
dialog scales slightly from approximately 0.98 to 1
```

Keep timing short.

---

## 36. Dialog Exit

Exit should usually be slightly faster than entry.

The user has already decided to close the dialog.

Do not make them wait for a long closing animation.

---

## 37. Bottom Sheet Motion

Bottom sheets should enter from the bottom.

The motion should reinforce their spatial origin.

Example:

```text
translateY
+
subtle backdrop fade
```

Avoid fading a bottom sheet into the center without movement.

---

## 38. Drawer Motion

A side drawer should enter from the side where it lives.

Desktop appointment detail:

```text
right panel
→ enters from right
```

Navigation drawer:

```text
left
→ enters from left
```

Spatial consistency improves understanding.

---

## 39. Popover Motion

Popovers should use small movement.

Example:

```text
4–8 px vertical movement
+
opacity
```

Do not animate popovers over long distances.

---

## 40. Navigation Indicator

Selected navigation may animate between destinations.

Examples:

```text
background pill
active underline
active icon container
```

The movement should be subtle and help preserve continuity.

---

## 41. Mobile Navigation

Bottom navigation should remain stable.

Avoid moving the entire navigation bar during normal route changes.

Only the active state should animate.

---

## 42. Desktop Navigation

Desktop side navigation may animate:

```text
active background
icon state
label emphasis
```

Do not animate the entire sidebar on every page change.

---

## 43. Page Transitions

Operational page transitions should be minimal.

A normal page change may use:

```text
very subtle opacity
small directional movement
```

or no animation when framework navigation already feels smooth.

Do not delay navigation for animation.

---

## 44. Forward and Back Navigation

Where spatial navigation is clear, directional movement may reinforce:

```text
forward
back
```

Example:

```text
client list
→ client detail
```

However, do not attempt to mimic native mobile navigation everywhere unless it improves the real interaction.

---

## 45. Shared Elements

Shared-element-like transitions may be useful for important objects.

Examples:

```text
appointment card → appointment editor
product card → product detail
```

Use only if technically reliable and visually beneficial.

Do not make feature architecture depend on complex animation techniques.

---

## 46. Agenda Motion

The agenda is one of the most important areas for motion.

Motion should help the user understand changes to:

```text
time
position
duration
service order
processing periods
overlapping appointments
```

---

## 47. Appointment Creation

When a new appointment is created, its card may appear using:

```text
small opacity transition
subtle scale
layout insertion
```

It should feel as though the appointment became part of the agenda.

Avoid dramatic entrance effects.

---

## 48. Appointment Rescheduling

When an appointment changes start time, the card should move smoothly to its new position when practical.

The user should be able to visually follow:

```text
old position
→
new position
```

This is more informative than instantly disappearing and reappearing elsewhere.

---

## 49. Appointment Duration Change

When duration changes, the card should smoothly resize.

This is particularly useful in the appointment editor or agenda preview.

The transition communicates the scheduling consequence immediately.

---

## 50. Processing-Time Change

When processing duration changes:

```text
occupied phase
processing phase
later phases
```

may all shift.

The UI may animate these positions to show how the appointment timeline changed.

The scheduling domain still provides the actual values.

Motion only communicates the result.

---

## 51. Processing-Time Visual Feedback

Processing time represents:

```text
client present
professional available
```

If the user selects or interacts with the processing area, motion may emphasize its availability.

Examples:

```text
subtle highlight
soft border transition
small contextual action reveal
```

Avoid pulsing continuously.

---

## 52. Adding an Appointment During Processing

If the user creates another appointment inside an available processing period, the agenda may animate the new card into the free area.

The original appointment remains visually present.

This reinforces the Souris scheduling model.

---

## 53. Conflict Feedback

Scheduling conflicts require clear visual feedback.

Motion may help draw attention to:

```text
conflicting phase
conflicting appointment
conflicting interval
```

Possible behavior:

```text
brief highlight
border emphasis
small controlled pulse
```

Avoid constant flashing.

---

## 54. Conflict Resolution

When the conflict is resolved, the error treatment should transition back to the normal state.

This provides clear feedback that the schedule is valid again.

---

## 55. Current-Time Indicator

If the agenda includes a current-time indicator, movement should update naturally.

Do not animate it continuously at high frame rates.

Updating at an appropriate interval is sufficient.

---

## 56. Agenda Scroll

Automatic agenda scrolling may occur when opening today's schedule.

Example:

```text
scroll near current time
```

The scroll should be controlled and not disorient the user.

Do not repeatedly auto-scroll after the user has manually moved elsewhere.

---

## 57. Drag and Drop

Drag and drop is a key motion interaction.

It will be used for appointment service reordering.

The interaction should clearly communicate:

```text
picked up
moving
possible drop position
dropped
```

---

## 58. Drag Start

When a service item is picked up, possible feedback includes:

```text
slight scale
subtle elevation
reduced surrounding emphasis
```

The item should feel temporarily detached from the list.

---

## 59. Drag Movement

During drag:

```text
movement should follow input closely
```

Avoid heavy smoothing that makes the item lag behind the finger or pointer.

Direct manipulation should feel immediate.

---

## 60. Drag Placeholder

The list should clearly indicate where the dragged service will be inserted.

Other items may move smoothly out of the way.

This is preferable to showing the final order only after drop.

---

## 61. Drag Drop

On drop:

```text
item settles into position
other items finish repositioning
timeline recalculates
```

The user should see the direct relationship between order and timeline changes.

---

## 62. Drag Cancellation

If drag is cancelled, the item should smoothly return to its original position.

Do not leave the list in an ambiguous intermediate state.

---

## 63. Touch Drag

Touch interaction must avoid accidental dragging during normal scrolling.

A clear drag handle or controlled gesture may be appropriate.

Motion must not make vertical list scrolling difficult.

---

## 64. Product Scanner

Scanning should provide immediate feedback.

Successful recognition may trigger:

```text
short visual confirmation
product card insertion
optional haptic feedback
```

The scanner should be ready for the next product quickly.

---

## 65. Known Product Scan

When a known product is scanned:

```text
product identified
↓
sale quantity increases
```

The corresponding sale line may briefly emphasize the changed quantity.

This helps the user verify the scan.

---

## 66. Repeated Scan

If the same product is scanned again, avoid inserting a duplicate visual card and then merging it.

Prefer animating the existing quantity:

```text
1 → 2
```

with a small emphasis.

---

## 67. Unknown Product Scan

If a barcode is unknown, the transition into product creation should preserve context.

The barcode should remain available.

The user should understand:

```text
scan succeeded
product does not exist yet
```

rather than interpreting the result as scanner failure.

---

## 68. Sale Item Removal

Removing an item from a draft sale may use:

```text
short collapse
opacity reduction
layout repositioning
```

The other sale lines should move smoothly into place.

---

## 69. Sale Completion

Completing a sale may use a brief confirmation moment.

Possible behavior:

```text
button confirms
total settles
small check feedback
sale draft clears
```

Do not delay returning to the operational state.

---

## 70. Stock Changes

Stock count changes may receive subtle numeric feedback.

Example:

```text
6
→
5
```

The transition should make the updated quantity noticeable without becoming distracting.

---

## 71. Low Stock

When stock crosses the low-stock threshold, the badge or status may transition into its warning state.

Avoid continuous animation for low stock.

The state itself is sufficient after the transition.

---

## 72. Client Creation

Creating a client during appointment booking should feel continuous.

After saving:

```text
client form closes
new client becomes selected
appointment draft remains
```

Motion may reinforce that the user returned to the appointment workflow.

---

## 73. Client Profile

Opening a client profile should preserve the sense of navigating from:

```text
client list
→
client history
```

Keep motion subtle.

Operational information should become accessible quickly.

---

## 74. Before / After Photos

Before/after photo interactions may use restrained transitions for:

```text
opening full view
switching image
closing viewer
```

Do not animate photo content in ways that make visual comparison harder.

---

## 75. Image Upload

Uploading a client or product image may show progress.

The UI should distinguish:

```text
uploading
completed
failed
```

Motion can support progress but must not hide status text.

---

## 76. Loading States

Loading feedback should match expected wait duration.

Very short operations should avoid flashing a loading indicator unnecessarily.

Longer operations may use:

```text
skeleton
progress
spinner
```

depending on context.

---

## 77. Skeleton Motion

Skeletons may use a very subtle shimmer if desired.

Do not use intense or high-contrast shimmer.

Reduced motion should disable unnecessary skeleton animation.

---

## 78. Spinner

Spinners should be used only when:

```text
progress duration is unknown
and
the user needs confirmation that work is happening
```

Avoid placing independent spinners across many cards.

---

## 79. Optimistic UI

Where safe, Souris may use optimistic interaction to feel immediate.

Example:

```text
small UI state changes before remote confirmation
```

However, business-critical operations must handle failure correctly.

Do not use animation to pretend an operation succeeded before integrity is assured.

---

## 80. Toast Motion

Toasts should enter and leave smoothly.

Mobile may use:

```text
small vertical slide
+
opacity
```

Desktop may use similar corner-based motion.

Do not make toasts bounce dramatically.

---

## 81. Toast Duration

Toast duration should provide enough time to read the message.

Critical errors should remain available longer than routine success feedback.

Do not depend on toast animation as the only record of an important failure.

---

## 82. Onboarding

Onboarding can use more expressive transitions.

Potential motion includes:

```text
illustration movement
text stagger
progress transition
logo animation
```

Each step should remain easy to read.

Do not force the user to wait for an animation before continuing.

---

## 83. Onboarding Step Change

Step transitions should preserve direction.

Example:

```text
next
content moves subtly forward

back
content moves subtly backward
```

This can improve spatial understanding.

---

## 84. Login

Login motion should remain calm.

Potential sequence:

```text
logo appears
headline appears
form settles
```

Avoid long intros after the user has already seen the login experience before.

Repeated use must remain fast.

---

## 85. First Launch vs Repeated Launch

More expressive brand motion may be acceptable during:

```text
first onboarding
```

but should not play fully every time the user opens Souris.

Operational return visits should prioritize speed.

---

## 86. Empty States

Empty states may use subtle illustration motion.

Example:

```text
small floating or breathing movement
```

Only when it remains gentle and non-distracting.

Continuous motion should be rare.

---

## 87. Hover Motion

Desktop hover states may use motion.

Possible examples:

```text
card lifts by 2 px
button background transitions
icon shifts by 1–2 px
```

Avoid moving content enough to affect pointer targeting.

---

## 88. Layout Stability

Motion must not create unstable layout.

Avoid animations that unexpectedly move surrounding controls when the user is about to interact.

Layout transitions should be predictable.

---

## 89. Scroll-Triggered Motion

Avoid excessive scroll-triggered entrance animations on operational screens.

The user should not repeatedly wait for content to animate while scrolling through:

```text
clients
products
history
agenda
```

Scroll-triggered motion may be acceptable for limited onboarding or editorial content.

---

## 90. Continuous Motion

Continuous animation should be extremely limited.

Possible legitimate examples:

```text
loading spinner
progress indicator
active scanning state
```

Avoid continuously animated decorative interface elements during normal work.

---

## 91. Scanner State

While the camera scanner is active, subtle motion may communicate scanning.

Examples:

```text
scan line
focus frame
small state indicator
```

Keep it restrained.

The camera view itself already contains visual movement.

---

## 92. Performance

Motion must maintain smooth interaction.

Avoid animation properties that trigger expensive layout or paint work when transform and opacity can achieve the same result.

Prefer animation of:

```text
transform
opacity
```

where practical.

---

## 93. Layout Animation

Some layout transitions necessarily involve size or position changes.

Use appropriate tooling rather than manually forcing complex frame-by-frame updates.

The implementation should be measured if animation causes performance issues.

---

## 94. Animation Library

The intended motion library for React UI is:

```text
Motion
```

It should be introduced only when the implementation phase requires it.

Do not install it solely because this document exists.

---

## 95. Native CSS Motion

Simple transitions should remain CSS when possible.

Examples:

```text
hover color
focus ring
small opacity
background transition
```

Do not use a JavaScript animation library for every minor state.

---

## 96. Motion vs Domain

Motion belongs to the presentation layer.

The domain decides:

```text
appointment moved
timeline changed
conflict exists
stock changed
sale completed
```

The UI decides:

```text
how that change is animated
```

Never add motion-specific data to domain entities.

---

## 97. No Animation State in Domain

Avoid domain fields such as:

```text
isAnimating
animationDirection
cardPosition
transitionStatus
```

These belong to UI state.

---

## 98. Responsive Motion

Motion may vary by viewport.

Example:

```text
Mobile
full-screen editor slides in

Desktop
side panel slides in
```

The business action remains the same.

The spatial transition should match the actual layout.

---

## 99. Mobile Motion

Mobile motion must account for:

```text
touch interaction
smaller screen
frequent navigation
one-handed use
```

Avoid large animations that repeatedly move the entire screen.

---

## 100. Desktop Motion

Desktop may use:

```text
hover
side-panel movement
layout transitions
drag feedback
```

more often because more context remains visible simultaneously.

Keep interactions precise.

---

## 101. Tablet Motion

Tablet should remain touch-friendly.

Do not assume desktop hover interaction merely because the screen is wide.

Motion should follow input capability rather than only viewport width.

---

## 102. Reduced Motion

Souris must respect:

```text
prefers-reduced-motion
```

This is a core accessibility requirement.

Reduced motion does not mean removing all visual feedback.

It means avoiding unnecessary spatial movement.

---

## 103. Reduced-Motion Strategy

When reduced motion is enabled:

```text
large translations should be removed or minimized
spring movement should be reduced
decorative movement should stop
continuous decorative animation should stop
```

State changes may still use:

```text
instant change
short opacity transition
```

where appropriate.

---

## 104. Reduced Motion and Drag

Drag and drop must remain usable with reduced motion.

Direct pointer/finger movement remains necessary.

Settling and reordering animations may be shortened or removed.

---

## 105. Reduced Motion and Navigation

Navigation should not use large directional page transitions when reduced motion is enabled.

Prefer:

```text
instant transition
or
very short opacity
```

---

## 106. Reduced Motion and Brand Animation

Brand animations should be skipped or substantially simplified when reduced motion is requested.

The user should reach usable content immediately.

---

## 107. Motion Must Not Carry Meaning Alone

Important state changes must remain understandable without animation.

Examples:

```text
conflict
error
success
low stock
processing availability
```

must have persistent visual/textual representation.

Animation only supports the message.

---

## 108. Focus and Motion

Focus changes should not trigger distracting animation.

A clear focus ring is generally sufficient.

Avoid moving focused controls.

---

## 109. Accessibility and Timing

Do not make users complete actions before an animation finishes.

Do not automatically dismiss important information faster because the animation is short.

Motion timing and content-reading timing are different concerns.

---

## 110. Motion Testing

Tests should generally verify final behavior, not exact animation frames.

Examples:

```text
drawer opens
appointment moves to correct position
service order changes
sale item appears
dialog closes
```

Avoid tests tightly coupled to exact duration values unless testing the motion system itself.

---

## 111. Visual Testing

Screenshots should usually be captured in stable final states.

Disable or complete animations before screenshot comparison where necessary.

This reduces false visual-regression differences.

---

## 112. Reduced-Motion Testing

Important animated workflows should eventually be checked with:

```text
prefers-reduced-motion: reduce
```

particularly:

```text
navigation
dialogs
drawers
drag and drop
onboarding
```

---

## 113. Motion Tokens

The design-system implementation should eventually centralize:

```text
durations
easing
spring configuration
```

Potential conceptual tokens:

```text
--motion-duration-instant
--motion-duration-fast
--motion-duration-normal
--motion-duration-medium
--motion-duration-slow

--motion-ease-standard
--motion-ease-enter
--motion-ease-exit
```

Exact implementation may differ.

---

## 114. Do Not Scatter Timing Values

Avoid repeatedly writing arbitrary values such as:

```text
173 ms
287 ms
420 ms
```

inside unrelated components.

Use shared tokens for common behavior.

Unique values may be used when a specific visual reference requires them.

---

## 115. Motion Component Variants

Reusable UI primitives may define motion behavior centrally.

Example:

```text
Dialog
Drawer
BottomSheet
Popover
Toast
```

Feature components should not independently recreate basic overlay motion unless they have a specific need.

---

## 116. Feature-Specific Motion

Some motion belongs specifically to a feature.

Examples:

```text
appointment timeline transitions
service drag-and-drop
scanner feedback
sale-line insertion
```

These should remain in their feature while consuming shared motion tokens.

---

## 117. No Motion Abstraction Too Early

Do not create a large generic animation framework before real UI exists.

Introduce reusable motion abstractions only when repeated patterns become clear.

Prefer simple implementations first.

---

## 118. Motion Debugging

If animation causes:

```text
layout shift
input delay
scroll problems
drag lag
hydration issues
visual-test instability
```

correct the problem rather than accepting it for visual polish.

Functional reliability takes priority.

---

## 119. Design Reference

Approved motion behavior should ultimately remain consistent with:

```text
docs/design/design-system.md
docs/design/responsive.md
docs/design/references/
```

Motion should feel like part of the same visual system.

---

## 120. Current Motion Priorities

The initial product should prioritize motion for:

```text
navigation state
bottom sheets
dialogs
appointment editing
service drag and drop
agenda timeline changes
scanner confirmation
sale-line changes
success feedback
onboarding
```

Do not attempt to animate every screen during the first implementation.

---

## 121. Scheduling Motion Priority

Scheduling-related motion has particularly high value because Souris contains non-trivial time behavior.

Users should visually understand when:

```text
a service moves
a processing period changes
another appointment fits inside free time
a conflict appears
a conflict disappears
```

This is functional motion, not decoration.

---

## 122. PWA Considerations

When Souris runs as an installed PWA, navigation may feel closer to a native application.

Motion may support that feeling.

However, do not attempt to imitate native iOS or Android animation exactly.

Souris should preserve its own motion identity.

---

## 123. Device Performance

Motion must remain acceptable on mid-range mobile devices.

Do not design only for high-end desktop hardware.

Avoid unnecessary simultaneous animated elements.

---

## 124. User Input Takes Priority

If the user interacts during an animation, the application should respond.

Avoid locking normal interaction until transitions finish unless the underlying operation genuinely cannot be interrupted.

---

## 125. Interruptible Motion

Where practical, layout and navigation animations should handle interruption naturally.

Examples:

```text
drawer reversed while opening
drag item moved immediately
rapid navigation
```

Avoid animations that leave elements stuck in intermediate states.

---

## 126. Motion and Data Refresh

When data refreshes, do not animate every unchanged element.

Only meaningful changes should attract attention.

Example:

```text
stock 6 → 5
```

may animate.

Unchanged product cards should remain stable.

---

## 127. Motion and Real-Time Updates

If future realtime behavior is introduced, newly changed information may receive subtle emphasis.

Do not create constant visual movement in a busy agenda.

Realtime updates should remain calm and understandable.

---

## 128. Final Motion Rule

Souris motion should make the interface easier to understand, not harder to ignore.

The desired result is:

```text
responsive without being abrupt
playful without being childish
premium without being slow
animated without being distracting
```

Every animation should answer at least one useful question:

```text
What changed?

Where did it go?

What just happened?

What should I notice?
```

If an animation answers none of those questions, it probably does not need to exist.
