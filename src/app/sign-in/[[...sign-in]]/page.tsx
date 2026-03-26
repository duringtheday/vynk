'use client'
// src/app/sign-in/[[...sign-in]]/page.tsx

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { useT, LangToggle } from '@/lib/i18n'

const C = { g:'#0D0F12', gold:'#D4A84F', goldLt:'#E8C06A', goldDk:'#A07830', silver:'#BFC3C9', smoke:'#6F737A', nd:'#08090B', nl:'#141720' }
const raised   = `5px 5px 14px ${C.nd}, -3px -3px 10px ${C.nl}`
const raisedSm = `3px 3px 8px ${C.nd}, -2px -2px 6px ${C.nl}`
const insetSm  = `inset 2px 2px 6px ${C.nd}, inset -2px -2px 5px ${C.nl}`

export default function SignInPage() {
  const t = useT()

  const clerkAppearance = {
    variables: { colorPrimary:C.gold, colorBackground:C.g, colorText:C.silver, colorTextSecondary:C.smoke, colorInputBackground:C.g, colorInputText:C.silver, borderRadius:'12px', fontFamily:"'DM Sans',sans-serif" },
    elements: {
      card: { background:'transparent', boxShadow:'none', border:'none', width:'100%' },
      rootBox: { width:'100%' },
      formButtonPrimary: { background:`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`, color:'#050607', fontWeight:700, boxShadow:`3px 3px 10px ${C.nd}, 0 0 16px rgba(212,168,79,0.2)`, borderRadius:'12px', border:'none' },
      formFieldInput: { background:C.g, boxShadow:insetSm, border:'1px solid rgba(255,255,255,0.04)', color:C.silver, borderRadius:'10px' },
      footerActionLink: { color:C.gold },
      dividerLine: { background:'rgba(255,255,255,0.05)' },
      dividerText: { color:C.smoke },
      socialButtonsBlockButton: { background:C.g, boxShadow:raisedSm, border:'1px solid rgba(255,255,255,0.04)', color:C.silver, borderRadius:'10px' },
    },
  }

  return (
    <main style={{ minHeight:'100dvh', background:C.g, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 20px', fontFamily:"'DM Sans',sans-serif" }}>

      {/* Top row: back + lang */}
      <div style={{ width:'100%', maxWidth:'400px', marginBottom:'20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:'8px', fontSize:'13px', color:C.smoke, textDecoration:'none', padding:'8px 14px', background:C.g, boxShadow:raisedSm, borderRadius:'10px', border:'1px solid rgba(255,255,255,0.04)' }}>
          ← {t.backToVynk}
        </Link>
        <LangToggle compact/>
      </div>

      {/* Logo */}
      <div style={{ padding:'18px 28px', background:C.g, boxShadow:`8px 8px 20px ${C.nd}, -5px -5px 14px ${C.nl}, inset 0 1px 0 rgba(212,168,79,0.08)`, borderRadius:'20px', border:'1px solid rgba(212,168,79,0.07)', marginBottom:'12px' }}>
        <img src="/logo.png" alt="Vynk" style={{ height:'38px', objectFit:'contain', display:'block' }} />
      </div>
      <p style={{ color:C.smoke, fontSize:'13px', marginBottom:'24px', fontWeight:300 }}>{t.smartIntro}</p>

      <div style={{ width:'100%', maxWidth:'400px', background:C.g, boxShadow:`10px 10px 28px ${C.nd}, -6px -6px 18px ${C.nl}`, borderRadius:'24px', border:'1px solid rgba(212,168,79,0.06)', overflow:'hidden' }}>
        <SignIn appearance={clerkAppearance} />
      </div>
    </main>
  )
}
