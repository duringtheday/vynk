import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { DM_Sans, Syne } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans', weight: ['300','400','500','600','700'] })
const syne   = Syne({ subsets: ['latin'], variable: '--font-display', weight: ['400','500','600','700','800'] })

export const metadata: Metadata = {
  title: { default: 'Vynk — Make every introduction smart', template: '%s | Vynk' },
  description: 'Premium digital business cards. One QR scan — your contact saved instantly on any phone.',
  keywords: ['digital business card','vcard','qr code','networking','vynk'],
  openGraph: { type:'website', siteName:'Vynk', title:'Vynk — Make every introduction smart', description:'Your professional identity, one tap away.' },
  icons: { icon:'/logo.png', apple:'/logo.png' },
  themeColor: '#0D0F12',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${dmSans.variable} ${syne.variable}`}>
        <body style={{ background:'#0D0F12', color:'#BFC3C9', fontFamily:"'DM Sans',sans-serif", WebkitFontSmoothing:'antialiased' }}>
          {children}
          <Toaster position="top-right" toastOptions={{
            style: { background:'#0D0F12', color:'#BFC3C9', border:'1px solid rgba(212,168,79,0.15)', borderRadius:'12px', fontSize:'14px', boxShadow:'5px 5px 14px #08090B, -3px -3px 10px #141720' },
            success: { iconTheme: { primary:'#D4A84F', secondary:'#0D0F12' } },
            error:   { iconTheme: { primary:'#ef4444', secondary:'#0D0F12' } },
          }} />
        </body>
      </html>
    </ClerkProvider>
  )
}
