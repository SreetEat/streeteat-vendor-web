# StreetEat — Vendor Dashboard

Second of four planned portals. Lets a vendor create their stall profile,
manage their menu, and process incoming orders.

## Setup

```
npm install
cp .env.example .env   # only if backend isn't on localhost:8080
npm run dev
```

Runs on http://localhost:5174 (separate port from the customer app on 5173,
so both can run side by side). Requires:
- The backend running with the updated SecurityConfig.java (CORS now
  includes port 5174 -- see the file handed over alongside this app).
- A user account registered with role VENDOR (this app's own register form
  does that automatically).

## Flow

1. Register / log in as a vendor.
2. First time: create your stall profile (name, address, coordinates --
   "Use my location" button available).
3. Dashboard: Orders tab (accept/reject/mark ready, auto-refreshes every
   10s) and Menu tab (add/remove dishes, toggle sold-out).

## Known limitation, stated plainly

There is no `GET /api/vendors/me` endpoint on the backend. This app works
around that by saving your vendor profile id locally after you create it,
with a same-email fallback lookup against the public vendor list if that's
lost (e.g. a different browser). This works but is not as reliable as a
real backend endpoint would be -- worth adding server-side later.

## Not implemented yet

- Editing an existing stall profile (create-only right now)
- Editing a menu item's price without deleting and re-adding it
- Order history / filtering by status
- Delivery partner assignment visibility beyond "Mark ready" triggering it
