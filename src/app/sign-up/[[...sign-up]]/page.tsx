import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <main style={{ minHeight:'100dvh', background:'#0D0F12', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', padding:'40px 20px 80px', fontFamily:"'DM Sans',sans-serif" }}>
      {/* Logo con contenedor neumórfico centrado */}
      <div style={{ padding:'20px 32px', background:'#0D0F12', boxShadow:'8px 8px 20px #08090B, -5px -5px 14px #141720, inset 0 1px 0 rgba(212,168,79,0.08)', borderRadius:'20px', border:'1px solid rgba(212,168,79,0.07)', marginBottom:'12px' }}>
        <img src="/logo.png" alt="Vynk" style={{ height:'40px', objectFit:'contain', display:'block' }} />
      </div>
      <p style={{ color:'#6F737A', fontSize:'13px', marginBottom:'28px', fontWeight:300 }}>Create your digital identity</p>
      <div style={{ width:'100%', maxWidth:'400px', background:'#0D0F12', boxShadow:'10px 10px 28px #08090B, -6px -6px 18px #141720', borderRadius:'24px', border:'1px solid rgba(212,168,79,0.06)', overflow:'hidden' }}>
        <SignUp appearance={{
          variables: { colorPrimary:'#D4A84F', colorBackground:'#0D0F12', colorText:'#BFC3C9', colorTextSecondary:'#6F737A', colorInputBackground:'#0D0F12', colorInputText:'#BFC3C9', borderRadius:'12px', fontFamily:"'DM Sans',sans-serif" },
          elements: {
            card: { background:'transparent', boxShadow:'none', border:'none', width:'100%' },
            rootBox: { width:'100%' },
            formButtonPrimary: { background:'linear-gradient(135deg,#D4A84F,#E8C06A,#A07830)', color:'#050607', fontWeight:700, boxShadow:'3px 3px 10px #08090B, 0 0 16px rgba(212,168,79,0.2)', borderRadius:'12px', border:'none' },
            formFieldInput: { background:'#0D0F12', boxShadow:'inset 3px 3px 8px #08090B, inset -2px -2px 6px #141720', border:'1px solid rgba(255,255,255,0.04)', color:'#BFC3C9', borderRadius:'10px' },
            footerActionLink: { color:'#D4A84F' },
            dividerLine: { background:'rgba(255,255,255,0.05)' },
            dividerText: { color:'#6F737A' },
            socialButtonsBlockButton: { background:'#0D0F12', boxShadow:'4px 4px 10px #08090B, -2px -2px 7px #141720', border:'1px solid rgba(255,255,255,0.04)', color:'#BFC3C9', borderRadius:'10px' },
          },
        }} />
      </div>
    </main>
  )
}
