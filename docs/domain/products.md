# Souris — Products Domain

## 1. Purpose

This document defines the product and inventory domain of Souris.

It is the canonical reference for:

- products;
- product categories;
- barcodes;
- product images;
- inventory;
- stock movements;
- product scanning;
- retail sales interactions;
- stock thresholds;
- historical inventory integrity.

Souris must support products sold by beauty professionals without coupling the domain to hair-specific product categories.

The guiding principle remains:

> **Generic in the data model, specific in the user experience.**

---

## 2. Product

A `Product` represents a physical retail product managed by a business.

Examples for a hair salon:

```text
Kérastase Genesis Shampoo
Kérastase Elixir Ultime
Hair mask
Styling spray
```

Examples for an esthetician:

```text
Face cleanser
Hydrating serum
Body cream
Face mask
```

A product belongs to one business.

Conceptually:

```ts
type Product = {
  id: string;
  businessId: string;

  name: string;
  brand?: string;

  categoryId?: string;

  barcode?: string;

  purchasePrice?: number;
  salePrice: number;

  lowStockThreshold?: number;

  imagePath?: string;

  active: boolean;

  createdAt: string;
  updatedAt: string;
};
```

The exact persistence representation may evolve.

The business semantics defined here must remain stable.

---

## 3. Business Ownership

Every product belongs to a business.

Conceptually:

```ts
businessId: string;
```

Products from one business must not automatically be visible to another business.

The same rule applies to:

```text
ProductCategory
StockMovement
Sale
```

Business isolation must eventually be enforced by the persistence and authorization layers.

---

## 4. Product Categories

Product categories must not be permanently hard-coded around hairdressing.

Hair examples:

```text
Shampoo
Treatment
Styling
```

Esthetician examples:

```text
Face
Body
Makeup
```

Nail examples:

```text
Care
Color
Accessories
```

Categories therefore belong to the business.

Conceptually:

```ts
type ProductCategory = {
  id: string;
  businessId: string;
  name: string;
  active: boolean;
};
```

The initial hair-salon experience may create default categories such as:

```text
Shampoing
Soin
Coiffant
```

These are initial business data, not global domain enums.

---

## 5. Product Name

A product must have a name.

Example:

```text
Genesis Bain Hydra-Fortifiant
```

The name is the primary human-readable identity of the product.

A product name does not need to be globally unique.

Different businesses may use different names for the same commercial product.

---

## 6. Brand

A product may have a brand.

Example:

```text
Kérastase
L'Oréal Professionnel
Redken
```

Brand is descriptive product data.

Do not create a separate global brand-management system unless a real requirement appears.

A simple brand value is sufficient for the initial version.

---

## 7. Barcode

A product may have a barcode.

For the initial product-scanning workflow, the barcode is an important identifier.

Conceptually:

```ts
barcode?: string;
```

The application should normally expect one active product per barcode inside a business.

A barcode must not be treated as the product's internal primary key.

The internal product ID remains the canonical technical identifier.

---

## 8. Barcode Representation

Barcodes must be stored as strings.

Do not store them as numbers.

Example:

```ts
barcode: "3760123456789";
```

This avoids issues with:

- leading zeroes;
- numeric precision;
- barcode formats that are not intended for arithmetic.

---

## 9. Barcode Uniqueness

Within one business, an active barcode should normally identify one product.

The persistence layer should eventually protect against accidental duplicate barcode assignments where appropriate.

Do not assume that a barcode must be globally unique across every Souris business.

---

## 10. Product Scanning

Scanning is an application and presentation concern.

The product domain stores barcode identity.

The feature layer handles:

```text
camera access
scanner permissions
barcode detection
scan feedback
UI transitions
```

The product domain must not depend on:

```text
browser camera APIs
React
Next.js
barcode scanning libraries
```

---

## 11. Known Product Scan

When a scanned barcode matches an existing product, the feature can retrieve that product.

Example:

```text
Scan
   ↓
3760123456789
   ↓
Product found
   ↓
Kérastase Genesis
29 €
Stock: 6
```

The next action depends on the current workflow.

Examples:

```text
add to sale
view product
adjust stock
```

---

## 12. Unknown Product Scan

When the barcode is not known, Souris should offer product creation.

Expected workflow:

```text
Scan barcode
      ↓
Product not found
      ↓
Add this product
      ↓
Product creation form
```

The scanned barcode should already be populated.

The user should not need to scan or type it again.

---

## 13. Product Creation

The initial product creation flow should support:

```text
photo
barcode
brand
name
category
sale price
initial stock
```

Optional future information may include:

```text
purchase price
supplier
internal reference
notes
```

Do not make optional commercial information mandatory in the first version.

Product creation must remain fast.

---

## 14. Product Image

A product may have an image.

The image is useful for:

```text
visual identification
inventory browsing
sales
product details
```

Conceptually, the product stores a media reference:

```ts
imagePath?: string;
```

The product domain must not depend on a particular storage provider.

---

## 15. Image Capture

Taking a photo is a feature concern.

The product domain does not access:

```text
camera
File API
Supabase Storage
image compression libraries
```

The feature/infrastructure layer handles these details.

---

## 16. Product Image Privacy

Product images are less sensitive than client photos, but storage behavior must still be intentional.

The storage strategy will be defined when media persistence is implemented.

Do not embed image binaries directly inside product records.

---

## 17. Sale Price

A product has a retail sale price.

Conceptually:

```ts
salePrice: number;
```

The exact canonical money representation will be defined during implementation.

Do not use formatted strings as the source of truth.

Invalid:

```ts
salePrice: "29,00 €";
```

Presentation formatting belongs to the UI.

---

## 18. Purchase Price

Purchase price may be stored when useful.

Conceptually:

```ts
purchasePrice?: number;
```

It is not required for the first retail workflow.

It may later support:

```text
margin calculation
inventory valuation
business reporting
```

Do not block product creation if purchase price is unknown.

---

## 19. Historical Sale Price

Changing a product's current catalog price must not change previous sales.

Example:

Current product price:

```text
29 €
```

Later:

```text
32 €
```

A historical sale completed at:

```text
29 €
```

must remain:

```text
29 €
```

Sale items therefore preserve a price snapshot.

---

## 20. Inventory Principle

Inventory must be auditable.

Souris must not model inventory history only by mutating:

```ts
product.stockQuantity -= 1;
```

without recording why the quantity changed.

Stock changes are represented by stock movements.

---

## 21. Stock Movement

Conceptually:

```ts
type StockMovement = {
  id: string;
  businessId: string;
  productId: string;

  type: StockMovementType;
  quantity: number;

  saleId?: string;

  note?: string;

  createdAt: string;
};
```

The exact implementation may evolve.

Every movement must represent a meaningful stock event.

---

## 22. Stock Movement Types

Initial movement types:

```ts
type StockMovementType =
  | "INITIAL_STOCK"
  | "RESTOCK"
  | "SALE"
  | "ADJUSTMENT"
  | "LOSS";
```

These values describe why inventory changed.

---

## 23. Quantity Sign Convention

Souris must use one consistent quantity convention.

Recommended semantics:

```text
Positive quantity
→ stock enters inventory

Negative quantity
→ stock leaves inventory
```

Examples:

```text
INITIAL_STOCK  +10
RESTOCK         +6
SALE            -1
LOSS            -2
ADJUSTMENT      +1
```

Do not mix signed and unsigned movement conventions across the application.

---

## 24. Initial Stock

When a product is first created, the user may enter:

```text
Initial stock
6
```

If the value is greater than zero, Souris creates an:

```text
INITIAL_STOCK
```

movement.

Example:

```text
Product created

Kérastase Genesis

INITIAL_STOCK
+6
```

Do not create unexplained inventory by only storing a starting counter.

---

## 25. Restock

When new inventory arrives, Souris creates a:

```text
RESTOCK
```

movement.

Example:

```text
Existing stock
3

Delivery
+10

Current stock
13
```

The stock history remains auditable.

---

## 26. Sale

When a product sale is completed, Souris creates one or more:

```text
SALE
```

stock movements.

Example:

```text
Sale
2 × Kérastase Genesis
```

Inventory effect:

```text
SALE
-2
```

The movement should reference the sale when available.

Conceptually:

```ts
saleId: string;
```

---

## 27. Loss

A product may leave inventory without being sold.

Examples:

```text
damaged product
expired product
missing product
tester accidentally included in retail inventory
```

This should create:

```text
LOSS
```

with a negative quantity.

A note may explain the reason.

---

## 28. Adjustment

Manual corrections use:

```text
ADJUSTMENT
```

Examples:

```text
Physical count says 7
System says 6

Adjustment
+1
```

or:

```text
Physical count says 5
System says 6

Adjustment
-1
```

Do not silently rewrite history.

---

## 29. Current Stock

Current stock is conceptually:

```text
sum(all stock movement quantities for the product)
```

Example:

```text
INITIAL_STOCK +10
SALE           -1
SALE           -1
RESTOCK        +6
LOSS           -1
```

Current stock:

```text
13
```

The canonical domain behavior must remain mathematically equivalent to this calculation.

---

## 30. Stored Stock Projection

The first implementation may calculate stock directly from movements if appropriate.

A future persistence design may maintain a cached current-stock value for performance.

If such a projection is introduced:

- stock movements remain historical truth;
- projection updates must be controlled;
- inconsistencies must be recoverable from movement history.

Do not create two unrelated sources of truth.

---

## 31. Negative Stock

The initial business rule should normally prevent completing a sale that would make stock negative.

Example:

```text
Current stock
1

Requested sale
2
```

The UI should warn or block the operation.

The exact override policy will be decided during implementation.

The domain must be capable of detecting the invalid result.

---

## 32. Stock Threshold

A product may define a low-stock threshold.

Conceptually:

```ts
lowStockThreshold?: number;
```

Example:

```text
Current stock
2

Low-stock threshold
3
```

Result:

```text
Low stock
```

---

## 33. Low Stock Is Derived

Do not store:

```ts
product.isLowStock = true;
```

as an independent source of truth.

Low-stock state is derived from:

```text
current stock
+
configured threshold
```

Conceptually:

```text
currentStock <= lowStockThreshold
```

The exact boundary rule must remain consistent.

---

## 34. No Threshold

If no low-stock threshold exists, Souris should not invent one automatically at the domain level.

The UI may encourage the user to configure it later.

---

## 35. Out of Stock

A product is out of stock when:

```text
currentStock <= 0
```

This state is derived.

It must not require a separately maintained boolean.

---

## 36. Product Active State

Products may eventually be deactivated.

Conceptually:

```ts
active: boolean;
```

An inactive product:

- remains visible in historical sales;
- remains visible in stock history;
- should not normally appear as a standard product available for new sales.

Do not delete historical information when a product is discontinued.

---

## 37. Product Deletion

Permanent product deletion is dangerous when the product has:

```text
sales
stock movements
history
```

A future implementation should generally prefer:

```text
deactivate
archive
```

over destructive deletion.

Exact lifecycle behavior will be defined during product-management implementation.

---

## 38. Product Search

The inventory feature should support fast product search.

Likely searchable information includes:

```text
name
brand
barcode
category
```

Search implementation belongs to the feature/data-access layer.

---

## 39. Product Inventory View

The intended inventory view may expose:

```text
photo
brand
product name
category
price
current stock
low-stock status
```

Example:

```text
Kérastase
Genesis Bain Hydra-Fortifiant

Shampoing
29 €

Stock
6
```

The exact visual presentation belongs to the product feature and design system.

---

## 40. Stock History View

A product detail page should eventually expose movement history.

Example:

```text
16 August
Sale
-1

12 August
Restock
+6

10 August
Adjustment
-1

1 August
Initial stock
+10
```

This history is derived from canonical stock movements.

---

## 41. Retail Workflow

The primary retail workflow is designed for speed.

Expected flow:

```text
Open Products / Retail
        ↓
Scan product
        ↓
Product found
        ↓
Add to sale
        ↓
Scan another product if necessary
        ↓
Validate sale
        ↓
Create sale
        ↓
Create stock movements
```

Scanning the same product several times may increase its quantity in the current sale.

---

## 42. Scan Feedback

The UI should provide immediate feedback after a successful scan.

Possible feedback includes:

```text
product card animation
quantity update
short motion response
optional haptic feedback where supported
```

These are presentation concerns.

They must not affect product-domain rules.

---

## 43. Pending Sale

Before validation, scanned products belong to a temporary sale draft.

Stock should not be permanently decremented merely because a product was scanned.

Permanent stock movement occurs when the sale is committed.

This prevents abandoned drafts from corrupting inventory.

---

## 44. Sale Atomicity

Completing a sale logically requires both:

```text
sale creation
+
related stock movements
```

These operations must eventually be persisted safely.

A completed sale must not exist without its expected inventory effects because of a partial persistence failure.

The exact transaction strategy will be defined during persistence implementation.

---

## 45. Client Relationship

A retail sale may optionally belong to a client.

This allows Souris to display:

```text
products purchased
client spending
purchase history
```

A sale does not necessarily require a client.

Walk-in retail purchases may be supported.

---

## 46. Appointment Relationship

A sale may optionally belong to an appointment.

Example:

```text
Sofia's appointment
        ↓
Service completed
        ↓
Kérastase shampoo sold
```

This creates a richer client visit history.

The sale remains a separate business record.

Do not embed the product sale directly into the appointment entity as the only source of truth.

---

## 47. Product Purchase History

A client's purchased products are derived from:

```text
Sale
 ↓
SaleItem
 ↓
Product snapshot
```

Do not separately maintain:

```ts
client.productsPurchased;
```

as another source of truth.

---

## 48. Sale Item Snapshot

A sale item must preserve historical product information.

Conceptually:

```ts
type SaleItem = {
  productId: string;

  productName: string;
  unitPrice: number;

  quantity: number;
};
```

Additional snapshot fields may be introduced when justified.

Changing the current product name or price must not rewrite historical sales.

---

## 49. Product and Sale Separation

A product represents current catalog information.

A sale item represents what was actually sold.

They are related but not interchangeable.

This distinction is critical for historical integrity.

---

## 50. Product Import

Existing product data may be imported into Souris.

Import code must transform source data into canonical product values.

Legacy data structure must not dictate the permanent product architecture.

Import logic belongs to a migration/import boundary rather than the core domain.

---

## 51. Import and Barcodes

When imported products already contain barcodes, those values should be preserved if valid.

When no barcode exists, the product may still be managed manually.

Barcode scanning is an enhancement to product identification, not a requirement for product existence.

---

## 52. Inventory Import

If existing data includes stock quantities but not movement history, the import process should create an appropriate:

```text
INITIAL_STOCK
```

movement representing the imported quantity.

This creates a clean audit starting point inside Souris.

---

## 53. Money

All prices and sale calculations must use one canonical monetary representation.

Do not use formatted strings as business values.

Invalid domain representation:

```ts
salePrice: "29,00 €";
```

The implementation will define the exact numerical strategy.

Presentation formatting belongs to the UI.

---

## 54. Currency

The first production business uses:

```text
EUR
```

The architecture should not scatter the euro symbol through business logic.

Currency presentation belongs to formatting/configuration.

The first version does not require multi-currency business support.

---

## 55. Pure Domain Calculations

Product-domain calculations should preferably be pure functions.

Potential examples:

```text
calculateCurrentStock
isLowStock
isOutOfStock
calculateStockAfterMovement
validateStockMovement
```

These functions must not:

```text
query Supabase
read React state
access the camera
mutate global state
perform UI side effects
```

---

## 56. Persistence Independence

The product domain must remain independent from persistence.

It must not require:

```text
Supabase client
SQL query builder
React
Next.js
browser storage
camera APIs
```

Feature queries and persistence adapters provide domain-friendly values.

---

## 57. Product Media Independence

The product domain represents product images through storage references.

It must not depend directly on:

```text
Supabase Storage
S3
Cloudinary
File API
camera API
```

Storage implementation belongs outside the pure domain.

---

## 58. Testing Requirements

Product and inventory tests should eventually cover at least:

```text
initial stock
restock
sale decrement
multiple quantity sale
loss
positive adjustment
negative adjustment
current stock calculation
low-stock calculation
out-of-stock calculation
negative-stock prevention
historical movement integrity
barcode matching behavior where domain-relevant
sale item price snapshot
```

Testing conventions are defined in:

```text
docs/development/testing.md
```

---

## 59. Current V1 Assumptions

The first production product experience assumes:

```text
one business
retail products
hair-salon categories
barcode scanning
product photos
sale price
initial stock
restocking
stock deductions after sales
manual stock adjustments
low-stock visibility
sales optionally linked to clients
```

These define the first UX.

They are not permanent limitations of the generic product domain.

---

## 60. Not Included Yet

The initial product domain does not require:

```text
suppliers
purchase orders
multi-location stock
stock transfers
batch numbers
expiry dates
tax accounting
advanced margin reporting
product variants
online store synchronization
automated supplier ordering
```

Do not introduce these concepts until there is a concrete product requirement.

---

## 61. Future Evolution

Potential future product capabilities include:

```text
suppliers
purchase price analytics
profit margins
inventory valuation
expiry tracking
automatic reorder suggestions
multi-location inventory
stocktake workflows
CSV import/export
advanced reporting
```

These features must build on the same auditable stock-movement foundation.

---

## 62. Final Product Rule

A product's current stock is not just a number.

It is the result of a history of business events.

Souris must preserve that history.

The core inventory relationship is:

```text
Product
   ↓
StockMovement history
   ↓
Current stock
```

Sales contribute to that history but remain separate business records.

This separation allows Souris to remain reliable, auditable, and extensible across different beauty professions.
