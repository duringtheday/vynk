'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// ── Inline styles using exact Vynk palette ──────────────────────
const C = {
  graphite: '#0D0F12',
  gold:     '#D4A84F',
  silver:   '#BFC3C9',
  smoke:    '#6F737A',
  carbon:   '#050607',
  nmDark:   '#08090B',
  nmLite:   '#141720',
}

const raised   = `5px 5px 14px ${C.nmDark}, -3px -3px 10px ${C.nmLite}`
const raisedSm = `3px 3px 8px ${C.nmDark}, -2px -2px 6px ${C.nmLite}`
const insetSm  = `inset 2px 2px 6px ${C.nmDark}, inset -2px -2px 5px ${C.nmLite}`
const goldBox  = `4px 4px 14px ${C.nmDark}, -2px -2px 8px ${C.nmLite}, 0 0 22px rgba(212,168,79,0.2)`

const FEATURES = [
  { icon:'👤', title:'Save to Contacts', desc:'QR scan → phone saves contact instantly. Name, photo, phone, email. Works on iPhone and Android, worldwide, no app needed.' },
  { icon:'↩️', title:'Front & back card', desc:'Your card has two faces. Front shows your identity. Back shows services, bio and social links. Flip with one tap.' },
  { icon:'🔗', title:'Your unique link', desc:'vynk.app/c/yourname — paste in your Instagram bio, email signature, WhatsApp, or print on any physical material.' },
  { icon:'🔒', title:'Secure ownership', desc:'Your card is locked to your account. Recover from any device with the same login. Built-in anti-plagiarism protection.' },
  { icon:'🌐', title:'Works worldwide', desc:'Any country, any device, any browser. No download required. Share via QR, NFC tap or direct link in seconds.' },
  { icon:'⚡', title:'Free updates anytime', desc:'Colors, bio, services, social links — free forever. Core identity changes (name, photo, email) from $10.' },
]

const CHECKS = [
  'Card published at your unique link instantly',
  'QR code — scan saves contact to any phone',
  'Front & back card with flip animation',
  'All templates, fonts and design options',
  'Free color & content updates anytime',
  'Core identity changes: $10 per update',
  'NFC-compatible, works worldwide',
]

export default function HomePage() {
  const [activeSection, setActiveSection] = useState(0)
  const sectionsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = sectionsRef.current.indexOf(e.target as HTMLDivElement)
            if (idx !== -1) setActiveSection(idx)
          }
        })
      },
      { threshold: 0.5 }
    )
    sectionsRef.current.forEach(s => s && observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const sectionStyle: React.CSSProperties = {
    scrollSnapAlign: 'start',
    scrollSnapStop: 'always',
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    padding: '80px 48px 48px',
  }

  return (
    <div style={{ background: C.graphite, color: C.silver, fontFamily:"'DM Sans',sans-serif", scrollSnapType:'y mandatory', overflowY:'scroll', height:'100dvh' }}>

      {/* ── Fixed Nav ── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 48px', height:'68px', background:'rgba(13,15,18,0.9)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', borderBottom:`1px solid rgba(212,168,79,0.07)` }}>
        <Image src="/logo.png" alt="Vynk" width={100} height={32} style={{ objectFit:'contain' }} priority />
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          {/* Scroll dots */}
          <div style={{ display:'flex', gap:'6px', marginRight:'16px' }}>
            {[0,1,2,3].map(i => (
              <div key={i} onClick={() => sectionsRef.current[i]?.scrollIntoView({ behavior:'smooth' })}
                style={{ width: activeSection===i ? '20px' : '6px', height:'6px', borderRadius:'3px', background: activeSection===i ? C.gold : C.smoke, cursor:'pointer', transition:'all 0.3s ease' }} />
            ))}
          </div>
          <Link href="/sign-in" style={{ fontSize:'14px', color: C.smoke, textDecoration:'none', padding:'9px 18px', background: C.graphite, boxShadow: raisedSm, borderRadius:'10px', transition:'all .15s' }}>
            Sign in
          </Link>
          <Link href="/sign-up" style={{ fontSize:'14px', fontWeight:700, textDecoration:'none', padding:'10px 22px', background:'linear-gradient(135deg,#D4A84F,#E8C06A,#A07830)', color: C.carbon, borderRadius:'12px', boxShadow: goldBox }}>
            Get started — $20
          </Link>
        </div>
      </nav>

      {/* ── SECTION 1: Hero ── */}
      <section ref={el => { if(el) sectionsRef.current[0] = el }} style={{ ...sectionStyle, alignItems:'center', textAlign:'center' }}>
        {/* Background texture */}
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse 60% 50% at 50% 60%, rgba(212,168,79,0.05) 0%, transparent 70%)`, pointerEvents:'none' }} />

        <div style={{ position:'relative', maxWidth:'760px', margin:'0 auto' }}>
          {/* Badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', marginBottom:'36px', padding:'6px 18px', background: C.graphite, boxShadow: insetSm, borderRadius:'999px', fontSize:'10px', fontWeight:700, color: C.gold, letterSpacing:'.12em', textTransform:'uppercase' }}>
            <span style={{ width:'5px', height:'5px', borderRadius:'50%', background: C.gold, boxShadow:`0 0 6px ${C.gold}` }} />
            Digital Identity Platform
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(48px,7vw,80px)', fontWeight:800, lineHeight:1.05, letterSpacing:'-.03em', marginBottom:'24px', color: C.silver }}>
            Make every<br />
            introduction{' '}
            <span style={{ background:'linear-gradient(135deg,#D4A84F 0%,#F0C96A 45%,#A07830 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              smart.
            </span>
          </h1>

          {/* Subheadline */}
          <p style={{ fontSize:'18px', color: C.smoke, maxWidth:'520px', margin:'0 auto 48px', lineHeight:1.7, fontWeight:300 }}>
            Replace your paper card with a dynamic digital identity. One QR scan — your contact saved instantly on any phone in the world.
          </p>

          {/* CTAs */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'16px', flexWrap:'wrap', marginBottom:'48px' }}>
            <Link href="/sign-up" style={{ padding:'16px 40px', background:'linear-gradient(135deg,#D4A84F,#E8C06A,#A07830)', color: C.carbon, fontWeight:700, fontSize:'16px', borderRadius:'16px', boxShadow: goldBox, textDecoration:'none', fontFamily:"'DM Sans',sans-serif" }}>
              Create my Vynk card — $20
            </Link>
            <Link href="/sign-up" style={{ padding:'16px 32px', background: C.graphite, color: C.smoke, fontWeight:500, fontSize:'15px', borderRadius:'16px', boxShadow: raisedSm, border:`1px solid rgba(255,255,255,0.05)`, textDecoration:'none' }}>
              See live demo →
            </Link>
          </div>

          <p style={{ fontSize:'13px', color: C.smoke, opacity:.6 }}>
            One-time · No subscription · Free color updates · Content changes from $10
          </p>
        </div>

        {/* Scroll hint */}
        <div style={{ position:'absolute', bottom:'32px', left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
          <span style={{ fontSize:'10px', color: C.smoke, letterSpacing:'.1em', textTransform:'uppercase' }}>Scroll</span>
          <div style={{ width:'1px', height:'36px', background:`linear-gradient(to bottom, ${C.gold}, transparent)` }} />
        </div>
      </section>

      {/* ── SECTION 2: How it works ── */}
      <section ref={el => { if(el) sectionsRef.current[1] = el }} style={{ ...sectionStyle }}>
        <div style={{ maxWidth:'960px', margin:'0 auto', width:'100%' }}>
          {/* Label */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
            <div style={{ width:'32px', height:'1px', background: C.gold }} />
            <span style={{ fontSize:'11px', fontWeight:700, color: C.gold, letterSpacing:'.1em', textTransform:'uppercase' }}>How it works</span>
          </div>

          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(32px,4vw,52px)', fontWeight:700, color: C.silver, marginBottom:'12px', letterSpacing:'-.02em' }}>
            Three steps.<br />One identity.
          </h2>
          <p style={{ color: C.smoke, fontSize:'16px', marginBottom:'56px', maxWidth:'420px', fontWeight:300 }}>
            From setup to sharing in under 3 minutes.
          </p>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px' }}>
            {[
              { n:'01', t:'Build your card', d:'Fill in your identity, upload photo or logo, pick templates, fonts and colors in real time. Everything previews instantly.' },
              { n:'02', t:'Pay once, keep forever', d:'A single $20 payment activates your card at your unique link and QR code. No subscriptions, no monthly fees, ever.' },
              { n:'03', t:'Share anywhere', d:'Anyone scans your QR or opens your link — your contact saves to their phone in one tap. Works globally on any device.' },
            ].map((s,i) => (
              <div key={i} style={{ background: C.graphite, boxShadow: raised, borderRadius:'24px', padding:'36px 28px', border:`1px solid rgba(255,255,255,0.03)`, position:'relative', overflow:'hidden' }}>
                {/* Step number watermark */}
                <div style={{ position:'absolute', top:'-10px', right:'20px', fontFamily:"'Syne',sans-serif", fontSize:'80px', fontWeight:800, color:'rgba(212,168,79,0.04)', lineHeight:1, userSelect:'none' }}>{s.n}</div>
                <div style={{ fontSize:'11px', fontWeight:700, color: C.gold, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ width:'20px', height:'1px', background: C.gold }} />{s.n}
                </div>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'20px', marginBottom:'12px', color: C.silver }}>{s.t}</h3>
                <p style={{ color: C.smoke, fontSize:'14px', lineHeight:1.7, fontWeight:300 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Features ── */}
      <section ref={el => { if(el) sectionsRef.current[2] = el }} style={{ ...sectionStyle }}>
        <div style={{ maxWidth:'960px', margin:'0 auto', width:'100%' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
            <div style={{ width:'32px', height:'1px', background: C.gold }} />
            <span style={{ fontSize:'11px', fontWeight:700, color: C.gold, letterSpacing:'.1em', textTransform:'uppercase' }}>Everything included</span>
          </div>

          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(32px,4vw,52px)', fontWeight:700, color: C.silver, marginBottom:'48px', letterSpacing:'-.02em' }}>
            One card.<br />Infinite possibilities.
          </h2>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'16px' }}>
            {FEATURES.map((f,i) => (
              <div key={i} style={{ background: C.graphite, boxShadow: raisedSm, borderRadius:'18px', padding:'22px', border:`1px solid rgba(255,255,255,0.025)`, display:'flex', gap:'16px', alignItems:'flex-start' }}>
                <div style={{ width:'46px', height:'46px', background: C.graphite, boxShadow: insetSm, borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ fontWeight:600, fontSize:'15px', marginBottom:'6px', color: C.silver }}>{f.title}</h3>
                  <p style={{ color: C.smoke, fontSize:'13px', lineHeight:1.6, fontWeight:300 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: Pricing ── */}
      <section ref={el => { if(el) sectionsRef.current[3] = el }} style={{ ...sectionStyle, alignItems:'center' }}>
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse 50% 60% at 50% 50%, rgba(212,168,79,0.04) 0%, transparent 70%)`, pointerEvents:'none' }} />

        <div style={{ maxWidth:'520px', margin:'0 auto', width:'100%', position:'relative' }}>
          <div style={{ textAlign:'center', marginBottom:'40px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginBottom:'16px' }}>
              <div style={{ width:'32px', height:'1px', background: C.gold }} />
              <span style={{ fontSize:'11px', fontWeight:700, color: C.gold, letterSpacing:'.1em', textTransform:'uppercase' }}>Pricing</span>
              <div style={{ width:'32px', height:'1px', background: C.gold }} />
            </div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(28px,4vw,48px)', fontWeight:700, color: C.silver, letterSpacing:'-.02em', marginBottom:'8px' }}>
              Simple, honest pricing.
            </h2>
            <p style={{ color: C.smoke, fontSize:'15px', fontWeight:300 }}>No subscriptions. No hidden fees. Ever.</p>
          </div>

          {/* Pricing card */}
          <div style={{ background: C.graphite, boxShadow:`10px 10px 28px ${C.nmDark}, -6px -6px 18px ${C.nmLite}`, borderRadius:'28px', padding:'44px 40px', border:`1px solid rgba(212,168,79,0.08)` }}>
            {/* Price */}
            <div style={{ display:'flex', alignItems:'baseline', gap:'4px', marginBottom:'4px' }}>
              <span style={{ fontSize:'20px', color: C.gold, fontWeight:500 }}>$</span>
              <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'72px', fontWeight:800, background:'linear-gradient(135deg,#D4A84F 0%,#F0C96A 45%,#A07830 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1 }}>20</span>
            </div>
            <p style={{ color: C.smoke, fontSize:'14px', marginBottom:'32px', fontWeight:300 }}>One-time payment — yours forever</p>

            {/* Divider */}
            <div style={{ width:'100%', height:'1px', background:`linear-gradient(90deg, transparent, rgba(212,168,79,0.15), transparent)`, marginBottom:'28px' }} />

            {/* Checklist */}
            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'36px' }}>
              {CHECKS.map(item => (
                <div key={item} style={{ display:'flex', alignItems:'center', gap:'12px', fontSize:'14px', color: C.silver }}>
                  <div style={{ width:'20px', height:'20px', background: C.graphite, boxShadow: insetSm, borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color: C.gold, fontSize:'10px', fontWeight:700 }}>✓</div>
                  {item}
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link href="/sign-up" style={{ display:'block', padding:'17px', background:'linear-gradient(135deg,#D4A84F,#E8C06A,#A07830)', color: C.carbon, fontWeight:700, fontSize:'16px', borderRadius:'16px', textAlign:'center', boxShadow: goldBox, textDecoration:'none', fontFamily:"'DM Sans',sans-serif" }}>
              Create my Vynk card
            </Link>

            <p style={{ textAlign:'center', fontSize:'12px', color: C.smoke, marginTop:'16px', opacity:.7 }}>
              Secure payment via Stripe · Apple Pay · Google Pay
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position:'absolute', bottom:'24px', left:0, right:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 48px' }}>
          <Image src="/logo.png" alt="Vynk" width={70} height={22} style={{ objectFit:'contain', opacity:.4 }} />
          <div style={{ display:'flex', gap:'24px' }}>
            {[['Terms','/legal/terms'],['Privacy','/legal/privacy'],['Refunds','/legal/refunds']].map(([l,h]) => (
              <Link key={l} href={h} style={{ fontSize:'12px', color: C.smoke, textDecoration:'none', opacity:.6 }}>{l}</Link>
            ))}
          </div>
          <p style={{ fontSize:'12px', color: C.smoke, opacity:.4 }}>© {new Date().getFullYear()} Vynk</p>
        </div>
      </section>
    </div>
  )
}
