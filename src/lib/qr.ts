import QRCode from 'qrcode'

export async function generateQRDataUrl(content: string): Promise<string> {
  return QRCode.toDataURL(content, {
    width: 300, margin: 2,
    color: { dark: '#0a0a0a', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  })
}

export function generateSlug(name: string): string {
  const base = name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9\s-]/g,'').trim()
    .replace(/\s+/g,'-').slice(0,18)
  return `${base}-${Math.random().toString(36).slice(2,6)}`
}
