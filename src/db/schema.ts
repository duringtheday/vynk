// Agrega esta tabla al final de src/db/schema.ts
// ANTES del bloque "── Relations ──"

export const admin2faCodes = pgTable('admin_2fa_codes', {
  ip:        text('ip').primaryKey(),
  code:      text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
})
