import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { DM_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: { default: 'Vynk — Make every introduction smart', template: '%s | Vynk' },
  description: 'Premium digital business cards. One QR scan — your contact saved instantly on any phone.',
  keywords: ['digital business card','vcard','qr code','networking','vynk'],
  openGraph: {
    type: 'website', siteName: 'Vynk',
    title: 'Vynk — Make every introduction smart',
    description: 'Your professional identity, one tap away.',
  },
  icons: { icon: '/logo.png', apple: '/logo.png' },
  themeColor: '#0a0a0a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={dmSans.variable}>
        <body className="bg-vynk-black text-vynk-text antialiased">
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background:'#16161e', color:'#f0f0f4', border:'1px solid #2a2a3a', borderRadius:'12px', fontSize:'14px' },
              success: { iconTheme: { primary:'#d4a843', secondary:'#16161e' } },
              error:   { iconTheme: { primary:'#ef4444', secondary:'#16161e' } },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
