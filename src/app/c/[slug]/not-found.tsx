export default function CardNotFound() {
  return (
    <main style={{ minHeight:'100dvh', background:'#0D0F12', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', textAlign:'center', fontFamily:"'DM Sans',sans-serif", color:'#BFC3C9' }}>
      <img src="/logo.png" alt="Vynk" style={{ height:'32px', objectFit:'contain', marginBottom:'36px', opacity:.6 }} />
      <div style={{ width:'80px', height:'80px', background:'#0D0F12', boxShadow:'6px 6px 16px #08090B, -4px -4px 10px #141720', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'34px', margin:'0 auto 24px' }}>🔍</div>
      <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'24px', fontWeight:800, marginBottom:'10px' }}>Card not found</h1>
      <p style={{ color:'#6F737A', fontSize:'14px', marginBottom:'32px', maxWidth:'280px', lineHeight:1.7, fontWeight:300 }}>This card may have been archived or the link has changed.</p>
      <a href="/" style={{ background:'linear-gradient(135deg,#D4A84F,#E8C06A,#A07830)', color:'#050607', padding:'13px 32px', borderRadius:'14px', textDecoration:'none', fontWeight:700, fontSize:'14px', boxShadow:'4px 4px 14px #08090B, 0 0 20px rgba(212,168,79,0.2)' }}>
        Create your own Vynk card →
      </a>
    </main>
  )
}
