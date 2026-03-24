'use client'
// src/components/CardShowcase.tsx
// Drop-in marketing slide — muestra ambos lados de la tarjeta flotando
// Uso: <CardShowcase /> en la landing page, reemplaza la sección del hero secundario

import { useEffect, useRef, useState } from 'react'

const C = {
  g:'#0D0F12', gold:'#D4A84F', goldLt:'#E8C06A', goldDk:'#A07830',
  silver:'#BFC3C9', smoke:'#6F737A', carbon:'#050607',
  nd:'#08090B', nl:'#141720',
}

// Logo SVG inline (basado en el logo Vynk — V con órbita)
function VynkLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.42} viewBox="0 0 220 92" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* V mark */}
      <polygon points="0,8 18,8 40,58 62,8 80,8 40,88" fill="url(#vg)"/>
      {/* orbit ring */}
      <ellipse cx="38" cy="48" rx="52" ry="18" stroke="url(#og)" strokeWidth="3" fill="none" transform="rotate(-15 38 48)"/>
      {/* VYNK text */}
      <text x="95" y="72" fontFamily="'Syne',sans-serif" fontWeight="800" fontSize="64" fill="url(#tg)" letterSpacing="-2">VYNK</text>
      <defs>
        <linearGradient id="vg" x1="0" y1="0" x2="80" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D4A84F"/>
          <stop offset="100%" stopColor="#A07830"/>
        </linearGradient>
        <linearGradient id="og" x1="0" y1="0" x2="76" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D4A84F" stopOpacity="0"/>
          <stop offset="50%" stopColor="#E8C06A"/>
          <stop offset="100%" stopColor="#D4A84F" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="tg" x1="95" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#BFC3C9"/>
          <stop offset="100%" stopColor="#8A8E94"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

// Tarjeta FRONTAL
function CardFront() {
  return (
    <div style={{
      width: '340px',
      height: '210px',
      borderRadius: '20px',
      background: 'linear-gradient(135deg, #0D0F12 0%, #141720 100%)',
      border: '1px solid rgba(212,168,79,0.2)',
      boxShadow: `0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,168,79,0.08), inset 0 1px 0 rgba(212,168,79,0.12)`,
      position: 'relative',
      overflow: 'hidden',
      padding: '28px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      color: '#BFC3C9',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* SVG decorativo fondo */}
      <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}} viewBox="0 0 340 210" preserveAspectRatio="xMidYMid slice">
        <circle cx="310" cy="20" r="80" fill="none" stroke="rgba(212,168,79,0.06)" strokeWidth="1"/>
        <circle cx="310" cy="20" r="55" fill="none" stroke="rgba(212,168,79,0.04)" strokeWidth="0.5"/>
        <line x1="0" y1="190" x2="340" y2="190" stroke="rgba(212,168,79,0.07)" strokeWidth="1"/>
        <polygon points="310,0 340,0 340,70" fill="rgba(212,168,79,0.04)"/>
      </svg>

      {/* Gradiente overlay */}
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 80% 60% at 20% 80%, rgba(212,168,79,0.06) 0%, transparent 55%)',pointerEvents:'none'}}/>

      {/* Top: label + foto */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',position:'relative',zIndex:1}}>
        <div>
          <div style={{fontSize:'8px',fontWeight:700,letterSpacing:'.16em',color:'rgba(212,168,79,0.5)',textTransform:'uppercase',marginBottom:'14px'}}>VYNK</div>
          <div style={{fontSize:'26px',fontWeight:700,lineHeight:1.1,color:'#E8EAF0',fontFamily:"'Syne',sans-serif"}}>JOREL</div>
          <div style={{fontSize:'12px',color:'rgba(191,195,201,0.6)',marginTop:'4px',fontWeight:400}}>CEO · VYNK</div>
        </div>
        {/* Avatar con logo */}
        <div style={{
          width:'52px',height:'52px',borderRadius:'50%',
          border:'2px solid rgba(212,168,79,0.3)',
          background:'#0a0b0f',
          display:'flex',alignItems:'center',justifyContent:'center',
          boxShadow:'0 4px 16px rgba(0,0,0,0.6)',
          overflow:'hidden',
          flexShrink:0,
        }}>
          <img src="/logo.png" alt="Vynk" style={{width:'80%',height:'80%',objectFit:'contain'}}/>
        </div>
      </div>

      {/* Bottom */}
      <div style={{position:'relative',zIndex:1}}>
        <div style={{fontSize:'10px',color:'rgba(191,195,201,0.4)',marginBottom:'2px'}}>jorel@vynk.app</div>
        <div style={{marginTop:'10px',width:'55%',height:'1px',background:'linear-gradient(90deg, rgba(212,168,79,0.5), transparent)'}}/>
      </div>

      {/* QR placeholder bottom-right */}
      <div style={{
        position:'absolute',bottom:'22px',right:'24px',
        width:'38px',height:'38px',
        border:'1px solid rgba(212,168,79,0.2)',
        borderRadius:'6px',
        background:'rgba(212,168,79,0.04)',
        display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'2px',
        padding:'4px',
      }}>
        {[1,1,0,1,0,1,0,1,1].map((v,i)=>(
          <div key={i} style={{background:v?'rgba(212,168,79,0.5)':'transparent',borderRadius:'1px'}}/>
        ))}
      </div>
    </div>
  )
}

// Tarjeta TRASERA
function CardBack() {
  const socials = ['WA','IG','IN','TW','TK']
  const services = ['Strategy','Branding','Digital']
  return (
    <div style={{
      width: '340px',
      height: '210px',
      borderRadius: '20px',
      background: 'linear-gradient(135deg, #0a0b0f 0%, #111420 100%)',
      border: '1px solid rgba(212,168,79,0.15)',
      boxShadow: `0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,168,79,0.06), inset 0 1px 0 rgba(212,168,79,0.08)`,
      position: 'relative',
      overflow: 'hidden',
      padding: '28px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      color: '#BFC3C9',
      fontFamily: "'DM Sans', sans-serif",
      filter: 'brightness(0.9)',
    }}>
      <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}} viewBox="0 0 340 210" preserveAspectRatio="xMidYMid slice">
        <polygon points="0,0 340,210 0,210" fill="rgba(212,168,79,0.02)"/>
        <circle cx="280" cy="180" r="100" fill="none" stroke="rgba(212,168,79,0.04)" strokeWidth="1"/>
      </svg>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 100% 60% at 80% 100%, rgba(212,168,79,0.05) 0%, transparent 55%)',pointerEvents:'none'}}/>

      <div style={{position:'relative',zIndex:1}}>
        <div style={{fontSize:'8px',fontWeight:700,letterSpacing:'.16em',color:'rgba(212,168,79,0.4)',textTransform:'uppercase',marginBottom:'12px'}}>VYNK · SERVICES</div>
        <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'10px'}}>
          {services.map(s=>(
            <span key={s} style={{padding:'3px 10px',borderRadius:'20px',fontSize:'10px',fontWeight:600,background:'rgba(212,168,79,0.1)',border:'1px solid rgba(212,168,79,0.25)',color:'#D4A84F'}}>{s}</span>
          ))}
        </div>
        <div style={{fontSize:'11px',color:'rgba(191,195,201,0.5)',lineHeight:1.7}}>Premium digital identity platform.<br/>One scan — your contact saved instantly.</div>
      </div>

      <div style={{position:'relative',zIndex:1,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',gap:'5px'}}>
          {socials.map(s=>(
            <div key={s} style={{width:'28px',height:'28px',borderRadius:'8px',background:'rgba(212,168,79,0.1)',border:'1px solid rgba(212,168,79,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'8px',fontWeight:700,color:'#D4A84F'}}>{s}</div>
          ))}
        </div>
        <div style={{fontSize:'9px',color:'rgba(191,195,201,0.3)'}}>vynk.app/c/jorel</div>
      </div>
    </div>
  )
}

export default function CardShowcase() {
  const [hovered, setHovered] = useState(false)
  const [tick, setTick] = useState(0)

  // Float animation via JS (compatible con SSR)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 50)
    return () => clearInterval(id)
  }, [])

  const t = tick * 0.05
  const floatFront = Math.sin(t) * 10
  const floatBack  = Math.sin(t + 1.2) * 8
  const rotateFront = Math.sin(t * 0.7) * 2
  const rotateBack  = Math.sin(t * 0.5 + 0.8) * 2.5

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '340px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow ambiental */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(212,168,79,0.12) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        filter: 'blur(40px)',
      }}/>

      {/* Tarjeta TRASERA — ligeramente detrás y desplazada */}
      <div style={{
        position: 'absolute',
        transform: `
          translateX(60px)
          translateY(${floatBack + (hovered ? -8 : 0)}px)
          rotate(${12 + rotateBack}deg)
        `,
        transition: hovered ? 'transform 0.6s cubic-bezier(0.23,1,0.32,1)' : 'none',
        zIndex: 1,
        opacity: 0.85,
      }}>
        <CardBack />
      </div>

      {/* Tarjeta FRONTAL — encima */}
      <div style={{
        position: 'relative',
        transform: `
          translateX(-30px)
          translateY(${floatFront + (hovered ? -12 : 0)}px)
          rotate(${-6 + rotateFront}deg)
        `,
        transition: hovered ? 'transform 0.6s cubic-bezier(0.23,1,0.32,1)' : 'none',
        zIndex: 2,
      }}>
        <CardFront />
      </div>

      {/* Badge "Tap to flip" — aparece en hover */}
      <div style={{
        position: 'absolute',
        bottom: '0px',
        left: '50%',
        transform: `translateX(-50%) translateY(${hovered ? 0 : 8}px)`,
        opacity: hovered ? 1 : 0,
        transition: 'all 0.3s ease',
        fontSize: '11px',
        color: C.smoke,
        background: C.g,
        border: '1px solid rgba(212,168,79,0.1)',
        padding: '5px 14px',
        borderRadius: '20px',
        boxShadow: `3px 3px 8px ${C.nd}`,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}>
        Your card · both sides
      </div>
    </div>
  )
}
