export interface VynkCardData {
  fullName: string; title?: string; company?: string
  tagline?: string; bio?: string; services?: string[]
  email?: string; phone?: string; whatsapp?: string
  telegram?: string; instagram?: string; linkedin?: string
  twitter?: string; tiktok?: string; youtube?: string
  website?: string; address?: string; photoBase64?: string
}

export function generateVCard(c: VynkCardData): string {
  const parts = c.fullName.trim().split(' ')
  const fn = parts[0] || '', ln = parts.slice(1).join(' ') || ''
  const lines: string[] = [
    'BEGIN:VCARD','VERSION:3.0',
    `FN:${c.fullName}`,`N:${ln};${fn};;;`,
  ]
  if (c.title)    lines.push(`TITLE:${c.title}`)
  if (c.company)  lines.push(`ORG:${c.company}`)
  if (c.phone)    lines.push(`TEL;TYPE=CELL:${c.phone}`)
  if (c.whatsapp) lines.push(`TEL;TYPE=WORK:+${c.whatsapp.replace(/\D/g,'')}`)
  if (c.email)    lines.push(`EMAIL;TYPE=INTERNET:${c.email}`)
  if (c.website) {
    const url = c.website.startsWith('http') ? c.website : `https://${c.website}`
    lines.push(`URL:${url}`)
  }
  if (c.telegram)  lines.push(`X-TELEGRAM:@${c.telegram.replace('@','')}`)
  if (c.instagram) lines.push(`X-INSTAGRAM:@${c.instagram.replace('@','')}`)
  if (c.linkedin)  lines.push(`X-LINKEDIN:${c.linkedin}`)
  if (c.twitter)   lines.push(`X-TWITTER:@${c.twitter.replace('@','')}`)
  if (c.tiktok)    lines.push(`X-TIKTOK:@${c.tiktok.replace('@','')}`)
  if (c.address)   lines.push(`ADR:;;${c.address};;;;`)

  const note: string[] = []
  if (c.tagline)           note.push(c.tagline)
  if (c.services?.length)  note.push(`Services: ${c.services.join(', ')}`)
  note.push('Powered by Vynk · vynk.app · Make every introduction smart')
  lines.push(`NOTE:${note.join(' | ')}`)

  if (c.photoBase64) {
    const b64 = c.photoBase64.replace(/^data:image\/\w+;base64,/,'')
    lines.push(`PHOTO;ENCODING=BASE64;TYPE=JPEG:${b64}`)
  }
  lines.push('END:VCARD')
  return lines.join('\r\n')
}

export function vCardDataUri(vcf: string): string {
  return `data:text/vcard;charset=utf-8,${encodeURIComponent(vcf)}`
}
