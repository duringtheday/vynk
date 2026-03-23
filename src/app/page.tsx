'use client'
import { useState } from 'react'
import Link from 'next/link'

const C = {
  graphite: '#0D0F12', gold: '#D4A84F', silver: '#BFC3C9',
  smoke: '#6F737A', carbon: '#050607', nd: '#08090B', nl: '#141720',
}
const raised = `5px 5px 14px ${C.nd}, -3px -3px 10px ${C.nl}`
const raisedSm = `3px 3px 8px ${C.nd}, -2px -2px 6px ${C.nl}`
const insetSm = `inset 2px 2px 6px ${C.nd}, inset -2px -2px 5px ${C.nl}`
const goldBox = `4px 4px 14px ${C.nd}, -2px -2px 8px ${C.nl}, 0 0 22px rgba(212,168,79,0.2)`

const SECTIONS = [
  { id: 0, label: 'Identity Platform' },
  { id: 1, label: 'How it works' },
  { id: 2, label: 'Features' },
  { id: 3, label: 'Pricing' },
]

const FEATURES = [
  { icon: '👤', title: 'Save to Contacts', desc: 'QR scan → phone saves contact instantly. Name, photo, phone, email. Works on iPhone and Android worldwide.' },
  { icon: '↩️', title: 'Front & back card', desc: 'Two faces. Front shows your identity. Back shows services, bio and social links. Flip with one tap.' },
  { icon: '🔗', title: 'Your unique link', desc: 'vynk.app/c/yourname — share in bio, email signature, WhatsApp, or print on physical materials.' },
  { icon: '🔒', title: 'Secure ownership', desc: 'Locked to your account. Recover from any device with the same login. Anti-plagiarism built in.' },
  { icon: '🌐', title: 'Works worldwide', desc: 'Any country, any device, any browser. No download required. Share via QR, NFC or direct link.' },
  { icon: '⚡', title: 'Free updates', desc: 'Colors, bio, services, social links — free forever. Core identity changes from $10.' },
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

// Logo neumórfico — mismo componente usado en nav y páginas
function VynkLogo({ size = 'nav' }: { size?: 'nav' | 'page' }) {
  const isPage = size === 'page'
  return (
    <div style={{
      width: isPage ? '220px' : '110px',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: isPage ? '10px 20px' : '8px 8px',
      background: C.graphite,
      boxShadow: isPage
        ? `8px 8px 20px ${C.nd}, -5px -5px 14px ${C.nl}, inset 0 1px 0 rgba(212,168,79,0.08)`
        : `4px 4px 10px ${C.nd}, -2px -2px 7px ${C.nl}, inset 0 1px 0 rgba(212,168,79,0.06)`,
      borderRadius: isPage ? '20px' : '12px',
      border: '1px solid rgba(212,168,79,0.07)',
    }}>
      <img src="/logo.png" alt="Vynk"
        style={{ width: '100%', height: '100%', filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.6))', display: 'block', borderRadius: isPage ? '20px' : '12px' }} />
    </div>
  )
}

export default function HomePage() {
  const [active, setActive] = useState(0)
  const [fading, setFading] = useState(false)

  function goTo(idx: number) {
    if (idx === active || fading) return
    setFading(true)
    setTimeout(() => { setActive(idx); setFading(false) }, 260)
  }

  return (
    <div style={{ background: C.graphite, color: C.silver, fontFamily: "'DM Sans',sans-serif", minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: 'rgba(13,15,18,0.95)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(212,168,79,0.07)' }}>
        <VynkLogo size="nav" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/sign-in" style={{ fontSize: '13px', color: C.smoke, textDecoration: 'none', padding: '8px 14px', background: C.graphite, boxShadow: raisedSm, borderRadius: '10px' }}>Sign in</Link>
          <Link href="/sign-up" style={{ fontSize: '13px', fontWeight: 700, textDecoration: 'none', padding: '9px 18px', background: 'linear-gradient(135deg,#D4A84F,#E8C06A,#A07830)', color: C.carbon, borderRadius: '10px', boxShadow: goldBox, whiteSpace: 'nowrap' }}>Get started — $20</Link>
        </div>
      </nav>

      {/* SECTION NAV PILLS */}
      <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(13,15,18,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '6px 8px', borderRadius: '999px', border: '1px solid rgba(212,168,79,0.1)', boxShadow: raised, maxWidth: 'calc(100vw - 24px)', overflowX: 'auto' }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => goTo(s.id)}
            style={{ padding: '7px 14px', borderRadius: '999px', border: 'none', background: active === s.id ? 'linear-gradient(135deg,#D4A84F,#A07830)' : 'transparent', color: active === s.id ? C.carbon : C.smoke, fontSize: '12px', fontWeight: active === s.id ? 700 : 400, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.2s ease', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* CONTENT AREA — siempre desde el top */}
      <div style={{
        flex: 1,
        marginTop: '64px',
        paddingBottom: '80px',
        overflowY: 'auto',
        opacity: fading ? 0 : 1,
        transform: fading ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 0.26s ease, transform 0.26s ease',
      }}>

        {/* HERO */}
        {active === 0 && (
          <section style={{ width: '100%', maxWidth: '680px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '28px', padding: '6px 16px', background: C.graphite, boxShadow: insetSm, borderRadius: '999px', fontSize: '10px', fontWeight: 700, color: C.gold, letterSpacing: '.12em', textTransform: 'uppercase' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: C.gold, boxShadow: `0 0 8px ${C.gold}` }} />
              Digital Identity Platform
            </div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(40px,8vw,76px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-.03em', marginBottom: '20px', color: C.silver }}>
              Make every<br />introduction{' '}
              <span style={{ background: 'linear-gradient(135deg,#D4A84F 0%,#F0C96A 45%,#A07830 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>smart.</span>
            </h1>
            <p style={{ fontSize: 'clamp(14px,3vw,17px)', color: C.smoke, maxWidth: '460px', margin: '0 auto 36px', lineHeight: 1.7, fontWeight: 300 }}>
              Replace your paper card with a dynamic digital identity. One QR scan — your contact saved instantly on any phone.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <Link href="/sign-up" style={{ width: '100%', maxWidth: '300px', padding: '15px', background: 'linear-gradient(135deg,#D4A84F,#E8C06A,#A07830)', color: C.carbon, fontWeight: 700, fontSize: '15px', borderRadius: '14px', boxShadow: goldBox, textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                Create my Vynk card — $20
              </Link>
              <button onClick={() => goTo(1)} style={{ width: '100%', maxWidth: '300px', padding: '13px', background: C.graphite, color: C.smoke, fontWeight: 500, fontSize: '14px', borderRadius: '14px', boxShadow: raisedSm, border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                How it works →
              </button>
            </div>
            <p style={{ fontSize: '12px', color: C.smoke, opacity: .5 }}>One-time · No subscription · Free updates · Identity changes from $10</p>
          </section>
        )}

        {/* HOW IT WORKS */}
        {active === 1 && (
          <section style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '24px', height: '1px', background: C.gold }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: C.gold, letterSpacing: '.1em', textTransform: 'uppercase' }}>How it works</span>
            </div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(26px,5vw,44px)', fontWeight: 800, color: C.silver, marginBottom: '8px', letterSpacing: '-.02em' }}>Three steps.<br />One identity.</h2>
            <p style={{ color: C.smoke, fontSize: '14px', marginBottom: '32px', fontWeight: 300 }}>From setup to sharing in under 3 minutes.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { n: '01', t: 'Build your card', d: 'Fill in your identity, upload photo or logo, pick templates, fonts and colors in real time. Everything previews instantly.' },
                { n: '02', t: 'Pay once, keep forever', d: 'A single $20 payment activates your card at your unique link and QR code. No subscriptions, no monthly fees, ever.' },
                { n: '03', t: 'Share anywhere', d: 'Anyone scans your QR or opens your link — your contact saves to their phone in one tap. Works globally on any device.' },
              ].map(s => (
                <div key={s.n} style={{ background: C.graphite, boxShadow: raised, borderRadius: '18px', padding: '24px 20px', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: '16px', alignItems: 'flex-start', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-6px', right: '14px', fontFamily: "'Syne',sans-serif", fontSize: '56px', fontWeight: 800, color: 'rgba(212,168,79,0.04)', lineHeight: 1, userSelect: 'none' }}>{s.n}</div>
                  <div style={{ width: '38px', height: '38px', background: C.graphite, boxShadow: insetSm, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: C.gold, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '12px' }}>{s.n}</div>
                  <div>
                    <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '17px', marginBottom: '6px', color: C.silver }}>{s.t}</h3>
                    <p style={{ color: C.smoke, fontSize: '13px', lineHeight: 1.7, fontWeight: 300 }}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
              <button onClick={() => goTo(2)} style={{ padding: '11px 24px', background: C.graphite, color: C.smoke, fontSize: '13px', fontWeight: 500, borderRadius: '12px', boxShadow: raisedSm, border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Everything included →</button>
            </div>
          </section>
        )}

        {/* FEATURES */}
        {active === 2 && (
          <section style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '24px', height: '1px', background: C.gold }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: C.gold, letterSpacing: '.1em', textTransform: 'uppercase' }}>Everything included</span>
            </div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(26px,5vw,44px)', fontWeight: 800, color: C.silver, marginBottom: '28px', letterSpacing: '-.02em' }}>One card.<br />Infinite possibilities.</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {FEATURES.map(f => (
                <div key={f.title} style={{ background: C.graphite, boxShadow: raisedSm, borderRadius: '16px', padding: '18px 16px', border: '1px solid rgba(255,255,255,0.025)', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', background: C.graphite, boxShadow: insetSm, borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: C.silver }}>{f.title}</h3>
                    <p style={{ color: C.smoke, fontSize: '12px', lineHeight: 1.6, fontWeight: 300 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
              <button onClick={() => goTo(3)} style={{ padding: '11px 24px', background: C.graphite, color: C.smoke, fontSize: '13px', fontWeight: 500, borderRadius: '12px', boxShadow: raisedSm, border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>See pricing →</button>
            </div>
          </section>
        )}

        {/* PRICING */}
        {active === 3 && (
          <section style={{ width: '100%', maxWidth: '440px', margin: '0 auto', padding: '40px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '24px', height: '1px', background: C.gold }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: C.gold, letterSpacing: '.1em', textTransform: 'uppercase' }}>Pricing</span>
                <div style={{ width: '24px', height: '1px', background: C.gold }} />
              </div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(24px,5vw,40px)', fontWeight: 800, color: C.silver, letterSpacing: '-.02em', marginBottom: '6px' }}>Simple, honest pricing.</h2>
              <p style={{ color: C.smoke, fontSize: '13px', fontWeight: 300 }}>No subscriptions. No hidden fees. Ever.</p>
            </div>
            <div style={{ background: C.graphite, boxShadow: `10px 10px 28px ${C.nd}, -6px -6px 18px ${C.nl}`, borderRadius: '22px', padding: '32px 24px', border: '1px solid rgba(212,168,79,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', color: C.gold, fontWeight: 500 }}>$</span>
                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: '60px', fontWeight: 800, background: 'linear-gradient(135deg,#D4A84F 0%,#F0C96A 45%,#A07830 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>20</span>
              </div>
              <p style={{ color: C.smoke, fontSize: '13px', marginBottom: '20px', fontWeight: 300 }}>One-time payment — yours forever</p>
              <div style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(212,168,79,0.15),transparent)', marginBottom: '18px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '24px' }}>
                {CHECKS.map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: C.silver }}>
                    <div style={{ width: '19px', height: '19px', background: C.graphite, boxShadow: insetSm, borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: C.gold, fontSize: '10px', fontWeight: 700 }}>✓</div>
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/sign-up" style={{ display: 'block', padding: '15px', background: 'linear-gradient(135deg,#D4A84F,#E8C06A,#A07830)', color: C.carbon, fontWeight: 700, fontSize: '15px', borderRadius: '14px', textAlign: 'center', boxShadow: goldBox, textDecoration: 'none' }}>
                Create my Vynk card
              </Link>
              <p style={{ textAlign: 'center', fontSize: '11px', color: C.smoke, marginTop: '10px', opacity: .5 }}>Stripe · Apple Pay · Google Pay</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
              {[['Terms', '/legal/terms'], ['Privacy', '/legal/privacy'], ['Refunds', '/legal/refunds']].map(([l, h]) => (
                <Link key={l} href={h} style={{ fontSize: '11px', color: C.smoke, textDecoration: 'none', opacity: .4 }}>{l}</Link>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: '11px', color: C.smoke, opacity: .25, marginTop: '6px' }}>© {new Date().getFullYear()} Vynk</p>
          </section>
        )}
      </div>
    </div>
  )
}
