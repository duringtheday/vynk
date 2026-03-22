'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const [step, setStep]         = useState<'pin'|'2fa'>('pin')
  const [pin, setPin]           = useState('')
  const [code, setCode]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [attempts, setAttempts] = useState(0)
  const router = useRouter()

  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫']
  const addDigit = (d:string) => { if(pin.length<6) setPin(p=>p+d) }
  const delDigit = () => setPin(p=>p.slice(0,-1))

  async function submitPin() {
    if(pin.length!==6) return
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin})})
      const data = await res.json()
      if(!res.ok){setAttempts(a=>a+1);setPin('');toast.error(data.error);return}
      setStep('2fa'); toast.success('PIN verified — check your email')
    } finally { setLoading(false) }
  }

  async function submit2FA() {
    if(code.length!==6) return
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})})
      const data = await res.json()
      if(!res.ok){toast.error(data.error);return}
      toast.success('Access granted'); router.push('/admin')
    } finally { setLoading(false) }
  }

  const NM = {
    bg:    '#1a1a24',
    dark:  '#0d0d14',
    lite:  '#27273a',
    gold:  '#d4a843',
    text:  '#e8e8f0',
    muted: '#6a6a8a',
  }
  const raised  = `6px 6px 14px ${NM.dark}, -4px -4px 10px ${NM.lite}`
  const raisedSm= `3px 3px 8px ${NM.dark}, -2px -2px 6px ${NM.lite}`
  const inset   = `inset 4px 4px 10px ${NM.dark}, inset -3px -3px 8px ${NM.lite}`
  const insetSm = `inset 2px 2px 6px ${NM.dark}, inset -2px -2px 4px ${NM.lite}`

  return (
    <main style={{ minHeight:'100vh', background:NM.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:"'DM Sans',sans-serif" }}>

      {/* Outer container */}
      <div style={{ width:'340px', background:NM.bg, boxShadow:`14px 14px 36px ${NM.dark}, -8px -8px 24px ${NM.lite}`, borderRadius:'32px', padding:'40px 32px', border:'1px solid rgba(255,255,255,0.04)', textAlign:'center' }}>

        <Image src="/logo.png" alt="Vynk" width={90} height={29} style={{ objectFit:'contain', marginBottom:'24px', opacity:.85 }} />

        {/* Lock icon — neumorphic circle */}
        <div style={{ width:'64px', height:'64px', background:NM.bg, boxShadow:raisedSm, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:'26px' }}>
          🔐
        </div>

        <div style={{ color:NM.gold, fontSize:'16px', fontWeight:700, marginBottom:'4px' }}>Owner Vault</div>
        <div style={{ color:NM.muted, fontSize:'12px', marginBottom:'28px' }}>
          {step==='pin' ? 'Enter your 6-digit PIN' : 'Enter the code sent to your email'}
        </div>

        {/* Progress steps */}
        <div style={{ display:'flex', justifyContent:'center', gap:'8px', marginBottom:'28px' }}>
          {[0,1,2].map(i=>(
            <div key={i} style={{ width:'28px', height:'4px', borderRadius:'2px', background: i===0?NM.gold : i===1&&step==='2fa'?NM.gold : NM.bg, boxShadow: i<=1?`inset 2px 2px 4px ${NM.dark}, inset -1px -1px 3px ${NM.lite}`:'none', transition:'all .3s' }} />
          ))}
        </div>

        {step==='pin' ? (
          <>
            {/* PIN dots */}
            <div style={{ display:'flex', justifyContent:'center', gap:'10px', marginBottom:'28px' }}>
              {Array.from({length:6}).map((_,i)=>(
                <div key={i} style={{
                  width:'40px', height:'48px', borderRadius:'12px',
                  background: NM.bg,
                  boxShadow: i<pin.length ? `inset 3px 3px 8px ${NM.dark}, inset -2px -2px 6px rgba(212,168,67,0.12), 0 0 8px rgba(212,168,67,0.15)` : insetSm,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'18px', color:NM.gold, fontWeight:700,
                  transition:'all .15s',
                  border: i<pin.length?'1px solid rgba(212,168,67,0.15)':'1px solid rgba(255,255,255,0.02)',
                }}>
                  {i<pin.length?'●':''}
                </div>
              ))}
            </div>

            {/* Numpad */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', marginBottom:'20px' }}>
              {digits.map((d,i)=>(
                <button key={i} onClick={()=>{ if(d==='⌫') delDigit(); else if(d) addDigit(d) }}
                  style={{
                    height:'54px', borderRadius:'14px',
                    background:NM.bg,
                    boxShadow: d===''?'none' : d==='⌫'?raisedSm : raisedSm,
                    border:'1px solid rgba(255,255,255,0.03)',
                    color: d==='⌫'?NM.gold : NM.text,
                    fontSize:'18px', fontWeight:600, cursor:d?'pointer':'default',
                    fontFamily:"'DM Sans',sans-serif",
                    visibility: d?'visible':'hidden',
                    transition:'all .12s',
                    outline:'none',
                  }}
                  onMouseDown={e=>{
                    const el = e.currentTarget
                    el.style.boxShadow = insetSm
                    el.style.transform = 'scale(0.96)'
                  }}
                  onMouseUp={e=>{
                    const el = e.currentTarget
                    el.style.boxShadow = raisedSm
                    el.style.transform = 'scale(1)'
                  }}>
                  {d}
                </button>
              ))}
            </div>

            <button onClick={submitPin} disabled={pin.length!==6||loading}
              style={{ width:'100%', padding:'14px', borderRadius:'14px', background:'linear-gradient(135deg,#d4a843,#e8c96a,#a07830)', color:'#0d0d14', fontWeight:700, fontSize:'15px', border:'none', cursor:'pointer', boxShadow:`4px 4px 12px ${NM.dark}, 0 0 20px rgba(212,168,67,0.2)`, opacity:pin.length!==6||loading?.5:1, fontFamily:"'DM Sans',sans-serif", transition:'all .15s' }}>
              {loading?'Verifying…':'Verify PIN'}
            </button>
            {attempts>0 && <p style={{ color:'#ef4444', fontSize:'12px', marginTop:'12px' }}>{3-attempts} attempt(s) remaining before lockout</p>}
          </>
        ) : (
          <>
            {/* 2FA input — neumorphic inset */}
            <input type="text" maxLength={6} placeholder="000000" value={code}
              onChange={e=>setCode(e.target.value.replace(/\D/g,''))} autoFocus
              style={{ width:'100%', textAlign:'center', fontSize:'32px', fontWeight:700, letterSpacing:'.4em', background:NM.bg, border:'1px solid rgba(212,168,67,0.12)', color:NM.text, borderRadius:'14px', padding:'18px 8px', marginBottom:'20px', fontFamily:"'DM Sans',sans-serif", outline:'none', boxShadow:inset }} />
            <button onClick={submit2FA} disabled={code.length!==6||loading}
              style={{ width:'100%', padding:'14px', borderRadius:'14px', background:'linear-gradient(135deg,#d4a843,#e8c96a,#a07830)', color:'#0d0d14', fontWeight:700, fontSize:'15px', border:'none', cursor:'pointer', boxShadow:`4px 4px 12px ${NM.dark}, 0 0 20px rgba(212,168,67,0.2)`, opacity:code.length!==6||loading?.5:1, fontFamily:"'DM Sans',sans-serif" }}>
              {loading?'Verifying…':'Verify Code'}
            </button>
            <button onClick={()=>{setStep('pin');setPin('');setCode('')}}
              style={{ width:'100%', marginTop:'12px', padding:'8px', background:'transparent', border:'none', color:NM.muted, fontSize:'12px', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
              ← Back to PIN
            </button>
          </>
        )}
      </div>
    </main>
  )
}
