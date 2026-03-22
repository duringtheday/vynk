# Vynk — Make every introduction smart

Premium digital business card platform built with **Next.js 15 + Neon + Drizzle + Clerk + Stripe**.

---

## Stack

| Layer | Tech | Cost |
|---|---|---|
| Framework | Next.js 15.2 + TypeScript (.tsx) | Free |
| Database | Neon (Postgres serverless) | Free tier |
| Auth | Clerk v5 | Free up to 10k users |
| Payments | Stripe | 2.9% + $0.30 per tx |
| Hosting | Vercel | Free tier |
| Domain | Any registrar | ~$10/year |
| Emails (2FA) | Gmail SMTP | Free |

**Total fixed cost to launch: ~$10/year (domain only)**

---

## Quick start

```bash
# 1. Enter project folder
cd vynk

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env.local

# 4. Fill in your credentials (see steps below)
# Then:
npm run dev
# Open http://localhost:3000
```

---

## Step-by-step setup

### 1. Neon database

1. Go to https://console.neon.tech → Create account → New project
2. Choose a name and region (pick closest to your users)
3. Go to **Connection Details** → copy **Connection string**
4. Paste in `.env.local` as `DATABASE_URL`
5. Run migrations:
   ```bash
   npm run db:push
   ```
   This creates all tables automatically from `src/db/schema.ts`

To view your data visually:
```bash
npm run db:studio
```

---

### 2. Clerk authentication

1. Go to https://dashboard.clerk.com → Create application
2. Enable: **Email, Phone, Google, Apple** sign-in methods
3. Go to **API Keys** and copy:
   - Publishable key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret key → `CLERK_SECRET_KEY`
4. After first sign-up (step 8 below), get your Clerk User ID:
   - Dashboard → Users → click your account → copy **User ID**
   - Paste as `OWNER_CLERK_ID`

---

### 3. Stripe payments

1. Go to https://dashboard.stripe.com → Create account
2. **Create products** (Catalog → Products → Add product):
   - Product: "Vynk Digital Card"
   - Price 1: $20.00 one-time → copy Price ID → `STRIPE_PRICE_NEW_CARD`
   - Price 2: $10.00 one-time → copy Price ID → `STRIPE_PRICE_RENEWAL`
3. **API Keys** (Developers → API Keys):
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
4. **Webhook** (Developers → Webhooks → Add endpoint):
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `payment_intent.payment_failed`
   - Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

For local testing use Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

### 4. Gmail SMTP (for admin 2FA codes)

1. Google Account → Security → 2-Step Verification → App Passwords
2. Generate app password for "Mail"
3. Fill in `.env.local`:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM="Vynk Admin <noreply@vynk.app>"
OWNER_EMAIL=your@email.com
```

---

### 5. Generate your admin PIN hash

```bash
npm run setup:pin
```
Enter a 6-digit PIN when prompted. Copy the output into `.env.local`:
```
ADMIN_PIN_HASH=your_bcrypt_hash_here
```

---

### 6. Generate session secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Paste output as `SESSION_SECRET` in `.env.local`

---

### 7. Run locally and test

```bash
npm run dev
```

Test the full flow:
- Visit `http://localhost:3000`
- Sign up at `/sign-up`
- Build a card at `/builder`
- Stripe test card: `4242 4242 4242 4242` · any future date · any CVC
- View your card at `/c/your-slug`
- Admin login at `/admin/login` (PIN + 2FA email)

---

### 8. Set yourself as owner

After your first sign-up:
1. Go to Clerk Dashboard → Users → click your account
2. Copy your **User ID** (format: `user_xxxx...`)
3. Paste as `OWNER_CLERK_ID` in `.env.local`

As owner you get:
- Free card edits anytime (no $10 renewal fee)
- No confirmation dialogs
- Full admin dashboard access

---

### 9. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy to production
vercel --prod
```

Then in **Vercel Dashboard → your project → Settings → Environment Variables**:
- Add every variable from your `.env.local`
- Redeploy: `vercel --prod`

---

### 10. Connect your domain

1. Vercel Dashboard → your project → **Settings → Domains**
2. Add `vynk.app` (or your domain)
3. Follow DNS instructions (add A record or CNAME at your registrar)
4. Update `NEXT_PUBLIC_APP_URL=https://vynk.app` in Vercel env vars
5. Update your Stripe webhook URL to use the production domain
6. Redeploy: `vercel --prod`

---

### 11. Switch Stripe to live mode

When ready to accept real payments:
1. Toggle Stripe dashboard from **Test → Live**
2. Get live API keys and update in Vercel env vars
3. Re-create the webhook in live mode
4. Update `STRIPE_PRICE_NEW_CARD` and `STRIPE_PRICE_RENEWAL` with live Price IDs

---

## Project structure

```
vynk/
├── src/
│   ├── app/
│   │   ├── page.tsx                    Landing page
│   │   ├── layout.tsx                  Root layout + Clerk + fonts
│   │   ├── globals.css                 Vynk brand styles
│   │   ├── sign-in/[[...sign-in]]/     Clerk sign-in
│   │   ├── sign-up/[[...sign-up]]/     Clerk sign-up
│   │   ├── builder/page.tsx            Card builder
│   │   ├── checkout/success/           Post-payment success
│   │   ├── c/[slug]/
│   │   │   ├── page.tsx                Public card (flip animation)
│   │   │   └── not-found.tsx           Card not found
│   │   ├── admin/
│   │   │   ├── layout.tsx              Admin layout (noindex)
│   │   │   ├── page.tsx                Full dashboard
│   │   │   └── login/page.tsx          PIN + 2FA vault
│   │   ├── api/
│   │   │   ├── cards/route.ts          Card CRUD + payment
│   │   │   ├── cards/track-save/       Track vCard downloads
│   │   │   ├── promos/validate/        Validate promo codes
│   │   │   ├── webhooks/stripe/        Stripe payment webhook
│   │   │   └── admin/
│   │   │       ├── auth/route.ts       PIN + 2FA login
│   │   │       └── dashboard/route.ts  All dashboard data
│   │   └── legal/                      Terms, Privacy, Refunds
│   ├── db/
│   │   ├── schema.ts                   Drizzle schema (all tables)
│   │   └── index.ts                    Neon + Drizzle client
│   ├── lib/
│   │   ├── stripe.ts                   Stripe integration
│   │   ├── vcard.ts                    vCard generator (Vynk branded)
│   │   ├── qr.ts                       QR + slug generator
│   │   ├── admin-auth.ts               PIN, 2FA, session security
│   │   └── rules.ts                    Business rules (free vs paid)
│   └── middleware.ts                   Clerk auth + admin protection
├── scripts/
│   └── hash-pin.js                     Generate admin PIN hash
├── public/
│   └── logo.png                        Vynk logo
├── drizzle/                            Generated migrations
├── .env.example                        All env vars documented
├── vercel.json                         Vercel deployment config
├── drizzle.config.ts
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## Business rules

| Action | Cost | Who can do it |
|---|---|---|
| Create new card | $20 | Any authenticated user |
| Change name, photo, title, company, phone, email | $10 | Same account only |
| Change bio, services, socials, colors, design | Free | Same account only |
| Edit anything | Free | Owner account |
| Create promo codes | Free | Owner only (admin panel) |

---

## Security layers (admin dashboard)

1. **Clerk authentication** — must be signed in
2. **Route middleware** — `/admin/*` blocked without vault session
3. **6-digit PIN** — hashed with bcrypt (12 rounds)
4. **2FA email code** — 6-digit OTP, 5-minute expiry
5. **Encrypted session cookie** — httpOnly, secure, sameSite=strict, 15-min expiry
6. **Auto-lock** — session expires on inactivity
7. **Lockout** — 3 failed PIN attempts → 10-min IP block
8. **Access log** — every entry recorded to database

---

## Support

Questions? Issues? Open a GitHub issue or email support@vynk.app
