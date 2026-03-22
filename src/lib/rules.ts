// ──────────────────────────────────────────────────────────────
// VYNK — Business Rules
// ──────────────────────────────────────────────────────────────

export const PRICES = {
  NEW_CARD: 2000,  // $20.00
  RENEWAL:  1000,  // $10.00
}

// Fields on the FRONT of the card — changing these costs $10
export const PAID_FIELDS = [
  'fullName','title','company','photoUrl','logoUrl',
  'phone','whatsapp','email',
] as const

// Fields on the BACK of the card — always free to change
export const FREE_FIELDS = [
  'tagline','bio','services','telegram','instagram',
  'linkedin','twitter','tiktok','youtube','website','address','design',
] as const

export const FIELD_LABELS: Record<string, string> = {
  fullName:'Full name', title:'Title / role', company:'Company',
  photoUrl:'Profile photo', logoUrl:'Logo',
  phone:'Phone number', whatsapp:'WhatsApp', email:'Email address',
}

export function requiresPayment(changed: string[]): boolean {
  return changed.some(f => (PAID_FIELDS as readonly string[]).includes(f))
}

export function getPaidChanges(changed: string[]): string[] {
  return changed.filter(f => (PAID_FIELDS as readonly string[]).includes(f))
}
