'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { FIELD_LABELS, requiresPayment } from '@/lib/rules'

const NM = {
  bg:'#1a1a24', dark:'#0d0d14', lite:'#27273a',
  gold:'#d4a843', goldLt:'#e8c96a', goldDk:'#a07830',
  text:'#e8e8f0', muted:'#6a6a8a', subtle:'#3a3a52',
}
const raised   = `6px 6px 14px ${NM.dark}, -4px -4px 10px ${NM.lite}`
const raisedSm = `3px 3px 8px ${NM.dark}, -2px -2px 6px ${NM.lite}`
const inset    = `inset 4px 4px 10px ${NM.dark}, inset -3px -3px 8px ${NM.lite}`
const insetSm  = `inset 2px 2px 6px ${NM.dark}, inset -2px -2px 4px ${NM.lite}`
const goldRaised = `4px 4px 12px ${NM.dark}, -2px -2px 8px ${NM.lite}, 0 0 20px rgba(212,168,67,0.18)`

const FONTS = [
  { id:'dm',        name:'DM Sans',    css:"'DM Sans',sans-serif" },
  { id:'syne',      name:'Syne',       css:"'Syne',sans-serif" },
  { id:'playfair',  name:'Playfair',   css:"'Playfair Display',serif" },
  { id:'cormorant', name:'Cormorant',  css:"'Cormorant Garamond',serif" },
  { id:'bebas',     name:'Bebas Neue', css:"'Bebas Neue',cursive" },
  { id:'josefin',   name:'Josefin',    css:"'Josefin Sans',sans-serif" },
]

const PALETTES = [
  { bg:'#1a1a2e', bg2:'#16213e', textColor:'#e8e8f0', mode:'gradient', label:'Midnight' },
  { bg:'#0a0a14', bg2:'#1a1a40', textColor:'#e8e8f0', mode:'gradient', label:'Vynk Dark' },
  { bg:'#1a0a00', bg2:'#3d2200', textColor:'#f5e6c8', mode:'gradient', label:'Gold Night' },
  { bg:'#022c22', bg2:'#064e3b', textColor:'#ecfdf5', mode:'gradient', label:'Forest' },
  { bg:'#1e1b4b', bg2:'#312e81', textColor:'#ede9fe', mode:'gradient', label:'Royal' },
  { bg:'#6366f1', bg2:'#a855f7', textColor:'#fff',    mode:'gradient', label:'Violet' },
  { bg:'#0f172a', bg2:'#1e3a5f', textColor:'#e2e8f0', mode:'gradient', label:'Ocean' },
  { bg:'#d4a843', bg2:'#a07830', textColor:'#0a0a0a', mode:'gradient', label:'Gold' },
  { bg:'#111',    bg2:'#222',    textColor:'#e8e8f0', mode:'solid',    label:'Black' },
  { bg:'#fff',    bg2:'#f1f5f9', textColor:'#0f172a', mode:'solid',    label:'White' },
]

type Form = {
  fullName:string;title:string;company:string;photoUrl:string;logoUrl:string;phone:string;whatsapp:string;email:string;
  tagline:string;bio:string;services:string;telegram:string;instagram:string;linkedin:string;twitter:string;tiktok:string;youtube:string;website:string;address:string;
}
type Design = { template:string;font:string;mode:string;bg:string;bg2:string;textColor:string;accent:string }

const INIT_FORM: Form = { fullName:'',title:'',company:'',photoUrl:'',logoUrl:'',phone:'',whatsapp:'',email:'',tagline:'',bio:'',services:'',telegram:'',instagram:'',linkedin:'',twitter:'',tiktok:'',youtube:'',website:'',address:'' }
const INIT_DESIGN: Design = { template:'circles',font:'dm',mode:'gradient',bg:'#1a1a2e',bg2:'#16213e',textColor:'#e8e8f0',accent:'#d4a843' }

// Neumorphic input style
const nmInp: React.CSSProperties = { width:'100%', padding:'10px 14px', background:NM.bg, boxShadow:insetSm, border:'1px solid rgba(255,255,255,0.03)', borderRadius:'10px', color:NM.text, fontFamily:"'DM Sans',sans-serif", fontSize:'13px', outline:'none' }
const nmLabel: React.CSSProperties = { display:'block', fontSize:'11px', color:NM.muted, marginBottom:'5px', fontWeight:500 }
const nmSection: React.CSSProperties = { fontSize:'10px', fontWeight:700, letterSpacing:'.09em', textTransform:'uppercase' as const, color:NM.muted, marginBottom:'14px' }

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
      const f:Form={fullName:c.fullName||'',title:c.title||'',company:c.company||'',photoUrl:c.photoUrl||'',logoUrl:c.logoUrl||'',phone:c.phone||'',whatsapp:c.whatsapp||'',email:c.email||'',tagline:c.tagline||'',bio:c.bio||'',services:(c.services||[]).join(', '),telegram:c.telegram||'',instagram:c.instagram||'',linkedin:c.linkedin||'',twitter:c.twitter||'',tiktok:c.tiktok||'',youtube:c.youtube||'',website:c.website||'',address:c.address||''}
      setForm(f); setOriginal(f)
      if(c.design) setDesign(c.design)
    }).catch(()=>{})
  },[])

  const set  = (k:keyof Form,v:string)   => setForm(f=>({...f,[k]:v}))
  const setD = (k:keyof Design,v:string) => setDesign(d=>({...d,[k]:v}))

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
    data.valid?toast.success(`Promo applied!`):toast.error(data.error||'Invalid code')
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
      const res=await fetch('/api/cards',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,services:form.services.split(',').map(s=>s.trim()).filter(Boolean),design,promoCode:promoValid?promoCode:undefined})})
      const data=await res.json()
      if(!res.ok) throw new Error(data.error||'Something went wrong')
      if(data.free){toast.success('Card published!');router.push(`/c/${data.slug}`)}
      else if(data.url){window.location.href=data.url}
    }catch(e:any){toast.error(e.message)}
    finally{setSubmitting(false)}
  }

  const cardBg  = design.mode==='gradient'?`linear-gradient(135deg,${design.bg},${design.bg2})`:design.bg
  const fontCss = FONTS.find(f=>f.id===design.font)?.css||FONTS[0].css
  const initials = form.fullName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()||'YN'

  return (
    <main style={{minHeight:'100vh',background:NM.bg,display:'flex',fontFamily:"'DM Sans',sans-serif"}}>

      {/* Warning Modal */}
      {showWarning&&(
        <div style={{position:'fixed',inset:0,background:'rgba(10,10,20,0.85)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <div style={{background:NM.bg,boxShadow:`14px 14px 36px ${NM.dark}, -8px -8px 24px ${NM.lite}`,borderRadius:'28px',padding:'40px 36px',maxWidth:'420px',width:'100%',border:'1px solid rgba(255,255,255,0.04)'}}>
            <div style={{fontSize:'32px',marginBottom:'16px'}}>⚠️</div>
            <h2 style={{fontSize:'17px',fontWeight:700,marginBottom:'10px',color:NM.text}}>Identity change detected</h2>
            <p style={{color:NM.muted,fontSize:'14px',marginBottom:'24px',lineHeight:1.6}}>
              You changed: <span style={{color:NM.gold,fontWeight:500}}>{paidChanges.map(k=>FIELD_LABELS[k]||k).join(', ')}</span>
              <br/><br/>These are core identity fields. Your <strong style={{color:NM.text}}>current card will be permanently archived</strong> and a new one published. This costs <strong style={{color:NM.gold}}>$10</strong>.
            </p>
            <div style={{display:'flex',gap:'12px'}}>
              <button onClick={()=>{setShowWarning(false);setPaidChanges([])}} style={{flex:1,padding:'13px',background:NM.bg,boxShadow:raisedSm,border:'1px solid rgba(255,255,255,0.04)',borderRadius:'14px',color:NM.muted,fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
              <button onClick={()=>{setShowWarning(false);submit(true)}} style={{flex:1,padding:'13px',background:'linear-gradient(135deg,#d4a843,#e8c96a,#a07830)',color:'#0d0d14',borderRadius:'14px',fontSize:'14px',fontWeight:700,border:'none',cursor:'pointer',boxShadow:goldRaised,fontFamily:"'DM Sans',sans-serif"}}>Yes, pay $10 & update</button>
            </div>
          </div>
        </div>
      )}

      {/* Left panel */}
      <aside style={{width:'380px',flexShrink:0,background:NM.bg,boxShadow:`4px 0 20px ${NM.dark}`,overflow:'hidden',display:'flex',flexDirection:'column'}}>
        {/* Header */}
        <div style={{padding:'20px 24px',borderBottom:`1px solid rgba(255,255,255,0.04)`,background:NM.bg,boxShadow:`0 4px 12px ${NM.dark}`,zIndex:10,display:'flex',alignItems:'center',gap:'12px',flexShrink:0}}>
          <Image src="/logo.png" alt="Vynk" width={70} height={22} style={{objectFit:'contain'}}/>
          <div>
            <div style={{fontSize:'13px',fontWeight:700,color:NM.text}}>Card Builder</div>
            <div style={{fontSize:'11px',color:NM.muted}}>Design your digital identity</div>
          </div>
        </div>

        {/* Scrollable form */}
        <div style={{flex:1,overflowY:'auto',padding:'24px'}}>

          {/* FRONT */}
          <div style={{marginBottom:'28px'}}>
            <div style={nmSection}>Front — Identity <span style={{color:NM.gold}}>($10 to change)</span></div>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              <div><label style={nmLabel}>Full Name *</label><input className="nm-input-focus" style={nmInp} placeholder="Alexandra Reyes" value={form.fullName} onChange={e=>set('fullName',e.target.value)}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                <div><label style={nmLabel}>Title / Role</label><input style={nmInp} placeholder="CEO" value={form.title} onChange={e=>set('title',e.target.value)}/></div>
                <div><label style={nmLabel}>Company</label><input style={nmInp} placeholder="Acme Inc" value={form.company} onChange={e=>set('company',e.target.value)}/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                <div><label style={nmLabel}>Phone</label><input style={nmInp} placeholder="+1 555 0100" value={form.phone} onChange={e=>set('phone',e.target.value)}/></div>
                <div><label style={nmLabel}>WhatsApp</label><input style={nmInp} placeholder="15550100" value={form.whatsapp} onChange={e=>set('whatsapp',e.target.value)}/></div>
              </div>
              <div><label style={nmLabel}>Email</label><input style={nmInp} placeholder="you@email.com" value={form.email} onChange={e=>set('email',e.target.value)}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                <div>
                  <label style={nmLabel}>Profile Photo</label>
                  <button onClick={()=>photoRef.current?.click()} style={{width:'100%',padding:'10px 14px',background:NM.bg,boxShadow:raisedSm,border:'1px solid rgba(255,255,255,0.03)',borderRadius:'10px',color:form.photoUrl?NM.gold:NM.muted,fontSize:'12px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .15s'}}>
                    {form.photoUrl?'✓ Photo ready':'Upload photo'}
                  </button>
                  <input ref={photoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e,'photoUrl')}/>
                </div>
                <div>
                  <label style={nmLabel}>Logo</label>
                  <button onClick={()=>logoRef.current?.click()} style={{width:'100%',padding:'10px 14px',background:NM.bg,boxShadow:raisedSm,border:'1px solid rgba(255,255,255,0.03)',borderRadius:'10px',color:form.logoUrl?NM.gold:NM.muted,fontSize:'12px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .15s'}}>
                    {form.logoUrl?'✓ Logo ready':'Upload logo'}
                  </button>
                  <input ref={logoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e,'logoUrl')}/>
                </div>
              </div>
            </div>
          </div>

          {/* BACK */}
          <div style={{marginBottom:'28px'}}>
            <div style={nmSection}>Back — Content <span style={{color:'#4ade80'}}>('free to change')</span></div>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              <div><label style={nmLabel}>Tagline</label><input style={nmInp} placeholder="We craft brands that move people." value={form.tagline} onChange={e=>set('tagline',e.target.value)}/></div>
              <div><label style={nmLabel}>Bio</label><textarea style={{...nmInp,height:'72px',resize:'none' as const,lineHeight:1.5}} placeholder="Brief description..." value={form.bio} onChange={e=>set('bio',e.target.value)}/></div>
              <div><label style={nmLabel}>Services (comma-separated)</label><input style={nmInp} placeholder="Branding, Strategy, UX" value={form.services} onChange={e=>set('services',e.target.value)}/></div>
              <div><label style={nmLabel}>Website</label><input style={nmInp} placeholder="yoursite.com" value={form.website} onChange={e=>set('website',e.target.value)}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                {(['instagram','linkedin','twitter','telegram','tiktok','youtube'] as const).map(k=>(
                  <div key={k}><label style={nmLabel}>{k.charAt(0).toUpperCase()+k.slice(1)}</label><input style={nmInp} placeholder="@handle" value={form[k]} onChange={e=>set(k,e.target.value)}/></div>
                ))}
              </div>
            </div>
          </div>

          {/* DESIGN */}
          <div style={{marginBottom:'28px'}}>
            <div style={nmSection}>Design <span style={{color:'#4ade80'}}>(always free)</span></div>

            {/* Font */}
            <div style={{marginBottom:'14px'}}>
              <label style={nmLabel}>Font</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px'}}>
                {FONTS.map(f=>(
                  <button key={f.id} style={{fontFamily:f.css,padding:'8px 4px',borderRadius:'10px',background:NM.bg,boxShadow:design.font===f.id?insetSm:raisedSm,border:design.font===f.id?`1px solid rgba(212,168,67,0.2)`:'1px solid rgba(255,255,255,0.03)',color:design.font===f.id?NM.gold:NM.muted,fontSize:'11px',fontWeight:600,cursor:'pointer',transition:'all .15s',outline:'none'}} onClick={()=>setD('font',f.id)}>
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode */}
            <div style={{marginBottom:'14px'}}>
              <label style={nmLabel}>Background mode</label>
              <div style={{display:'flex',gap:'8px'}}>
                {['solid','gradient'].map(m=>(
                  <button key={m} style={{flex:1,padding:'9px',borderRadius:'10px',background:NM.bg,boxShadow:design.mode===m?insetSm:raisedSm,border:design.mode===m?'1px solid rgba(212,168,67,0.2)':'1px solid rgba(255,255,255,0.03)',color:design.mode===m?NM.gold:NM.muted,fontSize:'12px',fontWeight:600,cursor:'pointer',textTransform:'capitalize',transition:'all .15s',outline:'none'}} onClick={()=>setD('mode',m)}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div style={{display:'grid',gridTemplateColumns:design.mode==='gradient'?'1fr 1fr 1fr':'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
              <div><label style={nmLabel}>Background</label><input type="color" value={design.bg} onChange={e=>setD('bg',e.target.value)} style={{width:'100%',height:'34px',borderRadius:'8px',border:'none',background:NM.bg,boxShadow:raisedSm,cursor:'pointer',padding:'2px'}}/></div>
              {design.mode==='gradient'&&<div><label style={nmLabel}>Gradient end</label><input type="color" value={design.bg2} onChange={e=>setD('bg2',e.target.value)} style={{width:'100%',height:'34px',borderRadius:'8px',border:'none',background:NM.bg,boxShadow:raisedSm,cursor:'pointer',padding:'2px'}}/></div>}
              <div><label style={nmLabel}>Text</label><input type="color" value={design.textColor} onChange={e=>setD('textColor',e.target.value)} style={{width:'100%',height:'34px',borderRadius:'8px',border:'none',background:NM.bg,boxShadow:raisedSm,cursor:'pointer',padding:'2px'}}/></div>
            </div>

            {/* Palettes */}
            <label style={nmLabel}>Quick palettes</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
              {PALETTES.map((p,i)=>(
                <button key={i} title={p.label} onClick={()=>setDesign(d=>({...d,...p}))}
                  style={{width:'32px',height:'32px',borderRadius:'8px',border:'2px solid rgba(255,255,255,0.04)',cursor:'pointer',background:p.mode==='gradient'?`linear-gradient(135deg,${p.bg},${p.bg2})`:p.bg,boxShadow:raisedSm,transition:'transform .15s'}}
                  onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.15)')}
                  onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}/>
              ))}
            </div>
          </div>

          {/* Promo */}
          <div style={{marginBottom:'28px'}}>
            <label style={nmLabel}>Promo code</label>
            <div style={{display:'flex',gap:'8px'}}>
              <input style={{...nmInp,flex:1}} placeholder="VYNK50" value={promoCode} onChange={e=>setPromoCode(e.target.value.toUpperCase())}/>
              <button onClick={validatePromo} style={{padding:'10px 16px',background:NM.bg,boxShadow:raisedSm,border:'1px solid rgba(255,255,255,0.03)',borderRadius:'10px',color:NM.muted,fontSize:'12px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",whiteSpace:'nowrap'}}>Apply</button>
            </div>
            {promoValid===true&&<p style={{fontSize:'12px',color:'#4ade80',marginTop:'6px'}}>✓ Promo applied!</p>}
            {promoValid===false&&<p style={{fontSize:'12px',color:'#ef4444',marginTop:'6px'}}>Invalid or expired code</p>}
          </div>

          {/* Submit */}
          <button onClick={()=>submit()} disabled={submitting}
            style={{width:'100%',padding:'16px',background:'linear-gradient(135deg,#d4a843,#e8c96a,#a07830)',color:'#0d0d14',borderRadius:'16px',fontWeight:700,fontSize:'15px',border:'none',cursor:'pointer',boxShadow:goldRaised,opacity:submitting?.6:1,fontFamily:"'DM Sans',sans-serif",transition:'all .15s',marginBottom:'8px'}}>
            {submitting?'Processing…':existingCard?'Update my card':'✨ Generate my card — $20'}
          </button>
          <p style={{fontSize:'12px',color:NM.subtle,textAlign:'center'}}>
            {existingCard?'Free changes save instantly · Identity changes cost $10':'One-time $20 · Colors & content updates free'}
          </p>
        </div>
      </aside>

      {/* Right — preview */}
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'48px',background:NM.bg,gap:'24px'}}>
        <p style={{fontSize:'11px',color:NM.muted,textTransform:'uppercase',letterSpacing:'.08em'}}>Live Preview — click to flip</p>

        {/* Neumorphic card container */}
        <div style={{width:'380px',background:NM.bg,boxShadow:`10px 10px 28px ${NM.dark}, -6px -6px 18px ${NM.lite}`,borderRadius:'28px',padding:'12px',border:'1px solid rgba(255,255,255,0.04)'}}>
          <div style={{width:'100%',perspective:'1200px'}}>
            <div style={{position:'relative',transformStyle:'preserve-3d',transition:'transform 0.7s cubic-bezier(0.23,1,0.32,1)',transform:isFlipped?'rotateY(180deg)':'rotateY(0deg)',cursor:'pointer',minHeight:'210px'}} onClick={()=>setIsFlipped(f=>!f)}>
              {/* Front */}
              <div style={{backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',background:cardBg,borderRadius:'18px',padding:'24px',color:design.textColor,minHeight:'210px',display:'flex',flexDirection:'column',justifyContent:'space-between',fontFamily:fontCss}}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'14px'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'8px',fontWeight:700,letterSpacing:'.14em',opacity:.3,textTransform:'uppercase',marginBottom:'12px'}}>VYNK</div>
                    <div style={{fontSize:'20px',fontWeight:700,lineHeight:1.2,marginBottom:'3px'}}>{form.fullName||'Your Name'}</div>
                    <div style={{fontSize:'12px',opacity:.7}}>{[form.title,form.company].filter(Boolean).join(' · ')||'Title · Company'}</div>
                    {form.tagline&&<div style={{fontSize:'10px',opacity:.55,marginTop:'8px',lineHeight:1.6}}>{form.tagline}</div>}
                  </div>
                  <div style={{width:'50px',height:'50px',borderRadius:'50%',overflow:'hidden',border:'2px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'17px',fontWeight:700,flexShrink:0}}>
                    {form.photoUrl?<img src={form.photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:initials}
                  </div>
                </div>
                <div style={{fontSize:'10px',opacity:.5,marginTop:'14px'}}>{form.email||''}</div>
              </div>
              {/* Back */}
              <div style={{backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',transform:'rotateY(180deg)',position:'absolute',top:0,left:0,right:0,bottom:0,background:cardBg,borderRadius:'18px',padding:'24px',color:design.textColor,minHeight:'210px',display:'flex',flexDirection:'column',gap:'10px',filter:'brightness(0.85)',fontFamily:fontCss}}>
                <div style={{fontSize:'8px',opacity:.3,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase'}}>VYNK · BACK</div>
                {form.services&&<div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>{form.services.split(',').filter(Boolean).map(s=><span key={s} style={{padding:'2px 8px',borderRadius:'20px',fontSize:'9px',fontWeight:600,background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.2)'}}>{s.trim()}</span>)}</div>}
                {form.bio&&<div style={{fontSize:'10px',opacity:.6,lineHeight:1.6}}>{form.bio}</div>}
                <div style={{display:'flex',gap:'5px',flexWrap:'wrap',marginTop:'auto'}}>
                  {(['whatsapp','instagram','linkedin','twitter','tiktok'] as const).filter(k=>form[k]).map(k=>(
                    <span key={k} style={{width:'26px',height:'26px',borderRadius:'7px',background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:700}}>{k.slice(0,2).toUpperCase()}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p style={{fontSize:'12px',color:NM.muted,textAlign:'center',maxWidth:'320px'}}>
          Preview of your card. After payment it goes live at your unique link with QR code.
        </p>

        {existingCard&&(
          <div style={{background:NM.bg,boxShadow:insetSm,borderRadius:'12px',padding:'12px 20px',fontSize:'12px',color:NM.muted,border:'1px solid rgba(255,255,255,0.03)'}}>
            Active card: <span style={{color:NM.gold}}>/c/{existingCard.slug}</span>
          </div>
        )}
      </div>
    </main>
  )
}
