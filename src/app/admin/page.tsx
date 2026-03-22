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

const NAV: {s:Section;l:string;g:string}[] = [
  {s:'overview',   l:'Overview',           g:'Core'},
  {s:'daily',      l:'Daily Report',       g:'Core'},
  {s:'clients',    l:'Clients',            g:'Core'},
  {s:'orders',     l:'Orders & Payments',  g:'Core'},
  {s:'accounting', l:'Accounting / P&L',   g:'Finance'},
  {s:'metrics',    l:'Metrics & Analytics',g:'Finance'},
  {s:'promos',     l:'Promo Codes',        g:'Finance'},
  {s:'mycard',     l:'My Card',            g:'Admin'},
  {s:'rules',      l:'Business Rules',     g:'Admin'},
  {s:'security',   l:'Security Log',       g:'Admin'},
  {s:'compliance', l:'Compliance',         g:'Admin'},
]

function Metric({l,v,sub,accent}:{l:string;v:string;sub?:string;accent?:string}) {
  return (
    <div style={{background:C.g,boxShadow:raised,borderRadius:'16px',padding:'20px',border:'1px solid rgba(255,255,255,0.03)'}}>
      <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:C.smoke,marginBottom:'8px'}}>{l}</div>
      <div style={{fontSize:'26px',fontWeight:700,color:accent||C.silver,fontFamily:"'Syne',sans-serif"}}>{v}</div>
      {sub&&<div style={{fontSize:'11px',color:C.smoke,marginTop:'4px'}}>{sub}</div>}
    </div>
  )
}

function Bdg({t,type}:{t:string;type:'green'|'amber'|'red'|'gray'}) {
  const map = {green:['rgba(74,222,128,0.12)','#4ade80'],amber:['rgba(212,168,79,0.12)',C.gold],red:['rgba(239,68,68,0.12)','#ef4444'],gray:['rgba(255,255,255,0.06)',C.smoke]}
  return <span style={{background:map[type][0],color:map[type][1],padding:'3px 10px',borderRadius:'20px',fontSize:'10px',fontWeight:700,border:`1px solid ${map[type][1]}22`}}>{t}</span>
}

function NmBtn({children,onClick,gold,sm}:{children:React.ReactNode;onClick?:()=>void;gold?:boolean;sm?:boolean}) {
  return (
    <button onClick={onClick} style={{padding:sm?'6px 14px':'9px 20px',borderRadius:'10px',border:'none',background:gold?`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`:C.g,color:gold?C.carbon:C.smoke,fontSize:'12px',fontWeight:gold?700:500,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:gold?goldBox:raisedSm,transition:'all .15s'}}>
      {children}
    </button>
  )
}

export default function AdminDashboard() {
  const [active, setActive]   = useState<Section>('overview')
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timer, setTimer]     = useState(15*60)
  const router = useRouter()

  const load = useCallback(async (s: Section) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/dashboard?section=${s}`)
      if (res.status === 401) { router.push('/admin/login'); return }
      setData(await res.json())
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }, [router])

  useEffect(() => { load(active) }, [active, load])
  useEffect(() => {
    const t = setInterval(() => setTimer(n => { if(n<=1){lock();return 0} return n-1 }), 1000)
    return () => clearInterval(t)
  }, [])

  async function lock() {
    await fetch('/api/admin/auth', { method:'DELETE' })
    router.push('/admin/login')
  }

  const mm = Math.floor(timer/60), ss = String(timer%60).padStart(2,'0')
  const groups = [...new Set(NAV.map(n=>n.g))]
  const fmt = (c:number) => `$${(c/100).toFixed(2)}`
  const fmtDt = (d:string) => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})

  return (
    <div style={{display:'flex',minHeight:'100dvh',background:C.g,fontFamily:"'DM Sans',sans-serif",color:C.silver}}>

      {/* Sidebar */}
      <aside style={{width:'210px',flexShrink:0,background:C.g,boxShadow:`4px 0 20px ${C.nd}`,display:'flex',flexDirection:'column',borderRight:`1px solid rgba(255,255,255,0.03)`}}>

        {/* Logo */}
        <div style={{padding:'16px',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
          <div style={{padding:'12px 16px',background:C.g,boxShadow:raised,borderRadius:'14px',border:'1px solid rgba(212,168,79,0.07)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <img src="/logo.png" alt="Vynk" style={{height:'28px',objectFit:'contain'}} />
          </div>
          <div style={{fontSize:'9px',color:C.smoke,marginTop:'8px',textAlign:'center',letterSpacing:'.1em',textTransform:'uppercase',fontWeight:700}}>Owner Dashboard</div>
        </div>

        {/* Nav */}
        <div style={{flex:1,overflowY:'auto',padding:'8px 0'}}>
          {groups.map(g => (
            <div key={g}>
              <div style={{fontSize:'9px',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(111,115,122,0.5)',padding:'12px 16px 4px'}}>{g}</div>
              {NAV.filter(n=>n.g===g).map(n => (
                <button key={n.s} onClick={() => setActive(n.s)}
                  style={{display:'flex',alignItems:'center',gap:'8px',width:'100%',padding:'9px 16px',fontSize:'12px',fontWeight:500,cursor:'pointer',border:'none',borderLeft:`2px solid ${active===n.s?C.gold:'transparent'}`,background:active===n.s?`rgba(212,168,79,0.06)`:'transparent',color:active===n.s?C.gold:C.smoke,transition:'all .15s',textAlign:'left',fontFamily:"'DM Sans',sans-serif",boxShadow:active===n.s?'none':'none'}}>
                  <span style={{width:'5px',height:'5px',borderRadius:'50%',background:'currentColor',opacity:.5,flexShrink:0}}/>
                  {n.l}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Session */}
        <div style={{padding:'14px 16px',borderTop:'1px solid rgba(255,255,255,0.04)'}}>
          <div style={{background:C.g,boxShadow:insetSm,borderRadius:'10px',padding:'8px 12px',marginBottom:'10px',fontSize:'11px',color:C.smoke,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span>Session</span>
            <span style={{color:timer<120?'#ef4444':C.gold,fontWeight:700,fontFamily:'monospace'}}>{mm}:{ss}</span>
          </div>
          <NmBtn onClick={lock} sm>🔒 Lock session</NmBtn>
        </div>
      </aside>

      {/* Main */}
      <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>

        {/* Topbar */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',height:'56px',background:C.g,borderBottom:'1px solid rgba(255,255,255,0.04)',boxShadow:`0 4px 12px ${C.nd}`}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'15px',color:C.silver}}>{NAV.find(n=>n.s===active)?.l}</div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'6px',background:'rgba(74,222,128,0.08)',border:'1px solid rgba(74,222,128,0.2)',borderRadius:'20px',padding:'5px 12px',fontSize:'10px',fontWeight:700,color:'#4ade80'}}>
              <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#4ade80',boxShadow:'0 0 6px #4ade80'}}/>
              2FA Active
            </div>
            <div style={{fontSize:'11px',color:C.smoke}}>{new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</div>
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:'auto',padding:'24px'}}>
          {loading ? (
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'200px',color:C.smoke,fontSize:'13px'}}>Loading…</div>
          ) : (
            <DashContent section={active} data={data} reload={()=>load(active)} fmt={fmt} fmtDt={fmtDt} />
          )}
        </div>
      </div>
    </div>
  )
}

function Panel({children,title}:{children:React.ReactNode;title?:string}) {
  const C2 = {g:'#0D0F12',nd:'#08090B',nl:'#141720'}
  return (
    <div style={{background:C2.g,boxShadow:`5px 5px 14px ${C2.nd}, -3px -3px 10px ${C2.nl}`,borderRadius:'18px',padding:'20px',border:'1px solid rgba(255,255,255,0.03)',marginBottom:'16px'}}>
      {title&&<div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'14px',color:'#BFC3C9',marginBottom:'16px'}}>{title}</div>}
      {children}
    </div>
  )
}

function Tbl({heads,rows}:{heads:string[];rows:React.ReactNode[][]}) {
  return (
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
        <thead>
          <tr>{heads.map(h=><th key={h} style={{textAlign:'left',padding:'0 0 10px',borderBottom:'1px solid rgba(255,255,255,0.05)',color:'#6F737A',fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',paddingRight:'16px'}}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row,i)=>(
            <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
              {row.map((cell,j)=><td key={j} style={{padding:'9px 16px 9px 0',color:'#BFC3C9',verticalAlign:'middle',fontSize:'12px'}}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DashContent({section,data,reload,fmt,fmtDt}:{section:Section;data:any;reload:()=>void;fmt:(c:number)=>string;fmtDt:(d:string)=>string}) {
  const C2 = {g:'#0D0F12',gold:'#D4A84F',silver:'#BFC3C9',smoke:'#6F737A',nd:'#08090B',nl:'#141720'}
  const grid4 = {display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'20px'}
  if (!data) return null

  if (section==='overview') return (
    <div>
      <div style={grid4 as any}>
        <Metric l="Today Revenue"  v={fmt(data.todayCents||0)}  accent={C2.gold}/>
        <Metric l="Total Revenue"  v={fmt(data.totalCents||0)}  accent='#a78bfa'/>
        <Metric l="Active Cards"   v={String(data.activeCards||0)}/>
        <Metric l="Total Users"    v={String(data.totalUsers||0)}/>
      </div>
      <Panel title="Recent transactions">
        <Tbl heads={['Type','Amount','Method','Country','Date','Status']}
          rows={(data.recentPayments||[]).map((p:any)=>[
            p.type==='new_card'?'New card':'Renewal',
            <span style={{fontWeight:700,color:C2.gold}}>{fmt(p.amount_cents)}</span>,
            p.payment_method||'—', p.country||'—', fmtDt(p.created_at),
            <Bdg t="Paid" type="green"/>,
          ])}/>
      </Panel>
    </div>
  )

  if (section==='clients') return (
    <Panel title={`Clients (${data.clients?.length||0})`}>
      <Tbl heads={['Email','Name','Owner','Joined']}
        rows={(data.clients||[]).map((c:any)=>[
          c.email||'—', c.full_name||'—',
          c.is_owner?<Bdg t="Owner" type="amber"/>:<span style={{color:C2.smoke}}>—</span>,
          fmtDt(c.created_at),
        ])}/>
    </Panel>
  )

  if (section==='orders') return (
    <Panel title={`Orders (${data.orders?.length||0})`}>
      <Tbl heads={['Type','Amount','Method','Country','Promo','Date','Status']}
        rows={(data.orders||[]).map((p:any)=>[
          p.type==='new_card'?'New':'Renewal',
          <span style={{fontWeight:700,color:C2.gold}}>{fmt(p.amount_cents)}</span>,
          p.payment_method||'—', p.country||'—', p.promo_code||'—', fmtDt(p.created_at),
          <Bdg t={p.status} type={p.status==='paid'?'green':p.status==='failed'?'red':'gray'}/>,
        ])}/>
    </Panel>
  )

  if (section==='accounting') return (
    <div>
      <Panel title="Monthly Revenue">
        <Tbl heads={['Month','Transactions','Gross','Net','New Cards','Renewals']}
          rows={(data.monthly||[]).map((m:any)=>[
            fmtDt(m.month), m.transactions, fmt(m.gross_cents),
            <span style={{fontWeight:700,color:'#4ade80'}}>{fmt(m.net_cents)}</span>,
            m.new_cards, m.renewals,
          ])}/>
      </Panel>
    </div>
  )

  if (section==='metrics') return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'20px'}}>
        <Metric l="Total Views"    v={String(data.totalViews||0)}  accent='#a78bfa'/>
        <Metric l="Contacts Saved" v={String(data.totalSaves||0)}  accent={C2.gold}/>
        <Metric l="Top Country"    v={data.byCountry?.[0]?.country||'—'}/>
        <Metric l="Top Source"     v={data.bySource?.[0]?.source||'—'}/>
      </div>
    </div>
  )

  if (section==='promos') return <PromoSection data={data} reload={reload} fmt={fmt} fmtDt={fmtDt}/>

  if (section==='security') return (
    <Panel title="Access log">
      <div>
        {(data.logs||[]).map((l:any)=>(
          <div key={l.id} style={{display:'flex',alignItems:'flex-start',gap:'10px',paddingBottom:'10px',borderBottom:'1px solid rgba(255,255,255,0.03)',marginBottom:'10px'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',marginTop:'4px',flexShrink:0,background:l.event?.includes('success')?'#4ade80':l.event?.includes('failed')||l.event?.includes('blocked')?'#ef4444':C2.gold}}/>
            <div>
              <div style={{fontSize:'12px',fontWeight:500,color:C2.silver,textTransform:'capitalize'}}>{l.event?.replace(/_/g,' ')}</div>
              <div style={{fontSize:'11px',color:C2.smoke,marginTop:'2px'}}>{l.ip||'—'} · {fmtDt(l.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )

  if (section==='mycard') return (
    <Panel title="Owner card — free edits always">
      <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
        {['Edit anytime — no charge','Unlimited card updates','No confirmation dialogs'].map(r=>(
          <div key={r} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.03)',fontSize:'13px'}}>
            <span style={{color:C2.silver}}>{r}</span>
            <Bdg t="Active" type="green"/>
          </div>
        ))}
      </div>
    </Panel>
  )

  if (section==='rules') return (
    <Panel title="Business rules">
      {[{l:'New card price',v:'$20'},{l:'Renewal price',v:'$10'}].map(r=>(
        <div key={r.l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.03)',fontSize:'13px'}}>
          <span style={{color:C2.silver}}>{r.l}</span>
          <span style={{fontWeight:700,color:C2.gold}}>{r.v}</span>
        </div>
      ))}
    </Panel>
  )

  if (section==='compliance') return (
    <Panel title="Legal compliance">
      <Tbl heads={['Document','Standard','Status']}
        rows={[
          ['Terms & Conditions','International',<Bdg t="Live" type="green"/>],
          ['Privacy Policy','GDPR · CCPA · LGPD',<Bdg t="Live" type="green"/>],
          ['Refund Policy','No-refund after publish',<Bdg t="Live" type="green"/>],
          ['PCI DSS','Stripe (delegated)',<Bdg t="Live" type="green"/>],
        ]}/>
    </Panel>
  )

  if (section==='daily') return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px',marginBottom:'20px'}}>
        <Metric l="Today Gross"  v={fmt(Number(data.daily?.[0]?.gross_cents)||0)}  accent={C2.gold}/>
        <Metric l="Stripe Fees"  v={fmt(Number(data.daily?.[0]?.stripe_fee_cents)||0)} accent='#ef4444'/>
        <Metric l="Today Net"    v={fmt(Number(data.daily?.[0]?.net_cents)||0)}   accent='#4ade80'/>
      </div>
      <Panel title="Daily accounting">
        <Tbl heads={['Date','Transactions','Gross','Stripe Fees','Net']}
          rows={(data.daily||[]).map((d:any)=>[
            fmtDt(d.day), d.transactions, fmt(d.gross_cents),
            <span style={{color:'#ef4444'}}>−{fmt(d.stripe_fee_cents)}</span>,
            <span style={{fontWeight:700,color:'#4ade80'}}>{fmt(d.net_cents)}</span>,
          ])}/>
      </Panel>
    </div>
  )

  return null
}

function PromoSection({data,reload,fmt,fmtDt}:any) {
  const C2 = {g:'#0D0F12',gold:'#D4A84F',silver:'#BFC3C9',smoke:'#6F737A',nd:'#08090B',nl:'#141720'}
  const inpSt = {padding:'8px 12px',border:'1px solid rgba(255,255,255,0.05)',borderRadius:'8px',background:C2.g,color:C2.silver,fontSize:'12px',fontFamily:"'DM Sans',sans-serif",outline:'none',boxShadow:`inset 2px 2px 6px ${C2.nd}, inset -2px -2px 5px ${C2.nl}`,width:'100%'}
  const [form, setForm] = useState({code:'',discountType:'percent',discountValue:20,appliesTo:'both',maxUses:''})
  const [loading, setLoading] = useState(false)

  async function create() {
    if (!form.code) { toast.error('Enter a code'); return }
    setLoading(true)
    const r = await fetch('/api/admin/dashboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    if (r.ok) { toast.success('Promo created!'); reload() }
    else toast.error('Error creating promo')
    setLoading(false)
  }

  return (
    <div>
      <Panel title="Create promo code">
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr auto',gap:'10px',alignItems:'end'}}>
          <div><label style={{fontSize:'10px',color:C2.smoke,display:'block',marginBottom:'4px'}}>Code</label><input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="VYNK50" style={inpSt as any}/></div>
          <div><label style={{fontSize:'10px',color:C2.smoke,display:'block',marginBottom:'4px'}}>Type</label>
            <select value={form.discountType} onChange={e=>setForm(f=>({...f,discountType:e.target.value}))} style={inpSt as any}>
              <option value="percent">% off</option><option value="fixed">$ off</option><option value="free">Free</option>
            </select>
          </div>
          <div><label style={{fontSize:'10px',color:C2.smoke,display:'block',marginBottom:'4px'}}>Value</label><input type="number" value={form.discountValue} onChange={e=>setForm(f=>({...f,discountValue:+e.target.value}))} style={inpSt as any}/></div>
          <div><label style={{fontSize:'10px',color:C2.smoke,display:'block',marginBottom:'4px'}}>Max uses</label><input type="number" placeholder="∞" value={form.maxUses} onChange={e=>setForm(f=>({...f,maxUses:e.target.value}))} style={inpSt as any}/></div>
          <button onClick={create} disabled={loading} style={{padding:'9px 18px',borderRadius:'10px',background:`linear-gradient(135deg,${C2.gold},#E8C06A,#A07830)`,color:C2.g,fontWeight:700,fontSize:'12px',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:`3px 3px 10px ${C2.nd}, 0 0 14px rgba(212,168,79,0.2)`,whiteSpace:'nowrap'}}>
            {loading?'…':'Generate'}
          </button>
        </div>
      </Panel>
      <Panel title="Active codes">
        <Tbl heads={['Code','Discount','Uses','Applies To','Status']}
          rows={(data.promos||[]).map((p:any)=>[
            <span style={{fontFamily:'monospace',fontWeight:700,color:C2.gold}}>{p.code}</span>,
            `${p.discount_value}${p.discount_type==='percent'?'%':'$'} off`,
            `${p.uses_count}${p.max_uses?` / ${p.max_uses}`:''}`,
            p.applies_to,
            <Bdg t={p.is_active?'Active':'Off'} type={p.is_active?'green':'gray'}/>,
          ])}/>
      </Panel>
    </div>
  )
}
