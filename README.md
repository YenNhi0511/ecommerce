This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project enhancements

This repository has been extended with e-commerce features (roles, payments, webhooks, seller/admin UIs).

Important developer notes:

- Environment variables (set in `.env.local`):
	- `MONGODB_URI` — MongoDB connection string
	- `JWT_SECRET` — JWT signing secret
	- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — Stripe keys
	- `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`, `MOMO_ENDPOINT` — MoMo sandbox keys
	- `NEXT_PUBLIC_BASE_URL` — used for building return/notify URLs (use ngrok for local testing)
	- `GMAIL_USER`, `GMAIL_PASS` — for contact email notifications
	- `CLOUDINARY_*` — Cloudinary upload credentials

- New endpoints of interest:
	- `POST /api/auth/login` — returns short-lived access token and sets `refreshToken` cookie (httpOnly)
	- `POST /api/auth/refresh` — rotates refresh token and returns new access token
	- `POST /api/auth/logout` — clears refresh token
	- `POST /api/orders` — create orders (supports `cod`, `card`, `atm`/`momo`)
	- `POST /api/payments/momo` — create MoMo sandbox payment, returns `payUrl`
	- `POST /api/payments/momo/notify` — MoMo notify callback (verifies signature when configured)
	- `POST /api/payments/checkout` and `/api/payments/webhook` — Stripe integration
	- `GET /api/webhooks/events` — admin list of webhook events; `/api/webhooks/events/{id}/process` to replay

See `docs/IMPLEMENTATION_SUMMARY.md` for a concise summary and next steps.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
