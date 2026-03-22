import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'

export default function SignInPage() {
  return (
    <main style={{ minHeight:'100dvh', background:'#0D0F12', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ marginBottom:'40px', textAlign:'center' }}>
        <Image src="/logo.png" alt="Vynk" width={120} height={38} style={{ objectFit:'contain' }} />
        <p style={{ color:'#6F737A', fontSize:'14px', marginTop:'10px', fontWeight:300 }}>Make every introduction smart</p>
      </div>
      <div style={{ background:'#0D0F12', boxShadow:'12px 12px 32px #08090B, -7px -7px 20px #141720', borderRadius:'28px', border:'1px solid rgba(212,168,79,0.06)', overflow:'hidden' }}>
        <SignIn appearance={{
          variables: {
            colorPrimary:'#D4A84F', colorBackground:'#0D0F12',
            colorText:'#BFC3C9', colorTextSecondary:'#6F737A',
            colorInputBackground:'#0D0F12', colorInputText:'#BFC3C9',
            borderRadius:'12px', fontFamily:"'DM Sans', sans-serif",
          },
          elements: {
            card: { background:'transparent', boxShadow:'none', border:'none' },
            formButtonPrimary: { background:'linear-gradient(135deg,#D4A84F,#E8C06A,#A07830)', color:'#050607', fontWeight:700, boxShadow:'3px 3px 10px #08090B, 0 0 16px rgba(212,168,79,0.2)', borderRadius:'12px', border:'none' },
            formFieldInput: { background:'#0D0F12', boxShadow:'inset 3px 3px 8px #08090B, inset -2px -2px 6px #141720', border:'1px solid rgba(255,255,255,0.04)', color:'#BFC3C9', borderRadius:'10px' },
            footerActionLink: { color:'#D4A84F' },
            dividerLine: { background:'rgba(255,255,255,0.05)' },
            dividerText: { color:'#6F737A' },
            socialButtonsBlockButton: { background:'#0D0F12', boxShadow:'4px 4px 10px #08090B, -2px -2px 7px #141720', border:'1px solid rgba(255,255,255,0.04)', color:'#BFC3C9', borderRadius:'10px' },
            socialButtonsBlockButtonText: { color:'#BFC3C9' },
          },
        }} />
      </div>
    </main>
  )
}
