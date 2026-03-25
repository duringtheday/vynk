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
  const [step, setStep]           = useState<'pin'|'2fa'>('pin')
  const [pin, setPin]             = useState('')
  const [code, setCode]           = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [remaining, setRemaining] = useState<number|null>(null)
  const codeRef = useRef<HTMLInputElement>(null)

  useEffect(()=>{ if(step==='2fa') setTimeout(()=>codeRef.current?.focus(),200) },[step])

  function addDigit(d:string) { if(pin.length>=6) return; setPin(p=>p+d); setError('') }
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
    // overflow-y:auto para que en móviles pequeños se pueda scrollear
    <div style={{
      minHeight:'100dvh', background:C.g,
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'flex-start',
      padding:'20px 16px 32px',
      fontFamily:"'DM Sans',sans-serif",
      overflowY:'auto',
      boxSizing:'border-box',
    }}>

      {/* Logo — compacto */}
      <div style={{
        marginTop:'clamp(12px,4vh,32px)',
        marginBottom:'clamp(12px,3vh,24px)',
        padding:'12px 20px',
        background:C.g, boxShadow:raised,
        borderRadius:'16px',
        border:'1px solid rgba(212,168,79,0.07)',
        display:'inline-flex', alignItems:'center', justifyContent:'center',
      }}>
        <img src="/logo.png" alt="Vynk" style={{height:'28px', width:'auto', display:'block'}}/>
      </div>

      {/* Main card — tamaño controlado */}
      <div style={{
        width:'100%', maxWidth:'360px',
        background:C.g,
        boxShadow:`10px 10px 30px ${C.nd}, -6px -6px 20px ${C.nl}`,
        borderRadius:'24px',
        padding:'clamp(20px,4vw,28px) clamp(16px,5vw,28px)',
        border:'1px solid rgba(255,255,255,0.03)',
      }}>

        {step==='pin' ? (
          <>
            <div style={{textAlign:'center',marginBottom:'4px'}}>
              <div style={{
                width:'52px', height:'52px', borderRadius:'50%',
                background:C.g, boxShadow:raised,
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                fontSize:'24px', marginBottom:'12px',
              }}>🔐</div>
              <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'20px',color:C.gold,marginBottom:'4px'}}>Owner Vault</h1>
              <p style={{fontSize:'12px',color:C.smoke}}>Enter your 6-digit PIN</p>
            </div>

            {/* Step dots */}
            <div style={{display:'flex',gap:'6px',justifyContent:'center',margin:'14px 0'}}>
              <div style={{width:'28px',height:'3px',borderRadius:'2px',background:C.gold,boxShadow:`0 0 8px ${C.gold}60`}}/>
              <div style={{width:'10px',height:'3px',borderRadius:'2px',background:'rgba(255,255,255,0.1)'}}/>
              <div style={{width:'10px',height:'3px',borderRadius:'2px',background:'rgba(255,255,255,0.1)'}}/>
            </div>

            {/* PIN boxes */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:'6px',marginBottom:'16px'}}>
              {Array.from({length:6}).map((_,i)=>(
                <div key={i} style={{
                  height:'44px', borderRadius:'10px',
                  background:C.g,
                  boxShadow: i<pin.length ? insetSm : raised,
                  border:`1px solid ${i<pin.length?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.025)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all .15s',
                }}>
                  {i<pin.length&&<div style={{width:'8px',height:'8px',borderRadius:'50%',background:C.gold,boxShadow:`0 0 6px ${C.gold}`}}/>}
                </div>
              ))}
            </div>

            {/* Numpad — teclas más compactas */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginBottom:'14px'}}>
              {KEYS.map((k,i)=>(
                k==='' ? <div key={i}/> :
                <button key={i}
                  onClick={()=> k==='⌫' ? delDigit() : addDigit(k)}
                  disabled={loading}
                  style={{
                    padding:'14px 8px', borderRadius:'12px',
                    background:C.g, boxShadow:raised,
                    border:'1px solid rgba(255,255,255,0.025)',
                    color:k==='⌫'?C.smoke:C.silver,
                    fontSize:k==='⌫'?'16px':'20px',
                    fontWeight:600, cursor:'pointer',
                    fontFamily:"'DM Sans',sans-serif",
                    transition:'all .1s', outline:'none',
                  }}
                  onMouseDown={e=>{e.currentTarget.style.boxShadow=insetSm;e.currentTarget.style.transform='scale(0.96)'}}
                  onMouseUp={e=>{e.currentTarget.style.boxShadow=raised;e.currentTarget.style.transform='scale(1)'}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow=raised;e.currentTarget.style.transform='scale(1)'}}
                >{k}</button>
              ))}
            </div>

            {/* Verify button */}
            <button onClick={verifyPin} disabled={loading||pin.length!==6}
              style={{
                width:'100%', padding:'14px',
                background:pin.length===6?`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`:C.g,
                color:pin.length===6?C.carbon:C.smoke,
                borderRadius:'12px', fontWeight:700, fontSize:'14px',
                border:'none', cursor:pin.length===6?'pointer':'default',
                boxShadow:pin.length===6?goldBox:raisedSm,
                fontFamily:"'DM Sans',sans-serif", transition:'all .2s',
                opacity:loading?.7:1,
              }}>
              {loading?'Verifying…':'Verify PIN'}
            </button>

            {error&&(
              <div style={{marginTop:'10px',padding:'9px 12px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',fontSize:'12px',color:'#ef4444',textAlign:'center'}}>
                {error}{remaining!==null&&remaining>0?` · ${remaining} attempt(s) left`:''}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{textAlign:'center',marginBottom:'20px'}}>
              <div style={{width:'52px',height:'52px',borderRadius:'50%',background:C.g,boxShadow:raised,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:'24px',marginBottom:'12px'}}>✉️</div>
              <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'20px',color:C.gold,marginBottom:'4px'}}>Check your email</h1>
              <p style={{fontSize:'12px',color:C.smoke}}>Enter the 6-digit code sent to your inbox</p>
            </div>

            <input ref={codeRef}
              value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))}
              placeholder="000000" maxLength={6}
              onKeyDown={e=>e.key==='Enter'&&verify2FA()}
              style={{width:'100%',padding:'14px',background:C.g,boxShadow:insetSm,border:'1px solid rgba(255,255,255,0.04)',borderRadius:'12px',color:C.silver,fontSize:'24px',fontWeight:700,textAlign:'center',letterSpacing:'8px',outline:'none',fontFamily:'monospace',marginBottom:'14px',boxSizing:'border-box'}}/>

            <button onClick={verify2FA} disabled={loading||code.length!==6}
              style={{width:'100%',padding:'14px',background:code.length===6?`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`:C.g,color:code.length===6?C.carbon:C.smoke,borderRadius:'12px',fontWeight:700,fontSize:'14px',border:'none',cursor:code.length===6?'pointer':'default',boxShadow:code.length===6?goldBox:raisedSm,fontFamily:"'DM Sans',sans-serif",opacity:loading?.7:1}}>
              {loading?'Verifying…':'Enter Vault'}
            </button>

            {error&&(
              <div style={{marginTop:'10px',padding:'9px 12px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',fontSize:'12px',color:'#ef4444',textAlign:'center'}}>{error}</div>
            )}

            <button onClick={()=>{setStep('pin');setPin('');setCode('');setError('')}}
              style={{width:'100%',marginTop:'10px',padding:'10px',background:'transparent',border:'none',color:C.smoke,fontSize:'12px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
              ← Back to PIN
            </button>
          </>
        )}
      </div>
    </div>
  )
}
