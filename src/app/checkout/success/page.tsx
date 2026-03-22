import Image from 'next/image'
import Link from 'next/link'

interface Props { searchParams: Promise<{ slug?: string }> }

export default async function SuccessPage({ searchParams }: Props) {
  const { slug } = await searchParams
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vynk.app'
  const cardUrl = slug ? `/c/${slug}` : '/'
  const NM = { bg:'#1a1a24', dark:'#0d0d14', lite:'#27273a', gold:'#d4a843' }

  return (
    <main style={{ minHeight:'100vh', background:NM.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', textAlign:'center', fontFamily:"'DM Sans',sans-serif", color:'#e8e8f0' }}>
      <Image src="/logo.png" alt="Vynk" width={100} height={32} style={{ objectFit:'contain', marginBottom:'36px', opacity:.85 }} />

      {/* Success icon */}
      <div style={{ width:'88px', height:'88px', background:NM.bg, boxShadow:`8px 8px 20px ${NM.dark}, -5px -5px 14px ${NM.lite}`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px', margin:'0 auto 24px' }}>
        🎉
      </div>

      <h1 style={{ fontSize:'30px', fontWeight:700, marginBottom:'10px' }}>Your card is live!</h1>
      <p style={{ color:'#6a6a8a', marginBottom:'16px', fontSize:'15px' }}>Share this link — anyone can save your contact instantly:</p>

      {/* URL display — neumorphic inset */}
      <div style={{ background:NM.bg, boxShadow:`inset 4px 4px 10px ${NM.dark}, inset -3px -3px 8px ${NM.lite}`, borderRadius:'16px', padding:'16px 24px', marginBottom:'32px', fontFamily:'monospace', color:NM.gold, fontWeight:700, fontSize:'16px', wordBreak:'break-all', maxWidth:'400px', width:'100%', border:'1px solid rgba(212,168,67,0.1)' }}>
        {appUrl}{cardUrl}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'12px', width:'100%', maxWidth:'360px' }}>
        <Link href={cardUrl} style={{ textDecoration:'none', display:'block', padding:'16px', background:'linear-gradient(135deg,#d4a843,#e8c96a,#a07830)', color:'#0d0d14', fontWeight:700, fontSize:'15px', borderRadius:'16px', textAlign:'center', boxShadow:`5px 5px 14px ${NM.dark}, 0 0 24px rgba(212,168,67,0.22)` }}>
          View my Vynk card →
        </Link>
        <Link href="/builder" style={{ textDecoration:'none', display:'block', padding:'14px', background:NM.bg, boxShadow:`4px 4px 10px ${NM.dark}, -2px -2px 7px ${NM.lite}`, color:'#6a6a8a', fontSize:'14px', borderRadius:'14px', textAlign:'center', border:'1px solid rgba(255,255,255,0.04)' }}>
          Back to builder
        </Link>
      </div>
      <p style={{ fontSize:'12px', color:'#3a3a52', marginTop:'24px' }}>Receipt sent to your email via Stripe.</p>
    </main>
  )
}
