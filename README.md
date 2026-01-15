# EcobuiltConnect

Marketplace web app for connecting eco-friendly builders, suppliers, and customers with sustainable construction materials and services.

## Quickstart

```bash
pnpm install
pnpm dev
```

The dev server runs on `http://localhost:3000`.

## Tech Stack

- React 19 + TanStack React Start (Vite, SSR-ready)
- TanStack Router + React Query + React Store
- Tailwind CSS v4 + shadcn/ui + Base UI
- Prisma ORM (Postgres adapter)
- Clerk for auth
- AWS S3 for uploads
- Ozow for payments
- Biome for linting/formatting

## Project Structure

- `src/routes` TanStack Router file-based routes with grouped segments (e.g. `(public)`, `(auth)`, `(admin)`).
- `src/routeTree.gen.ts` Auto-generated route tree used by the router.
- `src/router.tsx` Router setup and providers.
- `src/start.ts` React Start entry point.
- `src/components` UI building blocks, forms, and app-level blocks.
- `src/hooks` Shared hooks (uploads, responsive utilities).
- `src/stores` Client state (e.g. cart store).
- `src/remote` Server-side queries and mutations grouped by role/domain.
- `src/prisma` Prisma schema, client, selectors, and seed scripts.
- `src/lib` Shared utilities, env validation, integration helpers.
- `src/styles.css` Global styles and Tailwind base layers.

## Routing Conventions

- Route groups are wrapped in parentheses for clearer organization without affecting URLs.
- `__root.tsx` defines the root layout and metadata.
- `routeTree.gen.ts` is generated and should not be edited manually.

## Data Layer

- Prisma schema lives in `src/prisma/schema.prisma`.
- Prisma client and adapters are in `src/prisma/index.ts`.
- `src/prisma/seed.ts` defines seed logic for local data setup.
- `src/remote` contains server functions and queries that power route loaders and actions.

## Auth, Storage, Payments

- Auth: Clerk configuration lives in routes and `src/remote/shared.clerk.ts`.
- Storage: S3 helpers in `src/lib/s3.*` and `src/remote/shared.s3.ts`.
- Payments: Ozow integration in `src/lib/ozow.server.ts` and related remote handlers.

## Environment Variables

Validated via `src/lib/env.server.ts` and `src/lib/env.client.ts`.

Server:
- `NODE_ENV`
- `APP_URL`
- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `CLERK_SIGN_IN_URL`
- `CLERK_SIGN_UP_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET_NAME`
- `OZOW_SITE_CODE`
- `OZOW_PRIVATE_KEY`
- `OZOW_API_KEY`
- `OZOW_IS_TEST`
- `OZOW_API_URL`
- `OZOW_NOTIFY_URL`
- `OZOW_CANCEL_URL`
- `OZOW_ERROR_URL`
- `OZOW_SUCCESS_URL`

Client (must be prefixed with `VITE_`):
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_AWS_REGION`
- `VITE_AWS_S3_BUCKET_NAME`

Database scripts use `.env.local` via `dotenvx`.

## Scripts

```bash
pnpm dev
pnpm build
pnpm preview
pnpm start
pnpm lint
pnpm format
pnpm check
pnpm db:generate
pnpm db:push
pnpm db:migrate
pnpm db:studio
pnpm db:seed
```
