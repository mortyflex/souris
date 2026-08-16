# Souris — Sales Domain

## 1. Purpose

This document defines the sales domain of Souris.

It is the canonical reference for:

- retail sales;
- sale items;
- sale lifecycle;
- product price snapshots;
- sale totals;
- client relationships;
- appointment relationships;
- inventory consequences;
- historical integrity;
- sale validation.

In Souris, a sale represents the retail sale of one or more physical products.

Service revenue remains primarily represented by completed appointments.

The sales domain must remain generic enough to support different beauty professions.

---

## 2. Sale

A `Sale` represents one retail transaction.

A sale belongs to one business.

Conceptually:

```ts
type Sale = {
  id: string;
  businessId: string;

  clientId?: string;
  appointmentId?: string;

  status: SaleStatus;

  items: SaleItem[];

  createdAt: string;
  completedAt?: string;
};
```

The exact persistence representation may evolve.

The business semantics defined in this document must remain stable.

---

## 3. Business Ownership

Every sale belongs to one business.

Conceptually:

```ts
businessId: string;
```

A sale from one business must never become visible to another business without an explicit future sharing model.

Persistence and authorization must eventually enforce this boundary.

---

## 4. Sale Item

A `SaleItem` represents one product line inside a sale.

Conceptually:

```ts
type SaleItem = {
  id: string;

  productId: string;

  productName: string;
  unitPrice: number;

  quantity: number;
};
```

Additional historical snapshot values may be added later when justified.

---

## 5. Product Snapshot

A sale item must preserve the product information that was true when the sale occurred.

At minimum:

```text
product ID
product name
unit price
quantity
```

Example:

A product currently costs:

```text
29 €
```

Later its catalog price changes to:

```text
32 €
```

A historical sale completed at:

```text
29 €
```

must continue to display:

```text
29 €
```

Historical sales must never be recalculated using current product catalog prices.

---

## 6. Product Relationship

A sale item references the source product using:

```ts
productId: string;
```

This relationship allows Souris to connect the sale to product history.

However, historical display must rely on the sale item's stored snapshot where required.

The product catalog represents current information.

The sale item represents what was actually sold.

---

## 7. Quantity

A sale-item quantity must be a positive integer.

Valid examples:

```text
1
2
5
```

Invalid examples:

```text
0
-1
1.5
```

The current product model represents individually countable retail units.

More complex measurement-based sales are outside the initial scope.

---

## 8. Unit Price

`unitPrice` represents the price charged for one unit when the sale was created.

It must be non-negative.

Conceptually:

```ts
unitPrice: number;
```

The exact canonical monetary representation will be defined during implementation.

Do not store formatted values such as:

```ts
unitPrice: "29,00 €";
```

Formatting belongs to the presentation layer.

---

## 9. Sale Line Total

A sale-item total is derived.

Conceptually:

```text
unitPrice × quantity
```

Example:

```text
Kérastase Genesis
29 € × 2

Line total
58 €
```

Do not store a manually editable independent line total unless a later requirement justifies it.

---

## 10. Sale Total

The total of a sale is derived from its items.

Conceptually:

```text
sum(unitPrice × quantity)
```

Example:

```text
Genesis Shampoo
29 € × 2
58 €

Elixir Ultime
32 € × 1
32 €

Total
90 €
```

The source of truth is the sale-item snapshot data.

---

## 11. Sale Status

The initial sale lifecycle may use:

```ts
type SaleStatus = "DRAFT" | "COMPLETED" | "CANCELLED";
```

The exact implementation may evolve, but the distinction between an unfinished sale and a completed sale is essential.

---

## 12. Draft Sale

A `DRAFT` sale represents a retail transaction currently being prepared.

Examples:

```text
product scanned
product added manually
quantity changed
product removed
client selected
```

A draft has no permanent inventory consequence.

Scanning a product must not immediately reduce stock.

---

## 13. Completed Sale

A `COMPLETED` sale represents a confirmed retail transaction.

Completion creates the corresponding inventory consequences.

Example:

```text
Sale

2 × Genesis Shampoo

Complete sale
```

Result:

```text
Sale status
COMPLETED

Stock movement
SALE -2
```

---

## 14. Cancelled Sale

A `CANCELLED` sale must not reduce inventory.

If cancellation occurs before completion, no permanent sale stock movement should exist.

Cancellation of an already completed historical transaction is a separate future business problem and should not be silently modeled by changing the original sale to `CANCELLED`.

Refunds and returns are outside the initial scope.

---

## 15. Scan Workflow

The primary retail workflow is optimized around product scanning.

Expected flow:

```text
Open Revente
      ↓
Scan product
      ↓
Product found
      ↓
Add product to current sale
      ↓
Scan additional products
      ↓
Review sale
      ↓
Complete sale
```

The scanner belongs to the feature layer.

The sales domain only receives product information and quantities.

---

## 16. Repeated Product Scan

Scanning the same product repeatedly during one draft should increase its quantity rather than create unnecessary duplicate visible lines.

Example:

First scan:

```text
Genesis
x1
```

Second scan:

```text
Genesis
x2
```

The UI may represent this as one sale line.

The canonical sale representation should avoid ambiguous duplicate lines unless there is a specific reason to keep them separate.

---

## 17. Manual Quantity Change

The user may modify product quantity manually before completing the sale.

Example:

```text
Genesis

[-] 2 [+]
```

Changing quantity inside a draft must not alter stock until the sale is completed.

---

## 18. Removing a Product

A product may be removed from a draft sale.

Removing it must not create inventory movement because no permanent inventory change has yet occurred.

---

## 19. Empty Sale

A sale containing no items cannot be completed.

The domain must reject completion of an empty sale.

---

## 20. Client Relationship

A sale may optionally reference a client.

Conceptually:

```ts
clientId?: string;
```

This allows Souris to provide client information such as:

```text
products purchased
retail purchase history
client total spending
repeat purchases
```

A client is not mandatory.

---

## 21. Anonymous Sale

Souris may support a retail sale without a client.

Example:

```text
Walk-in customer purchases shampoo
```

The sale remains valid.

Therefore:

```text
clientId
```

must not be mandatory at the domain level.

---

## 22. Appointment Relationship

A sale may optionally reference an appointment.

Conceptually:

```ts
appointmentId?: string;
```

Example:

```text
Sofia finishes her appointment
        ↓
Buys Genesis Shampoo
        ↓
Sale linked to Sofia's appointment
```

This relationship allows the visit history to show associated retail activity.

---

## 23. Appointment Is Not Required

A sale may occur without an appointment.

Examples:

```text
client comes only to purchase a product
walk-in retail purchase
product sold between appointments
```

Therefore:

```text
appointmentId
```

must remain optional.

---

## 24. Relationship Consistency

When both:

```text
clientId
appointmentId
```

are provided, they should normally refer to the same client context.

The application layer must prevent obviously inconsistent associations.

Example of an invalid association:

```text
Sale client:
Sofia

Linked appointment client:
Lynda
```

The exact validation location will be decided during implementation.

---

## 25. Client Purchase History

A client's purchased-product history is derived from completed sales associated with that client.

Example:

```text
Sofia Benali

Products purchased

16 August
Genesis Shampoo
29 €

12 June
Chroma Treatment
32 €
```

Do not independently store a manually synchronized array on the client entity.

---

## 26. Client Total Spending

Client spending may eventually combine:

```text
completed appointment totals
+
completed retail sales
```

The calculation must use historical snapshots.

Cancelled sales must not contribute.

Draft sales must not contribute.

The exact financial reporting definition will be implemented explicitly when client metrics are built.

---

## 27. Inventory Consequence

A completed sale produces stock movements.

For each sale item:

```text
stock movement quantity
=
- sale item quantity
```

Example:

```text
Sale item:
Genesis × 2

Stock movement:
SALE -2
```

The product domain owns stock semantics.

The sales domain owns the commercial event that causes the movement.

---

## 28. Sale and Stock Atomicity

Completing a sale logically includes:

```text
create completed sale
+
create expected SALE stock movements
```

These operations must eventually be persisted atomically or with equivalent reliability guarantees.

The system must avoid a state such as:

```text
sale recorded
but stock not decremented
```

or:

```text
stock decremented
but sale not recorded
```

The persistence strategy will be defined when Supabase integration is introduced.

---

## 29. Stock Validation Before Completion

Before completing a sale, Souris must verify that sufficient stock exists under the current inventory rules.

Example:

```text
Current stock:
1

Requested quantity:
2
```

The operation should normally be rejected or explicitly handled.

The initial expected behavior is to prevent unintended negative stock.

---

## 30. Race Conditions

Future persistence implementation must account for the possibility that stock changes between:

```text
displaying stock
and
completing sale
```

The UI's current stock display cannot be the only validation mechanism.

Final inventory validation must occur at the persistence/business operation boundary.

The exact strategy will be defined during database implementation.

---

## 31. Sale Creation From Appointment

The appointment detail may provide a fast retail action.

Example:

```text
Appointment complete

[ Add product ]
```

The new draft sale may automatically receive:

```text
clientId
appointmentId
```

from the appointment.

This is a UX optimization.

The sales domain remains independent from the UI flow.

---

## 32. Standalone Sale Creation

The Revente section must also allow creation of a sale independently.

Example:

```text
Revente
   ↓
New sale
   ↓
Scan products
```

Client and appointment may remain unset.

---

## 33. Historical Integrity

A completed sale must remain historically stable.

Changes to the current product must not modify:

```text
historical product name
historical unit price
historical quantity
historical sale total
```

Product deletion or deactivation must not invalidate historical sales.

---

## 34. Product Deactivation

A product may be unavailable for new sales while historical sale items referencing it remain valid.

The sale snapshot ensures historical readability.

---

## 35. Completed Sale Editing

Completed sales should not initially behave like unrestricted editable drafts.

Changing a completed sale could require corresponding inventory corrections.

Therefore, arbitrary editing after completion must not be implemented casually.

If corrections become necessary, Souris should use an explicit correction workflow that preserves auditability.

This is outside the initial scope.

---

## 36. Refunds and Returns

The initial sales domain does not include:

```text
refunds
returns
partial returns
exchanges
store credit
```

Do not model these until a real business requirement exists.

When introduced, they must preserve historical sales rather than rewriting history silently.

---

## 37. Discounts

The initial sales domain does not require discount management.

Do not introduce:

```text
percentage discounts
fixed discounts
coupon codes
promotion engines
```

until required.

If price adjustment is needed initially, the user may eventually modify the sale item's unit price before completion, subject to explicit UX rules.

---

## 38. Taxes

The initial domain does not implement tax-accounting logic.

Displayed retail prices may represent the prices actually charged by the business.

Do not introduce a complex tax engine before accounting requirements are explicitly defined.

---

## 39. Payment Tracking

The initial sales domain does not require full payment processing.

Concepts such as:

```text
card
cash
Apple Pay
payment terminal
payment provider
partial payment
```

are outside the current core sales model.

They may be introduced later as a dedicated payment concern.

Do not mix payment-provider architecture into the initial sales domain.

---

## 40. Money Representation

Sales calculations must use one canonical monetary representation shared with appointments and products.

Business logic must not operate on formatted strings.

Invalid:

```ts
unitPrice: "29 €";
```

Formatting belongs to the UI.

The exact implementation will be chosen before financial calculations are coded.

---

## 41. Currency

The first production business operates in:

```text
EUR
```

Currency symbols and localized formatting must not be scattered through domain algorithms.

Currency presentation belongs to configuration and presentation layers.

The first version does not require multi-currency sales.

---

## 42. Sale Time

A completed sale should retain when it was completed.

Conceptually:

```ts
completedAt?: string;
```

Draft creation time and completion time are different concepts.

Historical reporting should use the business event time appropriate to the calculation.

---

## 43. Sale Search and History

The Revente feature may eventually provide sale history.

Potential searchable/filterable information includes:

```text
date
client
product
appointment
sale amount
```

Search behavior belongs to the feature and data-access layers.

---

## 44. Sale History Presentation

A future sales-history view may display:

```text
16 August 2026

Sofia Benali

Genesis Shampoo × 1
29 €

Linked appointment
```

or:

```text
16 August 2026

Walk-in sale

Genesis Shampoo × 2
58 €
```

This presentation is derived from canonical sale data.

---

## 45. Domain Independence

The sales domain must not depend on:

```text
React
Next.js
Supabase
barcode scanner APIs
camera APIs
UI components
```

Core calculations should use ordinary TypeScript values.

---

## 46. Pure Calculations

Core sale calculations should preferably be pure functions.

Potential examples:

```text
calculateSaleItemTotal
calculateSaleTotal
validateSale
```

Given the same inputs, they should produce the same outputs.

They must not perform persistence or UI side effects.

---

## 47. Sale Completion Is an Application Operation

Calculating whether a sale is valid belongs to domain logic.

Actually completing it may require orchestration involving:

```text
sale persistence
stock validation
stock movements
transaction handling
```

This orchestration belongs outside pure domain calculations.

Do not make a domain calculator responsible for database transactions.

---

## 48. Source of Truth

The source of truth for historical retail activity is:

```text
Completed Sale
      ↓
Sale Items
```

The source of truth for inventory history is:

```text
Stock Movements
```

The two are related but serve different purposes.

Do not collapse them into one record type.

---

## 49. Testing Requirements

Sales-domain tests should eventually cover at least:

```text
single-item total
multi-item total
multiple quantity
empty-sale rejection
invalid quantity
negative price rejection
draft sale
completed sale
cancelled sale exclusion
product price snapshot
client-linked sale
anonymous sale
appointment-linked sale
stock requirements before completion
```

Inventory consequences require integration tests when persistence orchestration is implemented.

Detailed conventions are defined in:

```text
docs/development/testing.md
```

---

## 50. Current V1 Assumptions

The first production sales experience assumes:

```text
physical retail products
barcode-assisted product selection
manual product selection as fallback
one business
EUR prices
optional client
optional appointment
no discounts
no refunds
no payment-provider integration
stock decremented when sale is completed
```

These assumptions define the first implementation.

They are not permanent product limitations.

---

## 51. Future Evolution

Potential future capabilities include:

```text
payment methods
refunds
returns
discounts
gift cards
receipts
invoices
tax reporting
margin analytics
daily revenue
cash register workflows
online retail
payment-terminal integration
```

These must be introduced only when the product requires them.

---

## 52. Final Sales Rule

A Souris retail transaction must preserve two separate truths:

```text
What was sold
```

and:

```text
What happened to inventory
```

The relationship is:

```text
Sale
  ↓
SaleItem
  ↓
commercial history

Sale completion
  ↓
StockMovement
  ↓
inventory history
```

These records must remain consistent without being collapsed into the same concept.

This separation allows Souris to maintain reliable client history, product history, stock history, and future business reporting.
