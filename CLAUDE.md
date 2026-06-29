@AGENTS.md

# Arabia Ecom — Portal (Next.js)

> **Read `../arabia-ecom-api/HANDOFF.md` first** (in the sister repo `zubairkhawar/arabia-ecom-api`). It's the single source of truth for both repos: architecture, auth model, attribution flow, env vars, deploy, recipes, and gotchas.

## Project at a glance

Admin + Reseller portal — both UIs live in **this one Next.js app**, role-gated by the `kind` claim on the JWT.

- **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Turbopack
- **Deploy:** push to `main` → Vercel auto-builds → live in ~30s
- **Backend:** `zubairkhawar/arabia-ecom-api` (FastAPI on Render, Singapore region)
- **API base URL:** set via `NEXT_PUBLIC_API_BASE` in `.env.local` / Vercel env

## Codebase rules

- **`AGENTS.md` is mandatory reading** — this is *not* the Next.js you know from training data. Read `node_modules/next/dist/docs/` for relevant guides before writing routing, layout, or data-fetching code.
- **No new files** unless the change clearly needs one. Prefer editing existing pages/components.
- **No emojis in code or comments** unless asked.
- **Default to no comments.** The codebase reads itself.
- **All `/me/*` and `/admin/*` calls go through `lib/api.ts`** — it adds the JWT, normalizes errors via `ApiError`, and waits up to 60s for Render cold-starts.
- **Role guards** live in `app/admin/layout.tsx` and `app/reseller/layout.tsx`. They redirect on wrong role; don't duplicate the check in pages.
- **Types** mirror backend Pydantic models in `lib/types.ts` — when the backend schema changes, update the matching TS interface in the same commit.

## Route map (high-level)

```
app/
├── (auth)/login          ← shared login (admin OR reseller)
├── (auth)/signup         ← reseller signup
├── admin/*               ← admin portal (role-gated)
│   ├── pool-numbers      ← manage universal WhatsApp pool
│   ├── settings          ← PlatformSettings singleton
│   └── resellers, chats, orders, tracking, billing, notifications
├── reseller/*            ← reseller portal (role-gated)
│   ├── setup             ← Channel Setup wizard (WhatsApp + Meta + Shopify)
│   ├── settings          ← AI bot settings (3 tabs: General / Business Hours / Profile)
│   └── products, orders, chats, analytics
└── r/[slug]              ← PUBLIC redirect page that fires the Pixel + jumps to wa.me
```

## Don't do these without asking

- Change `lib/api.ts` cold-start timeout — it's tuned for Render's free tier
- Break the `kind` claim contract — the admin/reseller split depends on it
- Move `r/[slug]` — it's the ad redirect target; URLs are live in Facebook Ad campaigns
