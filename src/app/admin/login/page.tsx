'use client'
import { useState, useRef, useEffect } from 'react'
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

export default function AdminLogin() {
  const router = useRouter()
  const [step, setStep]       = useState<'pin'|'2fa'>('pin')
  const [pin, setPin]         = useState('')
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [remaining, setRemaining] = useState<number|null>(null)
  const codeRef = useRef<HTMLInputElement>(null)

  useEffect(()=>{ if(step==='2fa') setTimeout(()=>codeRef.current?.focus(),200) },[step])

  function addDigit(d:string) {
    if(pin.length>=6) return
    setPin(p=>p+d); setError('')
  }
  function delDigit() { setPin(p=>p.slice(0,-1)); setError('') }

  async function verifyPin() {
    if(pin.length!==6) return
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/admin/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin})})
      const data = await res.json()
      if(res.ok && data.step==='2fa') { setStep('2fa'); toast.success('Code sent to your email') }
      else if(res.ok && data.ok)      { router.push('/admin') }
      else { setError(data.error||'Wrong PIN'); setRemaining(data.remaining??null); setPin('') }
    } catch { setError('Network error') }
    setLoading(false)
  }

  async function verify2FA() {
    if(code.length!==6) return
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/admin/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})})
      const data = await res.json()
      if(res.ok && data.ok) { router.push('/admin') }
      else { setError(data.error||'Invalid code'); setCode('') }
    } catch { setError('Network error') }
    setLoading(false)
  }

  useEffect(()=>{ if(pin.length===6 && step==='pin') verifyPin() },[pin])

  const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  return (
    <div style={{minHeight:'100dvh',background:C.g,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',fontFamily:"'DM Sans',sans-serif"}}>

      {/* Logo */}
      <div style={{marginBottom:'32px',padding:'16px 28px',background:C.g,boxShadow:raised,borderRadius:'20px',border:'1px solid rgba(212,168,79,0.07)'}}>
        <img src="/logo.png" alt="Vynk" style={{width:'100%',height:'auto',maxWidth:'110px',display:'block'}}/>
      </div>

      {/* Card */}
      <div style={{width:'100%',maxWidth:'340px',background:C.g,boxShadow:`10px 10px 28px ${C.nd}, -6px -6px 18px ${C.nl}`,borderRadius:'28px',padding:'36px',border:'1px solid rgba(255,255,255,0.03)'}}>

        {step==='pin' ? (
          <>
            {/* Icon */}
            <div style={{textAlign:'center',marginBottom:'20px'}}>
              <div style={{width:'56px',height:'56px',borderRadius:'16px',background:C.g,boxShadow:raised,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:'26px',marginBottom:'14px'}}>
                🔐
              </div>
              <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'20px',color:C.silver,marginBottom:'4px'}}>Owner Vault</h1>
              <p style={{fontSize:'12px',color:C.smoke}}>Enter your 6-digit PIN</p>
            </div>

            {/* PIN dots */}
            <div style={{display:'flex',gap:'8px',justifyContent:'center',marginBottom:'24px'}}>
              {Array.from({length:6}).map((_,i)=>(
                <div key={i} style={{
                  width:'12px', height:'12px', borderRadius:'50%',
                  background: i<pin.length ? C.gold : 'transparent',
                  boxShadow: i<pin.length ? `0 0 8px ${C.gold}` : insetSm,
                  border: i<pin.length ? 'none' : `1px solid rgba(255,255,255,0.06)`,
                  transition:'all .15s',
                }}/>
              ))}
            </div>

            {/* PIN display */}
            <div style={{background:C.g,boxShadow:insetSm,borderRadius:'12px',padding:'10px',textAlign:'center',marginBottom:'20px',letterSpacing:'8px',fontSize:'18px',color:C.smoke,height:'44px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {pin ? '•'.repeat(pin.length) : <span style={{fontSize:'12px',letterSpacing:'normal',opacity:.3}}>enter PIN</span>}
            </div>

            {/* Numpad */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px',marginBottom:'16px'}}>
              {KEYS.map((k,i)=>(
                k==='' ? <div key={i}/> :
                <button key={i}
                  onClick={()=> k==='⌫' ? delDigit() : addDigit(k)}
                  disabled={loading}
                  style={{
                    padding:'16px 8px', borderRadius:'14px',
                    background:C.g,
                    boxShadow: k==='⌫' ? `2px 2px 6px ${C.nd}, -1px -1px 4px ${C.nl}` : raised,
                    border:'1px solid rgba(255,255,255,0.03)',
                    color: k==='⌫' ? C.smoke : C.silver,
                    fontSize: k==='⌫' ? '18px' : '20px',
                    fontWeight:600, cursor:'pointer',
                    fontFamily:"'DM Sans',sans-serif",
                    transition:'all .1s',
                    outline:'none',
                  }}
                  onMouseDown={e=>{
                    const el = e.currentTarget
                    el.style.boxShadow = insetSm
                    el.style.transform = 'scale(0.97)'
                  }}
                  onMouseUp={e=>{
                    const el = e.currentTarget
                    el.style.boxShadow = raised
                    el.style.transform = 'scale(1)'
                  }}
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Verify button */}
            <button onClick={verifyPin} disabled={loading||pin.length!==6}
              style={{width:'100%',padding:'14px',background:pin.length===6?`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`:C.g,color:pin.length===6?C.carbon:C.smoke,borderRadius:'14px',fontWeight:700,fontSize:'14px',border:'none',cursor:pin.length===6?'pointer':'default',boxShadow:pin.length===6?goldBox:raisedSm,fontFamily:"'DM Sans',sans-serif",transition:'all .2s',opacity:loading?.7:1}}>
              {loading?'Verifying…':'Verify PIN'}
            </button>

            {error&&(
              <div style={{marginTop:'12px',padding:'10px 14px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',fontSize:'12px',color:'#ef4444',textAlign:'center'}}>
                {error}{remaining!==null&&remaining>0?` · ${remaining} attempt(s) left`:''}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{textAlign:'center',marginBottom:'20px'}}>
              <div style={{width:'56px',height:'56px',borderRadius:'16px',background:C.g,boxShadow:raised,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:'26px',marginBottom:'14px'}}>✉️</div>
              <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'20px',color:C.silver,marginBottom:'4px'}}>Check your email</h1>
              <p style={{fontSize:'12px',color:C.smoke}}>Enter the 6-digit code sent to your inbox</p>
            </div>

            <input ref={codeRef}
              value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))}
              placeholder="000000" maxLength={6}
              onKeyDown={e=>e.key==='Enter'&&verify2FA()}
              style={{width:'100%',padding:'14px',background:C.g,boxShadow:insetSm,border:'1px solid rgba(255,255,255,0.04)',borderRadius:'12px',color:C.silver,fontSize:'22px',fontWeight:700,textAlign:'center',letterSpacing:'8px',outline:'none',fontFamily:'monospace',marginBottom:'16px'}}/>

            <button onClick={verify2FA} disabled={loading||code.length!==6}
              style={{width:'100%',padding:'14px',background:code.length===6?`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`:C.g,color:code.length===6?C.carbon:C.smoke,borderRadius:'14px',fontWeight:700,fontSize:'14px',border:'none',cursor:code.length===6?'pointer':'default',boxShadow:code.length===6?goldBox:raisedSm,fontFamily:"'DM Sans',sans-serif",opacity:loading?.7:1}}>
              {loading?'Verifying…':'Enter Vault'}
            </button>

            {error&&(
              <div style={{marginTop:'12px',padding:'10px 14px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',fontSize:'12px',color:'#ef4444',textAlign:'center'}}>{error}</div>
            )}

            <button onClick={()=>{setStep('pin');setPin('');setCode('');setError('')}}
              style={{width:'100%',marginTop:'10px',padding:'10px',background:'transparent',border:'none',color:C.smoke,fontSize:'12px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
              ← Back to PIN
            </button>
          </>
        )}
      </div>

      <p style={{marginTop:'20px',fontSize:'11px',color:C.smoke,opacity:.4}}>
        Vynk Owner Dashboard · Secured
      </p>
    </div>
  )
}
