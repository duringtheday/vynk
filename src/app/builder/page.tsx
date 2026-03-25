'use client'
// src/app/builder/page.tsx
// FIXES:
// #1 — Landscape mobile: photo/logo upload + all social fields now present
// #2 — Photo frame shape selector + scale/rotate controls for photo & logo
// #3 — Bottom sheet drag handle bigger, hide button added
// #4 — (in admin page, not here)
// #5 — (in dashboard route)
// #6 — (handled by /api/cards route — QR/vCard generated on publish)
// #7 — (in login page)
// #8 — (in CardShowcase)

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FIELD_LABELS, requiresPayment } from '@/lib/rules'

const C = {
  g:'#0D0F12', gold:'#D4A84F', goldLt:'#E8C06A', goldDk:'#A07830',
  silver:'#BFC3C9', smoke:'#6F737A', carbon:'#050607', nd:'#08090B', nl:'#141720',
}
const raised   = `5px 5px 14px ${C.nd}, -3px -3px 10px ${C.nl}`
const raisedSm = `3px 3px 8px ${C.nd}, -2px -2px 6px ${C.nl}`
const insetSm  = `inset 2px 2px 6px ${C.nd}, inset -2px -2px 5px ${C.nl}`
const goldBox  = `4px 4px 14px ${C.nd}, -2px -2px 8px ${C.nl}, 0 0 22px rgba(212,168,79,0.2)`

// ─── TEMPLATES (unchanged, keep all from original) ────────────
// NOTE: paste your full TEMPLATES array here from the original file.
// For brevity, this stub references the same export. In practice,
// copy lines 21–324 from the original page.tsx verbatim.
// ──────────────────────────────────────────────────────────────
// (Include full TEMPLATES array from original builder/page.tsx)

// FIX #2 — Photo frame shapes
const PHOTO_FRAMES = [
  { id:'circle',  label:'Circle',   style:{ borderRadius:'50%' } },
  { id:'rounded', label:'Rounded',  style:{ borderRadius:'18px' } },
  { id:'square',  label:'Square',   style:{ borderRadius:'4px' } },
  { id:'hex',     label:'Hex',      style:{ borderRadius:'30% 70% 70% 30% / 30% 30% 70% 70%' } },
  { id:'blob',    label:'Blob',     style:{ borderRadius:'60% 40% 50% 60% / 40% 60% 50% 40%' } },
]

// ... rest of TEMPLATES, CATS, FONTS from original ...
// IMPORTANT: Keep all TEMPLATES, CATS, FONTS definitions from original file

const nmInp:React.CSSProperties = {
  width:'100%', padding:'9px 12px', background:C.g, boxShadow:insetSm,
  border:'1px solid rgba(255,255,255,0.04)', borderRadius:'10px', color:C.silver,
  fontFamily:"'DM Sans',sans-serif", fontSize:'13px', outline:'none',
}
const lbl:React.CSSProperties = {
  display:'block', fontSize:'10px', color:C.smoke,
  marginBottom:'5px', fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase' as const,
}

type Form = {
  fullName:string;title:string;company:string;photoUrl:string;logoUrl:string;
  phone:string;whatsapp:string;email:string;tagline:string;bio:string;
  services:string;telegram:string;instagram:string;linkedin:string;
  twitter:string;tiktok:string;youtube:string;website:string;address:string;
}
type Design = { template:string;font:string;mode:string;bg:string;bg2:string;textColor:string;accent:string }
type Pos = { x:number; y:number }

const INIT_FORM: Form = {
  fullName:'',title:'',company:'',photoUrl:'',logoUrl:'',phone:'',whatsapp:'',
  email:'',tagline:'',bio:'',services:'',telegram:'',instagram:'',linkedin:'',
  twitter:'',tiktok:'',youtube:'',website:'',address:'',
}
const INIT_DESIGN: Design = {
  template:'vynk-dark',font:'dm',mode:'gradient',
  bg:'#0D0F12',bg2:'#1a1a24',textColor:'#BFC3C9',accent:'#D4A84F',
}

export default function BuilderPage() {
  const router   = useRouter()
  const photoRef = useRef<HTMLInputElement>(null)
  const logoRef  = useRef<HTMLInputElement>(null)
  const cardRef  = useRef<HTMLDivElement>(null)

  const [form, setForm]               = useState<Form>(INIT_FORM)
  const [design, setDesign]           = useState<Design>(INIT_DESIGN)
  const [originalForm, setOriginal]   = useState<Form|null>(null)
  const [existingCard, setExisting]   = useState<any>(null)
  const [isFlipped, setIsFlipped]     = useState(false)
  const [promoCode, setPromoCode]     = useState('')
  const [promoValid, setPromoValid]   = useState<boolean|null>(null)
  const [submitting, setSubmitting]   = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [paidChanges, setPaidChanges] = useState<string[]>([])
  const [activeCat, setActiveCat]     = useState('Premium')
  const [activeTab, setActiveTab]     = useState<'front'|'back'|'design'|'preview'>('front')
  const [photoPos, setPhotoPos]       = useState<Pos>({x:72,y:10})
  const [logoPos, setLogoPos]         = useState<Pos>({x:10,y:72})
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile]       = useState(false)
  const [dragging, setDragging]       = useState<'photo'|'logo'|null>(null)
  const dragStart = useRef<{mx:number;my:number;ox:number;oy:number}|null>(null)

  // FIX #2 — frame + scale + rotate state
  const [photoFrame, setPhotoFrame]   = useState('circle')
  const [photoScale, setPhotoScale]   = useState(1)
  const [photoRotate, setPhotoRotate] = useState(0)
  const [logoScale, setLogoScale]     = useState(1)
  const [logoRotate, setLogoRotate]   = useState(0)

  // FIX #3 — sheet hide button
  const [sheetH, setSheetH]           = useState(220)
  const [sheetHidden, setSheetHidden] = useState(false)
  const [showRotateHint, setShowRotateHint] = useState(true)
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(()=>{
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  },[])

  useEffect(()=>{
    const checkOri = () => {
      const land = window.innerWidth > window.innerHeight
      setIsLandscape(land)
      if(land) setShowRotateHint(false)
    }
    checkOri()
    window.addEventListener('resize', checkOri)
    return () => window.removeEventListener('resize', checkOri)
  },[])

  const sheetDragRef = useRef<{startY:number;startH:number}|null>(null)

  function onSheetDragStart(e:React.TouchEvent) {
    e.stopPropagation()
    sheetDragRef.current = {startY: e.touches[0].clientY, startH: sheetH}
  }
  function onSheetDragMove(e:React.TouchEvent) {
    if(!sheetDragRef.current) return
    e.preventDefault()
    const dy = sheetDragRef.current.startY - e.touches[0].clientY
    const nh = Math.max(80, Math.min(window.innerHeight * 0.88, sheetDragRef.current.startH + dy))
    setSheetH(nh)
    setSheetHidden(false) // dragging up = show
  }
  function onSheetDragEnd() { sheetDragRef.current = null }

  const MOBILE_TABS = [
    {id:'front', icon:'👤', label:'Info'},
    {id:'back',  icon:'📝', label:'Content'},
    {id:'design',icon:'🎨', label:'Design'},
    {id:'preview',icon:'👁', label:'Preview'},
  ] as const

  useEffect(()=>{
    fetch('/api/cards').then(r=>r.json()).then(d=>{
      if(!d.card) return
      setExisting(d.card)
      const c = d.card
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

  const startDrag = useCallback((e:React.MouseEvent, type:'photo'|'logo')=>{
    e.preventDefault(); e.stopPropagation()
    const pos = type==='photo' ? photoPos : logoPos
    dragStart.current = { mx:e.clientX, my:e.clientY, ox:pos.x, oy:pos.y }
    setDragging(type)
  },[photoPos, logoPos])

  useEffect(()=>{
    if(!dragging) return
    const onMove = (e:MouseEvent) => {
      if(!dragStart.current || !cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const dx = ((e.clientX - dragStart.current.mx) / rect.width) * 100
      const dy = ((e.clientY - dragStart.current.my) / rect.height) * 100
      const nx = Math.max(0, Math.min(82, dragStart.current.ox + dx))
      const ny = Math.max(0, Math.min(82, dragStart.current.oy + dy))
      if(dragging==='photo') setPhotoPos({x:nx,y:ny})
      else setLogoPos({x:nx,y:ny})
    }
    const onUp = () => { setDragging(null); dragStart.current=null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  },[dragging])

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
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...form,services:form.services.split(',').map(s=>s.trim()).filter(Boolean),design,promoCode:promoValid?promoCode:undefined})
      })
      const data=await res.json()
      if(!res.ok) throw new Error(data.error||'Something went wrong')
      if(data.free){toast.success('Card published!');router.push(`/c/${data.slug}`)}
      else if(data.url){window.location.href=data.url}
    }catch(e:any){toast.error(e.message)}
    finally{setSubmitting(false)}
  }

  // NOTE: paste your full TEMPLATES array from original file.
  // These variables need the full array:
  // const TEMPLATES = [ ... ]
  // const CATS = [ ... ]
  // const FONTS = [ ... ]
  // For the patch below to work, keep them from the original file.

  // Placeholder references — replace with actual arrays from original:
  const TEMPLATES:any[] = [] // ← REPLACE: paste from original
  const CATS:string[] = []   // ← REPLACE: paste from original
  const FONTS:any[] = []     // ← REPLACE: paste from original

  // Photo frame computed styles
  const frameShape = PHOTO_FRAMES.find(f=>f.id===photoFrame)?.style || {borderRadius:'50%'}

  const tpl = TEMPLATES.find((t:any)=>t.id===design.template)||TEMPLATES[0]||{label:'',border:'rgba(212,168,79,0.15)',glow:'rgba(212,168,79,0.1)',overlay:'none',svg:'',mode:'gradient'}
  const cardBg = design.mode==='gradient' ? `linear-gradient(135deg,${design.bg},${design.bg2})` : design.bg
  const fontCss = (FONTS.find((f:any)=>f.id===design.font)||FONTS[0]||{css:"'DM Sans',sans-serif"}).css
  const initials = form.fullName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()||'YN'
  const svgOverlay = tpl?.svg ? `url("data:image/svg+xml;utf8,${encodeURIComponent(tpl.svg)}")` : 'none'

  const tabBtn = (id:'front'|'back'|'design', label:string) => (
    <button onClick={()=>setActiveTab(id)} style={{flex:1,padding:'9px',borderRadius:'10px',border:'none',background:activeTab===id?`rgba(212,168,79,0.1)`:C.g,boxShadow:activeTab===id?insetSm:raisedSm,color:activeTab===id?C.gold:C.smoke,fontSize:'12px',fontWeight:activeTab===id?700:400,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .15s',borderBottom:activeTab===id?`1px solid rgba(212,168,79,0.2)`:'1px solid transparent'}}>
      {label}
    </button>
  )

  // ── FIX #2 — Photo/Logo controls panel ───────────────────────
  function PhotoControls() {
    return (
      <div style={{display:'flex',flexDirection:'column',gap:'6px',padding:'10px',background:'rgba(255,255,255,0.02)',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.04)'}}>
        <div style={{fontSize:'10px',color:C.smoke,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:'2px'}}>Photo Frame</div>
        <div style={{display:'flex',gap:'5px'}}>
          {PHOTO_FRAMES.map(f=>(
            <button key={f.id} onClick={()=>setPhotoFrame(f.id)} title={f.label}
              style={{width:'28px',height:'28px',cursor:'pointer',border:`2px solid ${photoFrame===f.id?C.gold:'rgba(255,255,255,0.06)'}`,background:photoFrame===f.id?`rgba(212,168,79,0.1)`:C.g,boxShadow:photoFrame===f.id?insetSm:raisedSm,...f.style,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s'}}>
              <div style={{width:'10px',height:'10px',background:photoFrame===f.id?C.gold:C.smoke,...f.style}}/>
            </button>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginTop:'4px'}}>
          <div>
            <div style={{fontSize:'9px',color:C.smoke,marginBottom:'3px'}}>Photo scale: {photoScale.toFixed(1)}×</div>
            <input type="range" min="0.5" max="2" step="0.1" value={photoScale} onChange={e=>setPhotoScale(Number(e.target.value))} style={{width:'100%',accentColor:C.gold}}/>
          </div>
          <div>
            <div style={{fontSize:'9px',color:C.smoke,marginBottom:'3px'}}>Photo rotate: {photoRotate}°</div>
            <input type="range" min="-180" max="180" step="5" value={photoRotate} onChange={e=>setPhotoRotate(Number(e.target.value))} style={{width:'100%',accentColor:C.gold}}/>
          </div>
          {form.logoUrl&&<>
            <div>
              <div style={{fontSize:'9px',color:C.smoke,marginBottom:'3px'}}>Logo scale: {logoScale.toFixed(1)}×</div>
              <input type="range" min="0.3" max="3" step="0.1" value={logoScale} onChange={e=>setLogoScale(Number(e.target.value))} style={{width:'100%',accentColor:C.gold}}/>
            </div>
            <div>
              <div style={{fontSize:'9px',color:C.smoke,marginBottom:'3px'}}>Logo rotate: {logoRotate}°</div>
              <input type="range" min="-180" max="180" step="5" value={logoRotate} onChange={e=>setLogoRotate(Number(e.target.value))} style={{width:'100%',accentColor:C.gold}}/>
            </div>
          </>}
        </div>
      </div>
    )
  }

  // ── LANDSCAPE MOBILE — FIX #1: add photo/logo + socials ──────
  if (isMobile && isLandscape) return (
    <div style={{height:'100dvh',width:'100vw',background:C.g,display:'flex',flexDirection:'row',fontFamily:"'DM Sans',sans-serif",overflow:'hidden'}}>
      {showWarning&&(
        <div style={{position:'fixed',inset:0,background:'rgba(5,6,7,0.9)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}>
          <div style={{background:C.g,borderRadius:'20px',padding:'20px',width:'100%',maxWidth:'320px',border:'1px solid rgba(212,168,79,0.08)'}}>
            <h2 style={{fontSize:'13px',fontWeight:700,marginBottom:'6px',color:C.silver}}>Identity change — $10</h2>
            <p style={{color:C.smoke,fontSize:'11px',marginBottom:'12px'}}>Changed: <span style={{color:C.gold}}>{paidChanges.map(k=>FIELD_LABELS[k]||k).join(', ')}</span></p>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={()=>{setShowWarning(false);setPaidChanges([])}} style={{flex:1,padding:'9px',background:C.g,boxShadow:raisedSm,border:'none',borderRadius:'9px',color:C.smoke,fontSize:'11px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
              <button onClick={()=>{setShowWarning(false);submit(true)}} style={{flex:1,padding:'9px',background:`linear-gradient(135deg,${C.gold},${C.goldLt})`,color:C.carbon,borderRadius:'9px',fontSize:'11px',fontWeight:700,border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Pay $10</button>
            </div>
          </div>
        </div>
      )}

      {/* LEFT panel */}
      <div style={{width:sidebarOpen?'210px':'0px',flexShrink:0,overflow:'hidden',transition:'width .2s',background:C.g,borderRight:'1px solid rgba(255,255,255,0.03)',display:'flex',flexDirection:'column'}}>
        <div style={{width:'210px',height:'100%',display:'flex',flexDirection:'column'}}>
          <div style={{display:'flex',gap:'3px',padding:'6px',borderBottom:'1px solid rgba(255,255,255,0.03)',flexShrink:0}}>
            {([['front','Info'],['back','Content'],['design','Design']] as const).map(([id,lbl])=>(
              <button key={id} onClick={()=>setActiveTab(id)} style={{flex:1,padding:'5px 3px',borderRadius:'7px',border:'none',background:activeTab===id?'rgba(212,168,79,0.1)':C.g,boxShadow:activeTab===id?insetSm:raisedSm,color:activeTab===id?C.gold:C.smoke,fontSize:'9px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{lbl}</button>
            ))}
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'6px',display:'flex',flexDirection:'column',gap:'5px'}}>

            {/* FIX #1 — Front tab now includes photo + logo upload */}
            {activeTab==='front'&&(<>
              <input style={{...nmInp,fontSize:'11px',padding:'6px 8px'}} placeholder="Full Name *" value={form.fullName} onChange={e=>set('fullName',e.target.value)}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px'}}>
                <input style={{...nmInp,fontSize:'10px',padding:'5px 7px'}} placeholder="Title" value={form.title} onChange={e=>set('title',e.target.value)}/>
                <input style={{...nmInp,fontSize:'10px',padding:'5px 7px'}} placeholder="Company" value={form.company} onChange={e=>set('company',e.target.value)}/>
              </div>
              <input style={{...nmInp,fontSize:'10px',padding:'5px 7px'}} placeholder="Email" value={form.email} onChange={e=>set('email',e.target.value)}/>
              <input style={{...nmInp,fontSize:'10px',padding:'5px 7px'}} placeholder="Phone" value={form.phone} onChange={e=>set('phone',e.target.value)}/>
              {/* Photo + Logo — FIX #1 */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px'}}>
                <div style={{display:'flex',gap:'3px'}}>
                  <button onClick={()=>photoRef.current?.click()} style={{flex:1,padding:'6px',background:C.g,boxShadow:form.photoUrl?insetSm:raisedSm,border:`1px solid ${form.photoUrl?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,borderRadius:'7px',color:form.photoUrl?C.gold:C.smoke,fontSize:'9px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{form.photoUrl?'✓ Photo':'📷'}</button>
                  {form.photoUrl&&<button onClick={()=>set('photoUrl','')} style={{padding:'6px 8px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(239,68,68,0.2)',borderRadius:'7px',color:'#ef4444',fontSize:'10px',cursor:'pointer'}}>✕</button>}
                  <input ref={photoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e,'photoUrl')}/>
                </div>
                <div style={{display:'flex',gap:'3px'}}>
                  <button onClick={()=>logoRef.current?.click()} style={{flex:1,padding:'6px',background:C.g,boxShadow:form.logoUrl?insetSm:raisedSm,border:`1px solid ${form.logoUrl?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,borderRadius:'7px',color:form.logoUrl?C.gold:C.smoke,fontSize:'9px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{form.logoUrl?'✓ Logo':'🔷'}</button>
                  {form.logoUrl&&<button onClick={()=>set('logoUrl','')} style={{padding:'6px 8px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(239,68,68,0.2)',borderRadius:'7px',color:'#ef4444',fontSize:'10px',cursor:'pointer'}}>✕</button>}
                  <input ref={logoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e,'logoUrl')}/>
                </div>
              </div>
              {/* FIX #2 — Scale/rotate sliders in landscape */}
              {(form.photoUrl||form.logoUrl)&&(
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3px'}}>
                  {form.photoUrl&&<>
                    <div><div style={{fontSize:'8px',color:C.smoke}}>Photo ×{photoScale.toFixed(1)}</div><input type="range" min="0.5" max="2" step="0.1" value={photoScale} onChange={e=>setPhotoScale(Number(e.target.value))} style={{width:'100%',accentColor:C.gold}}/></div>
                    <div><div style={{fontSize:'8px',color:C.smoke}}>Rotate {photoRotate}°</div><input type="range" min="-180" max="180" step="5" value={photoRotate} onChange={e=>setPhotoRotate(Number(e.target.value))} style={{width:'100%',accentColor:C.gold}}/></div>
                  </>}
                  {form.logoUrl&&<>
                    <div><div style={{fontSize:'8px',color:C.smoke}}>Logo ×{logoScale.toFixed(1)}</div><input type="range" min="0.3" max="3" step="0.1" value={logoScale} onChange={e=>setLogoScale(Number(e.target.value))} style={{width:'100%',accentColor:C.gold}}/></div>
                    <div><div style={{fontSize:'8px',color:C.smoke}}>Rotate {logoRotate}°</div><input type="range" min="-180" max="180" step="5" value={logoRotate} onChange={e=>setLogoRotate(Number(e.target.value))} style={{width:'100%',accentColor:C.gold}}/></div>
                  </>}
                </div>
              )}
            </>)}

            {/* FIX #1 — Back tab now includes social fields */}
            {activeTab==='back'&&(<>
              <input style={{...nmInp,fontSize:'10px',padding:'5px 7px'}} placeholder="Tagline" value={form.tagline} onChange={e=>set('tagline',e.target.value)}/>
              <textarea style={{...nmInp,fontSize:'10px',padding:'5px 7px',height:'40px',resize:'none',lineHeight:1.4}} value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="Bio..."/>
              <input style={{...nmInp,fontSize:'10px',padding:'5px 7px'}} placeholder="Services (comma sep)" value={form.services} onChange={e=>set('services',e.target.value)}/>
              <input style={{...nmInp,fontSize:'10px',padding:'5px 7px'}} placeholder="Website" value={form.website} onChange={e=>set('website',e.target.value)}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3px'}}>
                {(['instagram','linkedin','twitter','telegram','tiktok','youtube'] as const).map(k=>(
                  <input key={k} style={{...nmInp,fontSize:'9px',padding:'4px 6px'}} placeholder={`@${k}`} value={form[k]} onChange={e=>set(k,e.target.value)}/>
                ))}
              </div>
            </>)}

            {activeTab==='design'&&(<>
              <div style={{display:'flex',gap:'2px',flexWrap:'wrap'}}>
                {CATS.map(cat=>(<button key={cat} onClick={()=>setActiveCat(cat)} style={{padding:'2px 5px',borderRadius:'20px',border:'none',background:activeCat===cat?'rgba(212,168,79,0.12)':'rgba(255,255,255,0.04)',color:activeCat===cat?C.gold:C.smoke,fontSize:'8px',fontWeight:activeCat===cat?700:400,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{cat}</button>))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'3px'}}>
                {TEMPLATES.filter((t:any)=>t.cat===activeCat).map((t:any)=>(<button key={t.id} onClick={()=>{setDesign(d=>({...d,template:t.id,bg:t.bg,bg2:t.bg2,textColor:t.textColor,accent:t.accent,mode:t.mode}))}} style={{height:'26px',borderRadius:'6px',cursor:'pointer',background:t.mode==='gradient'?`linear-gradient(135deg,${t.bg},${t.bg2})`:t.bg,border:`2px solid ${design.template===t.id?t.accent:'rgba(255,255,255,0.06)'}`,position:'relative',overflow:'hidden'}}><div style={{position:'absolute',bottom:'2px',right:'2px',width:'3px',height:'3px',borderRadius:'50%',background:t.accent}}/></button>))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'3px'}}>
                {FONTS.map((f:any)=>(<button key={f.id} onClick={()=>setD('font',f.id)} style={{fontFamily:f.css,padding:'5px 2px',borderRadius:'7px',background:C.g,boxShadow:design.font===f.id?insetSm:raisedSm,border:`1px solid ${design.font===f.id?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,color:design.font===f.id?C.gold:C.smoke,fontSize:'9px',fontWeight:600,cursor:'pointer',outline:'none'}}>{f.name}</button>))}
              </div>
              {/* FIX #2 — Frame selector in landscape design tab */}
              <div style={{display:'flex',gap:'4px'}}>
                {PHOTO_FRAMES.map(f=>(
                  <button key={f.id} onClick={()=>setPhotoFrame(f.id)} title={f.label}
                    style={{flex:1,height:'22px',cursor:'pointer',border:`2px solid ${photoFrame===f.id?C.gold:'rgba(255,255,255,0.06)'}`,background:photoFrame===f.id?`rgba(212,168,79,0.1)`:C.g,boxShadow:photoFrame===f.id?insetSm:raisedSm,...f.style,transition:'all .15s'}}/>
                ))}
              </div>
            </>)}
          </div>

          <div style={{padding:'6px',borderTop:'1px solid rgba(255,255,255,0.03)',flexShrink:0}}>
            <button onClick={()=>submit()} disabled={submitting} style={{width:'100%',padding:'9px',background:`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`,color:C.carbon,borderRadius:'9px',fontWeight:700,fontSize:'11px',border:'none',cursor:'pointer',boxShadow:goldBox,fontFamily:"'DM Sans',sans-serif",opacity:submitting?.7:1}}>
              {submitting?'…':existingCard?'Save':'$20'}
            </button>
          </div>
        </div>
      </div>

      {/* CANVAS */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse 60% 80% at 50% 50%, ${tpl?.glow||'rgba(212,168,79,0.1)'} 0%, transparent 70%)`,pointerEvents:'none'}}/>
        <button onClick={()=>setSidebarOpen(v=>!v)} style={{position:'absolute',left:'6px',top:'50%',transform:'translateY(-50%)',zIndex:10,width:'24px',height:'44px',borderRadius:'7px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(255,255,255,0.04)',color:C.smoke,fontSize:'13px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',touchAction:'manipulation'}}>
          {sidebarOpen?'‹':'›'}
        </button>
        <div style={{background:C.g,boxShadow:`8px 8px 20px ${C.nd},-5px -5px 14px ${C.nl}`,borderRadius:'16px',padding:'8px',border:`1px solid ${tpl?.border||'rgba(212,168,79,0.15)'}`,height:'calc(100dvh - 16px)',aspectRatio:'1.6/1',position:'relative'}}>
          <div style={{perspective:'800px',height:'100%'}}>
            <div ref={cardRef} onClick={()=>!dragging&&setIsFlipped(f=>!f)} style={{position:'relative',transformStyle:'preserve-3d',transition:dragging?'none':'transform .6s cubic-bezier(0.23,1,0.32,1)',transform:isFlipped?'rotateY(180deg)':'rotateY(0deg)',cursor:'pointer',height:'100%',borderRadius:'12px',userSelect:'none'}}>
              {/* FRONT */}
              <div style={{backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',background:cardBg,borderRadius:'12px',padding:'16px',color:design.textColor,height:'100%',display:'flex',flexDirection:'column',justifyContent:'space-between',fontFamily:fontCss,position:'relative',overflow:'hidden'}}>
                {tpl?.overlay&&tpl.overlay!=='none'&&<div style={{position:'absolute',inset:0,background:tpl.overlay,pointerEvents:'none'}}/>}
                <div style={{position:'absolute',inset:0,backgroundImage:svgOverlay,backgroundSize:'100% 100%',pointerEvents:'none'}}/>
                <div style={{position:'absolute',inset:0,borderRadius:'12px',border:`1px solid ${tpl?.border||'rgba(212,168,79,0.15)'}`,pointerEvents:'none'}}/>
                {/* FIX #2 — Photo with frame, scale, rotate */}
                {form.photoUrl&&(
                  <div onMouseDown={e=>startDrag(e,'photo')} style={{position:'absolute',left:`${photoPos.x}%`,top:`${photoPos.y}%`,width:'46px',height:'46px',overflow:'hidden',cursor:dragging==='photo'?'grabbing':'grab',zIndex:10,...frameShape,border:`2px solid ${design.accent}60`,boxShadow:`0 4px 16px rgba(0,0,0,0.5)`,transform:`scale(${photoScale}) rotate(${photoRotate}deg)`,transformOrigin:'center',transition:dragging==='photo'?'none':'transform .15s'}}>
                    <img src={form.photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} draggable={false}/>
                  </div>
                )}
                {form.logoUrl&&(
                  <div onMouseDown={e=>startDrag(e,'logo')} style={{position:'absolute',left:`${logoPos.x}%`,top:`${logoPos.y}%`,cursor:dragging==='logo'?'grabbing':'grab',zIndex:10,transform:`scale(${logoScale}) rotate(${logoRotate}deg)`,transformOrigin:'center',transition:dragging==='logo'?'none':'transform .15s'}}>
                    <img src={form.logoUrl} alt="logo" style={{height:'28px',objectFit:'contain',filter:`drop-shadow(0 2px 8px rgba(0,0,0,0.6))`}} draggable={false}/>
                  </div>
                )}
                <div style={{position:'relative',zIndex:1}}>
                  <div style={{fontSize:'7px',fontWeight:700,letterSpacing:'.12em',opacity:.3,textTransform:'uppercase',marginBottom:'10px',color:design.accent}}>VYNK</div>
                  <div style={{fontSize:'20px',fontWeight:700,lineHeight:1.15}}>{form.fullName||'Your Name'}</div>
                  <div style={{fontSize:'11px',opacity:.7,marginTop:'3px'}}>{[form.title,form.company].filter(Boolean).join(' · ')||'Title · Company'}</div>
                </div>
                {!form.photoUrl&&<div style={{position:'absolute',top:'14px',right:'14px',width:'38px',height:'38px',borderRadius:'50%',background:`${design.accent}18`,border:`2px solid ${design.accent}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:700,color:design.accent}}>{initials}</div>}
                <div style={{position:'relative',zIndex:1}}>
                  {form.email&&<div style={{fontSize:'10px',opacity:.55}}>{form.email}</div>}
                  <div style={{marginTop:'10px',width:'50%',height:'1px',background:`linear-gradient(90deg,${design.accent}60,transparent)`}}/>
                </div>
              </div>
              {/* BACK */}
              <div style={{backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',transform:'rotateY(180deg)',position:'absolute',top:0,left:0,right:0,bottom:0,background:cardBg,borderRadius:'12px',padding:'16px',color:design.textColor,height:'100%',display:'flex',flexDirection:'column',gap:'8px',fontFamily:fontCss,filter:'brightness(0.85)',overflow:'hidden'}}>
                {tpl?.overlay&&tpl.overlay!=='none'&&<div style={{position:'absolute',inset:0,background:tpl.overlay,pointerEvents:'none'}}/>}
                <div style={{position:'absolute',inset:0,backgroundImage:svgOverlay,backgroundSize:'100% 100%',pointerEvents:'none'}}/>
                <div style={{position:'relative',zIndex:1}}>
                  <div style={{fontSize:'7px',opacity:.3,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',marginBottom:'6px',color:design.accent}}>SERVICES</div>
                  {form.services&&<div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>{form.services.split(',').filter(Boolean).map(s=><span key={s} style={{padding:'2px 7px',borderRadius:'20px',fontSize:'9px',fontWeight:600,background:`${design.accent}18`,border:`1px solid ${design.accent}35`,color:design.accent}}>{s.trim()}</span>)}</div>}
                  {form.bio&&<div style={{fontSize:'10px',opacity:.6,lineHeight:1.6,marginTop:'6px'}}>{form.bio}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{position:'absolute',right:'6px',top:'50%',transform:'translateY(-50%)',display:'flex',flexDirection:'column',gap:'5px',zIndex:10}}>
          <button onClick={()=>setIsFlipped(f=>!f)} style={{width:'26px',height:'26px',borderRadius:'7px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(255,255,255,0.04)',color:C.smoke,fontSize:'12px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',touchAction:'manipulation'}}>↻</button>
          {existingCard&&<a href={`/c/${existingCard.slug}`} style={{width:'26px',height:'26px',borderRadius:'7px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(212,168,79,0.1)',color:C.gold,fontSize:'9px',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,touchAction:'manipulation'}}>→</a>}
        </div>
        <div style={{position:'absolute',bottom:'4px',left:'50%',transform:'translateX(-50%)',fontSize:'8px',color:C.smoke,whiteSpace:'nowrap'}}>
          <span style={{color:C.gold,fontWeight:700}}>{tpl?.label}</span> · tap to flip
        </div>
      </div>
    </div>
  )

  // ── PORTRAIT MOBILE ───────────────────────────────────────────
  if (isMobile) return (
    <div style={{height:'100dvh',background:C.g,display:'flex',flexDirection:'column',fontFamily:"'DM Sans',sans-serif",overflow:'hidden',position:'relative'}}>

      {/* Rotate hint */}
      {showRotateHint && !isLandscape && (
        <div onClick={()=>setShowRotateHint(false)} onTouchStart={()=>setShowRotateHint(false)}
          style={{position:'fixed',inset:0,zIndex:200,background:'rgba(5,6,7,0.92)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'24px',cursor:'pointer'}}>
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <rect x="35" y="10" width="50" height="80" rx="8" fill="none" stroke="rgba(212,168,79,0.2)" strokeWidth="2"/>
            <rect x="39" y="14" width="42" height="72" rx="6" fill="rgba(212,168,79,0.04)"/>
            <circle cx="60" cy="78" r="3" fill="rgba(212,168,79,0.4)"/>
            <path d="M 90 50 C 100 30 110 40 105 55" stroke="#D4A84F" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9"/>
            <path d="M 105 55 L 108 48 M 105 55 L 99 53" stroke="#D4A84F" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <div style={{textAlign:'center',padding:'0 32px'}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'18px',color:'#D4A84F',marginBottom:'8px'}}>Rotate for better editing</div>
            <div style={{fontSize:'13px',color:'#6F737A',lineHeight:1.6}}>Turn your device horizontally<br/>for full builder experience</div>
          </div>
          <div style={{padding:'10px 24px',background:'rgba(212,168,79,0.08)',border:'1px solid rgba(212,168,79,0.2)',borderRadius:'20px',fontSize:'12px',color:'#D4A84F',fontWeight:600}}>Tap anywhere to dismiss</div>
        </div>
      )}

      {/* Topbar */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 14px',background:C.g,boxShadow:`0 3px 12px ${C.nd}`,borderBottom:'1px solid rgba(255,255,255,0.03)',flexShrink:0,zIndex:10}}>
        <div style={{padding:'6px 10px',background:C.g,boxShadow:raised,borderRadius:'10px',border:'1px solid rgba(212,168,79,0.07)'}}>
          <img src="/logo.png" alt="Vynk" style={{height:'22px',width:'auto',display:'block'}}/>
        </div>
        <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
          {existingCard&&<Link href={`/c/${existingCard.slug}`} style={{fontSize:'10px',color:C.gold,textDecoration:'none',padding:'5px 10px',background:C.g,boxShadow:raisedSm,borderRadius:'7px'}}>View →</Link>}
          <button onClick={()=>submit()} disabled={submitting} style={{padding:'8px 16px',background:`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`,color:C.carbon,borderRadius:'9px',fontWeight:700,fontSize:'12px',border:'none',cursor:'pointer',boxShadow:goldBox,fontFamily:"'DM Sans',sans-serif",opacity:submitting?.7:1}}>
            {submitting?'…':existingCard?'Save':'$20'}
          </button>
        </div>
      </div>

      {/* Card preview area */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px 16px 0',overflow:'hidden',position:'relative',minHeight:0}}>
        <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse 80% 80% at 50% 50%, ${tpl?.glow||'rgba(212,168,79,0.1)'} 0%, transparent 70%)`,pointerEvents:'none'}}/>
        <div style={{background:C.g,boxShadow:`8px 8px 20px ${C.nd},-5px -5px 14px ${C.nl}`,borderRadius:'20px',padding:'10px',border:`1px solid ${tpl?.border||'rgba(212,168,79,0.15)'}`,width:'100%',maxWidth:'440px',position:'relative'}}>
          <div style={{perspective:'800px'}}>
            <div ref={cardRef} onClick={()=>!dragging&&setIsFlipped(f=>!f)} style={{position:'relative',transformStyle:'preserve-3d',transition:dragging?'none':'transform .6s cubic-bezier(0.23,1,0.32,1)',transform:isFlipped?'rotateY(180deg)':'rotateY(0deg)',cursor:'pointer',borderRadius:'16px',userSelect:'none'}}>
              {/* FRONT */}
              <div style={{backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',background:cardBg,borderRadius:'16px',padding:'20px',color:design.textColor,minHeight:'180px',display:'flex',flexDirection:'column',justifyContent:'space-between',fontFamily:fontCss,position:'relative',overflow:'hidden'}}>
                {tpl?.overlay&&tpl.overlay!=='none'&&<div style={{position:'absolute',inset:0,background:tpl.overlay,pointerEvents:'none'}}/>}
                <div style={{position:'absolute',inset:0,backgroundImage:svgOverlay,backgroundSize:'100% 100%',pointerEvents:'none'}}/>
                <div style={{position:'absolute',inset:0,borderRadius:'16px',border:`1px solid ${tpl?.border||'rgba(212,168,79,0.15)'}`,pointerEvents:'none'}}/>
                {/* FIX #2 — photo with frame */}
                {form.photoUrl&&(
                  <div style={{position:'absolute',top:'16px',right:'16px',width:'52px',height:'52px',overflow:'hidden',...frameShape,border:`2px solid ${design.accent}60`,transform:`scale(${photoScale}) rotate(${photoRotate}deg)`,transformOrigin:'center'}}>
                    <img src={form.photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  </div>
                )}
                {form.logoUrl&&(
                  <div style={{position:'absolute',bottom:'16px',right:'16px',transform:`scale(${logoScale}) rotate(${logoRotate}deg)`,transformOrigin:'bottom right'}}>
                    <img src={form.logoUrl} alt="logo" style={{height:'26px',objectFit:'contain'}}/>
                  </div>
                )}
                <div style={{position:'relative',zIndex:1}}>
                  <div style={{fontSize:'7px',fontWeight:700,letterSpacing:'.12em',opacity:.3,textTransform:'uppercase',marginBottom:'12px',color:design.accent}}>VYNK</div>
                  <div style={{fontSize:'22px',fontWeight:700,lineHeight:1.15}}>{form.fullName||'Your Name'}</div>
                  <div style={{fontSize:'12px',opacity:.7,marginTop:'3px'}}>{[form.title,form.company].filter(Boolean).join(' · ')||'Title · Company'}</div>
                </div>
                {!form.photoUrl&&<div style={{position:'absolute',top:'16px',right:'16px',width:'48px',height:'48px',borderRadius:'50%',background:`${design.accent}18`,border:`2px solid ${design.accent}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:700,color:design.accent}}>{initials}</div>}
                <div style={{position:'relative',zIndex:1}}>
                  {form.email&&<div style={{fontSize:'10px',opacity:.55}}>{form.email}</div>}
                  <div style={{marginTop:'10px',width:'50%',height:'1px',background:`linear-gradient(90deg,${design.accent}60,transparent)`}}/>
                </div>
              </div>
              {/* BACK */}
              <div style={{backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',transform:'rotateY(180deg)',position:'absolute',top:0,left:0,right:0,bottom:0,background:cardBg,borderRadius:'16px',padding:'20px',color:design.textColor,minHeight:'180px',display:'flex',flexDirection:'column',gap:'10px',fontFamily:fontCss,filter:'brightness(0.85)',overflow:'hidden'}}>
                {tpl?.overlay&&tpl.overlay!=='none'&&<div style={{position:'absolute',inset:0,background:tpl.overlay,pointerEvents:'none'}}/>}
                <div style={{position:'absolute',inset:0,backgroundImage:svgOverlay,backgroundSize:'100% 100%',pointerEvents:'none'}}/>
                <div style={{position:'relative',zIndex:1}}>
                  <div style={{fontSize:'7px',opacity:.3,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',marginBottom:'8px',color:design.accent}}>SERVICES</div>
                  {form.services&&<div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>{form.services.split(',').filter(Boolean).map(s=><span key={s} style={{padding:'3px 8px',borderRadius:'20px',fontSize:'9px',fontWeight:600,background:`${design.accent}18`,border:`1px solid ${design.accent}35`,color:design.accent}}>{s.trim()}</span>)}</div>}
                  {form.bio&&<div style={{fontSize:'10px',opacity:.6,lineHeight:1.6,marginTop:'8px'}}>{form.bio}</div>}
                </div>
              </div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'8px',padding:'0 2px'}}>
            <span style={{fontSize:'9px',color:C.smoke}}><span style={{color:C.gold,fontWeight:700}}>{tpl?.label}</span></span>
            <span style={{fontSize:'9px',color:C.smoke}}>tap ↻</span>
          </div>
        </div>
      </div>

      {/* FIX #3 — Bottom sheet with bigger drag handle + hide button */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:30,background:C.g,borderRadius:'20px 20px 0 0',boxShadow:`0 -8px 32px ${C.nd}`,border:'1px solid rgba(255,255,255,0.04)',height:sheetHidden?'44px':`${sheetH}px`,display:'flex',flexDirection:'column',transition:sheetDragRef.current?'none':'height .2s'}}>

        {/* FIX #3 — Drag handle: bigger touch area + hide button */}
        <div onTouchStart={onSheetDragStart} onTouchMove={onSheetDragMove} onTouchEnd={onSheetDragEnd}
          style={{padding:'14px 16px 6px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'grab',flexShrink:0,touchAction:'none',minHeight:'44px',position:'relative'}}>
          <div style={{width:'56px',height:'5px',borderRadius:'3px',background:C.smoke,opacity:.5}}/>
          {/* FIX #3 — Hide/show button */}
          <button onClick={()=>setSheetHidden(v=>!v)}
            style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',width:'28px',height:'28px',borderRadius:'8px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(255,255,255,0.04)',color:C.smoke,fontSize:'12px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',touchAction:'manipulation'}}>
            {sheetHidden?'↑':'↓'}
          </button>
        </div>

        {!sheetHidden&&(<>
          {/* Tab bar */}
          <div style={{display:'flex',gap:'6px',padding:'0 12px 8px',flexShrink:0}}>
            {MOBILE_TABS.map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id as any)}
                style={{flex:1,padding:'8px 4px',borderRadius:'10px',border:'none',background:activeTab===t.id?`rgba(212,168,79,0.1)`:C.g,boxShadow:activeTab===t.id?insetSm:raisedSm,color:activeTab===t.id?C.gold:C.smoke,fontSize:'9px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',transition:'all .15s'}}>
                <span style={{fontSize:'14px'}}>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>

          {/* Sheet content */}
          <div style={{flex:1,overflowY:'auto',padding:'0 12px 12px',display:'flex',flexDirection:'column',gap:'8px'}}>
            {activeTab==='front'&&(<>
              <div style={{fontSize:'9px',color:C.gold,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase'}}>Identity — $10 to change</div>
              <input style={nmInp} placeholder="Full Name *" value={form.fullName} onChange={e=>set('fullName',e.target.value)}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                <input style={nmInp} placeholder="Title" value={form.title} onChange={e=>set('title',e.target.value)}/>
                <input style={nmInp} placeholder="Company" value={form.company} onChange={e=>set('company',e.target.value)}/>
              </div>
              <input style={nmInp} placeholder="Email" value={form.email} onChange={e=>set('email',e.target.value)}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                <input style={nmInp} placeholder="Phone" value={form.phone} onChange={e=>set('phone',e.target.value)}/>
                <input style={nmInp} placeholder="WhatsApp" value={form.whatsapp} onChange={e=>set('whatsapp',e.target.value)}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                <div style={{display:'flex',gap:'4px'}}>
                  <button onClick={()=>photoRef.current?.click()} style={{flex:1,padding:'8px',background:C.g,boxShadow:form.photoUrl?insetSm:raisedSm,border:`1px solid ${form.photoUrl?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,borderRadius:'8px',color:form.photoUrl?C.gold:C.smoke,fontSize:'10px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{form.photoUrl?'✓ Photo':'📷 Photo'}</button>
                  {form.photoUrl&&<button onClick={()=>set('photoUrl','')} style={{padding:'8px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(239,68,68,0.2)',borderRadius:'8px',color:'#ef4444',fontSize:'11px',cursor:'pointer'}}>✕</button>}
                  <input ref={photoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e,'photoUrl')}/>
                </div>
                <div style={{display:'flex',gap:'4px'}}>
                  <button onClick={()=>logoRef.current?.click()} style={{flex:1,padding:'8px',background:C.g,boxShadow:form.logoUrl?insetSm:raisedSm,border:`1px solid ${form.logoUrl?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,borderRadius:'8px',color:form.logoUrl?C.gold:C.smoke,fontSize:'10px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{form.logoUrl?'✓ Logo':'🔷 Logo'}</button>
                  {form.logoUrl&&<button onClick={()=>set('logoUrl','')} style={{padding:'8px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(239,68,68,0.2)',borderRadius:'8px',color:'#ef4444',fontSize:'11px',cursor:'pointer'}}>✕</button>}
                  <input ref={logoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e,'logoUrl')}/>
                </div>
              </div>
              {/* FIX #2 — Photo controls in portrait */}
              {(form.photoUrl||form.logoUrl)&&<PhotoControls/>}
            </>)}

            {activeTab==='back'&&(<>
              <div style={{fontSize:'9px',color:'#4ade80',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase'}}>Content — free</div>
              <input style={nmInp} placeholder="Tagline" value={form.tagline} onChange={e=>set('tagline',e.target.value)}/>
              <textarea style={{...nmInp,height:'60px',resize:'none',lineHeight:1.5}} value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="Bio..."/>
              <input style={nmInp} placeholder="Services (comma-separated)" value={form.services} onChange={e=>set('services',e.target.value)}/>
              <input style={nmInp} placeholder="Website" value={form.website} onChange={e=>set('website',e.target.value)}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                {(['instagram','linkedin','twitter','telegram','tiktok','youtube'] as const).map(k=>(
                  <input key={k} style={nmInp} placeholder={`@${k}`} value={form[k]} onChange={e=>set(k,e.target.value)}/>
                ))}
              </div>
            </>)}

            {activeTab==='design'&&(<>
              <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                {CATS.map(cat=>(<button key={cat} onClick={()=>setActiveCat(cat)} style={{padding:'4px 8px',borderRadius:'20px',border:'none',background:activeCat===cat?`rgba(212,168,79,0.12)`:'rgba(255,255,255,0.04)',color:activeCat===cat?C.gold:C.smoke,fontSize:'10px',fontWeight:activeCat===cat?700:400,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{cat}</button>))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'5px'}}>
                {TEMPLATES.filter((t:any)=>t.cat===activeCat).map((t:any)=>(
                  <button key={t.id} title={t.label} onClick={()=>{setDesign(d=>({...d,template:t.id,bg:t.bg,bg2:t.bg2,textColor:t.textColor,accent:t.accent,mode:t.mode}))}}
                    style={{height:'36px',borderRadius:'8px',cursor:'pointer',background:t.mode==='gradient'?`linear-gradient(135deg,${t.bg},${t.bg2})`:t.bg,border:`2px solid ${design.template===t.id?t.accent:'rgba(255,255,255,0.06)'}`,boxShadow:design.template===t.id?`0 0 0 1px ${t.accent}55`:raisedSm,transition:'all .15s',position:'relative',overflow:'hidden'}}>
                    {t.svg&&<div style={{position:'absolute',inset:0,backgroundImage:`url("data:image/svg+xml;utf8,${encodeURIComponent(t.svg)}")`,backgroundSize:'cover',opacity:.6}}/>}
                    <div style={{position:'absolute',bottom:'2px',right:'3px',width:'4px',height:'4px',borderRadius:'50%',background:t.accent,zIndex:1}}/>
                  </button>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'5px'}}>
                {FONTS.map((f:any)=>(<button key={f.id} onClick={()=>setD('font',f.id)} style={{fontFamily:f.css,padding:'6px 4px',borderRadius:'8px',background:C.g,boxShadow:design.font===f.id?insetSm:raisedSm,border:`1px solid ${design.font===f.id?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,color:design.font===f.id?C.gold:C.smoke,fontSize:'10px',fontWeight:600,cursor:'pointer',transition:'all .15s',outline:'none'}}>{f.name}</button>))}
              </div>
              {/* FIX #2 — Frame picker */}
              <div style={{display:'flex',gap:'5px'}}>
                {PHOTO_FRAMES.map(f=>(
                  <button key={f.id} onClick={()=>setPhotoFrame(f.id)} title={f.label}
                    style={{flex:1,height:'32px',cursor:'pointer',border:`2px solid ${photoFrame===f.id?C.gold:'rgba(255,255,255,0.06)'}`,background:photoFrame===f.id?`rgba(212,168,79,0.1)`:C.g,boxShadow:photoFrame===f.id?insetSm:raisedSm,...f.style,transition:'all .15s',fontSize:'8px',color:photoFrame===f.id?C.gold:C.smoke,fontFamily:"'DM Sans',sans-serif"}}>
                    {f.label}
                  </button>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'6px'}}>
                {[{k:'bg',l:'BG'},{k:'bg2',l:'BG2'},{k:'textColor',l:'Text'},{k:'accent',l:'Accent'}].map(({k,l})=>(
                  <div key={k}>
                    <div style={{fontSize:'9px',color:C.smoke,marginBottom:'3px',fontWeight:600,textAlign:'center'}}>{l}</div>
                    <input type="color" value={(design as any)[k]||'#000000'} onChange={e=>setD(k as keyof Design,e.target.value)} style={{width:'100%',height:'28px',borderRadius:'6px',border:'none',background:C.g,boxShadow:raisedSm,cursor:'pointer',padding:'2px'}}/>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:'6px'}}>
                <input style={{...nmInp,flex:1,fontSize:'12px',padding:'8px 10px'}} placeholder="Promo code" value={promoCode} onChange={e=>setPromoCode(e.target.value.toUpperCase())}/>
                <button onClick={validatePromo} style={{padding:'8px 12px',background:C.g,boxShadow:raisedSm,border:'none',borderRadius:'8px',color:promoValid?C.gold:C.smoke,fontSize:'11px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Apply</button>
              </div>
            </>)}

            {activeTab==='preview'&&(
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                <div style={{fontSize:'11px',color:C.smoke,textAlign:'center',opacity:.7}}>Tap the card above to flip it</div>
                {existingCard&&(
                  <div style={{padding:'12px',background:C.g,boxShadow:insetSm,borderRadius:'12px',fontSize:'11px',color:C.smoke}}>
                    <div><span style={{color:C.gold,fontWeight:700}}>Live at:</span> /c/{existingCard.slug}</div>
                  </div>
                )}
                <button onClick={()=>submit()} disabled={submitting}
                  style={{width:'100%',padding:'14px',background:`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`,color:C.carbon,borderRadius:'12px',fontWeight:700,fontSize:'14px',border:'none',cursor:'pointer',boxShadow:goldBox,fontFamily:"'DM Sans',sans-serif",opacity:submitting?.6:1}}>
                  {submitting?'Processing…':existingCard?'Update card':'✨ Generate my card — $20'}
                </button>
                <p style={{fontSize:'10px',color:C.smoke,textAlign:'center',opacity:.6}}>{existingCard?'Free changes instant · Identity $10':'One-time · Colors & content free'}</p>
              </div>
            )}
          </div>
        </>)}
      </div>
    </div>
  )

  // ── DESKTOP ───────────────────────────────────────────────────
  return (
    <div style={{height:'100dvh',background:C.g,display:'flex',flexDirection:'column',fontFamily:"'DM Sans',sans-serif",overflow:'hidden'}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 20px',background:C.g,boxShadow:`0 4px 16px ${C.nd}`,borderBottom:'1px solid rgba(255,255,255,0.03)',flexShrink:0}}>
        <div style={{padding:'8px 14px',background:C.g,boxShadow:raised,borderRadius:'12px',border:'1px solid rgba(212,168,79,0.07)',display:'inline-flex',alignItems:'center'}}>
          <img src="/logo.png" alt="Vynk" style={{width:'80px',height:'auto',display:'block'}}/>
        </div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <div style={{fontSize:'11px',color:C.smoke,padding:'6px 12px',background:C.g,boxShadow:insetSm,borderRadius:'8px'}}>Card Builder</div>
          {existingCard&&<Link href={`/c/${existingCard.slug}`} style={{fontSize:'11px',color:C.gold,textDecoration:'none',padding:'6px 12px',background:C.g,boxShadow:raisedSm,borderRadius:'8px'}}>View card →</Link>}
        </div>
      </nav>

      {showWarning&&(
        <div style={{position:'fixed',inset:0,background:'rgba(5,6,7,0.88)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <div style={{background:C.g,boxShadow:`14px 14px 36px ${C.nd},-8px -8px 24px ${C.nl}`,borderRadius:'24px',padding:'36px',maxWidth:'420px',width:'100%',border:'1px solid rgba(212,168,79,0.08)'}}>
            <div style={{fontSize:'28px',marginBottom:'12px'}}>⚠️</div>
            <h2 style={{fontSize:'16px',fontWeight:700,marginBottom:'8px',color:C.silver,fontFamily:"'Syne',sans-serif"}}>Identity change detected</h2>
            <p style={{color:C.smoke,fontSize:'13px',marginBottom:'20px',lineHeight:1.7}}>Changed: <span style={{color:C.gold,fontWeight:600}}>{paidChanges.map(k=>FIELD_LABELS[k]||k).join(', ')}</span><br/><br/>Your current card will be <strong style={{color:C.silver}}>archived</strong> and a new one published for <strong style={{color:C.gold}}>$10</strong>.</p>
            <div style={{display:'flex',gap:'12px'}}>
              <button onClick={()=>{setShowWarning(false);setPaidChanges([])}} style={{flex:1,padding:'12px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(255,255,255,0.04)',borderRadius:'12px',color:C.smoke,fontSize:'13px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
              <button onClick={()=>{setShowWarning(false);submit(true)}} style={{flex:1,padding:'12px',background:`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`,color:C.carbon,borderRadius:'12px',fontSize:'13px',fontWeight:700,border:'none',cursor:'pointer',boxShadow:goldBox,fontFamily:"'DM Sans',sans-serif"}}>Pay $10 & update</button>
            </div>
          </div>
        </div>
      )}

      <div style={{flex:1,display:'flex',overflow:'hidden'}}>
        <aside style={{width:'320px',flexShrink:0,background:C.g,borderRight:'1px solid rgba(255,255,255,0.03)',display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{display:'flex',gap:'6px',padding:'12px 14px',borderBottom:'1px solid rgba(255,255,255,0.03)',flexShrink:0}}>
            {tabBtn('front','Front')}
            {tabBtn('back','Back')}
            {tabBtn('design','Design')}
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'16px 14px',display:'flex',flexDirection:'column',gap:'10px'}}>

            {activeTab==='front'&&(<>
              <div style={{fontSize:'9px',color:C.gold,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',display:'flex',alignItems:'center',gap:'8px'}}><div style={{width:'16px',height:'1px',background:C.gold}}/> Identity — $10 to change</div>
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
                  <label style={lbl}>Photo <span style={{color:C.smoke,fontWeight:400,fontSize:'9px'}}>(drag to reposition)</span></label>
                  <div style={{display:'flex',gap:'4px'}}>
                    <button onClick={()=>photoRef.current?.click()} style={{flex:1,padding:'9px',background:C.g,boxShadow:form.photoUrl?insetSm:raisedSm,border:`1px solid ${form.photoUrl?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,borderRadius:'10px',color:form.photoUrl?C.gold:C.smoke,fontSize:'11px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{form.photoUrl?'✓ Photo':'Upload'}</button>
                    {form.photoUrl&&<button onClick={()=>set('photoUrl','')} style={{padding:'9px 10px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',color:'#ef4444',fontSize:'12px',cursor:'pointer',lineHeight:1}}>✕</button>}
                  </div>
                  <input ref={photoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e,'photoUrl')}/>
                </div>
                <div>
                  <label style={lbl}>Logo <span style={{color:C.smoke,fontWeight:400,fontSize:'9px'}}>(drag to reposition)</span></label>
                  <div style={{display:'flex',gap:'4px'}}>
                    <button onClick={()=>logoRef.current?.click()} style={{flex:1,padding:'9px',background:C.g,boxShadow:form.logoUrl?insetSm:raisedSm,border:`1px solid ${form.logoUrl?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,borderRadius:'10px',color:form.logoUrl?C.gold:C.smoke,fontSize:'11px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{form.logoUrl?'✓ Logo':'Upload'}</button>
                    {form.logoUrl&&<button onClick={()=>set('logoUrl','')} style={{padding:'9px 10px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',color:'#ef4444',fontSize:'12px',cursor:'pointer',lineHeight:1}}>✕</button>}
                  </div>
                  <input ref={logoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e,'logoUrl')}/>
                </div>
              </div>
              {/* FIX #2 — Photo controls desktop */}
              {(form.photoUrl||form.logoUrl)&&<PhotoControls/>}
            </>)}

            {activeTab==='back'&&(<>
              <div style={{fontSize:'9px',color:'#4ade80',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',display:'flex',alignItems:'center',gap:'8px'}}><div style={{width:'16px',height:'1px',background:'#4ade80'}}/> Content — always free</div>
              <div><label style={lbl}>Tagline</label><input style={nmInp} placeholder="We craft brands that move people." value={form.tagline} onChange={e=>set('tagline',e.target.value)}/></div>
              <div><label style={lbl}>Bio</label><textarea style={{...nmInp,height:'72px',resize:'none' as const,lineHeight:1.5}} value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="Brief description..."/></div>
              <div><label style={lbl}>Services (comma-separated)</label><input style={nmInp} placeholder="Branding, Strategy, UX" value={form.services} onChange={e=>set('services',e.target.value)}/></div>
              <div><label style={lbl}>Website</label><input style={nmInp} placeholder="yoursite.com" value={form.website} onChange={e=>set('website',e.target.value)}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                {(['instagram','linkedin','twitter','telegram','tiktok','youtube'] as const).map(k=>(
                  <div key={k}><label style={lbl}>{k.charAt(0).toUpperCase()+k.slice(1)}</label><input style={nmInp} placeholder="@handle" value={form[k]} onChange={e=>set(k,e.target.value)}/></div>
                ))}
              </div>
            </>)}

            {activeTab==='design'&&(<>
              <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                {CATS.map(cat=>(<button key={cat} onClick={()=>setActiveCat(cat)} style={{padding:'4px 8px',borderRadius:'20px',border:'none',background:activeCat===cat?`rgba(212,168,79,0.12)`:'rgba(255,255,255,0.04)',color:activeCat===cat?C.gold:C.smoke,fontSize:'10px',fontWeight:activeCat===cat?700:400,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{cat}</button>))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'5px'}}>
                {TEMPLATES.filter((t:any)=>t.cat===activeCat).map((t:any)=>(
                  <button key={t.id} title={t.label} onClick={()=>{setDesign(d=>({...d,template:t.id,bg:t.bg,bg2:t.bg2,textColor:t.textColor,accent:t.accent,mode:t.mode}))}}
                    style={{height:'36px',borderRadius:'8px',cursor:'pointer',background:t.mode==='gradient'?`linear-gradient(135deg,${t.bg},${t.bg2})`:t.bg,border:`2px solid ${design.template===t.id?t.accent:'rgba(255,255,255,0.06)'}`,boxShadow:design.template===t.id?`0 0 0 1px ${t.accent}55`:raisedSm,transition:'all .15s',position:'relative',overflow:'hidden'}}>
                    {t.svg&&<div style={{position:'absolute',inset:0,backgroundImage:`url("data:image/svg+xml;utf8,${encodeURIComponent(t.svg)}")`,backgroundSize:'cover',opacity:.6}}/>}
                    <div style={{position:'absolute',bottom:'2px',right:'3px',width:'4px',height:'4px',borderRadius:'50%',background:t.accent,zIndex:1}}/>
                  </button>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'5px'}}>
                {FONTS.map((f:any)=>(<button key={f.id} onClick={()=>setD('font',f.id)} style={{fontFamily:f.css,padding:'6px 4px',borderRadius:'8px',background:C.g,boxShadow:design.font===f.id?insetSm:raisedSm,border:`1px solid ${design.font===f.id?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,color:design.font===f.id?C.gold:C.smoke,fontSize:'10px',fontWeight:600,cursor:'pointer',transition:'all .15s',outline:'none'}}>{f.name}</button>))}
              </div>
              {/* FIX #2 — Frame picker desktop */}
              <div>
                <label style={lbl}>Photo Frame</label>
                <div style={{display:'flex',gap:'6px'}}>
                  {PHOTO_FRAMES.map(f=>(
                    <button key={f.id} onClick={()=>setPhotoFrame(f.id)} title={f.label}
                      style={{flex:1,height:'36px',cursor:'pointer',border:`2px solid ${photoFrame===f.id?C.gold:'rgba(255,255,255,0.06)'}`,background:photoFrame===f.id?`rgba(212,168,79,0.1)`:C.g,boxShadow:photoFrame===f.id?insetSm:raisedSm,...f.style,transition:'all .15s',fontSize:'9px',color:photoFrame===f.id?C.gold:C.smoke,fontFamily:"'DM Sans',sans-serif"}}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'8px'}}>
                {[{k:'bg',l:'BG'},{k:'bg2',l:'BG2'},{k:'textColor',l:'Text'},{k:'accent',l:'Accent'}].map(({k,l})=>(
                  <div key={k}>
                    <div style={{fontSize:'9px',color:C.smoke,marginBottom:'3px',fontWeight:600,textAlign:'center'}}>{l}</div>
                    <input type="color" value={(design as any)[k]||'#000000'} onChange={e=>setD(k as keyof Design,e.target.value)} style={{width:'100%',height:'28px',borderRadius:'6px',border:'none',background:C.g,boxShadow:raisedSm,cursor:'pointer',padding:'2px'}}/>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:'6px'}}>
                <input style={{...nmInp,flex:1,fontSize:'12px',padding:'8px 10px'}} placeholder="Promo code" value={promoCode} onChange={e=>setPromoCode(e.target.value.toUpperCase())}/>
                <button onClick={validatePromo} style={{padding:'8px 12px',background:C.g,boxShadow:raisedSm,border:'none',borderRadius:'8px',color:promoValid?C.gold:C.smoke,fontSize:'11px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Apply</button>
              </div>
            </>)}
          </div>

          <div style={{padding:'14px',borderTop:'1px solid rgba(255,255,255,0.03)',flexShrink:0}}>
            <button onClick={()=>submit()} disabled={submitting}
              style={{width:'100%',padding:'14px',background:`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`,color:C.carbon,borderRadius:'14px',fontWeight:700,fontSize:'14px',border:'none',cursor:'pointer',boxShadow:goldBox,fontFamily:"'DM Sans',sans-serif",opacity:submitting?.7:1}}>
              {submitting?'Processing…':existingCard?'Update card':'✨ Generate my card — $20'}
            </button>
            <p style={{fontSize:'10px',color:C.smoke,textAlign:'center',marginTop:'8px',opacity:.6}}>{existingCard?'Free changes instant · Identity $10':'One-time payment · Colors & content free forever'}</p>
          </div>
        </aside>

        {/* CARD CANVAS */}
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse 60% 80% at 50% 50%, ${tpl?.glow||'rgba(212,168,79,0.1)'} 0%, transparent 70%)`,pointerEvents:'none'}}/>
          <div style={{background:C.g,boxShadow:`12px 12px 30px ${C.nd},-7px -7px 20px ${C.nl}`,borderRadius:'24px',padding:'12px',border:`1px solid ${tpl?.border||'rgba(212,168,79,0.15)'}`,width:'460px',maxWidth:'90%',position:'relative'}}>
            <div style={{perspective:'1200px'}}>
              <div ref={cardRef} onClick={()=>!dragging&&setIsFlipped(f=>!f)} style={{position:'relative',transformStyle:'preserve-3d',transition:dragging?'none':'transform .7s cubic-bezier(0.23,1,0.32,1)',transform:isFlipped?'rotateY(180deg)':'rotateY(0deg)',cursor:'pointer',borderRadius:'20px',userSelect:'none'}}>
                {/* FRONT */}
                <div style={{backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',background:cardBg,borderRadius:'20px',padding:'32px',color:design.textColor,minHeight:'300px',display:'flex',flexDirection:'column',justifyContent:'space-between',fontFamily:fontCss,boxShadow:`0 24px 64px ${C.nd}`,position:'relative',overflow:'hidden'}}>
                  {tpl?.overlay&&tpl.overlay!=='none'&&<div style={{position:'absolute',inset:0,background:tpl.overlay,pointerEvents:'none'}}/>}
                  <div style={{position:'absolute',inset:0,backgroundImage:svgOverlay,backgroundSize:'100% 100%',pointerEvents:'none'}}/>
                  <div style={{position:'absolute',inset:0,borderRadius:'20px',border:`1px solid ${tpl?.border||'rgba(212,168,79,0.15)'}`,pointerEvents:'none'}}/>
                  {/* FIX #2 — Draggable photo with frame + scale + rotate */}
                  {form.photoUrl&&(
                    <div onMouseDown={e=>startDrag(e,'photo')} style={{position:'absolute',left:`${photoPos.x}%`,top:`${photoPos.y}%`,width:'64px',height:'64px',overflow:'hidden',cursor:dragging==='photo'?'grabbing':'grab',zIndex:10,...frameShape,border:`2px solid ${design.accent}60`,boxShadow:`0 4px 16px rgba(0,0,0,0.5)`,transform:`scale(${photoScale}) rotate(${photoRotate}deg)`,transformOrigin:'center',transition:dragging==='photo'?'none':'transform .15s'}}>
                      <img src={form.photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} draggable={false}/>
                    </div>
                  )}
                  {form.logoUrl&&(
                    <div onMouseDown={e=>startDrag(e,'logo')} style={{position:'absolute',left:`${logoPos.x}%`,top:`${logoPos.y}%`,cursor:dragging==='logo'?'grabbing':'grab',zIndex:10,transform:`scale(${logoScale}) rotate(${logoRotate}deg)`,transformOrigin:'center',transition:dragging==='logo'?'none':'transform .15s'}}>
                      <img src={form.logoUrl} alt="logo" style={{height:'30px',objectFit:'contain',filter:`drop-shadow(0 2px 8px rgba(0,0,0,0.6))`}} draggable={false}/>
                    </div>
                  )}
                  <div style={{position:'relative',zIndex:1}}>
                    <div style={{fontSize:'9px',fontWeight:700,letterSpacing:'.14em',opacity:.3,textTransform:'uppercase' as const,marginBottom:'18px',color:design.accent}}>VYNK</div>
                    <div style={{fontSize:'28px',fontWeight:700,lineHeight:1.15,marginBottom:'6px'}}>{form.fullName||'Your Name'}</div>
                    <div style={{fontSize:'13px',opacity:.7}}>{[form.title,form.company].filter(Boolean).join(' · ')||'Title · Company'}</div>
                    {form.tagline&&<div style={{fontSize:'11px',opacity:.5,marginTop:'8px',lineHeight:1.6,maxWidth:'55%'}}>{form.tagline}</div>}
                  </div>
                  {!form.photoUrl&&(
                    <div style={{position:'absolute',top:'28px',right:'28px',width:'56px',height:'56px',borderRadius:'50%',background:`${design.accent}18`,border:`2px solid ${design.accent}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:700,color:design.accent}}>{initials}</div>
                  )}
                  <div style={{position:'relative',zIndex:1}}>
                    {form.email&&<div style={{fontSize:'11px',opacity:.55,marginBottom:'2px'}}>{form.email}</div>}
                    {form.website&&<div style={{fontSize:'11px',opacity:.35}}>{form.website.replace(/^https?:\/\//,'')}</div>}
                    <div style={{marginTop:'14px',width:'60%',height:'1px',background:`linear-gradient(90deg,${design.accent}60,transparent)`}}/>
                  </div>
                </div>
                {/* BACK */}
                <div style={{backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',transform:'rotateY(180deg)',position:'absolute',top:0,left:0,right:0,bottom:0,background:cardBg,borderRadius:'20px',padding:'32px',color:design.textColor,minHeight:'300px',display:'flex',flexDirection:'column',gap:'14px',fontFamily:fontCss,filter:'brightness(0.85)',overflow:'hidden'}}>
                  {tpl?.overlay&&tpl.overlay!=='none'&&<div style={{position:'absolute',inset:0,background:tpl.overlay,pointerEvents:'none'}}/>}
                  <div style={{position:'absolute',inset:0,backgroundImage:svgOverlay,backgroundSize:'100% 100%',pointerEvents:'none'}}/>
                  <div style={{position:'absolute',inset:0,borderRadius:'20px',border:`1px solid ${tpl?.border||'rgba(212,168,79,0.15)'}`,pointerEvents:'none'}}/>
                  <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',gap:'12px',height:'100%'}}>
                    <div style={{fontSize:'9px',opacity:.3,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase' as const,color:design.accent}}>VYNK · SERVICES</div>
                    {form.services&&(
                      <div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>
                        {form.services.split(',').filter(Boolean).map(s=>(
                          <span key={s} style={{padding:'4px 12px',borderRadius:'20px',fontSize:'10px',fontWeight:600,background:`${design.accent}18`,border:`1px solid ${design.accent}35`,color:design.accent}}>{s.trim()}</span>
                        ))}
                      </div>
                    )}
                    {form.bio&&<div style={{fontSize:'12px',opacity:.65,lineHeight:1.7}}>{form.bio}</div>}
                    <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginTop:'auto'}}>
                      {(['whatsapp','instagram','linkedin','twitter','tiktok','telegram'] as const).filter(k=>form[k]).map(k=>(
                        <span key={k} style={{width:'32px',height:'32px',borderRadius:'9px',background:`${design.accent}15`,border:`1px solid ${design.accent}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:700,color:design.accent}}>{k.slice(0,2).toUpperCase()}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'12px',padding:'0 4px'}}>
              <span style={{fontSize:'10px',color:C.smoke}}><span style={{color:C.gold,fontWeight:700}}>{tpl?.label}</span> · {(FONTS.find((f:any)=>f.id===design.font)||FONTS[0]||{name:''}).name}</span>
              <span style={{fontSize:'10px',color:C.smoke}}>Click to flip ↻</span>
            </div>
          </div>
          {existingCard&&(
            <div style={{background:C.g,boxShadow:insetSm,borderRadius:'10px',padding:'8px 16px',fontSize:'11px',color:C.smoke,position:'absolute',bottom:'20px',left:'50%',transform:'translateX(-50%)',whiteSpace:'nowrap'}}>
              Active: <span style={{color:C.gold}}>/c/{existingCard.slug}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
