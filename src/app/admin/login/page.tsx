'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const C = { g:'#0D0F12', gold:'#D4A84F', silver:'#BFC3C9', smoke:'#6F737A', carbon:'#050607', nd:'#08090B', nl:'#141720' }
const raised   = `6px 6px 14px ${C.nd}, -3px -3px 10px ${C.nl}`
const raisedSm = `3px 3px 8px ${C.nd}, -2px -2px 6px ${C.nl}`
const inset    = `inset 4px 4px 10px ${C.nd}, inset -3px -3px 8px ${C.nl}`
const insetSm  = `inset 2px 2px 6px ${C.nd}, inset -2px -2px 5px ${C.nl}`
const goldBox  = `4px 4px 12px ${C.nd}, 0 0 20px rgba(212,168,79,0.2)`

export default function AdminLoginPage() {
  const [step, setStep]         = useState<'pin'|'2fa'>('pin')
  const [pin, setPin]           = useState('')
  const [code, setCode]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [attempts, setAttempts] = useState(0)
  const router = useRouter()

  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  async function submitPin() {
    if (pin.length !== 6) return
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/auth', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ pin }) })
      const data = await res.json()
      if (!res.ok) { setAttempts(a => a+1); setPin(''); toast.error(data.error); return }
      setStep('2fa'); toast.success('PIN verified — check your email')
    } finally { setLoading(false) }
  }

  async function submit2FA() {
    if (code.length !== 6) return
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/auth', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ code }) })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success('Access granted'); router.push('/admin')
    } finally { setLoading(false) }
  }

  return (
    <main style={{ minHeight:'100dvh', background:C.g, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ width:'100%', maxWidth:'340px', display:'flex', flexDirection:'column', alignItems:'center' }}>

        {/* Logo con contenedor neumórfico */}
        <div style={{ padding:'10px 10px', background:C.g, boxShadow:`8px 8px 20px ${C.nd}, -5px -5px 14px ${C.nl}, inset 0 1px 0 rgba(212,168,79,0.08)`, borderRadius:'20px', border:'1px solid rgba(212,168,79,0.07)', marginBottom:'28px' }}>
          <img src="/logo.png" alt="Vynk" style={{ width:'100px', height:'100%', filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.6))', display:'block', borderRadius:'12px' }} />
        </div>

        {/* Vault card */}
        <div style={{ width:'100%', background:C.g, boxShadow:`14px 14px 36px ${C.nd}, -8px -8px 24px ${C.nl}`, borderRadius:'28px', padding:'36px 28px', border:'1px solid rgba(212,168,79,0.06)', textAlign:'center' }}>

          {/* Lock icon */}
          <div style={{ width:'56px', height:'56px', background:C.g, boxShadow:raisedSm, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'22px' }}>🔐</div>

          <div style={{ color:C.gold, fontSize:'15px', fontWeight:700, marginBottom:'4px', fontFamily:"'Syne',sans-serif" }}>Owner Vault</div>
          <div style={{ color:C.smoke, fontSize:'12px', marginBottom:'24px', fontWeight:300 }}>
            {step === 'pin' ? 'Enter your 6-digit PIN' : 'Enter the code sent to your email'}
          </div>

          {/* Progress */}
          <div style={{ display:'flex', justifyContent:'center', gap:'6px', marginBottom:'24px' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ height:'3px', borderRadius:'2px', transition:'all .3s', width: i <= (step==='2fa'?1:0) ? '28px' : '6px', background: i <= (step==='2fa'?1:0) ? C.gold : C.smoke, opacity: i <= (step==='2fa'?1:0) ? 1 : .25 }} />
            ))}
          </div>

          {step === 'pin' ? (
            <>
              {/* PIN dots */}
              <div style={{ display:'flex', justifyContent:'center', gap:'7px', marginBottom:'20px' }}>
                {Array.from({length:6}).map((_,i) => (
                  <div key={i} style={{ width:'36px', height:'44px', borderRadius:'10px', background:C.g, boxShadow: i < pin.length ? `inset 3px 3px 8px ${C.nd}, inset -2px -2px 6px rgba(212,168,79,0.1), 0 0 8px rgba(212,168,79,0.12)` : insetSm, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', color:C.gold, fontWeight:700, transition:'all .15s', border: i < pin.length ? '1px solid rgba(212,168,79,0.12)' : '1px solid rgba(255,255,255,0.02)' }}>
                    {i < pin.length ? '●' : ''}
                  </div>
                ))}
              </div>

              {/* Numpad */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'16px' }}>
                {digits.map((d,i) => (
                  <button key={i} onClick={() => { if(d==='⌫') setPin(p=>p.slice(0,-1)); else if(d && pin.length<6) setPin(p=>p+d) }}
                    onMouseDown={e => { if(d){e.currentTarget.style.boxShadow=insetSm;e.currentTarget.style.transform='scale(0.96)'}}}
                    onMouseUp={e => { if(d){e.currentTarget.style.boxShadow=raisedSm;e.currentTarget.style.transform='scale(1)'}}}
                    style={{ height:'50px', borderRadius:'12px', background:C.g, boxShadow:d?raisedSm:'none', border:'1px solid rgba(255,255,255,0.025)', color:d==='⌫'?C.gold:C.silver, fontSize:'18px', fontWeight:600, cursor:d?'pointer':'default', fontFamily:"'DM Sans',sans-serif", visibility:d?'visible':'hidden', outline:'none', transition:'all .1s' }}>
                    {d}
                  </button>
                ))}
              </div>

              <button onClick={submitPin} disabled={pin.length!==6||loading}
                style={{ width:'100%', padding:'14px', borderRadius:'14px', background:'linear-gradient(135deg,#D4A84F,#E8C06A,#A07830)', color:C.carbon, fontWeight:700, fontSize:'15px', border:'none', cursor:'pointer', boxShadow:goldBox, opacity:pin.length!==6||loading?.5:1, fontFamily:"'DM Sans',sans-serif", transition:'all .15s' }}>
                {loading ? 'Verifying…' : 'Verify PIN'}
              </button>
              {attempts > 0 && <p style={{ color:'#ef4444', fontSize:'12px', marginTop:'10px' }}>{3-attempts} attempt(s) remaining</p>}
            </>
          ) : (
            <>
              <input type="text" maxLength={6} placeholder="000000" value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g,''))} autoFocus
                style={{ width:'100%', textAlign:'center', fontSize:'30px', fontWeight:700, letterSpacing:'.4em', background:C.g, border:'1px solid rgba(212,168,79,0.1)', color:C.silver, borderRadius:'14px', padding:'16px 8px', marginBottom:'16px', fontFamily:"'DM Sans',sans-serif", outline:'none', boxShadow:inset }} />
              <button onClick={submit2FA} disabled={code.length!==6||loading}
                style={{ width:'100%', padding:'14px', borderRadius:'14px', background:'linear-gradient(135deg,#D4A84F,#E8C06A,#A07830)', color:C.carbon, fontWeight:700, fontSize:'15px', border:'none', cursor:'pointer', boxShadow:goldBox, opacity:code.length!==6||loading?.5:1, fontFamily:"'DM Sans',sans-serif" }}>
                {loading ? 'Verifying…' : 'Verify Code'}
              </button>
              <button onClick={() => { setStep('pin'); setPin(''); setCode('') }}
                style={{ width:'100%', marginTop:'10px', padding:'8px', background:'transparent', border:'none', color:C.smoke, fontSize:'12px', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight:300 }}>
                ← Back to PIN
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
