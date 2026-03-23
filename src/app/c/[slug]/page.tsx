import { notFound } from 'next/navigation'
import { db } from '@/db'
import { cards, users, cardViews } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

const SOCIAL_ICONS: Record<string,string> = {
  instagram:'IG', linkedin:'LI', twitter:'TW', telegram:'TG',
  tiktok:'TK', youtube:'YT', whatsapp:'WA', website:'WEB',
}
const SOCIAL_URLS: Record<string,string> = {
  instagram:'https://instagram.com/', linkedin:'https://linkedin.com/in/',
  twitter:'https://twitter.com/', telegram:'https://t.me/',
  tiktok:'https://tiktok.com/@', youtube:'https://youtube.com/@',
  whatsapp:'https://wa.me/', website:'',
}

export default async function CardPage({ params }:{ params: Promise<{slug:string}> }) {
  const { slug } = await params
  const [card] = await db.select().from(cards).where(eq(cards.slug, slug)).limit(1)
  if (!card || card.status !== 'active') notFound()

  const design = (card.design as any) || {}
  const bg      = design.bg      || '#0D0F12'
  const bg2     = design.bg2     || '#1a1a24'
  const text    = design.textColor || '#BFC3C9'
  const accent  = design.accent  || '#D4A84F'
  const mode    = design.mode    || 'gradient'
  const font    = design.font    || 'dm'
  const tpl     = design.template || 'vynk-dark'

  const cardBg = mode==='gradient' ? `linear-gradient(135deg,${bg},${bg2})` : bg
  const fontMap: Record<string,string> = {
    dm:"'DM Sans',sans-serif", syne:"'Syne',sans-serif",
    playfair:"'Playfair Display',serif", cormorant:"'Cormorant Garamond',serif",
    bebas:"'Bebas Neue',cursive", josefin:"'Josefin Sans',sans-serif",
  }
  const fontCss = fontMap[font] || fontMap.dm

  // Log view
  try {
    const h = await headers()
    const ip = h.get('x-forwarded-for')?.split(',')[0]||'unknown'
    const ua = h.get('user-agent')||''
    const device = /mobile/i.test(ua)?'mobile':'desktop'
    await db.insert(cardViews).values({ cardId:card.id, device, source:'direct' })
  } catch {}

  const socials = ['whatsapp','instagram','linkedin','twitter','telegram','tiktok','youtube'] as const
  const hasSocials = socials.some(k => !!(card as any)[k])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=Playfair+Display:wght@400;600;700&family=Cormorant+Garamond:wght@400;600;700&family=Bebas+Neue&family=Josefin+Sans:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#0D0F12;font-family:${fontCss};min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:20px}
        .card-wrap{width:100%;max-width:420px;perspective:1200px}
        .card-inner{position:relative;transform-style:preserve-3d;transition:transform .7s cubic-bezier(0.23,1,0.32,1);cursor:pointer;border-radius:24px}
        .card-inner.flipped{transform:rotateY(180deg)}
        .face{backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:24px;overflow:hidden;min-height:260px}
        .back-face{transform:rotateY(180deg);position:absolute;top:0;left:0;right:0;bottom:0;filter:brightness(0.88)}
        .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:14px 20px;border-radius:14px;font-family:${fontCss};font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;transition:all .2s;border:none}
        .vcard-btn{background:linear-gradient(135deg,#D4A84F,#E8C06A,#A07830);color:#050607;box-shadow:3px 3px 12px #08090B,0 0 18px rgba(212,168,79,0.2)}
        .social-btn{background:#0D0F12;color:#BFC3C9;box-shadow:3px 3px 8px #08090B,-2px -2px 6px #141720;font-size:11px;padding:10px 14px;border-radius:10px}
        .social-btn:hover{color:#D4A84F}
        .nm-panel{background:#0D0F12;box-shadow:5px 5px 14px #08090B,-3px -3px 10px #141720;border-radius:18px;padding:20px;border:1px solid rgba(255,255,255,0.03)}
        .pill{padding:5px 14px;border-radius:20px;font-size:11px;font-weight:600;display:inline-block}
        @media(max-width:500px){body{padding:12px}.btn{font-size:13px;padding:12px 16px}}
      `}</style>

      <main style={{width:'100%',maxWidth:'460px',display:'flex',flexDirection:'column',gap:'20px',alignItems:'center'}}>

        {/* CARD */}
        <div className="card-wrap" id="cardWrap">
          <div className="card-inner" id="cardInner" onClick={() => {
            // client-side flip handled by inline script below
          }}>

            {/* FRONT */}
            <div className="face" style={{background:cardBg,padding:'32px',color:text,position:'relative',fontFamily:fontCss}}>
              {/* Accent line top */}
              <div style={{position:'absolute',top:0,left:'32px',right:'32px',height:'2px',background:`linear-gradient(90deg,transparent,${accent},transparent)`,opacity:.5}}/>

              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'16px'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:'9px',fontWeight:700,letterSpacing:'.14em',opacity:.3,textTransform:'uppercase',marginBottom:'18px',color:accent}}>VYNK</div>
                  <h1 style={{fontSize:'26px',fontWeight:700,lineHeight:1.15,marginBottom:'6px',fontFamily:fontCss}}>{card.fullName}</h1>
                  {(card.title||card.company)&&(
                    <p style={{fontSize:'13px',opacity:.7,marginBottom:'6px'}}>{[card.title,card.company].filter(Boolean).join(' · ')}</p>
                  )}
                  {card.tagline&&<p style={{fontSize:'11px',opacity:.5,lineHeight:1.65,maxWidth:'240px'}}>{card.tagline}</p>}
                </div>
                {card.photoUrl ? (
                  <div style={{width:'64px',height:'64px',borderRadius:'50%',overflow:'hidden',border:`2px solid ${accent}50`,flexShrink:0}}>
                    <img src={card.photoUrl} alt={card.fullName} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  </div>
                ) : (
                  <div style={{width:'56px',height:'56px',borderRadius:'50%',background:`${accent}18`,border:`2px solid ${accent}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:700,color:accent,flexShrink:0}}>
                    {card.fullName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                )}
              </div>

              <div style={{marginTop:'24px'}}>
                {card.email&&<div style={{fontSize:'11px',opacity:.55,marginBottom:'3px'}}>{card.email}</div>}
                {card.website&&<div style={{fontSize:'11px',opacity:.35}}>{card.website.replace(/^https?:\/\//,'')}</div>}
              </div>

              {card.logoUrl&&(
                <div style={{position:'absolute',bottom:'28px',right:'28px'}}>
                  <img src={card.logoUrl} alt="logo" style={{height:'28px',objectFit:'contain',opacity:.8}}/>
                </div>
              )}

              {/* Accent line bottom */}
              <div style={{position:'absolute',bottom:0,left:'32px',right:'32px',height:'1px',background:`linear-gradient(90deg,${accent}60,transparent)`,opacity:.6}}/>
            </div>

            {/* BACK */}
            <div className="face back-face" style={{background:cardBg,padding:'32px',color:text,fontFamily:fontCss}}>
              <div style={{fontSize:'9px',fontWeight:700,letterSpacing:'.14em',opacity:.3,textTransform:'uppercase',marginBottom:'16px',color:accent}}>VYNK · SERVICES</div>
              {card.services&&card.services.length>0&&(
                <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'14px'}}>
                  {card.services.map((s:string)=>(
                    <span key={s} className="pill" style={{background:`${accent}18`,border:`1px solid ${accent}35`,color:accent}}>{s}</span>
                  ))}
                </div>
              )}
              {card.bio&&<p style={{fontSize:'12px',opacity:.65,lineHeight:1.75,marginBottom:'16px'}}>{card.bio}</p>}
              {hasSocials&&(
                <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginTop:'auto'}}>
                  {socials.filter(k=>!!(card as any)[k]).map(k=>(
                    <a key={k} href={`${SOCIAL_URLS[k]}${(card as any)[k]}`} target="_blank" rel="noopener"
                      style={{width:'34px',height:'34px',borderRadius:'9px',background:`${accent}15`,border:`1px solid ${accent}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:700,color:accent,textDecoration:'none'}}>
                      {SOCIAL_ICONS[k]}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Flip hint */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginTop:'12px'}}>
            <div style={{width:'28px',height:'1px',background:`rgba(212,168,79,0.2)`}}/>
            <span style={{fontSize:'10px',color:'#6F737A',letterSpacing:'.06em'}}>tap to flip</span>
            <div style={{width:'28px',height:'1px',background:`rgba(212,168,79,0.2)`}}/>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="nm-panel" style={{width:'100%'}}>
          <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
            {card.phone&&(
              <a href={`tel:${card.phone}`} className="btn social-btn">📞 Call</a>
            )}
            {card.whatsapp&&(
              <a href={`https://wa.me/${card.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener" className="btn social-btn">💬 WhatsApp</a>
            )}
            {card.email&&(
              <a href={`mailto:${card.email}`} className="btn social-btn">✉️ Email</a>
            )}
            <a href={`/api/cards/vcard?slug=${slug}`} className="btn vcard-btn" style={{marginLeft:'auto'}}>
              ⬇ Save Contact
            </a>
          </div>
        </div>

        {/* SHARE */}
        <div className="nm-panel" style={{width:'100%'}}>
          <div style={{fontSize:'10px',color:'#6F737A',fontWeight:600,letterSpacing:'.07em',textTransform:'uppercase',marginBottom:'12px'}}>Share this card</div>
          <div style={{display:'flex',gap:'8px'}}>
            <input readOnly value={`${process.env.NEXT_PUBLIC_APP_URL}/c/${slug}`}
              style={{flex:1,padding:'9px 12px',background:'#0D0F12',boxShadow:'inset 2px 2px 6px #08090B,inset -2px -2px 5px #141720',border:'1px solid rgba(255,255,255,0.04)',borderRadius:'10px',color:'#BFC3C9',fontSize:'12px',fontFamily:"'DM Sans',sans-serif",outline:'none'}}/>
            <button onClick={undefined} id="copyBtn"
              style={{padding:'9px 16px',background:'#0D0F12',boxShadow:'3px 3px 8px #08090B,-2px -2px 6px #141720',border:'1px solid rgba(212,168,79,0.08)',borderRadius:'10px',color:'#D4A84F',fontSize:'12px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
              Copy
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{textAlign:'center',fontSize:'10px',color:'#6F737A',opacity:.5}}>
          Powered by <span style={{color:'#D4A84F',fontWeight:700}}>Vynk</span> · Smart Digital Cards
        </div>
      </main>

      {/* Client-side scripts */}
      <script dangerouslySetInnerHTML={{__html:`
        // Flip card
        document.getElementById('cardInner').addEventListener('click', function() {
          this.classList.toggle('flipped');
        });
        // Copy link
        document.getElementById('copyBtn').addEventListener('click', function() {
          navigator.clipboard.writeText('${process.env.NEXT_PUBLIC_APP_URL}/c/${slug}');
          this.textContent = '✓ Copied!';
          setTimeout(() => this.textContent = 'Copy', 2000);
        });
      `}}/>
    </>
  )
}
