# Miles Studio — Open Book Podcasts

Official website for **Miles Studio**, the YouTube podcast hosted by **Tanveer HK** ([@milesstudio](https://www.youtube.com/@milesstudio)).

> *Conversations That Inspire Growth* — real conversations with real people about career, creativity, and growth.

**Live site:** https://miles-studio-website.vercel.app/

---

## Overview

A fast, dependency-free static front end backed by Vercel serverless functions and Supabase. All public content — hero copy, featured episode, guest cards, upcoming guests, about text, and contact links — is managed through a built-in admin dashboard and stored in Supabase, so the site updates for every visitor without a redeploy.

### Features

- **Editorial dark visual identity** — red/black/white brand built around the handwritten MS signature monogram and the Open Book Podcasts logotype, with its signature corner-bracket framing device used throughout
- **Content management** — a password-protected admin dashboard (`/admin/login`) for editing every piece of public content: featured episode, guest cards, upcoming guests, hero/about/contact copy, and social links
- **Contact inbox** — visitor messages are validated server-side, stored in Supabase, and readable/deletable from the admin dashboard
- **Performance-first video** — the featured YouTube episode renders as a lightweight thumbnail facade; the real iframe is injected only on click
- **Motion design without libraries** — hero line clip-in, scroll reveals with stagger, section-number count-ups, button fill-slides, and card hover states, implemented with plain CSS transitions and a single `IntersectionObserver`; fully respects `prefers-reduced-motion`
- **SEO-ready** — Open Graph and Twitter Card tags, canonical URL, and `PodcastSeries` JSON-LD structured data
- **Lighthouse** — Performance 99 · Accessibility 95 · Best Practices 96 · SEO 100

---

## Tech stack

| Layer | Technology |
|---|---|
| Front end | Static HTML/CSS/JS — no framework, no build step |
| Typography | Bebas Neue (display), Oswald (sub-heads), Inter (body) via Google Fonts |
| API | Vercel serverless functions (Node.js 20) |
| Database | Supabase (Postgres + REST) |
| Hosting | Vercel (static assets + `/api` routes) |

---

## Project structure

```
├── index.html            # Public single-page site
├── styles.css            # Public site stylesheet (design tokens + components)
├── script.js             # Public site behavior: rendering, animations, form submit
├── data-store.js         # Shared content store: defaults, API client, auth helpers
├── 404.html              # Not-found page
├── Assets/               # Brand assets (MS monogram, Open Book Podcasts logo)
├── admin/
│   ├── login/index.html  # Admin login page  → /admin/login
│   ├── dashboard/        # Admin dashboard   → /admin/dashboard
│   ├── login.js          # Login flow
│   ├── dashboard.js      # Dashboard CRUD logic
│   ├── admin.css         # Admin-specific styles
│   └── base.css          # Admin base stylesheet (independent of public theme)
├── api/
│   ├── _shared.js        # Env config, Supabase client, helpers
│   ├── content.js        # GET/PUT site content
│   ├── contact.js        # POST/GET/DELETE contact messages
│   └── admin-login.js    # POST admin credential check
├── supabase/schema.sql   # Database schema + row-level security policies
└── vercel.json           # Rewrites (clean admin URLs) + security/cache headers
```

---

## API

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/content` | `GET` | — | Fetch the published site content |
| `/api/content` | `PUT` | Bearer token | Publish updated site content |
| `/api/contact` | `POST` | — | Submit a contact message (validated, length-capped) |
| `/api/contact` | `GET` | Bearer token | List the 50 most recent messages |
| `/api/contact?id=…` | `DELETE` | Bearer token | Delete a message |
| `/api/admin-login` | `POST` | — | Exchange admin credentials for a session token |

---

## Local development

The site is static, so any file server works for front-end changes:

```bash
python3 -m http.server 8901
# → http://localhost:8901
```

Note: the `/api` routes and the clean `/admin/login` URL are provided by Vercel. For a full local environment, use the Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

Syntax-check all JavaScript:

```bash
npm run check
```

---

## Deployment

1. **Supabase** — create a project and run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor. It creates two tables with row-level security:
   - `site_content` — single-row JSON document holding all public content
   - `contact_messages` — inbox for the contact form
2. **Vercel** — import the repository and set the environment variables below.
3. Push to `main` — Vercel deploys automatically.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service-role key (server-side only, never exposed to the client) |
| `ADMIN_EMAIL` | ✅ | Admin login email |
| `ADMIN_PASSWORD` | ✅ | Admin login password |
| `ADMIN_SESSION_TOKEN` | ✅ | Secret token issued to the admin session after login |

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the step-by-step guide.

---

## Content management

1. Open `/admin/login` (intentionally not linked from the public site) and sign in.
2. The dashboard provides:
   - **Website Content** — hero, featured episode, about, and contact/social links
   - **Podcast Guests** — add/edit/remove guest cards, upload photos, set the featured episode
   - **Upcoming Guests** — pipeline items with topic, date, and status
   - **Messages** — read and delete contact-form submissions
3. Saving publishes through `/api/content` to Supabase; the public site picks up changes on next load.

---

## Design system

| Token | Value | Use |
|---|---|---|
| `--ms-red` | `#E02020` | Primary accent — all interactive elements |
| `--ms-red-dark` | `#B91010` | Hover state |
| `--ms-black` | `#0A0A0A` | Primary background |
| `--ms-dark` | `#141414` | Alternate section background |
| `--ms-card` | `#181818` | Card background |
| `--ms-white` | `#FFFFFF` | Primary text |
| `--ms-off` | `#A0A0A0` | Secondary text |

Signature elements: corner bracket frames (from the logotype), red word-underline highlights, oversized Bebas Neue section numbers, and the MS monogram used as ambient watermarks.

---

## License

© 2026 Miles Studio. All rights reserved.
