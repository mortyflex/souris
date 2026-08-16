# Souris — Clients Domain

## 1. Purpose

This document defines the client domain of Souris.

It is the canonical reference for:

- client identity;
- contact information;
- birthdays;
- client notes;
- appointment history;
- technical notes;
- profession-specific technical information;
- before/after photos;
- purchased products;
- client spending;
- visit frequency;
- client-derived metrics;
- client data integrity.

Client information is a central part of Souris.

The client domain must remain generic enough to support multiple beauty professions while allowing the user experience to use terminology appropriate to the current profession.

Souris follows the principle:

> **Generic in the data model, specific in the user experience.**

---

## 2. Client

A `Client` represents a person receiving services from a business.

A client belongs to one business.

Conceptually:

```ts
type Client = {
  id: string;
  businessId: string;

  firstName: string;
  lastName?: string;

  phone?: string;
  birthDate?: string;

  notes?: string;

  createdAt: string;
  updatedAt: string;
};
```

The exact persistence representation may evolve.

The business semantics defined in this document must remain stable.

---

## 3. Business Ownership

Every client belongs to a business.

Conceptually:

```ts
businessId: string;
```

A client from one business must never automatically become visible to another business.

Future persistence and authorization rules must enforce this isolation.

UI filtering alone is not sufficient for security.

---

## 4. Required Information

The only client information that should be required by the domain is the minimum necessary to create a usable record.

For the initial version, the primary required value is:

```text
firstName
```

Other information may be optional:

```text
lastName
phone
birthDate
notes
```

Do not force the professional to complete an administrative form before creating an appointment.

Client creation must remain fast.

---

## 5. Client Creation During Appointment Booking

A new client may be created directly from the appointment flow.

Expected workflow:

```text
New appointment
      ↓
Choose client
      ↓
Client not found
      ↓
Create client
      ↓
Return immediately to appointment
```

The user must not lose the appointment draft when creating a client.

This is primarily a feature-level UX requirement.

The domain simply supports creation of a valid client record.

---

## 6. Client Identity

Client identity should remain simple.

Use explicit fields such as:

```text
firstName
lastName
```

Do not rely on a single unstructured display-name field as the only source of identity.

A display name may be derived for presentation.

Example:

```text
Sofia Benali
```

may be derived from:

```text
firstName = Sofia
lastName = Benali
```

---

## 7. Phone Number

Phone numbers are useful for:

- identifying a client;
- contacting a client;
- future appointment reminders;
- searching the client file.

The raw user-entered value and normalized comparison behavior must be clearly distinguished when implementation begins.

Do not scatter phone normalization logic throughout components.

If normalization becomes necessary, it should have one canonical implementation.

---

## 8. Birthday

The client may have a birthday.

The business primarily needs:

```text
day
month
```

for client-facing use cases such as birthday awareness.

The year may be known but must not be required.

The implementation must therefore avoid assuming every birthday contains a complete date with a meaningful year.

The exact representation will be defined when the client model is implemented.

---

## 9. General Notes

A client may have general notes.

Examples:

```text
Prefers morning appointments.

Usually asks for a very natural finish.

Call rather than send a message.

Sensitive scalp.
```

General notes describe information relevant across several appointments.

They are different from appointment-specific notes.

Do not duplicate the same note automatically into every appointment.

---

## 10. Appointment History

Client history is primarily derived from appointments.

A client record must not maintain a second manually synchronized appointment-history array as an independent source of truth.

Conceptually:

```text
Client
   ↑
   │ clientId
   │
Appointment
```

The client profile retrieves appointments referencing the client.

This allows Souris to display:

```text
Last appointment
Previous appointments
Services performed
Appointment totals
Visit history
```

---

## 11. Historical Integrity

Client history must remain historically correct.

If a service changes later, previous client appointments must continue to display the snapshots stored when those appointments occurred.

Example:

Historical appointment:

```text
Root color
55 €
15 min application
35 min processing
```

Current catalog:

```text
Root color
60 €
20 min application
40 min processing
```

The client history must still display the historical values.

---

## 12. Client Technical Information

Beauty professionals often need information that is more technical than general notes.

Examples for hair:

```text
color formula
oxidant
mix proportions
processing information
previous formula
```

Examples for aesthetics:

```text
skin protocol
products used
treatment observations
sensitivity information
```

Examples for nails:

```text
base product
color reference
top coat
technical preferences
```

The generic domain must therefore not model all technical information as:

```text
ColorFormula
```

A generic technical-note model should be preferred.

---

## 13. Technical Note

Conceptually:

```ts
type ClientTechnicalNote = {
  id: string;
  businessId: string;
  clientId: string;

  appointmentId?: string;

  type: ClientTechnicalNoteType;
  title: string;
  content: string;

  createdAt: string;
};
```

The exact implementation may evolve.

The important business concepts are:

```text
client ownership
optional appointment relationship
technical category
title
content
history
```

---

## 14. Technical Note Types

Initial generic technical-note categories may conceptually include:

```ts
type ClientTechnicalNoteType =
  | "COLOR_FORMULA"
  | "SKIN_PROTOCOL"
  | "NAIL_FORMULA"
  | "TREATMENT_NOTE"
  | "OTHER";
```

Do not over-engineer the taxonomy initially.

The list may evolve as Souris supports more professions.

The type exists to preserve generic data while allowing profession-specific presentation.

---

## 15. Hair Salon Presentation

For the first production hair-salon experience, technical notes of type:

```text
COLOR_FORMULA
```

may be presented in the UI as:

```text
Formules de coloration
```

Example:

```text
Couleur racines

Majirel 6.0 + 6.13
50 / 50
Oxydant 20 vol
35 min
```

The UI wording can remain highly specific to hair professionals.

The underlying model remains generic.

---

## 16. Technical Note History

Technical notes must preserve history.

Do not overwrite the previous technical note every time a new one is created.

Example:

```text
16 August 2026
Current formula

12 June 2026
Previous formula

4 April 2026
Older formula
```

This allows the professional to:

- understand previous treatments;
- compare changes;
- return to an older formula;
- see technical evolution over time.

---

## 17. Appointment Relationship

A technical note may optionally reference the appointment during which it was created.

Conceptually:

```ts
appointmentId?: string;
```

This allows the client profile to answer:

```text
Which formula was used during this appointment?

Which treatment protocol was used?

Which technical note belongs to this visit?
```

A technical note may also exist without an appointment when necessary.

---

## 18. Client Photos

Souris must support client photos.

The primary initial use case is:

```text
before
after
```

Example:

```text
Appointment — 16 August

Before
[photo]

After
[photo]
```

Photos belong to a client.

They may optionally belong to a specific appointment.

---

## 19. Client Photo

Conceptually:

```ts
type ClientPhoto = {
  id: string;
  businessId: string;
  clientId: string;

  appointmentId?: string;

  type: ClientPhotoType;

  storagePath: string;

  createdAt: string;
};
```

The exact storage representation will be defined when storage integration is implemented.

---

## 20. Client Photo Types

Initial photo types:

```ts
type ClientPhotoType = "BEFORE" | "AFTER" | "OTHER";
```

Do not encode visual presentation information into the domain.

The domain identifies what the photo represents.

The feature layer determines how it is displayed.

---

## 21. Photo Storage

Photo binary data must not be stored directly inside the client entity.

The client domain should reference stored media.

The future storage layer may use Supabase Storage.

The core client domain must not depend on Supabase-specific storage APIs.

---

## 22. Photo Privacy

Client photos are private business data.

They must not be publicly accessible by default.

Future storage configuration must enforce appropriate access control.

Public permanent URLs must not be assumed.

Authorization must protect access to client photos.

---

## 23. Product Purchase History

Products purchased by a client are derived from sales.

Do not maintain an independently edited list such as:

```ts
client.productsPurchased = [...]
```

as a separate source of truth.

Instead:

```text
Client
   ↑
   │ clientId
   │
Sale
   │
   ↓
SaleItem
```

The client profile may derive product purchase history from these records.

---

## 24. Product Purchase Example

The client profile may eventually display:

```text
Products purchased

16 August 2026
Kérastase Genesis
29 €

12 June 2026
Kérastase Chroma
32 €

14 April 2026
Kérastase Genesis
29 €
```

This information is derived from historical sales.

---

## 25. Total Spent

Client total spending is a derived value.

It may include:

```text
completed appointment totals
+
product sales associated with the client
```

The exact reporting definition must remain explicit.

For example, cancelled appointments must not contribute.

Unpaid or partially paid concepts may later affect the calculation if payment tracking is introduced.

For the initial version, total spent should be derived from completed source records.

---

## 26. Do Not Store Total Spent as Primary Truth

Avoid using:

```ts
client.totalSpent;
```

as the only authoritative value.

The source of truth is historical financial activity.

A cached or projected total may later be introduced for performance if needed.

If that happens, it must remain a derived projection, not an independent business fact.

---

## 27. Visit Count

Visit count is derived from relevant appointments.

Conceptually:

```text
number of completed appointments
```

Do not count:

```text
cancelled appointments
```

as completed visits.

The treatment of:

```text
NO_SHOW
```

must remain distinct from successful visits.

---

## 28. Last Visit

The last visit is derived from the most recent completed appointment.

Do not maintain it manually on the client record unless a future controlled projection is justified.

---

## 29. Next Appointment

The next appointment is derived from future active appointments.

The client profile may display:

```text
Next appointment
20 September
10:30
```

This information comes from appointment data.

---

## 30. Visit Frequency

Visit frequency is derived.

It represents the approximate interval between successful visits.

Example:

```text
Average visit
Every 6 weeks
```

The implementation should use completed historical appointments.

Do not calculate meaningful frequency from insufficient history.

For example, one completed visit is not enough to infer an average interval.

---

## 31. Derived Client Summary

The client profile may eventually expose a summary such as:

```text
Sofia Benali

12 visits
1,325 € spent
Average visit every 6 weeks
Last visit 16 August
Next appointment 20 September
6 products purchased
Client since March 2024
```

These values should be derived from canonical records wherever practical.

---

## 32. Client Since

`Client since` may initially derive from:

```text
client.createdAt
```

It should not be confused with the first appointment date if imported historical data predates the Souris client record.

If migration/import requirements later provide an older known client-start date, the model may evolve explicitly.

---

## 33. Searching Clients

The client file must support fast search.

Likely searchable information includes:

```text
first name
last name
phone number
```

Search behavior belongs to the feature/data-access layer.

The client domain defines the relevant searchable information but does not depend on a particular search technology.

---

## 34. Client Ordering

Default client-list ordering is a presentation decision.

Potential options include:

```text
alphabetical
recently visited
upcoming appointment
recently created
```

Do not encode UI ordering rules into the client entity.

---

## 35. Duplicate Clients

Duplicate client records may occur.

Examples:

```text
Sofia
06 12 34 56 78
```

and:

```text
Sofia Benali
0612345678
```

may represent the same person.

The initial version does not need a complex automatic client-merging system.

However, implementation should avoid creating duplicates unnecessarily when an obvious phone match exists.

A future merge workflow may be introduced.

Do not silently merge clients without explicit user control.

---

## 36. Client Deletion

Historical business records should not become invalid because a client is removed from active use.

Therefore, permanent destructive deletion of clients with historical appointments or sales should be approached carefully.

A future implementation may prefer:

```text
archive
deactivate
soft delete
```

over irreversible deletion.

Exact lifecycle behavior will be defined when client management is implemented.

---

## 37. Archived Clients

A future client status may distinguish active and archived clients.

Archived clients:

- should remain in historical appointments;
- should remain in historical sales;
- may be hidden from normal client search;
- may be restorable.

Do not implement this before it is needed.

The architecture must simply avoid assuming deletion is always safe.

---

## 38. Notes and Sensitive Information

Client notes should remain relevant to the professional service.

Do not encourage unnecessary collection of personal data.

Only store information that has a legitimate operational purpose.

Examples include:

```text
service preferences
technical observations
contact preferences
professional notes
```

The product should avoid turning the notes field into an unrestricted personal dossier.

---

## 39. Profession-Specific UX

The client profile may adapt labels to the current profession.

Hair salon:

```text
Formules de coloration
```

Esthetics:

```text
Protocoles de soin
```

Nails:

```text
Notes techniques
```

This presentation adaptation must not require separate client architectures.

---

## 40. Client Profile Sections

For the first hair-salon experience, the intended client profile may contain:

```text
Identity
Contact information
Birthday

Next appointment

Last visit

Visit count
Total spent
Visit frequency

History

Color formulas

Before / after photos

Notes

Products purchased
```

The exact visual hierarchy is defined by the design system and client feature.

---

## 41. Client History Timeline

A client history should be chronological and appointment-centered.

Example:

```text
16 August 2026

Root color
Gloss
Treatment
Cut and blow-dry

140 €

Technical note available
Before / after photos
Product purchased
```

This gives the professional one place to understand the full visit.

---

## 42. Relationship to Appointments

Appointments reference clients.

Conceptually:

```ts
appointment.clientId;
```

A client does not need to contain embedded appointment objects.

This avoids duplicated sources of truth.

---

## 43. Relationship to Sales

Sales may optionally reference clients.

Conceptually:

```ts
sale.clientId?
```

Anonymous or walk-in retail sales may later be allowed without a client.

The client domain must not require every sale to belong to a client.

---

## 44. Relationship to Photos

Photos reference clients.

Conceptually:

```ts
photo.clientId;
```

They may additionally reference:

```ts
photo.appointmentId?
```

This supports both:

- visit-specific photos;
- general client photos.

---

## 45. Relationship to Technical Notes

Technical notes reference clients.

Conceptually:

```ts
technicalNote.clientId;
```

They may additionally reference:

```ts
technicalNote.appointmentId?
```

Do not embed all technical history directly inside the client entity.

---

## 46. Data Import

Existing client data may be imported into Souris.

The initial hair-salon project already has client data available in structured form.

Import logic must transform legacy/source data into canonical client-domain values.

Imported data must not dictate the permanent architecture of the client model.

The import process should be treated as a boundary.

---

## 47. Import Idempotency

When an import process is implemented, running it accidentally more than once should not silently create uncontrolled duplicate records.

The exact strategy may use:

```text
stable source identifiers
deduplication rules
explicit migration markers
```

This will be designed during the import phase.

---

## 48. Persistence Independence

Client-domain logic must remain independent from the persistence provider.

It must not require:

```text
Supabase client
database query builders
React
Next.js
browser APIs
```

Persistence adapters or feature queries transform storage data into domain-friendly values where necessary.

---

## 49. Media Independence

The domain represents client photos through metadata and storage references.

It must not depend directly on:

```text
Supabase Storage
Cloudinary
S3
browser File APIs
camera APIs
```

Those concerns belong to infrastructure and feature layers.

---

## 50. Pure Derived Calculations

Client metrics should preferably be implemented as pure functions where practical.

Potential examples:

```text
calculateClientTotalSpent
calculateVisitCount
calculateVisitFrequency
getLastVisit
getNextAppointment
```

These functions should receive domain values and return deterministic results.

They must not query persistence directly.

---

## 51. Money Representation

Client spending calculations must use the same canonical monetary representation as sales and appointments.

Do not perform financial calculations using formatted strings.

The exact money representation will be defined when financial domain types are implemented.

---

## 52. Time Representation

Client history calculations must use canonical date/time values.

Formatting such as:

```text
16 août 2026
```

belongs to the presentation layer.

Business calculations must not depend on localized display strings.

---

## 53. Testing Requirements

Client-domain tests should eventually cover at least:

```text
client identity
visit count
last visit
next appointment
visit frequency
total spent
cancelled appointment exclusion
technical-note history
product purchase history
incomplete history
```

Data-access and UI behavior will have separate tests.

Testing conventions are defined in:

```text
docs/development/testing.md
```

---

## 54. Current V1 Assumptions

The first production client experience assumes:

```text
one business
hair-salon presentation
existing client import
phone-based contact
birthday support
general notes
appointment history
color-formula history
before/after photos
product-purchase history
derived spending metrics
derived visit frequency
```

These assumptions define the first experience.

They are not permanent limitations of the generic client domain.

---

## 55. Future Evolution

Potential future client features include:

```text
email
preferred contact method
appointment reminders
client tags
client segmentation
consent management
loyalty
gift cards
advanced search
client merge
archive
export
data portability
```

Do not implement these before there is a concrete product requirement.

---

## 56. Final Client Rule

The client record is not only a contact card.

In Souris, it represents the professional memory of the relationship with that client.

That memory is built from canonical historical records:

```text
appointments
technical notes
photos
sales
products
```

The client profile should make this history easy to understand without duplicating those records into competing sources of truth.
