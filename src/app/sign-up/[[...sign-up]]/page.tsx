import { SignUp } from '@clerk/nextjs'
import Image from 'next/image'

export default function SignUpPage() {
  return (
    <main style={{ minHeight:'100vh', background:'#1a1a24', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ marginBottom:'36px', textAlign:'center' }}>
        <Image src="/logo.png" alt="Vynk" width={120} height={38} style={{ objectFit:'contain' }} />
        <p style={{ color:'#6a6a8a', fontSize:'14px', marginTop:'12px' }}>Create your digital identity</p>
      </div>
      <div style={{ background:'#1a1a24', boxShadow:'12px 12px 32px #0d0d14, -7px -7px 20px #27273a', borderRadius:'28px', border:'1px solid rgba(255,255,255,0.04)', overflow:'hidden' }}>
        <SignUp
          appearance={{
            variables: {
              colorPrimary: '#d4a843',
              colorBackground: '#1a1a24',
              colorText: '#e8e8f0',
              colorTextSecondary: '#6a6a8a',
              colorInputBackground: '#1a1a24',
              colorInputText: '#e8e8f0',
              borderRadius: '12px',
              fontFamily: "'DM Sans', sans-serif",
            },
            elements: {
              card: { background:'transparent', boxShadow:'none', border:'none' },
              formButtonPrimary: { background:'linear-gradient(135deg,#d4a843,#e8c96a,#a07830)', color:'#0d0d14', fontWeight:700, boxShadow:'3px 3px 10px #0d0d14, 0 0 16px rgba(212,168,67,0.2)', borderRadius:'12px', border:'none' },
              formFieldInput: { background:'#1a1a24', boxShadow:'inset 3px 3px 8px #0d0d14, inset -2px -2px 6px #27273a', border:'1px solid rgba(255,255,255,0.04)', color:'#e8e8f0', borderRadius:'10px' },
              footerActionLink: { color:'#d4a843' },
              dividerLine: { background:'rgba(255,255,255,0.06)' },
              dividerText: { color:'#6a6a8a' },
              socialButtonsBlockButton: { background:'#1a1a24', boxShadow:'4px 4px 10px #0d0d14, -2px -2px 7px #27273a', border:'1px solid rgba(255,255,255,0.04)', color:'#e8e8f0', borderRadius:'10px' },
            },
          }}
        />
      </div>
    </main>
  )
}
