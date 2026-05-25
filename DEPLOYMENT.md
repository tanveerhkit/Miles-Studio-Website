# Miles Studio Live Deployment

This website is ready for Vercel hosting with a real shared admin backend.

The live content flow is:

1. Public website loads content from `/api/content`.
2. Admin logs in through `/api/admin-login`.
3. Admin dashboard saves content through `/api/content`.
4. Contact form submissions are saved through `/api/contact`.
5. Vercel API routes store the content and contact messages in Supabase Postgres.
6. Every visitor sees the same updated website content.

## 1. Create Free Supabase Project

1. Go to Supabase and create a free project.
2. Open **SQL Editor**.
3. Paste and run the SQL from:

```text
supabase/schema.sql
```

This creates the `site_content` table and the `contact_messages` table.
If the live website shows default content on other devices, rerun this SQL so
the table grants and row-level security policies are updated.

## 2. Get Supabase Keys

In Supabase, open **Project Settings > API Keys** and copy:

- Project URL
- A backend secret key, usually `sb_secret_...`

If your dashboard only shows legacy keys, use the legacy `service_role` key.

Keep this key private. It must only be stored in Vercel environment
variables, never in frontend JavaScript.

## 3. Add Vercel Environment Variables

In Vercel, open your project:

**Settings > Environment Variables**

Add these variables for Production, Preview, and Development:

```text
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_or_service_role_key
ADMIN_EMAIL=tanveerhk.it@gmail.com
ADMIN_PASSWORD=tanveerhkit
ADMIN_SESSION_TOKEN=make-a-long-random-secret-token
```

Use a long random value for `ADMIN_SESSION_TOKEN`, for example a 40+ character
random string. The app has a fallback token so login will not completely break
if this variable is missing, but setting your own token is strongly recommended.

Important: `SUPABASE_SERVICE_ROLE_KEY` must be the Supabase secret/service role
key, not the public anon key. If it is the anon key, the admin dashboard will
appear to save in your browser, but other devices will still see old/default
content.

## 4. Deploy to Vercel

From the project folder:

```bash
npm install -g vercel
vercel login
vercel --prod
```

Or without global install:

```bash
npx vercel login
npx vercel --prod
```

## 5. Live Routes

After deployment, these routes will work:

- `/`
- `/admin`
- `/admin/login`
- `/admin/dashboard`
- `/api/content`
- `/api/admin-login`
- `/api/contact`

The public website has an **Admin Login** button in the navbar.

## Notes

- The admin password is checked by a Vercel API route.
- The Supabase secret/service role key is used only on the server side.
- `localStorage` remains only as a fallback cache if the API is unavailable.
- For stronger production security later, replace the simple token login with
  Supabase Auth or another full authentication provider.
