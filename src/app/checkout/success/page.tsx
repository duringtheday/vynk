'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const C = { g:'#0D0F12', gold:'#D4A84F', goldLt:'#E8C06A', goldDk:'#A07830', silver:'#BFC3C9', smoke:'#6F737A', nd:'#08090B', nl:'#141720' }
const raised = `5px 5px 14px ${C.nd}, -3px -3px 10px ${C.nl}`
const goldBox = `4px 4px 14px ${C.nd}, 0 0 22px rgba(212,168,79,0.2)`

function SuccessContent() {
  const params = useSearchParams()
  const slug   = params.get('slug')
  const [ready, setReady] = useState(false)
  const [dots, setDots]   = useState('.')

  useEffect(()=>{
    const d = setInterval(()=>setDots(p=>p.length>=3?'.':p+'.'),500)
    const t = setTimeout(()=>{setReady(true);clearInterval(d)},3000)
    return()=>{clearInterval(d);clearTimeout(t)}
  },[])

  return (
    <div style={{minHeight:'100dvh',background:C.g,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{maxWidth:'420px',width:'100%',display:'flex',flexDirection:'column',gap:'20px',alignItems:'center',textAlign:'center'}}>
        <div style={{padding:'14px 22px',background:C.g,boxShadow:raised,borderRadius:'16px',border:'1px solid rgba(212,168,79,0.07)'}}>
          <img src="/logo.png" alt="Vynk" style={{width:'100%',height:'auto',maxWidth:'90px',display:'block'}}/>
        </div>
        <div style={{background:C.g,boxShadow:raised,borderRadius:'24px',padding:'36px',border:'1px solid rgba(255,255,255,0.03)',width:'100%'}}>
          {!ready?(
            <>
              <div style={{fontSize:'40px',marginBottom:'16px'}}>⚡</div>
              <h1 style={{fontSize:'20px',fontWeight:700,color:C.silver,fontFamily:"'Syne',sans-serif",marginBottom:'8px'}}>Publishing{dots}</h1>
              <p style={{fontSize:'13px',color:C.smoke,lineHeight:1.7}}>Payment confirmed. Setting up your digital identity.</p>
            </>
          ):(
            <>
              <div style={{fontSize:'40px',marginBottom:'16px'}}>✨</div>
              <h1 style={{fontSize:'22px',fontWeight:800,color:C.gold,fontFamily:"'Syne',sans-serif",marginBottom:'8px'}}>Your card is live!</h1>
              <p style={{fontSize:'13px',color:C.smoke,lineHeight:1.7,marginBottom:'24px'}}>Share it everywhere. Every tap is a smart introduction.</p>
              {slug&&(
                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                  <Link href={`/c/${slug}`} style={{padding:'14px',background:`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`,color:C.nd,borderRadius:'14px',fontWeight:700,fontSize:'14px',textDecoration:'none',display:'block',boxShadow:goldBox}}>
                    View my card →
                  </Link>
                  <Link href="/builder" style={{padding:'12px',background:C.g,boxShadow:raised,color:C.smoke,borderRadius:'12px',fontSize:'13px',textDecoration:'none',display:'block',border:'1px solid rgba(255,255,255,0.03)'}}>
                    Edit card
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
        <p style={{fontSize:'11px',color:C.smoke,opacity:.5}}>Powered by <span style={{color:C.gold,fontWeight:700}}>Vynk</span></p>
      </div>
    </div>
  )
}

export default function CheckoutSuccess() {
  return <Suspense><SuccessContent/></Suspense>
}
