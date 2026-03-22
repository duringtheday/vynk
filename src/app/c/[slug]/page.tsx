import { notFound } from 'next/navigation'
import { db, cards, cardViews } from '@/db'
import { eq, and } from 'drizzle-orm'
import { generateVCard, vCardDataUri } from '@/lib/vcard'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [card] = await db.select().from(cards).where(eq(cards.slug, slug)).limit(1)
  if (!card) return { title: 'Card not found — Vynk' }
  return {
    title: `${card.fullName} — Vynk`,
    description: card.tagline || `${card.fullName} digital business card powered by Vynk`,
    openGraph: { title: `${card.fullName} — Vynk`, description: card.tagline || 'Digital business card', images: card.photoUrl ? [card.photoUrl] : [] },
  }
}

export default async function PublicCardPage({ params }: Props) {
  const { slug } = await params
  const [card] = await db.select().from(cards)
    .where(and(eq(cards.slug, slug), eq(cards.status, 'active')))
    .limit(1)
  if (!card) notFound()

  // Track view async
  db.insert(cardViews).values({ cardId: card.id, device: 'unknown', source: 'direct' }).catch(() => {})

  const design = card.design as any
  const bg = design.mode === 'gradient'
    ? `linear-gradient(135deg, ${design.bg||'#1a1a2e'}, ${design.bg2||'#16213e'})`
    : design.bg || '#1a1a2e'
  const tc = design.textColor || '#e8e8f0'
  const fontCss = {
    dm: "'DM Sans',sans-serif", syne: "'Syne',sans-serif",
    playfair: "'Playfair Display',serif", cormorant: "'Cormorant Garamond',serif",
    bebas: "'Bebas Neue',cursive", josefin: "'Josefin Sans',sans-serif",
  }[design.font as string] || "'DM Sans',sans-serif"

  const vcf = generateVCard({
    fullName:card.fullName, title:card.title??undefined, company:card.company??undefined,
    tagline:card.tagline??undefined, bio:card.bio??undefined, services:card.services??undefined,
    email:card.email??undefined, phone:card.phone??undefined, whatsapp:card.whatsapp??undefined,
    telegram:card.telegram??undefined, instagram:card.instagram??undefined,
    linkedin:card.linkedin??undefined, twitter:card.twitter??undefined,
    tiktok:card.tiktok??undefined, youtube:card.youtube??undefined,
    website:card.website??undefined, address:card.address??undefined,
  })
  const vcfUri  = vCardDataUri(vcf)
  const dlName  = `${card.fullName.replace(/\s+/g,'_')}.vcf`
  const initials = card.fullName.split(' ').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase()

  const socials = [
    { v:card.whatsapp,  l:'WhatsApp',  url:`https://wa.me/${(card.whatsapp||'').replace(/\D/g,'')}`, c:'#25d366' },
    { v:card.telegram,  l:'Telegram',  url:`https://t.me/${(card.telegram||'').replace('@','')}`, c:'#0088cc' },
    { v:card.instagram, l:'Instagram', url:`https://instagram.com/${(card.instagram||'').replace('@','')}`, c:'#e4405f' },
    { v:card.linkedin,  l:'LinkedIn',  url:`https://linkedin.com/in/${card.linkedin}`, c:'#0077b5' },
    { v:card.twitter,   l:'X',         url:`https://x.com/${(card.twitter||'').replace('@','')}`, c:'#111' },
    { v:card.tiktok,    l:'TikTok',    url:`https://tiktok.com/@${(card.tiktok||'').replace('@','')}`, c:'#010101' },
    { v:card.youtube,   l:'YouTube',   url:`https://youtube.com/@${(card.youtube||'').replace('@','')}`, c:'#ff0000' },
    { v:card.email,     l:'Email',     url:`mailto:${card.email}`, c:'#d4a843' },
    { v:card.website,   l:'Website',   url:card.website?.startsWith('http')?card.website:`https://${card.website}`, c:'#6366f1' },
  ].filter(s=>s.v)

  return (
    <main style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 16px', fontFamily:fontCss }}>

      {/* Flip hint */}
      <p style={{ fontSize:'10px', color:'#6a6a7a', marginBottom:'12px', letterSpacing:'0.08em', textTransform:'uppercase' }}>
        Tap card to flip ↻
      </p>

      {/* Card scene */}
      <div style={{ width:'100%', maxWidth:'400px', perspective:'1200px', marginBottom:'20px' }}>
        <div id="flipper" style={{ position:'relative', transformStyle:'preserve-3d', transition:'transform 0.7s cubic-bezier(0.23,1,0.32,1)', minHeight:'230px', cursor:'pointer' }}>

          {/* FRONT */}
          <div style={{ backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', background:bg, borderRadius:'20px', padding:'28px', color:tc, boxShadow:'0 20px 60px rgba(0,0,0,0.5)', minHeight:'230px', display:'flex', flexDirection:'column', justifyContent:'space-between', fontFamily:fontCss }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'16px' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.14em', opacity:0.35, textTransform:'uppercase', marginBottom:'14px' }}>VYNK</div>
                <div style={{ fontSize:'24px', fontWeight:700, lineHeight:1.2, marginBottom:'4px' }}>{card.fullName}</div>
                <div style={{ fontSize:'13px', opacity:0.7 }}>{[card.title,card.company].filter(Boolean).join(' · ')}</div>
                {card.tagline && <div style={{ fontSize:'11px', opacity:0.55, marginTop:'10px', lineHeight:1.6 }}>{card.tagline}</div>}
              </div>
              <div style={{ width:'60px', height:'60px', borderRadius:'50%', overflow:'hidden', border:'2px solid rgba(255,255,255,0.25)', flexShrink:0, background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:700 }}>
                {card.photoUrl ? <img src={card.photoUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : initials}
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginTop:'20px' }}>
              <div>
                {card.email   && <div style={{ fontSize:'11px', opacity:0.6, marginBottom:'2px' }}>{card.email}</div>}
                {card.website && <div style={{ fontSize:'11px', opacity:0.45 }}>{card.website.replace(/^https?:\/\//,'')}</div>}
              </div>
              {card.logoUrl && <img src={card.logoUrl} alt="logo" style={{ height:'28px', objectFit:'contain', opacity:0.85 }} />}
            </div>
          </div>

          {/* BACK */}
          <div style={{ backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', transform:'rotateY(180deg)', position:'absolute', top:0, left:0, right:0, bottom:0, background:bg, borderRadius:'20px', padding:'28px', color:tc, minHeight:'230px', display:'flex', flexDirection:'column', gap:'14px', filter:'brightness(0.88)', fontFamily:fontCss }}>
            <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.14em', opacity:0.35, textTransform:'uppercase' }}>VYNK · SERVICES</div>
            {card.services && card.services.length > 0 && (
              <div>
                <div style={{ fontSize:'10px', opacity:0.45, marginBottom:'7px', textTransform:'uppercase', letterSpacing:'0.08em' }}>What I do</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                  {card.services.map((s:string) => (
                    <span key={s} style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'10px', fontWeight:600, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            {card.bio && <div style={{ fontSize:'11px', opacity:0.65, lineHeight:1.6 }}>{card.bio}</div>}
            {socials.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'auto' }}>
                {socials.slice(0,7).map(s => (
                  <a key={s.l} href={s.url} target="_blank" rel="noopener noreferrer"
                    style={{ width:'32px', height:'32px', borderRadius:'8px', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:700, color:tc, textDecoration:'none' }}
                    onClick={e=>e.stopPropagation()}>
                    {s.l.slice(0,2)}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save to Contacts — PRIMARY CTA */}
      <a href={vcfUri} download={dlName}
        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', width:'100%', maxWidth:'400px', padding:'16px', background:'linear-gradient(135deg,#d4a843,#e8c96a)', color:'#0a0a0a', borderRadius:'16px', fontWeight:700, fontSize:'16px', textDecoration:'none', marginBottom:'12px', boxShadow:'0 8px 32px rgba(212,168,67,0.35)', fontFamily:fontCss }}>
        👤 Save to Contacts
      </a>

      {/* Social links grid */}
      {socials.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:'8px', width:'100%', maxWidth:'400px', marginBottom:'16px' }}>
          {socials.map(s => (
            <a key={s.l} href={s.url} target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'10px 8px', borderRadius:'12px', background:s.c, color:'#fff', fontWeight:600, fontSize:'12px', textDecoration:'none', fontFamily:fontCss }}>
              {s.l}
            </a>
          ))}
        </div>
      )}

      {/* Vynk branding */}
      <div style={{ textAlign:'center', marginTop:'8px' }}>
        <a href="https://vynk.app" style={{ fontSize:'10px', color:'#3a3a4a', letterSpacing:'0.08em', textDecoration:'none' }}>
          Powered by <span style={{ color:'#d4a843', fontWeight:700 }}>VYNK</span> · Make every introduction smart
        </a>
      </div>

      {/* Flip script */}
      <script dangerouslySetInnerHTML={{ __html:`(function(){var f=document.getElementById('flipper');if(f)f.addEventListener('click',function(){f.style.transform=f.style.transform==='rotateY(180deg)'?'rotateY(0deg)':'rotateY(180deg)';});})();` }} />
    </main>
  )
}
