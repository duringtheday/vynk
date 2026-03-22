import bcrypt from 'bcryptjs'
import { Resend } from 'resend'
import { db, adminLog } from '@/db'

const SESSION_MINS = parseInt(process.env.ADMIN_SESSION_MINUTES || '15')
const resend = new Resend(process.env.RESEND_API_KEY)

// Acepta el hash como parámetro para evitar problemas de env timing
export async function verifyPin(pin: string, hash?: string): Promise<boolean> {
  const h = hash || process.env.ADMIN_PIN_HASH || ''
  if (!h) return false
  return bcrypt.compare(pin, h.trim())
}

export function generate2FACode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function send2FAEmail(code: string) {
  await resend.emails.send({
    from: 'Vynk Admin <noreply@vynk.app>',
    to:   process.env.OWNER_EMAIL!,
    subject: `Vynk Admin — Verification code: ${code}`,
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;background:#0D0F12;border-radius:16px;color:#fff">
        <div style="color:#D4A84F;font-size:20px;font-weight:700;margin-bottom:8px">Vynk Admin Access</div>
        <p style="color:#6F737A;font-size:14px;margin-bottom:20px">Your one-time verification code:</p>
        <div style="font-size:40px;font-weight:700;letter-spacing:10px;background:#1a1a2e;padding:20px;border-radius:12px;text-align:center;border:1px solid #D4A84F;margin-bottom:16px">${code}</div>
        <p style="color:#6F737A;font-size:12px">Expires in 5 minutes.</p>
      </div>
    `,
  })
}

export async function logAccess(event: { type:string; ip?:string; country?:string; device?:string; browser?:string; notes?:string }) {
  try {
    await db.insert(adminLog).values({ event:event.type, ip:event.ip, country:event.country, device:event.device, browser:event.browser, notes:event.notes })
  } catch {}
}

export function createSession() {
  return { verified:true, expiresAt: Date.now() + SESSION_MINS * 60 * 1000 }
}

export function encodeSession(s: object) {
  return Buffer.from(JSON.stringify(s)).toString('base64')
}

export function decodeSession(e: string): { verified:boolean; expiresAt:number } | null {
  try { return JSON.parse(Buffer.from(e,'base64').toString()) } catch { return null }
}

export function isValid(s: { verified:boolean; expiresAt:number }) {
  return s.verified && Date.now() < s.expiresAt
}
