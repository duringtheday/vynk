import { NextRequest, NextResponse } from 'next/server'
import { verifyPin, generate2FACode, send2FAEmail, logAccess, createSession, encodeSession } from '@/lib/admin-auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

const lockouts = new Map<string,{count:number;until:number}>()

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
}

// Store 2FA code in DB instead of memory (serverless-safe)
async function store2FACode(ip: string, code: string) {
  const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  await db.execute(sql`
    INSERT INTO admin_2fa_codes (ip, code, expires_at)
    VALUES (${ip}, ${code}, ${expires})
    ON CONFLICT (ip) DO UPDATE SET code = ${code}, expires_at = ${expires}
  `)
}

async function verify2FACode(ip: string, code: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT code FROM admin_2fa_codes
    WHERE ip = ${ip} AND expires_at > NOW()
    LIMIT 1
  `)
  if (!result.rows.length) return false
  const stored = result.rows[0].code as string
  if (stored !== code) return false
  await db.execute(sql`DELETE FROM admin_2fa_codes WHERE ip = ${ip}`)
  return true
}

export async function POST(req: NextRequest) {
  const clientIp = getIp(req)

  const lock = lockouts.get(clientIp)
  if (lock && lock.until > Date.now()) {
    const mins = Math.ceil((lock.until - Date.now()) / 60000)
    return NextResponse.json({ error:`Too many attempts. Try again in ${mins} minute(s).` }, { status:429 })
  }

  let body: any
  try { body = await req.json() } catch {
    return NextResponse.json({ error:'Invalid request' }, { status:400 })
  }

  const { pin, code } = body

  // Step 1: PIN
  if (pin !== undefined && !code) {
    const pinStr = String(pin).trim()
    const hash   = (process.env.ADMIN_PIN_HASH || '').trim()

    if (!hash) return NextResponse.json({ error:'ADMIN_PIN_HASH not configured.' }, { status:500 })

    const valid = await verifyPin(pinStr, hash)

    if (!valid) {
      const prev  = lockouts.get(clientIp) || { count:0, until:0 }
      const count = prev.count + 1
      lockouts.set(clientIp, { count, until: count >= 3 ? Date.now() + 10*60*1000 : 0 })
      await logAccess({ type:'pin_failed', ip:clientIp, notes:`Attempt ${count}` })
      return NextResponse.json({ error:`Wrong PIN. ${Math.max(0,3-count)} attempt(s) left.`, remaining: Math.max(0,3-count) }, { status:401 })
    }

    lockouts.delete(clientIp)
    const twoFA = generate2FACode()
    await store2FACode(clientIp, twoFA)
    try { await send2FAEmail(twoFA) } catch (e) { console.error('Email error:', e) }
    await logAccess({ type:'2fa_sent', ip:clientIp })
    return NextResponse.json({ step:'2fa' })
  }

  // Step 2: 2FA
  if (code) {
    const valid = await verify2FACode(clientIp, String(code))
    if (!valid) {
      await logAccess({ type:'2fa_failed', ip:clientIp })
      return NextResponse.json({ error:'Invalid or expired code.' }, { status:401 })
    }
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
