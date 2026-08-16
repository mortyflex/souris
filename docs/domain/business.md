# Souris — Business Domain

## 1. Purpose

This document defines the business-level domain rules of Souris.

It is the canonical reference for:

- businesses;
- beauty professions;
- staff members;
- business ownership of data;
- multi-profession support;
- future multi-staff support;
- future resource scheduling;
- terminology shared across Souris.

Souris follows this principle:

> **Generic in the data model, specific in the user experience.**

The first production use case is a single hair professional.

The architecture must support this use case extremely well without permanently coupling the product to hairdressing.

---

## 2. Business

A `Business` represents the professional activity using Souris.

Examples:

```text
Souris Hair Studio
Institut Julie
Maison Beauté
Nails by Emma
```

All operational data belongs to a business.

Conceptually:

```ts
type Business = {
  id: string;
  name: string;
  type: BusinessType;
  createdAt: string;
  updatedAt: string;
};
```

The exact persistence representation may evolve.

The business ownership rule must remain stable.

---

## 3. Business Ownership

The main operational entities in Souris belong to a business.

This includes:

```text
StaffMember
Client
Service
Appointment
Product
ProductCategory
Sale
StockMovement
```

Conceptually, these entities should be associated with:

```ts
businessId: string;
```

This rule exists even when the first production installation contains only one business.

Do not build domain logic around the assumption that there can only ever be one business.

---

## 4. Business Types

The initial generic business types are:

```ts
type BusinessType =
  | "HAIR_SALON"
  | "BEAUTY_INSTITUTE"
  | "NAIL_SALON"
  | "LASH_BROW"
  | "MASSAGE"
  | "OTHER";
```

These values represent broad onboarding and presentation categories.

They must not determine the internal scheduling algorithm.

For example:

```text
HAIR_SALON
```

must not activate a separate scheduling engine from:

```text
BEAUTY_INSTITUTE
```

Both professions use the same generic concepts:

```text
Service
ServicePhase
Appointment
StaffMember
```

Profession types influence configuration and presentation, not the fundamental scheduling architecture.

---

## 5. First Production Use Case

The first real Souris installation is:

```text
Business type:
HAIR_SALON

Staff members:
1

Primary user:
Business owner / hair professional
```

The UX may therefore initially optimize common workflows for a single hair professional.

Examples include:

- color application;
- processing time;
- gloss;
- treatment;
- haircut;
- blow-dry;
- color formulas.

This optimization must remain at the data/configuration or presentation level.

The generic business and scheduling domains must not depend on these hair-specific concepts.

---

## 6. Multi-Profession Principle

Souris should later be usable by other beauty professionals without rewriting its core.

Potential examples include:

```text
Esthetician
Nail technician
Lash technician
Brow technician
Massage professional
Wellness professional
```

These professions share many fundamental needs:

```text
appointments
clients
services
prices
products
inventory
sales
history
notes
photos
```

Some also share the concept of processing or waiting time during which the professional becomes available.

Examples:

```text
Hair color processing
Face mask processing
Eyelash tint processing
Nail drying
Equipment treatment
```

Souris models these situations through generic service phases rather than profession-specific scheduling rules.

---

## 7. Staff Member

A `StaffMember` represents a professional who can perform services.

Conceptually:

```ts
type StaffMember = {
  id: string;
  businessId: string;
  firstName: string;
  lastName?: string;
  active: boolean;
};
```

The first version has one active staff member.

However, appointments should be designed so they can eventually reference a staff member explicitly.

Conceptually:

```ts
staffMemberId: string;
```

Do not rely permanently on:

```text
the current user = the professional
```

These concepts happen to be equivalent in the first version but may diverge later.

---

## 8. Current Single-Staff Experience

Because the first business contains only one professional, the initial interface should not introduce unnecessary staff-selection complexity.

The user should not need to select herself for every appointment.

The current staff member may be automatically inferred.

This is a UX simplification.

It is not a domain limitation.

The underlying appointment model should remain compatible with explicit staff ownership.

---

## 9. Future Multi-Staff Support

Souris may later support businesses with multiple professionals.

Example:

```text
Sarah — Hair
Julie — Aesthetics
Emma — Nails
```

Future functionality may include:

```text
staff-specific calendars
combined team calendar
staff filters
staff availability
service capabilities
staff schedules
permissions
```

Do not implement these features until required.

The current domain must simply avoid preventing them.

---

## 10. Profession and Staff Are Different Concepts

A business type and a staff member's activity are separate concerns.

A future business could contain several professions.

Example:

```text
Business:
Maison Beauté

Staff:
Sarah — Hair
Julie — Aesthetics
Emma — Nails
```

Therefore, do not assume:

```text
business type = exact profession of every staff member
```

The first version does not need a complex profession taxonomy per staff member.

The architecture should merely avoid making such an extension impossible.

---

## 11. Services

A `Service` belongs to a business.

Examples for hair:

```text
Root color
Gloss
Treatment
Cut and blow-dry
```

Examples for aesthetics:

```text
Facial
Eyebrow waxing
Eyelash tint
Massage
```

Services are configured by the business.

The core scheduling domain does not need to understand what these names mean.

Scheduling behavior comes from the service phases.

Detailed scheduling rules are defined in:

```text
docs/domain/appointments.md
```

---

## 12. Service Phases

A service can contain phases.

A phase describes:

```text
duration
whether staff is required
```

Conceptually:

```ts
type ServicePhase = {
  id: string;
  name: string;
  durationMinutes: number;
  requiresStaff: boolean;
};
```

This generic model is what makes Souris adaptable to several professions.

Example for hair:

```text
Root color application
15 min
requiresStaff = true

Processing
35 min
requiresStaff = false
```

Example for aesthetics:

```text
Face-mask application
10 min
requiresStaff = true

Mask processing
20 min
requiresStaff = false

Finishing treatment
10 min
requiresStaff = true
```

The scheduling engine treats both cases identically.

---

## 13. Clients

Clients belong to a business.

A client record is not globally shared between unrelated businesses.

Conceptually:

```ts
type Client = {
  id: string;
  businessId: string;
  firstName: string;
  lastName?: string;
};
```

A future multi-business architecture must not accidentally expose one business's clients to another.

Business ownership must therefore be explicit at the persistence and authorization boundaries.

---

## 14. Client Technical Information

Different professions need different technical notes.

Hair examples:

```text
color formula
oxidant
processing duration
previous formula
```

Aesthetic examples:

```text
skin protocol
product sensitivity
treatment protocol
```

Nail examples:

```text
base product
color reference
top coat
technical notes
```

The generic domain should therefore avoid a model where every technical record is permanently named:

```text
ColorFormula
```

A more generic client technical-note concept should be preferred where appropriate.

The UI may still display:

```text
Formules de coloration
```

for a hair salon.

This follows the Souris principle:

> Generic in the data model, specific in the user experience.

---

## 15. Products

Products belong to a business.

The product domain must support different professions without requiring global profession-specific enums.

Hair products may include:

```text
Shampoo
Treatment
Styling
```

Aesthetic products may include:

```text
Face
Body
Makeup
```

Product categories should therefore be configurable by the business rather than permanently hard-coded into the core domain.

Detailed product rules are defined in:

```text
docs/domain/products.md
```

---

## 16. Sales

Sales belong to a business.

A sale may optionally be linked to:

```text
Client
Appointment
```

This allows Souris to provide future business information such as:

```text
products purchased by a client
client total spending
appointment-related retail sales
sales history
```

Sales rules are owned by the sales domain.

---

## 17. Resources

The first Souris version only needs to manage professional availability.

Some future professions may also depend on physical resources.

Examples include:

```text
Treatment room
Cabin
Massage table
Pressotherapy machine
Laser equipment
Specialized chair
```

A professional might be free while one of these resources remains occupied.

Example:

```text
Client treatment:
30 min

Professional:
available after 5 min

Treatment room:
occupied for full 30 min
```

This means future scheduling may distinguish between:

```text
staff availability
room availability
equipment availability
```

Do not implement this resource model in the first version.

Do not prematurely add room or equipment abstractions to every appointment.

The scheduling architecture should simply remain extensible enough to introduce resource requirements later.

---

## 18. Authentication Is Not Business Identity

Authentication identifies a user who can access Souris.

A user account is not the same thing as:

```text
Business
StaffMember
Client
```

Keep these concepts separate.

Future examples may include:

```text
one user managing one business
one owner managing several staff members
one staff member having their own login
one administrative user not performing services
```

The first version may have a simple relationship between the authenticated user and the business owner.

Do not make that relationship an irreversible domain assumption.

---

## 19. Authorization Boundary

Every business-owned record must eventually be protected by authorization rules.

Examples:

```text
clients
appointments
products
sales
photos
technical notes
```

A user must not access another business's records unless an explicit future sharing model permits it.

The precise persistence and authorization implementation will be defined when Supabase is introduced.

Authorization concerns must not leak into pure domain algorithms.

---

## 20. Business Configuration

Profession-specific behavior should preferably come from configuration or data.

Potential future business configuration may include:

```text
business type
working hours
currency
default appointment buffer
product categories
service catalog
staff members
profession-specific labels
```

Do not create one completely different application implementation per profession.

Prefer:

```text
shared core
+
profession configuration
+
profession-aware presentation
```

---

## 21. Profession-Specific Presentation

The UI may intentionally use language appropriate to the current profession.

For a hair salon:

```text
Technique
Temps de pose
Formule couleur
```

For another profession, the labels may differ.

This does not require changing the generic internal domain terminology.

Presentation language and domain structure are separate concerns.

---

## 22. Business Data Isolation

Every future persistence query involving business-owned data must respect business isolation.

Conceptually:

```text
Authenticated user
        ↓
Business membership
        ↓
Business-owned records
```

Do not rely on UI filtering alone for data isolation.

The persistence layer must enforce access rules.

---

## 23. No Premature SaaS Complexity

The architecture supports future expansion, but the first version is not required to implement:

```text
business subscriptions
multiple locations
team permissions
staff invitations
complex roles
resource scheduling
marketplace functionality
public customer accounts
```

These should only be introduced when real requirements exist.

Multi-profession compatibility must not become an excuse to build unnecessary SaaS infrastructure.

---

## 24. Initial Business Assumptions

For the first production version, Souris may assume:

```text
one authenticated owner
one business
one active professional
one primary location
EUR currency
France-oriented initial usage
```

These assumptions may simplify the UX.

They must not be embedded into generic algorithms in ways that make future evolution unnecessarily difficult.

---

## 25. Architecture Rule

When a future profession requires new behavior, first determine whether that behavior is:

```text
generic business behavior
generic scheduling behavior
profession configuration
profession-specific presentation
```

Do not create profession-specific branches inside the core domain unless the behavior is genuinely impossible to express through existing generic concepts.

---

## 26. Final Principle

Souris is initially built for one hair professional.

It must feel like it was designed specifically for her workflow.

At the same time, the business domain should remain clean enough that onboarding an esthetician later does not require rewriting:

```text
clients
appointments
products
inventory
sales
authentication
business ownership
```

The goal is not to build every beauty profession today.

The goal is to avoid architectural decisions today that prevent them tomorrow.
