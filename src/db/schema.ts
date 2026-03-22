import {
  pgTable, text, boolean, integer,
  timestamp, jsonb, uuid, pgEnum
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ── Enums ─────────────────────────────────────────────────────
export const cardStatusEnum = pgEnum('card_status',    ['draft','active','archived'])
export const payTypeEnum    = pgEnum('payment_type',   ['new_card','renewal'])
export const payStatusEnum  = pgEnum('payment_status', ['pending','paid','failed'])
export const discountEnum   = pgEnum('discount_type',  ['percent','fixed','free'])

// ── Users ─────────────────────────────────────────────────────
export const users = pgTable('users', {
  id:        uuid('id').defaultRandom().primaryKey(),
  clerkId:   text('clerk_id').unique().notNull(),
  email:     text('email'),
  phone:     text('phone'),
  fullName:  text('full_name'),
  isOwner:   boolean('is_owner').default(false).notNull(),
  isActive:  boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login'),
})

// ── Cards ─────────────────────────────────────────────────────
export const cards = pgTable('cards', {
  id:        uuid('id').defaultRandom().primaryKey(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug:      text('slug').unique().notNull(),
  status:    cardStatusEnum('status').default('draft').notNull(),
  fullName:  text('full_name').notNull(),
  title:     text('title'),
  company:   text('company'),
  photoUrl:  text('photo_url'),
  logoUrl:   text('logo_url'),
  phone:     text('phone'),
  whatsapp:  text('whatsapp'),
  email:     text('email'),
  tagline:   text('tagline'),
  bio:       text('bio'),
  services:  text('services').array(),
  telegram:  text('telegram'),
  instagram: text('instagram'),
  linkedin:  text('linkedin'),
  twitter:   text('twitter'),
  tiktok:    text('tiktok'),
  youtube:   text('youtube'),
  website:   text('website'),
  address:   text('address'),
  design:    jsonb('design').$type<{
    template: string; font: string; mode: string
    bg: string; bg2: string; textColor: string; accent: string
  }>().default({ template:'circles', font:'dm', mode:'gradient', bg:'#1a1a2e', bg2:'#16213e', textColor:'#e8e8f0', accent:'#d4a843' }).notNull(),
  vcfUrl:      text('vcf_url'),
  qrUrl:       text('qr_url'),
  publishedAt: timestamp('published_at'),
  archivedAt:  timestamp('archived_at'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
})

// ── Payments ──────────────────────────────────────────────────
export const payments = pgTable('payments', {
  id:                    uuid('id').defaultRandom().primaryKey(),
  userId:                uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  cardId:                uuid('card_id').references(() => cards.id, { onDelete: 'set null' }),
  stripeSessionId:       text('stripe_session_id').unique(),
  stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
  type:                  payTypeEnum('type').notNull(),
  amountCents:           integer('amount_cents').notNull(),
  currency:              text('currency').default('usd').notNull(),
  status:                payStatusEnum('status').default('pending').notNull(),
  paymentMethod:         text('payment_method'),
  promoCode:             text('promo_code'),
  discountCents:         integer('discount_cents').default(0),
  country:               text('country'),
  paidAt:                timestamp('paid_at'),
  createdAt:             timestamp('created_at').defaultNow().notNull(),
})

// ── Promo Codes ───────────────────────────────────────────────
export const promoCodes = pgTable('promo_codes', {
  id:            uuid('id').defaultRandom().primaryKey(),
  code:          text('code').unique().notNull(),
  discountType:  discountEnum('discount_type').notNull(),
  discountValue: integer('discount_value').default(0).notNull(),
  appliesTo:     text('applies_to').default('both').notNull(),
  maxUses:       integer('max_uses'),
  usesCount:     integer('uses_count').default(0).notNull(),
  expiresAt:     timestamp('expires_at'),
  isActive:      boolean('is_active').default(true).notNull(),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
})

// ── Card Views ────────────────────────────────────────────────
export const cardViews = pgTable('card_views', {
  id:           uuid('id').defaultRandom().primaryKey(),
  cardId:       uuid('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
  country:      text('country'),
  device:       text('device'),
  source:       text('source'),
  referrer:     text('referrer'),
  contactSaved: boolean('contact_saved').default(false),
  viewedAt:     timestamp('viewed_at').defaultNow().notNull(),
})

// ── Contact Saves ─────────────────────────────────────────────
export const contactSaves = pgTable('contact_saves', {
  id:      uuid('id').defaultRandom().primaryKey(),
  cardId:  uuid('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
  device:  text('device'),
  country: text('country'),
  savedAt: timestamp('saved_at').defaultNow().notNull(),
})

// ── Admin Access Log ──────────────────────────────────────────
export const adminLog = pgTable('admin_log', {
  id:        uuid('id').defaultRandom().primaryKey(),
  event:     text('event').notNull(),
  ip:        text('ip'),
  country:   text('country'),
  device:    text('device'),
  browser:   text('browser'),
  notes:     text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Admin 2FA Codes (serverless-safe) ─────────────────────────
export const admin2faCodes = pgTable('admin_2fa_codes', {
  ip:        text('ip').primaryKey(),
  code:      text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
})

// ── Relations ─────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  cards:    many(cards),
  payments: many(payments),
}))

export const cardsRelations = relations(cards, ({ one, many }) => ({
  user:     one(users, { fields: [cards.userId], references: [users.id] }),
  payments: many(payments),
  views:    many(cardViews),
  saves:    many(contactSaves),
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
  card: one(cards, { fields: [payments.cardId],  references: [cards.id] }),
}))

// ── Types ─────────────────────────────────────────────────────
export type User      = typeof users.$inferSelect
export type Card      = typeof cards.$inferSelect
export type Payment   = typeof payments.$inferSelect
export type PromoCode = typeof promoCodes.$inferSelect
export type CardView  = typeof cardViews.$inferSelect
