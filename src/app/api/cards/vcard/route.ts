import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { cards } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return new NextResponse('Not found', { status: 404 })
  const [card] = await db.select().from(cards).where(eq(cards.slug, slug)).limit(1)
  if (!card) return new NextResponse('Not found', { status: 404 })

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${card.fullName}`,
    card.title && card.company ? `TITLE:${card.title}` : '',
    card.company ? `ORG:${card.company}` : '',
    card.email ? `EMAIL:${card.email}` : '',
    card.phone ? `TEL;TYPE=CELL:${card.phone}` : '',
    card.whatsapp ? `TEL;TYPE=WORK:${card.whatsapp}` : '',
    card.website ? `URL:${card.website}` : '',
    card.instagram ? `X-SOCIALPROFILE;type=instagram:${card.instagram}` : '',
    card.linkedin ? `X-SOCIALPROFILE;type=linkedin:${card.linkedin}` : '',
    card.twitter ? `X-SOCIALPROFILE;type=twitter:${card.twitter}` : '',
    `NOTE:${card.tagline||''}`,
    'END:VCARD',
  ].filter(Boolean).join('\r\n')

  return new NextResponse(lines, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${card.fullName.replace(/\s+/g,'-')}.vcf"`,
    }
  })
}
