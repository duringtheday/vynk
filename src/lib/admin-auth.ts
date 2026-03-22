import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import { db, adminLog } from '@/db'

const SESSION_MINS = parseInt(process.env.ADMIN_SESSION_MINUTES || '15')

export async function verifyPin(pin: string) {
  return bcrypt.compare(pin, process.env.ADMIN_PIN_HASH!)
}

export function generate2FACode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function send2FAEmail(code: string) {
  const t = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, port: parseInt(process.env.EMAIL_PORT||'587'),
    secure: false, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  })
  await t.sendMail({
    from: process.env.EMAIL_FROM, to: process.env.OWNER_EMAIL,
    subject: `Vynk Admin — Verification code: ${code}`,
    html: `<div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;background:#0a0a0a;border-radius:16px;color:#fff">
      <div style="color:#d4a843;font-size:20px;font-weight:700;margin-bottom:8px">Vynk Admin Access</div>
      <p style="color:#888;font-size:14px;margin-bottom:20px">Your one-time verification code:</p>
      <div style="font-size:40px;font-weight:700;letter-spacing:10px;background:#1a1a2e;padding:20px;border-radius:12px;text-align:center;border:1px solid #d4a843;margin-bottom:16px">${code}</div>
      <p style="color:#555;font-size:12px">Expires in 5 minutes. If you didn't request this, ignore this email.</p>
    </div>`,
  })
}

export async function logAccess(event: { type:string; ip?:string; country?:string; device?:string; browser?:string; notes?:string }) {
  try { await db.insert(adminLog).values({ event:event.type, ip:event.ip, country:event.country, device:event.device, browser:event.browser, notes:event.notes }) }
  catch {}
}

export function createSession() {
  return { verified: true, expiresAt: Date.now() + SESSION_MINS * 60 * 1000 }
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
