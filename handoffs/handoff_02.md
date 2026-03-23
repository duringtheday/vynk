# Vynk — Handoff 02
**Fecha:** 23 de marzo de 2026  
**Sesión:** UI neumórfica, dashboard admin, fixes de autenticación y deploy

---

## Estado actual

| Item | Estado |
|------|--------|
| Neon Database | ✅ Configurado + tabla `admin_2fa_codes` pendiente en SQL Editor |
| Clerk Auth | ✅ Configurado |
| Stripe productos | ✅ Configurado |
| Vercel deploy | ✅ Live en https://vynk-taupe.vercel.app |
| `OWNER_CLERK_ID` | ✅ Configurado |
| `STRIPE_WEBHOOK_SECRET` | ✅ Configurado |
| `ADMIN_PIN_HASH` | ✅ Configurado |
| `SESSION_SECRET` | ✅ Configurado |
| `RESEND_API_KEY` | ✅ Configurado |
| `RESEND_FROM_EMAIL` | ✅ `onboarding@resend.dev` |
| `STRIPE_PRICE_RENEWAL` | ⚠️ Verificar que esté en Vercel |
| Admin dashboard | ✅ Funciona en producción |
| Admin 2FA email | ✅ Funciona vía Resend |
| Landing page | ✅ 4 secciones con scroll-snap neumórfico |
| Builder | ⏳ Pendiente prueba completa |
| Tarjeta pública `/c/[slug]` | ⏳ Pendiente prueba con tarjeta real |
| Flujo de pago Stripe | ⏳ Pendiente prueba end-to-end |
| `admin_2fa_codes` tabla en Neon | ⏳ Pendiente crear via SQL Editor |

---

## Variables de entorno — estado completo

```dotenv
# Neon
DATABASE_URL=postgresql://neondb_owner:...@ep-steep-salad-a1xt7i0m-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/builder
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/builder
OWNER_CLERK_ID=user_... ✅

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_NEW_CARD=price_1TDqJQQdWFdkRFKM014HuI7u
STRIPE_PRICE_RENEWAL=price_... ⚠️ verificar
STRIPE_WEBHOOK_SECRET=whsec_... ✅

# App
NEXT_PUBLIC_APP_URL=https://vynk-taupe.vercel.app
NEXT_PUBLIC_APP_NAME=Vynk

# Admin
ADMIN_PIN_HASH=$2b$12$... ✅
ADMIN_SESSION_MINUTES=15
SESSION_SECRET=... ✅

# Email
RESEND_API_KEY=re_... ✅
RESEND_FROM_EMAIL=onboarding@resend.dev ✅
OWNER_EMAIL=operacionesdslc@gmail.com
```

---

## Arquitectura del proyecto

```
D:\SaaS\vynk\
├── src/
│   ├── app/
│   │   ├── page.tsx                    ✅ Landing 4 secciones neumórficas
│   │   ├── layout.tsx                  ✅ Clerk + Syne + DM Sans
│   │   ├── globals.css                 ✅ Paleta #0D0F12 / #D4A84F / #BFC3C9
│   │   ├── sign-in/                    ✅ Neumórfico + back button
│   │   ├── sign-up/                    ✅ Neumórfico + back button
│   │   ├── builder/page.tsx            ⏳ Pendiente revisión visual
│   │   ├── c/[slug]/page.tsx           ⏳ Pendiente prueba real
│   │   ├── checkout/success/           ✅ Neumórfico
│   │   ├── admin/
│   │   │   ├── page.tsx                ✅ Dashboard completo neumórfico
│   │   │   └── login/page.tsx          ✅ PIN + 2FA neumórfico
│   │   ├── api/
│   │   │   ├── admin/auth/route.ts     ✅ PIN + 2FA + SKIP_2FA dev
│   │   │   ├── admin/dashboard/        ✅ Todas las secciones
│   │   │   ├── cards/route.ts          ✅ CRUD + Stripe checkout
│   │   │   ├── webhooks/stripe/        ✅ Activa tarjetas al pagar
│   │   │   └── promos/validate/        ✅ Validación de códigos
│   │   └── legal/                      ✅ Terms, Privacy, Refunds
│   ├── db/
│   │   ├── schema.ts                   ✅ Todas las tablas + admin_2fa_codes
│   │   └── index.ts                    ✅ Neon + Drizzle
│   ├── lib/
│   │   ├── admin-auth.ts               ✅ bcrypt + Resend 2FA
│   │   ├── stripe.ts                   ✅ Checkout sessions
│   │   ├── vcard.ts                    ✅ Generador vCard
│   │   ├── qr.ts                       ✅ QR + slug generator
│   │   └── rules.ts                    ✅ Campos free vs paid
│   └── middleware.ts                   ✅ Clerk + admin vault
├── public/
│   └── logo.png                        ✅ Recortado sin padding interno
└── .env.local                          ✅ Todas las vars (no subir a Git)
```

---

## Problemas conocidos y soluciones aplicadas

### 1. 2FA expiraba en segundos
**Causa:** Vercel es serverless — el Map en memoria se perdía entre requests  
**Solución:** Tabla `admin_2fa_codes` en Neon para persistir códigos  
**Pendiente:** Crear la tabla en Neon SQL Editor:
```sql
CREATE TABLE IF NOT EXISTS admin_2fa_codes (
  ip TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL
);
```

### 2. Admin login no funcionaba localmente
**Causa:** Clerk intercepta rutas API antes del middleware en desarrollo  
**Solución temporal:** Usar producción (Vercel) para probar el admin  
**Variable de desarrollo:** `SKIP_2FA=true` en `.env.local` — pendiente de funcionar

### 3. Logo con espacio interno
**Causa:** PNG 1024×1024 con mucho padding alrededor del logo  
**Solución:** Recortado a 777×268 con script Python

### 4. GitHub push bloqueado por Stripe keys
**Causa:** Keys reales de Stripe en `.env.example`  
**Solución:** Reemplazar con placeholders `YOUR_KEY_HERE`

### 5. Schema destruido
**Causa:** Se reemplazó `schema.ts` completo con solo la nueva tabla  
**Solución:** Restaurado el schema completo con todas las tablas

---

## Paleta de colores Vynk (definitiva)

| Variable CSS | Hex | Uso |
|---|---|---|
| `--graphite` | `#0D0F12` | Fondo base (70%) |
| `--gold` | `#D4A84F` | Acento premium (10%) |
| `--silver` | `#BFC3C9` | Texto principal (15%) |
| `--smoke` | `#6F737A` | Texto secundario (5%) |
| `--carbon` | `#050607` | Sombras profundas |

### Sombras neumórficas
```css
--nm-dark:    #08090B
--nm-lite:    #141720
--nm-raised:  5px 5px 14px #08090B, -3px -3px 10px #141720
--nm-inset:   inset 4px 4px 10px #08090B, inset -3px -3px 8px #141720
--nm-gold:    4px 4px 14px #08090B, -2px -2px 8px #141720, 0 0 22px rgba(212,168,79,0.2)
```

---

## URLs importantes

| Servicio | URL |
|---|---|
| App production | https://vynk-taupe.vercel.app |
| GitHub repo | https://github.com/duringtheday/vynk |
| Vercel Dashboard | https://vercel.com/vynks-projects/vynk |
| Clerk Dashboard | https://dashboard.clerk.com |
| Stripe Dashboard | https://dashboard.stripe.com |
| Neon Dashboard | https://console.neon.tech |
| Resend Dashboard | https://resend.com |

---

## Pendientes para Handoff 03

1. **Crear tabla `admin_2fa_codes` en Neon** (SQL Editor)
2. **Probar flujo completo de pago** — builder → Stripe → tarjeta publicada
3. **Verificar `STRIPE_PRICE_RENEWAL`** en Vercel
4. **Builder visual** — aplicar paleta neumórfica correcta
5. **Tarjeta pública** — revisar diseño y funcionalidad
6. **Teléfono Cambodia** — desactivar como obligatorio en Clerk o cambiar proveedor SMS
7. **Admin local** — resolver `SKIP_2FA` para desarrollo
8. **Dominio propio** — cuando esté listo, configurar en Vercel + Resend + Stripe
9. **Stripe modo Live** — cuando todo funcione en test, cambiar a producción
10. **Demo card** — crear tarjeta demo en `/c/demo` para la landing

---

## Stack técnico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js | 15.2.8 |
| Lenguaje | TypeScript | 5.x |
| Base de datos | Neon (Postgres serverless) | — |
| ORM | Drizzle | 0.31.4 |
| Auth | Clerk | v5 |
| Pagos | Stripe | 16.x |
| Email | Resend | — |
| Hosting | Vercel | — |
| Fuentes | DM Sans + Syne | — |
