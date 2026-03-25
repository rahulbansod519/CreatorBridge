# CreatorBridge

Full-stack SaaS marketplace connecting social media creators with brands.

## Commands

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run prisma:migrate   # Run DB migrations
npm run prisma:generate  # Generate Prisma client
npm run prisma:seed      # Seed database with sample data
npm run prisma:studio    # Open Prisma Studio (localhost:5555)
```

## Environment Variables

Required in `.env.local`:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — JWT secret (min 32 chars)
- `NEXTAUTH_URL` — App URL (http://localhost:3000 in dev)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Optional Google OAuth
- `UPLOADTHING_SECRET` / `UPLOADTHING_APP_ID` — File uploads

## Architecture

**Pattern:** Feature-based service layer. All business logic lives in `features/*/service.ts`. API routes are thin: parse → service → respond. Pages are server components by default, client components only for interactivity.

**Auth:** NextAuth v5 (beta) with JWT strategy. Role (`CREATOR` | `BRAND`) and `onboarded` status stored in JWT. After onboarding, call `update()` from `useSession()` to refresh the JWT before redirecting.

**Database:** Prisma + PostgreSQL. Array fields (`niches[]`, `platforms[]`) use native PostgreSQL arrays.

**Charts:** Recharts — always client components. Never import in server component files. Mock data in `lib/mock-data.ts`.

## Key Files

- `lib/auth.ts` — NextAuth config with JWT callbacks
- `features/auth/service.ts` — `requireSession(role?)` guard
- `lib/validations.ts` — All Zod schemas
- `prisma/schema.prisma` — Database schema
- `components/shared/dashboard-shell.tsx` — Shared layout for both roles

## Seed Users (password: `password123`)

- `brand@techgear.com` — Brand (TechGear Co)
- `brand@glowup.com` — Brand (GlowUp Beauty)
- `brand@fitlife.com` — Brand (FitLife Nutrition)
- `maya@example.com` — Creator (Beauty/Lifestyle)
- `alex@example.com` — Creator (Tech/Gaming)
- `priya@example.com` — Creator (Fitness)
- `jordan@example.com` — Creator (Travel)
- `sam@example.com` — Creator (Food)
