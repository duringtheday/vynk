'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const C = {
  g:'#0D0F12', gold:'#D4A84F', goldLt:'#E8C06A', goldDk:'#A07830',
  silver:'#BFC3C9', smoke:'#6F737A', carbon:'#050607',
  nd:'#08090B', nl:'#141720',
}
const raised   = `5px 5px 14px ${C.nd}, -3px -3px 10px ${C.nl}`
const raisedSm = `3px 3px 8px ${C.nd}, -2px -2px 6px ${C.nl}`
const insetSm  = `inset 2px 2px 6px ${C.nd}, inset -2px -2px 5px ${C.nl}`
const goldBox  = `4px 4px 14px ${C.nd}, 0 0 22px rgba(212,168,79,0.2)`

type Section = 'overview'|'daily'|'clients'|'orders'|'accounting'|'metrics'|'promos'|'mycard'|'security'|'rules'|'compliance'

const NAV:{s:Section;l:string;g:string;icon:string}[] = [
  {s:'overview',   l:'Overview',            g:'Core',    icon:'◎'},
  {s:'daily',      l:'Daily Report',        g:'Core',    icon:'📅'},
  {s:'clients',    l:'Clients',             g:'Core',    icon:'👥'},
  {s:'orders',     l:'Orders & Payments',   g:'Core',    icon:'💳'},
  {s:'accounting', l:'Accounting / P&L',    g:'Finance', icon:'📊'},
  {s:'metrics',    l:'Metrics & Analytics', g:'Finance', icon:'📈'},
  {s:'promos',     l:'Promo Codes',         g:'Finance', icon:'🏷️'},
  {s:'mycard',     l:'My Card',             g:'Admin',   icon:'🪪'},
  {s:'rules',      l:'Business Rules',      g:'Admin',   icon:'⚙️'},
  {s:'security',   l:'Security Log',        g:'Admin',   icon:'🔐'},
  {s:'compliance', l:'Compliance',          g:'Admin',   icon:'✅'},
]

function Metric({l,v,accent}:{l:string;v:string;accent?:string}) {
  return (
    <div style={{background:C.g,boxShadow:raised,borderRadius:'16px',padding:'20px',border:'1px solid rgba(255,255,255,0.025)'}}>
      <div style={{fontSize:'9px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:C.smoke,marginBottom:'10px'}}>{l}</div>
      <div style={{fontSize:'26px',fontWeight:800,color:accent||C.silver,fontFamily:"'Syne',sans-serif",lineHeight:1}}>{v}</div>
    </div>
  )
}

function Bdg({t,type}:{t:string;type:'green'|'amber'|'red'|'gray'}) {
  const m:{[k:string]:[string,string]}={
    green:['rgba(74,222,128,0.1)','#4ade80'],
    amber:[`rgba(212,168,79,0.1)`,C.gold],
    red:['rgba(239,68,68,0.1)','#ef4444'],
    gray:['rgba(255,255,255,0.06)',C.smoke]
  }
  return <span style={{background:m[type][0],color:m[type][1],padding:'3px 10px',borderRadius:'20px',fontSize:'10px',fontWeight:700,border:`1px solid ${m[type][1]}33`}}>{t}</span>
}

function Panel({children,title,action}:{children:React.ReactNode;title?:string;action?:React.ReactNode}) {
  return (
    <div style={{background:C.g,boxShadow:raised,borderRadius:'18px',padding:'22px',border:'1px solid rgba(255,255,255,0.025)',marginBottom:'16px'}}>
      {(title||action)&&(
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'18px'}}>
          {title&&<div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'14px',color:C.silver}}>{title}</div>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

function Tbl({heads,rows}:{heads:string[];rows:React.ReactNode[][]}) {
  if(!rows.length) return <div style={{color:C.smoke,fontSize:'13px',textAlign:'center',padding:'32px 0',opacity:.6}}>No data yet</div>
  return (
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
        <thead>
          <tr>{heads.map(h=><th key={h} style={{textAlign:'left',padding:'0 12px 10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)',color:C.smoke,fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',whiteSpace:'nowrap'}}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row,i)=>(
            <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.025)'}}>
              {row.map((cell,j)=><td key={j} style={{padding:'10px 12px 10px 0',color:C.silver,verticalAlign:'middle',fontSize:'12px'}}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminDashboard() {
  const [active,setActive]       = useState<Section>('overview')
  const [data,setData]           = useState<any>(null)
  const [loading,setLoading]     = useState(true)
  const [timer,setTimer]         = useState(15*60)
  const [collapsed,setCollapsed] = useState(false)
  const router = useRouter()

  const load = useCallback(async(s:Section)=>{
    setLoading(true); setData(null)
    try {
      const res = await fetch(`/api/admin/dashboard?section=${s}`)
      if(res.status===401){router.push('/admin/login');return}
      setData(await res.json())
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  },[router])

  useEffect(()=>{load(active)},[active,load])
  useEffect(()=>{
    const t=setInterval(()=>setTimer(n=>{if(n<=1){lock();return 0}return n-1}),1000)
    return()=>clearInterval(t)
  },[])

  async function lock(){
    await fetch('/api/admin/auth',{method:'DELETE'})
    router.push('/admin/login')
  }

  const mm=Math.floor(timer/60), ss=String(timer%60).padStart(2,'0')
  const groups=[...new Set(NAV.map(n=>n.g))]
  const fmt=(c:number)=>`$${(c/100).toFixed(2)}`
  const fmtDt=(d:string)=>new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})

  return (
    <div style={{display:'flex',minHeight:'100dvh',background:C.g,fontFamily:"'DM Sans',sans-serif",color:C.silver}}>

      {/* ─── SIDEBAR ─── */}
      <aside style={{
        width:collapsed?'72px':'224px',
        flexShrink:0,
        background:C.g,
        boxShadow:`6px 0 24px ${C.nd}`,
        display:'flex',
        flexDirection:'column',
        borderRight:'1px solid rgba(255,255,255,0.025)',
        transition:'width .25s ease',
        overflow:'hidden',
      }}>

        {/* Logo */}
        <div style={{padding:'16px 12px',borderBottom:'1px solid rgba(255,255,255,0.03)',flexShrink:0}}>
          <div onClick={()=>setCollapsed(c=>!c)} style={{
            padding:collapsed?'10px':'14px 16px',
            background:C.g,
            boxShadow:raised,
            borderRadius:'14px',
            border:'1px solid rgba(212,168,79,0.08)',
            display:'flex',alignItems:'center',justifyContent:'center',
            cursor:'pointer',transition:'all .2s',
          }}>
            <img src="/logo.png" alt="Vynk" style={{width:'100%',height:'auto',maxWidth:collapsed?'26px':'76px',display:'block',transition:'max-width .2s'}}/>
          </div>
          {!collapsed&&<div style={{fontSize:'9px',color:C.smoke,marginTop:'8px',textAlign:'center',letterSpacing:'.1em',textTransform:'uppercase',fontWeight:700,opacity:.4}}>Owner Dashboard</div>}
        </div>

        {/* Nav items */}
        <div style={{flex:1,overflowY:'auto',overflowX:'hidden',padding:'10px 10px'}}>
          {groups.map(g=>(
            <div key={g} style={{marginBottom:'4px'}}>
              {!collapsed&&<div style={{fontSize:'9px',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(111,115,122,0.35)',padding:'10px 4px 6px'}}>{g}</div>}
              <div style={{display:'flex',flexDirection:'column',gap:'3px'}}>
                {NAV.filter(n=>n.g===g).map(n=>{
                  const on=active===n.s
                  return (
                    <button key={n.s} onClick={()=>setActive(n.s)} style={{
                      display:'flex',alignItems:'center',gap:'10px',
                      width:'100%',
                      padding:collapsed?'11px 0':'10px 10px',
                      justifyContent:collapsed?'center':'flex-start',
                      borderRadius:'12px',
                      background: C.g,
                      boxShadow: on ? insetSm : raisedSm,
                      border: on ? `1px solid rgba(212,168,79,0.1)` : '1px solid rgba(255,255,255,0.02)',
                      color: on ? C.gold : C.smoke,
                      fontSize:'12px',fontWeight:on?600:400,
                      cursor:'pointer',transition:'all .18s',
                      textAlign:'left',fontFamily:"'DM Sans',sans-serif",outline:'none',
                    }}>
                      <span style={{
                        width:'30px',height:'30px',
                        borderRadius:'9px',
                        flexShrink:0,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:'14px',
                        background: on ? `rgba(212,168,79,0.1)` : 'transparent',
                        boxShadow: on ? insetSm : 'none',
                        transition:'all .18s',
                      }}>{n.icon}</span>
                      {!collapsed&&<span style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{n.l}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Session timer + lock */}
        <div style={{padding:'12px',borderTop:'1px solid rgba(255,255,255,0.03)',flexShrink:0}}>
          {!collapsed&&(
            <div style={{
              background:C.g,boxShadow:insetSm,
              borderRadius:'10px',padding:'9px 12px',
              marginBottom:'10px',
              display:'flex',alignItems:'center',justifyContent:'space-between',
            }}>
              <span style={{fontSize:'10px',color:C.smoke}}>Session</span>
              <span style={{
                color:timer<120?'#ef4444':timer<300?C.gold:C.silver,
                fontWeight:700,fontFamily:'monospace',fontSize:'13px',
              }}>{mm}:{ss}</span>
            </div>
          )}
          <button onClick={lock} style={{
            width:'100%',padding:'9px',borderRadius:'10px',
            background:C.g,boxShadow:raisedSm,
            border:'1px solid rgba(239,68,68,0.15)',
            color:'#ef4444',fontSize:'11px',fontWeight:600,
            cursor:'pointer',fontFamily:"'DM Sans',sans-serif",
            display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',
            outline:'none',transition:'all .15s',
          }}>
            🔒{!collapsed&&' Lock'}
          </button>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>

        {/* Topbar */}
        <div style={{
          display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'0 24px',height:'56px',
          background:C.g,
          borderBottom:'1px solid rgba(255,255,255,0.025)',
          boxShadow:`0 4px 16px ${C.nd}`,
          flexShrink:0,
        }}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'15px',color:C.silver,display:'flex',alignItems:'center',gap:'8px'}}>
            <span>{NAV.find(n=>n.s===active)?.icon}</span>
            {NAV.find(n=>n.s===active)?.l}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'6px',background:'rgba(74,222,128,0.08)',border:'1px solid rgba(74,222,128,0.15)',borderRadius:'20px',padding:'5px 12px',fontSize:'10px',fontWeight:700,color:'#4ade80'}}>
              <div style={{width:'5px',height:'5px',borderRadius:'50%',background:'#4ade80',boxShadow:'0 0 6px #4ade80'}}/>
              2FA Active
            </div>
            <div style={{fontSize:'11px',color:C.smoke,background:C.g,boxShadow:raisedSm,padding:'6px 12px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.03)'}}>
              {new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:'auto',padding:'24px'}}>
          {loading ? (
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'300px',flexDirection:'column',gap:'14px'}}>
              <div style={{width:'44px',height:'44px',background:C.g,boxShadow:raised,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>⏳</div>
              <div style={{color:C.smoke,fontSize:'13px'}}>Loading…</div>
            </div>
          ) : (
            <Content section={active} data={data} reload={()=>load(active)} fmt={fmt} fmtDt={fmtDt}/>
          )}
        </div>
      </div>
    </div>
  )
}

function Content({section,data,reload,fmt,fmtDt}:{section:Section;data:any;reload:()=>void;fmt:(c:number)=>string;fmtDt:(d:string)=>string}) {
  if(!data) return null
  const g4={display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'20px'} as React.CSSProperties
  const g3={display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px',marginBottom:'20px'} as React.CSSProperties
  const g2={display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'14px',marginBottom:'16px'} as React.CSSProperties

  if(section==='overview') return (
    <div>
      <div style={g4}>
        <Metric l="Today Revenue" v={fmt(data.todayCents||0)} accent={C.gold}/>
        <Metric l="Total Revenue" v={fmt(data.totalCents||0)} accent='#a78bfa'/>
        <Metric l="Active Cards"  v={String(data.activeCards||0)}/>
        <Metric l="Total Users"   v={String(data.totalUsers||0)}/>
      </div>
      <Panel title="Recent transactions">
        <Tbl heads={['Type','Amount','Method','Country','Date','Status']}
          rows={(data.recentPayments||[]).map((p:any)=>[
            <Bdg t={p.type==='new_card'?'New card':'Renewal'} type={p.type==='new_card'?'amber':'gray'}/>,
            <span style={{fontWeight:700,color:C.gold}}>{fmt(p.amount_cents)}</span>,
            p.payment_method||'—', p.country||'—', fmtDt(p.created_at),
            <Bdg t={p.status} type={p.status==='paid'?'green':p.status==='failed'?'red':'gray'}/>,
          ])}/>
      </Panel>
    </div>
  )

  if(section==='daily') return (
    <div>
      <div style={g3}>
        <Metric l="Today Gross" v={fmt(Number(data.daily?.[0]?.gross_cents)||0)} accent={C.gold}/>
        <Metric l="Stripe Fees" v={fmt(Number(data.daily?.[0]?.stripe_fee_cents)||0)} accent='#ef4444'/>
        <Metric l="Today Net"   v={fmt(Number(data.daily?.[0]?.net_cents)||0)} accent='#4ade80'/>
      </div>
      <Panel title="Daily (last 90 days)">
        <Tbl heads={['Date','Transactions','Gross','Fees','Net']}
          rows={(data.daily||[]).map((d:any)=>[
            fmtDt(d.day), d.transactions, fmt(d.gross_cents),
            <span style={{color:'#ef4444'}}>−{fmt(d.stripe_fee_cents)}</span>,
            <span style={{fontWeight:700,color:'#4ade80'}}>{fmt(d.net_cents)}</span>,
          ])}/>
      </Panel>
    </div>
  )

  if(section==='clients') return (
    <Panel title={`Clients (${data.clients?.length||0})`}>
      <Tbl heads={['Email','Name','Owner','Active','Joined']}
        rows={(data.clients||[]).map((c:any)=>[
          <span style={{fontFamily:'monospace',fontSize:'11px'}}>{c.email||'—'}</span>,
          c.full_name||'—',
          c.is_owner?<Bdg t="Owner" type="amber"/>:<span style={{color:C.smoke}}>—</span>,
          c.is_active?<Bdg t="Active" type="green"/>:<Bdg t="Inactive" type="gray"/>,
          fmtDt(c.created_at),
        ])}/>
    </Panel>
  )

  if(section==='orders') return (
    <Panel title={`Orders (${data.orders?.length||0})`}>
      <Tbl heads={['Type','Amount','Method','Country','Promo','Date','Status']}
        rows={(data.orders||[]).map((p:any)=>[
          <Bdg t={p.type==='new_card'?'New':'Renewal'} type={p.type==='new_card'?'amber':'gray'}/>,
          <span style={{fontWeight:700,color:C.gold}}>{fmt(p.amount_cents)}</span>,
          p.payment_method||'—', p.country||'—',
          p.promo_code?<Bdg t={p.promo_code} type="amber"/>:<span style={{color:C.smoke}}>—</span>,
          fmtDt(p.created_at),
          <Bdg t={p.status} type={p.status==='paid'?'green':p.status==='failed'?'red':'gray'}/>,
        ])}/>
    </Panel>
  )

  if(section==='accounting') return (
    <div>
      <Panel title="Monthly">
        <Tbl heads={['Month','Transactions','Gross','Net','New','Renewals']}
          rows={(data.monthly||[]).map((m:any)=>[
            fmtDt(m.month), m.transactions, fmt(m.gross_cents),
            <span style={{fontWeight:700,color:'#4ade80'}}>{fmt(m.net_cents)}</span>,
            m.new_cards, m.renewals,
          ])}/>
      </Panel>
      <Panel title="Daily">
        <Tbl heads={['Date','Txns','Gross','Fees','Net']}
          rows={(data.daily||[]).map((d:any)=>[
            fmtDt(d.day), d.transactions, fmt(d.gross_cents),
            <span style={{color:'#ef4444'}}>−{fmt(d.stripe_fee_cents)}</span>,
            <span style={{fontWeight:700,color:'#4ade80'}}>{fmt(d.net_cents)}</span>,
          ])}/>
      </Panel>
    </div>
  )

  if(section==='metrics') return (
    <div>
      <div style={g4}>
        <Metric l="Total Views"    v={String(data.totalViews||0)} accent='#a78bfa'/>
        <Metric l="Contacts Saved" v={String(data.totalSaves||0)} accent={C.gold}/>
        <Metric l="Top Country"    v={data.byCountry?.[0]?.country||'—'}/>
        <Metric l="Top Source"     v={data.bySource?.[0]?.source||'—'}/>
      </div>
      <div style={g2}>
        <Panel title="By country">
          {(data.byCountry||[]).slice(0,8).map((r:any)=>{
            const total=(data.byCountry||[]).reduce((s:number,x:any)=>s+Number(x.cnt),0)
            const pct=total>0?Math.round((Number(r.cnt)/total)*100):0
            return (
              <div key={r.country} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px',fontSize:'12px'}}>
                <span style={{width:'28px',color:C.silver}}>{r.country||'?'}</span>
                <div style={{flex:1,background:'rgba(255,255,255,0.04)',borderRadius:'4px',height:'6px',boxShadow:insetSm}}>
                  <div style={{width:`${pct}%`,height:'6px',background:C.gold,borderRadius:'4px'}}/>
                </div>
                <span style={{color:C.smoke,minWidth:'30px',textAlign:'right'}}>{pct}%</span>
              </div>
            )
          })}
        </Panel>
        <Panel title="By source">
          {(data.bySource||[]).map((r:any)=>{
            const total=(data.bySource||[]).reduce((s:number,x:any)=>s+Number(x.cnt),0)
            const pct=total>0?Math.round((Number(r.cnt)/total)*100):0
            return (
              <div key={r.source} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px',fontSize:'12px'}}>
                <span style={{width:'60px',color:C.silver,textTransform:'capitalize'}}>{r.source||'direct'}</span>
                <div style={{flex:1,background:'rgba(255,255,255,0.04)',borderRadius:'4px',height:'6px',boxShadow:insetSm}}>
                  <div style={{width:`${pct}%`,height:'6px',background:'#a78bfa',borderRadius:'4px'}}/>
                </div>
                <span style={{color:C.smoke,minWidth:'30px',textAlign:'right'}}>{pct}%</span>
              </div>
            )
          })}
        </Panel>
      </div>
    </div>
  )

  if(section==='promos') return <PromoSection data={data} reload={reload}/>

  if(section==='security') return (
    <div>
      <div style={g4}>
        <Metric l="2FA"           v="Active" accent='#4ade80'/>
        <Metric l="Auto-lock"     v="15 min"/>
        <Metric l="Failed Logins" v={String((data.logs||[]).filter((l:any)=>l.event?.includes('failed')).length)} accent='#ef4444'/>
        <Metric l="Total Events"  v={String(data.logs?.length||0)}/>
      </div>
      <Panel title="Access log">
        <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
          {(data.logs||[]).map((l:any)=>(
            <div key={l.id} style={{display:'flex',alignItems:'flex-start',gap:'10px',padding:'10px 12px',borderRadius:'10px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(255,255,255,0.025)'}}>
              <div style={{width:'8px',height:'8px',borderRadius:'50%',marginTop:'3px',flexShrink:0,background:l.event?.includes('success')?'#4ade80':l.event?.includes('failed')?'#ef4444':C.gold,boxShadow:`0 0 6px currentColor`}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:'12px',fontWeight:500,color:C.silver,textTransform:'capitalize'}}>{l.event?.replace(/_/g,' ')}</div>
                <div style={{fontSize:'11px',color:C.smoke,marginTop:'2px'}}>{l.ip||'—'} · {fmtDt(l.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )

  if(section==='mycard') return (
    <div style={{maxWidth:'500px'}}>
      <Panel title="Owner privileges">
        {[
          {l:'Edit card anytime',      v:'Free always',t:'green' as const},
          {l:'Unlimited updates',      v:'Unlimited',  t:'green' as const},
          {l:'No payment dialogs',     v:'Bypassed',   t:'green' as const},
          {l:'Create promo codes',     v:'Full access',t:'amber' as const},
          {l:'Admin dashboard',        v:'Full access',t:'amber' as const},
          {l:'All analytics',          v:'Full access',t:'amber' as const},
        ].map(r=>(
          <div key={r.l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
            <span style={{fontSize:'13px',color:C.silver}}>{r.l}</span>
            <Bdg t={r.v} type={r.t}/>
          </div>
        ))}
      </Panel>
      <Panel>
        <a href="/builder" style={{display:'block',padding:'14px',background:`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`,color:C.carbon,fontWeight:700,fontSize:'14px',borderRadius:'12px',textAlign:'center',textDecoration:'none',boxShadow:goldBox,fontFamily:"'DM Sans',sans-serif"}}>
          → Go to card builder
        </a>
      </Panel>
    </div>
  )

  if(section==='rules') return (
    <div style={{maxWidth:'500px'}}>
      <Panel title="Pricing rules">
        {[
          {l:'New card creation', v:'$20.00',note:'One-time'},
          {l:'Identity renewal',  v:'$10.00',note:'Archives previous'},
          {l:'Content updates',   v:'Free',  note:'Colors, bio, socials'},
          {l:'Owner edits',       v:'Free',  note:'All fields, always'},
        ].map(r=>(
          <div key={r.l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 0',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
            <div>
              <div style={{fontSize:'13px',color:C.silver,fontWeight:500}}>{r.l}</div>
              <div style={{fontSize:'11px',color:C.smoke,marginTop:'2px'}}>{r.note}</div>
            </div>
            <span style={{fontWeight:700,color:C.gold,fontFamily:"'Syne',sans-serif",fontSize:'16px'}}>{r.v}</span>
          </div>
        ))}
      </Panel>
      <div style={g2 as any}>
        <Panel title="Paid fields ($10)">
          <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
            {['Full name','Title','Company','Photo','Logo','Phone','WhatsApp','Email'].map(f=>(
              <span key={f} style={{padding:'5px 12px',background:'rgba(212,168,79,0.08)',border:'1px solid rgba(212,168,79,0.2)',borderRadius:'20px',fontSize:'11px',color:C.gold,fontWeight:600}}>{f}</span>
            ))}
          </div>
        </Panel>
        <Panel title="Free fields">
          <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
            {['Tagline','Bio','Services','Instagram','LinkedIn','Twitter','Telegram','TikTok','YouTube','Website','Colors','Design'].map(f=>(
              <span key={f} style={{padding:'5px 12px',background:'rgba(74,222,128,0.06)',border:'1px solid rgba(74,222,128,0.15)',borderRadius:'20px',fontSize:'11px',color:'#4ade80',fontWeight:600}}>{f}</span>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )

  if(section==='compliance') return (
    <Panel title="Legal compliance">
      <Tbl heads={['Document','Standard','Status']}
        rows={[
          ['Terms & Conditions','International',<Bdg t="Live" type="green"/>],
          ['Privacy Policy','GDPR · CCPA · LGPD',<Bdg t="Live" type="green"/>],
          ['Refund Policy','No-refund after publish',<Bdg t="Live" type="green"/>],
          ['PCI DSS','Stripe (delegated)',<Bdg t="Live" type="green"/>],
          ['TLS 1.3','Always on',<Bdg t="Live" type="green"/>],
        ]}/>
    </Panel>
  )

  return null
}

function PromoSection({data,reload}:{data:any;reload:()=>void}) {
  const inpSt:React.CSSProperties={padding:'9px 12px',border:'1px solid rgba(255,255,255,0.04)',borderRadius:'10px',background:C.g,color:C.silver,fontSize:'12px',fontFamily:"'DM Sans',sans-serif",outline:'none',boxShadow:insetSm,width:'100%'}
  const [form,setForm]=useState({code:'',discountType:'percent',discountValue:20,appliesTo:'both',maxUses:''})
  const [loading,setLoading]=useState(false)

  async function create(){
    if(!form.code){toast.error('Enter a code');return}
    setLoading(true)
    const r=await fetch('/api/admin/dashboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    r.ok?toast.success('Promo created!'):toast.error('Error')
    reload(); setLoading(false)
  }

  async function toggle(id:string,current:boolean){
    await fetch('/api/admin/dashboard',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,isActive:!current})})
    reload()
  }

  return (
    <div>
      <Panel title="Create promo code">
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr auto',gap:'10px',alignItems:'end'}}>
          <div>
            <label style={{fontSize:'10px',color:C.smoke,display:'block',marginBottom:'5px',fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase'}}>Code</label>
            <input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="VYNK50" style={inpSt}/>
          </div>
          <div>
            <label style={{fontSize:'10px',color:C.smoke,display:'block',marginBottom:'5px',fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase'}}>Type</label>
            <select value={form.discountType} onChange={e=>setForm(f=>({...f,discountType:e.target.value}))} style={inpSt}>
              <option value="percent">% off</option>
              <option value="fixed">$ off</option>
              <option value="free">100% free</option>
            </select>
          </div>
          <div>
            <label style={{fontSize:'10px',color:C.smoke,display:'block',marginBottom:'5px',fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase'}}>Value</label>
            <input type="number" value={form.discountValue} onChange={e=>setForm(f=>({...f,discountValue:+e.target.value}))} style={inpSt}/>
          </div>
          <div>
            <label style={{fontSize:'10px',color:C.smoke,display:'block',marginBottom:'5px',fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase'}}>Max uses</label>
            <input type="number" placeholder="∞" value={form.maxUses} onChange={e=>setForm(f=>({...f,maxUses:e.target.value}))} style={inpSt}/>
          </div>
          <button onClick={create} disabled={loading}
            style={{padding:'9px 18px',borderRadius:'10px',background:`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`,color:C.carbon,fontWeight:700,fontSize:'12px',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:goldBox,whiteSpace:'nowrap',height:'38px'}}>
            {loading?'…':'+ Create'}
          </button>
        </div>
        <p style={{fontSize:'11px',color:C.smoke,marginTop:'10px',opacity:.7}}>
          Tip: <strong style={{color:C.gold}}>100% free</strong> — test users get the card without paying. Works for new cards AND renewals.
        </p>
      </Panel>
      <Panel title={`Active codes (${data.promos?.length||0})`}>
        <Tbl heads={['Code','Discount','Uses','Applies To','Status','Action']}
          rows={(data.promos||[]).map((p:any)=>[
            <span style={{fontFamily:'monospace',fontWeight:700,color:C.gold,fontSize:'13px'}}>{p.code}</span>,
            `${p.discount_value}${p.discount_type==='percent'?'%':p.discount_type==='free'?' free':'$'} off`,
            `${p.uses_count}${p.max_uses?` / ${p.max_uses}`:''}`,
            p.applies_to,
            <Bdg t={p.is_active?'Active':'Off'} type={p.is_active?'green':'gray'}/>,
            <button onClick={()=>toggle(p.id,p.is_active)} style={{padding:'4px 10px',borderRadius:'8px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(255,255,255,0.04)',color:C.smoke,fontSize:'11px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{p.is_active?'Disable':'Enable'}</button>,
          ])}/>
      </Panel>
    </div>
  )
}
