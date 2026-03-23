'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FIELD_LABELS, requiresPayment } from '@/lib/rules'

const C = {
  g:'#0D0F12', gold:'#D4A84F', goldLt:'#E8C06A', goldDk:'#A07830',
  silver:'#BFC3C9', smoke:'#6F737A', carbon:'#050607',
  nd:'#08090B', nl:'#141720',
}
const raised   = `5px 5px 14px ${C.nd}, -3px -3px 10px ${C.nl}`
const raisedSm = `3px 3px 8px ${C.nd}, -2px -2px 6px ${C.nl}`
const insetSm  = `inset 2px 2px 6px ${C.nd}, inset -2px -2px 5px ${C.nl}`
const goldBox  = `4px 4px 14px ${C.nd}, -2px -2px 8px ${C.nl}, 0 0 22px rgba(212,168,79,0.2)`

// ── Card templates ─────────────────────────────────────────────
const TEMPLATES = [
  { id:'minimal',   label:'Minimal',    bg:'#0D0F12', bg2:'#1a1a24', textColor:'#BFC3C9', accent:'#D4A84F', mode:'gradient' },
  { id:'gold',      label:'Gold',       bg:'#1a0e00', bg2:'#3d2200', textColor:'#f5e6c8', accent:'#D4A84F', mode:'gradient' },
  { id:'midnight',  label:'Midnight',   bg:'#0a0a1a', bg2:'#1a1a3e', textColor:'#e8e8f0', accent:'#6366f1', mode:'gradient' },
  { id:'forest',    label:'Forest',     bg:'#022c22', bg2:'#064e3b', textColor:'#ecfdf5', accent:'#4ade80', mode:'gradient' },
  { id:'royal',     label:'Royal',      bg:'#1e1b4b', bg2:'#312e81', textColor:'#ede9fe', accent:'#a78bfa', mode:'gradient' },
  { id:'ocean',     label:'Ocean',      bg:'#0f172a', bg2:'#1e3a5f', textColor:'#e2e8f0', accent:'#38bdf8', mode:'gradient' },
  { id:'carbon',    label:'Carbon',     bg:'#050607', bg2:'#111118', textColor:'#BFC3C9', accent:'#D4A84F', mode:'gradient' },
  { id:'rose',      label:'Rose',       bg:'#1a0010', bg2:'#3d0020', textColor:'#fce7f3', accent:'#f472b6', mode:'gradient' },
  { id:'pure-dark', label:'Pure Dark',  bg:'#000000', bg2:'#111111', textColor:'#ffffff', accent:'#D4A84F', mode:'solid' },
  { id:'pure-light',label:'Pure Light', bg:'#ffffff', bg2:'#f1f5f9', textColor:'#0f172a', accent:'#D4A84F', mode:'solid' },
]

const FONTS = [
  { id:'dm',        name:'DM Sans',    css:"'DM Sans',sans-serif" },
  { id:'syne',      name:'Syne',       css:"'Syne',sans-serif" },
  { id:'playfair',  name:'Playfair',   css:"'Playfair Display',serif" },
  { id:'cormorant', name:'Cormorant',  css:"'Cormorant Garamond',serif" },
  { id:'bebas',     name:'Bebas Neue', css:"'Bebas Neue',cursive" },
  { id:'josefin',   name:'Josefin',    css:"'Josefin Sans',sans-serif" },
]

type Form = {
  fullName:string;title:string;company:string;photoUrl:string;logoUrl:string;
  phone:string;whatsapp:string;email:string;tagline:string;bio:string;
  services:string;telegram:string;instagram:string;linkedin:string;
  twitter:string;tiktok:string;youtube:string;website:string;address:string;
}
type Design = { template:string;font:string;mode:string;bg:string;bg2:string;textColor:string;accent:string }

const INIT_FORM: Form = {
  fullName:'',title:'',company:'',photoUrl:'',logoUrl:'',phone:'',whatsapp:'',
  email:'',tagline:'',bio:'',services:'',telegram:'',instagram:'',linkedin:'',
  twitter:'',tiktok:'',youtube:'',website:'',address:'',
}
const INIT_DESIGN: Design = {
  template:'minimal',font:'dm',mode:'gradient',
  bg:'#0D0F12',bg2:'#1a1a24',textColor:'#BFC3C9',accent:'#D4A84F',
}

const nmInp:React.CSSProperties = {
  width:'100%', padding:'9px 12px',
  background:C.g, boxShadow:insetSm,
  border:'1px solid rgba(255,255,255,0.04)',
  borderRadius:'10px', color:C.silver,
  fontFamily:"'DM Sans',sans-serif", fontSize:'13px', outline:'none',
}
const lbl:React.CSSProperties = {
  display:'block', fontSize:'10px', color:C.smoke,
  marginBottom:'5px', fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase' as const,
}
const sec:React.CSSProperties = {
  fontSize:'9px', fontWeight:700, letterSpacing:'.1em',
  textTransform:'uppercase' as const, color:C.smoke,
  marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px',
}

export default function BuilderPage() {
  const router = useRouter()
  const photoRef = useRef<HTMLInputElement>(null)
  const logoRef  = useRef<HTMLInputElement>(null)
  const [form, setForm]             = useState<Form>(INIT_FORM)
  const [design, setDesign]         = useState<Design>(INIT_DESIGN)
  const [originalForm, setOriginal] = useState<Form|null>(null)
  const [existingCard, setExisting] = useState<any>(null)
  const [isFlipped, setIsFlipped]   = useState(false)
  const [promoCode, setPromoCode]   = useState('')
  const [promoValid, setPromoValid] = useState<boolean|null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [paidChanges, setPaidChanges] = useState<string[]>([])

  useEffect(()=>{
    fetch('/api/cards').then(r=>r.json()).then(d=>{
      if(!d.card) return
      setExisting(d.card)
      const c=d.card
      const f:Form={
        fullName:c.fullName||'',title:c.title||'',company:c.company||'',
        photoUrl:c.photoUrl||'',logoUrl:c.logoUrl||'',phone:c.phone||'',
        whatsapp:c.whatsapp||'',email:c.email||'',tagline:c.tagline||'',
        bio:c.bio||'',services:(c.services||[]).join(', '),
        telegram:c.telegram||'',instagram:c.instagram||'',linkedin:c.linkedin||'',
        twitter:c.twitter||'',tiktok:c.tiktok||'',youtube:c.youtube||'',
        website:c.website||'',address:c.address||'',
      }
      setForm(f); setOriginal(f)
      if(c.design) setDesign(c.design)
    }).catch(()=>{})
  },[])

  const set  = (k:keyof Form,v:string)   => setForm(f=>({...f,[k]:v}))
  const setD = (k:keyof Design,v:string) => setDesign(d=>({...d,[k]:v}))

  function applyTemplate(t:typeof TEMPLATES[0]) {
    setDesign(d=>({...d, template:t.id, bg:t.bg, bg2:t.bg2, textColor:t.textColor, accent:t.accent, mode:t.mode}))
  }

  function handleFile(e:React.ChangeEvent<HTMLInputElement>,field:'photoUrl'|'logoUrl'){
    const file=e.target.files?.[0]; if(!file) return
    if(file.size>5*1024*1024){toast.error('Image must be under 5MB');return}
    const reader=new FileReader()
    reader.onload=ev=>set(field,ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function validatePromo(){
    if(!promoCode.trim()) return
    const res=await fetch(`/api/promos/validate?code=${promoCode.trim()}`)
    const data=await res.json()
    setPromoValid(data.valid)
    data.valid?toast.success('Promo applied!'):toast.error(data.error||'Invalid code')
  }

  async function submit(confirmed=false){
    if(!form.fullName.trim()){toast.error('Full name is required');return}
    if(existingCard&&!confirmed&&originalForm){
      const changed=(Object.keys(form) as(keyof Form)[]).filter(k=>form[k]!==originalForm[k])
      const paid=changed.filter(k=>requiresPayment([k]))
      if(paid.length>0){setPaidChanges(paid);setShowWarning(true);return}
    }
    setSubmitting(true)
    try{
      const res=await fetch('/api/cards',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          ...form,
          services:form.services.split(',').map(s=>s.trim()).filter(Boolean),
          design,
          promoCode:promoValid?promoCode:undefined,
        })
      })
      const data=await res.json()
      if(!res.ok) throw new Error(data.error||'Something went wrong')
      if(data.free){toast.success('Card published!');router.push(`/c/${data.slug}`)}
      else if(data.url){window.location.href=data.url}
    }catch(e:any){toast.error(e.message)}
    finally{setSubmitting(false)}
  }

  const cardBg  = design.mode==='gradient'
    ? `linear-gradient(135deg,${design.bg},${design.bg2})`
    : design.bg
  const fontCss = FONTS.find(f=>f.id===design.font)?.css||FONTS[0].css
  const initials = form.fullName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()||'YN'

  return (
    <div style={{minHeight:'100dvh',background:C.g,display:'flex',flexDirection:'column',fontFamily:"'DM Sans',sans-serif"}}>

      {/* ── NAV ── */}
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 24px',background:C.g,boxShadow:`0 4px 16px ${C.nd}`,borderBottom:'1px solid rgba(255,255,255,0.03)',flexShrink:0,zIndex:10}}>
        <div style={{padding:'10px 16px',background:C.g,boxShadow:raised,borderRadius:'14px',border:'1px solid rgba(212,168,79,0.07)',display:'inline-flex',alignItems:'center',justifyContent:'center'}}>
          <img src="/logo.png" alt="Vynk" style={{width:'100%',height:'auto',display:'block',maxWidth:'90px'}}/>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          {existingCard&&(
            <Link href={`/c/${existingCard.slug}`} style={{fontSize:'12px',color:C.smoke,textDecoration:'none',padding:'8px 14px',background:C.g,boxShadow:raisedSm,borderRadius:'10px',border:'1px solid rgba(255,255,255,0.03)'}}>
              View my card →
            </Link>
          )}
          <div style={{fontSize:'12px',color:C.smoke,padding:'8px 14px',background:C.g,boxShadow:insetSm,borderRadius:'10px'}}>
            Card Builder
          </div>
        </div>
      </nav>

      {/* ── WARNING MODAL ── */}
      {showWarning&&(
        <div style={{position:'fixed',inset:0,background:'rgba(5,6,7,0.85)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <div style={{background:C.g,boxShadow:`14px 14px 36px ${C.nd}, -8px -8px 24px ${C.nl}`,borderRadius:'24px',padding:'36px',maxWidth:'420px',width:'100%',border:'1px solid rgba(212,168,79,0.08)'}}>
            <div style={{fontSize:'28px',marginBottom:'12px'}}>⚠️</div>
            <h2 style={{fontSize:'16px',fontWeight:700,marginBottom:'8px',color:C.silver,fontFamily:"'Syne',sans-serif"}}>Identity change detected</h2>
            <p style={{color:C.smoke,fontSize:'13px',marginBottom:'20px',lineHeight:1.7}}>
              You changed: <span style={{color:C.gold,fontWeight:600}}>{paidChanges.map(k=>FIELD_LABELS[k]||k).join(', ')}</span>
              <br/><br/>Your current card will be <strong style={{color:C.silver}}>permanently archived</strong> and a new one published. This costs <strong style={{color:C.gold}}>$10</strong>.
            </p>
            <div style={{display:'flex',gap:'12px'}}>
              <button onClick={()=>{setShowWarning(false);setPaidChanges([])}}
                style={{flex:1,padding:'12px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(255,255,255,0.04)',borderRadius:'12px',color:C.smoke,fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                Cancel
              </button>
              <button onClick={()=>{setShowWarning(false);submit(true)}}
                style={{flex:1,padding:'12px',background:`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`,color:C.carbon,borderRadius:'12px',fontSize:'13px',fontWeight:700,border:'none',cursor:'pointer',boxShadow:goldBox,fontFamily:"'DM Sans',sans-serif"}}>
                Pay $10 & update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN LAYOUT ── */}
      <div style={{flex:1,display:'flex',overflow:'hidden'}}>

        {/* LEFT — Form */}
        <aside style={{width:'340px',flexShrink:0,background:C.g,boxShadow:`4px 0 16px ${C.nd}`,borderRight:'1px solid rgba(255,255,255,0.03)',overflowY:'auto',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'20px',display:'flex',flexDirection:'column',gap:'20px'}}>

            {/* FRONT */}
            <div>
              <div style={sec}>
                <div style={{width:'20px',height:'1px',background:C.gold}}/>
                Front — Identity
                <span style={{color:C.gold,fontSize:'9px'}}>($10 to change)</span>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                <div><label style={lbl}>Full Name *</label><input style={nmInp} placeholder="Alexandra Reyes" value={form.fullName} onChange={e=>set('fullName',e.target.value)}/></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                  <div><label style={lbl}>Title</label><input style={nmInp} placeholder="CEO" value={form.title} onChange={e=>set('title',e.target.value)}/></div>
                  <div><label style={lbl}>Company</label><input style={nmInp} placeholder="Acme" value={form.company} onChange={e=>set('company',e.target.value)}/></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                  <div><label style={lbl}>Phone</label><input style={nmInp} placeholder="+1 555 0100" value={form.phone} onChange={e=>set('phone',e.target.value)}/></div>
                  <div><label style={lbl}>WhatsApp</label><input style={nmInp} placeholder="15550100" value={form.whatsapp} onChange={e=>set('whatsapp',e.target.value)}/></div>
                </div>
                <div><label style={lbl}>Email</label><input style={nmInp} placeholder="you@email.com" value={form.email} onChange={e=>set('email',e.target.value)}/></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                  <div>
                    <label style={lbl}>Photo</label>
                    <button onClick={()=>photoRef.current?.click()} style={{width:'100%',padding:'9px',background:C.g,boxShadow:form.photoUrl?insetSm:raisedSm,border:`1px solid ${form.photoUrl?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,borderRadius:'10px',color:form.photoUrl?C.gold:C.smoke,fontSize:'11px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                      {form.photoUrl?'✓ Photo':'Upload'}
                    </button>
                    <input ref={photoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e,'photoUrl')}/>
                  </div>
                  <div>
                    <label style={lbl}>Logo</label>
                    <button onClick={()=>logoRef.current?.click()} style={{width:'100%',padding:'9px',background:C.g,boxShadow:form.logoUrl?insetSm:raisedSm,border:`1px solid ${form.logoUrl?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,borderRadius:'10px',color:form.logoUrl?C.gold:C.smoke,fontSize:'11px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                      {form.logoUrl?'✓ Logo':'Upload'}
                    </button>
                    <input ref={logoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e,'logoUrl')}/>
                  </div>
                </div>
              </div>
            </div>

            {/* BACK */}
            <div>
              <div style={sec}>
                <div style={{width:'20px',height:'1px',background:'#4ade80'}}/>
                Back — Content
                <span style={{color:'#4ade80',fontSize:'9px'}}>(free)</span>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                <div><label style={lbl}>Tagline</label><input style={nmInp} placeholder="We craft brands that move people." value={form.tagline} onChange={e=>set('tagline',e.target.value)}/></div>
                <div><label style={lbl}>Bio</label><textarea style={{...nmInp,height:'64px',resize:'none' as const,lineHeight:1.5}} value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="Brief description..."/></div>
                <div><label style={lbl}>Services (comma-separated)</label><input style={nmInp} placeholder="Branding, Strategy, UX" value={form.services} onChange={e=>set('services',e.target.value)}/></div>
                <div><label style={lbl}>Website</label><input style={nmInp} placeholder="yoursite.com" value={form.website} onChange={e=>set('website',e.target.value)}/></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                  {(['instagram','linkedin','twitter','telegram','tiktok','youtube'] as const).map(k=>(
                    <div key={k}><label style={lbl}>{k.charAt(0).toUpperCase()+k.slice(1)}</label><input style={nmInp} placeholder="@handle" value={form[k]} onChange={e=>set(k,e.target.value)}/></div>
                  ))}
                </div>
              </div>
            </div>

            {/* DESIGN */}
            <div>
              <div style={sec}>
                <div style={{width:'20px',height:'1px',background:'#a78bfa'}}/>
                Design
                <span style={{color:'#a78bfa',fontSize:'9px'}}>(always free)</span>
              </div>

              {/* Templates */}
              <label style={lbl}>Templates</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'6px',marginBottom:'14px'}}>
                {TEMPLATES.map(t=>(
                  <button key={t.id} title={t.label} onClick={()=>applyTemplate(t)}
                    style={{
                      height:'36px', borderRadius:'10px', cursor:'pointer',
                      background:t.mode==='gradient'?`linear-gradient(135deg,${t.bg},${t.bg2})`:t.bg,
                      border:`2px solid ${design.template===t.id?C.gold:'rgba(255,255,255,0.06)'}`,
                      boxShadow:design.template===t.id?`0 0 0 1px ${C.gold}, ${goldBox}`:raisedSm,
                      transition:'all .15s', position:'relative', overflow:'hidden',
                    }}>
                    <div style={{position:'absolute',bottom:'3px',right:'4px',width:'6px',height:'6px',borderRadius:'50%',background:t.accent,opacity:.8}}/>
                  </button>
                ))}
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'4px',marginBottom:'14px'}}>
                {TEMPLATES.map(t=>(
                  <button key={t.id} onClick={()=>applyTemplate(t)}
                    style={{padding:'4px 10px',borderRadius:'20px',border:'none',background:design.template===t.id?`rgba(212,168,79,0.12)`:'rgba(255,255,255,0.04)',color:design.template===t.id?C.gold:C.smoke,fontSize:'10px',fontWeight:design.template===t.id?700:400,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .15s'}}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Fonts */}
              <label style={lbl}>Font</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px',marginBottom:'14px'}}>
                {FONTS.map(f=>(
                  <button key={f.id} onClick={()=>setD('font',f.id)}
                    style={{fontFamily:f.css,padding:'8px 4px',borderRadius:'10px',background:C.g,boxShadow:design.font===f.id?insetSm:raisedSm,border:`1px solid ${design.font===f.id?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,color:design.font===f.id?C.gold:C.smoke,fontSize:'11px',fontWeight:600,cursor:'pointer',transition:'all .15s',outline:'none'}}>
                    {f.name}
                  </button>
                ))}
              </div>

              {/* Mode */}
              <label style={lbl}>Background mode</label>
              <div style={{display:'flex',gap:'6px',marginBottom:'14px'}}>
                {['solid','gradient'].map(m=>(
                  <button key={m} onClick={()=>setD('mode',m)}
                    style={{flex:1,padding:'8px',borderRadius:'10px',background:C.g,boxShadow:design.mode===m?insetSm:raisedSm,border:`1px solid ${design.mode===m?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,color:design.mode===m?C.gold:C.smoke,fontSize:'12px',fontWeight:600,cursor:'pointer',textTransform:'capitalize' as const,transition:'all .15s',outline:'none'}}>
                    {m}
                  </button>
                ))}
              </div>

              {/* Colors */}
              <label style={lbl}>Custom colors</label>
              <div style={{display:'grid',gridTemplateColumns:design.mode==='gradient'?'1fr 1fr 1fr 1fr':'1fr 1fr 1fr',gap:'8px',marginBottom:'8px'}}>
                <div><label style={{...lbl,fontSize:'9px'}}>BG</label><input type="color" value={design.bg} onChange={e=>setD('bg',e.target.value)} style={{width:'100%',height:'32px',borderRadius:'8px',border:'none',background:C.g,boxShadow:raisedSm,cursor:'pointer',padding:'2px'}}/></div>
                {design.mode==='gradient'&&<div><label style={{...lbl,fontSize:'9px'}}>BG2</label><input type="color" value={design.bg2} onChange={e=>setD('bg2',e.target.value)} style={{width:'100%',height:'32px',borderRadius:'8px',border:'none',background:C.g,boxShadow:raisedSm,cursor:'pointer',padding:'2px'}}/></div>}
                <div><label style={{...lbl,fontSize:'9px'}}>Text</label><input type="color" value={design.textColor} onChange={e=>setD('textColor',e.target.value)} style={{width:'100%',height:'32px',borderRadius:'8px',border:'none',background:C.g,boxShadow:raisedSm,cursor:'pointer',padding:'2px'}}/></div>
                <div><label style={{...lbl,fontSize:'9px'}}>Accent</label><input type="color" value={design.accent||C.gold} onChange={e=>setD('accent',e.target.value)} style={{width:'100%',height:'32px',borderRadius:'8px',border:'none',background:C.g,boxShadow:raisedSm,cursor:'pointer',padding:'2px'}}/></div>
              </div>
            </div>

            {/* PROMO */}
            <div>
              <label style={lbl}>Promo code</label>
              <div style={{display:'flex',gap:'8px'}}>
                <input style={{...nmInp,flex:1}} placeholder="VYNK50" value={promoCode} onChange={e=>setPromoCode(e.target.value.toUpperCase())}/>
                <button onClick={validatePromo} style={{padding:'9px 14px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(255,255,255,0.04)',borderRadius:'10px',color:C.smoke,fontSize:'12px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",whiteSpace:'nowrap'}}>Apply</button>
              </div>
              {promoValid===true&&<p style={{fontSize:'11px',color:'#4ade80',marginTop:'5px'}}>✓ Promo applied!</p>}
              {promoValid===false&&<p style={{fontSize:'11px',color:'#ef4444',marginTop:'5px'}}>Invalid or expired code</p>}
            </div>

            {/* SUBMIT */}
            <div>
              <button onClick={()=>submit()} disabled={submitting}
                style={{width:'100%',padding:'15px',background:`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`,color:C.carbon,borderRadius:'14px',fontWeight:700,fontSize:'15px',border:'none',cursor:'pointer',boxShadow:goldBox,opacity:submitting?.6:1,fontFamily:"'DM Sans',sans-serif",transition:'all .15s',marginBottom:'8px'}}>
                {submitting?'Processing…':existingCard?'Update my card':'✨ Generate my card — $20'}
              </button>
              <p style={{fontSize:'11px',color:C.smoke,textAlign:'center' as const,opacity:.7}}>
                {existingCard?'Free changes save instantly · Identity changes cost $10':'One-time $20 · Colors & content free forever'}
              </p>
            </div>

          </div>
        </aside>

        {/* RIGHT — Preview */}
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:`radial-gradient(ellipse 60% 60% at 50% 50%, rgba(212,168,79,0.04) 0%, transparent 70%)`,padding:'40px',gap:'20px',overflowY:'auto'}}>

          <p style={{fontSize:'10px',color:C.smoke,textTransform:'uppercase' as const,letterSpacing:'.1em'}}>
            Live Preview — click to flip
          </p>

          {/* Card container — neumorphic tray */}
          <div style={{
            background:C.g,
            boxShadow:`12px 12px 32px ${C.nd}, -8px -8px 22px ${C.nl}`,
            borderRadius:'28px',
            padding:'24px',
            border:'1px solid rgba(255,255,255,0.04)',
            width:'100%',
            maxWidth:'520px',
          }}>
            {/* Card flip */}
            <div style={{perspective:'1200px'}}>
              <div
                onClick={()=>setIsFlipped(f=>!f)}
                style={{
                  position:'relative', transformStyle:'preserve-3d',
                  transition:'transform 0.7s cubic-bezier(0.23,1,0.32,1)',
                  transform:isFlipped?'rotateY(180deg)':'rotateY(0deg)',
                  cursor:'pointer', minHeight:'280px',
                  borderRadius:'20px', overflow:'visible',
                }}>

                {/* FRONT */}
                <div style={{
                  backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
                  background:cardBg, borderRadius:'20px', padding:'32px',
                  color:design.textColor, minHeight:'280px',
                  display:'flex', flexDirection:'column', justifyContent:'space-between',
                  fontFamily:fontCss,
                  boxShadow:`0 20px 60px ${C.nd}`,
                }}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'16px'}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'9px',fontWeight:700,letterSpacing:'.14em',opacity:.3,textTransform:'uppercase' as const,marginBottom:'16px',color:design.accent}}>VYNK</div>
                      <div style={{fontSize:'26px',fontWeight:700,lineHeight:1.2,marginBottom:'6px'}}>{form.fullName||'Your Name'}</div>
                      <div style={{fontSize:'13px',opacity:.7,marginBottom:'4px'}}>{[form.title,form.company].filter(Boolean).join(' · ')||'Title · Company'}</div>
                      {form.tagline&&<div style={{fontSize:'11px',opacity:.55,marginTop:'10px',lineHeight:1.6,maxWidth:'260px'}}>{form.tagline}</div>}
                    </div>
                    <div style={{width:'64px',height:'64px',borderRadius:'50%',overflow:'hidden',border:`2px solid ${design.accent}40`,background:'rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',fontWeight:700,flexShrink:0}}>
                      {form.photoUrl?<img src={form.photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:initials}
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginTop:'24px'}}>
                    <div>
                      {form.email&&<div style={{fontSize:'11px',opacity:.6,marginBottom:'2px'}}>{form.email}</div>}
                      {form.website&&<div style={{fontSize:'11px',opacity:.4}}>{form.website.replace(/^https?:\/\//,'')}</div>}
                    </div>
                    {form.logoUrl&&<img src={form.logoUrl} alt="logo" style={{height:'28px',objectFit:'contain',opacity:.85}}/>}
                  </div>
                  {/* Accent line */}
                  <div style={{position:'absolute',bottom:0,left:'32px',right:'32px',height:'2px',background:`linear-gradient(90deg,transparent,${design.accent},transparent)`,opacity:.4,borderRadius:'2px'}}/>
                </div>

                {/* BACK */}
                <div style={{
                  backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
                  transform:'rotateY(180deg)',
                  position:'absolute', top:0, left:0, right:0, bottom:0,
                  background:cardBg, borderRadius:'20px', padding:'32px',
                  color:design.textColor, minHeight:'280px',
                  display:'flex', flexDirection:'column', gap:'14px',
                  filter:'brightness(0.85)', fontFamily:fontCss,
                }}>
                  <div style={{fontSize:'9px',opacity:.3,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase' as const,color:design.accent}}>VYNK · SERVICES</div>
                  {form.services&&(
                    <div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>
                      {form.services.split(',').filter(Boolean).map(s=>(
                        <span key={s} style={{padding:'3px 10px',borderRadius:'20px',fontSize:'10px',fontWeight:600,background:`${design.accent}20`,border:`1px solid ${design.accent}40`,color:design.accent}}>{s.trim()}</span>
                      ))}
                    </div>
                  )}
                  {form.bio&&<div style={{fontSize:'12px',opacity:.65,lineHeight:1.7}}>{form.bio}</div>}
                  <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginTop:'auto'}}>
                    {(['whatsapp','instagram','linkedin','twitter','tiktok','telegram'] as const).filter(k=>form[k]).map(k=>(
                      <span key={k} style={{width:'30px',height:'30px',borderRadius:'8px',background:`${design.accent}15`,border:`1px solid ${design.accent}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:700,color:design.accent}}>
                        {k.slice(0,2).toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Flip hint */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginTop:'16px'}}>
              <div style={{width:'32px',height:'1px',background:`rgba(212,168,79,0.2)`}}/>
              <span style={{fontSize:'10px',color:C.smoke,letterSpacing:'.06em'}}>click to flip</span>
              <div style={{width:'32px',height:'1px',background:`rgba(212,168,79,0.2)`}}/>
            </div>
          </div>

          {/* Template label */}
          <div style={{background:C.g,boxShadow:insetSm,borderRadius:'10px',padding:'8px 16px',fontSize:'11px',color:C.smoke}}>
            Template: <span style={{color:C.gold,fontWeight:600}}>{TEMPLATES.find(t=>t.id===design.template)?.label||'Custom'}</span>
            {existingCard&&<> · Active at <span style={{color:C.gold}}>/c/{existingCard.slug}</span></>}
          </div>

        </div>
      </div>
    </div>
  )
}
