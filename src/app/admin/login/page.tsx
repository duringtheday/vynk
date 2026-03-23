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

      {/* Logo — mismo contenedor neumórfico que el resto de la app */}
      <div style={{marginBottom:'28px',padding:'18px 28px',background:C.g,boxShadow:raised,borderRadius:'20px',border:'1px solid rgba(212,168,79,0.07)',display:'inline-flex',alignItems:'center',justifyContent:'center'}}>
        <img src="/logo.png" alt="Vynk" style={{width:'100%',height:'auto',maxWidth:'120px',display:'block'}}/>
      </div>

      {/* Step indicator */}
      <div style={{display:'flex',gap:'8px',marginBottom:'24px'}}>
        {['pin','2fa'].map((s,i)=>(
          <div key={s} style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'28px',height:'28px',borderRadius:'50%',background:step===s?`linear-gradient(135deg,${C.gold},${C.goldLt})`:C.g,boxShadow:step===s?goldBox:insetSm,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,color:step===s?C.carbon:C.smoke,transition:'all .3s'}}>
              {i+1}
            </div>
            {i===0&&<div style={{width:'32px',height:'1px',background:step==='2fa'?`rgba(212,168,79,0.4)`:'rgba(255,255,255,0.06)'}}/>}
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{width:'100%',maxWidth:'360px',background:C.g,boxShadow:`10px 10px 28px ${C.nd}, -6px -6px 18px ${C.nl}`,borderRadius:'28px',padding:'32px',border:'1px solid rgba(255,255,255,0.03)'}}>

        {step==='pin' ? (
          <>
            <div style={{textAlign:'center',marginBottom:'24px'}}>
              <div style={{fontSize:'32px',marginBottom:'10px'}}>🔐</div>
              <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'20px',color:C.silver,marginBottom:'4px'}}>Owner Vault</h1>
              <p style={{fontSize:'12px',color:C.smoke}}>Enter your 6-digit PIN</p>
            </div>

            {/* PIN dots */}
            <div style={{display:'flex',gap:'10px',justifyContent:'center',marginBottom:'20px'}}>
              {Array.from({length:6}).map((_,i)=>(
                <div key={i} style={{
                  width:'14px', height:'14px', borderRadius:'50%',
                  background: i<pin.length ? C.gold : 'transparent',
                  boxShadow: i<pin.length ? `0 0 10px ${C.gold}60` : insetSm,
                  border: i<pin.length ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  transition:'all .15s',
                }}/>
              ))}
            </div>

            {/* Numpad */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px',marginBottom:'16px'}}>
              {KEYS.map((k,i)=>(
                k==='' ? <div key={i}/> :
                <button key={i}
                  onClick={()=> k==='⌫' ? delDigit() : addDigit(k)}
                  disabled={loading}
                  style={{padding:'16px 8px',borderRadius:'14px',background:C.g,boxShadow:raised,border:'1px solid rgba(255,255,255,0.025)',color:k==='⌫'?C.smoke:C.silver,fontSize:k==='⌫'?'18px':'20px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'box-shadow .1s',outline:'none'}}
                  onMouseDown={e=>{e.currentTarget.style.boxShadow=insetSm;e.currentTarget.style.transform='scale(0.96)'}}
                  onMouseUp={e=>{e.currentTarget.style.boxShadow=raised;e.currentTarget.style.transform='scale(1)'}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow=raised;e.currentTarget.style.transform='scale(1)'}}
                >
                  {k}
                </button>
              ))}
            </div>

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
            <div style={{textAlign:'center',marginBottom:'24px'}}>
              <div style={{fontSize:'32px',marginBottom:'10px'}}>✉️</div>
              <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'20px',color:C.silver,marginBottom:'4px'}}>Check your email</h1>
              <p style={{fontSize:'12px',color:C.smoke}}>Enter the 6-digit code sent to your inbox</p>
            </div>

            <input ref={codeRef}
              value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))}
              placeholder="000000" maxLength={6}
              onKeyDown={e=>e.key==='Enter'&&verify2FA()}
              style={{width:'100%',padding:'16px',background:C.g,boxShadow:insetSm,border:'1px solid rgba(255,255,255,0.04)',borderRadius:'14px',color:C.silver,fontSize:'24px',fontWeight:700,textAlign:'center',letterSpacing:'10px',outline:'none',fontFamily:'monospace',marginBottom:'16px'}}/>

            <button onClick={verify2FA} disabled={loading||code.length!==6}
              style={{width:'100%',padding:'14px',background:code.length===6?`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`:C.g,color:code.length===6?C.carbon:C.smoke,borderRadius:'14px',fontWeight:700,fontSize:'14px',border:'none',cursor:code.length===6?'pointer':'default',boxShadow:code.length===6?goldBox:raisedSm,fontFamily:"'DM Sans',sans-serif",opacity:loading?.7:1}}>
              {loading?'Verifying…':'Enter Vault'}
            </button>

            {error&&(
              <div style={{marginTop:'12px',padding:'10px 14px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',fontSize:'12px',color:'#ef4444',textAlign:'center'}}>{error}</div>
            )}

            <button onClick={()=>{setStep('pin');setPin('');setCode('');setError('')}}
              style={{width:'100%',marginTop:'12px',padding:'10px',background:'transparent',border:'none',color:C.smoke,fontSize:'12px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
              ← Back to PIN
            </button>
          </>
        )}
      </div>
    </div>
  )
}
