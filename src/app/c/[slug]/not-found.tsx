export default function CardNotFound() {
  return (
    <main style={{ minHeight:'100vh', background:'#1a1a24', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', textAlign:'center', fontFamily:"'DM Sans',sans-serif", color:'#e8e8f0' }}>
      <img src="/logo.png" alt="Vynk" style={{ height:'32px', objectFit:'contain', marginBottom:'32px', opacity:.7 }} />
      <div style={{ width:'80px', height:'80px', background:'#1a1a24', boxShadow:'6px 6px 16px #0d0d14, -4px -4px 10px #27273a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'34px', margin:'0 auto 24px' }}>🔍</div>
      <h1 style={{ fontSize:'22px', fontWeight:700, marginBottom:'8px' }}>Card not found</h1>
      <p style={{ color:'#6a6a8a', fontSize:'14px', marginBottom:'28px', maxWidth:'280px', lineHeight:1.6 }}>This card may have been archived or the link has changed.</p>
      <a href="/" style={{ background:'linear-gradient(135deg,#d4a843,#e8c96a,#a07830)', color:'#0a0a0a', padding:'13px 28px', borderRadius:'14px', textDecoration:'none', fontWeight:700, fontSize:'14px', boxShadow:'4px 4px 14px #0d0d14, 0 0 20px rgba(212,168,67,0.2)' }}>
        Create your own Vynk card →
      </a>
    </main>
  )
}
