# Implementation summary

This file summarizes implemented endpoints, important env vars, and next steps.

Endpoints (high level):

- `POST /api/orders` — create orders (supports `paymentMethod`: `cod`, `card`, `atm`/`momo`).
- `POST /api/payments/momo` — create MoMo sandbox payment for an order (returns `payUrl`).
- `POST /api/payments/momo/notify` — MoMo notify callback (verifies signature when `MOMO_SECRET_KEY` set, marks order paid on success).
- `POST /api/payments/checkout` + `/api/payments/webhook` — Stripe checkout + webhook (already implemented).
- `/api/webhooks/events` — admin list of webhook events; `/api/webhooks/events/{id}/process` — replay event.

Seller/admin features:
- Seller product CRUD UI at `src/app/seller/products` (image upload via `/api/uploads`).
- Admin webhooks UI at `src/app/admin/webhooks` for replaying events.

Important env vars:
- `MONGO_DB` / `MONGODB_URI` — MongoDB connection string
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — Stripe keys
- `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY` — MoMo sandbox credentials
- `NEXT_PUBLIC_BASE_URL` — e.g. `https://abc.ngrok.io` when using ngrok
- `GMAIL_USER`, `GMAIL_PASS` — for contact form email notifications
- Cloudinary keys: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Next recommended steps:
1. Run `npm install` to fetch `zod` and other deps added.
2. Use ngrok (or a public URL) for MoMo sandbox notify callbacks and set `NEXT_PUBLIC_BASE_URL` accordingly.
3. Harden security: add rate-limits on more endpoints, introduce refresh tokens or cookie sessions, and enable input validation everywhere.
