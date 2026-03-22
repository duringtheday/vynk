'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'

type Section = 'overview'|'daily'|'clients'|'orders'|'accounting'|'metrics'|'promos'|'mycard'|'security'|'rules'|'compliance'

const NAV: {s:Section;l:string;g:string}[] = [
  {s:'overview',    l:'Overview',          g:'Core'},
  {s:'daily',       l:'Daily Report',      g:'Core'},
  {s:'clients',     l:'Clients',           g:'Core'},
  {s:'orders',      l:'Orders & Payments', g:'Core'},
  {s:'accounting',  l:'Accounting / P&L',  g:'Finance'},
  {s:'metrics',     l:'Metrics & Analytics',g:'Finance'},
  {s:'promos',      l:'Promo Codes',        g:'Finance'},
  {s:'mycard',      l:'My Card',            g:'Admin'},
  {s:'rules',       l:'Business Rules',     g:'Admin'},
  {s:'security',    l:'Security Log',       g:'Admin'},
  {s:'compliance',  l:'Compliance',         g:'Admin'},
]

const fmt   = (c:number) => `$${(c/100).toFixed(2)}`
const fmtDt = (d:string) => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})

function Metric({l,v,sub,c}:{l:string;v:string;sub?:string;c?:string}) {
  return (
    <div style={{ background:'#16161e', border:'1px solid #2a2a3a', borderRadius:'12px', padding:'16px' }}>
      <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', color:'#6a6a7a', marginBottom:'6px' }}>{l}</div>
      <div style={{ fontSize:'24px', fontWeight:700, color:c||'#f0f0f4' }}>{v}</div>
      {sub && <div style={{ fontSize:'11px', color:'#6a6a7a', marginTop:'4px' }}>{sub}</div>}
    </div>
  )
}

function Tbl({heads,rows}:{heads:string[];rows:React.ReactNode[][]}) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
        <thead>
          <tr>{heads.map(h=><th key={h} style={{ textAlign:'left', padding:'0 0 10px', borderBottom:'1px solid #2a2a3a', color:'#6a6a7a', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', paddingRight:'16px' }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row,i)=>(
            <tr key={i} style={{ borderBottom:'1px solid #1a1a2e' }}>
              {row.map((cell,j)=><td key={j} style={{ padding:'9px 16px 9px 0', color:'#c0c0d0', verticalAlign:'middle' }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Bdg({t,type}:{t:string;type:'green'|'blue'|'amber'|'gray'|'red'}) {
  const map = { green:['#d1fae5','#065f46'], blue:['#dbeafe','#1e40af'], amber:['#fef3c7','#92400e'], gray:['#1a1a2e','#6a6a7a'], red:['#fee2e2','#991b1b'] }
  return <span style={{ background:map[type][0], color:map[type][1], padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:700 }}>{t}</span>
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
      if (res.status===401) { router.push('/admin/login'); return }
      setData(await res.json())
    } catch { toast.error('Failed to load') }
    finally  { setLoading(false) }
  }, [router])

  useEffect(()=>{ load(active) }, [active,load])
  useEffect(()=>{
    const t = setInterval(()=>setTimer(n=>{ if(n<=1){lock();return 0} return n-1 }),1000)
    return ()=>clearInterval(t)
  },[])

  async function lock() {
    await fetch('/api/admin/auth',{method:'DELETE'})
    router.push('/admin/login')
  }

  async function del(table:string,id:string) {
    if(!confirm('Delete this record permanently?')) return
    const r = await fetch('/api/admin/dashboard',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({table,id})})
    if(r.ok){toast.success('Deleted');load(active)}else toast.error('Delete failed')
  }

  const mm = Math.floor(timer/60), ss = String(timer%60).padStart(2,'0')
  const groups = [...new Set(NAV.map(n=>n.g))]

  const S: React.CSSProperties = { fontFamily:"'DM Sans',sans-serif", fontSize:'13px', color:'#f0f0f4' }
  const inp = 'px-3 py-2 bg-vynk-dark border border-vynk-border rounded-lg text-sm text-vynk-text focus:outline-none focus:border-vynk-gold'

  return (
    <div style={{ display:'flex', minHeight:'100vh', ...S }}>

      {/* Sidebar */}
      <aside style={{ width:'210px', flexShrink:0, background:'#0a0a14', borderRight:'1px solid #1e1e3a', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid #1e1e3a' }}>
          <Image src="/logo.png" alt="Vynk" width={80} height={26} style={{ objectFit:'contain', opacity:.85 }} />
          <div style={{ fontSize:'9px', color:'#3a3a5a', marginTop:'4px', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:700 }}>Owner Dashboard</div>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'6px 0' }}>
          {groups.map(g=>(
            <div key={g}>
              <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'#3a3a5a', padding:'12px 16px 4px' }}>{g}</div>
              {NAV.filter(n=>n.g===g).map(n=>(
                <button key={n.s} onClick={()=>setActive(n.s)}
                  style={{ display:'flex', alignItems:'center', gap:'8px', width:'100%', padding:'8px 16px', fontSize:'12px', fontWeight:500, cursor:'pointer', border:'none', borderLeft:`2px solid ${active===n.s?'#d4a843':'transparent'}`, background:active===n.s?'rgba(212,168,67,0.08)':'transparent', color:active===n.s?'#d4a843':'#6a6a7a', transition:'all .15s', textAlign:'left', fontFamily:"'DM Sans',sans-serif" }}>
                  <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'currentColor', opacity:.5, flexShrink:0 }}/>
                  {n.l}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding:'14px 16px', borderTop:'1px solid #1e1e3a' }}>
          <div style={{ fontSize:'11px', color:'#6a6a7a', marginBottom:'8px' }}>Session: <span style={{ color:'#d4a843', fontWeight:600 }}>{mm}:{ss}</span></div>
          <button onClick={lock} style={{ width:'100%', padding:'6px', border:'1px solid #7f1d1d', borderRadius:'8px', background:'transparent', color:'#ef4444', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Lock</button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#0a0a0a', minWidth:0 }}>
        {/* Topbar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', height:'50px', background:'#111118', borderBottom:'1px solid #1e1e3a' }}>
          <div style={{ fontWeight:600, fontSize:'14px' }}>{NAV.find(n=>n.s===active)?.l}</div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.25)', borderRadius:'20px', padding:'4px 10px', fontSize:'10px', fontWeight:700, color:'#22c55e' }}>
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#22c55e' }}/>2FA Active · Vault Locked
            </div>
            <div style={{ fontSize:'11px', color:'#6a6a7a' }}>{new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>
          {loading ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'200px', color:'#6a6a7a' }}>Loading…</div>
          ) : (
            <Content section={active} data={data} del={del} reload={()=>load(active)} />
          )}
        </div>
      </div>
    </div>
  )
}

function Content({section,data,del,reload}:{section:Section;data:any;del:(t:string,id:string)=>void;reload:()=>void}) {
  if (!data) return null
  const fmt=(c:number)=>`$${(c/100).toFixed(2)}`
  const fmtDt=(d:string)=>new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
  const grid4 = { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }
  const panel = { background:'#16161e', border:'1px solid #2a2a3a', borderRadius:'14px', padding:'20px', marginBottom:'16px' }

  if (section==='overview') return (
    <div>
      <div style={grid4 as any}>
        <Metric l="Today's Revenue" v={fmt(data.todayCents||0)} c="#d4a843" />
        <Metric l="Total Revenue"   v={fmt(data.totalCents||0)} c="#6366f1" />
        <Metric l="Active Cards"    v={String(data.activeCards||0)} />
        <Metric l="Total Users"     v={String(data.totalUsers||0)} />
      </div>
      <div style={panel as any}>
        <div style={{ fontWeight:600, marginBottom:'16px' }}>Recent transactions</div>
        <Tbl heads={['Client','Type','Amount','Method','Country','Date','Status']}
          rows={(data.recentPayments||[]).map((p:any)=>[
            p.user_id?.slice(0,8)||'—', p.type==='new_card'?'New card':'Renewal',
            <span style={{fontWeight:700,color:'#d4a843'}}>{fmt(p.amount_cents)}</span>,
            p.payment_method||'—', p.country||'—', fmtDt(p.created_at),
            <Bdg t="Paid" type="green"/>,
          ])} />
      </div>
    </div>
  )

  if (section==='daily') return (
    <div>
      <div style={{...grid4 as any, gridTemplateColumns:'repeat(3,1fr)'}}>
        <Metric l="Today Gross"    v={fmt(Number(data.daily?.[0]?.gross_cents)||0)} c="#d4a843"/>
        <Metric l="Stripe Fees"    v={fmt(Number(data.daily?.[0]?.stripe_fee_cents)||0)} c="#ef4444"/>
        <Metric l="Today Net"      v={fmt(Number(data.daily?.[0]?.net_cents)||0)} c="#22c55e"/>
      </div>
      <div style={panel as any}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
          <div style={{fontWeight:600}}>Daily accounting</div>
          <button onClick={reload} style={{fontSize:'11px',color:'#d4a843',border:'none',background:'transparent',cursor:'pointer',fontFamily:'inherit'}}>Refresh</button>
        </div>
        <Tbl heads={['Date','Transactions','Gross','Stripe Fees','Net']}
          rows={(data.daily||[]).map((d:any)=>[
            fmtDt(d.day), d.transactions, fmt(d.gross_cents),
            <span style={{color:'#ef4444'}}>−{fmt(d.stripe_fee_cents)}</span>,
            <span style={{fontWeight:700,color:'#22c55e'}}>{fmt(d.net_cents)}</span>,
          ])} />
      </div>
    </div>
  )

  if (section==='clients') return (
    <div style={panel as any}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
        <div style={{fontWeight:600}}>All clients ({data.clients?.length||0})</div>
        <div style={{fontSize:'11px',color:'#d4a843',cursor:'pointer'}}>Export CSV</div>
      </div>
      <Tbl heads={['Clerk ID','Name','Email','Owner','Joined','Actions']}
        rows={(data.clients||[]).map((c:any)=>[
          <span style={{fontFamily:'monospace',fontSize:'10px',color:'#6a6a7a'}}>{c.clerk_id?.slice(0,16)}…</span>,
          c.full_name||'—', c.email||'—',
          c.is_owner?<Bdg t="Owner" type="amber"/>:<span style={{color:'#6a6a7a'}}>—</span>,
          fmtDt(c.created_at),
          <button onClick={()=>del('users',c.id)} style={{fontSize:'11px',color:'#ef4444',border:'none',background:'transparent',cursor:'pointer',fontFamily:'inherit'}}>Delete</button>,
        ])} />
    </div>
  )

  if (section==='orders') return (
    <div style={panel as any}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
        <div style={{fontWeight:600}}>All orders ({data.orders?.length||0})</div>
        <div style={{fontSize:'11px',color:'#d4a843',cursor:'pointer'}}>Export CSV</div>
      </div>
      <Tbl heads={['Type','Amount','Method','Country','Promo','Date','Status','Actions']}
        rows={(data.orders||[]).map((p:any)=>[
          p.type==='new_card'?'New':'Renewal',
          <span style={{fontWeight:700,color:'#d4a843'}}>{fmt(p.amount_cents)}</span>,
          p.payment_method||'—', p.country||'—', p.promo_code||'—', fmtDt(p.created_at),
          <Bdg t={p.status} type={p.status==='paid'?'green':p.status==='failed'?'red':'gray'}/>,
          <button onClick={()=>del('payments',p.id)} style={{fontSize:'11px',color:'#ef4444',border:'none',background:'transparent',cursor:'pointer',fontFamily:'inherit'}}>Delete</button>,
        ])} />
    </div>
  )

  if (section==='accounting') return (
    <div>
      <div style={{...panel as any}}>
        <div style={{fontWeight:600,marginBottom:'16px'}}>Monthly Revenue</div>
        <Tbl heads={['Month','Transactions','Gross','Net','New Cards','Renewals']}
          rows={(data.monthly||[]).map((m:any)=>[
            fmtDt(m.month), m.transactions, fmt(m.gross_cents),
            <span style={{fontWeight:700,color:'#22c55e'}}>{fmt(m.net_cents)}</span>,
            m.new_cards, m.renewals,
          ])} />
      </div>
      <div style={panel as any}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
          <div style={{fontWeight:600}}>Daily detail</div>
          <button onClick={()=>{if(confirm('Clear all accounting history?'))toast.error('Use Neon console to clear data')}} style={{fontSize:'11px',color:'#ef4444',border:'none',background:'transparent',cursor:'pointer',fontFamily:'inherit'}}>Clear history</button>
        </div>
        <Tbl heads={['Date','Txns','Gross','Stripe Fees','Net']}
          rows={(data.daily||[]).map((d:any)=>[
            fmtDt(d.day), d.transactions, fmt(d.gross_cents),
            <span style={{color:'#ef4444'}}>−{fmt(d.stripe_fee_cents)}</span>,
            <span style={{fontWeight:700,color:'#22c55e'}}>{fmt(d.net_cents)}</span>,
          ])} />
      </div>
    </div>
  )

  if (section==='metrics') return (
    <div>
      <div style={grid4 as any}>
        <Metric l="Total Views"    v={String(data.totalViews||0)} c="#6366f1"/>
        <Metric l="Contacts Saved" v={String(data.totalSaves||0)} c="#d4a843"/>
        <Metric l="Top Country"    v={data.byCountry?.[0]?.country||'—'}/>
        <Metric l="Top Source"     v={data.bySource?.[0]?.source||'—'}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <div style={panel as any}>
          <div style={{fontWeight:600,marginBottom:'14px'}}>Traffic by country</div>
          {(data.byCountry||[]).slice(0,8).map((r:any)=>{
            const total = (data.byCountry||[]).reduce((s:number,x:any)=>s+x.cnt,0)
            const pct = total>0?Math.round((r.cnt/total)*100):0
            return (
              <div key={r.country} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px',fontSize:'12px'}}>
                <span style={{width:'24px'}}>{r.country}</span>
                <div style={{flex:1,background:'#1a1a2e',borderRadius:'4px',height:'6px'}}><div style={{width:`${pct}%`,height:'6px',background:'#d4a843',borderRadius:'4px'}}/></div>
                <span style={{color:'#6a6a7a',minWidth:'32px',textAlign:'right'}}>{pct}%</span>
              </div>
            )
          })}
        </div>
        <div style={panel as any}>
          <div style={{fontWeight:600,marginBottom:'14px'}}>Traffic by source</div>
          {(data.bySource||[]).map((r:any)=>{
            const total = (data.bySource||[]).reduce((s:number,x:any)=>s+x.cnt,0)
            const pct = total>0?Math.round((r.cnt/total)*100):0
            return (
              <div key={r.source} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px',fontSize:'12px'}}>
                <span style={{width:'70px',color:'#c0c0d0',textTransform:'capitalize'}}>{r.source}</span>
                <div style={{flex:1,background:'#1a1a2e',borderRadius:'4px',height:'6px'}}><div style={{width:`${pct}%`,height:'6px',background:'#6366f1',borderRadius:'4px'}}/></div>
                <span style={{color:'#6a6a7a',minWidth:'32px',textAlign:'right'}}>{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  if (section==='promos') return <PromoSection data={data} reload={reload} del={del}/>

  if (section==='security') return (
    <div>
      <div style={{...grid4 as any, gridTemplateColumns:'repeat(4,1fr)'}}>
        <Metric l="2FA Status"    v="Active" c="#22c55e"/>
        <Metric l="PIN Lock"      v="Active" c="#22c55e"/>
        <Metric l="Auto-lock"     v="15 min"/>
        <Metric l="Failed Logins" v={String((data.logs||[]).filter((l:any)=>l.event?.includes('failed')).length)} c="#ef4444"/>
      </div>
      <div style={panel as any}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
          <div style={{fontWeight:600}}>Access log</div>
        </div>
        <div>
          {(data.logs||[]).map((l:any)=>(
            <div key={l.id} style={{display:'flex',alignItems:'flex-start',gap:'10px',paddingBottom:'10px',borderBottom:'1px solid #1a1a2e',marginBottom:'10px'}}>
              <div style={{width:'8px',height:'8px',borderRadius:'50%',marginTop:'4px',flexShrink:0,background:l.event?.includes('success')?'#22c55e':l.event?.includes('failed')||l.event?.includes('blocked')?'#ef4444':'#f59e0b'}}/>
              <div>
                <div style={{fontSize:'12px',fontWeight:500,color:'#c0c0d0',textTransform:'capitalize'}}>{l.event?.replace(/_/g,' ')}</div>
                <div style={{fontSize:'11px',color:'#6a6a7a',marginTop:'2px'}}>{l.ip||'—'} · {l.country||'—'} · {fmtDt(l.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (section==='mycard') return (
    <div style={{maxWidth:'480px'}}>
      <div style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)',borderRadius:'20px',padding:'28px',marginBottom:'16px',border:'1px solid #2a2a3a'}}>
        <div style={{fontSize:'9px',fontWeight:700,letterSpacing:'.14em',color:'#d4a843',opacity:.6,textTransform:'uppercase',marginBottom:'14px'}}>OWNER CARD — FREE EDITS ALWAYS</div>
        <div style={{fontSize:'22px',fontWeight:700,color:'#f0f0f4',marginBottom:'4px'}}>Your Name Here</div>
        <div style={{fontSize:'13px',color:'rgba(240,240,244,0.6)',marginBottom:'16px'}}>Founder · Vynk</div>
        <div style={{display:'flex',gap:'8px'}}>
          {['Edit card','Change colors','Preview'].map(l=>(
            <button key={l} style={{padding:'7px 14px',borderRadius:'10px',border:'1px solid rgba(212,168,67,.4)',background:'rgba(212,168,67,.1)',color:'#d4a843',fontSize:'12px',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{...panel as any}}>
        <div style={{fontWeight:600,marginBottom:'12px'}}>Owner privileges</div>
        {['Edit anytime — no charge','Unlimited card updates','No confirmation dialogs'].map(r=>(
          <div key={r} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #1a1a2e',fontSize:'13px'}}>
            <span style={{color:'#c0c0d0'}}>{r}</span>
            <Bdg t="Active" type="green"/>
          </div>
        ))}
      </div>
    </div>
  )

  if (section==='rules') return (
    <div style={{maxWidth:'500px', ...panel as any}}>
      <div style={{fontWeight:600,marginBottom:'16px'}}>Business rules</div>
      {[
        {l:'New card price',   k:'new',  v:'$20'},
        {l:'Renewal price',   k:'ren',  v:'$10'},
      ].map(r=>(
        <div key={r.k} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #1a1a2e',fontSize:'13px'}}>
          <span style={{color:'#c0c0d0'}}>{r.l}</span>
          <span style={{fontWeight:700,color:'#d4a843'}}>{r.v}</span>
        </div>
      ))}
      {['Free color changes','Confirm dialog on major edit','Archive old card on renewal'].map(r=>(
        <div key={r} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #1a1a2e',fontSize:'13px'}}>
          <span style={{color:'#c0c0d0'}}>{r}</span>
          <div style={{width:'32px',height:'18px',borderRadius:'9px',background:'#d4a843',cursor:'pointer'}}><div style={{width:'14px',height:'14px',borderRadius:'50%',background:'#0a0a0a',margin:'2px 16px 2px 2px'}}/></div>
        </div>
      ))}
    </div>
  )

  if (section==='compliance') return (
    <div style={panel as any}>
      <div style={{fontWeight:600,marginBottom:'16px'}}>Legal compliance</div>
      <Tbl heads={['Document','Standard','Shown at','Status']}
        rows={[
          ['Terms & Conditions','International','Register + Checkout',<Bdg t="Live" type="green"/>],
          ['Privacy Policy','GDPR · CCPA · LGPD','Register + Footer',<Bdg t="Live" type="green"/>],
          ['Refund Policy','No-refund after publish','Before payment',<Bdg t="Live" type="green"/>],
          ['Cookie Consent','EU ePrivacy','First visit',<Bdg t="Live" type="green"/>],
          ['Data Deletion','GDPR Art. 17','Account settings',<Bdg t="Live" type="green"/>],
          ['PCI DSS','Stripe (delegated)','N/A',<Bdg t="Live" type="green"/>],
        ]} />
    </div>
  )

  return null
}

function PromoSection({data,reload,del}:any) {
  const [form, setForm] = useState({code:'',discountType:'percent',discountValue:20,appliesTo:'both',maxUses:'',expiresAt:''})
  const [loading,setLoading] = useState(false)
  const panel = {background:'#16161e',border:'1px solid #2a2a3a',borderRadius:'14px',padding:'20px',marginBottom:'16px'}
  const inp = {padding:'7px 10px',border:'1px solid #2a2a3a',borderRadius:'8px',background:'#0a0a0a',color:'#f0f0f4',fontSize:'12px',fontFamily:"'DM Sans',sans-serif",outline:'none',width:'100%'}

  async function create() {
    if (!form.code) { toast.error('Enter a code'); return }
    setLoading(true)
    const r = await fetch('/api/admin/dashboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const d = await r.json()
    if (r.ok) { toast.success('Promo created!'); reload(); setForm(f=>({...f,code:''})) }
    else toast.error(d.error)
    setLoading(false)
  }

  return (
    <div>
      <div style={panel as any}>
        <div style={{fontWeight:600,marginBottom:'14px'}}>Create promo code</div>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr auto',gap:'10px',alignItems:'end'}}>
          <div><label style={{fontSize:'11px',color:'#6a6a7a',display:'block',marginBottom:'4px'}}>Code</label><input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="VYNK50" style={inp as any}/></div>
          <div><label style={{fontSize:'11px',color:'#6a6a7a',display:'block',marginBottom:'4px'}}>Type</label><select value={form.discountType} onChange={e=>setForm(f=>({...f,discountType:e.target.value}))} style={inp as any}><option value="percent">% off</option><option value="fixed">$ off</option><option value="free">100% free</option></select></div>
          <div><label style={{fontSize:'11px',color:'#6a6a7a',display:'block',marginBottom:'4px'}}>Value</label><input type="number" value={form.discountValue} onChange={e=>setForm(f=>({...f,discountValue:+e.target.value}))} style={inp as any}/></div>
          <div><label style={{fontSize:'11px',color:'#6a6a7a',display:'block',marginBottom:'4px'}}>Max uses</label><input type="number" placeholder="∞" value={form.maxUses} onChange={e=>setForm(f=>({...f,maxUses:e.target.value}))} style={inp as any}/></div>
          <button onClick={create} disabled={loading} style={{padding:'8px 16px',borderRadius:'8px',background:'linear-gradient(135deg,#d4a843,#e8c96a)',color:'#0a0a0a',fontWeight:700,fontSize:'13px',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",height:'34px'}}>
            {loading?'…':'Generate'}
          </button>
        </div>
      </div>
      <div style={panel as any}>
        <div style={{fontWeight:600,marginBottom:'14px'}}>Active codes</div>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
          <thead><tr>{['Code','Discount','Uses','Applies To','Expires','Status','Actions'].map(h=><th key={h} style={{textAlign:'left',padding:'0 0 10px',borderBottom:'1px solid #2a2a3a',color:'#6a6a7a',fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',paddingRight:'12px'}}>{h}</th>)}</tr></thead>
          <tbody>
            {(data.promos||[]).map((p:any)=>(
              <tr key={p.id} style={{borderBottom:'1px solid #1a1a2e'}}>
                <td style={{padding:'9px 12px 9px 0',fontFamily:'monospace',fontWeight:700,color:'#d4a843'}}>{p.code}</td>
                <td style={{padding:'9px 12px 9px 0',color:'#c0c0d0'}}>{p.discount_value}{p.discount_type==='percent'?'%':p.discount_type==='free'?'% free':'$'} off</td>
                <td style={{padding:'9px 12px 9px 0',color:'#c0c0d0'}}>{p.uses_count}{p.max_uses?` / ${p.max_uses}`:''}</td>
                <td style={{padding:'9px 12px 9px 0',color:'#c0c0d0'}}>{p.applies_to}</td>
                <td style={{padding:'9px 12px 9px 0',color:'#c0c0d0'}}>{p.expires_at?new Date(p.expires_at).toLocaleDateString():'No expiry'}</td>
                <td style={{padding:'9px 12px 9px 0'}}><Bdg t={p.is_active?'Active':'Off'} type={p.is_active?'green':'gray'}/></td>
                <td style={{padding:'9px 12px 9px 0'}}><button onClick={()=>del('promo_codes',p.id)} style={{fontSize:'11px',color:'#ef4444',border:'none',background:'transparent',cursor:'pointer',fontFamily:'inherit'}}>Disable</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
