# Waitlist App - Built with ReqRes

A complete waitlist application with public signup, admin dashboard, and magic-code authentication.
**Zero backend code. No server. No database setup. No deployment pipeline.**

## What's Inside

- Public signup form with duplicate detection
- Passwordless admin login (magic code)
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
2. Create a free ReqRes account at [reqres.in](https://reqres.in)
3. Create a project and a `waitlist` collection with the schema below
4. Copy `.env.example` to `.env` and add your keys
5. `npm install && npm run dev`

Or skip steps 2–3: use the ReqRes AI generator and type "a waitlist app" - it'll create the project and collection for you.

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
VITE_REQRES_PROJECT_ID=        # Your ReqRes project ID (number)
VITE_REQRES_PUBLIC_KEY=        # pub_ key (for login request)
VITE_REQRES_MANAGE_KEY=        # pro_ key (for verify + record management)
VITE_REQRES_COLLECTION_SLUG=waitlist
```

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
npx wrangler pages deploy dist
```

## Bonus: Real-time Notifications

After deploying, set up a trigger in the ReqRes dashboard:

- **Event:** `record.created` on the `waitlist` collection
- **Action:** Webhook to a Slack/Discord incoming webhook URL

You just got real-time signup notifications without writing a webhook handler.

## Built with ReqRes

This app runs on [ReqRes](https://reqres.in) - a backend-as-a-service that gives you a database, API, auth, and environments in one platform. No backend code required.

**[Get your own backend →](https://reqres.in)**
