import Image from 'next/image'
import Link from 'next/link'

interface Props { searchParams: Promise<{ slug?: string }> }

export default async function SuccessPage({ searchParams }: Props) {
  const { slug } = await searchParams
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vynk.app'
  const cardUrl = slug ? `/c/${slug}` : '/'
  const C = { graphite:'#0D0F12', gold:'#D4A84F', silver:'#BFC3C9', smoke:'#6F737A', carbon:'#050607', nmDark:'#08090B', nmLite:'#141720' }
  const raised = `8px 8px 22px ${C.nmDark}, -5px -5px 14px ${C.nmLite}`
  const insetSm = `inset 2px 2px 6px ${C.nmDark}, inset -2px -2px 5px ${C.nmLite}`

  return (
    <main style={{ minHeight:'100dvh', background:C.graphite, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', textAlign:'center', fontFamily:"'DM Sans',sans-serif", color:C.silver }}>
      <Image src="/logo.png" alt="Vynk" width={100} height={32} style={{ objectFit:'contain', marginBottom:'40px', opacity:.8 }} />
      <div style={{ width:'88px', height:'88px', background:C.graphite, boxShadow:raised, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px', margin:'0 auto 28px' }}>🎉</div>
      <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'32px', fontWeight:800, marginBottom:'12px', color:C.silver }}>Your card is live!</h1>
      <p style={{ color:C.smoke, marginBottom:'20px', fontSize:'15px', fontWeight:300 }}>Share this link — anyone can save your contact instantly:</p>
      <div style={{ background:C.graphite, boxShadow:insetSm, borderRadius:'16px', padding:'16px 28px', marginBottom:'36px', fontFamily:'monospace', color:C.gold, fontWeight:700, fontSize:'15px', wordBreak:'break-all', maxWidth:'420px', width:'100%', border:'1px solid rgba(212,168,79,0.1)' }}>
        {appUrl}{cardUrl}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'12px', width:'100%', maxWidth:'360px' }}>
        <Link href={cardUrl} style={{ textDecoration:'none', display:'block', padding:'16px', background:'linear-gradient(135deg,#D4A84F,#E8C06A,#A07830)', color:C.carbon, fontWeight:700, fontSize:'15px', borderRadius:'16px', textAlign:'center', boxShadow:`4px 4px 14px ${C.nmDark}, 0 0 22px rgba(212,168,79,0.2)` }}>
          View my Vynk card →
        </Link>
        <Link href="/builder" style={{ textDecoration:'none', display:'block', padding:'14px', background:C.graphite, boxShadow:`4px 4px 10px ${C.nmDark}, -2px -2px 7px ${C.nmLite}`, color:C.smoke, fontSize:'14px', borderRadius:'14px', textAlign:'center', border:'1px solid rgba(255,255,255,0.04)' }}>
          Back to builder
        </Link>
      </div>
      <p style={{ fontSize:'12px', color:C.smoke, marginTop:'24px', opacity:.5 }}>Receipt sent to your email via Stripe.</p>
    </main>
  )
}
