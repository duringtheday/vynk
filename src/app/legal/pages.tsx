import Image from 'next/image'
import Link from 'next/link'

const C = { graphite:'#0D0F12', gold:'#D4A84F', silver:'#BFC3C9', smoke:'#6F737A', nmDark:'#08090B', nmLite:'#141720' }

function Layout({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <main style={{ minHeight:'100dvh', background:C.graphite, color:C.silver, fontFamily:"'DM Sans',sans-serif" }}>
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 48px', height:'68px', background:'rgba(13,15,18,0.9)', backdropFilter:'blur(20px)', borderBottom:`1px solid rgba(212,168,79,0.06)`, position:'sticky', top:0, zIndex:10 }}>
        <Link href="/"><Image src="/logo.png" alt="Vynk" width={90} height={29} style={{ objectFit:'contain' }} /></Link>
        <Link href="/" style={{ fontSize:'13px', color:C.smoke, textDecoration:'none', padding:'8px 16px', background:C.graphite, boxShadow:`3px 3px 8px ${C.nmDark}, -2px -2px 6px ${C.nmLite}`, borderRadius:'10px' }}>← Back</Link>
      </nav>
      <div style={{ maxWidth:'720px', margin:'0 auto', padding:'56px 48px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
          <div style={{ width:'28px', height:'1px', background:C.gold }} />
          <span style={{ fontSize:'10px', fontWeight:700, color:C.gold, letterSpacing:'.1em', textTransform:'uppercase' }}>Legal</span>
        </div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'36px', fontWeight:800, marginBottom:'8px', color:C.silver }}>{title}</h1>
        <p style={{ color:C.smoke, fontSize:'13px', marginBottom:'48px', fontWeight:300 }}>Last updated: March 2026</p>
        <div style={{ display:'flex', flexDirection:'column', gap:'20px', fontSize:'14px', lineHeight:'1.8', color:C.silver }}>{children}</div>
      </div>
    </main>
  )
}

const H = ({ children }: { children:React.ReactNode }) => (
  <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'17px', fontWeight:700, color:C.gold, marginTop:'8px' }}>{children}</h2>
)
const P = ({ children }: { children:React.ReactNode }) => (
  <p style={{ color:C.smoke, fontWeight:300 }}>{children}</p>
)

export function TermsPage() {
  return (
    <Layout title="Terms & Conditions">
      <P>By accessing or using Vynk, you agree to be bound by these Terms. If you disagree, do not use the service.</P>
      <H>1. Service description</H>
      <P>Vynk provides digital business card creation and hosting. Upon payment, you receive a hosted digital card at a unique URL with a QR code that allows others to save your contact to their phone.</P>
      <H>2. Pricing & payments</H>
      <P>Card creation: $20 one-time. Core identity updates (name, photo, phone, email, company): $10 per update, which archives the previous card permanently. Content updates (bio, services, socials, colors): free anytime. All payments processed securely by Stripe.</P>
      <H>3. No refund policy</H>
      <P>All sales are final. Once a card is published and the URL is active, no refunds will be issued. By completing payment, you acknowledge and accept this policy.</P>
      <H>4. Account & ownership</H>
      <P>Your card is tied to your account. You may access and manage it from any device using the same login. You must provide accurate information and may only have one active card per account.</P>
      <H>5. Anti-plagiarism & security</H>
      <P>Cards are cryptographically linked to the account that created them. Unauthorized transfers or duplication are prohibited. Contact legal@vynk.app if you believe your identity has been misused.</P>
      <H>6. Governing law</H>
      <P>These Terms are governed by applicable international digital commerce law. Contact: legal@vynk.app</P>
    </Layout>
  )
}

export function PrivacyPage() {
  return (
    <Layout title="Privacy Policy">
      <P>This policy explains how Vynk collects, uses, and protects your data, in compliance with GDPR (EU), CCPA (California), and LGPD (Brazil).</P>
      <H>1. Data we collect</H>
      <P>Account data: email, phone, or OAuth identifiers. Card data: exactly what you enter. Payment data: handled entirely by Stripe — we store only transaction IDs and amounts. Analytics: anonymous card view data.</P>
      <H>2. How we use your data</H>
      <P>To provide the service · Process payments · Send security codes · Display your card publicly · Generate anonymous analytics.</P>
      <H>3. Data sharing</H>
      <P>We do not sell your data. We share data only with: Stripe, Neon, Vercel, Clerk — all under strict data processing agreements.</P>
      <H>4. Your rights</H>
      <P>You have the right to access, correct, export, or delete your data at any time. Email privacy@vynk.app. We respond within 30 days.</P>
      <H>5. Security</H>
      <P>All data is encrypted in transit (TLS 1.3) and at rest. Admin access requires multi-factor authentication. Payments are PCI-DSS compliant via Stripe.</P>
    </Layout>
  )
}

export function RefundsPage() {
  return (
    <Layout title="Refund Policy">
      <P>Please read this policy carefully before purchasing. By completing payment you confirm you have read and accepted it.</P>
      <H>No refund policy</H>
      <P>Vynk operates a strict no-refund policy. Once payment is completed and a digital card is published, no refunds will be issued under any circumstances.</P>
      <H>Why no refunds?</H>
      <P>Digital products are delivered immediately upon payment. The URL and QR code are activated at the moment of purchase, constituting full delivery of the service.</P>
      <H>Exceptions</H>
      <P>Refunds are only considered for: duplicate payment · Technical failure preventing publication. Contact legal@vynk.app within 48 hours.</P>
      <H>Your acknowledgment</H>
      <P>By completing any payment on Vynk, you confirm that you have read, understood, and accepted this No Refund Policy.</P>
    </Layout>
  )
}
