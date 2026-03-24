'use client'
// src/app/admin/page.tsx

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const C = { g:'#0D0F12', gold:'#D4A84F', goldLt:'#E8C06A', goldDk:'#A07830', silver:'#BFC3C9', smoke:'#6F737A', carbon:'#050607', nd:'#08090B', nl:'#141720', red:'#ef4444', green:'#22c55e' }
const raised   = `5px 5px 14px ${C.nd}, -3px -3px 10px ${C.nl}`
const raisedSm = `3px 3px 8px ${C.nd}, -2px -2px 6px ${C.nl}`
const insetSm  = `inset 2px 2px 6px ${C.nd}, inset -2px -2px 5px ${C.nl}`
const goldBox  = `4px 4px 14px ${C.nd}, 0 0 22px rgba(212,168,79,0.2)`

type PhoneMode = 'required'|'optional'|'off'
type Section = 'overview'|'clients'|'orders'|'accounting'|'metrics'|'promos'|'business'|'security'

const fmt$ = (c:number) => `$${(c/100).toFixed(2)}`
const fmtDate = (d:any) => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'

function Stat({ label, value }:{ label:string; value:string }) {
  return (
    <div style={{ background:C.g, boxShadow:raised, borderRadius:'18px', padding:'20px 22px', border:'1px solid rgba(255,255,255,0.03)', flex:'1 1 150px', minWidth:'130px' }}>
      <div style={{ fontSize:'10px', color:C.smoke, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:'8px' }}>{label}</div>
      <div style={{ fontSize:'24px', fontWeight:800, color:C.gold, fontFamily:"'Syne',sans-serif" }}>{value}</div>
    </div>
  )
}
function Card({ children, style }:{ children:React.ReactNode; style?:React.CSSProperties }) {
  return <div style={{ background:C.g, boxShadow:raised, borderRadius:'20px', padding:'24px', border:'1px solid rgba(255,255,255,0.03)', ...style }}>{children}</div>
}
function SHead({ title, sub }:{ title:string; sub?:string }) {
  return (
    <div style={{ marginBottom:'22px' }}>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'20px', fontWeight:800, color:C.silver, marginBottom:'3px' }}>{title}</h2>
      {sub&&<p style={{ fontSize:'13px', color:C.smoke }}>{sub}</p>}
    </div>
  )
}

function PhoneModeToggle() {
  const [mode, setMode]     = useState<PhoneMode>('required')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/phone-settings')
      const d = await r.json()
      if (d.mode) setMode(d.mode)
    } catch { toast.error('No se pudo cargar la config del teléfono') }
    setLoading(false)
  }

  async function apply(m:PhoneMode) {
    setSaving(true)
    try {
      const r = await fetch('/api/admin/phone-settings', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({mode:m}) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setMode(m)
      toast.success(`Filtro de teléfono: ${m}`)
    } catch(e:any) { toast.error('Error: '+e.message) }
    setSaving(false)
  }

  const OPTS:[PhoneMode,string,string,string][] = [
    ['required','🔒','Obligatorio','El usuario DEBE ingresar teléfono. Máxima seguridad.'],
    ['optional','⚡','Opcional','Campo visible pero no requerido. Todos pueden pasar.'],
    ['off',     '📵','Desactivado','Campo oculto completamente. Máxima accesibilidad.'],
  ]

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'18px' }}>
        <span style={{ fontSize:'24px' }}>📱</span>
        <div>
          <div style={{ fontSize:'15px', fontWeight:700, color:C.silver }}>Filtro de Número de Teléfono</div>
          <div style={{ fontSize:'12px', color:C.smoke }}>Controla si el teléfono es obligatorio en el registro</div>
        </div>
        {loading&&<span style={{ marginLeft:'auto', fontSize:'12px', color:C.smoke }}>Cargando…</span>}
      </div>
      <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'16px' }}>
        {OPTS.map(([key,icon,label,desc]) => {
          const active = mode===key
          const color  = key==='required'?C.red:key==='optional'?C.gold:C.smoke
          return (
            <button key={key} onClick={()=>!saving&&!loading&&apply(key as PhoneMode)} disabled={saving||loading}
              style={{ flex:'1 1 150px', padding:'16px 14px', textAlign:'left', borderRadius:'14px', border:active?`1px solid ${color}40`:'1px solid rgba(255,255,255,0.03)', background:C.g, boxShadow:active?insetSm:raisedSm, cursor:saving||loading?'not-allowed':'pointer', transition:'all .2s', opacity:saving?.6:1 }}>
              <div style={{ fontSize:'20px', marginBottom:'6px' }}>{icon}</div>
              <div style={{ fontSize:'13px', fontWeight:700, color:active?color:C.silver, marginBottom:'4px' }}>
                {label} {active&&<span style={{ marginLeft:'7px', fontSize:'9px', background:`${color}20`, color, padding:'2px 6px', borderRadius:'5px', fontWeight:700 }}>ACTIVO</span>}
              </div>
              <div style={{ fontSize:'11px', color:C.smoke, lineHeight:1.5 }}>{desc}</div>
            </button>
          )
        })}
      </div>
      <div style={{ padding:'12px 14px', background:'rgba(255,255,255,0.02)', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.04)', fontSize:'11px', color:C.smoke, lineHeight:1.7 }}>
        💡 <strong style={{ color:C.silver }}>Bypass por código promo:</strong> Aunque esté en "Obligatorio", si el usuario aplica un código con <em>Phone Bypass ON</em>, el campo se oculta solo para él. Configúralo en <strong style={{ color:C.gold }}>Códigos Promo</strong>.
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [active, setActive]       = useState<Section>('overview')
  const [data, setData]           = useState<any>({})
  const [loading, setLoading]     = useState(false)
  const [newPromo, setNewPromo]   = useState({ code:'', discountType:'percent', discountValue:'', appliesTo:'both', maxUses:'', phoneBypass:false })
  const [editPromo, setEditPromo] = useState<any>(null)

  useEffect(() => { if(active!=='business') fetchSection(active) }, [active])

  async function fetchSection(s:Section) {
    setLoading(true)
    try {
      const r = await fetch(`/api/admin/dashboard?section=${s}`)
      if(r.status===401){ router.push('/admin/login'); return }
      setData((p:any)=>({ ...p, [s]: await r.json() }))
    } catch { toast.error('Error al cargar datos') }
    setLoading(false)
  }

  async function logout() {
    await fetch('/api/admin/auth', { method:'DELETE' })
    router.push('/admin/login')
  }

  async function createPromo() {
    if(!newPromo.code) return toast.error('El código es requerido')
    const r = await fetch('/api/admin/dashboard', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...newPromo,discountValue:Number(newPromo.discountValue)||0,maxUses:newPromo.maxUses?Number(newPromo.maxUses):null}) })
    const d = await r.json()
    if(!r.ok) return toast.error(d.error)
    toast.success('Código creado')
    setNewPromo({ code:'', discountType:'percent', discountValue:'', appliesTo:'both', maxUses:'', phoneBypass:false })
    fetchSection('promos')
  }

  async function togglePromo(id:string, isActive:boolean) {
    await fetch('/api/admin/dashboard', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id,isActive}) })
    fetchSection('promos')
  }

  async function deletePromo(id:string) {
    if(!confirm('¿Eliminar este código?')) return
    await fetch('/api/admin/dashboard', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id}) })
    toast.success('Eliminado'); fetchSection('promos')
  }

  async function saveEdit() {
    await fetch('/api/admin/dashboard', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'update',...editPromo}) })
    toast.success('Actualizado'); setEditPromo(null); fetchSection('promos')
  }

  const NAV:{key:Section;icon:string;label:string}[] = [
    {key:'overview',   icon:'⚡', label:'Overview'},
    {key:'clients',    icon:'👥', label:'Clientes'},
    {key:'orders',     icon:'💳', label:'Órdenes'},
    {key:'accounting', icon:'📊', label:'Contabilidad'},
    {key:'metrics',    icon:'📈', label:'Métricas'},
    {key:'promos',     icon:'🎟', label:'Códigos Promo'},
    {key:'business',   icon:'⚙️', label:'Business Rules'},
    {key:'security',   icon:'🔐', label:'Seguridad'},
  ]

  function renderOverview() {
    const d = data.overview; if(!d) return null
    return <>
      <SHead title="Overview" sub="Resumen en tiempo real" />
      <div style={{ display:'flex', gap:'14px', flexWrap:'wrap', marginBottom:'24px' }}>
        <Stat label="Hoy" value={fmt$(d.todayCents||0)} />
        <Stat label="Total" value={fmt$(d.totalCents||0)} />
        <Stat label="Tarjetas Activas" value={String(d.activeCards||0)} />
        <Stat label="Usuarios" value={String(d.totalUsers||0)} />
      </div>
      <Card>
        <div style={{ fontSize:'13px', fontWeight:700, color:C.silver, marginBottom:'14px' }}>Pagos Recientes</div>
        {!d.recentPayments?.length ? <div style={{ color:C.smoke,fontSize:'13px' }}>Sin pagos aún.</div>
          : d.recentPayments.map((p:any) => (
          <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
            <div>
              <div style={{ fontSize:'13px', color:C.silver, fontWeight:600 }}>{fmt$(p.amount_cents)} · {p.type}</div>
              <div style={{ fontSize:'11px', color:C.smoke }}>{fmtDate(p.created_at)}</div>
            </div>
            <span style={{ padding:'3px 9px', borderRadius:'6px', fontSize:'10px', fontWeight:700, background:p.status==='paid'?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)', color:p.status==='paid'?C.green:C.red }}>{p.status?.toUpperCase()}</span>
          </div>
        ))}
      </Card>
    </>
  }

  function renderClients() {
    const d = data.clients; if(!d) return null
    return <>
      <SHead title="Clientes" sub={`${d.clients?.length||0} usuarios registrados`} />
      <Card>
        {!d.clients?.length ? <div style={{ color:C.smoke,fontSize:'13px' }}>Sin usuarios.</div>
          : d.clients.map((u:any) => (
          <div key={u.id} style={{ padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize:'13px', color:C.silver, fontWeight:600 }}>{u.email}</div>
            <div style={{ fontSize:'11px', color:C.smoke }}>{u.clerk_id} · {fmtDate(u.created_at)}</div>
          </div>
        ))}
      </Card>
    </>
  }

  function renderOrders() {
    const d = data.orders; if(!d) return null
    return <>
      <SHead title="Órdenes" sub="Todos los registros de pago" />
      <Card>
        {!d.orders?.length ? <div style={{ color:C.smoke,fontSize:'13px' }}>Sin órdenes.</div>
          : d.orders.map((p:any) => (
          <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
            <div>
              <div style={{ fontSize:'13px', color:C.silver, fontWeight:600 }}>{fmt$(p.amount_cents)} · {p.type}</div>
              <div style={{ fontSize:'11px', color:C.smoke }}>{p.user_id} · {fmtDate(p.created_at)}</div>
            </div>
            <span style={{ padding:'3px 9px', borderRadius:'6px', fontSize:'10px', fontWeight:700, background:p.status==='paid'?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)', color:p.status==='paid'?C.green:C.red }}>{p.status?.toUpperCase()}</span>
          </div>
        ))}
      </Card>
    </>
  }

  function renderAccounting() {
    const d = data.accounting; if(!d) return null
    return <>
      <SHead title="Contabilidad" sub="Desglose mensual" />
      <Card>
        <div style={{ fontSize:'13px', fontWeight:700, color:C.silver, marginBottom:'14px' }}>Por Mes</div>
        {!d.monthly?.length ? <div style={{ color:C.smoke,fontSize:'13px' }}>Sin datos.</div>
          : d.monthly.map((r:any,i:number) => (
          <div key={i} style={{ display:'flex', gap:'16px', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.03)', flexWrap:'wrap' }}>
            <div style={{ fontSize:'12px', color:C.smoke, minWidth:'80px' }}>{r.month}</div>
            <div style={{ fontSize:'13px', color:C.gold, fontWeight:700 }}>{fmt$(Number(r.gross_cents))}</div>
            <div style={{ fontSize:'12px', color:C.smoke }}>neto {fmt$(Number(r.net_cents))}</div>
            <div style={{ fontSize:'11px', color:C.smoke }}>{r.transactions} txn</div>
          </div>
        ))}
      </Card>
    </>
  }

  function renderMetrics() {
    const d = data.metrics; if(!d) return null
    return <>
      <SHead title="Métricas" sub="Vistas y guardados" />
      <div style={{ display:'flex', gap:'14px', flexWrap:'wrap', marginBottom:'20px' }}>
        <Stat label="Vistas Totales" value={String(d.totalViews||0)} />
        <Stat label="Contactos Guardados" value={String(d.totalSaves||0)} />
      </div>
      <Card>
        <div style={{ fontSize:'13px', fontWeight:700, color:C.silver, marginBottom:'12px' }}>Por País</div>
        {d.byCountry?.map((r:any,i:number) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize:'13px', color:C.silver }}>{r.country||'Desconocido'}</span>
            <span style={{ fontSize:'13px', color:C.gold, fontWeight:700 }}>{r.cnt}</span>
          </div>
        ))}
      </Card>
    </>
  }

  function renderPromos() {
    const d = data.promos
    return <>
      <SHead title="Códigos Promo" sub="Crea y administra descuentos" />
      <Card style={{ marginBottom:'16px' }}>
        <div style={{ fontSize:'13px', fontWeight:700, color:C.silver, marginBottom:'16px' }}>Nuevo Código</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'10px', marginBottom:'14px' }}>
          {[['code','Código','SUMMER25',true],['discountValue','Valor','20',false],['maxUses','Máx. usos','ilimitado',false]].map(([k,l,p,up]:[any,any,any,any]) => (
            <div key={k}>
              <div style={{ fontSize:'10px', color:C.smoke, marginBottom:'5px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em' }}>{l}</div>
              <input value={(newPromo as any)[k]} onChange={e=>setNewPromo(pr=>({...pr,[k]:up?e.target.value.toUpperCase():e.target.value}))} placeholder={p}
                style={{ width:'100%', padding:'9px 12px', background:C.g, boxShadow:insetSm, border:'1px solid rgba(255,255,255,0.04)', borderRadius:'10px', color:C.silver, fontSize:'13px', fontFamily:"'DM Sans',sans-serif", outline:'none' }}/>
            </div>
          ))}
          {[['discountType','Tipo',[['percent','Porcentaje %'],['fixed','Fijo $'],['free','Gratis']]],['appliesTo','Aplica a',[['both','Ambos'],['new_card','Tarjeta nueva'],['renewal','Renovación']]]].map(([k,l,opts]:[any,any,any]) => (
            <div key={k}>
              <div style={{ fontSize:'10px', color:C.smoke, marginBottom:'5px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em' }}>{l}</div>
              <select value={(newPromo as any)[k]} onChange={e=>setNewPromo(pr=>({...pr,[k]:e.target.value}))}
                style={{ width:'100%', padding:'9px 12px', background:C.g, boxShadow:insetSm, border:'1px solid rgba(255,255,255,0.04)', borderRadius:'10px', color:C.silver, fontSize:'13px', fontFamily:"'DM Sans',sans-serif", outline:'none' }}>
                {opts.map(([v,l2]:[string,string])=><option key={v} value={v}>{l2}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* Phone Bypass toggle */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px', background:'rgba(255,255,255,0.02)', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.04)', marginBottom:'14px' }}>
          <button onClick={()=>setNewPromo(p=>({...p,phoneBypass:!p.phoneBypass}))}
            style={{ width:'40px', height:'22px', borderRadius:'11px', border:'none', cursor:'pointer', background:newPromo.phoneBypass?`linear-gradient(135deg,${C.gold},${C.goldLt})`:C.g, boxShadow:newPromo.phoneBypass?`0 0 10px rgba(212,168,79,0.3)`:insetSm, position:'relative', flexShrink:0, transition:'all .2s' }}>
            <div style={{ width:'16px', height:'16px', borderRadius:'50%', background:newPromo.phoneBypass?C.carbon:C.smoke, position:'absolute', top:'3px', left:newPromo.phoneBypass?'21px':'3px', transition:'left .2s' }}/>
          </button>
          <div>
            <div style={{ fontSize:'12px', fontWeight:700, color:newPromo.phoneBypass?C.gold:C.silver }}>Phone Bypass — {newPromo.phoneBypass?'ON':'OFF'}</div>
            <div style={{ fontSize:'11px', color:C.smoke }}>Oculta el campo de teléfono para los usuarios que usen este código</div>
          </div>
        </div>

        <button onClick={createPromo}
          style={{ padding:'11px 24px', background:`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`, color:C.carbon, borderRadius:'12px', fontWeight:700, fontSize:'13px', border:'none', cursor:'pointer', boxShadow:goldBox, fontFamily:"'DM Sans',sans-serif" }}>
          + Crear Código
        </button>
      </Card>

      <Card>
        <div style={{ fontSize:'13px', fontWeight:700, color:C.silver, marginBottom:'14px' }}>Códigos Existentes</div>
        {!d ? <div style={{ color:C.smoke,fontSize:'13px' }}>Cargando…</div>
          : !d.promos?.length ? <div style={{ color:C.smoke,fontSize:'13px' }}>Sin códigos aún.</div>
          : d.promos.map((p:any) => (
          <div key={p.id} style={{ padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
            {editPromo?.id===p.id ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                  <input value={editPromo.discountValue} onChange={e=>setEditPromo((x:any)=>({...x,discountValue:e.target.value}))} placeholder="Valor"
                    style={{ padding:'8px 10px', background:C.g, boxShadow:insetSm, border:'1px solid rgba(255,255,255,0.04)', borderRadius:'8px', color:C.silver, fontSize:'12px', fontFamily:"'DM Sans',sans-serif", outline:'none' }}/>
                  <input value={editPromo.maxUses||''} onChange={e=>setEditPromo((x:any)=>({...x,maxUses:e.target.value}))} placeholder="Máx. usos"
                    style={{ padding:'8px 10px', background:C.g, boxShadow:insetSm, border:'1px solid rgba(255,255,255,0.04)', borderRadius:'8px', color:C.silver, fontSize:'12px', fontFamily:"'DM Sans',sans-serif", outline:'none' }}/>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <button onClick={()=>setEditPromo((x:any)=>({...x,phoneBypass:!x.phoneBypass}))}
                    style={{ width:'36px', height:'20px', borderRadius:'10px', border:'none', cursor:'pointer', background:editPromo.phoneBypass?`linear-gradient(135deg,${C.gold},${C.goldLt})`:C.g, boxShadow:editPromo.phoneBypass?`0 0 8px rgba(212,168,79,0.3)`:insetSm, position:'relative', flexShrink:0, transition:'all .2s' }}>
                    <div style={{ width:'14px', height:'14px', borderRadius:'50%', background:editPromo.phoneBypass?C.carbon:C.smoke, position:'absolute', top:'3px', left:editPromo.phoneBypass?'19px':'3px', transition:'left .2s' }}/>
                  </button>
                  <span style={{ fontSize:'11px', color:editPromo.phoneBypass?C.gold:C.smoke }}>Phone Bypass</span>
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={saveEdit} style={{ padding:'8px 16px', background:`linear-gradient(135deg,${C.gold},${C.goldLt})`, color:C.carbon, borderRadius:'8px', fontWeight:700, fontSize:'12px', border:'none', cursor:'pointer' }}>Guardar</button>
                  <button onClick={()=>setEditPromo(null)} style={{ padding:'8px 16px', background:C.g, boxShadow:raisedSm, color:C.smoke, borderRadius:'8px', fontSize:'12px', border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px', flexWrap:'wrap' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px', flexWrap:'wrap' }}>
                    <span style={{ fontWeight:800, color:C.gold, fontSize:'14px', letterSpacing:'0.06em' }}>{p.code}</span>
                    {p.phoneBypass&&<span style={{ fontSize:'10px', background:'rgba(212,168,79,0.1)', color:C.gold, padding:'2px 7px', borderRadius:'5px', fontWeight:700 }}>📵 PHONE BYPASS</span>}
                    <span style={{ fontSize:'10px', background:p.isActive?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)', color:p.isActive?C.green:C.red, padding:'2px 7px', borderRadius:'5px', fontWeight:700 }}>{p.isActive?'ACTIVO':'INACTIVO'}</span>
                  </div>
                  <div style={{ fontSize:'11px', color:C.smoke }}>
                    {p.discountType==='percent'?`${p.discountValue}%`:p.discountType==='fixed'?`$${(p.discountValue/100).toFixed(2)}`:'Gratis'} · {p.appliesTo}
                    {p.maxUses?` · ${p.usesCount}/${p.maxUses} usos`:''}
                    {p.expiresAt?` · expira ${fmtDate(p.expiresAt)}`:''}
                  </div>
                </div>
                <div style={{ display:'flex', gap:'7px', flexShrink:0 }}>
                  <button onClick={()=>setEditPromo({...p})} style={{ padding:'7px 12px', background:C.g, boxShadow:raisedSm, color:C.smoke, borderRadius:'8px', fontSize:'11px', border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Editar</button>
                  <button onClick={()=>togglePromo(p.id,!p.isActive)} style={{ padding:'7px 12px', background:C.g, boxShadow:raisedSm, color:p.isActive?C.red:C.green, borderRadius:'8px', fontSize:'11px', border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>{p.isActive?'Desactivar':'Activar'}</button>
                  <button onClick={()=>deletePromo(p.id)} style={{ padding:'7px 12px', background:C.g, boxShadow:raisedSm, color:C.red, borderRadius:'8px', fontSize:'11px', border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Eliminar</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </Card>
    </>
  }

  function renderBusiness() {
    return <>
      <SHead title="Business Rules" sub="Control del comportamiento de la plataforma sin tocar código" />
      <Card style={{ marginBottom:'16px' }}><PhoneModeToggle /></Card>
      <Card>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', opacity:.45 }}>
          <span style={{ fontSize:'20px' }}>🔮</span>
          <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:C.silver }}>Más reglas próximamente</div>
            <div style={{ fontSize:'12px', color:C.smoke }}>Rate limiting, geo-blocking, sistema de referidos, Virtual Phone API — Handoff 03+</div>
          </div>
        </div>
      </Card>
    </>
  }

  function renderSecurity() {
    const d = data.security; if(!d) return null
    return <>
      <SHead title="Seguridad" sub="Log de acceso al admin" />
      <Card>
        {!d.logs?.length ? <div style={{ color:C.smoke,fontSize:'13px' }}>Sin eventos.</div>
          : d.logs.map((l:any,i:number) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
            <div>
              <div style={{ fontSize:'13px', color:l.event==='login_success'?C.green:l.event?.includes('fail')?C.red:C.silver, fontWeight:600 }}>{l.event}</div>
              <div style={{ fontSize:'11px', color:C.smoke }}>{l.ip} · {fmtDate(l.created_at)}</div>
            </div>
          </div>
        ))}
      </Card>
    </>
  }

  const RENDER:Record<Section,()=>React.ReactNode> = { overview:renderOverview, clients:renderClients, orders:renderOrders, accounting:renderAccounting, metrics:renderMetrics, promos:renderPromos, business:renderBusiness, security:renderSecurity }

  return (
    <div style={{ minHeight:'100dvh', background:C.g, fontFamily:"'DM Sans',sans-serif", display:'flex' }}>
      <aside style={{ width:'220px', flexShrink:0, background:C.g, boxShadow:`4px 0 20px ${C.nd}`, borderRight:'1px solid rgba(255,255,255,0.03)', display:'flex', flexDirection:'column', padding:'28px 16px' }}>
        <div style={{ padding:'12px 16px', background:C.g, boxShadow:raised, borderRadius:'14px', marginBottom:'28px', border:'1px solid rgba(212,168,79,0.07)' }}>
          <img src="/logo.png" alt="Vynk" style={{ height:'28px', objectFit:'contain', display:'block' }}/>
        </div>
        <div style={{ fontSize:'9px', color:C.smoke, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', marginBottom:'10px', paddingLeft:'8px' }}>Admin Panel</div>
        <nav style={{ display:'flex', flexDirection:'column', gap:'4px', flex:1 }}>
          {NAV.map(n => (
            <button key={n.key} onClick={()=>setActive(n.key)}
              style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', borderRadius:'12px', background:active===n.key?C.g:'transparent', boxShadow:active===n.key?insetSm:'none', border:active===n.key?'1px solid rgba(212,168,79,0.1)':'1px solid transparent', color:active===n.key?C.gold:C.smoke, fontSize:'13px', fontWeight:active===n.key?700:400, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", textAlign:'left', transition:'all .15s' }}>
              <span style={{ fontSize:'15px' }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <button onClick={logout}
          style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px', borderRadius:'12px', background:'transparent', border:'1px solid rgba(239,68,68,0.15)', color:'rgba(239,68,68,0.7)', fontSize:'12px', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", marginTop:'8px' }}>
          🚪 Cerrar sesión
        </button>
      </aside>
      <main style={{ flex:1, padding:'36px 32px', overflowY:'auto', minWidth:0 }}>
        {loading
          ? <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'200px', color:C.smoke, fontSize:'14px' }}>Cargando…</div>
          : RENDER[active]?.()
        }
      </main>
    </div>
  )
}
