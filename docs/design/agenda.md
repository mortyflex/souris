# Agenda visual language

## Purpose

The agenda is the primary working surface of Souris.

It must allow a beauty professional to understand their day or week almost instantly, without having to open every appointment.

The agenda must prioritize:

1. immediate readability;
2. temporal accuracy;
3. visual recognition of services;
4. clear distinction between staff-required and processing time;
5. effortless understanding of overlaps;
6. fluid navigation and interaction;
7. strong mobile, tablet, and desktop experiences.

The agenda must never feel like a generic calendar component with Souris styling added on top.

It is a core product experience.

---

## Core principles

### Time determines geometry

Appointment geometry is derived from real scheduling data.

The visual height and vertical position of an appointment are determined by its timeline.

Content must adapt to the available space.

The UI must never increase the height of an appointment simply because more text needs to be displayed.

For example, a 30-minute appointment must remain visually shorter than a 90-minute appointment.

### Information adapts to available space

A short appointment displays only essential information.

A longer appointment can progressively expose more information.

Example:

Short event:

- client name;
- primary service;
- start time.

Medium event:

- client name;
- service;
- time range;
- duration.

Long event:

- client name;
- services;
- time range;
- duration;
- phase timeline;
- optional secondary metadata.

The event component must therefore be designed for progressive disclosure.

### Color supports recognition

Color is an information layer, not decoration.

A professional should gradually learn to recognize services visually without reading every event.

However, color must never be the only way information is communicated.

Labels, text, phase structure, icons, patterns, or other visual cues must remain available.

### Processing time must be obvious

A technique processing phase is fundamentally different from active professional time.

The agenda must make this distinction immediately visible.

Processing time should feel visually lighter than staff-required time.

Examples of acceptable differentiation include:

- lighter tint;
- reduced opacity;
- subtle pattern;
- dotted or striped treatment;
- explicit `Pose` / `Processing` label.

The user must be able to see at a glance that another appointment may fit inside that period.

---

# Service visual identity

## Configurable service colors

Souris must not rely on a globally hardcoded list of profession-specific service categories.

The domain remains generic across beauty professions.

Instead, services or service categories can receive a visual color identity.

A future model may conceptually expose something similar to:

```ts
type ServiceColorKey = "lavender" | "rose" | "peach" | "sky" | "mint" | "sand";
```

The exact persistence model will be defined when the service catalog is implemented.

The important rule is:

> visual identity belongs to configurable business data, not to a globally hardcoded hairdresser taxonomy.

A service can inherit the color of its category, with the possibility of an individual override later if useful.

---

## Initial Souris agenda palette

The agenda palette must remain soft, premium, readable, and compatible with the global Souris identity.

Suggested visual roles:

### Lavender

Suitable for services such as:

- cutting;
- shaping;
- general service work.

Visual character:

- calm;
- structured;
- recognizable.

### Rose

Suitable for:

- coloring;
- tinting;
- color-related services.

Visual character:

- expressive;
- warm;
- strongly associated with the Souris identity.

### Peach

Suitable for:

- highlights;
- balayage;
- long technical services.

Visual character:

- warm;
- technical without feeling clinical.

### Sky

Suitable for:

- styling;
- blow-dry;
- finishing.

Visual character:

- light;
- fresh;
- visually distinct from technical services.

### Mint

Suitable for:

- care;
- treatment;
- wellness-oriented services.

Visual character:

- calm;
- restorative.

### Sand

Suitable for:

- uncategorized services;
- neutral services;
- fallback visual identity.

These mappings are demonstration defaults only.

They must not become global business rules.

---

# Day View

## Purpose

Day View is the detailed operational view.

It should answer immediately:

- who is coming;
- when;
- for what;
- how long;
- when the professional is occupied;
- when processing time occurs;
- where another client can potentially fit;
- whether appointments overlap.

Day View may expose more information than Week View.

---

## Day View structure

The desktop and tablet Day View uses a vertical time axis.

Conceptually:

```text
08:00 ─────────────────────────────────────────

09:00 ──┌─────────────────────────────────────┐
        │ Lynda                              │
        │ Couleur racines + brushing         │
        │                                    │
09:15   │ ███████░░░░░░░░░░░░░░██████     │
        │ actif       pose        brushing   │
        │                                    │
10:10   └─────────────────────────────────────┘

10:30 ─────────────────────────────────────────
```

The time grid should support the schedule.

It must not dominate the screen.

Hour lines are stronger.

Quarter-hour lines are subtle.

Large empty areas should not look like a spreadsheet.

---

# Day event anatomy

A Day View appointment uses a dedicated `AgendaDayEvent` component.

It is not the same component as a detailed appointment card.

Possible anatomy:

```text
┌─────────────────────────────────────────┐
│ 09:00 — 10:10                   70 min │
│ Lynda                                   │
│ Couleur racines · Brushing              │
│                                         │
│ █████████░░░░░░░░░░░░████████████     │
│ Application      Pose       Brushing    │
└─────────────────────────────────────────┘
```

The exact amount of information displayed depends on the event height.

---

## Day event information hierarchy

Priority 1:

- client name.

Priority 2:

- primary service or concise service summary.

Priority 3:

- start time or time range.

Priority 4:

- visual phase timeline.

Priority 5:

- total duration.

Priority 6:

- secondary information such as price or status.

Price does not need to appear inside every agenda block.

The agenda is primarily a scheduling surface, not an invoice.

---

# Compact event variants

Appointments can have several density levels.

## Extra compact

Used when vertical space is extremely constrained.

Example:

```text
Sofia · Coupe
09:15
```

## Compact

Example:

```text
Sofia
Coupe · 09:15–09:45
```

## Standard

Example:

```text
Sofia
Coupe
09:15–09:45 · 30 min
```

## Detailed

Used for sufficiently tall appointments.

Example:

```text
Lynda
Couleur racines · Brushing
09:00–10:10

██████░░░░░░░██████
Application · Pose · Brushing
```

The component chooses the presentation based on available visual space.

---

# Phase timeline

Long or technical appointments should expose a miniature representation of their phases.

Example:

```text
████████░░░░░░░░░░████████
Application      Pose      Brushing
```

Staff-required phases use the stronger service color.

Processing phases use a lighter visual treatment.

For example:

```text
active phase
→ solid service color

processing phase
→ pale service color
→ subtle pattern or reduced opacity
```

Phase widths must be proportional to their durations.

Example:

```text
Application: 15 min
Pose:        35 min
Brushing:    20 min
```

must visually produce approximately:

```text
21% / 50% / 29%
```

of the phase timeline.

This representation is derived from `AppointmentPhase[]`.

No duplicate scheduling logic should exist in the component.

---

# Processing periods

Processing time is one of the most important Souris agenda concepts.

A processing period should communicate:

> this client is still in progress, but the professional is currently available.

It must therefore remain visible as part of the appointment while being visually lighter.

Possible visual treatment:

```text
┌─────────────────────────┐
│ Lynda                   │
│ Couleur racines         │
├─────────────────────────┤
│ ACTIVE                  │
├ · · · · · · · · · · · ┤
│ POSE · 35 min           │
├ · · · · · · · · · · · ┤
│ ACTIVE                  │
└─────────────────────────┘
```

The final implementation may use a horizontal or vertical phase representation depending on available event dimensions.

---

# Overlapping appointments

Overlaps are normal in Souris.

They are not automatically scheduling errors.

Example:

```text
Lynda
09:00–09:15 active
09:15–09:50 processing
09:50–10:10 active

Sofia
09:15–09:45 active
```

This is valid.

The agenda must represent both appointments clearly.

---

## Desktop overlap layout

Simultaneous appointments should be placed in adjacent columns.

Conceptually:

```text
09:00  ┌──────────────────────┐
       │ Lynda                │
       │ Couleur              │
       │ ACTIVE               │
09:15  │ PROCESSING           │ ┌──────────────────┐
       │                      │ │ Sofia            │
       │                      │ │ Coupe            │
09:45  │                      │ └──────────────────┘
09:50  │ ACTIVE               │
       └──────────────────────┘
```

The layout algorithm must calculate overlapping event groups.

Appointments must never simply render on top of one another.

---

## Conflict visualization

A valid overlap and an actual conflict are different concepts.

Valid overlap:

```text
processing phase
+
another active appointment
```

Actual conflict:

```text
active phase
+
another active phase
for the same staff member
```

An actual conflict should eventually receive an explicit warning treatment.

Possible examples:

- warning icon;
- colored outline;
- conflict badge;
- dedicated warning state.

Conflict styling must not be confused with normal service colors.

---

# Mobile Day View

Mobile Day View must not be a compressed desktop calendar.

It uses the same data and scheduling engine but a different composition.

The mobile layout prioritizes readability and touch interaction.

Conceptually:

```text
09:00
│
├─ Lynda
│  Couleur racines
│  09:00–10:10
│  ███░░░░░████
│
09:15
│
├─ Sofia
│  Coupe
│  09:15–09:45
│
10:00
│
```

The time rail remains visible.

Events use nearly the full available width.

Overlaps should be represented without reducing cards to unusable narrow columns.

Possible mobile strategies include:

- slight horizontal indentation;
- overlap indicator;
- layered event grouping;
- dedicated compact overlap row.

The final interaction pattern should favor clarity over mathematically reproducing the desktop geometry.

---

# Week View

## Purpose

Week View is a planning overview.

It should answer:

- which days are busy;
- where free periods exist;
- when clients arrive;
- what kind of services dominate the week;
- whether long technical services are scheduled;
- where unusual overlaps occur.

Week View displays less information per event than Day View.

---

## Desktop Week View

Desktop and wide tablet layouts use a multi-column calendar.

Example:

```text
        LUN        MAR        MER        JEU        VEN

09:00   Lynda      Maya                  Sofia
        Couleur    Coupe                 Couleur

10:00              Nour       Inès

11:00   Sarah                 Lynda

12:00

13:00   Inès       Sofia
```

Each day owns one column.

The time axis is shared.

Service colors should make the week visually understandable before reading every label.

---

# Week event anatomy

Week View uses a dedicated `AgendaWeekEvent`.

It is intentionally more compact.

Typical content:

```text
09:00
Lynda
Couleur
```

or when more vertical space exists:

```text
09:00–10:10
Lynda
Couleur racines
```

The Week View event should not display the complete phase timeline unless sufficient space exists and it provides real value.

Processing time can instead use a lighter internal segment or visual indicator.

---

# Mobile Week experience

A seven-column desktop calendar should not simply be squeezed onto a phone.

Mobile week navigation may use:

- horizontally swipeable days;
- compact day selector;
- one selected day visible at a time;
- short week summary indicators.

Example:

```text
L   M   M   J   V   S   D
16  17  18  19  20  21  22
●   ●●  ●   ●●●     ●

Monday 16

09:00  Lynda
11:00  Maya
13:30  Inès
```

Day View remains the primary detailed mobile experience.

Week mode mainly accelerates navigation between days and communicates workload.

---

# View switcher

The agenda eventually exposes at least:

```text
Jour | Semaine
```

The control should preserve the currently selected date.

Switching views should not unexpectedly jump to another period.

Example:

```text
Sunday 16 August
Day View

switch to Week
↓
week containing Sunday 16 August
```

---

# Navigation

The agenda needs clear date navigation.

Possible structure:

```text
‹     Aujourd'hui     ›
      16 août

Jour | Semaine
```

Desktop may expose more context.

Mobile should keep navigation compact and thumb-friendly.

---

# Visual density

The existing prototype failed because large detailed cards were inserted inside small timeline geometry.

The corrected rule is:

> geometry follows time, content follows available space.

No appointment block may overflow its allocated temporal area.

Text may be progressively hidden or shortened.

The block itself must not become taller than its appointment duration merely to fit content.

---

# Agenda surfaces

The agenda should avoid excessive borders.

Preferred visual hierarchy:

- soft page background;
- subtle grid;
- tinted event surfaces;
- strong typography;
- generous but controlled spacing;
- service color as a meaningful accent.

Avoid:

- white cards everywhere;
- heavy gray borders;
- spreadsheet appearance;
- excessive pills;
- excessive metadata;
- huge empty visual areas with isolated rectangles.

---

# Event shape

Agenda events should feel softer and more integrated into the timeline than generic cards.

Suggested characteristics:

- medium radius rather than oversized floating-card radius;
- tinted background;
- optional stronger left edge or top accent;
- low or no shadow;
- clear selected state;
- clear hover state on pointer devices.

The agenda event is part of the calendar surface.

It should not look like a detached marketing card.

---

# Interaction states

Agenda events eventually need the following states:

```text
default
hover
selected
dragging
conflict
completed
cancelled
processing-heavy
```

These states should remain visually compatible with service colors.

For example, a conflict must not simply turn the whole event red if that destroys its service identity.

---

# Motion

Motion should reinforce spatial understanding.

Potential interactions include:

- event movement during drag and drop;
- subtle resizing while duration changes;
- smooth transition between selected days;
- Day ↔ Week transition;
- event expansion into appointment details;
- animated reflow when appointment ordering changes.

Motion must remain quick and functional.

Avoid decorative animation that slows down agenda usage.

Respect `prefers-reduced-motion`.

---

# Accessibility

Color must not be the only information carrier.

Service identity should also remain readable through text.

Processing phases should use:

- text;
- pattern;
- or another structural difference;

in addition to color.

Text contrast must remain accessible on tinted surfaces.

Touch targets must remain comfortable on mobile.

Focus states must remain visible for keyboard navigation.

---

# Component architecture

The agenda should eventually use distinct components.

```text
Agenda
├── AgendaHeader
├── AgendaViewSwitcher
├── AgendaDateNavigation
│
├── AgendaDayView
│   └── AgendaDayEvent
│       └── AppointmentPhaseTimeline
│
└── AgendaWeekView
    └── AgendaWeekEvent
```

Detailed appointment presentation remains separate:

```text
AppointmentCard
AppointmentDetails
AppointmentEditor
```

`AgendaDayEvent` and `AgendaWeekEvent` are calendar-specific representations.

They should not become generic shared UI primitives.

---

# Domain boundaries

Agenda components consume scheduling results.

They do not reproduce scheduling logic.

Domain functions remain responsible for:

- appointment timeline generation;
- occupied ranges;
- processing ranges;
- conflict detection;
- availability;
- suggested start times.

Agenda UI is responsible for:

- layout;
- visual hierarchy;
- density;
- responsive presentation;
- interaction.

---

# Implementation order

The visual agenda should now be implemented in this order:

1. define service visual color primitives;
2. create `AppointmentPhaseTimeline`;
3. create `AgendaDayEvent`;
4. replace the current Day View event rendering;
5. implement overlap grouping and desktop columns;
6. implement dedicated mobile Day View behavior;
7. create `AgendaWeekEvent`;
8. build desktop/tablet Week View;
9. build mobile week navigation;
10. add Day / Week switching;
11. add interaction and motion polish.

The current visual prototype must not be considered the final agenda direction.

The next implementation should follow this specification rather than trying to patch the existing oversized appointment-card approach.
