# Catalog helpers

Branches / categories / products. API: `src/api/OrderBooking/modules/{branches,categories,products}`.

Menu is brand-level (all locations). Branch is pickup/fulfillment on the order only. Checkout requires the order payload pin (`customerAddress.lat` / `lng`) to sit inside any kitchen `deliveryRadiusKm` (`isPinCoveredByAnyBranch`).
