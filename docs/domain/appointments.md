# Souris — Appointments Domain

## 1. Purpose

This document defines the appointment and scheduling domain of Souris.

It is the canonical reference for:

- services;
- service phases;
- appointments;
- appointment items;
- appointment phases;
- processing time;
- client presence;
- staff occupation;
- appointment overlap;
- timeline calculation;
- conflict detection;
- free-slot detection;
- service ordering;
- duration overrides;
- price overrides;
- scheduling invariants.

The scheduling engine is one of the core differentiating features of Souris.

Business rules defined here must live in the framework-independent domain layer and must not be reimplemented independently inside React components.

---

## 2. Core Scheduling Principle

A Souris appointment is not one indivisible blocked time range.

A client may remain present in the business while the professional becomes temporarily available.

Example:

```text
09:00 → 09:15
Root color application
Professional occupied

09:15 → 09:50
Processing time
Professional available
```

The client is still present between 09:15 and 09:50.

The professional is not occupied during that period.

Souris must therefore distinguish between:

```text
client presence
staff occupation
processing time
```

This distinction is fundamental to the entire scheduling engine.

---

## 3. Appointments May Overlap

Two appointments may overlap in clock time.

Overlap is not automatically a scheduling conflict.

Example:

```text
Lynda

09:00 → 09:15
Root color application
Staff occupied

09:15 → 09:50
Processing time
Staff available
```

A second client may be scheduled:

```text
Sofia

09:15 → 09:45
Blow-dry
Staff occupied
```

This is valid.

The appointments overlap between:

```text
09:15 → 09:45
```

but their staff-required phases do not overlap.

Therefore there is no conflict.

---

## 4. Conflict Definition

A scheduling conflict exists when two phases requiring the same professional overlap.

Conceptually:

```text
requiresStaff = true
```

versus another phase where:

```text
requiresStaff = true
```

during the same time range.

Conflict detection must never use only:

```text
appointment.start
appointment.end
```

because this would incorrectly block processing periods.

The correct question is:

> Do any staff-required phases overlap?

---

## 5. Generic Scheduling Model

The scheduling engine must remain profession-independent.

Use generic concepts such as:

```text
Service
ServicePhase
Appointment
AppointmentItem
AppointmentPhase
StaffMember
```

Do not make the engine depend on concepts such as:

```text
HairColor
Hairdresser
RootColor
Gloss
```

These are business data and presentation labels.

The scheduling engine only needs to understand:

```text
duration
order
staff requirement
time
```

---

## 6. Service

A `Service` represents something the business can book.

Examples for hair:

```text
Root color
Gloss
Treatment
Cut and blow-dry
Blow-dry
```

Examples for aesthetics:

```text
Facial
Eyelash tint
Massage
Eyebrow waxing
```

A service contains default catalog values.

Conceptually:

```ts
type Service = {
  id: string;
  businessId: string;
  name: string;
  type: ServiceType;
  price: number;
  phases: ServicePhase[];
  active: boolean;
};
```

These values represent defaults used when creating an appointment.

---

## 7. Service Type

The initial business-facing service types are:

```ts
type ServiceType = "SERVICE" | "TECHNIQUE";
```

This distinction is useful for the user experience.

The scheduling engine should not require separate algorithms for both types.

Both are ultimately represented using phases.

---

## 8. Simple Service

A simple service normally contains one staff-required phase.

Example:

```text
Cut and blow-dry

Duration:
45 min

Price:
45 €

Phase:
45 min
requiresStaff = true
```

Conceptually:

```ts
{
  name: "Cut and blow-dry",
  type: "SERVICE",
  price: 45,
  phases: [
    {
      name: "Cut and blow-dry",
      durationMinutes: 45,
      requiresStaff: true
    }
  ]
}
```

---

## 9. Technique

For the current production requirements, a technique contains:

```text
one active/application phase
+
one processing-time phase
```

Example:

```text
Root color

Application
15 min
requiresStaff = true

Processing
35 min
requiresStaff = false
```

Conceptually:

```ts
{
  name: "Root color",
  type: "TECHNIQUE",
  price: 55,
  phases: [
    {
      name: "Application",
      durationMinutes: 15,
      requiresStaff: true
    },
    {
      name: "Processing",
      durationMinutes: 35,
      requiresStaff: false
    }
  ]
}
```

For the current V1, one technique has exactly one processing-time phase.

Do not introduce multiple processing phases until a real requirement exists.

---

## 10. Generic Phase Model

A phase represents one continuous part of a service.

Conceptually:

```ts
type ServicePhase = {
  id: string;
  name: string;
  durationMinutes: number;
  requiresStaff: boolean;
};
```

The critical property is:

```ts
requiresStaff;
```

When:

```text
requiresStaff = true
```

the professional is occupied.

When:

```text
requiresStaff = false
```

the client remains in the appointment but the professional is available.

---

## 11. Appointment

An `Appointment` represents one client's booked visit.

Conceptually:

```ts
type Appointment = {
  id: string;
  businessId: string;
  clientId: string;
  staffMemberId: string;
  startAt: string;
  status: AppointmentStatus;
  items: AppointmentItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
```

The exact persistence representation may evolve.

The business semantics must remain equivalent.

---

## 12. Appointment Status

Initial statuses may include:

```ts
type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";
```

Scheduling calculations should normally ignore appointments that no longer occupy the agenda.

For example:

```text
CANCELLED
```

appointments must not block availability.

Exact filtering rules will be implemented when appointment lifecycle behavior is introduced.

---

## 13. Appointment Item

An `AppointmentItem` is a service added to one appointment.

An appointment may contain several items.

Example:

```text
Root color
Gloss
Treatment
Cut and blow-dry
```

Conceptually:

```ts
type AppointmentItem = {
  id: string;
  serviceId: string;
  order: number;
  serviceName: string;
  serviceType: ServiceType;
  price: number;
  phases: AppointmentPhase[];
};
```

The item stores a snapshot of relevant catalog data.

---

## 14. Appointment Phase

Appointment phases are snapshots of service phases.

Conceptually:

```ts
type AppointmentPhase = {
  id: string;
  name: string;
  durationMinutes: number;
  requiresStaff: boolean;
};
```

They must not depend dynamically on the current catalog after the appointment has been created.

---

## 15. Historical Snapshot Rule

Catalog values are defaults.

Appointments preserve the values used when they were created.

Example:

Today:

```text
Cut and blow-dry
45 €
45 min
```

Six months later:

```text
Cut and blow-dry
50 €
50 min
```

An older appointment must remain:

```text
45 €
45 min
```

Changing the service catalog must not rewrite appointment history.

---

## 16. Appointment Overrides

The user may modify values for one appointment without changing the catalog.

Supported appointment-level overrides include:

```text
service price
phase duration
processing duration
```

Example:

Catalog:

```text
Root color

Application:
15 min

Processing:
35 min

Price:
55 €
```

Specific appointment:

```text
Application:
20 min

Processing:
40 min

Price:
60 €
```

These changes apply only to that appointment.

---

## 17. Service Order

Appointment items are ordered.

Example:

```text
1. Root color
2. Gloss
3. Treatment
4. Cut and blow-dry
```

The user must be able to reorder these items.

The UI will use drag and drop.

The domain must not depend on drag-and-drop technology.

It only receives the resulting order and recalculates the timeline.

---

## 18. Timeline Calculation

The timeline begins at:

```text
appointment.startAt
```

Each phase starts immediately after the preceding phase finishes.

Example appointment starts at:

```text
09:00
```

Services:

```text
Root color
15 min application
35 min processing

Gloss
10 min active
10 min processing

Treatment
10 min

Cut and blow-dry
45 min
```

Generated timeline:

```text
09:00 → 09:15
Root color — Application
requiresStaff = true

09:15 → 09:50
Root color — Processing
requiresStaff = false

09:50 → 10:00
Gloss
requiresStaff = true

10:00 → 10:10
Gloss — Processing
requiresStaff = false

10:10 → 10:20
Treatment
requiresStaff = true

10:20 → 11:05
Cut and blow-dry
requiresStaff = true
```

Appointment presence:

```text
09:00 → 11:05
```

Staff occupied time:

```text
15 + 10 + 10 + 45
= 80 min
```

Processing/free time:

```text
35 + 10
= 45 min
```

---

## 19. Timeline Output

The scheduling engine should eventually produce explicit calculated phases.

Conceptually:

```ts
type TimelinePhase = {
  appointmentId: string;
  appointmentItemId: string;
  phaseId: string;
  label: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  requiresStaff: boolean;
};
```

The UI consumes this calculated timeline.

The UI must not manually calculate phase start and end times.

---

## 20. Appointment End

Appointment end time is derived.

Conceptually:

```text
appointmentEnd
=
startAt
+
sum(all phase durations)
```

Do not treat the end time as an independent source of truth unless persistence later requires a controlled derived projection.

The domain calculation remains canonical.

---

## 21. Client Presence Duration

Client presence duration is:

```text
appointment end
-
appointment start
```

It includes:

```text
staff-required time
+
processing time
```

This may be displayed to the user when creating an appointment.

Example:

```text
Client presence
2 h 05
```

---

## 22. Staff Occupied Duration

Staff occupied duration is:

```text
sum(duration of every phase where requiresStaff = true)
```

Example:

```text
Staff time
1 h 20
```

This is distinct from client presence duration.

---

## 23. Processing Duration

Processing/free duration is:

```text
sum(duration of every phase where requiresStaff = false)
```

Example:

```text
Processing time
45 min
```

This is useful in the appointment editor and agenda.

---

## 24. Occupied Ranges

The scheduling engine must be able to derive staff-occupied ranges.

Example timeline:

```text
09:00 → 09:15 occupied
09:15 → 09:50 available
09:50 → 10:00 occupied
10:00 → 10:10 available
10:10 → 11:05 occupied
```

Expected occupied ranges:

```text
09:00 → 09:15

09:50 → 10:00

10:10 → 11:05
```

These ranges are the basis of conflict detection.

---

## 25. Free Ranges

The scheduling engine must be able to identify processing periods during which the professional is available.

From the previous example:

```text
09:15 → 09:50
35 min available

10:00 → 10:10
10 min available
```

These ranges must remain associated with the original appointment so the UI can display context such as:

```text
Lynda
Root color processing
35 min available
```

---

## 26. Overlap Example

Appointment A:

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

Appointment B:

```text
Sofia

09:15 → 09:45
Blow-dry
occupied
```

This is valid.

Appointment B fits entirely inside Appointment A's available processing period.

---

## 27. Conflict Example

Appointment A:

```text
09:50 → 10:00
occupied
```

Appointment B:

```text
09:30 → 10:00
occupied
```

Overlap:

```text
09:50 → 10:00
```

Both require the same professional.

This is a conflict.

The domain should report the conflicting interval.

---

## 28. Nested Processing Times

Souris must support several clients being present simultaneously.

Example:

```text
09:00
Lynda application

09:15
Lynda processing begins

09:15
Sofia technique application begins

09:30
Sofia processing begins

09:50
Lynda must be resumed

10:05
Sofia may need to be resumed
```

The scheduling engine must calculate availability from all active staff-required phases.

It must not assume only one client can be present at a time.

---

## 29. Multiple Simultaneous Processing Clients

Several clients may be in processing time at the same moment.

This is valid.

Example:

```text
09:30

Lynda
processing
requiresStaff = false

Sofia
processing
requiresStaff = false
```

The professional remains available if no other staff-required phase exists at that moment.

---

## 30. Sequential Phase Rule

Within one appointment, phases are sequential.

A later phase cannot begin before the previous phase ends.

Reordering services changes the sequence and therefore recalculates all later phase times.

---

## 31. Reordering Example

Original:

```text
Root color
Gloss
Treatment
Cut and blow-dry
```

If the user changes the order to:

```text
Root color
Gloss
Cut and blow-dry
Treatment
```

the engine recalculates the full timeline from the appointment start.

No phase keeps an old absolute start time.

---

## 32. Available Slot Definition

A slot is available when the requested staff-required time does not overlap an existing staff-required phase.

For simple services, this is straightforward.

Example:

```text
Available range:
09:15 → 09:50

Requested service:
30 min staff-required
```

Possible:

```text
09:15 → 09:45
```

Remaining free time:

```text
5 min
```

---

## 33. Techniques Inside Free Slots

A technique may fit into a free period even if its total client presence extends beyond that period.

Example:

Available staff window:

```text
09:15 → 09:50
```

Technique:

```text
Application
15 min occupied

Processing
35 min available
```

The professional only needs:

```text
09:15 → 09:30
```

for the first phase.

Therefore starting the technique at 09:15 may be valid even though that new client remains present beyond 09:50.

However, the engine must also verify the future staff-required phases of that new appointment.

A technique must not be considered valid based only on its first phase.

The complete generated timeline must be conflict-checked.

---

## 34. Full Timeline Validation

When testing whether an appointment can start at a particular time:

1. build the complete appointment timeline;
2. extract all staff-required phases;
3. compare them with existing staff-required phases;
4. report any conflicts.

Never validate only the first phase.

---

## 35. Suggested Slots

A future scheduling helper may suggest valid start times.

Suggested slots should be generated using the complete appointment timeline.

The algorithm may eventually answer questions such as:

```text
When can this 30-minute blow-dry fit?

When can this technique begin without causing a later conflict?

Which processing periods can accept another appointment?
```

Implementation details will be designed when this feature is developed.

---

## 36. Manual Conflict Override

The professional should remain in control of the agenda.

The UI may eventually allow an explicit override when a user intentionally creates a scheduling conflict.

The default behavior should:

```text
detect conflict
warn clearly
identify conflicting appointment
identify conflicting time
require explicit confirmation
```

The domain must still report the conflict accurately.

The UI decides whether an authorized override is allowed.

---

## 37. Optional Buffer Time

A future business setting may define a scheduling buffer.

Example:

```text
Processing period:
09:15 → 09:50

Buffer:
5 min
```

Effective suggested booking range:

```text
09:15 → 09:45
```

This is not required for the first scheduling-engine implementation.

Do not bake a fixed buffer into the core algorithm.

Any future buffer must be configurable.

Default behavior is:

```text
buffer = 0
```

---

## 38. Invalid Durations

Phase duration must be positive.

Invalid examples:

```text
0 min
-10 min
```

Business validation must reject invalid phase durations.

The exact validation mechanism will be determined during implementation.

---

## 39. Prices

Service catalog prices must be non-negative.

Appointment item prices may be overridden.

Appointment total is:

```text
sum(appointment item prices)
```

Processing time does not create a separate charge unless represented as part of the service price.

---

## 40. Appointment Total

The appointment total must be calculated from appointment item snapshots.

Conceptually:

```text
Root color       55 €
Gloss            25 €
Treatment        15 €
Cut + blow-dry   45 €

Total           140 €
```

Do not recalculate historical totals using the current service catalog.

---

## 41. Time Representation

Scheduling logic must use a consistent time representation.

Business calculations should not rely on formatted strings such as:

```text
"09:15"
```

as the internal canonical representation.

The implementation phase will define the exact TypeScript representation.

Formatting belongs to the presentation layer.

The domain should operate on deterministic time values.

---

## 42. Time Zone

Souris initially targets one physical business operating in France.

Appointments represent business-local wall-clock times.

Time-zone handling must nevertheless be explicit when persistence is introduced.

Do not scatter implicit browser-local-time assumptions throughout the codebase.

The persistence strategy will be documented when database integration begins.

---

## 43. Agenda Visualization

The agenda must visually preserve the distinction between:

```text
client present + staff occupied

client present + staff available
```

Processing phases must remain visible.

They must not disappear simply because they do not block the professional.

The UI should be able to show:

```text
Processing time
35 min available
```

directly in the agenda.

---

## 44. Overlapping Visual Cards

Appointments may visually overlap or occupy multiple lanes.

This is a presentation concern.

The domain provides:

```text
appointment timelines
phase ranges
occupation information
```

The feature layer determines how overlapping appointments are laid out.

Do not add visual lane information to core appointment entities.

---

## 45. Appointment Creation Flow

The intended business flow is:

```text
select date and start time
select existing client or create client
add one or more services
reorder services if necessary
adjust durations if necessary
adjust prices if necessary
preview generated timeline
validate conflicts
save appointment
```

The domain supports this workflow but does not depend on the UI implementation.

---

## 46. Draft Appointment

During appointment creation, the UI may maintain an appointment draft.

A draft may change frequently as:

```text
services are added
services are removed
services are reordered
durations are edited
prices are edited
start time changes
```

Every meaningful draft change should allow the timeline to be recalculated immediately.

Draft state belongs to the appointment feature.

Timeline calculation belongs to the domain.

---

## 47. Source of Truth

The scheduling source of truth is:

```text
appointment start
+
ordered appointment items
+
ordered phase snapshots
```

Derived values include:

```text
phase start times
phase end times
appointment end
client presence duration
staff occupied duration
processing duration
occupied ranges
free ranges
```

Avoid maintaining several independent mutable representations of the same timeline.

---

## 48. Pure Scheduling Functions

Core scheduling algorithms should preferably be pure functions.

Given the same inputs, they should produce the same outputs.

Examples:

```text
buildAppointmentTimeline
getOccupiedRanges
getFreeRanges
detectConflicts
calculateAppointmentTotal
```

They must not:

```text
query Supabase
read React state
access the browser
modify global variables
perform UI side effects
```

---

## 49. Persistence Independence

The scheduling engine must not depend on the database schema.

It should receive domain values and return domain values.

A future persistence layer may map database records into the scheduling domain.

Changing persistence technology must not require rewriting the scheduling engine.

---

## 50. Testing Requirement

The scheduling engine is business-critical.

It requires comprehensive automated tests before production UI depends on it.

At minimum, tests must cover:

```text
simple service
single technique
processing time
appointment end calculation
staff occupied duration
free processing duration
valid overlap
invalid overlap
multiple simultaneous processing clients
future occupied-phase conflict
service reordering
duration override
price override
appointment total
cancelled appointment exclusion when applicable
boundary-touching appointments
```

Detailed testing conventions belong in:

```text
docs/development/testing.md
```

---

## 51. Boundary-Touching Rule

Two occupied phases that touch exactly at their boundaries do not conflict.

Example:

```text
Appointment A
09:00 → 09:30

Appointment B
09:30 → 10:00
```

This is valid.

The conflict model therefore follows half-open interval semantics conceptually:

```text
[start, end)
```

The end instant of one phase does not overlap the start instant of the next.

---

## 52. Conflict Reporting

Conflict detection should eventually provide enough information for the UI to explain the problem.

Conceptually, a conflict may identify:

```text
appointment A
appointment B
conflicting phase A
conflicting phase B
conflict start
conflict end
```

Avoid returning only:

```text
true
```

when richer conflict information is useful.

The exact return type will be defined during implementation.

---

## 53. No UI-Specific Data in Domain

The appointment domain must not contain concepts such as:

```text
card color
pixel position
lane width
CSS class
animation state
drag handle
modal state
```

These belong to presentation.

The domain only describes the business timeline.

---

## 54. Current V1 Assumptions

For the first production scheduling engine:

```text
one business
one active professional
one processing period maximum per technique
no room scheduling
no equipment scheduling
no mandatory buffer
no recurring appointments
no group appointments
```

These assumptions simplify the first implementation.

They must not be confused with permanent product limitations.

---

## 55. Future Evolution

Potential future scheduling requirements include:

```text
multiple staff members
staff-specific services
working hours
breaks
holidays
rooms
equipment
appointment buffers
recurring appointments
customer self-booking
reminders
waiting lists
multi-location businesses
```

Do not implement these until required.

When introduced, preserve the core distinction between:

```text
client presence
staff occupation
resource occupation
```

---

## 56. Final Scheduling Rule

The defining rule of Souris scheduling is:

> **A client occupying time in the salon does not necessarily mean the professional is occupied.**

Every scheduling decision must preserve this distinction.

The agenda, conflict engine, available-slot engine, appointment editor, and future booking suggestions must all derive from the same phase-based scheduling model.
