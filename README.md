# Waitlist App - Built with ReqRes

A complete waitlist application with public signup, admin dashboard, and magic-code authentication.
**Zero backend code. No server. No database setup. No deployment pipeline.**

## What's Inside

- Public signup form with duplicate detection
- Passwordless admin login (magic code sent to your email)
- Admin dashboard with search, filter, and pagination
- Position tracking ("You're #47!")
- Optimistic UI updates
- Mobile responsive landing page
- Built entirely on [ReqRes](https://reqres.in)

## What You Don't Need

- Express / Fastify / any backend framework
- PostgreSQL / MongoDB / any database setup
- Auth0 / Clerk / any auth provider
- Vercel / Railway / any backend hosting

## Quick Start

1. Clone this repo
2. Create a free account at [app.reqres.in](https://app.reqres.in)
3. Create a project and a `waitlist` collection with the [schema below](#collection-schema)
4. Copy `.env.example` to `.env` and add your keys (find them in your project's **Settings > API Keys**)
5. `npm install && npm run dev`

**Shortcut:** After signing up, use the AI generator on your dashboard - type **"a waitlist app"** and it'll create the project and collection for you. You'll still need to copy the keys into `.env`.

## Collection Schema

Create a collection called `waitlist` with these fields:

```json
{
  "fields": {
    "email": { "type": "string", "required": true },
    "name": { "type": "string", "required": false },
    "referral_source": { "type": "string", "required": false },
    "status": { "type": "string", "required": true, "default": "waiting", "enum": ["waiting", "invited", "joined"] },
    "invited_at": { "type": "date", "required": false },
    "notes": { "type": "string", "required": false }
  }
}
```

## Environment Variables

```bash
VITE_REQRES_BASE_URL=https://reqres.in
VITE_REQRES_PROJECT_ID=        # Your project ID (number) - visible in project settings
VITE_REQRES_PUBLIC_KEY=        # pub_ key - used for magic-code login requests
VITE_REQRES_MANAGE_KEY=        # pro_ key - used for record CRUD + code verification
VITE_REQRES_COLLECTION_SLUG=waitlist
VITE_ADMIN_ENABLED=true        # Set to "false" to disable admin login on public demos
```

If any required keys are missing, the app will log a clear error to the browser console on startup.

## How It Maps to ReqRes

| App feature | ReqRes feature | API used |
|---|---|---|
| Signup form creates a record | **Collections API** | `POST /api/collections/waitlist/records` |
| Duplicate email check | **Record search** | `GET /api/collections/waitlist/records?data_contains={"email":"..."}` |
| Position counter ("You're #47") | **Pagination meta** | `GET /api/collections/waitlist/records?created_before=...&limit=1` → `meta.total` |
| Admin login (enter email, get code) | **App Users - Magic Code** | `POST /api/app-users/login` |
| Code verification → session token | **App Users - Verify** | `POST /api/app-users/verify` |
| Dashboard table with pagination | **Record listing** | `GET /api/collections/waitlist/records?page=1&limit=20&order=desc` |
| Search by name/email | **Full-text search** | `?search=jane` |
| Filter by status | **Data filtering** | `?data_contains={"status":"invited"}` |
| Invite action (status change) | **Record update** | `PUT /api/collections/waitlist/records/:id` |
| Delete a signup | **Record delete** | `DELETE /api/collections/waitlist/records/:id` |

## Architecture

```
Browser → ReqRes API → Postgres
           ↑
     No middle layer
```

- **Public signup** - uses the project API key (`pro_`) to create records directly
- **Admin auth** - magic code flow via App Users (`pub_` for login, `pro_` for verify)
- **Admin dashboard** - uses the project API key (`pro_`) for full record management

> **Note:** In production, you'd proxy the API key through a Cloudflare Pages Function to keep it server-side. For this demo, the key is used directly from the browser.

## Deployment

Configured for Cloudflare Pages via `wrangler.json`. Set environment variables in the Cloudflare Pages dashboard.

```bash
npm run build && npx wrangler pages deploy dist
```

## Bonus: Real-time Notifications

After deploying, set up an automation in the ReqRes dashboard (**Automations** tab in your project):

- **Event:** `record.created` on the `waitlist` collection
- **Action:** Webhook to a Slack/Discord incoming webhook URL

You get real-time signup notifications without writing a webhook handler.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS (CDN for zero-config styling)
- Cloudflare Pages (optional)
- **No other dependencies**

## Built with ReqRes

This app runs on [ReqRes](https://reqres.in) - a backend-as-a-service that gives you a database, API, auth, and automations in one platform. No backend code required.

**[Get your own backend →](https://reqres.in)**
