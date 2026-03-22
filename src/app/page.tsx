import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{ minHeight:'100vh', background:'#1a1a24', color:'#e8e8f0', fontFamily:"'DM Sans',sans-serif" }}>

      {/* Nav */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 48px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
        <Image src="/logo.png" alt="Vynk" width={110} height={36} style={{ objectFit:'contain' }} priority />
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <Link href="/sign-in" style={{ fontSize:'14px', color:'#6a6a8a', textDecoration:'none', padding:'10px 20px', background:'#1a1a24', boxShadow:'3px 3px 8px #0d0d14, -2px -2px 6px #27273a', borderRadius:'10px', transition:'all .15s' }}>
            Sign in
          </Link>
          <Link href="/sign-up" style={{ fontSize:'14px', fontWeight:700, textDecoration:'none', padding:'10px 24px', background:'linear-gradient(135deg,#d4a843,#e8c96a,#a07830)', color:'#0d0d14', borderRadius:'12px', boxShadow:'4px 4px 12px #0d0d14, -2px -2px 8px #27273a, 0 0 20px rgba(212,168,67,0.18)' }}>
            Get started — $20
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth:'960px', margin:'0 auto', padding:'96px 48px', textAlign:'center' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'6px 18px', marginBottom:'40px', background:'#1a1a24', boxShadow:'inset 3px 3px 8px #0d0d14, inset -2px -2px 6px #27273a', borderRadius:'999px', fontSize:'11px', fontWeight:700, letterSpacing:'.1em', color:'#d4a843', textTransform:'uppercase' }}>
          Digital Identity Platform
        </div>
        <h1 style={{ fontSize:'clamp(42px,6vw,72px)', fontWeight:700, lineHeight:1.1, marginBottom:'24px', letterSpacing:'-.02em' }}>
          Make every introduction
          <br /><span style={{ background:'linear-gradient(135deg,#d4a843 0%,#f0d080 50%,#a07830 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>smart.</span>
        </h1>
        <p style={{ fontSize:'18px', color:'#6a6a8a', maxWidth:'560px', margin:'0 auto 48px', lineHeight:1.7 }}>
          Replace your paper card with a dynamic digital identity. One QR scan — your contact saved instantly on any phone in the world.
        </p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'16px', flexWrap:'wrap' }}>
          <Link href="/sign-up" style={{ textDecoration:'none', padding:'16px 40px', background:'linear-gradient(135deg,#d4a843,#e8c96a,#a07830)', color:'#0d0d14', fontWeight:700, fontSize:'16px', borderRadius:'16px', boxShadow:'6px 6px 16px #0d0d14, -3px -3px 10px #27273a, 0 0 28px rgba(212,168,67,0.25)' }}>
            Create my Vynk card — $20
          </Link>
          <Link href="/c/demo" style={{ textDecoration:'none', padding:'16px 32px', background:'#1a1a24', color:'#c0c0d0', fontWeight:500, fontSize:'15px', borderRadius:'16px', boxShadow:'5px 5px 12px #0d0d14, -3px -3px 8px #27273a', border:'1px solid rgba(255,255,255,0.04)' }}>
            See live demo →
          </Link>
        </div>
        <p style={{ fontSize:'13px', color:'#4a4a62', marginTop:'20px' }}>One-time · No subscription · Free color updates · Content changes from $10</p>
      </section>

      {/* How it works */}
      <section style={{ borderTop:'1px solid rgba(255,255,255,0.04)', padding:'80px 48px' }}>
        <div style={{ maxWidth:'960px', margin:'0 auto' }}>
          <h2 style={{ fontSize:'32px', fontWeight:700, textAlign:'center', marginBottom:'56px' }}>How Vynk works</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'24px' }}>
            {[
              { n:'01', t:'Build your card', d:'Fill in your identity, upload photo or logo, pick templates, fonts and colors in real time.' },
              { n:'02', t:'Pay once, keep forever', d:'A single $20 payment activates your card at your unique link and QR code instantly.' },
              { n:'03', t:'Share anywhere', d:'Anyone scans your QR or opens your link — your contact is saved to their phone in one tap.' },
            ].map(s => (
              <div key={s.n} style={{ background:'#1a1a24', boxShadow:'8px 8px 20px #0d0d14, -5px -5px 14px #27273a', borderRadius:'24px', padding:'36px 28px', border:'1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize:'36px', fontWeight:700, background:'linear-gradient(135deg,#d4a843,#f0d080,#a07830)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:'16px' }}>{s.n}</div>
                <h3 style={{ fontWeight:700, fontSize:'17px', marginBottom:'8px', color:'#e8e8f0' }}>{s.t}</h3>
                <p style={{ color:'#6a6a8a', fontSize:'14px', lineHeight:1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding:'80px 48px' }}>
        <div style={{ maxWidth:'960px', margin:'0 auto' }}>
          <h2 style={{ fontSize:'32px', fontWeight:700, textAlign:'center', marginBottom:'56px' }}>Everything in one card</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'20px' }}>
            {[
              { e:'👤', t:'Save to Contacts', d:'QR scan → phone asks to save contact. Name, photo, phone, email — all in one tap. Works on iPhone and Android worldwide.' },
              { e:'↩️', t:'Front & back card', d:'Your Vynk card flips like a physical card. Front shows your identity, back shows services, bio and social links.' },
              { e:'🔗', t:'Your unique link', d:'vynk.app/c/yourname — share in Instagram bio, email signature, WhatsApp, LinkedIn or print on physical materials.' },
              { e:'🌐', t:'Works worldwide', d:'Accessible from any country, any device, any browser. No app required. Instantly shareable via QR, NFC or direct link.' },
              { e:'🔒', t:'Secure ownership', d:'Your card is tied to your account. Recover from any device with your same login. Anti-plagiarism protection built in.' },
              { e:'⚡', t:'Free updates anytime', d:'Change colors, bio, services, and social links for free anytime. Core identity changes from $10.' },
            ].map(f => (
              <div key={f.t} style={{ background:'#1a1a24', boxShadow:'6px 6px 16px #0d0d14, -4px -4px 10px #27273a', borderRadius:'20px', padding:'24px', border:'1px solid rgba(255,255,255,0.03)', display:'flex', gap:'16px', alignItems:'flex-start' }}>
                <div style={{ width:'44px', height:'44px', background:'#1a1a24', boxShadow:'inset 3px 3px 8px #0d0d14, inset -2px -2px 6px #27273a', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>{f.e}</div>
                <div>
                  <h3 style={{ fontWeight:700, fontSize:'15px', marginBottom:'6px', color:'#e8e8f0' }}>{f.t}</h3>
                  <p style={{ color:'#6a6a8a', fontSize:'13px', lineHeight:1.6 }}>{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ borderTop:'1px solid rgba(255,255,255,0.04)', padding:'80px 48px' }}>
        <div style={{ maxWidth:'480px', margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontSize:'32px', fontWeight:700, marginBottom:'12px' }}>Simple, honest pricing</h2>
          <p style={{ color:'#6a6a8a', marginBottom:'48px' }}>No subscriptions. No hidden fees. Ever.</p>
          <div style={{ background:'#1a1a24', boxShadow:'10px 10px 28px #0d0d14, -6px -6px 18px #27273a', borderRadius:'28px', padding:'48px 40px', border:'1px solid rgba(212,168,67,0.08)' }}>
            <div style={{ fontSize:'64px', fontWeight:700, background:'linear-gradient(135deg,#d4a843,#f0d080,#a07830)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1, marginBottom:'8px' }}>$20</div>
            <div style={{ color:'#6a6a8a', marginBottom:'36px', fontSize:'15px' }}>One-time — yours forever</div>
            <div style={{ textAlign:'left', marginBottom:'36px', display:'flex', flexDirection:'column', gap:'12px' }}>
              {['Card published at your unique link instantly','QR code — scan saves contact to any phone','Front & back card with flip animation','All templates, fonts and design options','Free color & content updates anytime','Core identity changes: $10 per update','NFC-compatible link, works worldwide'].map(item => (
                <div key={item} style={{ display:'flex', alignItems:'center', gap:'12px', fontSize:'14px', color:'#c0c0d0' }}>
                  <div style={{ width:'22px', height:'22px', background:'#1a1a24', boxShadow:'inset 2px 2px 5px #0d0d14, inset -1px -1px 4px rgba(212,168,67,0.15)', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#d4a843', fontSize:'12px', fontWeight:700 }}>✓</div>
                  {item}
                </div>
              ))}
            </div>
            <Link href="/sign-up" style={{ textDecoration:'none', display:'block', padding:'16px', background:'linear-gradient(135deg,#d4a843,#e8c96a,#a07830)', color:'#0d0d14', fontWeight:700, fontSize:'15px', borderRadius:'14px', textAlign:'center', boxShadow:'4px 4px 14px #0d0d14, -2px -2px 8px #27273a, 0 0 24px rgba(212,168,67,0.2)' }}>
              Create my Vynk card
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.04)', padding:'40px 48px' }}>
        <div style={{ maxWidth:'960px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
          <Image src="/logo.png" alt="Vynk" width={80} height={26} style={{ objectFit:'contain', opacity:.6 }} />
          <div style={{ display:'flex', gap:'24px' }}>
            {[['Terms','/legal/terms'],['Privacy','/legal/privacy'],['Refunds','/legal/refunds']].map(([l,h])=>(
              <Link key={l} href={h} style={{ fontSize:'13px', color:'#4a4a62', textDecoration:'none' }}>{l}</Link>
            ))}
          </div>
        </div>
        <div style={{ textAlign:'center', fontSize:'12px', color:'#3a3a52', marginTop:'24px' }}>
          © {new Date().getFullYear()} Vynk. Make every introduction smart.
        </div>
      </footer>
    </main>
  )
}
