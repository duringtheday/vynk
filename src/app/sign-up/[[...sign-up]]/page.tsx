'use client'
// src/app/sign-up/[[...sign-up]]/page.tsx

import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useT, LangToggle } from '@/lib/i18n'

const C = { g:'#0D0F12', gold:'#D4A84F', goldLt:'#E8C06A', goldDk:'#A07830', silver:'#BFC3C9', smoke:'#6F737A', nd:'#08090B', nl:'#141720' }
const raised   = `5px 5px 14px ${C.nd}, -3px -3px 10px ${C.nl}`
const raisedSm = `3px 3px 8px ${C.nd}, -2px -2px 6px ${C.nl}`
const insetSm  = `inset 2px 2px 6px ${C.nd}, inset -2px -2px 5px ${C.nl}`
const goldBox  = `4px 4px 14px ${C.nd}, 0 0 22px rgba(212,168,79,0.2)`

export default function SignUpPage() {
  const t = useT()
  const [promoCode, setPromoCode]     = useState('')
  const [promoStatus, setPromoStatus] = useState<'idle'|'checking'|'valid'|'invalid'>('idle')
  const [promoMsg, setPromoMsg]       = useState('')
  const [phoneBypass, setPhoneBypass] = useState(false)
  const [phoneMode, setPhoneMode]     = useState('required')
  const [showClerk, setShowClerk]     = useState(false)

  useEffect(() => {
    fetch('/api/promos/validate', { method:'GET' })
      .then(r => r.json())
      .then(d => { if (d.globalPhoneMode) setPhoneMode(d.globalPhoneMode) })
      .catch(() => {})
  }, [])

  const hidePhone     = phoneMode === 'off' || phoneBypass
  const optionalPhone = !hidePhone && phoneMode === 'optional'

  async function applyPromo() {
    if (!promoCode.trim()) return
    setPromoStatus('checking')
    try {
      const res  = await fetch('/api/promos/validate', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ code: promoCode.trim() }) })
      const data = await res.json()
      if (data.globalPhoneMode) setPhoneMode(data.globalPhoneMode)
      if (data.valid) {
        setPromoStatus('valid')
        setPromoMsg(
          data.discountType === 'percent' ? `${data.discountValue}% off applied ✓` :
          data.discountType === 'fixed'   ? `$${(data.discountValue/100).toFixed(2)} off applied ✓` :
                                            'Free access applied ✓'
        )
        setPhoneBypass(data.phoneBypass === true)
      } else {
        setPromoStatus('invalid')
        setPromoMsg(data.error || t.invalidCode)
        setPhoneBypass(false)
      }
    } catch {
      setPromoStatus('invalid')
      setPromoMsg(t.networkError)
    }
  }

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
    <main style={{ minHeight:'100dvh', background:C.g, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', padding:'32px 20px 80px', fontFamily:"'DM Sans',sans-serif" }}>

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
      <p style={{ color:C.smoke, fontSize:'13px', marginBottom:'24px', fontWeight:300 }}>{t.createIdentity}</p>

      <div style={{ width:'100%', maxWidth:'400px', background:C.g, boxShadow:`10px 10px 28px ${C.nd}, -6px -6px 18px ${C.nl}`, borderRadius:'24px', border:'1px solid rgba(212,168,79,0.06)', overflow:'hidden' }}>

        {/* Promo code block */}
        {!showClerk && (
          <div style={{ padding:'24px 24px 0' }}>
            <p style={{ fontSize:'11px', color:C.smoke, marginBottom:'8px', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase' }}>{t.promoCode}</p>
            <div style={{ display:'flex', gap:'8px', marginBottom:'10px' }}>
              <input value={promoCode} onChange={e=>{setPromoCode(e.target.value.toUpperCase());setPromoStatus('idle');setPromoMsg('')}} onKeyDown={e=>e.key==='Enter'&&applyPromo()} placeholder={t.promoPlaceholder} maxLength={32}
                style={{ flex:1, padding:'10px 14px', background:C.g, boxShadow:insetSm, border:`1px solid ${promoStatus==='valid'?'rgba(212,168,79,0.3)':promoStatus==='invalid'?'rgba(239,68,68,0.3)':'rgba(255,255,255,0.04)'}`, borderRadius:'10px', color:C.silver, fontSize:'13px', fontFamily:"'DM Sans',sans-serif", outline:'none', letterSpacing:'0.05em', fontWeight:600 }}/>
              <button onClick={applyPromo} disabled={promoStatus==='checking'||!promoCode.trim()}
                style={{ padding:'10px 16px', borderRadius:'10px', background:promoCode.trim()?`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`:C.g, color:promoCode.trim()?'#050607':C.smoke, border:'none', fontSize:'12px', fontWeight:700, cursor:promoCode.trim()?'pointer':'default', boxShadow:promoCode.trim()?goldBox:raisedSm, fontFamily:"'DM Sans',sans-serif", opacity:promoStatus==='checking'?0.6:1, whiteSpace:'nowrap' }}>
                {promoStatus==='checking'?'…':t.applyCode}
              </button>
            </div>
            {promoStatus==='valid'&&<div style={{ marginBottom:'10px', padding:'9px 13px', background:'rgba(212,168,79,0.07)', border:'1px solid rgba(212,168,79,0.2)', borderRadius:'10px', fontSize:'12px', color:C.gold }}>{promoMsg}</div>}
            {promoStatus==='invalid'&&<div style={{ marginBottom:'10px', padding:'9px 13px', background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px', fontSize:'12px', color:'#ef4444' }}>{promoMsg}</div>}
            {hidePhone&&<div style={{ marginBottom:'14px', padding:'9px 13px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'10px', fontSize:'12px', color:C.smoke, display:'flex', alignItems:'center', gap:'8px' }}><span>📵</span><span>{t.noPhoneRequired}</span></div>}
            {optionalPhone&&<div style={{ marginBottom:'14px', padding:'9px 13px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'10px', fontSize:'12px', color:C.smoke, display:'flex', alignItems:'center', gap:'8px' }}><span>📱</span><span>{t.phoneOptional}</span></div>}
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.05)' }}/>
              <span style={{ fontSize:'11px', color:C.smoke }}>{t.orSkip}</span>
              <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.05)' }}/>
            </div>
          </div>
        )}

        {showClerk && hidePhone && (
          <style>{`.cl-phoneInputBox,.cl-formFieldRow__phoneNumber,.cl-field__phoneNumber,[data-localization-key="formFieldLabel__phoneNumber"],[data-localization-key="formFieldInputPlaceholder__phoneNumber"]{display:none!important}`}</style>
        )}

        {!showClerk ? (
          <div style={{ padding:'16px 24px 28px' }}>
            <button onClick={()=>setShowClerk(true)}
              style={{ width:'100%', padding:'14px', background:`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`, color:'#050607', borderRadius:'14px', fontWeight:700, fontSize:'15px', border:'none', cursor:'pointer', boxShadow:goldBox, fontFamily:"'DM Sans',sans-serif" }}>
              {t.createAccount}
            </button>
            <p style={{ textAlign:'center', fontSize:'11px', color:C.smoke, marginTop:'12px' }}>
              {t.alreadyAccount}{' '}<Link href="/sign-in" style={{ color:C.gold, textDecoration:'none' }}>{t.signIn}</Link>
            </p>
          </div>
        ) : (
          <SignUp appearance={clerkAppearance} />
        )}
      </div>
    </main>
  )
}
