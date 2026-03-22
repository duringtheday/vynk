import { NextRequest, NextResponse } from 'next/server'
import { verifyPin, generate2FACode, send2FAEmail, logAccess, createSession, encodeSession } from '@/lib/admin-auth'

const codes    = new Map<string,{code:string;expires:number}>()
const lockouts = new Map<string,{count:number;until:number}>()

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
}

export async function POST(req: NextRequest) {
  const clientIp = getIp(req)

  // Check lockout
  const lock = lockouts.get(clientIp)
  if (lock && lock.until > Date.now()) {
    const mins = Math.ceil((lock.until - Date.now()) / 60000)
    return NextResponse.json({ error:`Too many attempts. Try again in ${mins} minute(s).` }, { status:429 })
  }

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error:'Invalid request' }, { status:400 }) }

  const { pin, code } = body

  // ── Step 1: PIN ──────────────────────────────────────────────
  if (pin && !code) {
    // Debug log — remove after confirming it works
    console.log('[admin-auth] PIN attempt, hash present:', !!process.env.ADMIN_PIN_HASH)
    console.log('[admin-auth] Hash starts with:', process.env.ADMIN_PIN_HASH?.substring(0, 7))

    const valid = await verifyPin(String(pin))
    console.log('[admin-auth] PIN valid:', valid)

    if (!valid) {
      const prev  = lockouts.get(clientIp) || { count:0, until:0 }
      const count = prev.count + 1
      lockouts.set(clientIp, { count, until: count >= 3 ? Date.now() + 10*60*1000 : 0 })
      await logAccess({ type:'pin_failed', ip:clientIp, notes:`Attempt ${count}` })
      const remaining = Math.max(0, 3-count)
      return NextResponse.json({ error:`Wrong PIN. ${remaining} attempt(s) left.`, remaining }, { status:401 })
    }

    lockouts.delete(clientIp)
    const twoFA = generate2FACode()
    codes.set(clientIp, { code: twoFA, expires: Date.now() + 5*60*1000 })
    try { await send2FAEmail(twoFA) } catch (e) { console.error('Email error:', e) }
    await logAccess({ type:'2fa_sent', ip:clientIp })
    return NextResponse.json({ step:'2fa' })
  }

  // ── Step 2: 2FA ──────────────────────────────────────────────
  if (code) {
    const stored = codes.get(clientIp)
    if (!stored || stored.expires < Date.now()) {
      return NextResponse.json({ error:'Code expired. Start over.' }, { status:401 })
    }
    if (stored.code !== String(code)) {
      await logAccess({ type:'2fa_failed', ip:clientIp })
      return NextResponse.json({ error:'Invalid code.' }, { status:401 })
    }
    codes.delete(clientIp)
    const session = encodeSession(createSession())
    await logAccess({ type:'login_success', ip:clientIp })
    const res = NextResponse.json({ ok:true })
    res.cookies.set('vynk_admin', session, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   parseInt(process.env.ADMIN_SESSION_MINUTES || '15') * 60,
      path:     '/',
    })
    return res
  }

  return NextResponse.json({ error:'Invalid request' }, { status:400 })
}

export async function DELETE(req: NextRequest) {
  await logAccess({ type:'logout', ip:getIp(req) })
  const res = NextResponse.json({ ok:true })
  res.cookies.delete('vynk_admin')
  return res
}
