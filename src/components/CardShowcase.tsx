'use client'
// src/components/CardShowcase.tsx
// Muestra ambas tarjetas flotando — frontal encima, trasera visible abajo-derecha
// Responsive: en mobile se apilan verticalmente con scroll

import { useEffect, useState } from 'react'

const C = {
  g: '#0D0F12', gold: '#D4A84F', goldLt: '#E8C06A', goldDk: '#A07830',
  silver: '#BFC3C9', smoke: '#6F737A', carbon: '#050607',
  nd: '#08090B', nl: '#141720',
}

function CardFront() {
  return (
    <div style={{
      width: '300px',
      height: '185px',
      borderRadius: '18px',
      background: 'linear-gradient(135deg, #0D0F12 0%, #141720 100%)',
      border: '1px solid rgba(212,168,79,0.2)',
      boxShadow: `0 32px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,168,79,0.08), inset 0 1px 0 rgba(212,168,79,0.12)`,
      position: 'relative',
      overflow: 'hidden',
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      color: '#BFC3C9',
      fontFamily: "'DM Sans', sans-serif",
      flexShrink: 0,
    }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 300 185" preserveAspectRatio="xMidYMid slice">
        <circle cx="270" cy="18" r="70" fill="none" stroke="rgba(212,168,79,0.06)" strokeWidth="1" />
        <circle cx="270" cy="18" r="48" fill="none" stroke="rgba(212,168,79,0.04)" strokeWidth="0.5" />
        <line x1="0" y1="168" x2="300" y2="168" stroke="rgba(212,168,79,0.07)" strokeWidth="1" />
        <polygon points="270,0 300,0 300,62" fill="rgba(212,168,79,0.04)" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 20% 80%, rgba(212,168,79,0.06) 0%, transparent 55%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ fontSize: '7px', fontWeight: 700, letterSpacing: '.16em', color: 'rgba(212,168,79,0.5)', textTransform: 'uppercase', marginBottom: '10px' }}>VYNK</div>
          <div style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1.1, color: '#E8EAF0', fontFamily: "'Syne',sans-serif" }}>JOREL</div>
          <div style={{ fontSize: '11px', color: 'rgba(191,195,201,0.6)', marginTop: '3px', fontWeight: 400 }}>CEO · VYNK</div>
        </div>
        <div style={{
          width: '46px', height: '46px', borderRadius: '50%',
          border: '2px solid rgba(212,168,79,0.3)',
          background: '#0a0b0f',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
          overflow: 'hidden', flexShrink: 0,
        }}>
          <img src="/logo.png" alt="Vynk" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '9px', color: 'rgba(191,195,201,0.4)', marginBottom: '2px' }}>jorel@vynk.app</div>
        <div style={{ marginTop: '8px', width: '50%', height: '1px', background: 'linear-gradient(90deg, rgba(212,168,79,0.5), transparent)' }} />
      </div>

      <div style={{
        position: 'absolute', bottom: '18px', right: '20px',
        width: '34px', height: '34px',
        border: '1px solid rgba(212,168,79,0.2)',
        borderRadius: '6px',
        background: 'rgba(212,168,79,0.04)',
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px',
        padding: '4px',
      }}>
        {[1, 1, 0, 1, 0, 1, 0, 1, 1].map((v, i) => (
          <div key={i} style={{ background: v ? 'rgba(212,168,79,0.5)' : 'transparent', borderRadius: '1px' }} />
        ))}
      </div>
    </div>
  )
}

function CardBack() {
  const socials = ['WA', 'IG', 'IN', 'TW', 'TK']
  const services = ['Strategy', 'Branding', 'Digital']
  return (
    <div style={{
      width: '300px',
      height: '185px',
      borderRadius: '18px',
      background: 'linear-gradient(135deg, #0a0b0f 0%, #111420 100%)',
      border: '1px solid rgba(212,168,79,0.15)',
      boxShadow: `0 32px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,168,79,0.06), inset 0 1px 0 rgba(212,168,79,0.08)`,
      position: 'relative',
      overflow: 'hidden',
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      color: '#BFC3C9',
      fontFamily: "'DM Sans', sans-serif",
      flexShrink: 0,
    }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 300 185" preserveAspectRatio="xMidYMid slice">
        <polygon points="0,0 300,185 0,185" fill="rgba(212,168,79,0.02)" />
        <circle cx="250" cy="160" r="90" fill="none" stroke="rgba(212,168,79,0.04)" strokeWidth="1" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 100% 60% at 80% 100%, rgba(212,168,79,0.05) 0%, transparent 55%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '7px', fontWeight: 700, letterSpacing: '.16em', color: 'rgba(212,168,79,0.4)', textTransform: 'uppercase', marginBottom: '10px' }}>VYNK · SERVICES</div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {services.map(s => (
            <span key={s} style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '9px', fontWeight: 600, background: 'rgba(212,168,79,0.1)', border: '1px solid rgba(212,168,79,0.25)', color: '#D4A84F' }}>{s}</span>
          ))}
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(191,195,201,0.5)', lineHeight: 1.6 }}>Premium digital identity platform.<br />One scan — your contact saved instantly.</div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {socials.map(s => (
            <div key={s} style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'rgba(212,168,79,0.1)', border: '1px solid rgba(212,168,79,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', fontWeight: 700, color: '#D4A84F' }}>{s}</div>
          ))}
        </div>
        <div style={{ fontSize: '8px', color: 'rgba(191,195,201,0.3)' }}>vynk.app/c/jorel</div>
      </div>
    </div>
  )
}

export default function CardShowcase() {
  const [tick, setTick] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 500)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 50)
    return () => clearInterval(id)
  }, [])

  const t = tick * 0.04
  const floatFront = Math.sin(t) * 7
  const floatBack = Math.sin(t + 1.2) * 6
  const rotateFront = Math.sin(t * 0.7) * 1.5
  const rotateBack = Math.sin(t * 0.5 + 0.8) * 2

  // Mobile: apiladas verticalmente, ambas visibles
  if (isMobile) {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '8px 0 24px' }}>
        {/* Label frontal */}
        <div style={{ fontSize: '10px', color: C.smoke, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600 }}>Front</div>
        <div style={{ transform: `translateY(${floatFront}px) rotate(${rotateFront}deg)`, transition: 'none' }}>
          <CardFront />
        </div>
        {/* Label trasera */}
        <div style={{ fontSize: '10px', color: C.smoke, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, marginTop: '4px' }}>Back</div>
        <div style={{ transform: `translateY(${floatBack}px) rotate(${-rotateBack}deg)`, transition: 'none', opacity: 0.9 }}>
          <CardBack />
        </div>
      </div>
    )
  }

  // Desktop: overlapping pero con la trasera COMPLETAMENTE visible
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      // Altura calculada para mostrar AMBAS tarjetas sin solaparse demasiado
      height: '460px',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '20px',
    }}>
      {/* Glow ambiental */}
      <div style={{
        position: 'absolute',
        width: '380px', height: '180px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(212,168,79,0.1) 0%, transparent 70%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        filter: 'blur(40px)',
      }} />

      {/* Tarjeta FRONTAL — arriba-izquierda */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        marginLeft: '-170px', // centrada levemente a la izquierda
        transform: `translateY(${floatFront}px) rotate(${-4 + rotateFront}deg)`,
        zIndex: 2,
      }}>
        <CardFront />
        <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '10px', color: C.smoke, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600 }}>Front</div>
      </div>

      {/* Tarjeta TRASERA — abajo-derecha, completamente visible */}
      <div style={{
        position: 'absolute',
        top: '220px',   // debajo de la frontal
        left: '50%',
        marginLeft: '-80px', // desplazada a la derecha
        transform: `translateY(${floatBack}px) rotate(${6 + rotateBack}deg)`,
        zIndex: 1,
        opacity: 0.92,
      }}>
        <CardBack />
        <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '10px', color: C.smoke, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600 }}>Back</div>
      </div>
    </div>
  )
}
