import { NextRequest, NextResponse } from 'next/server'
import { db, contactSaves } from '@/db'

export async function POST(req: NextRequest) {
  const { cardId } = await req.json()
  const ua = req.headers.get('user-agent') || ''
  const isMobile = /mobile|android|iphone|ipad/i.test(ua)
  await db.insert(contactSaves).values({ cardId, device: isMobile ? 'mobile' : 'desktop' }).catch(()=>{})
  return NextResponse.json({ ok: true })
}
