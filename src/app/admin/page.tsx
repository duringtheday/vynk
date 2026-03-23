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
const goldBox  = `4px 4px 12px ${C.nd}, 0 0 18px rgba(212,168,79,0.18)`

type Section = 'overview'|'daily'|'clients'|'orders'|'accounting'|'metrics'|'promos'|'mycard'|'security'|'rules'|'compliance'

const NAV: {s:Section;l:string;g:string;icon:string}[] = [
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

function Metric({l,v,sub,accent}:{l:string;v:string;sub?:string;accent?:string}) {
  return (
    <div style={{background:C.g,boxShadow:raised,borderRadius:'16px',padding:'20px 18px',border:'1px solid rgba(255,255,255,0.03)'}}>
      <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:C.smoke,marginBottom:'10px'}}>{l}</div>
      <div style={{fontSize:'28px',fontWeight:800,color:accent||C.silver,fontFamily:"'Syne',sans-serif",lineHeight:1}}>{v}</div>
      {sub&&<div style={{fontSize:'11px',color:C.smoke,marginTop:'6px'}}>{sub}</div>}
    </div>
  )
}

function Bdg({t,type}:{t:string;type:'green'|'amber'|'red'|'gray'}) {
  const map:{[k:string]:[string,string]} = {
    green:['rgba(74,222,128,0.1)','#4ade80'],
    amber:[`rgba(212,168,79,0.1)`,C.gold],
    red:['rgba(239,68,68,0.1)','#ef4444'],
    gray:['rgba(255,255,255,0.06)',C.smoke]
  }
  return <span style={{background:map[type][0],color:map[type][1],padding:'3px 10px',borderRadius:'20px',fontSize:'10px',fontWeight:700,border:`1px solid ${map[type][1]}33`}}>{t}</span>
}

function Panel({children,title,action}:{children:React.ReactNode;title?:string;action?:React.ReactNode}) {
  return (
    <div style={{background:C.g,boxShadow:raised,borderRadius:'18px',padding:'22px',border:'1px solid rgba(255,255,255,0.03)',marginBottom:'16px'}}>
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
  if (!rows.length) return <div style={{color:C.smoke,fontSize:'13px',textAlign:'center',padding:'32px 0'}}>No data yet</div>
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
  const [active, setActive]   = useState<Section>('overview')
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timer, setTimer]     = useState(15*60)
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()

  const load = useCallback(async (s: Section) => {
    setLoading(true); setData(null)
    try {
      const res = await fetch(`/api/admin/dashboard?section=${s}`)
      if (res.status===401){router.push('/admin/login');return}
      setData(await res.json())
    } catch { toast.error('Failed to load section') }
    finally { setLoading(false) }
  }, [router])

  useEffect(()=>{load(active)},[active,load])
  useEffect(()=>{
    const t=setInterval(()=>setTimer(n=>{if(n<=1){lock();return 0}return n-1}),1000)
    return ()=>clearInterval(t)
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

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: collapsed?'64px':'220px',
        flexShrink:0, background:C.g,
        boxShadow:`6px 0 20px ${C.nd}`,
        display:'flex', flexDirection:'column',
        borderRight:'1px solid rgba(255,255,255,0.025)',
        transition:'width .25s ease', overflow:'hidden',
      }}>
        {/* Logo container */}
        <div style={{padding:'14px 12px',borderBottom:'1px solid rgba(255,255,255,0.03)',flexShrink:0}}>
          <div style={{
            padding: collapsed?'10px':'12px 14px',
            background:C.g,
            boxShadow:raised,
            borderRadius:'14px',
            border:'1px solid rgba(212,168,79,0.08)',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', transition:'all .2s',
          }} onClick={()=>setCollapsed(c=>!c)}>
            <img src="/logo.png" alt="Vynk" style={{height:collapsed?'35px':'41px', transition:'height .2s'}}/>
          </div>
          {!collapsed&&<div style={{fontSize:'9px',color:C.smoke,marginTop:'8px',textAlign:'center',letterSpacing:'.1em',textTransform:'uppercase',fontWeight:700,opacity:.6}}>Owner Dashboard</div>}
        </div>

        {/* Nav items */}
        <div style={{flex:1,overflowY:'auto',overflowX:'hidden',padding:'8px 0'}}>
          {groups.map(g=>(
            <div key={g}>
              {!collapsed&&<div style={{fontSize:'9px',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(111,115,122,0.4)',padding:'12px 14px 4px'}}>{g}</div>}
              {NAV.filter(n=>n.g===g).map(n=>{
                const isActive = active===n.s
                return (
                  <button key={n.s} onClick={()=>setActive(n.s)}
                    style={{
                      display:'flex', alignItems:'center', gap:'10px',
                      width:'100%', padding: collapsed?'10px 0':'9px 14px',
                      justifyContent: collapsed?'center':'flex-start',
                      fontSize:'12px', fontWeight: isActive?600:400,
                      cursor:'pointer', border:'none',
                      borderLeft: collapsed?'none':`2px solid ${isActive?C.gold:'transparent'}`,
                      background: isActive
                        ? `linear-gradient(90deg, rgba(212,168,79,0.08) 0%, transparent 100%)`
                        : 'transparent',
                      color: isActive?C.gold:C.smoke,
                      transition:'all .15s', textAlign:'left',
                      fontFamily:"'DM Sans',sans-serif",
                      boxShadow: isActive&&collapsed ? `inset 2px 2px 5px ${C.nd}, inset -1px -1px 4px ${C.nl}` : 'none',
                    }}>
                    <span style={{fontSize:'14px',flexShrink:0}}>{n.icon}</span>
                    {!collapsed&&<span style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{n.l}</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Session */}
        <div style={{padding:'12px',borderTop:'1px solid rgba(255,255,255,0.03)',flexShrink:0}}>
          {!collapsed&&(
            <div style={{background:C.g,boxShadow:insetSm,borderRadius:'10px',padding:'8px 12px',marginBottom:'10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:'10px',color:C.smoke}}>Session</span>
              <span style={{color:timer<120?'#ef4444':C.gold,fontWeight:700,fontFamily:'monospace',fontSize:'12px'}}>{mm}:{ss}</span>
            </div>
          )}
          <button onClick={lock} style={{
            width:'100%', padding:'8px', borderRadius:'10px',
            background:C.g, boxShadow:raisedSm,
            border:'1px solid rgba(239,68,68,0.15)',
            color:'#ef4444', fontSize:'11px', fontWeight:600,
            cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
            display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
          }}>
            🔒{!collapsed&&' Lock'}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>

        {/* Topbar */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 24px', height:'56px',
          background:C.g, borderBottom:'1px solid rgba(255,255,255,0.03)',
          boxShadow:`0 4px 16px ${C.nd}`, flexShrink:0,
        }}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'15px',color:C.silver,display:'flex',alignItems:'center',gap:'8px'}}>
            <span>{NAV.find(n=>n.s===active)?.icon}</span>
            {NAV.find(n=>n.s===active)?.l}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'6px',background:'rgba(74,222,128,0.08)',border:'1px solid rgba(74,222,128,0.15)',borderRadius:'20px',padding:'5px 12px',fontSize:'10px',fontWeight:700,color:'#4ade80'}}>
              <div style={{width:'5px',height:'5px',borderRadius:'50%',background:'#4ade80',boxShadow:'0 0 6px #4ade80'}}/>
              2FA Active · Vault Open
            </div>
            <div style={{fontSize:'11px',color:C.smoke,background:C.g,boxShadow:raisedSm,padding:'6px 12px',borderRadius:'8px'}}>
              {new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:'auto',padding:'24px'}}>
          {loading ? (
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'300px',flexDirection:'column',gap:'12px'}}>
              <div style={{width:'40px',height:'40px',background:C.g,boxShadow:raised,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>⏳</div>
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
  if (!data) return <div style={{color:'#6F737A',textAlign:'center',paddingTop:'60px'}}>No data</div>

  const grid2={display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'14px',marginBottom:'20px'} as React.CSSProperties
  const grid4={display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'20px'} as React.CSSProperties
  const grid3={display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px',marginBottom:'20px'} as React.CSSProperties

  if (section==='overview') return (
    <div>
      <div style={grid4}>
        <Metric l="Today Revenue"  v={fmt(data.todayCents||0)}   accent="#D4A84F"/>
        <Metric l="Total Revenue"  v={fmt(data.totalCents||0)}   accent="#a78bfa"/>
        <Metric l="Active Cards"   v={String(data.activeCards||0)}/>
        <Metric l="Total Users"    v={String(data.totalUsers||0)}/>
      </div>
      <Panel title="Recent transactions">
        <Tbl heads={['Type','Amount','Method','Country','Date','Status']}
          rows={(data.recentPayments||[]).map((p:any)=>[
            <Bdg t={p.type==='new_card'?'New card':'Renewal'} type={p.type==='new_card'?'amber':'gray'}/>,
            <span style={{fontWeight:700,color:'#D4A84F'}}>{fmt(p.amount_cents)}</span>,
            p.payment_method||'—', p.country||'—', fmtDt(p.created_at),
            <Bdg t={p.status} type={p.status==='paid'?'green':p.status==='failed'?'red':'gray'}/>,
          ])}/>
      </Panel>
    </div>
  )

  if (section==='daily') return (
    <div>
      <div style={grid3}>
        <Metric l="Today Gross"  v={fmt(Number(data.daily?.[0]?.gross_cents)||0)}       accent="#D4A84F"/>
        <Metric l="Stripe Fees"  v={fmt(Number(data.daily?.[0]?.stripe_fee_cents)||0)}  accent="#ef4444"/>
        <Metric l="Today Net"    v={fmt(Number(data.daily?.[0]?.net_cents)||0)}          accent="#4ade80"/>
      </div>
      <Panel title="Daily accounting (last 90 days)">
        <Tbl heads={['Date','Transactions','Gross','Stripe Fees','Net']}
          rows={(data.daily||[]).map((d:any)=>[
            fmtDt(d.day), d.transactions,
            fmt(d.gross_cents),
            <span style={{color:'#ef4444'}}>−{fmt(d.stripe_fee_cents)}</span>,
            <span style={{fontWeight:700,color:'#4ade80'}}>{fmt(d.net_cents)}</span>,
          ])}/>
      </Panel>
    </div>
  )

  if (section==='clients') return (
    <Panel title={`All clients (${data.clients?.length||0})`}
      action={<span style={{fontSize:'11px',color:'#D4A84F',cursor:'pointer'}}>Export CSV</span>}>
      <Tbl heads={['Email','Name','Owner','Active','Joined']}
        rows={(data.clients||[]).map((c:any)=>[
          <span style={{fontFamily:'monospace',fontSize:'11px'}}>{c.email||'—'}</span>,
          c.full_name||'—',
          c.is_owner?<Bdg t="Owner" type="amber"/>:<span style={{color:'#6F737A'}}>—</span>,
          c.is_active?<Bdg t="Active" type="green"/>:<Bdg t="Inactive" type="gray"/>,
          fmtDt(c.created_at),
        ])}/>
    </Panel>
  )

  if (section==='orders') return (
    <Panel title={`All orders (${data.orders?.length||0})`}
      action={<span style={{fontSize:'11px',color:'#D4A84F',cursor:'pointer'}}>Export CSV</span>}>
      <Tbl heads={['Type','Amount','Method','Country','Promo','Date','Status']}
        rows={(data.orders||[]).map((p:any)=>[
          <Bdg t={p.type==='new_card'?'New':'Renewal'} type={p.type==='new_card'?'amber':'gray'}/>,
          <span style={{fontWeight:700,color:'#D4A84F'}}>{fmt(p.amount_cents)}</span>,
          p.payment_method||'—', p.country||'—',
          p.promo_code?<Bdg t={p.promo_code} type="amber"/>:<span style={{color:'#6F737A'}}>—</span>,
          fmtDt(p.created_at),
          <Bdg t={p.status} type={p.status==='paid'?'green':p.status==='failed'?'red':'gray'}/>,
        ])}/>
    </Panel>
  )

  if (section==='accounting') return (
    <div>
      <Panel title="Monthly Revenue">
        <Tbl heads={['Month','Transactions','Gross','Net','New Cards','Renewals']}
          rows={(data.monthly||[]).map((m:any)=>[
            fmtDt(m.month), m.transactions,
            fmt(m.gross_cents),
            <span style={{fontWeight:700,color:'#4ade80'}}>{fmt(m.net_cents)}</span>,
            m.new_cards, m.renewals,
          ])}/>
      </Panel>
      <Panel title="Daily detail (last 90 days)">
        <Tbl heads={['Date','Txns','Gross','Stripe Fees','Net']}
          rows={(data.daily||[]).map((d:any)=>[
            fmtDt(d.day), d.transactions, fmt(d.gross_cents),
            <span style={{color:'#ef4444'}}>−{fmt(d.stripe_fee_cents)}</span>,
            <span style={{fontWeight:700,color:'#4ade80'}}>{fmt(d.net_cents)}</span>,
          ])}/>
      </Panel>
    </div>
  )

  if (section==='metrics') return (
    <div>
      <div style={grid4}>
        <Metric l="Total Views"    v={String(data.totalViews||0)}  accent="#a78bfa"/>
        <Metric l="Contacts Saved" v={String(data.totalSaves||0)}  accent="#D4A84F"/>
        <Metric l="Top Country"    v={data.byCountry?.[0]?.country||'—'}/>
        <Metric l="Top Source"     v={data.bySource?.[0]?.source||'—'}/>
      </div>
      <div style={grid2}>
        <Panel title="Traffic by country">
          {(data.byCountry||[]).slice(0,8).map((r:any)=>{
            const total=(data.byCountry||[]).reduce((s:number,x:any)=>s+x.cnt,0)
            const pct=total>0?Math.round((r.cnt/total)*100):0
            return (
              <div key={r.country} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px',fontSize:'12px'}}>
                <span style={{width:'28px',color:'#BFC3C9'}}>{r.country}</span>
                <div style={{flex:1,background:'rgba(255,255,255,0.04)',borderRadius:'4px',height:'6px',boxShadow:insetSm}}>
                  <div style={{width:`${pct}%`,height:'6px',background:'#D4A84F',borderRadius:'4px'}}/>
                </div>
                <span style={{color:'#6F737A',minWidth:'30px',textAlign:'right'}}>{pct}%</span>
              </div>
            )
          })}
        </Panel>
        <Panel title="Traffic by source">
          {(data.bySource||[]).map((r:any)=>{
            const total=(data.bySource||[]).reduce((s:number,x:any)=>s+x.cnt,0)
            const pct=total>0?Math.round((r.cnt/total)*100):0
            return (
              <div key={r.source} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px',fontSize:'12px'}}>
                <span style={{width:'60px',color:'#BFC3C9',textTransform:'capitalize'}}>{r.source}</span>
                <div style={{flex:1,background:'rgba(255,255,255,0.04)',borderRadius:'4px',height:'6px',boxShadow:insetSm}}>
                  <div style={{width:`${pct}%`,height:'6px',background:'#a78bfa',borderRadius:'4px'}}/>
                </div>
                <span style={{color:'#6F737A',minWidth:'30px',textAlign:'right'}}>{pct}%</span>
              </div>
            )
          })}
        </Panel>
      </div>
    </div>
  )

  if (section==='promos') return <PromoSection data={data} reload={reload}/>

  if (section==='security') return (
    <div>
      <div style={grid4}>
        <Metric l="2FA Status"    v="Active"  accent="#4ade80"/>
        <Metric l="Auto-lock"     v="15 min"/>
        <Metric l="Failed Logins" v={String((data.logs||[]).filter((l:any)=>l.event?.includes('failed')).length)} accent="#ef4444"/>
        <Metric l="Total Events"  v={String(data.logs?.length||0)}/>
      </div>
      <Panel title="Access log (last 100 events)">
        <div style={{display:'flex',flexDirection:'column',gap:'2px'}}>
          {(data.logs||[]).map((l:any)=>(
            <div key={l.id} style={{display:'flex',alignItems:'flex-start',gap:'10px',padding:'10px',borderRadius:'10px',background:'rgba(255,255,255,0.015)',border:'1px solid rgba(255,255,255,0.02)',marginBottom:'4px'}}>
              <div style={{width:'8px',height:'8px',borderRadius:'50%',marginTop:'3px',flexShrink:0,background:l.event?.includes('success')?'#4ade80':l.event?.includes('failed')||l.event?.includes('blocked')?'#ef4444':'#D4A84F',boxShadow:`0 0 6px currentColor`}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:'12px',fontWeight:500,color:'#BFC3C9',textTransform:'capitalize'}}>{l.event?.replace(/_/g,' ')}</div>
                <div style={{fontSize:'11px',color:'#6F737A',marginTop:'2px'}}>{l.ip||'—'} · {l.country||'—'} · {fmtDt(l.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )

  if (section==='mycard') return (
    <div style={{maxWidth:'500px'}}>
      <Panel title="Owner privileges — always free">
        {[
          {l:'Edit card anytime',          v:'Free always',   t:'green' as const},
          {l:'Unlimited card updates',     v:'Unlimited',     t:'green' as const},
          {l:'No confirmation dialogs',    v:'Bypassed',      t:'green' as const},
          {l:'Create promo codes',         v:'Full access',   t:'amber' as const},
          {l:'Admin dashboard access',     v:'Full access',   t:'amber' as const},
          {l:'View all analytics',         v:'Full access',   t:'amber' as const},
        ].map(r=>(
          <div key={r.l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,0.03)',fontSize:'13px'}}>
            <span style={{color:'#BFC3C9'}}>{r.l}</span>
            <Bdg t={r.v} type={r.t}/>
          </div>
        ))}
      </Panel>
      <Panel>
        <a href="/builder" style={{display:'block',padding:'14px',background:`linear-gradient(135deg,#D4A84F,#E8C06A,#A07830)`,color:'#050607',fontWeight:700,fontSize:'14px',borderRadius:'12px',textAlign:'center',textDecoration:'none',boxShadow:`3px 3px 10px #08090B, 0 0 16px rgba(212,168,79,0.2)`}}>
          → Go to card builder
        </a>
      </Panel>
    </div>
  )

  if (section==='rules') return (
    <div style={{maxWidth:'500px'}}>
      <Panel title="Pricing rules">
        {[
          {l:'New card creation',  v:'$20.00', note:'One-time payment'},
          {l:'Identity renewal',   v:'$10.00', note:'Archives previous card'},
          {l:'Content updates',    v:'Free',   note:'Colors, bio, services, socials'},
          {l:'Owner edits',        v:'Free',   note:'All fields, no charge'},
        ].map(r=>(
          <div key={r.l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 0',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
            <div>
              <div style={{fontSize:'13px',color:'#BFC3C9',fontWeight:500}}>{r.l}</div>
              <div style={{fontSize:'11px',color:'#6F737A',marginTop:'2px'}}>{r.note}</div>
            </div>
            <span style={{fontWeight:700,color:'#D4A84F',fontFamily:"'Syne',sans-serif",fontSize:'16px'}}>{r.v}</span>
          </div>
        ))}
      </Panel>
      <Panel title="Identity fields (paid to change)">
        <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
          {['Full name','Title','Company','Photo','Logo','Phone','WhatsApp','Email'].map(f=>(
            <span key={f} style={{padding:'5px 12px',background:'rgba(212,168,79,0.08)',border:'1px solid rgba(212,168,79,0.2)',borderRadius:'20px',fontSize:'11px',color:'#D4A84F',fontWeight:600}}>{f}</span>
          ))}
        </div>
      </Panel>
      <Panel title="Free fields (always free)">
        <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
          {['Tagline','Bio','Services','Instagram','LinkedIn','Twitter','Telegram','TikTok','YouTube','Website','Address','Colors','Design'].map(f=>(
            <span key={f} style={{padding:'5px 12px',background:'rgba(74,222,128,0.06)',border:'1px solid rgba(74,222,128,0.15)',borderRadius:'20px',fontSize:'11px',color:'#4ade80',fontWeight:600}}>{f}</span>
          ))}
        </div>
      </Panel>
    </div>
  )

  if (section==='compliance') return (
    <Panel title="Legal compliance">
      <Tbl heads={['Document','Standard','Applies at','Status']}
        rows={[
          ['Terms & Conditions','International','Register + Checkout',<Bdg t="Live" type="green"/>],
          ['Privacy Policy','GDPR · CCPA · LGPD','Register + Footer',<Bdg t="Live" type="green"/>],
          ['Refund Policy','No-refund after publish','Before payment',<Bdg t="Live" type="green"/>],
          ['PCI DSS','Stripe (delegated)','N/A',<Bdg t="Live" type="green"/>],
          ['Data Encryption','TLS 1.3 + at-rest','Always',<Bdg t="Live" type="green"/>],
        ]}/>
    </Panel>
  )

  return null
}

function PromoSection({data,reload}:{data:any;reload:()=>void}) {
  const C2={g:'#0D0F12',gold:'#D4A84F',silver:'#BFC3C9',smoke:'#6F737A',nd:'#08090B',nl:'#141720'}
  const inpSt:React.CSSProperties={
    padding:'9px 12px',border:'1px solid rgba(255,255,255,0.05)',borderRadius:'10px',
    background:C2.g,color:C2.silver,fontSize:'12px',fontFamily:"'DM Sans',sans-serif",
    outline:'none',boxShadow:`inset 2px 2px 6px ${C2.nd}, inset -2px -2px 5px ${C2.nl}`,width:'100%',
  }
  const [form,setForm]=useState({code:'',discountType:'percent',discountValue:20,appliesTo:'both',maxUses:''})
  const [loading,setLoading]=useState(false)

  async function create(){
    if(!form.code){toast.error('Enter a code');return}
    setLoading(true)
    const r=await fetch('/api/admin/dashboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    r.ok?toast.success('Promo created!'):toast.error('Error creating promo')
    reload(); setLoading(false)
  }

  return (
    <div>
      <Panel title="Create promo code">
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr auto',gap:'12px',alignItems:'end'}}>
          <div>
            <label style={{fontSize:'10px',color:C2.smoke,display:'block',marginBottom:'5px',fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase'}}>Code</label>
            <input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="VYNK50" style={inpSt}/>
          </div>
          <div>
            <label style={{fontSize:'10px',color:C2.smoke,display:'block',marginBottom:'5px',fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase'}}>Type</label>
            <select value={form.discountType} onChange={e=>setForm(f=>({...f,discountType:e.target.value}))} style={inpSt}>
              <option value="percent">% off</option>
              <option value="fixed">$ off</option>
              <option value="free">100% free</option>
            </select>
          </div>
          <div>
            <label style={{fontSize:'10px',color:C2.smoke,display:'block',marginBottom:'5px',fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase'}}>Value</label>
            <input type="number" value={form.discountValue} onChange={e=>setForm(f=>({...f,discountValue:+e.target.value}))} style={inpSt}/>
          </div>
          <div>
            <label style={{fontSize:'10px',color:C2.smoke,display:'block',marginBottom:'5px',fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase'}}>Max uses</label>
            <input type="number" placeholder="∞" value={form.maxUses} onChange={e=>setForm(f=>({...f,maxUses:e.target.value}))} style={inpSt}/>
          </div>
          <button onClick={create} disabled={loading} style={{padding:'9px 18px',borderRadius:'10px',background:`linear-gradient(135deg,${C2.gold},#E8C06A,#A07830)`,color:C2.g,fontWeight:700,fontSize:'12px',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:`3px 3px 10px ${C2.nd}, 0 0 14px rgba(212,168,79,0.2)`,whiteSpace:'nowrap',height:'38px'}}>
            {loading?'…':'+ Generate'}
          </button>
        </div>
      </Panel>
      <Panel title={`Active codes (${data.promos?.length||0})`}>
        <Tbl heads={['Code','Discount','Uses','Applies To','Expires','Status']}
          rows={(data.promos||[]).map((p:any)=>[
            <span style={{fontFamily:'monospace',fontWeight:700,color:C2.gold,fontSize:'13px'}}>{p.code}</span>,
            `${p.discount_value}${p.discount_type==='percent'?'%':p.discount_type==='free'?'% free':'$'} off`,
            `${p.uses_count}${p.max_uses?` / ${p.max_uses}`:''}`,
            p.applies_to,
            p.expires_at?new Date(p.expires_at).toLocaleDateString():'No expiry',
            <Bdg t={p.is_active?'Active':'Off'} type={p.is_active?'green':'gray'}/>,
          ])}/>
      </Panel>
    </div>
  )
}
