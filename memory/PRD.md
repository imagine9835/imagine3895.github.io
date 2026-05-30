# flicksfromnai — Photographer Portfolio Site

## Problem Statement
Build a website for a photographer, inspired by Instagram account @flicksfromnai.

## User Choices
- Style: Dark, moody, cinematic + minimal editorial (Cormorant Garamond serif + Outfit body)
- Sections: Home, Portfolio (with categories), About, Services/Pricing, Contact
- Contact: info only — no form submissions
- Images: placeholder photography now + admin upload section for the photographer to manage later
- Photographer name: flicksfromnai

## Architecture
- **Backend**: FastAPI + MongoDB. Single `photos` collection. Admin actions protected by `X-Admin-Key` header (shared secret in `.env`).
- **Frontend**: React + Tailwind + shadcn/ui (admin) + framer-motion + Lenis smooth scroll.
- Routes: `/`, `/portfolio`, `/portfolio/:category`, `/admin`.

## Implemented (2025-12)
- Backend endpoints: `GET /api/photos` (+ category, featured filters), `POST /api/admin/verify`, `POST/PATCH/DELETE /api/photos` (admin only). Auto-seeds 15 placeholder photos across 5 categories on first startup.
- Frontend Home: cinematic hero, animated marquee, asymmetric featured tetris grid, category list, About w/ stats, Services 3-tier pricing, Contact (email/IG/location).
- Portfolio page: masonry gallery, category filter buttons, deep-linkable URLs, framer-motion entrance + lightbox (prev/next/Esc).
- Admin: shared-key login (`flicksfromnai-admin-2025`), dashboard with category filter, add photo (URL or file upload up to 5MB → base64), toggle featured, delete.
- Testing: 14/14 backend pytest passing, all frontend flows verified.

## Test Credentials
See `/app/memory/test_credentials.md` — Admin Key: `flicksfromnai-admin-2025`.

## Backlog (P1/P2)
- P1: Move uploaded images to S3/object storage instead of base64-in-Mongo for production scale.
- P1: Replace static admin key with proper JWT auth + bcrypt before going public.
- P2: Pagination on `/api/photos` (currently capped at 1000).
- P2: Migrate `@app.on_event` → FastAPI lifespan context manager.
- P2: Add testimonials / press logos section.
- P2: SEO meta tags + Open Graph image per page.
- P2: Inquiry/booking form (deferred per user — currently info only).
