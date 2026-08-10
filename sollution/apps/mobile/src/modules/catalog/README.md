# Catalog module

Branches, categories, and menu products for the guest app.

Data comes from Nest via React Query (`@/api/OrderBooking/modules/{branches,categories,products}`).  
`CatalogProvider` keeps a shared in-memory catalog for screens; hooks like `useMenuItem` fall back to `GET /products/:id`.
